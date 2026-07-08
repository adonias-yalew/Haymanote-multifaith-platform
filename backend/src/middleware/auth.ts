import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JwtPayload, UserRole } from '../types/index.js';
import { getSupabase } from '../db/supabaseClient.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('account_status')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (error && !String(error.message).includes('account_status')) {
      res.status(401).json({ success: false, error: 'Unable to verify account status' });
      return;
    }

    if (!user && !error) {
      res.status(401).json({ success: false, error: 'Account is no longer available' });
      return;
    }

    if (user?.account_status === 'SUSPENDED') {
      res.status(403).json({ success: false, error: 'Account is suspended' });
      return;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: `Access denied. Required role: ${roles.join(' or ')}` 
      });
      return;
    }
    
    next();
  };
};

export const requireAuth = authMiddleware;

export const requireNonAnonymous = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  
  if (req.user.isAnonymous) {
    res.status(403).json({ 
      success: false, 
      error: 'Anonymous users cannot access this resource' 
    });
    return;
  }
  
  next();
};

export const requireVerifiedLeader = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  
  if (req.user.role !== UserRole.LEADER && req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ 
      success: false, 
      error: 'Only verified spiritual leaders can access this resource' 
    });
    return;
  }
  
  next();
};

export const requireVendor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  
  if (req.user.role !== UserRole.VENDOR && req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ 
      success: false, 
      error: 'Only vendors can access this resource' 
    });
    return;
  }
  
  next();
};
