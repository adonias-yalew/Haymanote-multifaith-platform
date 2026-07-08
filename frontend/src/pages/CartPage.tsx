import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatETB } from '../utils/marketplace';

const CartPage = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-16 px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-950 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/marketplace" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-950">Shopping Cart ({itemCount} items)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4">
              <Link to={`/product/${item.productId}`} className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">No img</div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productId}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600 block truncate">
                  {item.title}
                </Link>
                <p className="text-lg font-bold text-slate-950 mt-1">{formatETB(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-950 disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-950 disabled:opacity-30"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 h-fit sticky top-24">
          <h3 className="text-sm font-semibold text-slate-950 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-slate-900">{formatETB(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">Calculated at checkout</span>
            </div>
          </div>
          <hr className="my-3 border-slate-200" />
          <div className="flex justify-between text-base font-bold text-slate-950 mb-5">
            <span>Total</span><span>{formatETB(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/marketplace" className="block text-center text-sm text-indigo-600 font-medium mt-3 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
