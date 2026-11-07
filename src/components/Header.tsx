import React from 'react';
import { Heart, Sparkles, Bell, ArrowRight, Camera, TrendingDown } from 'lucide-react';
import { WishlistItem, NotificationAlert } from '../types';

interface HeaderProps {
  wishlist: WishlistItem[];
  notifications: NotificationAlert[];
  onOpenWishlist: () => void;
  onOpenAiAssistant: () => void;
  onOpenVirtualTryOn?: () => void;
  onOpenPriceScanner?: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onSelectCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  wishlist,
  notifications,
  onOpenWishlist,
  onOpenAiAssistant,
  onOpenVirtualTryOn,
  onOpenPriceScanner,
  activeNav,
  setActiveNav,
  onSelectCategory,
}) => {
  const unreadAlerts = notifications.filter((n) => !n.read).length;
  const triggeredWishlistCount = wishlist.filter((item) => item.alertTriggered).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100">
      {/* Subtle announcement bar */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span>Live Price Comparison across Nykaa, Sephora, Dot & Key, and Myntra</span>
        <span className="hidden sm:inline opacity-80">·</span>
        <span className="hidden sm:inline opacity-90">Auto-refreshed with real-time discounts</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element Brand Wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveNav('catalog');
              onSelectCategory('All');
            }}
            className="flex items-center gap-2 text-2xl font-serif font-bold tracking-tight text-rose-950 whitespace-nowrap shrink-0 group"
          >
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-serif text-lg font-bold border border-rose-200 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-200">
              S
            </span>
            <span>Skinora</span>
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => {
                setActiveNav('catalog');
                onSelectCategory('All');
              }}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'catalog' ? 'text-rose-600 font-semibold' : ''
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => {
                setActiveNav('catalog');
                onSelectCategory('Skincare');
              }}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
            >
              Skincare
            </button>
            <button
              onClick={() => {
                setActiveNav('catalog');
                onSelectCategory('Lipsticks');
              }}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
            >
              Lipsticks
            </button>
            <button
              onClick={() => {
                setActiveNav('catalog');
                onSelectCategory('Serums');
              }}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
            >
              Serums
            </button>
            <button
              onClick={onOpenPriceScanner}
              className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 text-emerald-800 font-semibold"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compare URL / Product</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1 rounded font-extrabold uppercase">
                Lowest Cost
              </span>
            </button>
            <button
              onClick={onOpenVirtualTryOn}
              className="hover:text-rose-600 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 text-rose-700 font-medium"
            >
              <Camera className="w-3.5 h-3.5 text-rose-500" />
              <span>Virtual Try-On</span>
              <span className="bg-rose-100 text-rose-700 text-[9px] px-1 rounded font-bold uppercase">
                AR
              </span>
            </button>
            <button
              onClick={onOpenAiAssistant}
              className="hover:text-rose-600 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 text-rose-700 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>AI Advisor</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Price Scanner button */}
            <button
              type="button"
              onClick={onOpenPriceScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
              title="Compare any product name or URL across 6 stores"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Compare URL</span>
              <span className="bg-emerald-600 text-white text-[9px] px-1 rounded-xs uppercase font-extrabold tracking-wider">
                6 Stores
              </span>
            </button>

            {/* Quick Camera Try-On pill button */}
            <button
              type="button"
              onClick={onOpenVirtualTryOn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100/90 border border-rose-200/90 rounded-lg transition-colors shadow-2xs"
              title="Open Camera Virtual Try-On"
            >
              <Camera className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Camera Try-On</span>
              <span className="bg-rose-600 text-white text-[9px] px-1 rounded-xs uppercase font-extrabold tracking-wider">
                Live
              </span>
            </button>

            {/* Wishlist & Price Drops */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Saved Items & Price Alerts"
              aria-label="Wishlist and Price Drop Alerts"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center border-2 border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Notification bell if price drops occurred */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Price Drop Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center border-2 border-white">
                  {unreadAlerts}
                </span>
              )}
            </button>

            {/* Skinora AI Routine Button */}
            <button
              onClick={onOpenAiAssistant}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-200" />
              <span>Skin Match AI</span>
              <ArrowRight className="w-3 h-3 hidden xl:inline" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
