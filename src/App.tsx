import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AiBeautyAssistant } from './components/AiBeautyAssistant';
import { NotificationToast } from './components/NotificationToast';
import { VirtualTryOnModal } from './components/VirtualTryOnModal';
import { PriceComparisonScannerModal } from './components/PriceComparisonScannerModal';
import { Footer } from './components/Footer';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import {
  Product,
  FilterState,
  WishlistItem,
  NotificationAlert,
  ProductCategory,
  StoreName,
  ShadeOption,
} from './types';
import {
  getWishlist,
  toggleWishlist,
  updateTargetPrice,
  getNotifications,
  simulatePriceDropAlert,
  dismissNotification,
} from './services/storageService';
import { SlidersHorizontal, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    brand: 'All',
    selectedStore: 'All',
    skinType: 'All',
    concern: 'All',
    priceRange: [0, 3500],
    inStockOnly: false,
    sortBy: 'lowestPrice',
  });

  // UI Drawers & Modals
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isVirtualTryOnOpen, setIsVirtualTryOnOpen] = useState(false);
  const [isPriceScannerOpen, setIsPriceScannerOpen] = useState(false);
  const [scannerInitialQuery, setScannerInitialQuery] = useState('');
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [tryOnShade, setTryOnShade] = useState<ShadeOption | null>(null);
  const [activeNav, setActiveNav] = useState('catalog');

  const handleOpenVirtualTryOn = (prod?: Product, shade?: ShadeOption) => {
    if (prod) {
      setTryOnProduct(prod);
    }
    if (shade) {
      setTryOnShade(shade);
    } else {
      setTryOnShade(null);
    }
    setIsVirtualTryOnOpen(true);
  };

  const handleOpenPriceScanner = (initialQuery?: string) => {
    setScannerInitialQuery(initialQuery || '');
    setIsPriceScannerOpen(true);
  };

  const handleAddProductToCatalog = (newProduct: Product) => {
    setProducts((prev) => {
      if (prev.some((p) => p.id === newProduct.id)) return prev;
      return [newProduct, ...prev];
    });
  };

  // Wishlist & Notifications
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [activeToastAlert, setActiveToastAlert] = useState<NotificationAlert | null>(null);

  useEffect(() => {
    setWishlist(getWishlist());
    setNotifications(getNotifications());
  }, []);

  // Unique brands
  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).sort();
  }, [products]);

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(query);
          const matchBrand = p.brand.toLowerCase().includes(query);
          const matchCat = p.category.toLowerCase().includes(query);
          const matchIng = p.ingredients.some((i) => i.toLowerCase().includes(query));
          const matchShades = p.shadeOptions?.some((s) => s.name.toLowerCase().includes(query));
          if (!matchTitle && !matchBrand && !matchCat && !matchIng && !matchShades) {
            return false;
          }
        }

        // Category
        if (filters.category !== 'All' && p.category !== filters.category) {
          return false;
        }

        // Brand
        if (filters.brand !== 'All' && p.brand !== filters.brand) {
          return false;
        }

        // Store
        if (filters.selectedStore !== 'All') {
          const hasOfferInStore = p.offers.some(
            (o) => o.storeName === filters.selectedStore && (!filters.inStockOnly || o.inStock)
          );
          if (!hasOfferInStore) return false;
        }

        // Skin Type
        if (filters.skinType !== 'All') {
          const matchSkin =
            p.skinType.includes(filters.skinType) || p.skinType.includes('All Skin Types');
          if (!matchSkin) return false;
        }

        // Concern
        if (filters.concern !== 'All') {
          if (!p.concerns.includes(filters.concern)) return false;
        }

        // In-Stock only
        if (filters.inStockOnly) {
          const anyInStock = p.offers.some((o) => o.inStock);
          if (!anyInStock) return false;
        }

        // Price Range: Check lowest available price against max price
        const inStockOffers = p.offers.filter((o) => o.inStock);
        const lowestPrice = inStockOffers.length > 0
          ? Math.min(...inStockOffers.map((o) => o.price))
          : Math.min(...p.offers.map((o) => o.price));

        if (lowestPrice > filters.priceRange[1]) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const getLowest = (p: Product) => {
          const inStock = p.offers.filter((o) => o.inStock);
          return inStock.length > 0
            ? Math.min(...inStock.map((o) => o.price))
            : Math.min(...p.offers.map((o) => o.price));
        };

        const getMaxDiscount = (p: Product) => {
          return Math.max(...p.offers.map((o) => o.discountPercent));
        };

        if (filters.sortBy === 'lowestPrice') {
          return getLowest(a) - getLowest(b);
        }
        if (filters.sortBy === 'discount') {
          return getMaxDiscount(b) - getMaxDiscount(a);
        }
        if (filters.sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (filters.sortBy === 'popular') {
          return b.reviewsCount - a.reviewsCount;
        }
        return 0;
      });
  }, [products, filters]);

  // Wishlist handlers
  const handleToggleWishlist = (productId: string) => {
    const updated = toggleWishlist(productId);
    setWishlist(updated);
  };

  const handleUpdateTargetPrice = (productId: string, newTarget: number) => {
    const updated = updateTargetPrice(productId, newTarget);
    setWishlist(updated);
  };

  // Price Drop Simulation handler
  const handleSimulateDrop = (specificProductId?: string) => {
    const alert = simulatePriceDropAlert(specificProductId);
    setNotifications(getNotifications());
    setWishlist(getWishlist());
    setActiveToastAlert(alert);
  };

  const handleDismissNotification = (id: string) => {
    const updated = dismissNotification(id);
    setNotifications(updated);
  };

  const isCurrentProductWishlisted = selectedProduct
    ? wishlist.some((item) => item.productId === selectedProduct.id)
    : false;

  const currentWishlistItem = selectedProduct
    ? wishlist.find((item) => item.productId === selectedProduct.id)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F9] text-stone-800">
      {/* Top Header */}
      <Header
        wishlist={wishlist}
        notifications={notifications}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenVirtualTryOn={() => handleOpenVirtualTryOn()}
        onOpenPriceScanner={() => handleOpenPriceScanner()}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onSelectCategory={(cat) =>
          setFilters((prev) => ({
            ...prev,
            category: cat as ProductCategory | 'All',
          }))
        }
      />

      {/* Hero Showcase with Search & Fast Filters */}
      <Hero
        searchQuery={filters.searchQuery}
        setSearchQuery={(query) => setFilters((prev) => ({ ...prev, searchQuery: query }))}
        selectedCategory={filters.category}
        setSelectedCategory={(category) =>
          setFilters((prev) => ({ ...prev, category }))
        }
        selectedStore={filters.selectedStore}
        setSelectedStore={(store) =>
          setFilters((prev) => ({ ...prev, selectedStore: store }))
        }
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        totalProductsCount={filteredProducts.length}
        onSelectProduct={(p) => setSelectedProduct(p)}
        allProducts={products}
        onOpenVirtualTryOn={() => handleOpenVirtualTryOn()}
        onOpenPriceScanner={handleOpenPriceScanner}
      />

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            availableBrands={availableBrands}
            totalMatches={filteredProducts.length}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Results Grid Area */}
          <div className="flex-1 w-full min-w-0">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-stone-900">
                  {filteredProducts.length} Products Found
                </span>
                {filters.category !== 'All' && (
                  <>
                    <span className="text-stone-300">/</span>
                    <span className="text-rose-700 font-semibold text-xs">
                      {filters.category}
                    </span>
                  </>
                )}
                {filters.selectedStore !== 'All' && (
                  <>
                    <span className="text-stone-300">/</span>
                    <span className="text-stone-600 font-medium text-xs">
                      Store: {filters.selectedStore}
                    </span>
                  </>
                )}
              </div>

              {/* Mobile Filter Button & Sort */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-stone-400 hidden sm:inline">Sort:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value as FilterState['sortBy'],
                      }))
                    }
                    className="bg-white border border-rose-200 rounded-lg py-1.5 px-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-2xs"
                  >
                    <option value="lowestPrice">Lowest Price</option>
                    <option value="discount">Highest Discount</option>
                    <option value="rating">Top Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  No products match your current filters
                </h3>
                <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">
                  Try clearing your search keyword, adjusting your price ceiling, or resetting
                  brand and skin-type filters.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      category: 'All',
                      brand: 'All',
                      selectedStore: 'All',
                      skinType: 'All',
                      concern: 'All',
                      priceRange: [0, 3500],
                      inStockOnly: false,
                      sortBy: 'lowestPrice',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    isWishlisted={wishlist.some((item) => item.productId === product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onOpenVirtualTryOn={handleOpenVirtualTryOn}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Detail & Comparison Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isWishlisted={isCurrentProductWishlisted}
          onToggleWishlist={handleToggleWishlist}
          targetPrice={currentWishlistItem?.targetAlertPrice ?? 500}
          onUpdateTargetPrice={handleUpdateTargetPrice}
          onSimulatePriceDrop={(pid) => handleSimulateDrop(pid)}
          onOpenVirtualTryOn={handleOpenVirtualTryOn}
        />
      )}

      {/* Wishlist & Price Alerts Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        products={products}
        onRemoveItem={handleToggleWishlist}
        onUpdateTargetPrice={handleUpdateTargetPrice}
        onSelectProduct={(p) => setSelectedProduct(p)}
        notifications={notifications}
        onDismissNotification={handleDismissNotification}
        onSimulatePriceDrop={() => handleSimulateDrop()}
      />

      {/* AI Beauty Assistant Drawer */}
      <AiBeautyAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Floating Price Drop Toast Notification */}
      <NotificationToast
        alert={activeToastAlert}
        onDismiss={() => setActiveToastAlert(null)}
        onViewProduct={(productId) => {
          const found = products.find((p) => p.id === productId);
          if (found) setSelectedProduct(found);
        }}
      />

      {/* Virtual Camera Try-On Studio Modal */}
      <VirtualTryOnModal
        isOpen={isVirtualTryOnOpen}
        onClose={() => setIsVirtualTryOnOpen(false)}
        products={products}
        initialProduct={tryOnProduct}
        initialShade={tryOnShade}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={(pid) => wishlist.some((item) => item.productId === pid)}
      />

      {/* Universal Price Comparison Scanner Modal */}
      <PriceComparisonScannerModal
        isOpen={isPriceScannerOpen}
        onClose={() => setIsPriceScannerOpen(false)}
        catalog={products}
        onAddProductToCatalog={handleAddProductToCatalog}
        onAddToWishlist={(product, targetPrice) => {
          const updated = toggleWishlist(product.id, targetPrice);
          setWishlist(updated);
          handleSimulateDrop(product.id);
        }}
        onOpenVirtualTryOn={(product) => {
          handleOpenVirtualTryOn(product);
        }}
        initialQuery={scannerInitialQuery}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) =>
          setFilters((prev) => ({
            ...prev,
            category: cat,
          }))
        }
        onSelectStore={(store) =>
          setFilters((prev) => ({
            ...prev,
            selectedStore: store,
          }))
        }
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />
    </div>
  );
}
