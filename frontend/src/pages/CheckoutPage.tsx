import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, MapPin, Loader, CheckCircle, ArrowLeft, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { marketplaceApi } from '../services/api';
import { formatETB } from '../utils/marketplace';

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (items.length === 0 && !success) {
    return (
      <div className="mx-auto max-w-3xl py-16 px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-950 mb-2">Your cart is empty</h2>
        <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { setError('Please enter your shipping address'); return; }
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setSubmitting(true);
    setError('');
    try {
      const shippingAddress = [address, city].filter(Boolean).join(', ');
      const res = await marketplaceApi.createOrder({
        shippingAddress,
        phone,
        notes,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      setOrderId(res.data.data?.order?.id || res.data.data?.id || '');
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-950 mb-2">Order Placed!</h2>
        <p className="text-slate-500 mb-2">Your order has been placed successfully.</p>
        {orderId && <p className="text-xs text-slate-400 mb-6">Order ID: {orderId.slice(0, 12)}...</p>}
        <div className="flex items-center justify-center gap-3">
          <Link to="/my-orders" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
            View My Orders
          </Link>
          <Link to="/marketplace" className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/cart" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-950">Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950 mb-4">
              <MapPin className="h-4 w-4 text-indigo-600" /> Shipping Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Address *</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street address, area, landmark"
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Addis Ababa"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+251 9XX XXX XXX"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Order Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Special instructions for the vendor"
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950 mb-4">
              <CreditCard className="h-4 w-4 text-indigo-600" /> Payment Method
            </h3>
            <p className="text-sm text-slate-500">Payment will be collected on delivery (Cash on Delivery).</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 h-fit sticky top-24">
          <h3 className="text-sm font-semibold text-slate-950 mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate max-w-[180px]">{item.title} × {item.quantity}</span>
                <span className="font-semibold text-slate-900">{formatETB(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="border-slate-200 mb-3" />
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span><span className="font-semibold text-slate-900">{formatETB(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 mt-1">
            <span>Shipping</span><span className="font-semibold text-emerald-600">Free</span>
          </div>
          <hr className="my-3 border-slate-200" />
          <div className="flex justify-between text-base font-bold text-slate-950 mb-5">
            <span>Total</span><span>{formatETB(subtotal)}</span>
          </div>

          {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            {submitting ? 'Placing Order...' : `Place Order • ${formatETB(subtotal)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
