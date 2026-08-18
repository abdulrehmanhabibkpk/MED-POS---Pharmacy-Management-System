import React, { useState, useRef } from 'react';
import { usePOS } from '../context/POSContext';
import { Printer, Tag, Settings, Eye, Check, RefreshCw } from 'lucide-react';

const CODE39_PATTERNS: { [key: string]: string } = {
  '0': '101001101101',
  '1': '110100101011',
  '2': '101100101011',
  '3': '110110010101',
  '4': '101001101011',
  '5': '110100110101',
  '6': '101100110101',
  '7': '101001011011',
  '8': '110100101101',
  '9': '101100101101',
  'A': '110101001011',
  'B': '101101001011',
  'C': '110110100101',
  'D': '101011001011',
  'E': '110101100101',
  'F': '101101100101',
  'G': '101010011011',
  'H': '110101001101',
  'I': '101101001101',
  'J': '101011001101',
  'K': '110101010011',
  'L': '101101010011',
  'M': '110110101001',
  'N': '101011010011',
  'O': '110101101001',
  'P': '101101101001',
  'Q': '101010110011',
  'R': '110101011001',
  'S': '101101011001',
  'T': '101011011001',
  'U': '110010101011',
  'V': '100110101011',
  'W': '110011010101',
  'X': '100101101011',
  'Y': '110010110101',
  'Z': '100110110101',
  '-': '100101011011',
  '.': '110010101101',
  ' ': '100110101101',
  '$': '100100100101',
  '/': '100100101001',
  '+': '100101001001',
  '%': '101001001001',
  '*': '100101101101', // Start/Stop
};

const Code39Barcode: React.FC<{ code: string }> = ({ code }) => {
  const cleanCode = (code || '123456').toUpperCase().replace(/[^0-9A-Z\-.\s$%+/]/g, '');
  const finalString = `*${cleanCode}*`;
  
  // Build the complete bit pattern
  let bitPattern = '';
  for (let i = 0; i < finalString.length; i++) {
    const char = finalString[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS[' '];
    bitPattern += pattern;
    if (i < finalString.length - 1) {
      bitPattern += '0'; // Inter-character gap
    }
  }

  return (
    <div className="flex justify-center items-stretch h-8 w-full px-1 overflow-hidden bg-white">
      {bitPattern.split('').map((bit, index) => (
        <div
          key={index}
          className={`${bit === '1' ? 'bg-black' : 'bg-transparent'} h-full`}
          style={{ width: '1.2px' }}
        />
      ))}
    </div>
  );
};

export const BarcodeLabelView: React.FC = () => {
  const { products, storeSettings } = usePOS();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [printQty, setPrintQty] = useState<number>(12);
  const [showPrice, setShowPrice] = useState(true);
  const [showStoreName, setShowStoreName] = useState(true);
  const [labelSize, setLabelSize] = useState<'standard' | 'small' | 'mini'>('standard');

  const printAreaRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

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

  // Label configuration details
  const sizeClasses = {
    standard: 'w-[2.2in] h-[1.2in] p-2 text-xs',
    small: 'w-[1.8in] h-[1.0in] p-1 text-[10px]',
    mini: 'w-[1.5in] h-[0.8in] p-0.5 text-[9px]',
  };

  return (
    <div className="p-4 md:p-6 bg-[#f4f7fa] min-h-full space-y-6">
      {/* Page Header banner */}
      <div className="bg-[#002b49] text-white px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 font-bold tracking-wide text-sm md:text-base">
          <Tag className="w-5 h-5 text-white" />
          <span>BARCODE LABEL GENERATOR & PRINTING</span>
        </div>
        <div className="text-xs bg-[#001f35] px-3 py-1 rounded border border-[#004070] font-semibold text-cyan-300">
          Ready for Sticky Sticker Sheets
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Setup Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-none space-y-5">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0070ba]" />
            <span>Label Configuration</span>
          </h3>

          {/* Currently Selected Product Details */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
            <span className="block text-[10px] font-black text-blue-800 uppercase tracking-wider mb-1">
              Currently Selected Product:
            </span>
            {selectedProduct ? (
              <div>
                <div className="font-extrabold text-slate-800 text-xs truncate">{selectedProduct.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Barcode: <span className="font-mono text-slate-800 font-bold">{selectedProduct.barcode}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">
                  Brand: {selectedProduct.company}
                </div>
                <div className="text-[11px] font-bold text-emerald-600 mt-1">
                  Price: Rs. {selectedProduct.retailPrice.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">No product selected. Use search below.</div>
            )}
          </div>

          {/* Select Product with live search */}
          <div className="space-y-1.5 relative">
            <label className="block text-xs font-bold text-slate-700">Search & Select Product:</label>
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
                placeholder="Type name, brand, or barcode..."
                className="w-full bg-white border border-slate-300 pl-3 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                  }}
                  className="absolute right-8 text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  ✕
                </button>
              )}
              <span className="absolute right-2.5 text-slate-400 font-sans text-xs pointer-events-none">
                🔍
              </span>
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 rounded-none">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onMouseDown={() => {
                        setSelectedProductId(p.id);
                        setShowDropdown(false);
                      }}
                      className={`p-2 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center ${
                        selectedProductId === p.id ? 'bg-blue-50/50 font-bold' : ''
                      }`}
                    >
                      <div className="text-left truncate max-w-[70%]">
                        <div className="font-semibold text-slate-800 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Code: {p.barcode} | {p.company}
                        </div>
                      </div>
                      <div className="font-bold text-[#0070ba] text-[10px] shrink-0 font-mono">
                        Rs.{p.retailPrice}
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
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Labels Quantity (No. of Stickers):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={printQty}
              onChange={(e) => setPrintQty(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
            />
          </div>

          {/* Sticker Dimension Choice */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Sticker Dimensions:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLabelSize('standard')}
                className={`py-1.5 px-2 text-[11px] font-bold border transition-colors ${
                  labelSize === 'standard'
                    ? 'bg-[#002b49] text-white border-[#002b49]'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Standard (2"x1.2")
              </button>
              <button
                type="button"
                onClick={() => setLabelSize('small')}
                className={`py-1.5 px-2 text-[11px] font-bold border transition-colors ${
                  labelSize === 'small'
                    ? 'bg-[#002b49] text-white border-[#002b49]'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Small (1.8"x1")
              </button>
              <button
                type="button"
                onClick={() => setLabelSize('mini')}
                className={`py-1.5 px-2 text-[11px] font-bold border transition-colors ${
                  labelSize === 'mini'
                    ? 'bg-[#002b49] text-white border-[#002b49]'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Mini (1.5"x0.8")
              </button>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 border-b border-slate-100 pb-1">
              Customize Output Information:
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showStoreName}
                onChange={(e) => setShowStoreName(e.target.checked)}
                className="rounded text-[#0070ba] focus:ring-[#0070ba]"
              />
              <span>Show Store Name ({storeSettings.storeName})</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="rounded text-[#0070ba] focus:ring-[#0070ba]"
              />
              <span>Show Price (Rs. {selectedProduct?.retailPrice})</span>
            </label>
          </div>

          {/* Trigger Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full bg-[#1e7e34] hover:bg-[#155724] text-white font-bold py-2.5 px-4 text-xs flex items-center justify-center gap-2 shadow-md transition-colors active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT LABELS SHEET</span>
          </button>
        </div>

        {/* Right Side: Live Interactive Print Preview */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-none flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Live Barcode Grid Preview (Prints exactly as shown)</span>
              </span>
              <span className="text-[11px] text-[#28a745] font-mono font-bold">
                Thermal & Sticker Label Sheet Compatible
              </span>
            </h3>

            {/* Print container wrapping labels */}
            <div
              ref={printAreaRef}
              id="barcode-sticker-print-area"
              className="py-6 flex flex-wrap gap-4 justify-center bg-slate-50 border border-dashed border-slate-300 mt-4 max-h-[500px] overflow-y-auto"
            >
              {selectedProduct ? (
                Array.from({ length: printQty }).map((_, index) => (
                  <div
                    key={index}
                    className={`bg-white border border-slate-400 rounded-sm shadow-xs flex flex-col items-center justify-between text-center select-none shrink-0 ${sizeClasses[labelSize]}`}
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    {/* Store Title */}
                    {showStoreName && (
                      <div className="font-extrabold uppercase tracking-tight text-slate-900 leading-none truncate w-full text-[9px] border-b border-slate-100 pb-0.5">
                        {storeSettings.storeName}
                      </div>
                    )}

                    {/* Product Title */}
                    <div className="font-bold text-slate-800 leading-tight truncate w-full mt-0.5 px-0.5">
                      {selectedProduct.name}
                    </div>

                    {/* Real Scannable Barcode */}
                    <div className="flex flex-col items-center justify-center w-full my-1">
                      <Code39Barcode code={selectedProduct.barcode} />
                      <div className="font-mono text-[9px] font-black text-slate-900 tracking-wider leading-none mt-1">
                        {selectedProduct.barcode}
                      </div>
                    </div>

                    {/* Bottom Line: Price & Company */}
                    <div className="flex justify-between items-center w-full text-[9px] font-black text-slate-900 px-1 border-t border-slate-100 pt-0.5">
                      <span className="truncate max-w-[50%] font-semibold text-slate-500">
                        {selectedProduct.company}
                      </span>
                      {showPrice && (
                        <span className="bg-slate-100 px-1 font-mono text-slate-900 rounded-xs">
                          Rs.{selectedProduct.retailPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-slate-400 text-xs">No active products to generate barcodes.</div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 bg-emerald-50/50 p-3 flex items-start gap-2.5">
            <span className="text-[#155724] font-bold shrink-0">📌 Note:</span>
            <span>
              The printable grid uses professional CSS page break-avoid properties. For standard label printers
              (e.g., Xprinter / Zebra), set paper width and height to matching configurations in Chrome Print Settings.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
