import React, { useState } from 'react';
import { Search, Sparkles, X, Check, ShieldCheck, Tag, TrendingDown, ArrowRight, Camera } from 'lucide-react';
import { Product, ProductCategory, StoreName } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory | 'All';
  setSelectedCategory: (category: ProductCategory | 'All') => void;
  selectedStore: StoreName | 'All';
  setSelectedStore: (store: StoreName | 'All') => void;
  onOpenAiAssistant: () => void;
  totalProductsCount: number;
  onSelectProduct?: (product: Product) => void;
  allProducts?: Product[];
  onOpenVirtualTryOn?: () => void;
  onOpenPriceScanner?: (initialQuery?: string) => void;
}

interface ComparisonDuel {
  id: string;
  name: string;
  badge: string;
  productAId: string;
  productBId: string;
  verdict: string;
}

const COMPARISON_DUELS: ComparisonDuel[] = [
  {
    id: 'duel-1',
    name: 'Hydration vs Dewy Glow',
    badge: 'Skincare Duel',
    productAId: 'prod-dot-key-water-gel',
    productBId: 'prod-lakme-lumi-cream',
    verdict: 'Dot & Key locks 72h oil-free hydration (₹369 on Nykaa). Lakmé adds instant pearl strobe radiance (₹356 on Myntra).',
  },
  {
    id: 'duel-2',
    name: 'Matte Ink vs Gloss',
    badge: 'Lipstick Duel',
    productAId: 'prod-maybelline-superstay',
    productBId: 'prod-sephora-collection-gloss-shine',
    verdict: 'Maybelline delivers 16h smudge-proof ink wear (₹454 on Myntra). Sephora Collection offers mango-butter French luxury shine (₹990 on Sephora).',
  },
  {
    id: 'duel-3',
    name: 'Active vs Cica',
    badge: 'Serum Duel',
    productAId: 'prod-ordinary-niacinamide',
    productBId: 'prod-dot-key-cica-serum',
    verdict: 'The Ordinary provides pure 10% clinical zinc formula (₹585 on Nykaa). Dot & Key adds soothing Centella for acne-prone skin (₹499 on Nykaa).',
  },
];

const CATEGORIES: { label: ProductCategory; iconLabel: string }[] = [
  { label: 'Skincare', iconLabel: 'Glow Creams & Gels' },
  { label: 'Lipsticks', iconLabel: 'Velvets, Mattes & Tints' },
  { label: 'Makeup', iconLabel: 'Foundations & Strobe' },
  { label: 'Haircare', iconLabel: 'Oils & Silk Serums' },
  { label: 'Personal Hygiene', iconLabel: 'Roll-Ons & Intimate' },
  { label: 'Serums', iconLabel: 'Niacinamide, Cica & Vit C' },
];

const RETAILERS: {
  name: StoreName;
  tagline: string;
  accentBg: string;
  accentText: string;
  logoInitial: string;
}[] = [
  {
    name: 'Nykaa',
    tagline: 'Pink Friday & Express 24h',
    accentBg: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
    accentText: 'text-[#E80071]',
    logoInitial: 'N',
  },
  {
    name: 'Sephora',
    tagline: 'Luxury Brands & Beauty Pass',
    accentBg: 'bg-stone-50 hover:bg-stone-100 border-stone-300',
    accentText: 'text-stone-900',
    logoInitial: 'S',
  },
  {
    name: 'Dot & Key',
    tagline: 'Direct Brand Perks & B2G1',
    accentBg: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
    accentText: 'text-teal-700',
    logoInitial: 'D',
  },
  {
    name: 'Myntra',
    tagline: 'Beauty Carnival Deals',
    accentBg: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
    accentText: 'text-[#FF3F6C]',
    logoInitial: 'M',
  },
];

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStore,
  setSelectedStore,
  onOpenAiAssistant,
  totalProductsCount,
  onSelectProduct,
  allProducts,
  onOpenVirtualTryOn,
  onOpenPriceScanner,
}) => {
  const [activeDuelId, setActiveDuelId] = useState<string>('duel-1');
  const catalog = allProducts && allProducts.length > 0 ? allProducts : INITIAL_PRODUCTS;
  const currentDuel = COMPARISON_DUELS.find((d) => d.id === activeDuelId) || COMPARISON_DUELS[0];
  const prodA = catalog.find((p) => p.id === currentDuel.productAId) || catalog[1] || INITIAL_PRODUCTS[1];
  const prodB = catalog.find((p) => p.id === currentDuel.productBId) || catalog[5] || INITIAL_PRODUCTS[5];

  const getLowest = (p: Product) => {
    const inStock = p.offers.filter((o) => o.inStock);
    return inStock.length > 0
      ? inStock.reduce((min, o) => (o.price < min.price ? o : min), inStock[0])
      : p.offers[0];
  };

  const lowestA = getLowest(prodA);
  const lowestB = getLowest(prodB);

  const isQueryUrl = /^(https?:\/\/|[a-z0-9-]+\.(com|in|co|net))/i.test(searchQuery.trim());

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-[#FFF9F9] border-b border-rose-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text & Search Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 uppercase tracking-widest mb-3">
              <span>Smart Beauty Intelligence</span>
              <span aria-hidden="true">·</span>
              <span>6 Top Retailers Compared</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15] mb-4 text-balance">
              Find the Lowest Price on Your Favorite Cosmetics.
            </h1>

            <p className="text-stone-600 text-base sm:text-lg mb-6 max-w-2xl leading-relaxed">
              Real-time cross-store price comparison across{' '}
              <strong className="text-stone-800 font-semibold">Nykaa, Sephora, Dot & Key, Myntra, Amazon</strong>, and{' '}
              <strong className="text-stone-800 font-semibold">Tira</strong>. Track 90-day price drops
              and buy from the retailer with the lowest cost.
            </p>

            {/* Price Matcher Feature Banner */}
            <div className="mb-4 max-w-xl p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white shadow-md border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    <span>Universal Price Matcher</span>
                    <span>·</span>
                    <span>Nykaa · Myntra · Amazon · Tira</span>
                  </div>
                  <p className="text-xs font-semibold text-stone-100">
                    Paste any product link or name to find where to buy at least cost
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenPriceScanner?.(searchQuery || undefined)}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-xs"
              >
                <span>Compare Prices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Smart Search Bar */}
            <div className="relative mb-6 max-w-xl">
              <div className="relative flex items-center shadow-sm rounded-xl bg-white border border-rose-200 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Paste URL or search lipstick, moisturizer, serums, Dot & Key, Maybelline..."
                  className="w-full py-3.5 pl-3 pr-10 text-sm text-stone-900 bg-transparent placeholder-stone-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 mr-3 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* URL Detected Alert */}
              {isQueryUrl && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-xs animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-emerald-950 font-semibold truncate">
                    <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Store link detected! Compare multi-store prices?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenPriceScanner?.(searchQuery)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shrink-0 shadow-2xs flex items-center gap-1"
                  >
                    <span>Compare Stores</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {searchQuery && !isQueryUrl && (
                <div className="text-xs text-stone-500 mt-2 flex items-center justify-between">
                  <span>
                    Filtering results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenPriceScanner?.(searchQuery)}
                      className="text-emerald-700 hover:text-emerald-800 font-bold underline"
                    >
                      Compare prices for &ldquo;{searchQuery}&rdquo; →
                    </button>
                    <span>·</span>
                    <span>{totalProductsCount} items match</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Retailer Filter Selector */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Filter by preferred store:</span>
                {selectedStore !== 'All' && (
                  <button
                    onClick={() => setSelectedStore('All')}
                    className="text-rose-600 hover:text-rose-700 underline text-xs"
                  >
                    Show all stores
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {RETAILERS.map((ret) => {
                  const isActive = selectedStore === ret.name;
                  return (
                    <button
                      key={ret.name}
                      onClick={() => setSelectedStore(isActive ? 'All' : ret.name)}
                      className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                        isActive
                          ? 'border-rose-600 bg-rose-50/80 shadow-xs ring-1 ring-rose-500'
                          : `${ret.accentBg}`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-xs ${ret.accentText}`}>
                          {ret.name}
                        </span>
                        {isActive && <Check className="w-3.5 h-3.5 text-rose-600" />}
                      </div>
                      <span className="text-[11px] text-stone-500 truncate leading-tight">
                        {ret.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Key trust badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-stone-500 pt-2 border-t border-rose-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Genuine Retailer Feeds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span>30 & 90-Day Price History</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Green Lowest Price Badges</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Spotlight: Authentic Head-to-Head Comparison */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-rose-200/90 bg-white flex flex-col justify-between">
              {/* Header with duel selector */}
              <div className="p-3.5 bg-gradient-to-r from-rose-50 via-[#FFF5F5] to-rose-50/50 border-b border-rose-100">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                      Featured Daily Comparison
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Save Up To 35%
                  </span>
                </div>

                {/* Quick duel tabs */}
                <div className="grid grid-cols-3 gap-1 bg-white/90 p-1 rounded-xl border border-rose-100 text-[11px] font-medium shadow-2xs">
                  {COMPARISON_DUELS.map((duel) => {
                    const isCurrent = duel.id === activeDuelId;
                    return (
                      <button
                        key={duel.id}
                        type="button"
                        onClick={() => setActiveDuelId(duel.id)}
                        className={`py-1 px-1 rounded-lg text-center truncate transition-all text-[11px] ${
                          isCurrent
                            ? 'bg-rose-600 text-white font-semibold shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-rose-50/70'
                        }`}
                      >
                        {duel.badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Head-to-Head Product Cards with EXACT Photos and Names */}
              <div className="p-3.5 relative">
                <div className="grid grid-cols-2 gap-2.5 relative items-stretch">
                  {/* Product A */}
                  <div
                    onClick={() => onSelectProduct?.(prodA)}
                    className="group/card cursor-pointer bg-[#FFFBFB] hover:bg-rose-50/30 border border-rose-100 hover:border-rose-300 rounded-xl p-2.5 flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs"
                  >
                    <div>
                      <div className="relative w-full h-28 sm:h-32 bg-white rounded-lg p-2 mb-2 flex items-center justify-center border border-rose-50 overflow-hidden">
                        <img
                          src={prodA.imageURL}
                          alt={prodA.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (prodA.secondaryImageURL) {
                              (e.currentTarget as HTMLImageElement).src = prodA.secondaryImageURL;
                            }
                          }}
                          className="w-full h-full object-contain mix-blend-multiply group-hover/card:scale-106 transition-transform duration-300"
                        />
                        <span className="absolute top-1 left-1 text-[9px] font-bold text-rose-700 bg-rose-50/90 border border-rose-200 px-1.5 py-0.5 rounded shadow-2xs">
                          {prodA.brand}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-2 leading-snug group-hover/card:text-rose-700 transition-colors">
                        {prodA.title}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-rose-100/70">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-stone-900">₹{lowestA.price}</span>
                        <span className="text-[10px] text-stone-400 line-through">₹{lowestA.mrp}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 mt-0.5 flex items-center justify-between">
                        <span>on {lowestA.storeName}</span>
                        <span className="bg-emerald-50 px-1 rounded border border-emerald-200">
                          {lowestA.discountPercent}% OFF
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct?.(prodA);
                        }}
                        className="mt-2 w-full py-1 text-[11px] font-semibold text-rose-700 bg-white hover:bg-rose-100/80 border border-rose-200 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-2xs"
                      >
                        <span>Compare 4 Stores</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Floating VS Badge in center */}
                  <div className="absolute left-1/2 top-14 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md ring-3 ring-white">
                      VS
                    </span>
                  </div>

                  {/* Product B */}
                  <div
                    onClick={() => onSelectProduct?.(prodB)}
                    className="group/card cursor-pointer bg-[#FFFBFB] hover:bg-rose-50/30 border border-rose-100 hover:border-rose-300 rounded-xl p-2.5 flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs"
                  >
                    <div>
                      <div className="relative w-full h-28 sm:h-32 bg-white rounded-lg p-2 mb-2 flex items-center justify-center border border-rose-50 overflow-hidden">
                        <img
                          src={prodB.imageURL}
                          alt={prodB.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (prodB.secondaryImageURL) {
                              (e.currentTarget as HTMLImageElement).src = prodB.secondaryImageURL;
                            }
                          }}
                          className="w-full h-full object-contain mix-blend-multiply group-hover/card:scale-106 transition-transform duration-300"
                        />
                        <span className="absolute top-1 left-1 text-[9px] font-bold text-rose-700 bg-rose-50/90 border border-rose-200 px-1.5 py-0.5 rounded shadow-2xs">
                          {prodB.brand}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-2 leading-snug group-hover/card:text-rose-700 transition-colors">
                        {prodB.title}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-rose-100/70">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-stone-900">₹{lowestB.price}</span>
                        <span className="text-[10px] text-stone-400 line-through">₹{lowestB.mrp}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 mt-0.5 flex items-center justify-between">
                        <span>on {lowestB.storeName}</span>
                        <span className="bg-emerald-50 px-1 rounded border border-emerald-200">
                          {lowestB.discountPercent}% OFF
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct?.(prodB);
                        }}
                        className="mt-2 w-full py-1 text-[11px] font-semibold text-rose-700 bg-white hover:bg-rose-100/80 border border-rose-200 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-2xs"
                      >
                        <span>Compare 4 Stores</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Verdict Note */}
                <div className="mt-3 p-2.5 bg-rose-50/70 rounded-xl border border-rose-100 text-[11px] text-stone-600 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-stone-700">{currentDuel.verdict}</p>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="px-3.5 py-2.5 bg-stone-50 border-t border-rose-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-medium truncate mr-2">
                  Test shades on yourself:
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenVirtualTryOn && (
                    <button
                      type="button"
                      onClick={onOpenVirtualTryOn}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-100/70 hover:bg-rose-200/80 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Camera className="w-3 h-3 text-rose-600" />
                      <span>Camera Try-On</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenAiAssistant}
                    className="px-2 py-1 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-rose-600" />
                    <span>AI Match</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Beauty Categories Bar */}
        <div className="mt-8 pt-6 border-t border-rose-100/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Browse Categories
            </h2>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
              >
                Reset to All Categories
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(isSelected ? 'All' : cat.label)}
                  className={`p-3 text-left rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white hover:bg-rose-50/70 text-stone-800 border-rose-100 hover:border-rose-200'
                  }`}
                >
                  <div className="font-semibold text-sm leading-tight mb-0.5">{cat.label}</div>
                  <div
                    className={`text-[11px] truncate ${
                      isSelected ? 'text-rose-100' : 'text-stone-400'
                    }`}
                  >
                    {cat.iconLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
