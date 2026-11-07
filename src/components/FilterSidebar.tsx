import React from 'react';
import { Filter, X, RotateCcw, Check } from 'lucide-react';
import { FilterState, ProductCategory, StoreName, SkinType, SkinConcern } from '../types';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableBrands: string[];
  totalMatches: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Skincare',
  'Lipsticks',
  'Makeup',
  'Haircare',
  'Personal Hygiene',
  'Serums',
];

const RETAILERS: (StoreName | 'All')[] = ['All', 'Nykaa', 'Sephora', 'Dot & Key', 'Myntra'];

const SKIN_TYPES: (SkinType | 'All')[] = [
  'All',
  'Oily',
  'Dry',
  'Combination',
  'Sensitive',
  'Normal',
  'Acne-Prone',
];

const CONCERNS: (SkinConcern | 'All')[] = [
  'All',
  'Acne & Blemishes',
  'Hydration & Dryness',
  'Dullness & Glow',
  'Pigmentation & Dark Spots',
  'Barrier Repair',
  'Oil Control & Pores',
  'Sun Protection',
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  availableBrands,
  totalMatches,
  isOpenMobile,
  onCloseMobile,
}) => {
  const resetFilters = () => {
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
    });
  };

  const content = (
    <div className="space-y-6 text-xs text-stone-700">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-600" />
          <span className="font-bold text-sm text-stone-900">Filters</span>
          <span className="text-stone-400 font-normal">({totalMatches} items)</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1 text-[11px] font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By Selector */}
      <div className="space-y-2">
        <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider block">
          Sort Results By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              sortBy: e.target.value as FilterState['sortBy'],
            }))
          }
          className="w-full bg-white border border-rose-200 rounded-lg p-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
        >
          <option value="lowestPrice">Lowest Available Price</option>
          <option value="discount">Biggest Discount %</option>
          <option value="rating">Highest Customer Rating</option>
          <option value="popular">Most Popular Reviews</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider block">
          Category
        </label>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                filters.category === cat
                  ? 'bg-rose-50 text-rose-800 font-semibold'
                  : 'hover:bg-stone-50 text-stone-600'
              }`}
            >
              <span>{cat}</span>
              {filters.category === cat && <Check className="w-3 h-3 text-rose-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Retailer Filter */}
      <div className="space-y-2">
        <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider block">
          Preferred Store
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {RETAILERS.map((store) => (
            <button
              key={store}
              onClick={() => setFilters((prev) => ({ ...prev, selectedStore: store }))}
              className={`p-2 rounded-lg text-center border transition-all text-xs ${
                filters.selectedStore === store
                  ? 'bg-rose-600 text-white border-rose-600 font-semibold shadow-xs'
                  : 'bg-white hover:bg-rose-50/50 text-stone-700 border-rose-100'
              }`}
            >
              {store}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider block">
          Brand
        </label>
        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, brand: 'All' }))}
            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
              filters.brand === 'All'
                ? 'bg-rose-50 text-rose-800 font-semibold'
                : 'hover:bg-stone-50 text-stone-600'
            }`}
          >
            <span>All Brands</span>
            {filters.brand === 'All' && <Check className="w-3 h-3 text-rose-600" />}
          </button>
          {availableBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => setFilters((prev) => ({ ...prev, brand }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                filters.brand === brand
                  ? 'bg-rose-50 text-rose-800 font-semibold'
                  : 'hover:bg-stone-50 text-stone-600'
              }`}
            >
              <span>{brand}</span>
              {filters.brand === brand && <Check className="w-3 h-3 text-rose-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Range Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider">
            Max Price:
          </label>
          <span className="font-mono font-bold text-rose-700 text-xs">
            ₹{filters.priceRange[1].toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min={200}
          max={3500}
          step={50}
          value={filters.priceRange[1]}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              priceRange: [prev.priceRange[0], Number(e.target.value)],
            }))
          }
          className="w-full accent-rose-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-400 font-mono">
          <span>₹200</span>
          <span>₹1,500</span>
          <span>₹3,500</span>
        </div>
      </div>

      {/* Skin Type Filter */}
      <div className="space-y-2">
        <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider block">
          Skin Type Suitability
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SKIN_TYPES.map((st) => (
            <button
              key={st}
              onClick={() => setFilters((prev) => ({ ...prev, skinType: st }))}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors border ${
                filters.skinType === st
                  ? 'bg-rose-100 text-rose-900 border-rose-300 font-semibold'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Concern Filter */}
      <div className="space-y-2">
        <label className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider block">
          Target Skin Concern
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CONCERNS.map((c) => (
            <button
              key={c}
              onClick={() => setFilters((prev) => ({ ...prev, concern: c }))}
              className={`px-2 py-1 rounded-md text-[11px] transition-colors border ${
                filters.concern === c
                  ? 'bg-rose-100 text-rose-900 border-rose-300 font-semibold'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* In-Stock Only Toggle */}
      <div className="pt-2 border-t border-rose-100">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                inStockOnly: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-rose-600 rounded"
          />
          <span className="font-medium text-stone-800 text-xs">
            Show In-Stock items only
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white rounded-2xl border border-rose-100 p-5 shadow-xs h-fit sticky top-24">
        {content}
      </aside>

      {/* Mobile Modal Drawer */}
      {isOpenMobile && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end"
          onClick={onCloseMobile}
        >
          <div
            className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-4">
                <span className="font-bold text-stone-900 text-base">Filter Catalog</span>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 border-t border-rose-100 mt-6">
              <button
                onClick={onCloseMobile}
                className="w-full py-2.5 bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Show {totalMatches} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
