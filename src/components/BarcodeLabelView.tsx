import React, { useState, useRef } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Printer,
  Tag,
  Settings,
  Eye,
  Check,
  RefreshCw,
  Search,
  Sliders,
  Layers,
  Sparkles,
  Barcode as BarcodeIcon,
  Plus,
  Trash2,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  PackageCheck,
  Zap,
} from 'lucide-react';
import { BarcodeRenderer, BarcodeFormat } from './BarcodeRenderer';
import { Product } from '../types';
import { posSound } from '../utils/audio';

interface QueueItem {
  id: string;
  barcode: string;
  name: string;
  company: string;
  price: number;
  qty: number;
  batchNo?: string;
  expiryDate?: string;
}

export const BarcodeLabelView: React.FC = () => {
  const { products, storeSettings } = usePOS();

  // Mode Selection: 'single' | 'batch' | 'custom'
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'custom'>('single');

  // Single Selection State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [printQty, setPrintQty] = useState<number>(12);

  // Batch Print Queue State
  const [batchQueue, setBatchQueue] = useState<QueueItem[]>(() => {
    return products.slice(0, 3).map((p) => ({
      id: p.id,
      barcode: p.barcode,
      name: p.name,
      company: p.company,
      price: p.retailPrice,
      qty: 4,
      batchNo: 'B-' + Math.floor(1000 + Math.random() * 9000),
      expiryDate: '12/2028',
    }));
  });

  // Custom Item Form State
  const [customItem, setCustomItem] = useState({
    barcode: '880123456789',
    name: 'Special Vitamin Pack 500mg',
    company: 'MedCare Labs',
    price: 350,
    batchNo: 'B-8941',
    expiryDate: '10/2028',
    qty: 6,
  });

  // Barcode Technical Config
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [barWidth, setBarWidth] = useState<number>(1.4);
  const [barHeight, setBarHeight] = useState<number>(32);
  const [displayBarcodeText, setDisplayBarcodeText] = useState<boolean>(true);

  // Label Dimension / Template Presets
  const [labelTemplate, setLabelTemplate] = useState<string>('roll-50x30');

  // Content Customization Toggles
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [customStoreTitle, setCustomStoreTitle] = useState<string>('');
  const [showProductName, setShowProductName] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showBrand, setShowBrand] = useState<boolean>(true);
  const [showBatchNo, setShowBatchNo] = useState<boolean>(false);
  const [showExpiry, setShowExpiry] = useState<boolean>(false);
  const [customFooterTag, setCustomFooterTag] = useState<string>('');

  // Live Hardware Scanner Verification State
  const [testScanInput, setTestScanInput] = useState<string>('');
  const [lastScannedResult, setLastScannedResult] = useState<{
    code: string;
    matchedProduct?: Product;
    time: string;
  } | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Sizing Styles dictionary
  const templateConfig: Record<
    string,
    {
      name: string;
      category: 'roll' | 'sheet';
      widthMm: number;
      heightMm: number;
      containerClass: string;
      colsGridClass: string;
      recommendedHeight: number;
      recommendedWidth: number;
    }
  > = {
    'roll-50x30': {
      name: '50mm × 30mm (2" × 1.2" Standard Roll)',
      category: 'roll',
      widthMm: 50,
      heightMm: 30,
      containerClass: 'w-[190px] h-[115px] p-1.5 text-[10px]',
      colsGridClass: '',
      recommendedHeight: 30,
      recommendedWidth: 1.3,
    },
    'roll-50x25': {
      name: '50mm × 25mm (2" × 1" Compact Roll)',
      category: 'roll',
      widthMm: 50,
      heightMm: 25,
      containerClass: 'w-[190px] h-[95px] p-1.5 text-[9.5px]',
      colsGridClass: '',
      recommendedHeight: 25,
      recommendedWidth: 1.2,
    },
    'roll-40x28': {
      name: '40mm × 28mm (1.6" × 1.1" Small Roll)',
      category: 'roll',
      widthMm: 40,
      heightMm: 28,
      containerClass: 'w-[155px] h-[105px] p-1 text-[9px]',
      colsGridClass: '',
      recommendedHeight: 25,
      recommendedWidth: 1.1,
    },
    'roll-38x25': {
      name: '38mm × 25mm (1.5" × 1" Mini Roll)',
      category: 'roll',
      widthMm: 38,
      heightMm: 25,
      containerClass: 'w-[145px] h-[95px] p-1 text-[8.5px]',
      colsGridClass: '',
      recommendedHeight: 22,
      recommendedWidth: 1.0,
    },
    'roll-60x40': {
      name: '60mm × 40mm (2.4" × 1.6" Large Box/Vial)',
      category: 'roll',
      widthMm: 60,
      heightMm: 40,
      containerClass: 'w-[230px] h-[150px] p-2.5 text-xs',
      colsGridClass: '',
      recommendedHeight: 42,
      recommendedWidth: 1.6,
    },
    'roll-2across': {
      name: '38mm × 25mm (2-Across Double Column Roll)',
      category: 'roll',
      widthMm: 38,
      heightMm: 25,
      containerClass: 'w-[145px] h-[95px] p-1 text-[8.5px]',
      colsGridClass: 'grid grid-cols-2 gap-2',
      recommendedHeight: 22,
      recommendedWidth: 1.0,
    },
    'a4-24': {
      name: 'A4 Sheet - 24 Labels (3×8 Grid - 70mm × 37mm)',
      category: 'sheet',
      widthMm: 70,
      heightMm: 37,
      containerClass: 'w-[245px] h-[130px] p-2 text-[10px]',
      colsGridClass: 'grid grid-cols-3 gap-2.5',
      recommendedHeight: 32,
      recommendedWidth: 1.4,
    },
    'a4-30': {
      name: 'A4 Sheet - 30 Labels (3×10 Grid - 70mm × 29.7mm)',
      category: 'sheet',
      widthMm: 70,
      heightMm: 29.7,
      containerClass: 'w-[245px] h-[105px] p-1.5 text-[9.5px]',
      colsGridClass: 'grid grid-cols-3 gap-2',
      recommendedHeight: 26,
      recommendedWidth: 1.3,
    },
    'a4-40': {
      name: 'A4 Sheet - 40 Labels (4×10 Grid - 52.5mm × 29.7mm)',
      category: 'sheet',
      widthMm: 52.5,
      heightMm: 29.7,
      containerClass: 'w-[185px] h-[105px] p-1 text-[9px]',
      colsGridClass: 'grid grid-cols-4 gap-1.5',
      recommendedHeight: 24,
      recommendedWidth: 1.1,
    },
  };

  const currentTemplate = templateConfig[labelTemplate] || templateConfig['roll-50x30'];

  // Calculate items to render in preview
  const getRenderItems = (): {
    barcode: string;
    name: string;
    company: string;
    price: number;
    batchNo?: string;
    expiryDate?: string;
  }[] => {
    const list: {
      barcode: string;
      name: string;
      company: string;
      price: number;
      batchNo?: string;
      expiryDate?: string;
    }[] = [];

    if (activeTab === 'single') {
      if (selectedProduct) {
        for (let i = 0; i < printQty; i++) {
          list.push({
            barcode: selectedProduct.barcode,
            name: selectedProduct.name,
            company: selectedProduct.company,
            price: selectedProduct.retailPrice,
            batchNo: 'B-001',
            expiryDate: '12/2028',
          });
        }
      }
    } else if (activeTab === 'batch') {
      batchQueue.forEach((item) => {
        for (let i = 0; i < (item.qty || 1); i++) {
          list.push({
            barcode: item.barcode,
            name: item.name,
            company: item.company,
            price: item.price,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate,
          });
        }
      });
    } else if (activeTab === 'custom') {
      for (let i = 0; i < (customItem.qty || 1); i++) {
        list.push({
          barcode: customItem.barcode || '12345678',
          name: customItem.name || 'Custom Product',
          company: customItem.company || 'Store Brand',
          price: customItem.price || 0,
          batchNo: customItem.batchNo,
          expiryDate: customItem.expiryDate,
        });
      }
    }

    return list;
  };

  const renderedLabels = getRenderItems();

  // Load low-stock items into batch queue
  const handleLoadLowStock = () => {
    const lowStock = products.filter((p) => p.stock <= p.minStockAlert);
    if (lowStock.length === 0) {
      alert('No low-stock items found in inventory.');
      return;
    }
    const newItems: QueueItem[] = lowStock.map((p) => ({
      id: p.id,
      barcode: p.barcode,
      name: p.name,
      company: p.company,
      price: p.retailPrice,
      qty: 6,
      batchNo: 'B-LOW',
      expiryDate: '12/2028',
    }));
    setBatchQueue(newItems);
    setActiveTab('batch');
    posSound.playDoubleBeep();
  };

  // Load all inventory products
  const handleLoadAllProducts = () => {
    const allItems: QueueItem[] = products.map((p) => ({
      id: p.id,
      barcode: p.barcode,
      name: p.name,
      company: p.company,
      price: p.retailPrice,
      qty: 2,
      batchNo: 'B-ALL',
      expiryDate: '12/2028',
    }));
    setBatchQueue(allItems);
    setActiveTab('batch');
    posSound.playDoubleBeep();
  };

  // Add product to batch queue
  const addToBatch = (p: Product) => {
    setBatchQueue((prev) => {
      const existing = prev.find((item) => item.id === p.id);
      if (existing) {
        return prev.map((item) =>
          item.id === p.id ? { ...item, qty: item.qty + 2 } : item
        );
      }
      return [
        ...prev,
        {
          id: p.id,
          barcode: p.barcode,
          name: p.name,
          company: p.company,
          price: p.retailPrice,
          qty: 4,
          batchNo: 'B-' + Math.floor(100 + Math.random() * 900),
          expiryDate: '12/2028',
        },
      ];
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('barcode-sticker-print-area');
    if (!printContent) {
      alert('Error: Could not find barcode sticker print area!');
      return;
    }

    // Create temporary print-only container
    const tempContainer = document.createElement('div');
    tempContainer.id = 'barcode-sticker-print-temp';
    tempContainer.innerHTML = printContent.innerHTML;
    document.body.appendChild(tempContainer);

    // Set printing-barcodes class to toggle print layout stylesheet
    document.body.classList.add('printing-barcodes');

    // Trigger Native Print Dialog
    window.print();

    // Instantly restore and clean up the DOM
    document.body.classList.remove('printing-barcodes');
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  };

  // Handle hardware scanner test
  const handleTestScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testScanInput.trim()) return;

    const trimmed = testScanInput.trim();
    const matched = products.find(
      (p) => p.barcode.trim().toLowerCase() === trimmed.toLowerCase()
    );

    setLastScannedResult({
      code: trimmed,
      matchedProduct: matched,
      time: new Date().toLocaleTimeString(),
    });

    if (matched) {
      posSound.playDoubleBeep();
    } else {
      posSound.playScanBeep();
    }

    setTestScanInput('');
  };

  return (
    <div id="barcode-studio-container" className="p-4 md:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* TOP HEADER BANNER (With scannable vector engine badge) */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <BarcodeIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Barcode Label Generator & Printing Studio</h2>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                100% Scannable Vector Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Genuine ISO/IEC Standard Vector Barcodes for Thermal Rolls & A4 Sticker Sheets</p>
          </div>
        </div>
      </div>

      {/* LIVE BARCODE SCANNER VERIFICATION TOOL */}
      <div className="bg-white p-5 border border-slate-200/80 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Live Barcode Scanner Verification Tool</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Point handheld scanner or type here</span>
        </div>
        
        <form onSubmit={handleTestScanSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <ScanLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={testScanInput}
              onChange={(e) => setTestScanInput(e.target.value)}
              placeholder="Scan any printed barcode here with your USB/Bluetooth laser scanner to test..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold font-mono"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase transition-all tracking-wider cursor-pointer shadow-sm shadow-blue-100"
          >
            Verify
          </button>
        </form>

        {/* Dynamic Verification Alert Box */}
        {lastScannedResult && (
          <div className={`p-4 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2.5 ${
            lastScannedResult.matchedProduct
              ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
              : 'bg-amber-50 border-amber-150 text-amber-800'
          }`}>
            <Check className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-bold">Scanned: </span>
              <span className="font-mono bg-white px-2 py-0.5 border border-slate-200 rounded-lg">
                {lastScannedResult.code}
              </span>
              {lastScannedResult.matchedProduct ? (
                <span className="ml-2 font-semibold">
                  ✓ Matches "{lastScannedResult.matchedProduct.name}" ({storeSettings.currency} {lastScannedResult.matchedProduct.retailPrice.toLocaleString()})
                </span>
              ) : (
                <span className="ml-2 font-semibold">✓ Valid Code Decoded</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Setup & Configuration Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Tab Controller */}
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-black uppercase text-center flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'single'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Single Item</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('batch')}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-black uppercase text-center flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'batch'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Batch ({batchQueue.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-black uppercase text-center flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'custom'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold">
              {/* TAB 1: Single Item Selection */}
              {activeTab === 'single' && (
                <div className="space-y-4">
                  {/* Currently Selected Product Details */}
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <span className="block text-[10px] font-black text-blue-900 uppercase tracking-wider mb-2">
                      Active Target Product:
                    </span>
                    {selectedProduct ? (
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 text-xs truncate">
                          {selectedProduct.name}
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-semibold">
                            Barcode: <strong className="font-mono text-slate-900">{selectedProduct.barcode}</strong>
                          </span>
                          <span className="font-bold text-emerald-600 font-mono">
                            {storeSettings.currency} {selectedProduct.retailPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold truncate">
                          Brand: {selectedProduct.company} | Stock: {selectedProduct.stock} units
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">No product selected. Use search below.</div>
                    )}
                  </div>

                  {/* Search & Select Input */}
                  <div className="space-y-1 relative">
                    <label className="block text-xs font-bold text-slate-700">
                      Search & Choose Inventory Product:
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 250)}
                        placeholder="Type medicine name, barcode, or company..."
                        className="w-full bg-white border border-slate-300 pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-8 text-slate-400 hover:text-slate-600 font-bold"
                        >
                          ✕
                        </button>
                      )}
                      <span className="absolute right-2.5 text-slate-400 pointer-events-none">🔍</span>
                    </div>

                    {/* Suggestions dropdown */}
                    {showDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p) => (
                            <div
                              key={p.id}
                              onMouseDown={() => {
                                setSelectedProductId(p.id);
                                setShowDropdown(false);
                              }}
                              className={`p-2 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center ${
                                selectedProductId === p.id ? 'bg-blue-50 font-bold' : ''
                              }`}
                            >
                              <div className="text-left truncate max-w-[70%]">
                                <div className="font-semibold text-slate-800 truncate">{p.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {p.barcode} • {p.company}
                                </div>
                              </div>
                              <div className="font-bold text-[#0070ba] text-[11px] font-mono">
                                {storeSettings.currency} {p.retailPrice}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-slate-400 text-center text-xs">No matching products found.</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity to Print */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Print Quantity (Number of Stickers):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={printQty}
                        onChange={(e) =>
                          setPrintQty(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))
                        }
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:border-[#0070ba]"
                      />
                      <div className="flex gap-1">
                        {[6, 12, 24, 48].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setPrintQty(q)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-[10px]"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Batch Print Queue */}
              {activeTab === 'batch' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-700">Multi-Product Batch List:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handleLoadLowStock}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Load low stock products"
                      >
                        <Zap className="w-3 h-3 text-amber-600" />
                        <span>Low Stock</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLoadAllProducts}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Load all inventory items"
                      >
                        <PackageCheck className="w-3 h-3 text-blue-600" />
                        <span>All Items</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchQueue([])}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Add item to batch dropdown selector */}
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        const p = products.find((prod) => prod.id === e.target.value);
                        if (p) {
                          addToBatch(p);
                          e.target.value = '';
                        }
                      }}
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        + Add product to batch list...
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.barcode}) - Rs.{p.retailPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Queue Items List */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 bg-slate-50/50">
                    {batchQueue.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        Queue is empty. Select products above to add to batch.
                      </div>
                    ) : (
                      batchQueue.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 flex items-center justify-between gap-2 hover:bg-white transition-colors"
                        >
                          <div className="truncate flex-1">
                            <div className="font-bold text-slate-800 truncate text-[11px]">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Code: {item.barcode} • Rs.{item.price}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-500 font-semibold">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={item.qty}
                              onChange={(e) => {
                                const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                setBatchQueue((prev) =>
                                  prev.map((q, i) => (i === idx ? { ...q, qty: newQty } : q))
                                );
                              }}
                              className="w-12 bg-white border border-slate-300 px-1.5 py-0.5 text-center font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setBatchQueue((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Custom / Freeform Label */}
              {activeTab === 'custom' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Barcode / Code *:
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={customItem.barcode}
                          onChange={(e) =>
                            setCustomItem({ ...customItem, barcode: e.target.value })
                          }
                          placeholder="e.g. 880123456"
                          className="w-full bg-white border border-slate-300 px-2.5 py-1 text-xs font-mono font-bold text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setCustomItem({
                              ...customItem,
                              barcode: Math.floor(10000000 + Math.random() * 90000000).toString(),
                            })
                          }
                          className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600"
                          title="Generate Random Number"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Item Name *:
                      </label>
                      <input
                        type="text"
                        value={customItem.name}
                        onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                        placeholder="e.g. Augmentin 625mg"
                        className="w-full bg-white border border-slate-300 px-2.5 py-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Price ({storeSettings.currency}):
                      </label>
                      <input
                        type="number"
                        value={customItem.price}
                        onChange={(e) =>
                          setCustomItem({
                            ...customItem,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white border border-slate-300 px-2.5 py-1 text-xs font-bold font-mono text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Brand / Company:
                      </label>
                      <input
                        type="text"
                        value={customItem.company}
                        onChange={(e) =>
                          setCustomItem({ ...customItem, company: e.target.value })
                        }
                        placeholder="e.g. GSK / Abbott"
                        className="w-full bg-white border border-slate-300 px-2.5 py-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Batch No:
                      </label>
                      <input
                        type="text"
                        value={customItem.batchNo}
                        onChange={(e) =>
                          setCustomItem({ ...customItem, batchNo: e.target.value })
                        }
                        placeholder="B-1092"
                        className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Expiry Date:
                      </label>
                      <input
                        type="text"
                        value={customItem.expiryDate}
                        onChange={(e) =>
                          setCustomItem({ ...customItem, expiryDate: e.target.value })
                        }
                        placeholder="12/2028"
                        className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Print Qty:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={customItem.qty}
                        onChange={(e) =>
                          setCustomItem({
                            ...customItem,
                            qty: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Label Dimensions & Symbology Configuration Card */}
          <div className="bg-white border border-slate-200 p-4 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#0070ba]" />
                <span>Format & Paper Specifications</span>
              </span>
            </h3>

            {/* Template Selector */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Sticker Paper / Roll Template:
              </label>
              <select
                value={labelTemplate}
                onChange={(e) => {
                  const val = e.target.value;
                  setLabelTemplate(val);
                  const conf = templateConfig[val];
                  if (conf) {
                    setBarHeight(conf.recommendedHeight);
                    setBarWidth(conf.recommendedWidth);
                  }
                }}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
              >
                <optgroup label="Thermal Sticker Rolls (Zebra / Xprinter / TSC)">
                  <option value="roll-50x30">50mm × 30mm (2" × 1.2" Standard Pharmacy Roll)</option>
                  <option value="roll-50x25">50mm × 25mm (2" × 1" Compact Roll)</option>
                  <option value="roll-40x28">40mm × 28mm (1.6" × 1.1" Small Roll)</option>
                  <option value="roll-38x25">38mm × 25mm (1.5" × 1" Mini Roll)</option>
                  <option value="roll-60x40">60mm × 40mm (2.4" × 1.6" Large Box/Bottle)</option>
                  <option value="roll-2across">38mm × 25mm (2-Across Double Column Roll)</option>
                </optgroup>
                <optgroup label="A4 Sticker Sheets (Standard Laser / Inkjet)">
                  <option value="a4-24">A4 Sheet - 24 Labels (3×8 Grid - 70mm × 37mm)</option>
                  <option value="a4-30">A4 Sheet - 30 Labels (3×10 Grid - 70mm × 29.7mm)</option>
                  <option value="a4-40">A4 Sheet - 40 Labels (4×10 Grid - 52.5mm × 29.7mm)</option>
                </optgroup>
              </select>
            </div>

            {/* Symbology & Vector Parameters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Barcode Symbology:</label>
                <select
                  value={barcodeFormat}
                  onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                  className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
                >
                  <option value="CODE128">CODE 128 (Auto Alphanumeric - Recommended)</option>
                  <option value="EAN13">EAN-13 (Standard 13-Digit Global Retail)</option>
                  <option value="CODE39">CODE 39 (Alphanumeric 39)</option>
                  <option value="UPC">UPC-A (12-Digit Retail)</option>
                  <option value="ITF">ITF-14 (Interleaved 2 of 5)</option>
                  <option value="pharmacode">Pharmacode (Pharmaceutical)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bar Height ({barHeight}px):
                </label>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={barHeight}
                  onChange={(e) => setBarHeight(parseInt(e.target.value) || 30)}
                  className="w-full accent-[#0070ba]"
                />
              </div>
            </div>

            {/* Content Toggles Checklist */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="block font-bold text-slate-700 mb-1">Label Content Toggles:</span>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showStoreName}
                    onChange={(e) => setShowStoreName(e.target.checked)}
                    className="accent-[#0070ba]"
                  />
                  <span>Store Header</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showProductName}
                    onChange={(e) => setShowProductName(e.target.checked)}
                    className="accent-[#0070ba]"
                  />
                  <span>Product Title</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="accent-[#0070ba]"
                  />
                  <span>Retail Price</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showBrand}
                    onChange={(e) => setShowBrand(e.target.checked)}
                    className="accent-[#0070ba]"
                  />
                  <span>Brand / Company</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showBatchNo}
                    onChange={(e) => setShowBatchNo(e.target.checked)}
                    className="accent-[#0070ba]"
                  />
                  <span>Batch Number</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showExpiry}
                    onChange={(e) => setShowExpiry(e.target.checked)}
                    className="accent-[#0070ba]"
                  />
                  <span>Expiry Date</span>
                </label>
              </div>
            </div>

            {/* Print Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full bg-[#1e7e34] hover:bg-[#155724] text-white font-bold py-3 px-4 text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>
                  PRINT {renderedLabels.length} BARCODE STICKERS NOW
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Interactive Print Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0070ba]" />
                <h2 className="text-sm font-bold text-slate-800">
                  Live Barcode Layout Preview
                </h2>
              </div>
              <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                Total Output: <strong className="text-[#0070ba]">{renderedLabels.length} Stickers</strong>
                {currentTemplate.category === 'sheet' && (
                  <span className="text-slate-500 font-normal ml-1">
                    (~{Math.ceil(renderedLabels.length / 24)} A4 sheet{Math.ceil(renderedLabels.length / 24) > 1 ? 's' : ''})
                  </span>
                )}
              </div>
            </div>

            {/* Print Viewport Container */}
            <div className="mt-4 bg-slate-200/70 p-4 border border-slate-300 rounded-sm max-h-[620px] overflow-y-auto">
              <div
                ref={printAreaRef}
                id="barcode-sticker-print-area"
                className={`flex flex-wrap gap-3 justify-center ${currentTemplate.colsGridClass}`}
              >
                {renderedLabels.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    No stickers to display. Add items to queue or adjust quantity.
                  </div>
                ) : (
                  renderedLabels.map((item, index) => (
                    <div
                      key={index}
                      className={`barcode-label-sticker bg-white border border-slate-400 rounded-xs shadow-xs flex flex-col items-center justify-between text-center select-none shrink-0 overflow-hidden ${currentTemplate.containerClass}`}
                      style={{
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid',
                      }}
                    >
                      {/* Store Header */}
                      {showStoreName && (
                        <div className="font-black uppercase tracking-wider text-slate-900 leading-none truncate w-full text-[8.5px] border-b border-slate-200 pb-0.5">
                          {customStoreTitle || storeSettings.storeName || 'MED STORE'}
                        </div>
                      )}

                      {/* Product Name */}
                      {showProductName && (
                        <div className="font-bold text-slate-900 leading-tight truncate w-full mt-0.5 px-0.5 text-[9.5px]">
                          {item.name}
                        </div>
                      )}

                      {/* Vector Barcode (JsBarcode ISO engine) */}
                      <div className="w-full flex flex-col items-center justify-center my-0.5 px-1">
                        <BarcodeRenderer
                          value={item.barcode}
                          format={barcodeFormat}
                          width={barWidth}
                          height={barHeight}
                          displayValue={false}
                          margin={0}
                        />
                        {displayBarcodeText && (
                          <div className="font-mono text-[9px] font-black text-black tracking-wider leading-none mt-0.5">
                            {item.barcode}
                          </div>
                        )}
                      </div>

                      {/* Optional Batch & Expiry Line */}
                      {(showBatchNo || showExpiry) && (
                        <div className="flex justify-between items-center w-full text-[8px] font-mono text-slate-600 px-1 border-t border-slate-100 pt-0.5">
                          {showBatchNo && <span>B#:{item.batchNo || 'B-01'}</span>}
                          {showExpiry && <span>EXP:{item.expiryDate || '12/28'}</span>}
                        </div>
                      )}

                      {/* Bottom Row: Brand & Retail Price */}
                      <div className="flex justify-between items-center w-full text-[8.5px] font-black text-slate-900 px-1 border-t border-slate-200 pt-0.5">
                        <span className="truncate max-w-[55%] font-medium text-slate-600 text-[8px]">
                          {showBrand ? item.company : storeSettings.tagline || ''}
                        </span>
                        {showPrice && (
                          <span className="bg-slate-100 px-1 font-mono text-slate-950 rounded-xs border border-slate-300">
                            {storeSettings.currency} {item.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Guidance Card */}
          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 bg-blue-50/60 p-3 rounded flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#0070ba] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800">
                Thermal & Laser Label Printing Instructions:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                In the browser Print Dialog, set <strong>Destination</strong> to your label printer (e.g. Zebra, Xprinter, TSC), set <strong>Margins: None</strong>, and ensure <strong>Scale is 100%</strong>. For A4 sticker sheets (Avery / Formtec), select paper size <strong>A4</strong> with <strong>Margins: Default</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
