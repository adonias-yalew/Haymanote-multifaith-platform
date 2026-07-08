import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, isAnonymous?: boolean, role?: string, religion?: string, organizationName?: string, document?: File) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (isAnonymous !== undefined) formData.append('isAnonymous', String(isAnonymous));
    if (role) formData.append('role', role);
    if (religion) formData.append('religion', religion);
    if (organizationName) formData.append('organizationName', organizationName);
    if (document) formData.append('document', document);
    
    return api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMe: () => api.get('/auth/me'),
  verifyEmail: (code: string, email: string) =>
    api.post('/auth/verify-email', { token: code, email }),
  resendVerificationEmail: (email: string) =>
    api.post('/auth/resend-verification', { email }),
  checkVerificationStatus: (email: string) =>
    api.get('/auth/verification-status', { params: { email } }),
  // Social auth endpoints
  googleSignup: (googleToken: string, religion: string, isAnonymous: boolean) =>
    api.post('/auth/google-signup', { googleToken, religion, isAnonymous }),
  requestPhoneOTP: (phoneNumber: string, email: string) =>
    api.post('/auth/phone-otp', { phoneNumber, email }),
  verifyPhoneOTPAndSignup: (phoneNumber: string, otpCode: string, religion: string, isAnonymous: boolean) =>
    api.post('/auth/verify-phone-otp', { phoneNumber, otpCode, religion, isAnonymous }),
};

// Posts API
export const postsApi = {
  getAll: () => api.get('/posts'),
  getMyPosts: () => api.get('/posts/my'),
  getById: (id: string) => api.get(`/posts/${id}`),
  create: (data: { title?: string; content?: string; isAnonymous?: boolean; tags?: string[]; image?: File }) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.isAnonymous !== undefined) formData.append('isAnonymous', String(data.isAnonymous));
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.image) formData.append('image', data.image);
    
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id: string, data: unknown) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  like: (id: string) => api.post(`/posts/${id}/like`),
  unlike: (id: string) => api.delete(`/posts/${id}/like`),
  checkLike: (id: string) => api.get(`/posts/${id}/like`),
  getSaved: () => api.get('/posts/saved'),
  save: (id: string) => api.post(`/posts/${id}/save`),
  unsave: (id: string) => api.delete(`/posts/${id}/save`),
  getUnanswered: () => api.get('/posts/unanswered'),
};

// Comments API
export const commentsApi = {
  getByPost: (postId: string) => api.get(`/comments/post/${postId}`),
  create: (data: { postId: string; content: string; isAnonymous?: boolean; parentId?: string }) =>
    api.post('/comments', data),
  update: (id: string, data: { content: string }) => api.put(`/comments/${id}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
  like: (id: string) => api.post(`/comments/${id}/like`),
};

// Leaders API
export const leadersApi = {
  getAll: () => api.get('/leaders'),
  getById: (id: string) => api.get(`/leaders/${id}`),
  apply: (data: {
    licenseNumber: string;
    specialization: string;
    credentials: string;
    yearsOfExperience: number;
    bio?: string;
  }) => api.post('/leaders/apply', data),
  getPendingVerifications: () => api.get('/leaders/verifications/pending'),
  verify: (id: string, approved: boolean) => api.put(`/leaders/${id}/verify`, { approved }),
  getStats: () => api.get('/leaders/stats'),
};

// Blogs API
export const blogsApi = {
  getAll: () => api.get('/blogs'),
  getById: (id: string) => api.get(`/blogs/${id}`),
  create: (data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    published?: boolean;
  }) => api.post('/blogs', data),
  update: (id: string, data: unknown) => api.put(`/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/blogs/${id}`),
};

// Reports API
export const reportsApi = {
  create: (data: {
    targetType: 'POST' | 'COMMENT' | 'USER';
    targetId: string;
    reason: string;
    description?: string;
  }) => api.post('/reports', data),
};

// Marketplace API
export const marketplaceApi = {
  // Products
  getProducts: (params?: { category?: string; search?: string; sortBy?: string; page?: number; limit?: number }) =>
    api.get('/marketplace/products', { params }),
  getProductById: (id: string) => api.get(`/marketplace/products/${id}`),
  getRelatedProducts: (id: string) => api.get(`/marketplace/products/${id}/related`),
  getMyProducts: () => api.get('/marketplace/vendor/products'),
  createProduct: (data: {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
    stock?: number;
    religion?: string;
  }) => api.post('/marketplace/products', data),
  updateProduct: (id: string, data: Partial<{
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
    stock: number;
  }>) => api.put(`/marketplace/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/marketplace/products/${id}`),

  // Reviews
  getProductReviews: (productId: string) => api.get(`/marketplace/products/${productId}/reviews`),
  createReview: (data: { productId: string; rating: number; title?: string; content?: string }) =>
    api.post('/marketplace/reviews', data),

  // Wishlist
  getWishlist: () => api.get('/marketplace/wishlist'),
  addToWishlist: (productId: string) => api.post('/marketplace/wishlist', { productId }),
  removeFromWishlist: (productId: string) => api.delete(`/marketplace/wishlist/${productId}`),
  checkWishlist: (productId: string) => api.get(`/marketplace/wishlist/${productId}/check`),

  // Orders
  getVendorOrders: () => api.get('/marketplace/vendor/orders'),
  getBuyerOrders: () => api.get('/marketplace/buyer/orders'),
  createOrder: (data: {
    shippingAddress: string;
    items: { productId: string; quantity: number }[];
  }) => api.post('/marketplace/orders', data),
  updateOrderStatus: (id: string, status: string, note?: string) =>
    api.put(`/marketplace/orders/${id}/status`, { status, note }),
  getOrderTimeline: (orderId: string) => api.get(`/marketplace/orders/${orderId}/timeline`),

  // Vendor Stats
  getVendorDashboardStats: () => api.get('/marketplace/vendor/stats'),
};

// Messaging API
export const messagingApi = {
  getConversations: () => api.get('/messaging/conversations'),
  getOrCreateConversation: (data: { productId?: string; vendorId: string; subject?: string }) =>
    api.post('/messaging/conversations', data),
  getMessages: (conversationId: string) => api.get(`/messaging/conversations/${conversationId}/messages`),
  sendMessage: (data: { conversationId: string; content: string }) =>
    api.post('/messaging/messages', data),
  markConversationRead: (conversationId: string) =>
    api.put(`/messaging/conversations/${conversationId}/read`),
};

// Notifications API
export const notificationsApi = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId: string) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getOverview: () => api.get('/admin/overview'),
  getUsers: () => api.get('/admin/users'),
  getLeaders: () => api.get('/admin/leaders'),
  getVendors: () => api.get('/admin/vendors'),
  getProducts: () => api.get('/admin/products'),
  getTeachings: () => api.get('/admin/teachings'),
  getReports: () => api.get('/admin/reports'),
  getVerificationRequests: () => api.get('/admin/verification-requests'),
  getReligions: () => api.get('/admin/religions'),
  getSettings: () => api.get('/admin/settings'),
  getPendingReports: () => api.get('/reports/pending'),
  reviewReport: (id: string, data: { status: string; actionTaken?: string }) =>
    api.put(`/admin/reports/${id}/review`, data),
  moderatePost: (postId: string, data: { status: string; reason?: string }) =>
    api.put(`/admin/posts/${postId}/moderate`, data),
  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  updateUser: (userId: string, data: unknown) => api.put(`/admin/users/${userId}`, data),
  updateUserStatus: (userId: string, status: string) =>
    api.put(`/admin/users/${userId}/status`, { status }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  updateLeader: (leaderId: string, data: unknown) => api.put(`/admin/leaders/${leaderId}`, data),
  updateVendor: (vendorId: string, data: unknown) => api.put(`/admin/vendors/${vendorId}`, data),
  updateProduct: (productId: string, data: unknown) => api.put(`/admin/products/${productId}`, data),
  deleteProduct: (productId: string) => api.delete(`/admin/products/${productId}`),
  deletePost: (postId: string) => api.delete(`/admin/posts/${postId}`),
  updateTeaching: (sermonId: string, data: unknown) => api.put(`/admin/teachings/${sermonId}`, data),
  deleteTeaching: (sermonId: string) => api.delete(`/admin/teachings/${sermonId}`),
  reviewVerificationRequest: (requestId: string, data: { status: string; rejectionReason?: string }) =>
    api.put(`/admin/verification-requests/${requestId}/review`, data),
  createReligion: (data: unknown) => api.post('/admin/religions', data),
  updateReligion: (religionId: string, data: unknown) => api.put(`/admin/religions/${religionId}`, data),
  deleteReligion: (religionId: string) => api.delete(`/admin/religions/${religionId}`),
  updateSetting: (key: string, data: { value: unknown; description?: string }) =>
    api.put(`/admin/settings/${encodeURIComponent(key)}`, data),
};

// Prayers API
export const prayersApi = {
  // Prayer Requests
  getPublic: () => api.get('/prayers/public'),
  getMy: () => api.get('/prayers/my'),
  createRequest: (data: { title: string; description?: string; isPublic?: boolean }) =>
    api.post('/prayers', data),
  updateRequest: (id: string, data: unknown) => api.put(`/prayers/${id}`, data),
  deleteRequest: (id: string) => api.delete(`/prayers/${id}`),
  prayFor: (id: string) => api.post(`/prayers/${id}/pray`),
  
  // Prayer Tracker
  logPrayer: (prayerName: string) => api.post('/prayers/tracker/log', { prayerName }),
  getStats: () => api.get('/prayers/tracker/stats'),
  getTodayPrayers: () => api.get('/prayers/tracker/today'),
  getWeekPrayers: () => api.get('/prayers/tracker/week'),
  getMonthPrayers: () => api.get('/prayers/tracker/month'),
  getDefaultPrayers: () => api.get('/prayers/tracker/defaults'),
  addCustomPrayer: (name: string) => api.post('/prayers/tracker/custom', { name }),
};

// Sermons API
export const sermonsApi = {
  getAll: () => api.get('/sermons'),
  getById: (id: string) => api.get(`/sermons/${id}`),
  create: (data: { title: string; content: string; excerpt?: string; coverImage?: string | File; tags?: string[]; published?: boolean }) => {
    if (data.coverImage instanceof File) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      if (data.excerpt) formData.append('excerpt', data.excerpt);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));
      formData.append('published', String(data.published ?? true));
      formData.append('coverImage', data.coverImage);
      return api.post('/sermons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/sermons', data);
  },
  update: (id: string, data: unknown) => api.put(`/sermons/${id}`, data),
  delete: (id: string) => api.delete(`/sermons/${id}`),
};

// Donations API
export const donationsApi = {
  getRecipientsByReligion: () => api.get('/donations/recipients'),
  getAllRecipients: () => api.get('/donations/recipients/all'),
  getRecipientById: (id: string) => api.get(`/donations/recipients/${id}`),
  createRecipient: (data: { name: string; religion: string; description?: string; imageUrl?: string; bankAccount?: string }) =>
    api.post('/donations/recipients', data),
  updateRecipient: (id: string, data: unknown) => api.put(`/donations/recipients/${id}`, data),
  deleteRecipient: (id: string) => api.delete(`/donations/recipients/${id}`),
  createDonation: (data: { recipientId: string; amount: number; transactionId?: string }) =>
    api.post('/donations', data),
  getUserDonations: () => api.get('/donations/my'),
  getStats: () => api.get('/donations/stats'),
  getRecipientStats: (id: string) => api.get(`/donations/recipients/${id}/stats`),
};

// AI API
export const aiApi = {
  chat: (data: {
    message: string;
    conversationId?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }) => api.post('/ai/chat', data),
  getConversations: () => api.get('/ai/conversations'),
  getMessages: (conversationId: string) => api.get(`/ai/conversations/${conversationId}/messages`),
  deleteConversation: (conversationId: string) => api.delete(`/ai/conversations/${conversationId}`),
};

export default api;
