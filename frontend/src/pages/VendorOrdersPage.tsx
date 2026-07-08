import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, PackageCheck, Truck, Eye } from 'lucide-react';
import { marketplaceApi } from '../services/api';
import Button from '../components/Button';
import { formatETB } from '../utils/marketplace';

interface VendorOrder {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  buyerId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddress?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt?: string;
  productTitle?: string;
}

interface TimelineEntry {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
}

const statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const VendorOrdersPage = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [timelineOrderId, setTimelineOrderId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await marketplaceApi.getVendorOrders();
      setOrders(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + o.price * o.quantity, 0);
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const shipped = orders.filter(o => o.status === 'SHIPPED').length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
    return { revenue, pending, shipped, delivered, cancelled };
  }, [orders]);

  const updateStatus = async (orderId: string, status: VendorOrder['status']) => {
    setUpdatingOrderId(orderId);
    setError('');
    try {
      await marketplaceApi.updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const viewTimeline = async (orderId: string) => {
    setTimelineOrderId(orderId);
    setShowTimeline(true);
    try {
      const res = await marketplaceApi.getOrderTimeline(orderId);
      setTimeline(res.data.data || []);
    } catch {
      setTimeline([]);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-indigo-100 text-indigo-700', SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-slate-100 text-slate-700',
    };
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">Track and update orders containing your products.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={ClipboardList} label="Total Orders" value={orders.length.toString()} />
        <Stat icon={Truck} label="Pending" value={stats.pending.toString()} />
        <Stat icon={PackageCheck} label="Delivered" value={stats.delivered.toString()} />
        <Stat icon={ClipboardList} label="Revenue" value={formatETB(stats.revenue)} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">Order List</h2>
          <p className="text-sm text-slate-600">Update fulfillment status as orders move forward.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Shipping</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>Loading orders...</td></tr>
              ) : orders.length > 0 ? orders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{order.productTitle || 'Product order'}</p>
                    <p className="text-xs text-slate-500">Order {order.orderId.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{order.quantity}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatETB(order.price * order.quantity)}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">{order.shippingAddress || 'Not provided'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.orderId, e.target.value as VendorOrder['status'])}
                      disabled={updatingOrderId === order.orderId}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => viewTimeline(order.orderId)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        title="View timeline"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Button
                        type="button" size="sm" variant="secondary"
                        isLoading={updatingOrderId === order.orderId}
                        onClick={() => updateStatus(order.orderId, order.status)}
                      >
                        Save
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Timeline Modal */}
      {showTimeline && timelineOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowTimeline(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-950">Order Timeline</h3>
              <button onClick={() => setShowTimeline(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
              {timeline.length > 0 ? timeline.map((entry, i) => (
                <div key={entry.id} className="relative">
                  <div className={`absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'}`} />
                  <p className="text-sm font-semibold text-slate-900">{entry.status}</p>
                  {entry.note && <p className="text-xs text-slate-500">{entry.note}</p>}
                  <p className="text-[10px] text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No timeline entries yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-2xl font-semibold text-slate-950">{value}</p>
    <p className="text-sm text-slate-600">{label}</p>
  </div>
);

export default VendorOrdersPage;
