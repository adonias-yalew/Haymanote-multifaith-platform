import { getSupabase } from '../../db/supabaseClient.js';
import { notificationService } from '../notifications/service.js';
import {
  Product, Order, ProductReview, WishlistItem,
  CreateProductInput, CreateOrderInput, VendorDashboardStats,
} from './types.js';

export class MarketplaceService {
  // ==================== PRODUCTS ====================

  async getAllProducts(
    userReligion?: string,
    isAdmin?: boolean,
    options?: { category?: string; search?: string; sortBy?: string; page?: number; limit?: number }
  ): Promise<{ products: Product[]; total: number }> {
    const supabase = getSupabase();
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (userReligion && !isAdmin) {
      query = query.eq('religion', userReligion);
    }

    if (options?.category) {
      query = query.ilike('category', `%${options.category}%`);
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const sortField = options?.sortBy === 'priceLow' ? 'price' :
      options?.sortBy === 'priceHigh' ? 'price' :
      options?.sortBy === 'oldest' ? 'created_at' : 'created_at';
    const sortOrder = options?.sortBy === 'priceLow' ? true : false;

    query = query.order(sortField, { ascending: sortOrder });

    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return { products: (data || []).map(this.mapProduct), total: count || 0 };
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapProduct);
  }

  async getProductById(id: string, userReligion?: string, isAdmin?: boolean): Promise<Product | null> {
    const supabase = getSupabase();
    let query = supabase.from('products').select('*').eq('id', id);

    if (userReligion && !isAdmin) {
      query = query.eq('religion', userReligion);
    }

    const { data, error } = await query.single();
    if (error || !data) return null;
    return this.mapProduct(data);
  }

  async getRelatedProducts(productId: string, category: string, religion?: string, limit = 4): Promise<Product[]> {
    const supabase = getSupabase();
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('id', productId)
      .eq('category', category);

    if (religion) query = query.eq('religion', religion);

    const { data, error } = await query
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapProduct);
  }

  async createProduct(vendorId: string, userReligion: string, isAdmin: boolean, input: CreateProductInput): Promise<Product> {
    const supabase = getSupabase();
    const religion = isAdmin && input.religion ? input.religion : userReligion;

    const { data, error } = await supabase
      .from('products')
      .insert({
        vendor_id: vendorId,
        religion,
        title: input.title,
        description: input.description,
        price: input.price,
        image_url: input.imageUrl,
        category: input.category,
        stock: input.stock || 10,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create product');
    return this.mapProduct(data);
  }

  async updateProduct(id: string, vendorId: string, isAdmin: boolean, input: Partial<CreateProductInput & { isFeatured?: boolean; discountPercent?: number; discountEndsAt?: string; tags?: string[]; isActive?: boolean }>): Promise<Product> {
    const supabase = getSupabase();
    const updates: Record<string, unknown> = {};
    if (input.title) updates.title = input.title;
    if (input.description) updates.description = input.description;
    if (input.price !== undefined) updates.price = input.price;
    if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
    if (input.category) updates.category = input.category;
    if (input.stock !== undefined) updates.stock = input.stock;
    if (isAdmin && input.religion) updates.religion = input.religion;
    if (isAdmin && input.isFeatured !== undefined) updates.is_featured = input.isFeatured;
    if (input.discountPercent !== undefined) updates.discount_percent = input.discountPercent;
    if (input.discountEndsAt !== undefined) updates.discount_ends_at = input.discountEndsAt;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.isActive !== undefined) updates.is_active = input.isActive;

    let query = supabase.from('products').update(updates).eq('id', id).select('*');
    if (!isAdmin) query = query.eq('vendor_id', vendorId);

    const { data, error } = await query.single();
    if (error || !data) throw new Error(error?.message || 'Failed to update product');
    return this.mapProduct(data);
  }

  async deleteProduct(id: string, vendorId: string, isAdmin: boolean): Promise<void> {
    const supabase = getSupabase();
    let query = supabase.from('products').delete().eq('id', id);
    if (!isAdmin) query = query.eq('vendor_id', vendorId);

    const { error } = await query;
    if (error) throw new Error(error.message);
  }

  // ==================== REVIEWS ====================

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, user:users(email)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((r: any) => ({
      ...this.mapReview(r),
      userEmail: r.user?.email,
    }));
  }

  async createReview(productId: string, userId: string, rating: number, title?: string, content?: string): Promise<ProductReview> {
    const supabase = getSupabase();

    // Check for verified purchase
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1)
      .maybeSingle();

    const isVerifiedPurchase = !!orderItem;

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating,
        title,
        content,
        is_verified_purchase: isVerifiedPurchase,
      })
      .select('*')
      .single();

    if (error) throw new Error(error?.message || 'Failed to create review');

    // Update product average rating
    await this.updateProductRating(productId);

    // Notify vendor
    const { data: product } = await supabase.from('products').select('vendor_id, title').eq('id', productId).single();
    if (product) {
      await notificationService.createNewReviewNotification(product.vendor_id as string, product.title as string);
    }

    return this.mapReview(data);
  }

  private async updateProductRating(productId: string): Promise<void> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (!data || data.length === 0) return;

    const total = data.reduce((sum, r) => sum + r.rating, 0);
    const average = Math.round((total / data.length) * 100) / 100;

    await supabase
      .from('products')
      .update({ average_rating: average, total_reviews: data.length })
      .eq('id', productId);
  }

  // ==================== WISHLIST ====================

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      productId: item.product_id,
      createdAt: item.created_at,
      product: item.product ? this.mapProduct(item.product) : undefined,
    }));
  }

  async addToWishlist(userId: string, productId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: userId, product_id: productId });

    if (error && !error.message.includes('duplicate')) throw new Error(error.message);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
  }

  async checkWishlist(userId: string, productId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    return !!data;
  }

  // ==================== ORDERS ====================

  async createOrder(buyerId: string, input: CreateOrderInput): Promise<Order> {
    const supabase = getSupabase();

    const productIds = input.items.map(i => i.productId);
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (prodError || !products || products.length !== productIds.length) {
      throw new Error('Some products were not found');
    }

    let totalAmount = 0;
    const orderItemsToCreate: { product_id: string; quantity: number; price: number; vendor_id: string }[] = [];
    const vendorMap = new Map<string, string>();

    for (const item of input.items) {
      const dbProd = products.find(p => p.id === item.productId);
      if (!dbProd) throw new Error(`Product ${item.productId} not found`);
      if (dbProd.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${dbProd.title}`);
      }

      const price = Number(dbProd.price);
      totalAmount += price * item.quantity;
      orderItemsToCreate.push({
        product_id: item.productId,
        quantity: item.quantity,
        price,
        vendor_id: dbProd.vendor_id,
      });
      vendorMap.set(dbProd.vendor_id, dbProd.vendor_id);
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerId,
        total_amount: totalAmount,
        status: 'PENDING',
        shipping_address: input.shippingAddress,
      })
      .select('*')
      .single();

    if (orderError || !order) throw new Error(orderError?.message || 'Failed to place order');

    for (const orderItem of orderItemsToCreate) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: orderItem.product_id,
        quantity: orderItem.quantity,
        price: orderItem.price,
      });

      const dbProd = products.find(p => p.id === orderItem.product_id);
      if (dbProd) {
        await supabase
          .from('products')
          .update({ stock: dbProd.stock - orderItem.quantity, total_sold: (dbProd.total_sold || 0) + orderItem.quantity })
          .eq('id', orderItem.product_id);
      }
    }

    // Notify vendors
    for (const [vendorId] of vendorMap) {
      const { data: buyer } = await supabase.from('users').select('email').eq('id', buyerId).single();
      await notificationService.createOrderNotifications(vendorId, order.id, buyer?.email || 'a customer');
    }

    return this.mapOrder(order);
  }

  async getBuyerOrders(buyerId: string): Promise<any[]> {
    const supabase = getSupabase();
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const fullOrders = [];
    for (const order of (orders || [])) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*, product:products(title, image_url)')
        .eq('order_id', order.id);

      const { data: timeline } = await supabase
        .from('order_timeline')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });

      fullOrders.push({
        ...this.mapOrder(order),
        items: (items || []).map(item => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          productTitle: item.product?.title,
          productImageUrl: item.product?.image_url,
        })),
        timeline: (timeline || []).map(t => ({
          id: t.id,
          status: t.status,
          note: t.note,
          createdAt: t.created_at,
        })),
      });
    }

    return fullOrders;
  }

  async getVendorOrders(vendorId: string): Promise<any[]> {
    const supabase = getSupabase();

    const { data: myProducts } = await supabase.from('products').select('id').eq('vendor_id', vendorId);
    const myProductIds = (myProducts || []).map(p => p.id);

    if (myProductIds.length === 0) return [];

    const { data: vendorItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*, order:orders(*), product:products(title, price)')
      .in('product_id', myProductIds)
      .order('id', { ascending: false });

    if (itemsError) throw new Error(itemsError.message);

    return (vendorItems || []).map(item => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      quantity: item.quantity,
      price: item.price,
      buyerId: item.order?.buyer_id,
      status: item.order?.status,
      shippingAddress: item.order?.shipping_address,
      notes: item.order?.notes,
      trackingNumber: item.order?.tracking_number,
      createdAt: item.order?.created_at,
      productTitle: item.product?.title,
    }));
  }

  async updateOrderStatus(orderId: string, status: string, vendorId: string, isAdmin: boolean, note?: string): Promise<void> {
    const supabase = getSupabase();

    if (!isAdmin) {
      const { data: vendorItems } = await supabase
        .from('order_items')
        .select('id, product:products!inner(vendor_id)')
        .eq('order_id', orderId)
        .eq('product.vendor_id', vendorId)
        .limit(1);

      if (!vendorItems || vendorItems.length === 0) {
        throw new Error('Order not found for this vendor');
      }
    }

    const updates: Record<string, unknown> = { status };
    if (note) updates.notes = note;
    if (status === 'DELIVERED') updates.delivered_at = new Date().toISOString();
    if (status === 'CANCELLED') updates.cancelled_at = new Date().toISOString();

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);

    if (error) throw new Error(error.message);

    // Notify buyer
    const { data: order } = await supabase.from('orders').select('buyer_id').eq('id', orderId).single();
    if (order) {
      await notificationService.createOrderUpdateNotification(order.buyer_id, orderId, status);
    }
  }

  async getOrderTimeline(orderId: string): Promise<any[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('order_timeline')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(t => ({
      id: t.id,
      orderId: t.order_id,
      status: t.status,
      note: t.note,
      changedBy: t.changed_by,
      createdAt: t.created_at,
    }));
  }

  // ==================== VENDOR DASHBOARD STATS ====================

  async getVendorDashboardStats(vendorId: string): Promise<VendorDashboardStats> {
    const supabase = getSupabase();

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId);

    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => p.stock > 0 && p.stock <= 5).length || 0;
    const outOfStockProducts = products?.filter(p => p.stock <= 0).length || 0;
    const activeListings = products?.filter(p => p.is_active !== false).length || 0;

    const { data: vendorProfile } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', vendorId)
      .single();

    const vendorOrders = await this.getVendorOrders(vendorId);

    const totalOrders = vendorOrders.length;
    const totalRevenue = vendorOrders.reduce((sum, o) => sum + o.price * o.quantity, 0);
    const totalSales = vendorOrders.reduce((sum, o) => sum + o.quantity, 0);
    const pendingOrders = vendorOrders.filter(o => o.status === 'PENDING').length;
    const processingOrders = vendorOrders.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
    const shippedOrders = vendorOrders.filter(o => o.status === 'SHIPPED').length;
    const deliveredOrders = vendorOrders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = vendorOrders.filter(o => o.status === 'CANCELLED').length;

    const recentOrders = vendorOrders.slice(0, 5);

    const topProducts = (products || [])
      .sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        totalSold: p.total_sold || 0,
        revenue: (p.total_sold || 0) * Number(p.price),
        stock: p.stock,
      }));

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalSales,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      activeListings,
      averageRating: Number(vendorProfile?.average_rating || 0),
      totalReviews: vendorProfile?.total_reviews || 0,
      recentOrders,
      topProducts,
      revenueByMonth: [],
      ordersByStatus: [
        { status: 'PENDING', count: pendingOrders },
        { status: 'PROCESSING', count: processingOrders },
        { status: 'SHIPPED', count: shippedOrders },
        { status: 'DELIVERED', count: deliveredOrders },
        { status: 'CANCELLED', count: cancelledOrders },
      ],
    };
  }

  // ==================== MAPPERS ====================

  private mapProduct(data: Record<string, unknown>): Product {
    return {
      id: data.id as string,
      vendorId: data.vendor_id as string,
      title: data.title as string,
      description: data.description as string,
      price: Number(data.price),
      imageUrl: data.image_url as string | undefined,
      category: data.category as string,
      stock: data.stock as number,
      religion: data.religion as string | undefined,
      isFeatured: data.is_featured as boolean | undefined,
      discountPercent: data.discount_percent ? Number(data.discount_percent) : undefined,
      discountEndsAt: data.discount_ends_at as string | undefined,
      averageRating: data.average_rating ? Number(data.average_rating) : undefined,
      totalReviews: data.total_reviews as number | undefined,
      totalSold: data.total_sold as number | undefined,
      tags: data.tags as string[] | undefined,
      isActive: data.is_active as boolean | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapOrder(data: Record<string, unknown>): Order {
    return {
      id: data.id as string,
      buyerId: data.buyer_id as string,
      totalAmount: Number(data.total_amount),
      status: data.status as Order['status'],
      shippingAddress: data.shipping_address as string,
      notes: data.notes as string | undefined,
      trackingNumber: data.tracking_number as string | undefined,
      estimatedDeliveryDate: data.estimated_delivery_date as string | undefined,
      deliveredAt: data.delivered_at as string | undefined,
      cancelledAt: data.cancelled_at as string | undefined,
      cancellationReason: data.cancellation_reason as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapReview(data: Record<string, unknown>): ProductReview {
    return {
      id: data.id as string,
      productId: data.product_id as string,
      userId: data.user_id as string,
      rating: data.rating as number,
      title: data.title as string | undefined,
      content: data.content as string | undefined,
      isVerifiedPurchase: data.is_verified_purchase as boolean,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

export const marketplaceService = new MarketplaceService();
