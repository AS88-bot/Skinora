import React, { useState } from 'react';
import {
  X,
  Star,
  Heart,
  ExternalLink,
  ShieldCheck,
  Truck,
  Sparkles,
  Bell,
  Check,
  CheckCircle2,
  Share2,
  Info,
  TrendingDown,
  Camera,
} from 'lucide-react';
import { Product, StoreName, RetailerOffer, ShadeOption } from '../types';
import { PriceHistoryChart } from './PriceHistoryChart';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  targetPrice: number;
  onUpdateTargetPrice: (productId: string, newTarget: number) => void;
  onSimulatePriceDrop: (productId: string) => void;
  onOpenVirtualTryOn?: (product: Product, shade?: ShadeOption) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  targetPrice,
  onUpdateTargetPrice,
  onSimulatePriceDrop,
  onOpenVirtualTryOn,
}) => {
  const [selectedShadeIndex, setSelectedShadeIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'comparison' | 'history' | 'ingredients'>('comparison');
  const [customTarget, setCustomTarget] = useState<number>(targetPrice || 500);
  const [alertSaved, setAlertSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  // In-stock offers sorted by price
  const inStockOffers = product.offers.filter((o) => o.inStock);
  const lowestOffer = inStockOffers.length > 0
    ? inStockOffers.reduce((min, o) => (o.price < min.price ? o : min), inStockOffers[0])
    : null;

  const highestOffer = inStockOffers.length > 0
    ? inStockOffers.reduce((max, o) => (o.price > max.price ? o : max), inStockOffers[0])
    : null;

  const maxSavings = highestOffer && lowestOffer ? highestOffer.price - lowestOffer.price : 0;

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTargetPrice(product.id, customTarget);
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 2500);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const selectedShade = product.shadeOptions ? product.shadeOptions[selectedShadeIndex] : null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-rose-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-white/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-lg sm:text-xl text-stone-900">
              Skinora Price Intelligence
            </span>
            <span className="hidden sm:inline text-xs text-stone-400">·</span>
            <span className="hidden sm:inline text-xs font-semibold text-rose-700 uppercase tracking-wide">
              {product.brand}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors"
              title="Copy product comparison link"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-2 rounded-full transition-colors ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-stone-500 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-8">
          {/* Top Section: Split Image + Contiguous Purchase Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-4/3 sm:aspect-square bg-gradient-to-br from-rose-50/60 to-stone-50 rounded-2xl border border-rose-100/90 overflow-hidden flex items-center justify-center p-6">
                <img
                  src={product.imageURL}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (product.secondaryImageURL && e.currentTarget.src !== product.secondaryImageURL) {
                      e.currentTarget.src = product.secondaryImageURL;
                    }
                  }}
                  className="w-full h-full object-contain mix-blend-multiply"
                />

                {/* Lowest price indicator */}
                {lowestOffer && (
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Best Price: ₹{lowestOffer.price} on {lowestOffer.storeName}</span>
                  </div>
                )}
              </div>

              {/* Shade Selector (if applicable) */}
              {product.shadeOptions && product.shadeOptions.length > 0 && (
                <div className="bg-stone-50/80 rounded-xl p-4 border border-stone-200/60">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-stone-800">
                      Select Shade / Variant:
                    </span>
                    <span className="text-rose-700 font-medium">
                      {selectedShade?.name} {selectedShade?.code ? `(${selectedShade.code})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {product.shadeOptions.map((shade, idx) => (
                      <button
                        key={shade.name}
                        onClick={() => setSelectedShadeIndex(idx)}
                        className={`w-7 h-7 rounded-full transition-transform border-2 relative shadow-xs ${
                          selectedShadeIndex === idx
                            ? 'scale-115 border-rose-600 ring-2 ring-rose-200'
                            : 'border-white hover:scale-105'
                        }`}
                        style={{ backgroundColor: shade.hex }}
                        title={shade.name}
                      >
                        {selectedShadeIndex === idx && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {onOpenVirtualTryOn && (
                    <button
                      type="button"
                      onClick={() => onOpenVirtualTryOn(product, selectedShade || undefined)}
                      className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Try on {selectedShade?.name || 'this shade'} with Camera</span>
                      <span className="bg-white/20 text-white text-[9px] px-1 rounded uppercase font-extrabold tracking-wider">
                        Live AR
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Product Meta & Highlights Column */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 uppercase tracking-widest mb-1.5">
                  <span>{product.brand}</span>
                  <span>·</span>
                  <span>{product.category}</span>
                  {product.volume && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{product.volume}</span>
                    </>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug mb-3">
                  {product.title}
                </h1>

                {/* Ratings & reviews */}
                <div className="flex items-center gap-3 text-xs text-stone-600 mb-4">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-800 font-semibold border border-amber-200/60">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{product.rating}</span>
                  </div>
                  <span>{product.reviewsCount.toLocaleString()} verified customer reviews</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    100% Genuine Retailers
                  </span>
                </div>

                {/* Direct Jump to Price History & Genuine Discount Check */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50/80 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>View 30d/90d Price History &amp; Verify Discount</span>
                  </button>
                  {product.priceAnalytics && (
                    <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                      {product.priceAnalytics.dealVerdict}
                    </span>
                  )}
                </div>

                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {product.description}
                </p>
              </div>

              {/* Skin-Type Suitability Tags */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Skin Suitability:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.skinType.map((st) => (
                    <span
                      key={st}
                      className="bg-rose-50 text-rose-900 border border-rose-200/80 text-xs px-2.5 py-1 rounded-md font-medium"
                    >
                      {st}
                    </span>
                  ))}
                  {product.concerns.map((c) => (
                    <span
                      key={c}
                      className="bg-stone-100 text-stone-700 border border-stone-200 text-xs px-2.5 py-1 rounded-md"
                    >
                      Target: {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Highlights list */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Key Benefits & Formulation:
                </span>
                <ul className="text-xs text-stone-600 space-y-1">
                  {product.keyHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Drop Alert Inline Setter */}
              <div className="bg-gradient-to-r from-rose-50/90 via-pink-50/50 to-white rounded-xl p-4 border border-rose-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-stone-900">
                      Set Price Drop Alert
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    Current Best: ₹{lowestOffer?.price ?? 'N/A'}
                  </span>
                </div>

                <form onSubmit={handleSaveAlert} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={customTarget}
                      onChange={(e) => setCustomTarget(Number(e.target.value))}
                      placeholder="Target price in INR"
                      className="w-full bg-white pl-7 pr-3 py-2 text-xs font-mono font-semibold rounded-lg border border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                  >
                    {alertSaved ? 'Saved Target!' : 'Set Target Alert'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSimulatePriceDrop(product.id)}
                    className="px-3 py-2 text-xs font-medium text-rose-800 bg-white hover:bg-rose-100/70 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
                    title="Simulate an instant price drop event for this product"
                  >
                    Test Drop Alert
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Details Section */}
          <div className="border-b border-rose-100 flex items-center gap-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>Live Retailer Price Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>Price History</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                30d &amp; 90d Recharts
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ingredients')}
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'ingredients'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>Ingredients &amp; Safety</span>
            </button>
          </div>

          {/* Tab 1: Live Retailer Comparison Table */}
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    Live Offers across Nykaa, Sephora, Dot & Key, and Myntra
                  </h3>
                  <p className="text-xs text-stone-500">
                    Direct store prices updated frequently. Click to shop directly on retailer portals.
                  </p>
                </div>
                {maxSavings > 0 && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                    Save up to ₹{maxSavings} by choosing the best store!
                  </div>
                )}
              </div>

              {/* Responsive Table / Cards */}
              <div className="overflow-x-auto border border-rose-100 rounded-2xl bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50/60 text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-rose-100">
                    <tr>
                      <th className="py-3 px-4">Retailer</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">MRP & Discount</th>
                      <th className="py-3 px-4">Delivery & Perks</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-right">Shop Outbound</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {product.offers.map((offer) => {
                      const isBestPrice = offer.storeName === lowestOffer?.storeName && offer.inStock;

                      return (
                        <tr
                          key={offer.storeName}
                          className={`hover:bg-rose-50/40 transition-colors ${
                            isBestPrice ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          {/* Store Name & Logo */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                                  offer.storeName === 'Nykaa'
                                    ? 'bg-pink-100 text-[#E80071]'
                                    : offer.storeName === 'Sephora'
                                    ? 'bg-stone-900 text-white'
                                    : offer.storeName === 'Dot & Key'
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'bg-rose-100 text-[#FF3F6C]'
                                }`}
                              >
                                {offer.storeName[0]}
                              </span>
                              <div>
                                <span className="font-bold text-stone-900 text-sm block">
                                  {offer.storeName}
                                </span>
                                {isBestPrice && (
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                    LOWEST PRICE
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Current Price */}
                          <td className="py-3.5 px-4 font-mono font-bold text-base text-stone-900 tabular-nums">
                            {offer.inStock ? `₹${offer.price}` : '—'}
                          </td>

                          {/* MRP & Discount */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="line-through text-stone-400 font-mono">
                                ₹{offer.mrp}
                              </span>
                              {offer.discountPercent > 0 && (
                                <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                                  {offer.discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Delivery & Perk */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                              <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{offer.deliveryEstimate}</span>
                            </div>
                            {offer.perk && (
                              <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                                {offer.perk}
                              </div>
                            )}
                          </td>

                          {/* Stock Status */}
                          <td className="py-3.5 px-4">
                            {offer.inStock ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-stone-400 text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                                Out of Stock
                              </span>
                            )}
                          </td>

                          {/* Shop Outbound Button */}
                          <td className="py-3.5 px-4 text-right">
                            {offer.inStock ? (
                              <a
                                href={offer.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all shadow-xs ${
                                  isBestPrice
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                                }`}
                              >
                                <span>Shop on {offer.storeName}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <button
                                disabled
                                className="px-3.5 py-2 rounded-lg font-medium text-xs bg-stone-100 text-stone-400 cursor-not-allowed"
                              >
                                Unavailable
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Interactive Price History Chart */}
          {activeTab === 'history' && (
            <div>
              <PriceHistoryChart
                analytics={product.priceAnalytics}
                currentLowestPrice={lowestOffer?.price ?? product.offers[0].price}
              />
            </div>
          )}

          {/* Tab 3: Ingredients & Clinical Formulation */}
          {activeTab === 'ingredients' && (
            <div className="bg-stone-50/70 rounded-2xl p-6 border border-stone-200/80 space-y-4">
              <h3 className="font-semibold text-stone-900 text-sm">
                Full Formulation & Ingredients
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Skinora verifies cosmetic formulas for non-comedogenic compliance and ingredient transparency.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="bg-white px-3 py-1 rounded-md text-xs font-medium text-stone-700 border border-stone-200 shadow-xs"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
