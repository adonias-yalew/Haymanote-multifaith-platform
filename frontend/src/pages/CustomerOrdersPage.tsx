import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, Truck, Clock, Loader, Eye } from 'lucide-react';
import { marketplaceApi } from '../services/api';
import { formatETB } from '../utils/marketplace';
import type { Order } from '../types';

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await marketplaceApi.getBuyerOrders();
        setOrders(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-indigo-100 text-indigo-700', SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-slate-100 text-slate-700',
    };
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-8 px-4">
        <h1 className="text-2xl font-bold text-slate-950 mb-6">My Orders</h1>
        <div className="flex items-center justify-center py-20"><Loader className="h-8 w-8 animate-spin text-slate-400" /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-950 mb-6">My Orders</h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <PackageCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
          <p className="text-sm text-slate-500 mb-4">Start exploring the marketplace and place your first order.</p>
          <Link to="/marketplace" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-slate-900">Order #{order.id?.slice(0, 8) || 'N/A'}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              {/* Items */}
              <div className="px-5 py-4 space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productTitle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 text-xs">N/A</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/product/${item.productId}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600 truncate block">
                          {item.productTitle || 'Product'}
                        </Link>
                        <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatETB(item.price)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{formatETB(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
                <p className="text-sm text-slate-500">{order.shippingAddress}</p>
                <div className="flex items-center gap-3">
                  <p className="text-base font-bold text-slate-900">{formatETB(order.totalAmount)}</p>
                  {/* Timeline button */}
                  {order.timeline && order.timeline.length > 0 && (
                    <button
                      onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Timeline
                    </button>
                  )}
                </div>
              </div>
              {/* Timeline */}
              {selectedOrderId === order.id && order.timeline && (
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-3">
                    {order.timeline.map((entry: any, i: number) => (
                      <div key={entry.id} className="relative">
                        <div className={`absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'}`} />
                        <p className="text-sm font-semibold text-slate-900">{entry.status}</p>
                        {entry.note && <p className="text-xs text-slate-500">{entry.note}</p>}
                        <p className="text-[10px] text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
