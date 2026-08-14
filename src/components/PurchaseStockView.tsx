import React, { useState, useCallback } from 'react';
import { Package, Search, CheckCircle2, History, Box, ScanLine } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { useHardwareScanner } from '../hooks/useHardwareScanner';
import { posSound } from '../utils/audio';

export const PurchaseStockView: React.FC = () => {
  const { products, addPurchase, purchases, storeSettings } = usePOS();

  const [supplierName, setSupplierName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [itemName, setItemName] = useState('');
  const [qtyReceived, setQtyReceived] = useState<number>(1);
  const [unitCostPrice, setUnitCostPrice] = useState<number>(0);
  const [salePriceRetail, setSalePriceRetail] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);

  const fetchItemByCode = useCallback((codeToFind: string) => {
    const cleanCode = codeToFind.trim();
    if (!cleanCode) return;
    const found = products.find(
      (p) => p.barcode.trim().toLowerCase() === cleanCode.toLowerCase()
    );
    if (found) {
      setBarcode(found.barcode);
      setItemName(found.name);
      setSupplierName(found.company || '');
      setUnitCostPrice(found.purchasePrice);
      setSalePriceRetail(found.retailPrice);
      setWholesalePrice(found.wholesalePrice);
      setSuccessMsg(`Auto-loaded "${found.name}" details.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setBarcode(cleanCode);
      setSuccessMsg(`New barcode "${cleanCode}" entered. Complete details to register.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  }, [products]);

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

    addPurchase({
      supplierName: supplierName.trim() || 'General Supplier',
      barcode: barcode.trim(),
      itemName: itemName.trim(),
      qtyReceived,
      unitCostPrice,
      salePriceRetail,
      wholesalePrice,
      totalCost,
    });

    setSuccessMsg(`Successfully received ${qtyReceived}x "${itemName}" (Total Cost: ${storeSettings.currency} ${totalCost.toLocaleString()}).`);
    setTimeout(() => setSuccessMsg(''), 4000);

    // Reset inputs
    setSupplierName('');
    setBarcode('');
    setItemName('');
    setQtyReceived(1);
    setUnitCostPrice(0);
    setSalePriceRetail(0);
    setWholesalePrice(0);
  };

  const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalCost, 0);

  return (
    <div id="purchase-stock-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Stock Purchase Entry (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-[#002b49] font-bold text-sm mb-4 border-b border-slate-100 pb-3">
            <Package className="w-5 h-5 text-[#28a745]" />
            <span>Stock Purchase Entry</span>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePurchase} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Name:
              </label>
              <input
                id="pur-supplier"
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Al-Madina Pharma Distributors"
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#28a745]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Barcode (Scan Here):
                </label>
                <button
                  type="button"
                  onClick={() => setShowScannerModal(true)}
                  className="text-[11px] text-[#0070ba] hover:text-[#005a96] font-bold flex items-center gap-1"
                  title="Scan with Camera"
                >
                  <span>Camera Scan</span>
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 flex items-center">
                  <input
                    id="pur-barcode"
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan or enter barcode..."
                    className="w-full bg-white border border-slate-300 pl-3 pr-9 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#28a745]"
                    required
                  />
                  {/* Small Barcode Scanner Button */}
                  <button
                    type="button"
                    onClick={() => setShowScannerModal(true)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-[#0070ba] hover:bg-slate-100 rounded transition-colors group"
                    title="Open Camera Scanner"
                  >
                    <div className="relative flex items-center justify-center w-5 h-4 bg-slate-50 border border-slate-300 rounded-xs group-hover:border-[#0070ba]">
                      <span className="font-mono text-[7px] font-black tracking-tighter text-slate-800">||||</span>
                      <div className="absolute inset-x-0 h-0.5 bg-red-500"></div>
                    </div>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleFetchItem}
                  className="bg-[#0070ba] hover:bg-[#005a96] text-white font-bold px-3 py-1.5 text-xs flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Fetch Item</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name:</label>
              <input
                id="pur-item-name"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Cooking Oil 5L / Panadol Extra"
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#28a745]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qty Received:
                </label>
                <input
                  id="pur-qty"
                  type="number"
                  min="1"
                  value={qtyReceived}
                  onChange={(e) => setQtyReceived(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#28a745]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Cost Price ({storeSettings.currency}):
                </label>
                <input
                  id="pur-cost-price"
                  type="number"
                  min="0"
                  step="any"
                  value={unitCostPrice === 0 ? '' : unitCostPrice}
                  onChange={(e) => setUnitCostPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#28a745]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sale Price (Retail):
                </label>
                <input
                  id="pur-retail-price"
                  type="number"
                  min="0"
                  step="any"
                  value={salePriceRetail === 0 ? '' : salePriceRetail}
                  onChange={(e) => setSalePriceRetail(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#28a745]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wholesale Price:
                </label>
                <input
                  id="pur-wholesale-price"
                  type="number"
                  min="0"
                  step="any"
                  value={wholesalePrice === 0 ? '' : wholesalePrice}
                  onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#28a745]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-save-purchase-stock"
                type="submit"
                className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-2 px-6 text-xs flex items-center gap-2 shadow transition-colors active:scale-[0.98]"
              >
                <Box className="w-4 h-4" />
                <span>Save Purchase</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Table: Purchase History (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <History className="w-4 h-4 text-[#28a745]" />
              <span>Purchase History</span>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Total Purchases:{' '}
              <strong className="text-[#28a745]">
                {storeSettings.currency} {totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#28a745] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Supplier</th>
                  <th className="py-2.5 px-3 font-semibold">Barcode</th>
                  <th className="py-2.5 px-3 font-semibold">Item Name</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Cost Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No stock receiving records found.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-green-50 text-slate-700">
                      <td className="py-2.5 px-3">{p.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{p.supplierName}</td>
                      <td className="py-2.5 px-3 font-mono">{p.barcode}</td>
                      <td className="py-2.5 px-3">{p.itemName}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{p.qtyReceived}</td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {p.unitCostPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#28a745]">
                        {storeSettings.currency}{' '}
                        {p.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
