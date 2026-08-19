import React, { useRef, useState } from 'react';
import { Printer, X, ZoomIn, ZoomOut, Check, QrCode, Sliders } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ThermalPaperSize } from '../types';
import { createDefaultReceiptTemplate } from '../utils/receiptTemplateDefaults';
import { BarcodeRenderer } from './BarcodeRenderer';

export const ReceiptModal: React.FC = () => {
  const { previewInvoice, setPreviewInvoice, storeSettings, thermalPaperSize, setThermalPaperSize, setActiveTab } = usePOS();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!previewInvoice) return null;

  const tpl = storeSettings.receiptTemplate || createDefaultReceiptTemplate(storeSettings);

  const handlePrint = (paperSize?: ThermalPaperSize) => {
    if (paperSize) {
      setThermalPaperSize(paperSize);
    }
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const is58mm = thermalPaperSize === '58mm';

  // Helper to render divider
  const renderDivider = () => {
    switch (tpl.dividerStyle) {
      case 'dotted':
        return <div className="border-t border-dotted border-black my-1" />;
      case 'solid':
        return <div className="border-t border-black my-1" />;
      case 'double':
        return <div className="border-t-2 border-b border-black h-1 my-1" />;
      case 'stars':
        return (
          <div className="text-center font-mono text-[9px] tracking-widest my-0.5 overflow-hidden text-black leading-none select-none">
            ************************************************
          </div>
        );
      case 'dashed':
      default:
        return <div className="border-t border-dashed border-black my-1" />;
    }
  };

  const getFontFamilyClass = () => {
    switch (tpl.fontFamily) {
      case 'sans-serif': return 'font-sans';
      case 'serif': return 'font-serif';
      case 'courier': return 'font-mono font-medium';
      case 'monospace':
      default: return 'font-mono';
    }
  };

  const getBaseFontSize = () => {
    if (is58mm) {
      if (tpl.baseFontSize === 'compact') return 'text-[8.5px] leading-tight';
      if (tpl.baseFontSize === 'large') return 'text-[10px] leading-tight';
      return 'text-[9px] leading-tight';
    } else {
      if (tpl.baseFontSize === 'compact') return 'text-[10px] leading-snug';
      if (tpl.baseFontSize === 'large') return 'text-[12px] leading-normal';
      return 'text-[11px] leading-snug';
    }
  };

  const getStoreNameSize = () => {
    if (is58mm) {
      switch (tpl.storeNameFontSize) {
        case 'huge': return 'text-sm font-black';
        case 'xlarge': return 'text-xs font-black';
        case 'large': return 'text-[11px] font-bold';
        default: return 'text-[10px] font-bold';
      }
    } else {
      switch (tpl.storeNameFontSize) {
        case 'huge': return 'text-lg font-black tracking-wide';
        case 'xlarge': return 'text-base font-black tracking-wide';
        case 'large': return 'text-sm font-bold tracking-wide';
        default: return 'text-xs font-bold';
      }
    }
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      {/* Receipt Preview Window Frame */}
      <div className="bg-slate-100 border border-slate-400 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Window Title & Action Toolbar */}
        <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between text-xs select-none gap-2 no-print print:hidden">
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
              className="p-1.5 hover:bg-slate-300 rounded text-slate-700 font-semibold flex items-center gap-1 bg-slate-100 border border-slate-300 cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-[#0070ba]" />
              <span className="text-[11px]">Print</span>
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 hover:bg-slate-300 rounded text-slate-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => setPreviewInvoice(null)}
              className="bg-slate-300 hover:bg-red-500 hover:text-white px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 inline mr-0.5" /> Close
            </button>
          </div>
        </div>

        {/* Receipt Canvas scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-300/60 items-start">
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}>
            {/* Thermal Paper Slip */}
            <div
              ref={receiptRef}
              id="thermal-receipt-paper"
              className={`bg-white text-black shadow-lg border border-slate-300 select-text ${getFontFamilyClass()} ${getBaseFontSize()} transition-all ${
                is58mm
                  ? 'paper-58mm w-[265px]'
                  : 'paper-80mm w-[360px]'
              } ${
                tpl.paperPadding === 'compact'
                  ? 'p-2.5'
                  : tpl.paperPadding === 'wide'
                  ? 'p-5'
                  : is58mm
                  ? 'p-3'
                  : 'p-4'
              }`}
            >
              {/* Header: Logo */}
              {tpl.showHeaderLogo && (
                <div
                  className={`flex mb-2 ${
                    tpl.logoAlignment === 'left'
                      ? 'justify-start'
                      : tpl.logoAlignment === 'right'
                      ? 'justify-end'
                      : 'justify-center'
                  }`}
                >
                  {storeSettings.logoUrl ? (
                    <img
                      src={storeSettings.logoUrl}
                      alt="Store Logo"
                      className={`object-contain grayscale ${
                        tpl.logoSize === 'small'
                          ? is58mm ? 'h-7' : 'h-8'
                          : tpl.logoSize === 'large'
                          ? is58mm ? 'h-14' : 'h-16'
                          : is58mm ? 'h-10' : 'h-12'
                      }`}
                    />
                  ) : (
                    <div className="text-center font-sans">
                      <div className={`${is58mm ? 'text-lg' : 'text-xl'} font-black text-black tracking-tighter`}>
                        HT
                      </div>
                      <div className="text-[9px] text-black font-bold tracking-widest leading-none">HackTes POS</div>
                    </div>
                  )}
                </div>
              )}

              {/* Header: Store Name */}
              <div
                className={`mb-1 ${
                  tpl.storeNameAlignment === 'left'
                    ? 'text-left'
                    : tpl.storeNameAlignment === 'right'
                    ? 'text-right'
                    : 'text-center'
                }`}
              >
                <h1
                  className={`${getStoreNameSize()} ${tpl.storeNameBold ? 'font-black' : 'font-semibold'} ${
                    tpl.storeNameUppercase ? 'uppercase' : ''
                  } leading-tight text-black`}
                >
                  {tpl.storeNameText || storeSettings.storeName || 'MY MEDICAL STORE'}
                </h1>

                {tpl.showTagline && (
                  <p className={`${is58mm ? 'text-[8.5px]' : 'text-[10px]'} font-semibold text-black mt-0.5`}>
                    {tpl.taglineText || storeSettings.tagline}
                  </p>
                )}

                {tpl.showAddress && (
                  <p className={`${is58mm ? 'text-[8px]' : 'text-[9.5px]'} text-black`}>
                    {tpl.addressText || storeSettings.address}
                  </p>
                )}

                {tpl.showPhone && (
                  <p className={`${is58mm ? 'text-[8px]' : 'text-[9.5px]'} text-black font-semibold`}>
                    {tpl.phoneLabel} {tpl.phoneText || storeSettings.phone}
                  </p>
                )}

                {tpl.showTaxId && (
                  <p className={`${is58mm ? 'text-[8px]' : 'text-[9.5px]'} text-black font-mono`}>
                    {tpl.taxIdLabel} {tpl.taxIdText}
                  </p>
                )}
              </div>

              {renderDivider()}

              {/* Metadata Details */}
              <div className="space-y-0.5">
                {tpl.showDate && (
                  <div className="flex justify-between">
                    <span>Date: {previewInvoice.date}</span>
                  </div>
                )}

                {tpl.showInvoiceNo && (
                  <div className="flex justify-between">
                    <span className="font-bold">
                      {tpl.invoiceNoLabel} #{previewInvoice.invoiceNo}
                    </span>
                    {tpl.showSaleType && (
                      <span className="font-semibold">Type: {previewInvoice.saleType}</span>
                    )}
                  </div>
                )}

                {tpl.showCashier && (
                  <div className="flex justify-between">
                    <span>
                      {tpl.cashierLabel} {previewInvoice.cashier || 'Admin'}
                    </span>
                    {tpl.showPaperSizeTag && <span className="font-mono text-[8px]">[{thermalPaperSize}]</span>}
                  </div>
                )}

                {tpl.showCustomerName && (
                  <div className="flex justify-between font-semibold">
                    <span className="truncate">
                      {tpl.customerNameLabel} {previewInvoice.customerName}
                    </span>
                  </div>
                )}
              </div>

              {renderDivider()}

              {/* Items Section */}
              {tpl.itemLayout === 'two_line' ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold pb-0.5 border-b border-black">
                    <span>{tpl.colNameLabel}</span>
                    <span>{tpl.colAmountLabel}</span>
                  </div>
                  {previewInvoice.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="font-semibold">{item.name}</div>
                      <div className="flex justify-between pl-2">
                        <span>
                          {item.qty} x {item.rate.toLocaleString()}
                          {tpl.showItemDiscount && item.discount > 0 && ` (Disc: -${item.discount})`}
                        </span>
                        <span className="font-bold">{item.subtotal.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="grid grid-cols-12 font-bold pb-0.5 border-b border-black">
                    <span className={is58mm ? 'col-span-5' : 'col-span-6'}>{tpl.colNameLabel}</span>
                    <span className={is58mm ? 'col-span-2 text-center' : 'col-span-2 text-center'}>
                      {tpl.colQtyLabel}
                    </span>
                    <span className={is58mm ? 'col-span-2 text-right' : 'col-span-2 text-right'}>
                      {tpl.colRateLabel}
                    </span>
                    <span className={is58mm ? 'col-span-3 text-right' : 'col-span-2 text-right'}>
                      {tpl.colAmountLabel}
                    </span>
                  </div>

                  {previewInvoice.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-start">
                      <div className={`${is58mm ? 'col-span-5' : 'col-span-6'} truncate`}>
                        <div className="font-medium">{item.name}</div>
                        {tpl.showBatchNo && (
                          <div className="text-[7.5px] text-black">Batch: B-101</div>
                        )}
                      </div>
                      <span className={`${is58mm ? 'col-span-2 text-center' : 'col-span-2 text-center'}`}>
                        {item.qty}
                      </span>
                      <span className={`${is58mm ? 'col-span-2 text-right' : 'col-span-2 text-right'}`}>
                        {item.rate.toLocaleString()}
                      </span>
                      <span className={`${is58mm ? 'col-span-3 text-right' : 'col-span-2 text-right'} font-bold`}>
                        {item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {tpl.showTotalItemsCount && (
                <div className="flex justify-between font-semibold pt-1 text-[8.5px] border-t border-dotted border-black mt-1">
                  <span>Total Items: {previewInvoice.items.length}</span>
                  <span>Total Pcs: {previewInvoice.items.reduce((sum, it) => sum + it.qty, 0)}</span>
                </div>
              )}

              {renderDivider()}

              {/* Totals & Calculations */}
              <div className="space-y-0.5">
                {tpl.showSubtotal && (
                  <div className="flex justify-between">
                    <span>Sub Total: {storeSettings.currency}</span>
                    <span>{previewInvoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {tpl.showDiscountTotal && previewInvoice.discountAmount > 0 && (
                  <div className="flex justify-between font-semibold text-black">
                    <span>Discount: {storeSettings.currency}</span>
                    <span>-{previewInvoice.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {tpl.showNetPayable && (
                  <div
                    className={`flex justify-between my-1 ${
                      tpl.netPayableBoxed
                        ? 'border-2 border-black p-1 bg-black/5 font-black text-xs'
                        : tpl.highlightNetPayable
                        ? 'font-black text-xs'
                        : 'font-bold'
                    }`}
                  >
                    <span>{tpl.netPayableLabel} {storeSettings.currency}</span>
                    <span>{previewInvoice.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {tpl.showPaidAmount && (
                  <div className="flex justify-between font-semibold">
                    <span>{tpl.paidLabel} {storeSettings.currency}</span>
                    <span>{previewInvoice.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {tpl.showChangeRefund && (
                  <div className="flex justify-between font-bold">
                    <span>{tpl.changeRefundLabel} {storeSettings.currency}</span>
                    <span>{previewInvoice.changeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {renderDivider()}

              {/* Footer Greetings & Notice */}
              <div className="text-center space-y-1 my-1">
                {tpl.showFooterGreeting && (
                  <div className={`uppercase tracking-wide ${tpl.footerGreetingBold ? 'font-black' : 'font-semibold'}`}>
                    {tpl.footerGreetingText || storeSettings.footerNote}
                  </div>
                )}

                {tpl.showFooterSubGreeting && (
                  <div className="text-[8px] font-medium">{tpl.footerSubGreetingText}</div>
                )}

                {tpl.showReturnPolicy && (
                  <div className="border border-black p-1 text-[7.5px] text-left mt-1.5 leading-tight">
                    <div className="font-bold uppercase text-center mb-0.5">{tpl.returnPolicyTitle}</div>
                    <div className="whitespace-pre-line font-mono">{tpl.returnPolicyText}</div>
                  </div>
                )}
              </div>

              {/* Barcode & QR Code on receipt */}
              <div className="flex flex-col items-center justify-center my-1.5 gap-1">
                {tpl.showBarcode && (
                  <div className="text-center">
                    <BarcodeRenderer value={`INV-${previewInvoice.invoiceNo}`} width={1.2} height={28} displayValue={false} />
                    <span className="text-[8px] font-mono font-bold tracking-wider">*INV-{previewInvoice.invoiceNo}*</span>
                  </div>
                )}

                {tpl.showQrCode && (
                  <div className="text-center pt-1">
                    <div className="w-16 h-16 border border-black p-1 bg-white mx-auto flex items-center justify-center">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                    <span className="text-[7.5px] font-mono">Scan to Verify Bill</span>
                  </div>
                )}
              </div>

              {tpl.showSoftwareCredit && (
                <div className="text-center text-[7px] text-black/70 pt-1 border-t border-dotted border-black">
                  {tpl.softwareCreditText}
                </div>
              )}

              {/* Paper feed lines for tear-off */}
              {Array.from({ length: tpl.feedCutLines || 2 }).map((_, i) => (
                <div key={i} className="h-3.5" />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Toolbar */}
        <div className="bg-slate-200 border-t border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-2 no-print print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPreviewInvoice(null);
                setActiveTab('store-settings');
              }}
              className="text-[#0070ba] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize Template in Studio</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewInvoice(null)}
              className="bg-slate-400 hover:bg-slate-500 text-white font-bold py-1.5 px-4 text-xs rounded cursor-pointer"
            >
              Close
            </button>

            {/* Direct 58mm Print button */}
            <button
              id="btn-print-58mm-now"
              onClick={() => handlePrint('58mm')}
              className="bg-[#17a2b8] hover:bg-[#138496] text-white font-bold py-1.5 px-3 text-xs rounded flex items-center gap-1.5 shadow active:scale-[0.98] cursor-pointer"
              title="Print as 58mm thermal slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 58mm</span>
            </button>

            {/* Direct 80mm Print button */}
            <button
              id="btn-print-80mm-now"
              onClick={() => handlePrint('80mm')}
              className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-1.5 px-4 text-xs rounded flex items-center gap-1.5 shadow active:scale-[0.98] cursor-pointer"
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
