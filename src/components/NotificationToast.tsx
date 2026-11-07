import React from 'react';
import { Bell, ArrowRight, X, TrendingDown, ExternalLink } from 'lucide-react';
import { NotificationAlert, Product } from '../types';

interface NotificationToastProps {
  alert: NotificationAlert | null;
  onDismiss: () => void;
  onViewProduct: (productId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  alert,
  onDismiss,
  onViewProduct,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-stone-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-stone-800 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                Price Drop Alert!
              </span>
              <span className="text-xs text-stone-300">
                Dropped on {alert.storeName}
              </span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-stone-400 hover:text-white p-1 rounded-full transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-100 font-medium line-clamp-2">
          {alert.productTitle}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="line-through text-stone-500 font-mono">₹{alert.oldPrice}</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">
              ₹{alert.newPrice}
            </span>
          </div>

          <button
            onClick={() => {
              onViewProduct(alert.productId);
              onDismiss();
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>View Deal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
