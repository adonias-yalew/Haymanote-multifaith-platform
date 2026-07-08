import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ImagePlus, PackagePlus, Search, SlidersHorizontal, Star,
  ShoppingCart, BookOpen, Sparkles, ShoppingBag, Heart, Store,
  HeartOff, X,
} from 'lucide-react';
import type { Product } from '../types/index';
import { useAuth } from '../hooks/useAuth.tsx';
import { marketplaceApi } from '../services/api';
import Button from '../components/Button';
import { formatETB } from '../utils/marketplace';
import Badge from '../components/Badge';

const themeStyles = {
  orthodox: {
    heroImg: '/orthodox/orthodox-market-hero.jpg',
    lightBg: 'bg-amber-50/60', border: 'border-amber-100',
    borderHover: 'hover:border-amber-200', text: 'text-amber-900',
    textMuted: 'text-amber-700', accent: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700', ring: 'focus:ring-amber-500',
    iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
    heroOverlay: 'bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-amber-950/30',
    badgeStyles: 'bg-amber-50 text-amber-700 border-amber-200',
    bannerTitle: 'Orthodox Sacred Arts & Literature',
    bannerDesc: 'Explore curated icons, prayer books, incense, and vestments crafted with devotion and holy tradition.',
    primaryColor: 'text-amber-600', buttonBg: 'bg-amber-600 hover:bg-amber-700',
  },
  muslim: {
    heroImg: '/muslim/muslim-community-hero.jpg',
    lightBg: 'bg-emerald-50/60', border: 'border-emerald-100',
    borderHover: 'hover:border-emerald-200', text: 'text-emerald-900',
    textMuted: 'text-emerald-700', accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500',
    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    heroOverlay: 'bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-emerald-950/30',
    badgeStyles: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bannerTitle: 'Halal Essentials & Literature',
    bannerDesc: 'Browse high-quality prayer rugs, Islamic books, modest apparel, and wellness items for your household.',
    primaryColor: 'text-emerald-600', buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
  },
  protestant: {
    heroImg: '/protestant/protestant-community-hero.jpg',
    lightBg: 'bg-blue-50/60', border: 'border-blue-100',
    borderHover: 'hover:border-blue-200', text: 'text-blue-900',
    textMuted: 'text-blue-700', accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700', ring: 'focus:ring-blue-500',
    iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
    heroOverlay: 'bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-blue-950/30',
    badgeStyles: 'bg-blue-50 text-blue-700 border-blue-200',
    bannerTitle: 'Christian Media, Apparel & Resources',
    bannerDesc: 'Discover Bibles, spiritual literature, worship materials, and faith-inspired apparel to support your daily walk.',
    primaryColor: 'text-blue-600', buttonBg: 'bg-blue-600 hover:bg-blue-700',
  },
};

const defaultCategories = {
  orthodox: [
    { name: 'Icons & Art', icon: Sparkles, desc: 'Hand-painted and replica sacred icons' },
    { name: 'Spiritual Books', icon: BookOpen, desc: 'Prayer books, lives of saints, and theology' },
    { name: 'Incense & Candles', icon: ShoppingBag, desc: 'Pure beeswax candles and premium incense resins' },
    { name: 'Apparel & Crosses', icon: Store, desc: 'Traditional crosses, prayer ropes, and vestments' },
  ],
  muslim: [
    { name: 'Prayer Rugs & Beads', icon: Sparkles, desc: 'Premium rugs and hand-crafted Tasbihs' },
    { name: 'Islamic Literature', icon: BookOpen, desc: 'Quran, Hadith, and educational studies' },
    { name: 'Modest Fashion', icon: Store, desc: 'Abayas, hijabs, and traditional attire' },
    { name: 'Halal Wellness', icon: ShoppingBag, desc: 'Attar oils, black seed products, and natural soaps' },
  ],
  protestant: [
    { name: 'Bibles & Devotionals', icon: BookOpen, desc: 'Study Bibles, daily journals, and devotionals' },
    { name: 'Worship & Media', icon: Sparkles, desc: 'Music sheets, worship resources, and media' },
    { name: 'Faith Apparel', icon: Store, desc: 'Scripture-themed t-shirts, hoodies, and accessories' },
    { name: 'Gifts & Decoration', icon: ShoppingBag, desc: 'Christian home decor, keychains, and tokens' },
  ],
};

const PRODUCT_CATEGORIES = [
  'All', 'Books', 'Icons', 'Prayer Items', 'Apparel', 'Accessories',
  'Candles', 'Music', 'Teaching Materials', 'Other',
];

const MarketplacePage = () => {
  const { user } = useAuth();
  const isVendor = user?.role === 'vendor';
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'priceLow' | 'priceHigh'>('latest');
  const [totalCount, setTotalCount] = useState(0);

  const religionKey = (user?.religion?.toLowerCase() || 'orthodox') as keyof typeof themeStyles;
  const theme = themeStyles[religionKey] || themeStyles.orthodox;
  const categories = defaultCategories[religionKey] || defaultCategories.orthodox;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await marketplaceApi.getProducts({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sortBy,
      });
      const data = response.data;
      setProducts(data.products || data.data || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await marketplaceApi.getWishlist();
      const items = res.data.data || [];
      setWishlistIds(new Set(items.map((i: any) => i.productId)));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchProducts(); }, [searchQuery, selectedCategory, sortBy]);
  useEffect(() => { fetchWishlist(); }, []);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (wishlistIds.has(productId)) {
        await marketplaceApi.removeFromWishlist(productId);
        setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
      } else {
        await marketplaceApi.addToWishlist(productId);
        setWishlistIds(prev => new Set(prev).add(productId));
      }
    } catch { /* ignore */ }
  };

  const filteredProducts = useMemo(() => {
    // Filter by selected category from the category grid
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const getReligionDisplay = (religion?: string) => {
    const map: Record<string, string> = { orthodox: 'Orthodox', muslim: 'Muslim', protestant: 'Protestant' };
    return map[religion?.toLowerCase() || 'orthodox'] || 'Orthodox';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-16">
      {/* Hero Banner */}
      <div className="relative w-full h-[360px] lg:h-[400px] overflow-hidden mb-12 shadow-sm rounded-b-3xl">
        <img src={theme.heroImg} alt={`${getReligionDisplay(user?.religion)} Marketplace`} className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 ${theme.heroOverlay}`} />
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-10 w-full min-w-0">
          <div className="max-w-3xl w-full min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${theme.badgeStyles} backdrop-blur-sm bg-white/10`}>
                {getReligionDisplay(user?.religion)} community store
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-md">{theme.bannerTitle}</h1>
            <p className="text-sm sm:text-base text-slate-200 font-medium mb-6 max-w-xl drop-shadow leading-relaxed">{theme.bannerDesc}</p>
            <div className="flex flex-wrap items-center gap-3">
              {isVendor && (
                <Link to="/vendor/products">
                  <button className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-md transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5 ${theme.accent} ${theme.accentHover}`}>
                    <PackagePlus className="w-4 h-4" /> Add Product
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Categories Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className={`w-1.5 h-6 rounded-full ${theme.accent}`} />
              Browse by Category
            </h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className={`text-xs font-semibold ${theme.primaryColor} hover:underline flex items-center gap-1`}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                  className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 hover:shadow-md group relative overflow-hidden ${
                    isSelected
                      ? `${theme.lightBg} ${theme.border} ring-2 ring-offset-2 ${user?.religion === 'muslim' ? 'ring-emerald-500' : user?.religion === 'protestant' ? 'ring-blue-500' : 'ring-amber-500'}`
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${isSelected ? 'bg-white' : theme.iconBg}`}>
                    <Icon className={`w-5 h-5 ${theme.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">{cat.name}</h3>
                  <p className="text-xs text-slate-500 leading-normal">{cat.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filters Row */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-slate-50/50 focus:bg-white transition-all ${theme.ring}`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sort by</span>
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer"
            >
              <option value="latest">Newly Listed</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
            <span className="text-xs text-slate-400">{totalCount} items</span>
          </div>
        </section>

        {/* Product Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white animate-pulse">
                <div className="h-56 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-16" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-6 bg-slate-200 rounded w-20 pt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300/80 flex flex-col h-full"
                >
                  <div className="relative h-56 w-full bg-slate-50 overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                        <ImagePlus className="h-12 w-12 stroke-[1.2]" />
                      </div>
                    )}
                    {/* Wishlist button */}
                    <button
                      onClick={e => toggleWishlist(e, product.id)}
                      className="absolute right-3 top-3 z-10 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-100 p-2 shadow-sm transition-all hover:scale-110"
                      title={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {wishlistIds.has(product.id) ? (
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      ) : (
                        <Heart className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {/* Discount badge */}
                    {product.discountPercent && product.discountPercent > 0 && (
                      <div className="absolute left-3 top-3 rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-sm">
                        -{product.discountPercent}%
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute left-3 bottom-3 rounded-lg bg-red-600/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        Sold Out
                      </div>
                    )}
                    {/* Rating */}
                    {product.averageRating && product.averageRating > 0 && (
                      <div className="absolute right-3 bottom-3 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{product.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.badgeStyles}`}>
                        {product.category}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-slate-950 transition-colors line-clamp-1" title={product.title}>
                        {product.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-normal" title={product.description}>
                        {product.description}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Price</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-slate-900">
                            {product.discountPercent && product.discountPercent > 0
                              ? formatETB(product.price * (1 - product.discountPercent / 100))
                              : formatETB(product.price)
                            }
                          </span>
                          {product.discountPercent && product.discountPercent > 0 && (
                            <span className="text-sm text-slate-400 line-through">{formatETB(product.price)}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{product.totalSold || 0} sold</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white py-20 text-center shadow-sm max-w-xl mx-auto px-6">
            <div className={`w-16 h-16 rounded-2xl ${theme.iconBg} flex items-center justify-center mx-auto mb-5`}>
              <ImagePlus className={`h-8 w-8 ${theme.iconColor} stroke-[1.5]`} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No items listed yet</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Vendors are currently cataloging quality products for the {getReligionDisplay(user?.religion)} faith community.
            </p>
            {isVendor && (
              <Link to="/vendor/products"><Button leftIcon={<PackagePlus className="h-4 w-4" />}>List the First Product</Button></Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketplacePage;
