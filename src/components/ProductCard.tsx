import React from 'react';
import { Heart, Star, Sparkles, ExternalLink, ShieldAlert, ArrowUpRight, Camera } from 'lucide-react';
import { Product, StoreName } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onOpenVirtualTryOn?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isWishlisted,
  onToggleWishlist,
  onOpenVirtualTryOn,
}) => {
  // Find in-stock offers and lowest offer
  const inStockOffers = product.offers.filter((o) => o.inStock);
  const lowestOffer = inStockOffers.length > 0
    ? inStockOffers.reduce((min, o) => (o.price < min.price ? o : min), inStockOffers[0])
    : product.offers[0];

  const highestOffer = inStockOffers.length > 0
    ? inStockOffers.reduce((max, o) => (o.price > max.price ? o : max), inStockOffers[0])
    : product.offers[0];

  const maxSavings = highestOffer ? highestOffer.price - lowestOffer.price : 0;

  return (
    <div className="group bg-white rounded-2xl border border-rose-100/90 hover:border-rose-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      {/* Top Image Container */}
      <div className="relative w-full aspect-4/3 bg-[#FDF8F7] overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.imageURL}
          alt={product.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            if (product.secondaryImageURL && e.currentTarget.src !== product.secondaryImageURL) {
              e.currentTarget.src = product.secondaryImageURL;
            }
          }}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-104 transition-transform duration-300"
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-all shadow-xs ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-300'
              : 'bg-white/80 text-stone-400 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist and set alert'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Try-On AR Badge (for lipsticks, foundations, highlighters) */}
        {(product.shadeOptions || product.category === 'Lipsticks' || product.category === 'Makeup') && onOpenVirtualTryOn && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenVirtualTryOn(product);
            }}
            className="absolute top-3 left-3 bg-white/95 hover:bg-rose-600 text-stone-800 hover:text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs transition-all flex items-center gap-1 group/tryon border border-rose-100"
            title="Try this product on yourself using live camera"
          >
            <Camera className="w-3.5 h-3.5 text-rose-600 group-hover/tryon:text-white" />
            <span>Try On</span>
          </button>
        )}

        {/* Lowest Price Tag Badge */}
        {lowestOffer && lowestOffer.inStock && (
          <div className="absolute bottom-3 left-3 bg-emerald-600/95 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
            <span>
              Best: ₹{lowestOffer.price} on {lowestOffer.storeName}
            </span>
          </div>
        )}

        {/* Out of Stock flag if none in stock */}
        {inStockOffers.length === 0 && (
          <div className="absolute bottom-3 left-3 bg-stone-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
            Out of Stock Everywhere
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand & Category quiet metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-semibold text-rose-900 uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-stone-600 font-medium text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="font-medium text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-rose-600 cursor-pointer transition-colors mb-2.5"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Skin Type tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px] text-stone-500">
            {product.skinType.slice(0, 2).map((st) => (
              <span
                key={st}
                className="bg-stone-50 px-2 py-0.5 rounded text-stone-600 border border-stone-200/60"
              >
                {st}
              </span>
            ))}
            {product.volume && (
              <span className="text-stone-400 font-mono text-[10px] ml-auto">
                {product.volume}
              </span>
            )}
          </div>
        </div>

        {/* Live Multi-Retailer Comparison Mini-Grid */}
        <div className="pt-3 border-t border-rose-50/80 mb-3 space-y-1.5">
          <div className="text-[11px] font-medium text-stone-500 flex items-center justify-between">
            <span>Prices Across Stores:</span>
            {maxSavings > 0 && (
              <span className="text-emerald-700 font-semibold text-[11px]">
                Save up to ₹{maxSavings}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {product.offers.map((offer) => (
              <div
                key={offer.storeName}
                className={`p-1.5 rounded-md flex items-center justify-between border ${
                  offer.storeName === lowestOffer?.storeName && offer.inStock
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                    : offer.inStock
                    ? 'bg-stone-50/70 border-stone-200/60 text-stone-700'
                    : 'bg-stone-50/40 border-stone-100 text-stone-400 opacity-60'
                }`}
              >
                <span className="text-[11px] truncate max-w-[65px] font-medium">
                  {offer.storeName}
                </span>
                <span className="font-mono tabular-nums text-[11px] font-semibold">
                  {offer.inStock ? `₹${offer.price}` : 'OOS'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Compare Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {(product.shadeOptions || product.category === 'Lipsticks' || product.category === 'Makeup') && onOpenVirtualTryOn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenVirtualTryOn(product);
              }}
              className="py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-lg shadow-2xs transition-all flex items-center gap-1 shrink-0"
              title="Camera Virtual Try-On"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Try On</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
