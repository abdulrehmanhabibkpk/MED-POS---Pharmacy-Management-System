import React, { useState, useCallback } from 'react';
import { Package, Search, CheckCircle2, History, Box, ScanLine, Edit2, Trash2, Check, X, Printer, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { PurchaseRecord, Product } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { useHardwareScanner } from '../hooks/useHardwareScanner';
import { posSound } from '../utils/audio';

export const PurchaseStockView: React.FC = () => {
  const { products, addPurchase, updatePurchase, deletePurchase, purchases, storeSettings, suppliers, brands, categories } = usePOS();

  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Pharmacy');
  const [brand, setBrand] = useState('');
  const [qtyReceived, setQtyReceived] = useState<number>(1);
  const [unitCostPrice, setUnitCostPrice] = useState<number>(0);
  const [salePriceRetail, setSalePriceRetail] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Price Difference Warning Modal State
  const [priceWarningData, setPriceWarningData] = useState<{
    existingProduct: Product;
    purchaseData: Omit<PurchaseRecord, 'id' | 'date'>;
  } | null>(null);

  // Edit Modal State
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);

  const fetchItemByCode = useCallback((codeToFind: string) => {
    const cleanCode = codeToFind.trim();
    if (!cleanCode) return;
    const found = products.find(
      (p) => p.barcode.trim().toLowerCase() === cleanCode.toLowerCase()
    );
    if (found) {
      setBarcode(found.barcode);
      setItemName(found.name);
      if (found.supplierId) {
        setSupplierId(found.supplierId);
        setSupplierName(found.supplierName || found.company || '');
      } else {
        setSupplierName(found.supplierName || found.company || '');
        const matched = suppliers.find(s => s.name.toLowerCase() === (found.company || '').toLowerCase());
        if (matched) setSupplierId(matched.id);
      }
      setBrand(found.company || '');
      setCategory(found.category || 'Pharmacy');
      setUnitCostPrice(found.purchasePrice);
      setSalePriceRetail(found.retailPrice);
      setWholesalePrice(found.wholesalePrice);
      setSuccessMsg(`Auto-loaded "${found.name}" details (Current Stock: ${found.stock}).`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setBarcode(cleanCode);
      setSuccessMsg(`New barcode "${cleanCode}" entered. Complete details to register.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  }, [products, suppliers]);

  const handleFetchItem = () => {
    if (!barcode.trim()) {
      alert('Please enter or scan a barcode.');
      return;
    }
    fetchItemByCode(barcode);
  };

  // Hardware Barcode Scanner for Purchase Stock
  useHardwareScanner({
    onScan: (scannedCode) => {
      posSound.playScanBeep();
      fetchItemByCode(scannedCode);
    },
    enabled: true,
  });

  const executeSavePurchase = (purchaseData: Omit<PurchaseRecord, 'id' | 'date'>, mode?: 'update_existing' | 'create_batch') => {
    addPurchase(purchaseData, mode);

    setSuccessMsg(`Successfully received ${purchaseData.qtyReceived}x "${purchaseData.itemName}" (Total Cost: ${storeSettings.currency} ${purchaseData.totalCost.toLocaleString()}).`);
    posSound.playSuccessChime();
    setTimeout(() => setSuccessMsg(''), 4000);

    // Reset inputs
    setSupplierId('');
    setSupplierName('');
    setBarcode('');
    setItemName('');
    setBrand('');
    setCategory('Pharmacy');
    setQtyReceived(1);
    setUnitCostPrice(0);
    setSalePriceRetail(0);
    setWholesalePrice(0);
    setPriceWarningData(null);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || !itemName.trim()) {
      alert('Barcode and Item Name are required.');
      return;
    }
    if (qtyReceived <= 0) {
      alert('Quantity received must be at least 1.');
      return;
    }

    const totalCost = unitCostPrice * qtyReceived;

    const purchaseData: Omit<PurchaseRecord, 'id' | 'date'> = {
      supplierId: supplierId || undefined,
      supplierName: supplierName.trim() || brand.trim() || 'General Supplier',
      barcode: barcode.trim(),
      itemName: itemName.trim(),
      qtyReceived,
      unitCostPrice,
      salePriceRetail,
      wholesalePrice,
      totalCost,
    };

    // Check if this product already exists in catalog and has a price difference
    const existing = products.find(
      (p) => p.barcode.trim().toLowerCase() === barcode.trim().toLowerCase()
    );

    if (existing) {
      const isPriceDifferent =
        (unitCostPrice > 0 && Math.abs(unitCostPrice - existing.purchasePrice) > 0.01) ||
        (salePriceRetail > 0 && Math.abs(salePriceRetail - existing.retailPrice) > 0.01) ||
        (wholesalePrice > 0 && Math.abs(wholesalePrice - existing.wholesalePrice) > 0.01);

      if (isPriceDifferent) {
        // Prompt user: Is this a price change or a new batch variant?
        setPriceWarningData({
          existingProduct: existing,
          purchaseData,
        });
        return;
      }
    }

    // Normal save
    executeSavePurchase(purchaseData, 'update_existing');
  };

  const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalCost, 0);

  return (
    <div id="purchase-stock-container" className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Upper header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Inward Purchase Stock Inventory
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Scan medicine barcodes to receive new purchase stock batches, record supplier bills, and automatically update sale rates.
            </p>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Receive Stock (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
            <span>➕ Receive New Stock</span>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePurchase} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Distributor / Supplier
                </label>
                <div className="space-y-1.5">
                  <select
                    value={supplierId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSupplierId(selectedId);
                      const found = suppliers.find((s) => s.id === selectedId);
                      if (found) {
                        setSupplierName(found.name);
                        if (!brand && found.company) setBrand(found.company);
                      } else if (!selectedId) {
                        setSupplierName('');
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.company ? `(${s.company})` : ''}
                      </option>
                    ))}
                  </select>

                  <input
                    id="purchase-supplier-name"
                    type="text"
                    list="suppliers-list-datalist"
                    value={supplierName}
                    onChange={(e) => {
                      setSupplierName(e.target.value);
                      const matched = suppliers.find(
                        (s) => s.name.toLowerCase() === e.target.value.toLowerCase()
                      );
                      if (matched) setSupplierId(matched.id);
                      else setSupplierId('');
                    }}
                    placeholder="Or type supplier name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                  <datalist id="suppliers-list-datalist">
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Company / Brand
                </label>
                <input
                  type="text"
                  list="brands-list-datalist"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. GSK, Abbott..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <datalist id="brands-list-datalist">
                  {brands.map((b, idx) => (
                    <option key={idx} value={b} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Medicine Barcode / Code *
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="purchase-barcode-input"
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFetchItem();
                    }
                  }}
                  placeholder="Scan or enter barcode..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={handleFetchItem}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                  title="Search registered product"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowScannerModal(true)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 p-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  title="Open Camera Scanner"
                >
                  <ScanLine className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Medicine / Item Name *
              </label>
              <input
                id="purchase-item-name"
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Panadol 500mg Strip 10s"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Quantity Received *
                </label>
                <input
                  id="purchase-qty-input"
                  type="number"
                  required
                  min="1"
                  value={qtyReceived}
                  onChange={(e) => setQtyReceived(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Unit Cost Price ({storeSettings.currency}) *
                </label>
                <input
                  id="purchase-unit-cost"
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={unitCostPrice === 0 ? '' : unitCostPrice}
                  onChange={(e) => setUnitCostPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Retail Sale Price ({storeSettings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={salePriceRetail === 0 ? '' : salePriceRetail}
                  onChange={(e) => setSalePriceRetail(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Wholesale Price ({storeSettings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={wholesalePrice === 0 ? '' : wholesalePrice}
                  onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-save-purchase-stock"
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-100 transition-all active:scale-95 uppercase tracking-wider"
              >
                <Box className="w-4 h-4" />
                <span>Save Stock Purchase</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Table: Purchase History (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Purchase History & Stock-In Log</span>
            </div>
            <div className="text-xs text-slate-500 font-bold bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl font-mono">
              Total Purchases:{' '}
              <span className="text-emerald-600 font-black">
                {storeSettings.currency} {totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-black">Date</th>
                  <th className="py-3 px-4 font-black">Supplier</th>
                  <th className="py-3 px-4 font-black">Barcode</th>
                  <th className="py-3 px-4 font-black">Item Name</th>
                  <th className="py-3 px-4 text-center font-black">Qty</th>
                  <th className="py-3 px-4 text-right font-black">Cost</th>
                  <th className="py-3 px-4 text-right font-black">Total</th>
                  <th className="py-3 px-4 text-center font-black">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-slate-400 font-bold">
                      No stock receiving records found.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{p.date}</td>
                      <td className="py-3 px-4 text-slate-900 font-extrabold">{p.supplierName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{p.barcode}</td>
                      <td className="py-3 px-4 font-black text-slate-900 text-sm">{p.itemName}</td>
                      <td className="py-3 px-4 text-center font-black text-emerald-700 bg-emerald-50/20">{p.qtyReceived}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {storeSettings.currency}{' '}
                        {p.unitCostPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600 font-mono">
                        {storeSettings.currency}{' '}
                        {p.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingPurchase(p)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Stock Purchase"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete purchase record for "${p.itemName}"?`)) {
                                deletePurchase(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Purchase Record Modal */}
      {editingPurchase && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800 rounded-3xl border border-slate-100">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">
                ✏️ Edit Purchase Record ({editingPurchase.itemName})
              </span>
              <button onClick={() => setEditingPurchase(null)} className="text-slate-400 hover:text-slate-950 p-1 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updatePurchase({
                  ...editingPurchase,
                  totalCost: editingPurchase.unitCostPrice * editingPurchase.qtyReceived,
                });
                setEditingPurchase(null);
              }}
              className="p-6 space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Item / Medicine Name:</label>
                <input
                  type="text"
                  value={editingPurchase.itemName}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, itemName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Barcode:</label>
                  <input
                    type="text"
                    value={editingPurchase.barcode}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, barcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Supplier / Distributor:</label>
                  <input
                    type="text"
                    value={editingPurchase.supplierName}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, supplierName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Qty Received:</label>
                  <input
                    type="number"
                    value={editingPurchase.qtyReceived}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, qtyReceived: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Unit Cost Price:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingPurchase.unitCostPrice}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, unitCostPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Retail Sale Price:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingPurchase.salePriceRetail}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, salePriceRetail: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPurchase(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Purchase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Difference Warning Modal: Price Change vs New Batch Variant */}
      {priceWarningData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-100 max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 rounded-3xl">
            {/* Header */}
            <div className="bg-amber-500 text-slate-950 px-6 py-4 flex items-center justify-between font-black text-sm uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-slate-950" />
                <span>⚠️ Rate Difference Detected</span>
              </div>
              <button
                type="button"
                onClick={() => setPriceWarningData(null)}
                className="text-slate-950 hover:text-black p-1 rounded-xl hover:bg-amber-600/30 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="bg-amber-50 border border-amber-100 p-4 text-amber-900 rounded-2xl">
                <p className="font-black text-base text-slate-900">
                  {priceWarningData.existingProduct.name}
                </p>
                <p className="font-mono text-[11px] text-slate-500 font-bold mt-1">
                  Barcode: <span className="text-slate-800">{priceWarningData.existingProduct.barcode}</span>
                </p>
                <p className="mt-2 text-slate-700 font-semibold leading-relaxed">
                  The inward purchase prices you entered differ from this product's current catalog rates. Please specify how this stock should be saved:
                </p>
              </div>

              {/* Rate Comparison Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Existing Catalog Rates */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 font-semibold">
                  <div className="font-black text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>Current Catalog</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg font-mono">
                      Stock: {priceWarningData.existingProduct.stock}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Purchase Cost:</span>
                    <strong className="font-mono">{storeSettings.currency} {priceWarningData.existingProduct.purchasePrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold">
                    <span>Retail Price:</span>
                    <strong className="font-mono text-emerald-700">{storeSettings.currency} {priceWarningData.existingProduct.retailPrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Wholesale Price:</span>
                    <strong className="font-mono">{storeSettings.currency} {priceWarningData.existingProduct.wholesalePrice.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Incoming Stock Rates */}
                <div className="bg-amber-50/40 border border-amber-200 p-4 rounded-2xl space-y-2 font-semibold">
                  <div className="font-black text-amber-900 uppercase tracking-wide border-b border-amber-200 pb-1.5 flex items-center justify-between">
                    <span>Incoming Stock</span>
                    <span className="text-[10px] bg-amber-150 text-amber-900 px-2 py-0.5 rounded-lg font-bold font-mono">
                      Qty: +{priceWarningData.purchaseData.qtyReceived}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>New Cost:</span>
                    <strong className="font-mono text-amber-900">{storeSettings.currency} {priceWarningData.purchaseData.unitCostPrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold">
                    <span>New Retail:</span>
                    <strong className="font-mono text-rose-700">{storeSettings.currency} {priceWarningData.purchaseData.salePriceRetail.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>New Wholesale:</span>
                    <strong className="font-mono">{storeSettings.currency} {priceWarningData.purchaseData.wholesalePrice.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Choices */}
              <div className="space-y-3 pt-2 font-semibold">
                <button
                  type="button"
                  onClick={() => executeSavePurchase(priceWarningData.purchaseData, 'update_existing')}
                  className="w-full bg-blue-50 border border-blue-100 hover:bg-blue-100/60 text-slate-900 p-4 rounded-2xl flex items-center justify-between text-left shadow-xs transition-all cursor-pointer group"
                >
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                      <span>🔄 Option 1: Update Existing Product Price</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed">
                      Change the general price of this item to the new rate (New Retail: {storeSettings.currency} {priceWarningData.purchaseData.salePriceRetail}) and merge new quantity with existing stock.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 shrink-0 ml-2 text-blue-600 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => executeSavePurchase(priceWarningData.purchaseData, 'create_batch')}
                  className="w-full bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/60 text-slate-900 p-4 rounded-2xl flex items-center justify-between text-left shadow-xs transition-all cursor-pointer group"
                >
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Option 2: Create New Inventory Batch (Keep Both Rates)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed">
                      Keep old {priceWarningData.existingProduct.stock} units at {storeSettings.currency} {priceWarningData.existingProduct.retailPrice}, and add new {priceWarningData.purchaseData.qtyReceived} units at {storeSettings.currency} {priceWarningData.purchaseData.salePriceRetail}. On scanning, system will show both rates to select from!
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 shrink-0 ml-2 text-emerald-600 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPriceWarningData(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel & Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={(scannedBarcode) => {
          fetchItemByCode(scannedBarcode);
          setShowScannerModal(false);
        }}
        title="Stock Purchase Barcode Scanner"
      />
    </div>
  );
};
