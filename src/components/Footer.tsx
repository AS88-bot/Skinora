import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { ProductCategory, StoreName } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory) => void;
  onSelectStore: (store: StoreName) => void;
  onOpenAiAssistant: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectStore,
  onOpenAiAssistant,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-10 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-serif text-lg font-bold">
                S
              </span>
              <span className="text-xl font-serif font-bold text-white tracking-tight">
                Skinora
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              Specialized beauty, cosmetics, and personal hygiene price comparison portal across
              India&apos;s leading beauty destinations.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-medium text-[11px] pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent, Verified Price Indexing</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Beauty Categories
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('Skincare')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Skincare & Moisturizers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Lipsticks')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Lipsticks, Mattes & Tints
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Makeup')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Foundations & Strobing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Serums')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Active Serums & Cica
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Personal Hygiene')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Personal Hygiene & Deodorants
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Retailers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Retailer Portals
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => onSelectStore('Nykaa')}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Nykaa Cosmetics & Beauty</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectStore('Sephora')}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Sephora India Luxury</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectStore('Dot & Key')}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Dot & Key Direct Store</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectStore('Myntra')}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Myntra Beauty & Personal Care</span>
                </button>
              </li>
            </ul>
          </div>

          {/* AI Advisor & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Skin Intelligence
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              Find customized formulas matching your exact skin type and concerns without overpaying.
            </p>
            <button
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-xs transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Skin Advisor</span>
            </button>
          </div>
        </div>

        {/* Quiet Copyright Row */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Skinora. Independent beauty & cosmetics price comparison.</p>
          <p>
            All brand trademarks (Nykaa, Sephora, Dot & Key, Myntra) belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};
