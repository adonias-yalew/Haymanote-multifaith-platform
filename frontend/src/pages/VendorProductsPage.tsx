import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Edit3, ImagePlus, PackagePlus, Search, Trash2 } from 'lucide-react';
import type { Product } from '../types';
import { marketplaceApi } from '../services/api';
import Button from '../components/Button';
import { formatETB, imageFileToDataUrl, PRODUCT_CATEGORIES } from '../utils/marketplace';

const RELIGIONS = ['orthodox', 'muslim', 'protestant'];

const emptyForm = {
  title: '',
  description: '',
  price: '',
  category: PRODUCT_CATEGORIES[0],
  religion: RELIGIONS[0],
  stock: '',
  imageUrl: '',
};

const VendorProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await marketplaceApi.getMyProducts();
      setProducts(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;

    return products.filter((product) =>
      [product.title, product.category, product.description].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [products, query]);

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: String(product.price),
      category: product.category || PRODUCT_CATEGORIES[0],
      religion: product.religion || RELIGIONS[0],
      stock: String(product.stock),
      imageUrl: product.imageUrl || '',
    });
  };

  const startCreate = () => {
    setEditingProduct({ id: 'new' } as any);
    setFormData(emptyForm);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
  };

  const handleImageChange = async (file?: File) => {
    if (!file) return;
    setError('');

    try {
      const imageUrl = await imageFileToDataUrl(file);
      setFormData({ ...formData, imageUrl });
    } catch {
      setError('Failed to read selected image');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    if (!editingProduct) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      religion: formData.religion,
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl || undefined,
    };

    try {
      if (editingProduct.id === 'new') {
        await marketplaceApi.createProduct(payload);
      } else {
        await marketplaceApi.updateProduct(editingProduct.id, payload);
      }
      resetForm();
      await loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await marketplaceApi.deleteProduct(productId);
      await loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">My Products</h1>
          <p className="mt-1 text-sm text-slate-600">Edit details, update images, and manage inventory.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {editingProduct ? (
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">{editingProduct.id === 'new' ? 'Create' : 'Edit'} Product</h2>
            <p className="text-sm text-slate-600">{editingProduct.id === 'new' ? 'Add a new product to your shop.' : 'Update product details and inventory.'}</p>
          </div>

          <div className="space-y-3">
            <ProductInput label="Title" value={formData.title} onChange={(value) => setFormData({ ...formData, title: value })} required />
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Religion
              <select
                value={formData.religion}
                onChange={(event) => setFormData({ ...formData, religion: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              >
                {RELIGIONS.map((religion) => (
                  <option key={religion} value={religion}>{religion.charAt(0).toUpperCase() + religion.slice(1)}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <ProductInput label="Price (ETB)" type="number" min="0" step="0.01" value={formData.price} onChange={(value) => setFormData({ ...formData, price: value })} required />
              <ProductInput label="Stock" type="number" min="0" step="1" value={formData.stock} onChange={(value) => setFormData({ ...formData, stock: value })} required />
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Product Image
              <div className="mt-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Selected product" className="mb-3 h-32 w-full rounded-lg object-cover" />
                ) : (
                  <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-white text-slate-400">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageChange(event.target.files?.[0])}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700"
                />
              </div>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                required
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit" isLoading={saving} className="flex-1">
              {editingProduct.id === 'new' ? 'Create Product' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Add Products</h2>
            <p className="mt-1 text-sm text-slate-600">Create a new product or select one from your catalog to edit.</p>
            <Button onClick={startCreate} leftIcon={<PackagePlus className="h-4 w-4" />} className="mt-4 w-full">
              Create New Product
            </Button>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Product Catalog</h2>
              <p className="text-sm text-slate-600">{products.length} products in your shop.</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>Loading products...</td>
                  </tr>
                ) : filteredProducts.length > 0 ? filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950">{product.title}</p>
                      <p className="line-clamp-1 text-xs text-slate-500">{product.description}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{product.category}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatETB(product.price)}</td>
                    <td className="px-4 py-3 text-slate-700">{product.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => startEdit(product)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950" title="Edit product">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(product.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete product">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductInput = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) => (
  <label className="block text-sm font-medium text-slate-700">
    {label}
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      min={min}
      step={step}
      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
  </label>
);

export default VendorProductsPage;
