import { Router } from 'express';
import { adminController } from './controller.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

// All admin routes require admin role
router.use(authMiddleware, requireRole(UserRole.ADMIN));

router.get('/stats', adminController.getStats);
router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.get('/leaders', adminController.getLeaders);
router.get('/vendors', adminController.getVendors);
router.get('/products', adminController.getProducts);
router.get('/teachings', adminController.getSermons);
router.get('/reports', adminController.getReports);
router.get('/verification-requests', adminController.getVerificationRequests);
router.get('/religions', adminController.getReligionCategories);
router.get('/settings', adminController.getSystemSettings);
router.get('/moderation/posts', adminController.getPostsForModeration);
router.put('/users/:userId', adminController.updateUser);
router.put('/users/:userId/role', adminController.updateUserRole);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);
router.put('/leaders/:leaderId', adminController.updateLeader);
router.put('/vendors/:vendorId', adminController.updateVendor);
router.put('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);
router.put('/posts/:postId/moderate', adminController.moderatePost);
router.delete('/posts/:postId', adminController.deletePost);
router.put('/teachings/:sermonId', adminController.updateSermon);
router.delete('/teachings/:sermonId', adminController.deleteSermon);
router.put('/reports/:reportId/review', adminController.reviewReport);
router.put('/verification-requests/:requestId/review', adminController.reviewVerificationRequest);
router.post('/religions', adminController.createReligionCategory);
router.put('/religions/:religionId', adminController.updateReligionCategory);
router.delete('/religions/:religionId', adminController.deleteReligionCategory);
router.put('/settings/:key', adminController.upsertSystemSetting);

export default router;
