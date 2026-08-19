import React, { useState } from 'react';
import { Layers, X, Check, ArrowUpRight, Percent, Tag, Building2, Save, Trash2, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { usePOS } from '../context/POSContext';
import { posSound } from '../utils/audio';

interface BulkProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onApplyChanges: (updatedProducts: Product[]) => void;
}

export const BulkProductEditorModal: React.FC<BulkProductEditorModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onApplyChanges,
}) => {
  const { categories, brands, storeSettings, suppliers } = usePOS();

  // Local copy of selected products for live grid editing
  const [items, setItems] = useState<Product[]>([]);

  // Bulk transform controls
  const [priceChangeType, setPriceChangeType] = useState<'percent' | 'fixed'>('percent');
  const [priceChangeTarget, setPriceChangeTarget] = useState<'retail' | 'purchase' | 'both'>('retail');
  const [priceChangeValue, setPriceChangeValue] = useState<number>(0);

  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkBrand, setBulkBrand] = useState<string>('');
  const [bulkSupplierId, setBulkSupplierId] = useState<string>('');
  const [bulkStockAdd, setBulkStockAdd] = useState<number>(0);
  const [bulkUtilityAmount, setBulkUtilityAmount] = useState<number>(0);

  // Synchronize when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setItems(JSON.parse(JSON.stringify(selectedProducts)));
      setPriceChangeValue(0);
      setBulkCategory('');
      setBulkBrand('');
      setBulkSupplierId('');
      setBulkStockAdd(0);
      setBulkUtilityAmount(0);
    }
  }, [isOpen, selectedProducts]);

  if (!isOpen || selectedProducts.length === 0) return null;

  // Apply batch price increase/decrease to all items in modal
  const handleApplyPriceFormula = () => {
    if (priceChangeValue === 0) return;

    setItems((prev) =>
      prev.map((item) => {
        let newRetail = item.retailPrice;
        let newPurchase = item.purchasePrice;

        if (priceChangeType === 'percent') {
          const factor = 1 + priceChangeValue / 100;
          if (priceChangeTarget === 'retail' || priceChangeTarget === 'both') {
            newRetail = Math.round(item.retailPrice * factor * 100) / 100;
          }
          if (priceChangeTarget === 'purchase' || priceChangeTarget === 'both') {
            newPurchase = Math.round(item.purchasePrice * factor * 100) / 100;
          }
        } else {
          if (priceChangeTarget === 'retail' || priceChangeTarget === 'both') {
            newRetail = Math.max(0, item.retailPrice + priceChangeValue);
          }
          if (priceChangeTarget === 'purchase' || priceChangeTarget === 'both') {
            newPurchase = Math.max(0, item.purchasePrice + priceChangeValue);
          }
        }

        return {
          ...item,
          retailPrice: newRetail,
          purchasePrice: newPurchase,
          wholesalePrice: Math.round(newRetail * 0.9 * 100) / 100,
        };
      })
    );
  };

  // Apply bulk category to all items
  const handleApplyBulkCategory = () => {
    if (!bulkCategory) return;
    setItems((prev) => prev.map((item) => ({ ...item, category: bulkCategory })));
  };

  // Apply bulk brand to all items
  const handleApplyBulkBrand = () => {
    if (!bulkBrand) return;
    setItems((prev) => prev.map((item) => ({ ...item, company: bulkBrand })));
  };

  // Apply bulk supplier to all items
  const handleApplyBulkSupplier = () => {
    if (!bulkSupplierId) return;
    const sup = suppliers.find((s) => s.id === bulkSupplierId);
    if (!sup) return;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        supplierId: sup.id,
        supplierName: sup.name,
        company: item.company && item.company !== 'General' ? item.company : (sup.company || sup.name),
      }))
    );
  };

  // Apply bulk stock addition
  const handleApplyBulkStock = () => {
    if (bulkStockAdd === 0) return;
    setItems((prev) => prev.map((item) => ({ ...item, stock: Math.max(0, item.stock + bulkStockAdd) })));
  };

  // Proportional utility distribution algorithm
  const handleApplyBulkUtility = () => {
    if (bulkUtilityAmount <= 0) {
      alert('Please enter a positive utility amount.');
      return;
    }

    const totalCostSum = items.reduce((sum, item) => sum + item.purchasePrice, 0);

    setItems((prev) => {
      return prev.map((item) => {
        let allocatedUtility = 0;
        if (totalCostSum > 0) {
          // Proportionate share based on cost: (item.purchasePrice / totalCostSum) * utility
          allocatedUtility = bulkUtilityAmount * (item.purchasePrice / totalCostSum);
        } else {
          // If all costs are 0, divide equally
          allocatedUtility = bulkUtilityAmount / prev.length;
        }

        const newPurchasePrice = Math.round((item.purchasePrice + allocatedUtility) * 100) / 100;
        
        // Let's also adjust retail price or let the user decide. Usually, new retail = cost + margin.
        // We can just increase purchasePrice so the margin is updated, and wholesale price = 0.9 * retail.
        return {
          ...item,
          purchasePrice: newPurchasePrice,
        };
      });
    });

    alert(`Successfully distributed ${storeSettings.currency} ${bulkUtilityAmount.toLocaleString()} proportionally among ${items.length} items. Higher-priced products received a larger share of the utility cost.`);
    setBulkUtilityAmount(0);
    posSound.playSuccessChime();
  };

  // Save all modified items back to main context
  const handleSaveAll = () => {
    onApplyChanges(items);
    posSound.playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-5xl rounded-xs overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#002b49] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Bulk Product Editor & Price Manager</h3>
              <p className="text-[11px] text-blue-200">
                Modifying {items.length} selected products simultaneously
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Batch Controls Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Price Adjustment Formula */}
          <div className="bg-white p-3 border border-slate-200 space-y-2 rounded-xs shadow-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Percent className="w-4 h-4 text-[#0070ba]" />
              <span>Bulk Price Update (% or Rs.)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold">Target:</label>
                <select
                  value={priceChangeTarget}
                  onChange={(e: any) => setPriceChangeTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 py-1 px-2 text-xs rounded-xs"
                >
                  <option value="retail">Retail Price</option>
                  <option value="purchase">Purchase Cost</option>
                  <option value="both">Both (Retail & Cost)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">Type:</label>
                <select
                  value={priceChangeType}
                  onChange={(e: any) => setPriceChangeType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 py-1 px-2 text-xs rounded-xs"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Value ({storeSettings.currency})</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                value={priceChangeValue === 0 ? '' : priceChangeValue}
                onChange={(e) => setPriceChangeValue(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 10 for +10% or -5"
                className="flex-1 bg-white border border-slate-300 px-2.5 py-1 text-xs font-mono font-bold"
              />
              <button
                type="button"
                onClick={handleApplyPriceFormula}
                className="bg-[#0070ba] hover:bg-[#005a96] text-white px-3 py-1 font-bold text-xs rounded-xs cursor-pointer flex items-center gap-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>

            {/* Quick Pill Buttons */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[+5, +10, +15, +20, -5, -10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setPriceChangeType('percent');
                    setPriceChangeValue(val);
                  }}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold px-1.5 py-0.5 border border-slate-300 rounded cursor-pointer"
                >
                  {val > 0 ? `+${val}%` : `${val}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Category & Brand */}
          <div className="bg-white p-3 border border-slate-200 space-y-2 rounded-xs shadow-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Category & Brand Assignment</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold">Bulk Category:</label>
              <div className="flex gap-1.5">
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 py-1 px-2 text-xs rounded-xs"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleApplyBulkCategory}
                  disabled={!bulkCategory}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-2.5 py-1 text-xs font-bold rounded-xs cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold">Bulk Brand / Company:</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  list="bulk-brands-datalist"
                  value={bulkBrand}
                  onChange={(e) => setBulkBrand(e.target.value)}
                  placeholder="e.g. GSK, Abbott..."
                  className="flex-1 bg-white border border-slate-300 py-1 px-2 text-xs rounded-xs"
                />
                <datalist id="bulk-brands-datalist">
                  {brands.map((b, i) => (
                    <option key={i} value={b} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={handleApplyBulkBrand}
                  disabled={!bulkBrand}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-2.5 py-1 text-xs font-bold rounded-xs cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold">Bulk Supplier Assignment:</label>
              <div className="flex gap-1.5">
                <select
                  value={bulkSupplierId}
                  onChange={(e) => setBulkSupplierId(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 py-1 px-2 text-xs rounded-xs"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleApplyBulkSupplier}
                  disabled={!bulkSupplierId}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-2.5 py-1 text-xs font-bold rounded-xs cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Stock Addition */}
          <div className="bg-white p-3 border border-slate-200 space-y-2 rounded-xs shadow-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Stock Adjustment</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold">Adjust Stock Qty (+/-):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bulkStockAdd === 0 ? '' : bulkStockAdd}
                  onChange={(e) => setBulkStockAdd(parseInt(e.target.value) || 0)}
                  placeholder="+50 or -10"
                  className="flex-1 bg-white border border-slate-300 px-2.5 py-1 text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkStock}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 font-bold text-xs rounded-xs cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-2">
              Tip: You can also edit individual cells directly in the table below before saving!
            </p>
          </div>

          {/* 🛠️ Proportional Utility Distribution (NEW SCENE) */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 space-y-2 rounded-xs shadow-xs">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5 border-b border-emerald-200 pb-1.5">
              <span>🛠️ Proportional Utilities</span>
            </div>

            <div>
              <label className="text-[10px] text-emerald-800 font-bold block mb-1">
                Total Utility Cost ({storeSettings.currency}):
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={bulkUtilityAmount === 0 ? '' : bulkUtilityAmount}
                  onChange={(e) => setBulkUtilityAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 200,000"
                  className="flex-1 bg-white border border-emerald-300 px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkUtility}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 text-xs font-black rounded-xs transition-colors cursor-pointer"
                >
                  Distribute
                </button>
              </div>
            </div>

            <p className="text-[9.5px] text-emerald-800 leading-tight">
              <strong>Calculates automatically:</strong> Distributes cost proportionally among these items. Highest price items get the most, lowest price items get the least.
            </p>
          </div>
        </div>

        {/* Live Editable Table */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100/50">
          <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Barcode</th>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3">Company / Brand</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Cost ({storeSettings.currency})</th>
                  <th className="py-2 px-3 text-right">Retail ({storeSettings.currency})</th>
                  <th className="py-2 px-3 text-right">Wholesale ({storeSettings.currency})</th>
                  <th className="py-2 px-3 text-center">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-slate-700 font-bold">{item.barcode}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, name: val } : p)));
                        }}
                        className="w-full bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-900 focus:outline-none focus:border-[#0070ba]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.company}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, company: val } : p)));
                        }}
                        className="w-full bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, category: val } : p)));
                        }}
                        className="w-full bg-white border border-slate-200 px-1.5 py-0.5 text-xs text-slate-800"
                      >
                        {categories.map((cat, i) => (
                          <option key={i} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="any"
                        value={item.purchasePrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, purchasePrice: val } : p)));
                        }}
                        className="w-20 text-right bg-white border border-slate-200 px-1.5 py-0.5 text-xs font-mono font-bold text-slate-800 focus:border-[#0070ba]"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="any"
                        value={item.retailPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, retailPrice: val, wholesalePrice: Math.round(val * 0.9 * 100) / 100 } : p)));
                        }}
                        className="w-20 text-right bg-white border border-emerald-300 text-emerald-800 px-1.5 py-0.5 text-xs font-mono font-bold focus:border-emerald-600"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="any"
                        value={item.wholesalePrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, wholesalePrice: val } : p)));
                        }}
                        className="w-20 text-right bg-white border border-slate-200 px-1.5 py-0.5 text-xs font-mono text-slate-800 focus:border-[#0070ba]"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        value={item.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, stock: val } : p)));
                        }}
                        className="w-16 text-center bg-white border border-slate-200 px-1 py-0.5 text-xs font-mono font-bold text-slate-900 focus:border-[#0070ba]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-600 font-medium">
            Ready to update <strong>{items.length}</strong> products in database.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 text-xs font-bold rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 text-xs font-bold flex items-center gap-2 rounded-xs shadow cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update {items.length} Products</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
