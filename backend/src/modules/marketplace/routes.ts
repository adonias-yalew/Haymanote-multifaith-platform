import { Router } from 'express';
import { marketplaceController } from './controller.js';
import { authMiddleware, requireRole, requireVendor } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

// Product catalog (Public/Any auth user)
router.get('/products', authMiddleware, marketplaceController.getAllProducts);
router.get('/products/:id', authMiddleware, marketplaceController.getProductById);
router.get('/products/:id/related', authMiddleware, marketplaceController.getRelatedProducts);

// Vendor product management
router.get('/vendor/products', authMiddleware, requireVendor, marketplaceController.getMyProducts);
router.post('/products', authMiddleware, requireRole(UserRole.VENDOR), marketplaceController.createProduct);
router.put('/products/:id', authMiddleware, requireVendor, marketplaceController.updateProduct);
router.delete('/products/:id', authMiddleware, requireVendor, marketplaceController.deleteProduct);

// Reviews
router.get('/products/:productId/reviews', authMiddleware, marketplaceController.getProductReviews);
router.post('/reviews', authMiddleware, marketplaceController.createReview);

// Wishlist
router.get('/wishlist', authMiddleware, marketplaceController.getWishlist);
router.post('/wishlist', authMiddleware, marketplaceController.addToWishlist);
router.delete('/wishlist/:productId', authMiddleware, marketplaceController.removeFromWishlist);
router.get('/wishlist/:productId/check', authMiddleware, marketplaceController.checkWishlist);

// Orders (Buyers)
router.post('/orders', authMiddleware, requireRole(UserRole.USER, UserRole.ADMIN), marketplaceController.createOrder);
router.get('/buyer/orders', authMiddleware, marketplaceController.getBuyerOrders);

// Orders (Vendors)
router.get('/vendor/orders', authMiddleware, requireVendor, marketplaceController.getVendorOrders);
router.put('/orders/:id/status', authMiddleware, requireVendor, marketplaceController.updateOrderStatus);
router.get('/orders/:orderId/timeline', authMiddleware, marketplaceController.getOrderTimeline);

// Vendor Dashboard
router.get('/vendor/stats', authMiddleware, requireVendor, marketplaceController.getVendorDashboardStats);

export default router;
