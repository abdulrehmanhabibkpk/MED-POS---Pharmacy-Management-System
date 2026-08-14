import React, { useRef, useState } from 'react';
import { Printer, X, ZoomIn, ZoomOut, Maximize2, LayoutGrid, FileText, Check } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ThermalPaperSize } from '../types';

export const ReceiptModal: React.FC = () => {
  const { previewInvoice, setPreviewInvoice, storeSettings, thermalPaperSize, setThermalPaperSize } = usePOS();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!previewInvoice) return null;

  const handlePrint = (paperSize?: ThermalPaperSize) => {
    if (paperSize) {
      setThermalPaperSize(paperSize);
    }
    // Allow React to update class before opening print dialog
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const is58mm = thermalPaperSize === '58mm';

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      {/* Receipt Preview Window Frame matching Image 13 */}
      <div className="bg-slate-100 border border-slate-400 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Window Title & Action Toolbar matching Image 13 */}
        <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between text-xs select-none gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Printer className="w-4 h-4 text-[#0070ba]" />
            <span>Receipt Preview</span>
            <span className="bg-[#002b49] text-white text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
              {thermalPaperSize}
            </span>
          </div>

          {/* Paper Size Selector Buttons */}
          <div className="flex items-center gap-1 bg-white p-0.5 border border-slate-300 rounded">
            <button
              id="btn-paper-80mm"
              type="button"
              onClick={() => setThermalPaperSize('80mm')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-colors ${
                thermalPaperSize === '80mm'
                  ? 'bg-[#0078d7] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Standard POS Paper (80mm / 3 inch)"
            >
              {thermalPaperSize === '80mm' && <Check className="w-3 h-3" />}
              <span>80mm (Standard)</span>
            </button>
            <button
              id="btn-paper-58mm"
              type="button"
              onClick={() => setThermalPaperSize('58mm')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-colors ${
                thermalPaperSize === '58mm'
                  ? 'bg-[#0078d7] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Mini Thermal Paper (58mm / 2 inch)"
            >
              {thermalPaperSize === '58mm' && <Check className="w-3 h-3" />}
              <span>58mm (Mini)</span>
            </button>
          </div>

          {/* Tools & Zoom */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePrint()}
              className="p-1.5 hover:bg-slate-300 rounded text-slate-700 font-semibold flex items-center gap-1 bg-slate-100 border border-slate-300"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-[#0070ba]" />
              <span className="text-[11px]">Print</span>
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1 hover:bg-slate-300 rounded text-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 hover:bg-slate-300 rounded text-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => setPreviewInvoice(null)}
              className="bg-slate-300 hover:bg-red-500 hover:text-white px-2.5 py-1 text-xs font-semibold rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 inline mr-0.5" /> Close
            </button>
          </div>
        </div>

        {/* Receipt Canvas scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-300/60 items-start">
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}>
            {/* Thermal Paper Slip (Exact Mono styling formatted for 58mm or 80mm) */}
            <div
              ref={receiptRef}
              id="thermal-receipt-paper"
              className={`bg-white text-black shadow-lg border border-slate-300 font-mono leading-tight select-text transition-all ${
                is58mm
                  ? 'paper-58mm w-[265px] p-3 text-[9.5px]'
                  : 'paper-80mm w-[360px] p-5 text-[11px]'
              }`}
            >
              {/* Store Logo / HackTes branding */}
              <div className="flex flex-col items-center justify-center text-center mb-2.5">
                {storeSettings.logoUrl ? (
                  <img
                    src={storeSettings.logoUrl}
                    alt="Store Logo"
                    className={`w-auto object-contain mb-1 ${is58mm ? 'h-9 max-w-[120px]' : 'h-12 max-w-[160px]'}`}
                  />
                ) : (
                  <div className="text-center font-sans mb-1">
                    <div className={`${is58mm ? 'text-xl' : 'text-2xl'} font-black text-[#0070ba] tracking-tighter`}>
                      HT
                    </div>
                    <div className={`${is58mm ? 'text-[9px]' : 'text-[11px]'} text-slate-900 font-bold tracking-widest leading-none`}>
                      HackTes
                    </div>
                  </div>
                )}

                <h2 className={`${is58mm ? 'text-xs' : 'text-sm'} font-black tracking-wide uppercase mt-0.5`}>
                  {storeSettings.storeName || 'MY MEDICAL STORE'}
                </h2>
                <p className={`${is58mm ? 'text-[8.5px]' : 'text-[10px]'} text-slate-800 font-medium`}>
                  {storeSettings.tagline || 'Pharmacy & General Store'}
                </p>
                <p className={`${is58mm ? 'text-[8.5px]' : 'text-[10px]'} text-slate-700`}>
                  {storeSettings.address || 'Main Market, Pakistan'}
                </p>
                <p className={`${is58mm ? 'text-[8.5px]' : 'text-[10px]'} text-slate-700`}>
                  Ph: {storeSettings.phone || '0300-1234567'}
                </p>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-black my-1"></div>

              {/* Meta Details */}
              <div className={`space-y-0.5 ${is58mm ? 'text-[8.5px]' : 'text-[10px]'}`}>
                <div className="flex justify-between">
                  <span>Date: {previewInvoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate">Customer: {previewInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier: {previewInvoice.cashier || 'Admin'}</span>
                  <span>Inv#: {previewInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type: {previewInvoice.saleType}</span>
                  <span className="font-semibold">Paper: {thermalPaperSize}</span>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-black my-1"></div>

              {/* Items Table Header */}
              <div className={`grid grid-cols-12 font-bold ${is58mm ? 'text-[8.5px]' : 'text-[10px]'} pb-0.5`}>
                <span className={is58mm ? 'col-span-5' : 'col-span-6'}>Item Name</span>
                <span className={is58mm ? 'col-span-2 text-center' : 'col-span-2 text-center'}>Qty</span>
                <span className={is58mm ? 'col-span-2 text-right' : 'col-span-2 text-right'}>Rate</span>
                <span className={is58mm ? 'col-span-3 text-right' : 'col-span-2 text-right'}>Amt</span>
              </div>
              <div className="border-t border-dashed border-black mb-1"></div>

              {/* Items List */}
              <div className={`space-y-1 ${is58mm ? 'text-[8.5px]' : 'text-[10px]'}`}>
                {previewInvoice.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-start">
                    <span className={`${is58mm ? 'col-span-5' : 'col-span-6'} truncate font-medium`}>
                      {item.name}
                    </span>
                    <span className={`${is58mm ? 'col-span-2 text-center' : 'col-span-2 text-center'}`}>
                      {item.qty}
                    </span>
                    <span className={`${is58mm ? 'col-span-2 text-right' : 'col-span-2 text-right'}`}>
                      {item.rate.toLocaleString()}
                    </span>
                    <span className={`${is58mm ? 'col-span-3 text-right' : 'col-span-2 text-right'} font-semibold`}>
                      {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-black my-1"></div>

              {/* Summary Totals */}
              <div className={`space-y-0.5 ${is58mm ? 'text-[8.5px]' : 'text-[10px]'}`}>
                <div className="flex justify-between">
                  <span>Sub Total: {storeSettings.currency}</span>
                  <span>{previewInvoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {previewInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-red-700">
                    <span>Discount: {storeSettings.currency}</span>
                    <span>{previewInvoice.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="border-t border-dashed border-black my-1"></div>

                <div className={`flex justify-between font-black ${is58mm ? 'text-[10px]' : 'text-xs'}`}>
                  <span>NET AMOUNT: {storeSettings.currency}</span>
                  <span>{previewInvoice.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between font-semibold">
                  <span>PAID: {storeSettings.currency}</span>
                  <span>{previewInvoice.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between">
                  <span>CHANGE: {storeSettings.currency}</span>
                  <span>{previewInvoice.changeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-black my-1.5"></div>

              {/* Footer Slip Note */}
              <div className={`text-center font-bold ${is58mm ? 'text-[8.5px]' : 'text-[10px]'} space-y-0.5 uppercase tracking-wide`}>
                <div>THANK YOU! VISIT AGAIN</div>
                <div className={`${is58mm ? 'text-[7.5px]' : 'text-[9px]'} font-normal`}>
                  Stay Healthy - Stay Safe
                </div>
              </div>

              <div className="border-t border-dashed border-black my-1"></div>
              <div className={`text-center ${is58mm ? 'text-[7px]' : 'text-[8px]'} text-slate-500`}>
                Software by THE PAK HACKERS
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Toolbar */}
        <div className="bg-slate-200 border-t border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-2">
          {/* Quick Paper Switcher in footer */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-600 font-semibold text-[11px]">Printer Size:</span>
            <button
              onClick={() => setThermalPaperSize('80mm')}
              className={`px-2 py-1 text-xs font-bold rounded ${
                thermalPaperSize === '80mm' ? 'bg-[#002b49] text-white' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
              }`}
            >
              80mm Standard
            </button>
            <button
              onClick={() => setThermalPaperSize('58mm')}
              className={`px-2 py-1 text-xs font-bold rounded ${
                thermalPaperSize === '58mm' ? 'bg-[#002b49] text-white' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
              }`}
            >
              58mm Mini
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewInvoice(null)}
              className="bg-slate-400 hover:bg-slate-500 text-white font-bold py-1.5 px-4 text-xs rounded"
            >
              Close
            </button>

            {/* Direct 58mm Print button */}
            <button
              id="btn-print-58mm-now"
              onClick={() => handlePrint('58mm')}
              className="bg-[#17a2b8] hover:bg-[#138496] text-white font-bold py-1.5 px-3 text-xs rounded flex items-center gap-1.5 shadow active:scale-[0.98]"
              title="Print as 58mm thermal slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 58mm</span>
            </button>

            {/* Direct 80mm Print button */}
            <button
              id="btn-print-80mm-now"
              onClick={() => handlePrint('80mm')}
              className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-1.5 px-4 text-xs rounded flex items-center gap-1.5 shadow active:scale-[0.98]"
              title="Print as 80mm thermal slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 80mm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

