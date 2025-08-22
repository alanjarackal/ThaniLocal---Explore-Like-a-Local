import { useEffect, useState, useCallback, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { getProducts } from '../lib/api';
import type { Product } from '../lib/types';
import debounce from 'lodash/debounce';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { toast } from 'sonner';

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number | null }>({ min: 0, max: null });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error loading products:', error);
      setError(error.message || 'Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Set up real-time subscription for products
  useRealtimeSubscription<Product>(
    'products',
    useCallback((payload) => {
      setProducts(currentProducts => {
        switch (payload.eventType) {
          case 'INSERT':
            toast.success('New product added!');
            return [...currentProducts, payload.new];
          case 'UPDATE':
            toast.info('Product updated');
            return currentProducts.map(p => 
              p.id === payload.new.id ? payload.new : p
            );
          case 'DELETE':
            if (payload.old?.id) {
              toast.info('Product removed');
              return currentProducts.filter(p => p.id !== payload.old?.id);
            }
            return currentProducts;
          default:
            return currentProducts;
        }
      });
    }, [])
  );

  const categories = useMemo(() => 
    Array.from(new Set(products.map(p => p.category))),
    [products]
  );

  const artisans = useMemo(() => 
    Array.from(new Set(products.map(p => p.artisan_name))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesArtisan = selectedArtisan ? product.artisan_name === selectedArtisan : true;
      const matchesPrice = product.price >= priceRange.min && 
        (priceRange.max === null || product.price <= priceRange.max);
      const matchesSearch = searchQuery ? (
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        product.artisan_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;

      return matchesCategory && matchesArtisan && matchesPrice && matchesSearch;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });
  }, [products, selectedCategory, selectedArtisan, priceRange, searchQuery, sortBy]);

  const debouncedSetSearchQuery = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedArtisan(null);
    setPriceRange({ min: 0, max: null });
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Local Marketplace</h1>
            <p className="mt-2 text-gray-600">Support local artisans and discover unique handcrafted products</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button
              onClick={() => loadProducts(true)}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </button>
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search products..."
                onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artisan</label>
                <select
                  value={selectedArtisan || ''}
                  onChange={(e) => setSelectedArtisan(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Artisans</option>
                  {artisans.map(artisan => (
                    <option key={artisan} value={artisan}>{artisan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min={priceRange.min}
                    value={priceRange.max || ''}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => loadProducts()}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            No products found. Try adjusting your filters or search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}