import { Response } from 'express';
import { marketplaceService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

export class MarketplaceController {
  // ==================== PRODUCTS ====================

  getAllProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userReligion = req.user?.religion;
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const { category, search, sortBy, page, limit } = req.query as Record<string, string | undefined>;
    const result = await marketplaceService.getAllProducts(userReligion, isAdmin, {
      category, search, sortBy, page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
    });
    res.json({ success: true, ...result });
  });

  getMyProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const vendorId = req.user?.userId as string;
    const products = req.user?.role === UserRole.ADMIN
      ? await marketplaceService.getAllProducts()
      : await marketplaceService.getProductsByVendor(vendorId);
    res.json({ success: true, data: Array.isArray(products) ? products : products.products });
  });

  getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userReligion = req.user?.religion;
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const product = await marketplaceService.getProductById(id, userReligion, isAdmin);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  });

  getRelatedProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const product = await marketplaceService.getProductById(id);
    if (!product) {
      res.json({ success: true, data: [] });
      return;
    }
    const related = await marketplaceService.getRelatedProducts(id, product.category, product.religion);
    res.json({ success: true, data: related });
  });

  createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const vendorId = req.user?.userId as string;
    const userReligion = req.user?.religion as string;
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const product = await marketplaceService.createProduct(vendorId, userReligion, isAdmin, req.body);
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  });

  updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const vendorId = req.user?.userId as string;
    const product = await marketplaceService.updateProduct(id, vendorId, req.user?.role === UserRole.ADMIN, req.body);
    res.json({ success: true, data: product, message: 'Product updated successfully' });
  });

  deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const vendorId = req.user?.userId as string;
    await marketplaceService.deleteProduct(id, vendorId, req.user?.role === UserRole.ADMIN);
    res.json({ success: true, message: 'Product deleted successfully' });
  });

  // ==================== REVIEWS ====================

  getProductReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = req.params.productId as string;
    const reviews = await marketplaceService.getProductReviews(productId);
    res.json({ success: true, data: reviews });
  });

  createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { productId, rating, title, content } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
      return;
    }
    const review = await marketplaceService.createReview(productId, userId, rating, title, content);
    res.status(201).json({ success: true, data: review, message: 'Review submitted' });
  });

  // ==================== WISHLIST ====================

  getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const items = await marketplaceService.getWishlist(userId);
    res.json({ success: true, data: items });
  });

  addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { productId } = req.body;
    await marketplaceService.addToWishlist(userId, productId);
    res.json({ success: true, message: 'Added to wishlist' });
  });

  removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const productId = req.params.productId as string;
    await marketplaceService.removeFromWishlist(userId, productId);
    res.json({ success: true, message: 'Removed from wishlist' });
  });

  checkWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const productId = req.params.productId as string;
    const isWishlisted = await marketplaceService.checkWishlist(userId, productId);
    res.json({ success: true, data: { isWishlisted } });
  });

  // ==================== ORDERS ====================

  createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const buyerId = req.user?.userId as string;
    const order = await marketplaceService.createOrder(buyerId, req.body);
    res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
  });

  getBuyerOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const buyerId = req.user?.userId as string;
    const orders = await marketplaceService.getBuyerOrders(buyerId);
    res.json({ success: true, data: orders });
  });

  getVendorOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const vendorId = req.user?.userId as string;
    const orders = await marketplaceService.getVendorOrders(vendorId);
    res.json({ success: true, data: orders });
  });

  updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { status, note } = req.body;
    await marketplaceService.updateOrderStatus(id, status, req.user?.userId as string, req.user?.role === UserRole.ADMIN, note);
    res.json({ success: true, message: `Order status updated to ${status}` });
  });

  getOrderTimeline = asyncHandler(async (req: AuthRequest, res: Response) => {
    const orderId = req.params.orderId as string;
    const timeline = await marketplaceService.getOrderTimeline(orderId);
    res.json({ success: true, data: timeline });
  });

  // ==================== VENDOR DASHBOARD ====================

  getVendorDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const vendorId = req.user?.userId as string;
    const stats = await marketplaceService.getVendorDashboardStats(vendorId);
    res.json({ success: true, data: stats });
  });
}

export const marketplaceController = new MarketplaceController();
