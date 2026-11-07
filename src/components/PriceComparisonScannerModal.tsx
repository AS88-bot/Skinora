import React, { useState } from 'react';
import {
  X,
  Search,
  ExternalLink,
  Tag,
  Copy,
  Check,
  TrendingDown,
  Sparkles,
  ShoppingBag,
  Bell,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  PlusCircle,
} from 'lucide-react';
import {
  Product,
  ScannedProductComparison,
  ScannedOffer,
  StoreName,
} from '../types';
import {
  compareProductPrices,
  POPULAR_SCAN_SAMPLES,
  QuickScanSample,
} from '../services/priceComparisonService';

interface PriceComparisonScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: Product[];
  onAddProductToCatalog: (product: Product) => void;
  onAddToWishlist: (product: Product, targetPrice?: number) => void;
  onOpenVirtualTryOn?: (product: Product) => void;
  initialQuery?: string;
}

export const PriceComparisonScannerModal: React.FC<PriceComparisonScannerModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onAddProductToCatalog,
  onAddToWishlist,
  onOpenVirtualTryOn,
  initialQuery = '',
}) => {
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isScanning, setIsScanning] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ScannedProductComparison | null>(null);
  const [scanStepText, setScanStepText] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [addedToCatalog, setAddedToCatalog] = useState(false);
  const [alertSaved, setAlertSaved] = useState(false);
  const [customAlertPrice, setCustomAlertPrice] = useState<number>(0);

  if (!isOpen) return null;

  const handleScan = async (queryToRun?: string) => {
    const q = (queryToRun ?? inputQuery).trim();
    if (!q) return;

    if (queryToRun) {
      setInputQuery(queryToRun);
    }

    setIsScanning(true);
    setComparisonResult(null);
    setAddedToCatalog(false);
    setAlertSaved(false);

    // Realistic scanning step animations
    setScanStepText('Analyzing product link & brand specifications...');
    await new Promise((r) => setTimeout(r, 220));

    setScanStepText('Querying Nykaa, Myntra, Amazon Beauty & Tira...');
    await new Promise((r) => setTimeout(r, 280));

    setScanStepText('Checking Sephora India & Official Brand Stores for coupon codes...');
    await new Promise((r) => setTimeout(r, 220));

    try {
      const result = await compareProductPrices(q, catalog);
      setComparisonResult(result);
      setCustomAlertPrice(Math.round((result.lowestOffer.effectivePriceWithCoupon ?? result.lowestOffer.price) * 0.95));
    } catch {
      // Fallback
    } finally {
      setIsScanning(false);
      setScanStepText('');
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleSaveToCatalog = () => {
    if (!comparisonResult) return;
    onAddProductToCatalog(comparisonResult.product);
    setAddedToCatalog(true);
  };

  const handleSetAlert = () => {
    if (!comparisonResult) return;
    onAddToWishlist(comparisonResult.product, customAlertPrice);
    setAlertSaved(true);
  };

  const getStoreAccent = (storeName: StoreName) => {
    switch (storeName) {
      case 'Nykaa':
        return { bg: 'bg-[#E80071]', text: 'text-[#E80071]', lightBg: 'bg-pink-50' };
      case 'Myntra':
        return { bg: 'bg-[#FF3F6C]', text: 'text-[#FF3F6C]', lightBg: 'bg-rose-50' };
      case 'Amazon':
        return { bg: 'bg-[#FF9900]', text: 'text-amber-700', lightBg: 'bg-amber-50' };
      case 'Tira':
        return { bg: 'bg-[#7E22CE]', text: 'text-purple-700', lightBg: 'bg-purple-50' };
      case 'Sephora':
        return { bg: 'bg-stone-900', text: 'text-stone-900', lightBg: 'bg-stone-100' };
      case 'Dot & Key':
        return { bg: 'bg-teal-700', text: 'text-teal-700', lightBg: 'bg-teal-50' };
      case 'Official Store':
      default:
        return { bg: 'bg-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-rose-900 via-rose-800 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-rose-300">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-rose-300">
                <span>Universal Price Comparison Engine</span>
                <span aria-hidden="true">·</span>
                <span>6 Top Beauty Stores</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-white tracking-tight">
                Compare Product Name or URL
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/15"
            aria-label="Close price scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar & Search Controls */}
        <div className="p-6 bg-stone-50/70 border-b border-rose-100/70">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}
            className="flex flex-col sm:flex-row gap-2.5 items-stretch"
          >
            <div className="relative flex-1 flex items-center bg-white rounded-2xl border border-stone-300 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 shadow-xs transition-all">
              <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Paste Nykaa / Amazon / Myntra URL or type product name (e.g. Laneige Lip Mask)..."
                className="w-full py-3.5 pl-3 pr-24 text-sm text-stone-900 placeholder-stone-400 bg-transparent focus:outline-none"
              />
              {inputQuery && (
                <button
                  type="button"
                  onClick={() => setInputQuery('')}
                  className="p-1 mr-2 text-stone-400 hover:text-stone-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      setInputQuery(text);
                      handleScan(text);
                    }
                  } catch {
                    // Clipboard permissions
                  }
                }}
                className="hidden sm:inline-flex text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg mr-3 hover:bg-rose-100 transition-colors shrink-0"
              >
                Paste Link
              </button>
            </div>

            <button
              type="submit"
              disabled={isScanning || !inputQuery.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-98"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Scanning Stores...</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4" />
                  <span>Compare Prices</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Click Samples */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-stone-500 font-medium mr-1 text-[11px]">Popular instant samples:</span>
            {POPULAR_SCAN_SAMPLES.map((sample: QuickScanSample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleScan(sample.query)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-stone-700 border border-stone-200 hover:border-rose-300 hover:text-rose-700 transition-colors shadow-2xs"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Scanning State */}
        {isScanning && (
          <div className="py-14 px-6 flex flex-col items-center justify-center text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Cross-Referencing Multi-Store Beauty Feeds
            </h3>
            <p className="text-sm text-rose-600 font-medium animate-pulse max-w-md">
              {scanStepText || 'Scanning live retailers...'}
            </p>
          </div>
        )}

        {/* Scan Results View */}
        {!isScanning && comparisonResult && (
          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
            {/* WINNER VERDICT BANNER */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-950 text-white p-6 shadow-xl border border-emerald-500/30">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Best Price Verified</span>
                    <span aria-hidden="true">·</span>
                    <span>Cheapest Store: {comparisonResult.bestStoreName}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white leading-tight">
                    {comparisonResult.verdictTitle}
                  </h3>

                  <p className="text-sm text-emerald-100/90 leading-relaxed">
                    {comparisonResult.verdictReason}
                  </p>

                  {/* Savings metric stats */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-white">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-emerald-300 font-semibold">Total Savings:</span>
                      <span className="text-lg font-bold text-white">
                        ₹{comparisonResult.savingsVsHighest}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        ({comparisonResult.savingsPercent}% off highest)
                      </span>
                    </div>

                    <span className="text-white/30">|</span>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-stone-300">MRP Discount:</span>
                      <span className="font-bold text-white">
                        ₹{comparisonResult.savingsVsMrp} off MRP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Buy Action */}
                <div className="flex flex-col items-stretch sm:items-end gap-3 w-full md:w-auto shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-emerald-200/80 block">Lowest checkout price:</span>
                    <span className="text-3xl font-serif font-extrabold text-white">
                      ₹{comparisonResult.lowestOffer.effectivePriceWithCoupon ?? comparisonResult.lowestOffer.price}
                    </span>
                  </div>

                  <a
                    href={comparisonResult.lowestOffer.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-stone-950 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <span>Buy on {comparisonResult.bestStoreName} (Cheapest)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {comparisonResult.recommendedCoupon && (
                    <button
                      type="button"
                      onClick={() => handleCopyCoupon(comparisonResult.recommendedCoupon!)}
                      className="text-xs text-emerald-200 hover:text-white flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedCoupon === comparisonResult.recommendedCoupon ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="font-bold text-emerald-300">Copied &ldquo;{comparisonResult.recommendedCoupon}&rdquo;</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Click to copy coupon &ldquo;<strong>{comparisonResult.recommendedCoupon}</strong>&rdquo;</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* PRODUCT SUMMARY BAR & ACTION SHORTCUTS */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3.5">
                <img
                  src={comparisonResult.product.imageURL}
                  alt={comparisonResult.product.title}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                    <span className="font-bold text-stone-900">{comparisonResult.product.brand}</span>
                    <span aria-hidden="true">·</span>
                    <span>{comparisonResult.product.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{comparisonResult.product.volume}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900 line-clamp-1">
                    {comparisonResult.product.title}
                  </h4>
                </div>
              </div>

              {/* Action Buttons: Add to Catalog / AR Try-On / Price Alert */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenVirtualTryOn && (comparisonResult.product.category === 'Lipsticks' || comparisonResult.product.category === 'Makeup') && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenVirtualTryOn(comparisonResult.product);
                      onClose();
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Try On with Camera</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveToCatalog}
                  disabled={addedToCatalog}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    addedToCatalog
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {addedToCatalog ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Added to Catalog</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5 text-stone-600" />
                      <span>Save to Catalog</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* FULL MULTI-STORE PRICE COMPARISON MATRIX */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-serif font-bold text-stone-900">
                  All 6 Stores Ranked by Final Cost (Lowest First)
                </h4>
                <span className="text-xs text-stone-500">
                  Prices include verified coupons & delivery speed
                </span>
              </div>

              <div className="space-y-2.5">
                {comparisonResult.scannedOffers.map((offer: ScannedOffer, index: number) => {
                  const accent = getStoreAccent(offer.storeName);
                  const isLowest = index === 0;
                  const finalCost = offer.effectivePriceWithCoupon ?? offer.price;
                  const lowestCost = comparisonResult.lowestOffer.effectivePriceWithCoupon ?? comparisonResult.lowestOffer.price;
                  const priceDiff = finalCost - lowestCost;

                  return (
                    <div
                      key={offer.storeName}
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                        isLowest
                          ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400 shadow-sm'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {/* Left: Store Branding & Verification */}
                      <div className="flex items-center gap-3.5 mb-2 sm:mb-0">
                        <div
                          className={`w-10 h-10 rounded-xl ${accent.bg} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                        >
                          {offer.storeName.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">
                              {offer.storeName}
                            </span>
                            {isLowest && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                                Lowest Price
                              </span>
                            )}
                            {!isLowest && priceDiff > 0 && (
                              <span className="text-xs text-rose-600 font-semibold">
                                +₹{priceDiff} more expensive
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{offer.deliveryEstimate}</span>
                            </div>
                            <span aria-hidden="true">·</span>
                            <span className="text-stone-600 truncate max-w-[200px] sm:max-w-xs">
                              {offer.perk}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Buy Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-stone-900 font-serif">
                              ₹{finalCost}
                            </span>
                            {offer.mrp > finalCost && (
                              <span className="text-xs text-stone-400 line-through">
                                ₹{offer.mrp}
                              </span>
                            )}
                            <span className="text-xs font-semibold text-emerald-700">
                              {offer.discountPercent}% off
                            </span>
                          </div>

                          {offer.couponCode && (
                            <div className="text-[11px] text-stone-500 flex items-center gap-1 sm:justify-end">
                              <Tag className="w-3 h-3 text-rose-500" />
                              <span>
                                Code: <strong>{offer.couponCode}</strong> (-₹{offer.couponSavings})
                              </span>
                            </div>
                          )}
                        </div>

                        <a
                          href={offer.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                            isLowest
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-stone-900 hover:bg-stone-800 text-white'
                          }`}
                        >
                          <span>{isLowest ? 'Go to Cheapest' : 'Visit Store'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRICE DROP ALERT SETUP CARD */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-stone-900">
                    Want an even lower price? Set a Price Drop Alert
                  </h5>
                  <p className="text-[11px] text-stone-600">
                    We will notify you immediately when any store discounts below your target price.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-stone-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={customAlertPrice}
                    onChange={(e) => setCustomAlertPrice(Number(e.target.value))}
                    className="w-24 py-1.5 pl-6 pr-2 text-xs font-bold rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSetAlert}
                  disabled={alertSaved}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    alertSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {alertSaved ? 'Alert Active ✓' : 'Set Alert'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty Search Prompt */}
        {!isScanning && !comparisonResult && (
          <div className="py-12 px-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
              <TrendingDown className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
                Never Overpay for Cosmetics Again
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Paste any product URL from Nykaa, Myntra, Amazon, Sephora, or Tira — or type any product name. We will compare every store and tell you the exact lowest cost retailer in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
