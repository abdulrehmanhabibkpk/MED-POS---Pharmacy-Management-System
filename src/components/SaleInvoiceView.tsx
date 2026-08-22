import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pill, Plus, Trash2, Printer, CheckSquare, RotateCcw, Search, Edit3, Settings, Check, ScanLine, Smartphone, Layers } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { CartItem, Product, ThermalPaperSize } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { MultiRateSelectorModal } from './MultiRateSelectorModal';
import { useHardwareScanner } from '../hooks/useHardwareScanner';
import { posSound } from '../utils/audio';

export const SaleInvoiceView: React.FC = () => {
  const { products, addSale, setPreviewInvoice, storeSettings, thermalPaperSize, setThermalPaperSize, currentUser } = usePOS();

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
      cashier: currentUser ? currentUser.name : 'Admin',
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
      cashier: currentUser ? currentUser.name : 'Admin',
    };
    setPreviewInvoice(draftInvoice);
  };

  return (
    <div id="sale-invoice-container" className="p-4 md:p-8 bg-[#F8FAFC] min-h-full space-y-6 font-sans">
      
      {/* Banner Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-wrap items-center justify-between shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight uppercase">
              Sale Invoice
            </h1>
            <p className="text-[11px] text-slate-500 font-bold">{storeSettings.storeName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs">
          {/* Thermal Paper Selection in Header */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600 font-bold">Paper Size:</span>
            <div className="flex bg-slate-150 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setThermalPaperSize('80mm')}
                className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${
                  thermalPaperSize === '80mm'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                80mm
              </button>
              <button
                type="button"
                onClick={() => setThermalPaperSize('58mm')}
                className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${
                  thermalPaperSize === '58mm'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                58mm
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl font-bold">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
              <input
                type="radio"
                name="saleType"
                checked={saleType === 'Retail'}
                onChange={() => setSaleType('Retail')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>Retail Rate</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
              <input
                type="radio"
                name="saleType"
                checked={saleType === 'Wholesale'}
                onChange={() => setSaleType('Wholesale')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>Wholesale Rate</span>
            </label>
          </div>
        </div>
      </div>

      {/* Scanned product notice / hardware scan feedback */}
      {scanNotice && (
        <div className={`p-4 px-5 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-xs animate-in fade-in zoom-in-95 duration-150 ${
          scanNotice.includes('not found')
            ? 'bg-rose-50 text-rose-900 border-rose-200'
            : 'bg-emerald-50 text-emerald-950 border-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{scanNotice}</span>
          </div>
          <span className="text-[10px] bg-white/60 text-slate-500 px-2 py-0.5 rounded-lg uppercase font-mono border">Auto Scanned</span>
        </div>
      )}

      {/* Top Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white border border-slate-200/85 p-5 rounded-3xl shadow-xs relative"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
          {/* Barcode / Name with Scanner Button */}
          <div className="md:col-span-4 relative">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider">
                🔍 Barcode or Item Name:
              </label>
              <button
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-black flex items-center gap-1 transition-colors uppercase tracking-wider"
                title="Open Camera Scanner"
              >
                <span>Live Camera Scan</span>
              </button>
            </div>
            
            <div className="relative flex items-center">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan barcode or type item name..."
                className="w-full bg-slate-50/50 border border-slate-200 pl-4 pr-12 py-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-150"
                autoComplete="off"
              />
              {/* Small Barcode Scanner Button */}
              <button
                id="btn-open-camera-scanner-invoice"
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all duration-150 group"
                title="Click to Open Mobile / Camera Barcode Scanner"
              >
                <div className="relative flex items-center justify-center w-7 h-6 bg-white border border-slate-200 rounded-lg group-hover:border-blue-500 shadow-2xs">
                  <span className="font-mono text-[9px] font-black tracking-tighter text-slate-800">||| |</span>
                  <div className="absolute inset-x-0 h-0.5 bg-red-500 group-hover:shadow-[0_0_4px_#ef4444]"></div>
                </div>
              </button>
            </div>

            {/* Autocomplete suggestions dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 overflow-hidden">
                {searchSuggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="p-3 text-xs hover:bg-blue-50/60 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <div className="font-black text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5 uppercase tracking-wider font-bold">
                        Barcode: {p.barcode} | {p.company} | Stock: {p.stock}
                      </div>
                    </div>
                    <div className="font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-xl">
                      {storeSettings.currency}{' '}
                      {(saleType === 'Wholesale' ? p.wholesalePrice : p.retailPrice).toLocaleString('en-US')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Qty */}
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Qty / Wt:</label>
            <input
              type="number"
              step="any"
              min="0.001"
              value={qtyInput}
              onChange={(e) => setQtyInput(Math.max(0.001, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-50/50 border border-slate-200 px-2 py-3 rounded-2xl text-xs text-center font-black text-slate-850 focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-150"
              placeholder="1"
            />
          </div>

          {/* Customer */}
          <div className="md:col-span-3">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Customer Client:</label>
            <input
              type="text"
              value={customerInput}
              onChange={(e) => setCustomerInput(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-150"
              placeholder="Cash Customer"
            />
          </div>

          {/* Discount Rs */}
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Discount Rs:</label>
            <input
              type="number"
              min="0"
              value={discountInput}
              onChange={(e) => setDiscountInput(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-50/50 border border-slate-200 px-3 py-3 rounded-2xl text-xs text-center font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-150"
            />
          </div>

          {/* Add Item Button */}
          <div className="md:col-span-2">
            <button
              id="btn-add-item-invoice"
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-100 transition-all duration-150 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </form>

      {/* Main Grid: Item Table & Right Checkout Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Area */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden flex flex-col min-h-[380px]">
          
          {/* Mobile View Cart Cards */}
          <div className="md:hidden space-y-3 p-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-[#9CA3AF] bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Pill className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-500">Invoice empty.<br/>Please scan barcodes to add items.</span>
                </div>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 flex justify-between items-center hover:border-blue-200 transition-colors">
                  <div>
                    <div className="font-black text-slate-900 text-xs sm:text-sm">{item.product.name}</div>
                    <div className="text-[11px] text-[#9CA3AF] mt-1 uppercase tracking-wider font-bold">
                      Rate: {storeSettings.currency} {item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {item.discount > 0 && ` | Disc: ${storeSettings.currency}${item.discount}`}
                    </div>
                    
                    {/* Qty edit triggers */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateCartItemQty(idx, item.qty - 1)}
                        className="w-7 h-7 bg-white active:bg-slate-100 text-slate-800 font-black rounded-xl flex items-center justify-center border border-slate-200 shadow-2xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-black text-slate-900">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCartItemQty(idx, item.qty + 1)}
                        className="w-7 h-7 bg-white active:bg-slate-100 text-slate-800 font-black rounded-xl flex items-center justify-center border border-slate-200 shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="font-black text-blue-600 text-xs sm:text-sm">
                      {storeSettings.currency} {item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    
                    <div className="flex gap-1.5">
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
                        className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-3xs"
                      >
                        Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="overflow-x-auto flex-1 hidden md:block">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-black w-28">Barcode</th>
                  <th className="py-3 px-4 font-black">Product Name</th>
                  <th className="py-3 px-4 font-black w-24 text-center">Qty</th>
                  <th className="py-3 px-4 font-black w-24 text-right">Rate</th>
                  <th className="py-3 px-4 font-black w-20 text-right">Disc Rs.</th>
                  <th className="py-3 px-4 font-black w-24 text-right">Subtotal</th>
                  <th className="py-3 px-2 font-black w-12 text-center">Edit</th>
                  <th className="py-3 px-2 font-black w-12 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shadow-inner">
                          <Pill className="w-6 h-6 animate-pulse" />
                        </div>
                        <span className="font-bold text-slate-500">Invoice empty. Please type or scan barcodes above.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr key={`${item.product.id}-${idx}`} className="hover:bg-slate-50/60 text-slate-700 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{item.product.barcode}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{item.product.name}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const step = (item.product.unitOfSale && item.product.unitOfSale !== 'Item') ? 0.5 : 1;
                              handleUpdateCartItemQty(idx, Math.max(0.001, item.qty - step));
                            }}
                            className="w-6 h-6 bg-slate-150 hover:bg-slate-200 text-slate-800 font-black rounded-lg flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="any"
                            min="0.001"
                            value={item.qty}
                            onChange={(e) => handleUpdateCartItemQty(idx, Math.max(0.001, parseFloat(e.target.value) || 0.001))}
                            className="w-16 bg-white border border-slate-200 rounded-lg text-center font-black text-xs py-1 focus:outline-none focus:border-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const step = (item.product.unitOfSale && item.product.unitOfSale !== 'Item') ? 0.5 : 1;
                              handleUpdateCartItemQty(idx, item.qty + step);
                            }}
                            className="w-6 h-6 bg-slate-150 hover:bg-slate-200 text-slate-800 font-black rounded-lg flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {item.product.unitOfSale && item.product.unitOfSale !== 'Item' && (
                          <span className="text-[9px] font-black text-amber-700 uppercase tracking-tight block mt-1">
                            {item.product.unitOfSale}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        {item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                        {item.discount > 0 ? item.discount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-2 text-center">
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
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors inline-block"
                          title="Edit Rate"
                        >
                          <Edit3 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors inline-block"
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

        {/* Right Summary Panel */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-[#9CA3AF] uppercase tracking-wider">Gross Total:</span>
              <span className="text-lg font-black text-slate-900">
                {storeSettings.currency} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Discount */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <span className="text-xs font-black text-[#9CA3AF] uppercase tracking-wider">Discount:</span>
              <span className="text-sm font-black text-rose-600">
                {storeSettings.currency} {totalItemDiscounts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* NET AMOUNT */}
            <div className="pt-3.5 border-t border-slate-200/60 flex justify-between items-center">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">NET AMOUNT:</span>
              <span className="text-2xl font-black text-emerald-600">
                {storeSettings.currency} {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Paid Amount */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Paid Amount / Received:
              </label>
              <input
                id="invoice-paid-input"
                type="number"
                min="0"
                value={paidAmount === 0 ? '' : paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-slate-55 border border-slate-200 px-3 py-2.5 rounded-2xl text-base font-black text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-center transition-all duration-150"
              />

              {/* Quick Cash Tender Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setPaidAmount(netAmount)}
                  className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1 border border-slate-200 rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  Exact ({netAmount.toFixed(0)})
                </button>
                {[100, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPaidAmount(amt)}
                    className="text-[10px] bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 font-mono font-bold px-3 py-1 border border-slate-200 rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Refund / Wapas Box */}
            <div className="pt-1">
              {paidAmount > netAmount ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between items-center font-black text-emerald-900 uppercase tracking-wider">
                    <span>Change Return:</span>
                    <span className="font-mono text-lg font-black text-emerald-700">
                      {storeSettings.currency} {changeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                    Customer paid {storeSettings.currency} {paidAmount.toLocaleString()}. Return excess change to customer.
                  </p>
                </div>
              ) : paidAmount > 0 && paidAmount < netAmount ? (
                <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs">
                  <div className="flex justify-between items-center font-black text-amber-900 uppercase tracking-wider">
                    <span>Balance Due:</span>
                    <span className="font-mono text-base font-black text-amber-700">
                      {storeSettings.currency} {(netAmount - paidAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-black text-[#9CA3AF] uppercase tracking-wider flex justify-between items-center">
                  <span>Refund Change:</span>
                  <span className="text-slate-400 font-mono">
                    {storeSettings.currency} 0.00
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thermal Printer Paper Size Choice Bar */}
          <div className="pt-4 border-t border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-600">
              <span className="flex items-center gap-1">
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Printer Layout:</span>
              </span>
              <span className="font-mono text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 uppercase">
                {thermalPaperSize}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setThermalPaperSize('80mm')}
                className={`py-2 px-3 text-xs font-black rounded-xl border text-center transition-all duration-150 uppercase tracking-wider ${
                  thermalPaperSize === '80mm'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                80mm (3")
              </button>
              <button
                type="button"
                onClick={() => setThermalPaperSize('58mm')}
                className={`py-2 px-3 text-xs font-black rounded-xl border text-center transition-all duration-150 uppercase tracking-wider ${
                  thermalPaperSize === '58mm'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                58mm (2")
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            {/* Primary Save & Print */}
            <button
              id="btn-save-print-sale"
              type="button"
              onClick={() => handleSaveAndPrint()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shadow-emerald-100 transition-all duration-150 active:scale-[0.98]"
            >
              <CheckSquare className="w-4 h-4" />
              <span>SAVE & PRINT RECEIPT</span>
            </button>

            {/* Quick 2-button thermal split */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-save-print-80mm"
                type="button"
                onClick={() => handleSaveAndPrint('80mm')}
                className="bg-slate-800 hover:bg-slate-900 text-white font-black py-2.5 px-2 rounded-2xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
                title="Save sale and open 80mm thermal receipt"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Print 80mm</span>
              </button>

              <button
                id="btn-save-print-58mm"
                type="button"
                onClick={() => handleSaveAndPrint('58mm')}
                className="bg-slate-800 hover:bg-slate-900 text-white font-black py-2.5 px-2 rounded-2xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
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
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-black py-2.5 px-2 rounded-2xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
                title="Preview draft receipt without saving sale"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Draft Slip</span>
              </button>

              <button
                id="btn-clear-cart"
                type="button"
                onClick={handleClearCart}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-black py-2.5 px-2 rounded-2xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
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

