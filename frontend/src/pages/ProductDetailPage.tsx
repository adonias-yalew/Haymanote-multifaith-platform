import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, MessageSquare, ShoppingCart, Heart,
  Share2, ChevronDown, ImagePlus, Loader, Check,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { marketplaceApi, messagingApi } from '../services/api';
import { useCart } from '../context/CartContext';
import type { Product, ProductReview } from '../types';
import { formatETB } from '../utils/marketplace';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [prodRes, reviewRes, relatedRes] = await Promise.all([
        marketplaceApi.getProductById(id),
        marketplaceApi.getProductReviews(id).catch(() => ({ data: { data: [] } })),
        marketplaceApi.getRelatedProducts(id).catch(() => ({ data: { data: [] } })),
      ]);
      setProduct(prodRes.data.data);
      setReviews(reviewRes.data.data || []);
      setRelatedProducts(relatedRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch product', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkWishlist = useCallback(async () => {
    if (!id) return;
    try {
      const res = await marketplaceApi.checkWishlist(id);
      setWishlisted(res.data.data?.isWishlisted || false);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => { fetchData(); checkWishlist(); }, [fetchData, checkWishlist]);

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      if (wishlisted) {
        await marketplaceApi.removeFromWishlist(product.id);
        setWishlisted(false);
      } else {
        await marketplaceApi.addToWishlist(product.id);
        setWishlisted(true);
      }
    } catch { /* ignore */ }
  };

  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      vendorId: product.vendorId,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      vendorId: product.vendorId,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    navigate('/checkout');
  };

  const isOwnProduct = !!user && !!product && user.id === product.vendorId;

  const handleContactVendor = async () => {
    if (!product || !user || isOwnProduct) return;
    setSendingMessage(true);
    try {
      const convRes = await messagingApi.getOrCreateConversation({
        productId: product.id,
        vendorId: product.vendorId,
        subject: `Question about ${product.title}`,
      });
      navigate(`/my-messages?conversationId=${convRes.data.data.id}`);
    } catch {
      navigate('/my-messages');
    }
  };

  const handleSubmitReview = async () => {
    if (!product || !user) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      await marketplaceApi.createReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle || undefined,
        content: reviewContent || undefined,
      });
      setReviewTitle('');
      setReviewContent('');
      // Refresh reviews
      const res = await marketplaceApi.getProductReviews(product.id);
      setReviews(res.data.data || []);
    } catch (err: any) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/marketplace')} className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">Product not found</div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.averageRating?.toFixed(1) || '0.0';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button onClick={() => navigate('/marketplace')} className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <div className="rounded-xl overflow-hidden bg-slate-100">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} className="w-full h-96 object-cover" />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-slate-200 text-slate-500">
                <ImagePlus className="h-16 w-16 stroke-[1.2]" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
              {product.discountPercent && product.discountPercent > 0 && (
                <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-full">
                  -{product.discountPercent}% OFF
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{product.title}</h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">{avgRating}</span>
              <span className="text-sm text-slate-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              <span className="text-sm text-slate-400">{product.totalSold || 0} sold</span>
            </div>

            <p className="text-slate-700 leading-relaxed mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <span className="text-slate-500">Stock</span>
                <p className="font-semibold text-slate-900">{product.stock > 0 ? `${product.stock} units` : 'Out of stock'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <span className="text-slate-500">Religion</span>
                <p className="font-semibold text-slate-900 capitalize">{product.religion || 'All'}</p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6" id="reviews">
            <h2 className="text-lg font-semibold text-slate-950 mb-4">Customer Reviews</h2>

            {/* Submit Review */}
            {user && user.role !== 'vendor' && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Write a Review</h3>
                {reviewError && <p className="text-xs text-red-600 mb-2">{reviewError}</p>}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} onClick={() => setReviewRating(i)} type="button">
                      <Star className={`h-5 w-5 ${i <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 ml-2">{reviewRating}/5</span>
                </div>
                <input
                  type="text"
                  placeholder="Review title (optional)"
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <textarea
                  placeholder="Share your experience (optional)"
                  value={reviewContent}
                  onChange={e => setReviewContent(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none mb-3"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{review.userEmail?.split('@')[0] || 'Anonymous'}</span>
                        {review.isVerifiedPurchase && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.title && <p className="text-sm font-semibold text-slate-900 mb-1">{review.title}</p>}
                    {review.content && <p className="text-sm text-slate-600">{review.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">Price</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-slate-900">
                  {product.discountPercent && product.discountPercent > 0
                    ? formatETB(product.price * (1 - product.discountPercent / 100))
                    : formatETB(product.price)
                  }
                </p>
                {product.discountPercent && product.discountPercent > 0 && (
                  <span className="text-lg text-slate-400 line-through">{formatETB(product.price)}</span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow"
                  >
                    <ShoppingCart className="h-4 w-4" /> Buy Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="w-full border border-indigo-300 text-indigo-700 py-3 px-4 rounded-xl font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </button>
                </>
              ) : (
                <button disabled className="w-full bg-slate-200 text-slate-500 py-3 px-4 rounded-xl font-medium cursor-not-allowed">
                  Out of Stock
                </button>
              )}

              <button
                onClick={toggleWishlist}
                className={`w-full border py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  wishlisted ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlisted ? 'Saved' : 'Save'}
              </button>

              <button className="w-full border border-slate-300 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>

            {!isOwnProduct && (
              <button
                onClick={handleContactVendor}
                disabled={sendingMessage}
                className="w-full border-2 border-indigo-600 text-indigo-600 py-3 px-4 rounded-xl font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {sendingMessage ? <Loader className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                {sendingMessage ? 'Opening...' : 'Contact Vendor'}
              </button>
            )}
          </div>

          {/* Vendor Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Vendor Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Seller</p>
                <p className="font-medium text-slate-900">Haymanote Vendor</p>
              </div>
              <div>
                <p className="text-slate-500">Response Time</p>
                <p className="font-medium text-slate-900">Usually within 1 hour</p>
              </div>
              <div>
                <p className="text-slate-500">Rating</p>
                <p className="font-medium text-slate-900">{avgRating} / 5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(rp => (
              <Link
                key={rp.id}
                to={`/product/${rp.id}`}
                className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="h-36 bg-slate-100 overflow-hidden">
                  {rp.imageUrl ? (
                    <img src={rp.imageUrl} alt={rp.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <ImagePlus className="h-8 w-8 stroke-[1.2]" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-slate-900 truncate">{rp.title}</p>
                  <p className="text-sm font-bold text-indigo-600">{formatETB(rp.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
