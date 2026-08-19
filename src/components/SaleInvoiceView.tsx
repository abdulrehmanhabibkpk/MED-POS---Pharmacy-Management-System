import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pill, Plus, Trash2, Printer, CheckSquare, RotateCcw, Search, Edit3, Settings, Check, ScanLine, Smartphone, Layers } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { CartItem, Product, ThermalPaperSize } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { MultiRateSelectorModal } from './MultiRateSelectorModal';
import { useHardwareScanner } from '../hooks/useHardwareScanner';
import { posSound } from '../utils/audio';

export const SaleInvoiceView: React.FC = () => {
  const { products, addSale, setPreviewInvoice, storeSettings, thermalPaperSize, setThermalPaperSize } = usePOS();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [qtyInput, setQtyInput] = useState<number>(1);
  const [customerInput, setCustomerInput] = useState('Cash Customer');
  const [saleType, setSaleType] = useState<'Retail' | 'Wholesale'>('Retail');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [multiRateData, setMultiRateData] = useState<{ barcode: string; matchingProducts: Product[] } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const addItemToCart = useCallback((product: Product, qty: number, discount: number, overrideWholesale?: boolean) => {
    if (qty <= 0) return;

    const isWs = overrideWholesale !== undefined ? overrideWholesale : saleType === 'Wholesale';
    const rate = isWs ? product.wholesalePrice : product.retailPrice;
    const subtotal = Math.max(0, rate * qty - discount);

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].qty + qty;
        const newSubtotal = Math.max(0, updated[existingIndex].rate * newQty - updated[existingIndex].discount);
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          subtotal: newSubtotal,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            qty,
            rate,
            discount,
            subtotal,
          },
        ];
      }
    });

    setQtyInput(1);
    setDiscountInput(0);
  }, [saleType]);

  // Handle scanned barcode from Live Camera or Mobile Gun
  const handleScannerDetected = useCallback((scannedCode: string, wholesaleMode?: boolean) => {
    const code = scannedCode.trim();
    if (!code) return;

    // Look up all products matching this barcode
    const barcodeMatches = products.filter(
      (p) => p.barcode.trim().toLowerCase() === code.toLowerCase()
    );

    if (barcodeMatches.length > 1) {
      // MULTI-RATE SCENARIO: multiple price batches registered for same barcode
      setMultiRateData({ barcode: code, matchingProducts: barcodeMatches });
      return;
    }

    if (barcodeMatches.length === 1) {
      const found = barcodeMatches[0];
      if (wholesaleMode) {
        setSaleType('Wholesale');
      }
      addItemToCart(found, 1, 0, wholesaleMode);
      setScanNotice(`Added: ${found.name} (Rs. ${wholesaleMode ? found.wholesalePrice : (saleType === 'Wholesale' ? found.wholesalePrice : found.retailPrice)})`);
      setTimeout(() => setScanNotice(null), 3000);
      return;
    }

    // Check by exact name match
    const nameMatches = products.filter(
      (p) => p.name.trim().toLowerCase() === code.toLowerCase()
    );

    if (nameMatches.length > 1) {
      setMultiRateData({ barcode: code, matchingProducts: nameMatches });
      return;
    } else if (nameMatches.length === 1) {
      addItemToCart(nameMatches[0], 1, 0, wholesaleMode);
      setScanNotice(`Added: ${nameMatches[0].name}`);
      setTimeout(() => setScanNotice(null), 3000);
      return;
    }

    posSound.playErrorBeep();
    setScanNotice(`Barcode "${code}" not found in catalog!`);
    setTimeout(() => setScanNotice(null), 4000);
  }, [products, addItemToCart, saleType]);

  // 1. Hardware Barcode Scanner Auto-Detection (USB / Bluetooth Laser Gun)
  useHardwareScanner({
    onScan: (barcode) => {
      posSound.playScanBeep();
      handleScannerDetected(barcode);
    },
    enabled: true,
  });

  // 2. Cross-Device Android Mobile Scanner Sync Listener (BroadcastChannel & localStorage)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'med_pos_latest_scan' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data && data.barcode) {
            handleScannerDetected(data.barcode, data.wholesale);
          }
        } catch {}
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('med_pos_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'BARCODE_SCANNED' && event.data.barcode) {
          handleScannerDetected(event.data.barcode, event.data.wholesale);
        }
      };
    }

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [handleScannerDetected]);

  // Filter products for autocomplete search
  useEffect(() => {
    if (barcodeInput.trim().length > 0) {
      const q = barcodeInput.toLowerCase().trim();
      const filtered = products.filter(
        (p) =>
          p.barcode.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q)
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [barcodeInput, products]);

  const handleSelectProduct = (product: Product) => {
    addItemToCart(product, qtyInput, discountInput);
    setBarcodeInput('');
    setShowSuggestions(false);
    barcodeInputRef.current?.focus();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    // Search matches by barcode
    const barcodeMatches = products.filter(
      (p) => p.barcode.trim().toLowerCase() === code.toLowerCase()
    );

    if (barcodeMatches.length > 1) {
      setMultiRateData({ barcode: code, matchingProducts: barcodeMatches });
      setBarcodeInput('');
      setShowSuggestions(false);
      return;
    }

    if (barcodeMatches.length === 1) {
      addItemToCart(barcodeMatches[0], qtyInput, discountInput);
      setBarcodeInput('');
      setShowSuggestions(false);
      return;
    }

    // Search exact matches by name
    const nameMatches = products.filter(
      (p) => p.name.trim().toLowerCase() === code.toLowerCase()
    );

    if (nameMatches.length > 1) {
      setMultiRateData({ barcode: code, matchingProducts: nameMatches });
      setBarcodeInput('');
      setShowSuggestions(false);
      return;
    } else if (nameMatches.length === 1) {
      addItemToCart(nameMatches[0], qtyInput, discountInput);
      setBarcodeInput('');
      setShowSuggestions(false);
      return;
    } else if (searchSuggestions.length > 0) {
      addItemToCart(searchSuggestions[0], qtyInput, discountInput);
      setBarcodeInput('');
      setShowSuggestions(false);
    } else {
      alert(`Product "${barcodeInput}" not found in inventory!`);
    }
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCartItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const newSubtotal = Math.max(0, item.rate * newQty - item.discount);
      updated[index] = {
        ...item,
        qty: newQty,
        subtotal: newSubtotal,
      };
      return updated;
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to clear current invoice?')) {
      setCart([]);
      setPaidAmount(0);
      setBarcodeInput('');
    }
  };

  // Calculations
  const totalAmount = cart.reduce((acc, item) => acc + item.rate * item.qty, 0);
  const totalItemDiscounts = cart.reduce((acc, item) => acc + item.discount, 0);
  const netAmount = Math.max(0, totalAmount - totalItemDiscounts);
  const changeAmount = paidAmount > 0 ? paidAmount - netAmount : 0;

  // Save Sale & Print with specified or active paper size
  const handleSaveAndPrint = (paperSize?: ThermalPaperSize) => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items before saving invoice.');
      return;
    }

    if (paperSize) {
      setThermalPaperSize(paperSize);
    }

    const effectivePaid = paidAmount > 0 ? paidAmount : netAmount;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newSale = addSale({
      date: formattedDate,
      customerName: customerInput.trim() || 'Cash Customer',
      saleType,
      items: cart.map((item) => ({
        barcode: item.product.barcode,
        name: item.product.name,
        qty: item.qty,
        rate: item.rate,
        discount: item.discount,
        subtotal: item.subtotal,
      })),
      totalAmount,
      discountAmount: totalItemDiscounts,
      netAmount,
      paidAmount: effectivePaid,
      changeAmount: Math.max(0, effectivePaid - netAmount),
      cashier: 'Admin',
    });

    // Open Thermal receipt print preview
    setPreviewInvoice(newSale);

    // Reset Form
    setCart([]);
    setPaidAmount(0);
    setCustomerInput('Cash Customer');
    setBarcodeInput('');
  };

  const handlePrintDraftReceipt = (paperSize?: ThermalPaperSize) => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    if (paperSize) {
      setThermalPaperSize(paperSize);
    }
    const draftInvoice = {
      id: 'draft',
      invoiceNo: 9999,
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      customerName: customerInput || 'Cash Customer',
      saleType,
      items: cart.map((item) => ({
        barcode: item.product.barcode,
        name: item.product.name,
        qty: item.qty,
        rate: item.rate,
        discount: item.discount,
        subtotal: item.subtotal,
      })),
      totalAmount,
      discountAmount: totalItemDiscounts,
      netAmount,
      paidAmount: paidAmount > 0 ? paidAmount : netAmount,
      changeAmount: Math.max(0, (paidAmount > 0 ? paidAmount : netAmount) - netAmount),
      cashier: 'Admin',
    };
    setPreviewInvoice(draftInvoice);
  };

  return (
    <div id="sale-invoice-container" className="p-4 md:p-6 bg-[#f4f7fa] min-h-full space-y-4">
      {/* Banner Header */}
      <div className="bg-[#002b49] text-white px-4 py-3 flex flex-wrap items-center justify-between shadow-xs gap-2">
        <div className="flex items-center gap-2 font-bold tracking-wide text-sm md:text-base">
          <Pill className="w-5 h-5 text-white" />
          <span>SALE INVOICE - {storeSettings.storeName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Thermal Paper Selection in Header */}
          <div className="flex items-center gap-1.5 bg-[#001f35] px-2.5 py-1 rounded border border-[#004070]">
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-semibold">Printer Paper:</span>
            <button
              type="button"
              onClick={() => setThermalPaperSize('80mm')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                thermalPaperSize === '80mm'
                  ? 'bg-[#0078d7] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              80mm (Standard)
            </button>
            <button
              type="button"
              onClick={() => setThermalPaperSize('58mm')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                thermalPaperSize === '58mm'
                  ? 'bg-[#0078d7] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              58mm (Mini)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="saleType"
                checked={saleType === 'Retail'}
                onChange={() => setSaleType('Retail')}
                className="text-blue-500"
              />
              <span>Retail Rate</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="saleType"
                checked={saleType === 'Wholesale'}
                onChange={() => setSaleType('Wholesale')}
                className="text-blue-500"
              />
              <span>Wholesale Rate</span>
            </label>
          </div>
        </div>
      </div>

      {/* Scanned product notice / hardware scan feedback */}
      {scanNotice && (
        <div className={`p-2.5 px-4 text-xs font-bold flex items-center justify-between border shadow-xs animate-in fade-in ${
          scanNotice.includes('not found')
            ? 'bg-red-50 text-red-800 border-red-300'
            : 'bg-emerald-50 text-emerald-900 border-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{scanNotice}</span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase font-mono">Auto Scanned</span>
        </div>
      )}

      {/* Top Input Bar (Mint Green Background matching Image 3) */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-[#e8f5e9] border border-[#c8e6c9] p-3 shadow-xs relative"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
          {/* Barcode / Name with Scanner Button matching Image 2 & 4 */}
          <div className="md:col-span-4 relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                🔍 Barcode / Name:
              </label>
              <button
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="text-[11px] text-[#0070ba] hover:text-[#005a96] font-bold flex items-center gap-1 transition-colors"
                title="Open Camera Scanner"
              >
                <span>Live Cam</span>
              </button>
            </div>
            
            <div className="relative flex items-center">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan barcode or type name..."
                className="w-full bg-white border border-slate-300 pl-3 pr-10 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
                autoComplete="off"
              />
              {/* Small Barcode Scanner Button matching Image 2, 4, 10 */}
              <button
                id="btn-open-camera-scanner-invoice"
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-[#0070ba] hover:bg-slate-100 rounded transition-colors group"
                title="Click to Open Mobile / Camera Barcode Scanner"
              >
                <div className="relative flex items-center justify-center w-6 h-5 bg-slate-50 border border-slate-300 rounded-xs group-hover:border-[#0070ba]">
                  <span className="font-mono text-[8px] font-black tracking-tighter text-slate-800">||| |</span>
                  <div className="absolute inset-x-0 h-0.5 bg-red-500 group-hover:shadow-[0_0_4px_#ef4444]"></div>
                </div>
              </button>
            </div>

            {/* Autocomplete suggestions dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {searchSuggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="p-2 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Barcode: {p.barcode} | {p.company} | Stock: {p.stock}
                      </div>
                    </div>
                    <div className="font-bold text-[#0070ba]">
                      {storeSettings.currency}{' '}
                      {saleType === 'Wholesale' ? p.wholesalePrice : p.retailPrice}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Qty */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">Qty:</label>
            <input
              type="number"
              min="1"
              value={qtyInput}
              onChange={(e) => setQtyInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white border border-slate-300 px-2 py-1.5 text-xs text-center text-slate-800 focus:outline-none focus:border-[#0070ba]"
            />
          </div>

          {/* Customer */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer:</label>
            <input
              type="text"
              value={customerInput}
              onChange={(e) => setCustomerInput(e.target.value)}
              className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
              placeholder="Cash Customer"
            />
          </div>

          {/* Discount Rs */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Discount Rs:</label>
            <input
              type="number"
              min="0"
              value={discountInput}
              onChange={(e) => setDiscountInput(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-white border border-slate-300 px-2 py-1.5 text-xs text-center text-slate-800 focus:outline-none focus:border-[#0070ba]"
            />
          </div>

          {/* Add Item Button */}
          <div className="md:col-span-2">
            <button
              id="btn-add-item-invoice"
              type="submit"
              className="w-full bg-[#1e7e34] hover:bg-[#155724] text-white font-bold py-1.5 px-3 text-xs flex items-center justify-center gap-1 shadow transition-colors active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Item [Enter]</span>
            </button>
          </div>
        </div>
      </form>

      {/* Main Grid: Item Table & Right Checkout Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Area (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[380px]">
          
          {/* Mobile View Cart Cards */}
          <div className="md:hidden space-y-2.5 p-3">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Pill className="w-8 h-8 text-slate-300" />
                  <span>No items added to invoice yet.<br/>Scan barcode or search above.</span>
                </div>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="bg-white p-3 rounded-lg shadow-xs border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">{item.product.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Rate: {storeSettings.currency} {item.rate}
                      {item.discount > 0 && ` | Disc: ${storeSettings.currency}${item.discount}`}
                    </div>
                    
                    {/* Qty edit triggers */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateCartItemQty(idx, item.qty - 1)}
                        className="w-6 h-6 bg-slate-100 active:bg-slate-200 hover:bg-slate-200 text-slate-800 font-bold rounded flex items-center justify-center border border-slate-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCartItemQty(idx, item.qty + 1)}
                        className="w-6 h-6 bg-slate-100 active:bg-slate-200 hover:bg-slate-200 text-slate-800 font-bold rounded flex items-center justify-center border border-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <div className="font-black text-[#0070ba] text-xs sm:text-sm">
                      {storeSettings.currency} {item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newRate = prompt('Enter new unit rate:', item.rate.toString());
                          if (newRate && !isNaN(Number(newRate))) {
                            const r = Number(newRate);
                            setCart((prev) => {
                              const up = [...prev];
                              up[idx] = { ...up[idx], rate: r, subtotal: Math.max(0, r * up[idx].qty - up[idx].discount) };
                              return up;
                            });
                          }
                        }}
                        className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                      >
                        Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="overflow-x-auto flex-1 hidden md:block">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold w-24">Barcode</th>
                  <th className="py-2.5 px-3 font-semibold">Product Name</th>
                  <th className="py-2.5 px-3 font-semibold w-20 text-center">Qty</th>
                  <th className="py-2.5 px-3 font-semibold w-24 text-right">Rate</th>
                  <th className="py-2.5 px-3 font-semibold w-20 text-right">Disc Rs.</th>
                  <th className="py-2.5 px-3 font-semibold w-24 text-right">Subtotal</th>
                  <th className="py-2.5 px-2 font-semibold w-12 text-center">Edit</th>
                  <th className="py-2.5 px-2 font-semibold w-12 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Pill className="w-8 h-8 text-slate-300" />
                        <span>No items added to invoice yet. Scan barcode or search above.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr key={`${item.product.id}-${idx}`} className="hover:bg-slate-50 text-slate-700">
                      <td className="py-2.5 px-3 font-mono">{item.product.barcode}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.product.name}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartItemQty(idx, item.qty - 1)}
                            className="w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-semibold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartItemQty(idx, item.qty + 1)}
                            className="w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-red-600">
                        {item.discount > 0 ? item.discount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newRate = prompt('Enter new unit rate:', item.rate.toString());
                            if (newRate && !isNaN(Number(newRate))) {
                              const r = Number(newRate);
                              setCart((prev) => {
                                const up = [...prev];
                                up[idx] = { ...up[idx], rate: r, subtotal: Math.max(0, r * up[idx].qty - up[idx].discount) };
                                return up;
                              });
                            }
                          }}
                          className="text-[#0070ba] hover:text-[#005a96]"
                          title="Edit Rate"
                        >
                          <Edit3 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Summary Panel (4 or 3 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Total */}
            <div>
              <div className="text-xs font-semibold text-slate-500">Total:</div>
              <div className="text-xl font-bold text-[#0070ba]">
                {storeSettings.currency} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Discount */}
            <div>
              <div className="text-xs font-semibold text-slate-500">Discount:</div>
              <div className="text-sm font-semibold text-[#dc3545]">
                {storeSettings.currency} {totalItemDiscounts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* NET AMOUNT */}
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-black text-slate-700 uppercase">NET AMOUNT:</div>
              <div className="text-2xl font-black text-[#1e7e34]">
                {storeSettings.currency} {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Paid Amount */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Paid Amount / Received ({storeSettings.currency}):
              </label>
              <input
                id="invoice-paid-input"
                type="number"
                min="0"
                value={paidAmount === 0 ? '' : paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#0070ba]"
              />

              {/* Quick Cash Tender Pills */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => setPaidAmount(netAmount)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 border border-slate-300 rounded cursor-pointer"
                >
                  Exact ({netAmount.toFixed(0)})
                </button>
                {[100, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPaidAmount(amt)}
                    className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-[#0070ba] text-slate-700 font-mono font-bold px-2 py-0.5 border border-slate-300 rounded cursor-pointer"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Refund / Wapas Box */}
            <div className="pt-1">
              {paidAmount > netAmount ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-emerald-900">
                    <span className="flex items-center gap-1">
                      <span>💰 Change Refund / Wapas:</span>
                    </span>
                    <span className="font-mono text-base font-black text-emerald-700">
                      {storeSettings.currency} {changeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-700">
                    Customer owes {storeSettings.currency} {netAmount.toFixed(0)}, paid {storeSettings.currency} {paidAmount.toFixed(0)}. Return {storeSettings.currency} {changeAmount.toFixed(0)} to customer.
                  </p>
                </div>
              ) : paidAmount > 0 && paidAmount < netAmount ? (
                <div className="p-2 bg-amber-50 border border-amber-300 rounded text-xs">
                  <div className="flex justify-between items-center font-bold text-amber-900">
                    <span>⚠️ Khata / Balance Due:</span>
                    <span className="font-mono font-bold text-amber-800">
                      {storeSettings.currency} {(netAmount - paidAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-600 flex justify-between">
                  <span>Change Return:</span>
                  <span className="text-[#1e7e34] font-bold font-mono">
                    {storeSettings.currency} 0.00
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thermal Printer Paper Size Choice Bar */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Printer className="w-3.5 h-3.5 text-[#0070ba]" />
                <span>Thermal Printer:</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-[#0070ba] bg-blue-50 px-1.5 py-0.5 rounded">
                {thermalPaperSize}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setThermalPaperSize('80mm')}
                className={`py-1 px-2 text-xs font-bold rounded border text-center transition-colors ${
                  thermalPaperSize === '80mm'
                    ? 'bg-[#002b49] text-white border-[#002b49]'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                80mm (3")
              </button>
              <button
                type="button"
                onClick={() => setThermalPaperSize('58mm')}
                className={`py-1 px-2 text-xs font-bold rounded border text-center transition-colors ${
                  thermalPaperSize === '58mm'
                    ? 'bg-[#002b49] text-white border-[#002b49]'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                58mm (2")
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {/* Primary Save & Print (Uses current thermal size) */}
            <button
              id="btn-save-print-sale"
              type="button"
              onClick={() => handleSaveAndPrint()}
              className="w-full bg-[#1e7e34] hover:bg-[#155724] text-white font-bold py-2.5 px-3 text-xs flex items-center justify-center gap-2 shadow transition-colors active:scale-[0.98]"
            >
              <CheckSquare className="w-4 h-4" />
              <span>SAVE & PRINT ({thermalPaperSize})</span>
            </button>

            {/* Quick 2-button thermal split: 80mm and 58mm */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-save-print-80mm"
                type="button"
                onClick={() => handleSaveAndPrint('80mm')}
                className="bg-[#0070ba] hover:bg-[#005a96] text-white font-bold py-2 px-1 text-[11px] flex items-center justify-center gap-1 shadow transition-colors active:scale-[0.98]"
                title="Save sale and open 80mm thermal receipt"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Print 80mm</span>
              </button>

              <button
                id="btn-save-print-58mm"
                type="button"
                onClick={() => handleSaveAndPrint('58mm')}
                className="bg-[#17a2b8] hover:bg-[#138496] text-white font-bold py-2 px-1 text-[11px] flex items-center justify-center gap-1 shadow transition-colors active:scale-[0.98]"
                title="Save sale and open 58mm mini thermal receipt"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Print 58mm</span>
              </button>
            </div>

            {/* Draft Print & Clear Cart */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-print-receipt"
                type="button"
                onClick={() => handlePrintDraftReceipt()}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-1.5 px-2 text-[11px] flex items-center justify-center gap-1 shadow transition-colors active:scale-[0.98]"
                title="Preview draft receipt without saving sale"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Draft Slip</span>
              </button>

              <button
                id="btn-clear-cart"
                type="button"
                onClick={handleClearCart}
                className="w-full bg-[#dc3545] hover:bg-[#c82333] text-white font-bold py-1.5 px-2 text-[11px] flex items-center justify-center gap-1 shadow transition-colors active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Rate / Batch Price Selector Modal for Same Barcode */}
      {multiRateData && (
        <MultiRateSelectorModal
          barcode={multiRateData.barcode}
          matchingProducts={multiRateData.matchingProducts}
          storeSettings={storeSettings}
          saleType={saleType}
          onSelect={(selectedProduct) => {
            addItemToCart(selectedProduct, qtyInput, discountInput);
            setMultiRateData(null);
            barcodeInputRef.current?.focus();
          }}
          onClose={() => {
            setMultiRateData(null);
            barcodeInputRef.current?.focus();
          }}
        />
      )}

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={handleScannerDetected}
        title="Sale Invoice Barcode Scanner"
        initialWholesale={saleType === 'Wholesale'}
      />
    </div>
  );
};

