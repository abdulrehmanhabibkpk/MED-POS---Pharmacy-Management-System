import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  ScanLine,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ClipboardPaste,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { posSound } from '../utils/audio';

interface BulkProductEntryModalProps {
  existingProducts: Product[];
  storeSettings: StoreSettings;
  onSaveAll: (products: Omit<Product, 'id'>[]) => void;
  onClose: () => void;
}

export interface BulkRow {
  tempId: string;
  barcode: string;
  name: string;
  company: string;
  purchasePrice: number | '';
  retailPrice: number | '';
  wholesalePrice: number | '';
  stock: number | '';
  category: string;
}

const CATEGORIES = [
  'Pharmacy',
  'Medicines (Tablets)',
  'Syrups & Suspensions',
  'Injections & Drops',
  'Surgical & Dental',
  'General Items',
  'Cosmetics & Skin',
  'Baby Care',
  'Beverages & Food',
  'Snacks & Grocery',
];

export const BulkProductEntryModal: React.FC<BulkProductEntryModalProps> = ({
  existingProducts,
  storeSettings,
  onSaveAll,
  onClose,
}) => {
  const currency = storeSettings.currency || 'Rs.';

  const createEmptyRow = (customBarcode?: string): BulkRow => ({
    tempId: `row-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    barcode: customBarcode || '',
    name: '',
    company: 'General',
    purchasePrice: '',
    retailPrice: '',
    wholesalePrice: '',
    stock: 10,
    category: 'Pharmacy',
  });

  // Start with 5 clean rows
  const [rows, setRows] = useState<BulkRow[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]);

  const [activeBarcodeIndex, setActiveBarcodeIndex] = useState<number | null>(0);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const barcodeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nameInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first barcode field on open
  useEffect(() => {
    setTimeout(() => {
      barcodeInputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const addRows = (count: number) => {
    const newRows = Array.from({ length: count }, () => createEmptyRow());
    setRows((prev) => [...prev, ...newRows]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) {
      setRows([createEmptyRow()]);
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearEmptyRows = () => {
    const valid = rows.filter((r) => r.barcode.trim() || r.name.trim());
    if (valid.length === 0) {
      setRows([createEmptyRow()]);
    } else {
      setRows(valid);
    }
  };

  const updateRow = (index: number, field: keyof BulkRow, value: any) => {
    setRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };

      // If user enters retail price and wholesale price is empty, default wholesale = retail
      if (field === 'retailPrice' && (row.wholesalePrice === '' || row.wholesalePrice === undefined)) {
        row.wholesalePrice = value;
      }

      updated[index] = row;
      return updated;
    });
  };

  const generateAutoBarcode = (index: number) => {
    const randomCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    updateRow(index, 'barcode', randomCode);
    posSound.playScanBeep();
  };

  // Check if barcode already exists in database with a different rate
  const checkBarcodeStatus = (barcode: string, currentRetailPrice: number | '') => {
    if (!barcode.trim()) return null;
    const existing = existingProducts.filter(
      (p) => p.barcode.trim().toLowerCase() === barcode.trim().toLowerCase()
    );
    if (existing.length === 0) return null;

    const currentPriceNum = Number(currentRetailPrice) || 0;
    const differentPriceFound = existing.some((p) => p.retailPrice !== currentPriceNum && currentPriceNum > 0);

    return {
      count: existing.length,
      isMultiRate: differentPriceFound,
      existingRates: existing.map((p) => `${currency} ${p.retailPrice}`).join(', '),
    };
  };

  // Keyboard navigation & rapid entry
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: keyof BulkRow
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If pressing Enter on Category or Stock (last column of row)
      if (field === 'category' || field === 'stock') {
        if (rowIndex === rows.length - 1) {
          // Add a new row and focus its barcode
          addRows(1);
          setTimeout(() => {
            barcodeInputRefs.current[rowIndex + 1]?.focus();
          }, 50);
        } else {
          barcodeInputRefs.current[rowIndex + 1]?.focus();
        }
      } else if (field === 'barcode') {
        nameInputRefs.current[rowIndex]?.focus();
      }
    }
  };

  // Quick Paste from Excel / CSV
  const handleProcessPastedData = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.trim().split('\n');
    const parsedRows: BulkRow[] = [];

    lines.forEach((line) => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      if (parts.length > 0 && parts.some((p) => p.trim())) {
        const barcode = parts[0]?.trim() || '';
        const name = parts[1]?.trim() || '';
        const company = parts[2]?.trim() || 'General';
        const purchasePrice = parseFloat(parts[3]?.trim() || '0') || 0;
        const retailPrice = parseFloat(parts[4]?.trim() || '0') || 0;
        const wholesalePrice = parseFloat(parts[5]?.trim() || parts[4]?.trim() || '0') || retailPrice;
        const stock = parseInt(parts[6]?.trim() || '10', 10) || 10;
        const category = parts[7]?.trim() || 'Pharmacy';

        if (name || barcode) {
          parsedRows.push({
            tempId: `row-${Date.now()}-${Math.random()}`,
            barcode: barcode || Math.floor(10000000 + Math.random() * 90000000).toString(),
            name: name || 'New Item',
            company,
            purchasePrice,
            retailPrice,
            wholesalePrice,
            stock,
            category,
          });
        }
      }
    });

    if (parsedRows.length > 0) {
      setRows((prev) => {
        // filter out completely blank rows
        const existingValid = prev.filter((r) => r.barcode.trim() || r.name.trim());
        return [...existingValid, ...parsedRows];
      });
      setPasteModalOpen(false);
      setPasteText('');
      posSound.playSuccessChime();
    } else {
      alert('Could not parse valid product rows from pasted text.');
    }
  };

  // Save All Rows at Once
  const handleSaveAll = () => {
    // Filter rows that have at least a Name or Barcode
    const validRows = rows.filter((r) => r.name.trim() !== '');

    if (validRows.length === 0) {
      alert('Please enter at least one product with a Name to save.');
      return;
    }

    // Format products for saving
    const productsToSave: Omit<Product, 'id'>[] = validRows.map((r) => {
      const finalBarcode = r.barcode.trim() || Math.floor(10000000 + Math.random() * 90000000).toString();
      const purchasePrice = typeof r.purchasePrice === 'number' ? r.purchasePrice : parseFloat(r.purchasePrice || '0') || 0;
      const retailPrice = typeof r.retailPrice === 'number' ? r.retailPrice : parseFloat(r.retailPrice || '0') || 0;
      const wholesalePrice = typeof r.wholesalePrice === 'number' ? r.wholesalePrice : (parseFloat(r.wholesalePrice || '0') || retailPrice);
      const stock = typeof r.stock === 'number' ? r.stock : parseInt(r.stock || '0', 10) || 0;

      return {
        barcode: finalBarcode,
        name: r.name.trim(),
        company: r.company.trim() || 'General',
        category: r.category.trim() || 'Pharmacy',
        purchasePrice,
        retailPrice,
        wholesalePrice,
        stock,
        minStockAlert: 5,
      };
    });

    posSound.playSuccessChime();
    onSaveAll(productsToSave);
    setSavedCount(productsToSave.length);
    setShowSuccessToast(true);

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Statistics calculation for the bulk batch
  const validRowCount = rows.filter((r) => r.name.trim() !== '').length;
  const totalStockQuantity = rows.reduce((acc, r) => acc + (Number(r.stock) || 0), 0);
  const totalPurchaseValue = rows.reduce(
    (acc, r) => acc + (Number(r.purchasePrice) || 0) * (Number(r.stock) || 0),
    0
  );
  const totalRetailValue = rows.reduce(
    (acc, r) => acc + (Number(r.retailPrice) || 0) * (Number(r.stock) || 0),
    0
  );
  const totalExpectedProfit = Math.max(0, totalRetailValue - totalPurchaseValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#002b49] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide">
                  Fast Bulk Product Entry (List Products)
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  100 to 1000+ Items Rapid Entry
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Scan barcode, enter name, company, rates, stock & auto-calculate profit margins simultaneously.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPasteModalOpen(true)}
              type="button"
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Paste columns directly from Microsoft Excel or Google Sheets"
            >
              <ClipboardPaste className="w-4 h-4 text-emerald-400" />
              <span>Paste from Excel</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Quick Actions */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700">Quick Add Rows:</span>
            <button
              onClick={() => addRows(1)}
              type="button"
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold py-1 px-2.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+1 Row</span>
            </button>
            <button
              onClick={() => addRows(5)}
              type="button"
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold py-1 px-2.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+5 Rows</span>
            </button>
            <button
              onClick={() => addRows(10)}
              type="button"
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold py-1 px-2.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+10 Rows</span>
            </button>
            <button
              onClick={() => addRows(50)}
              type="button"
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold py-1 px-2.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+50 Rows</span>
            </button>
            <button
              onClick={handleClearEmptyRows}
              type="button"
              className="text-xs text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
            >
              Clear Blank Rows
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-800">{validRowCount}</span> products ready to save
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-1.5 text-slate-600">
              Expected Profit:
              <span className="font-bold text-emerald-700">
                {currency} {totalExpectedProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 flex items-center justify-between text-xs font-bold animate-in slide-in-from-top duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Successfully saved {savedCount} products to database inventory!</span>
            </div>
          </div>
        )}

        {/* Spreadsheet Data Entry Table */}
        <div className="flex-1 overflow-auto bg-slate-100/60 p-4">
          <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
              <thead className="bg-[#002b49] text-white select-none sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-2 text-center w-10 border-r border-slate-700">#</th>
                  <th className="py-2.5 px-3 w-48 border-r border-slate-700">
                    <div className="flex items-center gap-1">
                      <ScanLine className="w-3.5 h-3.5 text-amber-300" />
                      <span>Barcode</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-3 min-w-[180px] border-r border-slate-700">
                    <span>Product / Medicine Name *</span>
                  </th>
                  <th className="py-2.5 px-3 w-36 border-r border-slate-700">Company / Brand</th>
                  <th className="py-2.5 px-3 w-28 text-right border-r border-slate-700">
                    Purchase Rate ({currency})
                  </th>
                  <th className="py-2.5 px-3 w-28 text-right border-r border-slate-700">
                    Retail Rate ({currency})
                  </th>
                  <th className="py-2.5 px-3 w-28 text-right border-r border-slate-700">
                    Wholesale ({currency})
                  </th>
                  <th className="py-2.5 px-3 w-36 text-center border-r border-slate-700 bg-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Profit (Auto)</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-3 w-24 text-center border-r border-slate-700">Stock Qty</th>
                  <th className="py-2.5 px-3 w-36 border-r border-slate-700">Category</th>
                  <th className="py-2.5 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row, idx) => {
                  const purchase = Number(row.purchasePrice) || 0;
                  const retail = Number(row.retailPrice) || 0;
                  const profit = retail - purchase;
                  const profitPercent = purchase > 0 ? (profit / purchase) * 100 : (retail > 0 ? 100 : 0);

                  const barcodeStatus = checkBarcodeStatus(row.barcode, row.retailPrice);

                  return (
                    <tr
                      key={row.tempId}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        row.name.trim() ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="py-2 px-2 text-center text-slate-400 font-mono text-[11px] border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* Barcode Field with Scan Listener / Auto-Gen */}
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="relative flex items-center">
                          <input
                            ref={(el) => { barcodeInputRefs.current[idx] = el; }}
                            type="text"
                            value={row.barcode}
                            onChange={(e) => updateRow(idx, 'barcode', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'barcode')}
                            placeholder="Scan or enter code"
                            className={`w-full text-xs font-mono py-1 px-2 pr-7 border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0078d7] ${
                              barcodeStatus?.isMultiRate
                                ? 'border-amber-400 bg-amber-50/50'
                                : 'border-slate-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => generateAutoBarcode(idx)}
                            className="absolute right-1 text-slate-400 hover:text-[#0078d7] p-0.5 rounded"
                            title="Auto-generate random barcode"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {barcodeStatus?.isMultiRate && (
                          <div className="mt-0.5 text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                            <span>Multi-Rate! Existing: {barcodeStatus.existingRates}</span>
                          </div>
                        )}
                      </td>

                      {/* Product Name Field */}
                      <td className="p-1.5 border-r border-slate-200">
                        <input
                          ref={(el) => { nameInputRefs.current[idx] = el; }}
                          type="text"
                          value={row.name}
                          onChange={(e) => updateRow(idx, 'name', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'name')}
                          placeholder="e.g. Panadol Extra 500mg"
                          className="w-full text-xs font-medium py-1 px-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0078d7]"
                        />
                      </td>

                      {/* Company Field */}
                      <td className="p-1.5 border-r border-slate-200">
                        <input
                          type="text"
                          value={row.company}
                          onChange={(e) => updateRow(idx, 'company', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'company')}
                          placeholder="e.g. GSK"
                          className="w-full text-xs py-1 px-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0078d7]"
                        />
                      </td>

                      {/* Purchase Rate Field */}
                      <td className="p-1.5 border-r border-slate-200">
                        <input
                          type="number"
                          step="any"
                          value={row.purchasePrice}
                          onChange={(e) => updateRow(idx, 'purchasePrice', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'purchasePrice')}
                          placeholder="0.00"
                          className="w-full text-xs font-semibold py-1 px-2 text-right border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0078d7]"
                        />
                      </td>

                      {/* Retail Rate Field */}
                      <td className="p-1.5 border-r border-slate-200">
                        <input
                          type="number"
                          step="any"
                          value={row.retailPrice}
                          onChange={(e) => updateRow(idx, 'retailPrice', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'retailPrice')}
                          placeholder="0.00"
                          className="w-full text-xs font-bold py-1 px-2 text-right border border-slate-300 rounded bg-white text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#0078d7]"
                        />
                      </td>

                      {/* Wholesale Rate Field */}
                      <td className="p-1.5 border-r border-slate-200">
                        <input
                          type="number"
                          step="any"
                          value={row.wholesalePrice}
                          onChange={(e) => updateRow(idx, 'wholesalePrice', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'wholesalePrice')}
                          placeholder="0.00"
                          className="w-full text-xs py-1 px-2 text-right border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0078d7]"
                        />
                      </td>

                      {/* Profit Auto-Generated Live Badge */}
                      <td className="p-1.5 text-center border-r border-slate-200 bg-slate-50/50">
                        {retail > 0 || purchase > 0 ? (
                          <div className="inline-flex flex-col items-center justify-center">
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded ${
                                profit > 0
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : profit < 0
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {profit >= 0 ? '+' : ''}
                              {currency} {profit.toFixed(2)}
                            </span>
                            {purchase > 0 && (
                              <span className="text-[10px] text-slate-500 font-bold mt-0.5">
                                {profitPercent.toFixed(1)}% margin
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="p-1.5 border-r border-slate-200">
                        <input
                          type="number"
                          value={row.stock}
                          onChange={(e) => updateRow(idx, 'stock', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'stock')}
                          placeholder="10"
                          className="w-full text-xs font-semibold py-1 px-2 text-center border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0078d7]"
                        />
                      </td>

                      {/* Category */}
                      <td className="p-1.5 border-r border-slate-200">
                        <input
                          list="category-suggestions"
                          type="text"
                          value={row.category}
                          onChange={(e) => updateRow(idx, 'category', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'category')}
                          placeholder="Pharmacy"
                          className="w-full text-xs py-1 px-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0078d7]"
                        />
                      </td>

                      {/* Delete Row Button */}
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete this row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <datalist id="category-suggestions">
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Footer Summary & Save Bar */}
        <div className="bg-white border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-6 text-xs text-slate-700">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Stock Units</span>
              <span className="text-sm font-bold text-slate-900">{totalStockQuantity} units</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Purchase Investment</span>
              <span className="text-sm font-bold text-slate-900">{currency} {totalPurchaseValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Retail Value</span>
              <span className="text-sm font-bold text-[#002b49]">{currency} {totalRetailValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Margin</span>
              <span className="text-sm font-black text-emerald-700">+{currency} {totalExpectedProfit.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="bg-[#28a745] hover:bg-[#218838] text-white font-bold text-xs py-2 px-6 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save All Products ({validRowCount} Items)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paste from Excel / CSV Popup Sub-Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Paste Products Directly from Excel / Sheets
                </h3>
              </div>
              <button
                onClick={() => setPasteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Copy columns from your Excel file in order: <br />
              <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-1">
                Barcode | Product Name | Company | Purchase Rate | Retail Rate | Wholesale Rate | Stock | Category
              </code>
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your copied rows here (Ctrl+V)..."
              className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0078d7]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessPastedData}
                className="bg-[#0078d7] hover:bg-[#0066b8] text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Parse & Add Rows</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
