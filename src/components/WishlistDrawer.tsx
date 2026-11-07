import React, { useState } from 'react';
import {
  X,
  Heart,
  Bell,
  Trash2,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Product, WishlistItem, NotificationAlert } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: WishlistItem[];
  products: Product[];
  onRemoveItem: (productId: string) => void;
  onUpdateTargetPrice: (productId: string, newTarget: number) => void;
  onSelectProduct: (product: Product) => void;
  notifications: NotificationAlert[];
  onDismissNotification: (id: string) => void;
  onSimulatePriceDrop: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  products,
  onRemoveItem,
  onUpdateTargetPrice,
  onSelectProduct,
  notifications,
  onDismissNotification,
  onSimulatePriceDrop,
}) => {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'alerts'>('wishlist');

  // Hydrate wishlist items with product information
  const hydratedItems = wishlist
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      const inStockOffers = product.offers.filter((o) => o.inStock);
      const lowestOffer = inStockOffers.length > 0
        ? inStockOffers.reduce((min, o) => (o.price < min.price ? o : min), inStockOffers[0])
        : product.offers[0];

      const isBelowTarget = lowestOffer.price <= item.targetAlertPrice;

      return {
        ...item,
        product,
        lowestOffer,
        isBelowTarget,
      };
    })
    .filter(Boolean);

  const totalTrackedValue = hydratedItems.reduce(
    (sum, item) => sum + (item?.lowestOffer.price || 0),
    0
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-500" />
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Wishlist & Price Drops
            </h2>
            <span className="text-xs text-stone-400">({wishlist.length})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Wishlist vs Live Drop Alerts */}
        <div className="px-5 pt-3 pb-2 border-b border-rose-50 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Tracked Items ({wishlist.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Recent Alerts ({notifications.length})</span>
            {notifications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'wishlist' ? (
            <>
              {hydratedItems.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="font-semibold text-stone-800 text-sm">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                    Click the heart icon on any cosmetic or skincare item to track its price
                    and get automatic drop alerts when it dips below your target!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Explore Beauty Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 block">Total Cart Estimate</span>
                      <span className="font-bold text-stone-900 font-mono text-sm">
                        ₹{totalTrackedValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      onClick={onSimulatePriceDrop}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
                      title="Trigger an instant price drop alert to test the system"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Simulate Drop</span>
                    </button>
                  </div>

                  {/* List of Wishlist Items */}
                  {hydratedItems.map((item) => {
                    if (!item) return null;
                    const { product, lowestOffer, isBelowTarget } = item;

                    return (
                      <div
                        key={product.id}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isBelowTarget
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-rose-100/90'
                        }`}
                      >
                        {/* Top Product Row */}
                        <div className="flex gap-3 items-start">
                          <img
                            src={product.imageURL}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              if (product.secondaryImageURL && e.currentTarget.src !== product.secondaryImageURL) {
                                e.currentTarget.src = product.secondaryImageURL;
                              }
                            }}
                            className="w-16 h-16 rounded-lg object-contain bg-stone-50 border border-stone-200/60 p-1 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-800">
                              {product.brand}
                            </span>
                            <h4
                              onClick={() => {
                                onSelectProduct(product);
                                onClose();
                              }}
                              className="font-medium text-xs text-stone-900 truncate hover:text-rose-600 cursor-pointer"
                              title={product.title}
                            >
                              {product.title}
                            </h4>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono font-bold text-stone-900 text-sm">
                                ₹{lowestOffer.price}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                on {lowestOffer.storeName}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(product.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price Alert Indicator */}
                        {isBelowTarget ? (
                          <div className="bg-emerald-100/80 text-emerald-900 text-[11px] p-2 rounded-lg font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>
                              Price Drop Alert! Current ₹{lowestOffer.price} is below your ₹
                              {item.targetAlertPrice} target!
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-stone-500 flex items-center justify-between">
                            <span>Your Target Price:</span>
                            <span className="font-mono font-semibold text-stone-800">
                              ₹{item.targetAlertPrice}
                            </span>
                          </div>
                        )}

                        {/* Target Price Adjuster */}
                        <div className="space-y-1 pt-1 border-t border-rose-50">
                          <div className="flex items-center justify-between text-[10px] text-stone-500">
                            <span>Adjust Alert Target:</span>
                            <span className="font-mono font-medium">₹{item.targetAlertPrice}</span>
                          </div>
                          <input
                            type="range"
                            min={Math.max(100, Math.round(lowestOffer.price * 0.5))}
                            max={lowestOffer.price + 500}
                            step={10}
                            value={item.targetAlertPrice}
                            onChange={(e) =>
                              onUpdateTargetPrice(product.id, Number(e.target.value))
                            }
                            className="w-full accent-rose-600 cursor-pointer h-1"
                          />
                        </div>

                        {/* Quick Action Outbound */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              onSelectProduct(product);
                              onClose();
                            }}
                            className="flex-1 py-1.5 px-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-md text-[11px] font-medium border border-stone-200 transition-colors"
                          >
                            Compare All Stores
                          </button>
                          <a
                            href={lowestOffer.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <span>Buy ₹{lowestOffer.price}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Tab 2: Recent Price Drop Notifications */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-rose-50">
                <span>Recent Price Drop Alerts</span>
                <button
                  onClick={onSimulatePriceDrop}
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  + Trigger Test Alert
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-10 text-xs text-stone-500">
                  No alerts recorded yet. Tap &quot;+ Trigger Test Alert&quot; to test notifications!
                </div>
              ) : (
                notifications.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1.5 text-xs relative"
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span className="font-semibold text-rose-700 uppercase">
                        {alert.storeName}
                      </span>
                      <span>{alert.timestamp}</span>
                    </div>

                    <h5 className="font-semibold text-stone-900 leading-snug">
                      {alert.productTitle}
                    </h5>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-stone-400 font-mono">
                        ₹{alert.oldPrice}
                      </span>
                      <ArrowRight className="w-3 h-3 text-stone-400" />
                      <span className="font-bold text-emerald-700 font-mono">
                        ₹{alert.newPrice}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                        Below ₹{alert.targetPrice} Target
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-rose-100/60 mt-2">
                      <button
                        onClick={() => {
                          const prod = products.find((p) => p.id === alert.productId);
                          if (prod) {
                            onSelectProduct(prod);
                            onClose();
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
                      >
                        View Deal Now →
                      </button>
                      <button
                        onClick={() => onDismissNotification(alert.id)}
                        className="text-stone-400 hover:text-stone-600 text-[10px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rose-100 bg-stone-50/60 text-center">
          <p className="text-[11px] text-stone-500">
            Skinora monitors price fluctuations across Nykaa, Sephora, Dot & Key, and Myntra.
          </p>
        </div>
      </div>
    </div>
  );
};
