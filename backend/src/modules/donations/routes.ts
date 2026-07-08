import { Router } from 'express';
import { donationController } from './controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

// Get donation recipients by user's religion
router.get('/recipients', authMiddleware, donationController.getRecipientsByReligion);

// Get all donation recipients (admin/unrestricted)
router.get('/recipients/all', authMiddleware, donationController.getAllRecipients);

// Get specific recipient
router.get('/recipients/:id', authMiddleware, donationController.getRecipientById);

// Admin: Create donation recipient
router.post('/recipients', authMiddleware, donationController.createRecipient);

// Admin: Update donation recipient
router.put('/recipients/:id', authMiddleware, donationController.updateRecipient);

// Admin: Delete donation recipient
router.delete('/recipients/:id', authMiddleware, donationController.deleteRecipient);

// Create a donation
router.post('/', authMiddleware, donationController.createDonation);

// Get user's donations
router.get('/my', authMiddleware, donationController.getUserDonations);

// Get donation stats
router.get('/stats', authMiddleware, donationController.getStats);

// Get recipient donation stats
router.get('/recipients/:id/stats', authMiddleware, donationController.getRecipientStats);

export default router;
