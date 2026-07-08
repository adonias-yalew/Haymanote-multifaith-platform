import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Boxes, ClipboardList, PackagePlus, ShoppingBag,
  TrendingUp, AlertTriangle, Star, DollarSign, PackageCheck,
  type LucideIcon,
} from 'lucide-react';
import type { Product, VendorDashboardStats } from '../types';
import { marketplaceApi } from '../services/api';
import Button from '../components/Button';
import { formatETB } from '../utils/marketplace';

const VendorDashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [productsResponse, statsResponse] = await Promise.all([
          marketplaceApi.getMyProducts(),
          marketplaceApi.getVendorDashboardStats(),
        ]);
        setProducts(productsResponse.data.data || []);
        setStats(statsResponse.data.data || null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load vendor dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const inventorySummary = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter(p => p.stock <= 0).length;
    return { totalStock, lowStock, outOfStock };
  }, [products]);

  const recentProducts = products.slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Vendor Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Manage products, inventory, orders, and marketplace performance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/vendor/products">
            <Button leftIcon={<PackagePlus className="h-4 w-4" />}>Add Product</Button>
          </Link>
          <Link to="/vendor/orders">
            <Button variant="secondary" leftIcon={<ClipboardList className="h-4 w-4" />}>View Orders</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={ShoppingBag} label="Total Products" value={products.length.toString()} />
        <MetricCard icon={ClipboardList} label="Total Orders" value={String(stats?.totalOrders || 0)} />
        <MetricCard icon={DollarSign} label="Revenue" value={formatETB(stats?.totalRevenue || 0)} />
        <MetricCard icon={TrendingUp} label="Units Sold" value={String(stats?.totalSales || 0)} />
      </div>

      {stats && stats.lowStockProducts > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {stats.lowStockProducts} product{stats.lowStockProducts > 1 ? 's' : ''} low on stock,
            {stats.outOfStockProducts > 0 ? ` ${stats.outOfStockProducts} out of stock.` : ''}
            {' '}<Link to="/vendor/products" className="font-semibold underline">Manage inventory</Link>
          </span>
        </div>
      )}

      {/* Stats + Inventory */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Inventory Summary</h2>
              <p className="text-sm text-slate-600">Stock health across your catalog.</p>
            </div>
            <Boxes className="h-5 w-5 text-slate-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryPill label="In Stock" value={String(products.length - inventorySummary.outOfStock)} />
            <SummaryPill label="Low Stock" value={String(inventorySummary.lowStock)} tone="amber" />
            <SummaryPill label="Out of Stock" value={String(inventorySummary.outOfStock)} tone="red" />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Order Overview</h2>
              <p className="text-sm text-slate-600">Order status breakdown.</p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryPill label="Pending" value={String(stats?.pendingOrders || 0)} tone="amber" />
            <SummaryPill label="Shipped" value={String(stats?.shippedOrders || 0)} tone="indigo" />
            <SummaryPill label="Delivered" value={String(stats?.deliveredOrders || 0)} tone="indigo" />
          </div>
          {stats && stats.ordersByStatus.length > 0 && (
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
              {stats.ordersByStatus.filter(s => s.count > 0).map((s, i) => {
                const total = stats.totalOrders || 1;
                const pct = (s.count / total) * 100;
                const colors = ['bg-amber-500', 'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-red-400', 'bg-slate-400'];
                return (
                  <div
                    key={s.status}
                    className={`${colors[i % colors.length]} h-full transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${s.status}: ${s.count}`}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Top Products */}
      {stats && stats.topProducts.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">Top Selling Products</h2>
            <p className="text-sm text-slate-600">Best performers by units sold.</p>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-bold text-slate-400 w-5">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950 truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.totalSold} sold</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">{formatETB(p.revenue)}</p>
                  <p className="text-xs text-slate-500">{p.stock} in stock</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">Quick Actions</h2>
          <p className="text-sm text-slate-600">Jump into common vendor workflows.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/vendor/products" className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
            <PackagePlus className="mr-2 h-4 w-4" /> Add Product
          </Link>
          <Link to="/vendor/products" className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
            <Boxes className="mr-2 h-4 w-4" /> Edit Products
          </Link>
          <Link to="/vendor/orders" className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
            <ClipboardList className="mr-2 h-4 w-4" /> View Orders
          </Link>
          <Link to="/vendor/messages" className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
            <PackageCheck className="mr-2 h-4 w-4" /> Messages
          </Link>
        </div>
      </section>

      {/* Product Management */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Product Management</h2>
            <p className="text-sm text-slate-600">Recent products from your catalog.</p>
          </div>
          <Link to="/vendor/products" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">Manage all</Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Sold</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentProducts.length > 0 ? recentProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{product.title}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatETB(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`${product.stock <= 5 && product.stock > 0 ? 'text-amber-600 font-semibold' : product.stock === 0 ? 'text-red-600 font-semibold' : 'text-slate-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{product.totalSold || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/vendor/products" className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Edit</Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>No products yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Recent Orders</h2>
            <p className="text-sm text-slate-600">Product orders that include your inventory.</p>
          </div>
          <Link to="/vendor/orders" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">View all</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
            <div key={order.id} className="rounded-lg border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{order.productTitle || 'Product order'}</p>
                  <p className="text-sm text-slate-600">Qty {order.quantity} - {formatETB(order.price)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          )) : <p className="text-sm text-slate-500 col-span-2">No orders yet.</p>}
        </div>
      </section>

      {/* Performance Summary */}
      {stats && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Performance Summary</h2>
              <p className="text-sm text-slate-600">Store performance at a glance.</p>
            </div>
            <Star className="h-5 w-5 text-slate-400" />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <SummaryPill label="Avg. Rating" value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'} tone="indigo" />
            <SummaryPill label="Total Reviews" value={String(stats.totalReviews)} tone="indigo" />
            <SummaryPill label="Active Listings" value={String(stats.activeListings)} tone="indigo" />
            <SummaryPill label="Cancelled" value={String(stats.cancelledOrders)} tone="red" />
          </div>
        </section>
      )}
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-2xl font-semibold text-slate-950">{value}</p>
    <p className="text-sm text-slate-600">{label}</p>
  </div>
);

const SummaryPill = ({ label, value, tone = 'indigo' }: { label: string; value: string; tone?: 'indigo' | 'amber' | 'red' }) => {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
};

const OrderStatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-indigo-100 text-indigo-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
};

export default VendorDashboardPage;
