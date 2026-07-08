import { UserRole } from '../../types/index.js';
import { Request, Response } from 'express';
import { userService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class UserController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  });
  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await userService.getUserById(id);
    
    if (!result) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.json({ success: true, data: result });
  });
  
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    
    // Only allow users to update their own profile (or admins)
    if (id !== userId && req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    
    const user = await userService.updateUser(id, req.body);
    res.json({ success: true, data: user, message: 'User updated' });
  });
  
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    
    if (id !== userId && req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    
    await userService.deleteUser(id);
    res.json({ success: true, message: 'User deleted' });
  });
}

export const userController = new UserController();
