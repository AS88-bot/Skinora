import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  X,
  Send,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Flame,
  Sun,
  Moon,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Product, SkinType, SkinConcern } from '../types';

interface AiBeautyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const AVAILABLE_SKIN_TYPES: SkinType[] = [
  'Oily',
  'Dry',
  'Combination',
  'Sensitive',
  'Normal',
  'Acne-Prone',
];

const AVAILABLE_CONCERNS: SkinConcern[] = [
  'Acne & Blemishes',
  'Hydration & Dryness',
  'Dullness & Glow',
  'Pigmentation & Dark Spots',
  'Barrier Repair',
  'Oil Control & Pores',
  'Sun Protection',
];

export const AiBeautyAssistant: React.FC<AiBeautyAssistantProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType>('Oily');
  const [selectedConcerns, setSelectedConcerns] = useState<SkinConcern[]>([
    'Acne & Blemishes',
    'Oil Control & Pores',
  ]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRoutineView, setActiveRoutineView] = useState<'recommendations' | 'routine'>(
    'recommendations'
  );

  const toggleConcern = (concern: SkinConcern) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  // Compatibility Scoring Engine
  const scoredProducts = useMemo(() => {
    return products
      .map((product) => {
        let score = 50; // base score
        const matchReasons: string[] = [];

        // Match skin type
        if (product.skinType.includes(selectedSkinType) || product.skinType.includes('All Skin Types')) {
          score += 25;
          matchReasons.push(`Formulated for ${selectedSkinType} skin`);
        }

        // Match concerns
        selectedConcerns.forEach((concern) => {
          if (product.concerns.includes(concern)) {
            score += 20;
            matchReasons.push(`Clinically targets ${concern}`);
          }
        });

        // Match custom text keywords
        if (customPrompt.trim()) {
          const lowerPrompt = customPrompt.toLowerCase();
          if (
            product.title.toLowerCase().includes(lowerPrompt) ||
            product.description.toLowerCase().includes(lowerPrompt) ||
            product.brand.toLowerCase().includes(lowerPrompt)
          ) {
            score += 25;
            matchReasons.push(`Matches custom criteria "${customPrompt}"`);
          }
        }

        const normalizedScore = Math.min(99, Math.max(65, score));

        // Find lowest price offer
        const inStockOffers = product.offers.filter((o) => o.inStock);
        const lowestOffer = inStockOffers.length > 0
          ? inStockOffers.reduce((min, o) => (o.price < min.price ? o : min), inStockOffers[0])
          : product.offers[0];

        return {
          product,
          matchScore: normalizedScore,
          matchReasons,
          lowestOffer,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [products, selectedSkinType, selectedConcerns, customPrompt]);

  const topRecommendations = scoredProducts.slice(0, 4);

  // AM & PM Routines
  const amCleanserOrSerum = scoredProducts.find(
    (sp) => sp.product.category === 'Serums' || sp.product.category === 'Skincare'
  );
  const amMoisturizer = scoredProducts.find(
    (sp) =>
      sp.product.category === 'Skincare' && sp.product.id !== amCleanserOrSerum?.product.id
  ) || scoredProducts[1];
  const amSunOrLip = scoredProducts.find((sp) => sp.product.category === 'Lipsticks');

  const pmTreatment = scoredProducts.find(
    (sp) => sp.product.category === 'Serums' && sp.product.id !== amCleanserOrSerum?.product.id
  ) || scoredProducts[0];
  const pmRepair = scoredProducts.find(
    (sp) => sp.product.category === 'Skincare'
  ) || scoredProducts[2];

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50/80 to-pink-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Skinora Beauty AI Advisor
              </h2>
              <p className="text-[11px] text-stone-500">
                Dermatology-matched ingredients at the lowest web prices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Recommendations vs Routine */}
        <div className="px-5 pt-3 border-b border-rose-50 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveRoutineView('recommendations')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeRoutineView === 'recommendations'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Recommendations</span>
          </button>
          <button
            onClick={() => setActiveRoutineView('routine')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeRoutineView === 'routine'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>AM & PM Regimen Builder</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Step 1: Skin Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              1. Your Skin Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_SKIN_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedSkinType(type)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                    selectedSkinType === type
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-stone-700 border-rose-100 hover:bg-rose-50/50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Skin Concerns Multi-Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-800 uppercase tracking-wider">
                2. Key Skin Concerns
              </label>
              <span className="text-[11px] text-stone-400">
                {selectedConcerns.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_CONCERNS.map((concern) => {
                const isSelected = selectedConcerns.includes(concern);
                return (
                  <button
                    key={concern}
                    onClick={() => toggleConcern(concern)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-rose-100 text-rose-900 border-rose-300 font-semibold shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {concern}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Natural Language Query */}
          <form onSubmit={handleCustomSearch} className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              3. Ask Specific Concern or Ingredient (Optional)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. lightweight gel cream without white cast under ₹600"
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-3 pr-10 text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 p-1.5 text-rose-600 hover:text-rose-800 rounded-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Result Section */}
          {activeRoutineView === 'recommendations' ? (
            <div className="space-y-3 pt-2 border-t border-rose-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Top Recommended Formulations
                </span>
                <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Best Price Tagged
                </span>
              </div>

              {topRecommendations.map(({ product, matchScore, matchReasons, lowestOffer }) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-rose-100 p-3.5 space-y-2 hover:shadow-sm transition-all"
                >
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
                      className="w-14 h-14 object-contain bg-stone-50 rounded-lg p-1 border border-stone-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="font-semibold text-rose-800 uppercase">
                          {product.brand}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono text-[10px]">
                          {matchScore}% Match
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs text-stone-900 line-clamp-1">
                        {product.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-bold text-stone-900 text-xs">
                          ₹{lowestOffer.price}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          (Lowest on {lowestOffer.storeName})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Why it matches */}
                  <div className="text-[11px] text-stone-600 bg-stone-50/70 p-2 rounded-lg space-y-1">
                    <span className="font-medium text-stone-800 block">Why it works for you:</span>
                    <ul className="space-y-0.5">
                      {matchReasons.slice(0, 2).map((r, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-stone-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Compare 4 Store Prices</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Tab 2: AM & PM Regimen Builder */
            <div className="space-y-4 pt-2 border-t border-rose-100">
              {/* AM Routine */}
              <div className="bg-gradient-to-r from-amber-50/60 to-rose-50/40 rounded-xl p-4 border border-amber-200/60 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Morning (AM) Defense & Hydration</span>
                </div>

                <div className="space-y-2 text-xs">
                  {amCleanserOrSerum && (
                    <div className="bg-white p-2.5 rounded-lg border border-amber-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Step 1: Active Serum
                        </span>
                        <span className="font-semibold text-stone-800">
                          {amCleanserOrSerum.product.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectProduct(amCleanserOrSerum.product);
                          onClose();
                        }}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                      >
                        ₹{amCleanserOrSerum.lowestOffer.price} →
                      </button>
                    </div>
                  )}

                  {amMoisturizer && (
                    <div className="bg-white p-2.5 rounded-lg border border-amber-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Step 2: Barrier Hydration
                        </span>
                        <span className="font-semibold text-stone-800">
                          {amMoisturizer.product.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectProduct(amMoisturizer.product);
                          onClose();
                        }}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                      >
                        ₹{amMoisturizer.lowestOffer.price} →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* PM Routine */}
              <div className="bg-gradient-to-r from-indigo-50/50 to-rose-50/40 rounded-xl p-4 border border-indigo-200/60 space-y-3">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Night (PM) Cell Renewal & Repair</span>
                </div>

                <div className="space-y-2 text-xs">
                  {pmTreatment && (
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Step 1: Night Clarification
                        </span>
                        <span className="font-semibold text-stone-800">
                          {pmTreatment.product.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectProduct(pmTreatment.product);
                          onClose();
                        }}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                      >
                        ₹{pmTreatment.lowestOffer.price} →
                      </button>
                    </div>
                  )}

                  {pmRepair && (
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Step 2: Deep Lipid Seal
                        </span>
                        <span className="font-semibold text-stone-800">
                          {pmRepair.product.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectProduct(pmRepair.product);
                          onClose();
                        }}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                      >
                        ₹{pmRepair.lowestOffer.price} →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rose-100 bg-stone-50/80 flex items-center justify-between text-xs">
          <span className="text-stone-500">
            {topRecommendations.length} active formulations matched
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
