import React, { useEffect } from 'react';
import { Layers, X, Check, DollarSign, Package, AlertCircle, ArrowRight } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { posSound } from '../utils/audio';

interface MultiRateSelectorModalProps {
  barcode: string;
  matchingProducts: Product[];
  storeSettings: StoreSettings;
  saleType: 'Retail' | 'Wholesale';
  onSelect: (selectedProduct: Product) => void;
  onClose: () => void;
}

export const MultiRateSelectorModal: React.FC<MultiRateSelectorModalProps> = ({
  barcode,
  matchingProducts,
  storeSettings,
  saleType,
  onSelect,
  onClose,
}) => {
  // Play attention beep on modal appearance
  useEffect(() => {
    posSound.playDoubleBeep();
  }, []);

  // Keyboard number keys [1], [2], [3]... to quickly pick without mouse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= matchingProducts.length) {
        e.preventDefault();
        onSelect(matchingProducts[num - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [matchingProducts, onSelect, onClose]);

  const currency = storeSettings.currency || 'Rs.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#002b49] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                Multiple Rates Found for Barcode
              </h3>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-0.5">
                <span>Barcode:</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded font-bold text-amber-300">
                  {barcode}
                </span>
                <span>({matchingProducts.length} Different Price Batches Found)</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            This item has <strong>{matchingProducts.length} separate price rates</strong> registered under the same barcode (e.g. Old Batch vs New Batch MRP). Please choose which rate to add to the invoice:
          </span>
        </div>

        {/* Rate Cards Grid */}
        <div className="p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {matchingProducts.map((p, idx) => {
            const activeRate = saleType === 'Wholesale' ? p.wholesalePrice : p.retailPrice;
            const profit = p.retailPrice - p.purchasePrice;
            const marginPercent = p.purchasePrice > 0 ? (profit / p.purchasePrice) * 100 : 0;

            return (
              <div
                key={p.id}
                onClick={() => onSelect(p)}
                className={`pt-3.5 first:pt-0 group relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  idx === 0
                    ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-500 hover:bg-emerald-50/80 shadow-sm'
                    : 'border-blue-200 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/70 shadow-sm'
                }`}
              >
                {/* Left info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-full bg-[#002b49] text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0078d7] transition-colors">
                      {p.name}
                    </h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                      {p.company || 'General'}
                    </span>
                    {p.batchNo && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">
                        Batch: {p.batchNo}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      Stock Available: <strong className={p.stock <= p.minStockAlert ? 'text-amber-600' : 'text-slate-900'}>{p.stock} units</strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>Purchase Cost: {currency} {p.purchasePrice.toLocaleString()}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-emerald-700 font-medium">
                      Profit: +{currency} {profit.toFixed(0)} ({marginPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Right Price & Select Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {saleType === 'Wholesale' ? 'Wholesale Rate' : 'Retail Rate'}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#002b49]">
                      {currency} {activeRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(p);
                    }}
                    className="bg-[#28a745] hover:bg-[#218838] text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm group-hover:scale-105 transition-all cursor-pointer"
                  >
                    <span>Select Rate</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono hidden sm:inline-block">
                      Press [{idx + 1}]
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[11px] font-bold text-slate-700">1</kbd>, <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[11px] font-bold text-slate-700">2</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[11px] font-bold text-slate-700">Esc</kbd> on your keyboard.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
