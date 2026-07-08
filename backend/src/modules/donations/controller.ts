import { Response } from 'express';
import { donationService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

export class DonationController {
  getRecipientsByReligion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const religion = req.user?.religion as string;
    const recipients = await donationService.getRecipientsByReligion(religion);
    res.json({ success: true, data: recipients });
  });

  getAllRecipients = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const recipients = await donationService.getAllRecipients();
    res.json({ success: true, data: recipients });
  });

  getRecipientById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const recipient = await donationService.getRecipientById(id);
    
    if (!recipient) {
      res.status(404).json({ success: false, message: 'Donation recipient not found' });
      return;
    }
    
    res.json({ success: true, data: recipient });
  });

  createRecipient = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Only admins can create recipients
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, message: 'Only admins can create donation recipients' });
      return;
    }
    
    const recipient = await donationService.createRecipient(req.body);
    res.status(201).json({ success: true, data: recipient, message: 'Donation recipient created successfully' });
  });

  updateRecipient = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Only admins can update recipients
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, message: 'Only admins can update donation recipients' });
      return;
    }
    
    const id = req.params.id as string;
    const recipient = await donationService.updateRecipient(id, req.body);
    res.json({ success: true, data: recipient, message: 'Donation recipient updated successfully' });
  });

  deleteRecipient = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Only admins can delete recipients
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, message: 'Only admins can delete donation recipients' });
      return;
    }
    
    const id = req.params.id as string;
    await donationService.deleteRecipient(id);
    res.json({ success: true, message: 'Donation recipient deleted successfully' });
  });

  createDonation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const { recipientId, amount, transactionId } = req.body;
    
    if (!recipientId || !amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid donation data' });
      return;
    }
    
    const donation = await donationService.createDonation(userId, {
      recipientId,
      amount,
      transactionId
    });
    
    res.status(201).json({ success: true, data: donation, message: 'Donation recorded successfully' });
  });

  getUserDonations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const donations = await donationService.getUserDonations(userId);
    res.json({ success: true, data: donations });
  });

  getStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const stats = await donationService.getDonationStats();
    res.json({ success: true, data: stats });
  });

  getRecipientStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const recipientId = req.params.id as string;
    const stats = await donationService.getRecipientDonations(recipientId);
    res.json({ success: true, data: stats });
  });
}

export const donationController = new DonationController();
