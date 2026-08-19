import React, { useState, useRef } from 'react';
import {
  Printer,
  Save,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Type,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  CheckCircle2,
  FileText,
  Tag,
  ShoppingBag,
  DollarSign,
  QrCode,
  Barcode as BarcodeIcon,
  Sparkles,
  Layout,
  Scissors,
  Check,
  Eye,
  Settings,
  HelpCircle,
  Smartphone,
  Maximize2,
  Copy,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import {
  ReceiptTemplate,
  ThermalPaperSize,
  ThermalFontFamily,
  ThermalDividerStyle,
  ThermalTextAlignment,
  ThermalHeaderFontSize,
  ThermalBaseFontSize,
  ThermalItemLayout,
  SaleInvoice,
} from '../types';
import { createDefaultReceiptTemplate, RECEIPT_PRESETS } from '../utils/receiptTemplateDefaults';
import { BarcodeRenderer } from './BarcodeRenderer';

interface ThermalReceiptDesignerProps {
  onSaveCallback?: () => void;
  onCloseModal?: () => void;
}

export const ThermalReceiptDesigner: React.FC<ThermalReceiptDesignerProps> = ({
  onSaveCallback,
  onCloseModal,
}) => {
  const { storeSettings, updateStoreSettings, thermalPaperSize, setThermalPaperSize } = usePOS();

  // Template state initialized from storeSettings or default
  const [template, setTemplate] = useState<ReceiptTemplate>(() => {
    if (storeSettings.receiptTemplate) {
      return { ...createDefaultReceiptTemplate(storeSettings), ...storeSettings.receiptTemplate };
    }
    return createDefaultReceiptTemplate(storeSettings);
  });

  const [activeTab, setActiveTab] = useState<'header' | 'meta' | 'items' | 'totals' | 'footer' | 'style'>('header');
  const [paperSize, setPaperSize] = useState<ThermalPaperSize>(thermalPaperSize || '80mm');
  const [zoom, setZoom] = useState<number>(1);
  const [savedToast, setSavedToast] = useState(false);

  // Sample Invoice Data for Live WYSIWYG testing
  const sampleInvoice: SaleInvoice = {
    id: 'inv-demo-99',
    invoiceNo: 1084,
    date: '2026-08-19 15:45:30',
    customerName: 'Muhammad Ali (0345-1112223)',
    saleType: 'Retail',
    items: [
      { barcode: '1001', name: 'Panadol Extra 500mg Strip 10s', qty: 2, rate: 120, discount: 0, subtotal: 240 },
      { barcode: '1002', name: 'Brufen 400mg Tablets (Box 30s)', qty: 1, rate: 350, discount: 20, subtotal: 330 },
      { barcode: '1003', name: 'Sancos Cough Syrup 120ml', qty: 1, rate: 150, discount: 0, subtotal: 150 },
      { barcode: '1004', name: 'Cooking Oil 5L Premium Can', qty: 1, rate: 2500, discount: 100, subtotal: 2400 },
    ],
    totalAmount: 3120,
    discountAmount: 120,
    netAmount: 3000,
    paidAmount: 3500,
    changeAmount: 500,
    cashier: 'Admin Malik',
  };

  const handleApplyPreset = (presetId: string) => {
    const found = RECEIPT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      const newTpl = found.template(storeSettings);
      setTemplate(newTpl);
      if (presetId === 'compact_58mm') {
        setPaperSize('58mm');
      } else {
        setPaperSize('80mm');
      }
    }
  };

  const handleSaveTemplate = () => {
    updateStoreSettings({
      ...storeSettings,
      defaultPaperSize: paperSize,
      receiptTemplate: template,
    });
    setThermalPaperSize(paperSize);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
    if (onSaveCallback) onSaveCallback();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset receipt layout to default pharmacy settings?')) {
      setTemplate(createDefaultReceiptTemplate(storeSettings));
    }
  };

  const handleDirectTestPrint = () => {
    // Save current settings first
    updateStoreSettings({
      ...storeSettings,
      defaultPaperSize: paperSize,
      receiptTemplate: template,
    });
    setThermalPaperSize(paperSize);

    // Open print window
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Helper to render divider lines
  const renderDivider = () => {
    switch (template.dividerStyle) {
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

  const is58mm = paperSize === '58mm';

  // Compute font family class
  const getFontFamilyClass = () => {
    switch (template.fontFamily) {
      case 'sans-serif':
        return 'font-sans';
      case 'serif':
        return 'font-serif';
      case 'courier':
        return 'font-mono font-medium';
      case 'monospace':
      default:
        return 'font-mono';
    }
  };

  // Compute base font size
  const getBaseFontSize = () => {
    if (is58mm) {
      if (template.baseFontSize === 'compact') return 'text-[8.5px] leading-tight';
      if (template.baseFontSize === 'large') return 'text-[10px] leading-tight';
      return 'text-[9px] leading-tight';
    } else {
      if (template.baseFontSize === 'compact') return 'text-[10px] leading-snug';
      if (template.baseFontSize === 'large') return 'text-[12px] leading-normal';
      return 'text-[11px] leading-snug';
    }
  };

  // Compute Store Name size
  const getStoreNameSize = () => {
    if (is58mm) {
      switch (template.storeNameFontSize) {
        case 'huge': return 'text-sm font-black';
        case 'xlarge': return 'text-xs font-black';
        case 'large': return 'text-[11px] font-bold';
        default: return 'text-[10px] font-bold';
      }
    } else {
      switch (template.storeNameFontSize) {
        case 'huge': return 'text-lg font-black tracking-wide';
        case 'xlarge': return 'text-base font-black tracking-wide';
        case 'large': return 'text-sm font-bold tracking-wide';
        default: return 'text-xs font-bold';
      }
    }
  };

  return (
    <div id="receipt-designer-root" className="bg-[#f4f7fa] flex flex-col min-h-full">
      {/* Top Studio Header */}
      <div className="bg-[#002b49] text-white px-5 py-3 flex flex-wrap items-center justify-between shadow-md gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 text-white p-1.5 rounded-sm">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <span>THERMAL RECEIPT DESIGNER & TEMPLATE STUDIO</span>
              <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded font-mono">Word & Photoshop Style</span>
            </h2>
            <p className="text-[11px] text-slate-300">
              Customize headers, customer details, columns, totals, barcode & footer policies for your thermal printer.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleDirectTestPrint}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            title="Print test receipt to thermal printer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Test Print</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTemplate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-5 rounded-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Template Globally</span>
          </button>

          {onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="bg-slate-600 hover:bg-rose-600 text-white px-2.5 py-1.5 text-xs font-bold rounded-xs cursor-pointer ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {savedToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Thermal Receipt Template successfully saved and applied to all sales bills!</span>
        </div>
      )}

      {/* Preset Ribbon (1-Click Photoshop Style Templates) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Template Presets:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {RECEIPT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className="bg-slate-100 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border border-slate-300 text-slate-700 px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-all cursor-pointer"
                title={p.description}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Size Switcher & Zoom */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center bg-slate-100 p-0.5 border border-slate-300 rounded">
            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-3 py-1 text-xs font-bold rounded-xs cursor-pointer transition-colors ${
                paperSize === '80mm' ? 'bg-[#002b49] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              80mm (Standard)
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('58mm')}
              className={`px-3 py-1 text-xs font-bold rounded-xs cursor-pointer transition-colors ${
                paperSize === '58mm' ? 'bg-[#002b49] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              58mm (Mini)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-300 rounded">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT PANE: Word/Photoshop Style Inspector & Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white border-r border-slate-200 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto select-none">
            <button
              type="button"
              onClick={() => setActiveTab('header')}
              className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'header'
                  ? 'border-[#0070ba] text-[#0070ba] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>1. Header & Logo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('meta')}
              className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'meta'
                  ? 'border-[#0070ba] text-[#0070ba] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Invoice Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'items'
                  ? 'border-[#0070ba] text-[#0070ba] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>3. Items & Columns</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('totals')}
              className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'totals'
                  ? 'border-[#0070ba] text-[#0070ba] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>4. Totals & Net</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('footer')}
              className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'footer'
                  ? 'border-[#0070ba] text-[#0070ba] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>5. Footer & Barcode</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'style'
                  ? 'border-[#0070ba] text-[#0070ba] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>6. Fonts & Dividers</span>
            </button>
          </div>

          {/* TAB 1: HEADER & LOGO */}
          {activeTab === 'header' && (
            <div className="p-5 space-y-4 text-xs">
              {/* Store Name Customization */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-[#0070ba]" />
                  <span>Store / Business Name Typography</span>
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store Name on Receipt:</label>
                  <input
                    type="text"
                    value={template.storeNameText}
                    onChange={(e) => setTemplate({ ...template, storeNameText: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0070ba]"
                    placeholder="MY MEDICAL STORE"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Font Size:</label>
                    <select
                      value={template.storeNameFontSize}
                      onChange={(e) => setTemplate({ ...template, storeNameFontSize: e.target.value as ThermalHeaderFontSize })}
                      className="w-full bg-white border border-slate-300 px-2 py-1.5 text-xs font-semibold"
                    >
                      <option value="normal">Normal (12pt)</option>
                      <option value="large">Large (14pt - Recommended)</option>
                      <option value="xlarge">Extra Large (16pt)</option>
                      <option value="huge">Huge (18pt / Big Header)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Text Alignment:</label>
                    <div className="flex border border-slate-300 bg-white rounded-xs">
                      <button
                        type="button"
                        onClick={() => setTemplate({ ...template, storeNameAlignment: 'left' })}
                        className={`flex-1 py-1.5 flex justify-center ${template.storeNameAlignment === 'left' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600'}`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplate({ ...template, storeNameAlignment: 'center' })}
                        className={`flex-1 py-1.5 flex justify-center ${template.storeNameAlignment === 'center' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600'}`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplate({ ...template, storeNameAlignment: 'right' })}
                        className={`flex-1 py-1.5 flex justify-center ${template.storeNameAlignment === 'right' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600'}`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={template.storeNameBold}
                        onChange={(e) => setTemplate({ ...template, storeNameBold: e.target.checked })}
                        className="rounded text-[#0070ba]"
                      />
                      <span>Bold Header (**B**)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={template.storeNameUppercase}
                        onChange={(e) => setTemplate({ ...template, storeNameUppercase: e.target.checked })}
                        className="rounded text-[#0070ba]"
                      />
                      <span>ALL UPPERCASE (TT)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Logo & Tagline */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Logo Settings</h4>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-blue-700">
                    <input
                      type="checkbox"
                      checked={template.showHeaderLogo}
                      onChange={(e) => setTemplate({ ...template, showHeaderLogo: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Print Store Logo</span>
                  </label>
                </div>

                {template.showHeaderLogo && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Logo Size:</label>
                      <select
                        value={template.logoSize}
                        onChange={(e) => setTemplate({ ...template, logoSize: e.target.value as 'small' | 'medium' | 'large' })}
                        className="w-full bg-white border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="small">Small (36px height)</option>
                        <option value="medium">Medium (48px height)</option>
                        <option value="large">Large (64px height)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Logo Alignment:</label>
                      <select
                        value={template.logoAlignment}
                        onChange={(e) => setTemplate({ ...template, logoAlignment: e.target.value as ThermalTextAlignment })}
                        className="w-full bg-white border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="center">Center Aligned</option>
                        <option value="left">Left Aligned</option>
                        <option value="right">Right Aligned</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Tagline, Address, Phone, Tax/License */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Header Sub-Lines</h4>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={template.showTagline}
                      onChange={(e) => setTemplate({ ...template, showTagline: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span className="w-20 font-semibold text-[11px]">Tagline:</span>
                    <input
                      type="text"
                      disabled={!template.showTagline}
                      value={template.taglineText}
                      onChange={(e) => setTemplate({ ...template, taglineText: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                      placeholder="Pharmacy & General Store"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={template.showAddress}
                      onChange={(e) => setTemplate({ ...template, showAddress: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span className="w-20 font-semibold text-[11px]">Address:</span>
                    <input
                      type="text"
                      disabled={!template.showAddress}
                      value={template.addressText}
                      onChange={(e) => setTemplate({ ...template, addressText: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                      placeholder="Main Market, Lahore, Pakistan"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={template.showPhone}
                      onChange={(e) => setTemplate({ ...template, showPhone: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span className="w-20 font-semibold text-[11px]">Phone / Tel:</span>
                    <input
                      type="text"
                      disabled={!template.showPhone}
                      value={template.phoneLabel}
                      onChange={(e) => setTemplate({ ...template, phoneLabel: e.target.value })}
                      className="w-16 bg-white border border-slate-300 px-2 py-1 text-xs disabled:opacity-50 font-bold"
                      placeholder="Ph:"
                    />
                    <input
                      type="text"
                      disabled={!template.showPhone}
                      value={template.phoneText}
                      onChange={(e) => setTemplate({ ...template, phoneText: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                      placeholder="0300-1234567"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={template.showTaxId}
                      onChange={(e) => setTemplate({ ...template, showTaxId: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span className="w-20 font-semibold text-[11px]">Tax / Drug Lic:</span>
                    <input
                      type="text"
                      disabled={!template.showTaxId}
                      value={template.taxIdLabel}
                      onChange={(e) => setTemplate({ ...template, taxIdLabel: e.target.value })}
                      className="w-24 bg-white border border-slate-300 px-2 py-1 text-xs disabled:opacity-50 font-bold"
                      placeholder="Drug Lic #:"
                    />
                    <input
                      type="text"
                      disabled={!template.showTaxId}
                      value={template.taxIdText}
                      onChange={(e) => setTemplate({ ...template, taxIdText: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 px-2 py-1 text-xs disabled:opacity-50 font-mono"
                      placeholder="DL-042-88192"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVOICE INFO & CUSTOMER */}
          {activeTab === 'meta' && (
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Invoice & Date Layout</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={template.showInvoiceNo}
                        onChange={(e) => setTemplate({ ...template, showInvoiceNo: e.target.checked })}
                        className="rounded text-[#0070ba]"
                      />
                      <span>Show Invoice / Bill Number</span>
                    </label>
                    {template.showInvoiceNo && (
                      <div className="flex items-center gap-2 pl-6">
                        <span className="text-[11px] text-slate-500">Label:</span>
                        <input
                          type="text"
                          value={template.invoiceNoLabel}
                          onChange={(e) => setTemplate({ ...template, invoiceNoLabel: e.target.value })}
                          className="w-24 bg-white border border-slate-300 px-2 py-1 text-xs font-bold"
                          placeholder="Inv#:"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={template.showCashier}
                        onChange={(e) => setTemplate({ ...template, showCashier: e.target.checked })}
                        className="rounded text-[#0070ba]"
                      />
                      <span>Show Cashier / User Name</span>
                    </label>
                    {template.showCashier && (
                      <div className="flex items-center gap-2 pl-6">
                        <span className="text-[11px] text-slate-500">Label:</span>
                        <input
                          type="text"
                          value={template.cashierLabel}
                          onChange={(e) => setTemplate({ ...template, cashierLabel: e.target.value })}
                          className="w-28 bg-white border border-slate-300 px-2 py-1 text-xs font-bold"
                          placeholder="Cashier:"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-semibold text-slate-700 mb-1">Date & Time Format:</label>
                  <select
                    value={template.dateFormat}
                    onChange={(e) => setTemplate({ ...template, dateFormat: e.target.value as any })}
                    className="w-full sm:w-72 bg-white border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  >
                    <option value="YYYY-MM-DD HH:mm:ss">2026-08-19 15:45:30 (Standard ISO)</option>
                    <option value="DD/MM/YYYY hh:mm A">19/08/2026 03:45 PM (12-Hour AM/PM)</option>
                    <option value="DD-MMM-YYYY HH:mm">19-Aug-2026 15:45 (Friendly Date)</option>
                  </select>
                </div>
              </div>

              {/* Customer Information Block */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Customer & Khata Details</h4>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={template.showCustomerName}
                        onChange={(e) => setTemplate({ ...template, showCustomerName: e.target.checked })}
                        className="rounded text-[#0070ba]"
                      />
                      <span>Print Customer Name</span>
                    </label>
                    <input
                      type="text"
                      disabled={!template.showCustomerName}
                      value={template.customerNameLabel}
                      onChange={(e) => setTemplate({ ...template, customerNameLabel: e.target.value })}
                      className="w-28 bg-white border border-slate-300 px-2 py-1 text-xs font-bold"
                      placeholder="Customer:"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={template.showCustomerPhone}
                      onChange={(e) => setTemplate({ ...template, showCustomerPhone: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Print Customer Phone Number</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={template.showCustomerAddress}
                      onChange={(e) => setTemplate({ ...template, showCustomerAddress: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Print Customer Address</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={template.showCustomerPreviousBalance}
                      onChange={(e) => setTemplate({ ...template, showCustomerPreviousBalance: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Print Previous Khata Balance (Credit Ledger Balance on Slip)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={template.showSaleType}
                      onChange={(e) => setTemplate({ ...template, showSaleType: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Print Sale Type Badge (Retail / Wholesale / Walk-in)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ITEMS & COLUMNS */}
          {activeTab === 'items' && (
            <div className="p-5 space-y-4 text-xs">
              {/* Item Layout Mode */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Item Table Format</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      template.itemLayout === 'standard_table'
                        ? 'bg-blue-50 border-[#0070ba] text-[#002b49] font-bold'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemLayoutPref"
                      checked={template.itemLayout === 'standard_table'}
                      onChange={() => setTemplate({ ...template, itemLayout: 'standard_table' })}
                      className="text-[#0070ba] mr-2"
                    />
                    <span>Standard Columns Grid (Item | Qty | Rate | Total)</span>
                  </label>

                  <label
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      template.itemLayout === 'two_line'
                        ? 'bg-blue-50 border-[#0070ba] text-[#002b49] font-bold'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemLayoutPref"
                      checked={template.itemLayout === 'two_line'}
                      onChange={() => setTemplate({ ...template, itemLayout: 'two_line' })}
                      className="text-[#0070ba] mr-2"
                    />
                    <span>2-Line Mobile Layout (Line 1: Name, Line 2: 2 x 100 = 200)</span>
                  </label>
                </div>
              </div>

              {/* Column Header Titles */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Custom Column Header Labels</h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Item Title:</label>
                    <input
                      type="text"
                      value={template.colNameLabel}
                      onChange={(e) => setTemplate({ ...template, colNameLabel: e.target.value })}
                      className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qty Title:</label>
                    <input
                      type="text"
                      value={template.colQtyLabel}
                      onChange={(e) => setTemplate({ ...template, colQtyLabel: e.target.value })}
                      className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rate Title:</label>
                    <input
                      type="text"
                      value={template.colRateLabel}
                      onChange={(e) => setTemplate({ ...template, colRateLabel: e.target.value })}
                      className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Disc Title:</label>
                    <input
                      type="text"
                      value={template.colDiscountLabel}
                      onChange={(e) => setTemplate({ ...template, colDiscountLabel: e.target.value })}
                      className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount Title:</label>
                    <input
                      type="text"
                      value={template.colAmountLabel}
                      onChange={(e) => setTemplate({ ...template, colAmountLabel: e.target.value })}
                      className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Column Toggles */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Additional Item Attributes</h4>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={template.showItemDiscount}
                    onChange={(e) => setTemplate({ ...template, showItemDiscount: e.target.checked })}
                    className="rounded text-[#0070ba]"
                  />
                  <span>Show Individual Item Discount column</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={template.showBatchNo}
                    onChange={(e) => setTemplate({ ...template, showBatchNo: e.target.checked })}
                    className="rounded text-[#0070ba]"
                  />
                  <span>Print Batch Number under item name</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={template.showExpiryDate}
                    onChange={(e) => setTemplate({ ...template, showExpiryDate: e.target.checked })}
                    className="rounded text-[#0070ba]"
                  />
                  <span>Print Medicine Expiry Date</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={template.showTotalItemsCount}
                    onChange={(e) => setTemplate({ ...template, showTotalItemsCount: e.target.checked })}
                    className="rounded text-[#0070ba]"
                  />
                  <span>Print Total Items & Total Units Summary (e.g. "Total Items: 4 | Total Qty: 5")</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: TOTALS & NET */}
          {activeTab === 'totals' && (
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Totals & Calculations</h4>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={template.showSubtotal}
                      onChange={(e) => setTemplate({ ...template, showSubtotal: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Show Gross Subtotal Line</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={template.showDiscountTotal}
                      onChange={(e) => setTemplate({ ...template, showDiscountTotal: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Show Invoice Discount Amount Line</span>
                  </label>

                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 w-32">Net Amount Label:</span>
                      <input
                        type="text"
                        value={template.netPayableLabel}
                        onChange={(e) => setTemplate({ ...template, netPayableLabel: e.target.value })}
                        className="bg-white border border-slate-300 px-2 py-1 text-xs font-black text-slate-900"
                        placeholder="NET AMOUNT:"
                      />
                    </div>

                    <div className="flex flex-wrap gap-4 pl-34">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={template.highlightNetPayable}
                          onChange={(e) => setTemplate({ ...template, highlightNetPayable: e.target.checked })}
                          className="rounded text-[#0070ba]"
                        />
                        <span>Extra Bold / Highlight Net Payable</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={template.netPayableBoxed}
                          onChange={(e) => setTemplate({ ...template, netPayableBoxed: e.target.checked })}
                          className="rounded text-[#0070ba]"
                        />
                        <span>Enclose Net Payable in Solid Box</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={template.showPaidAmount}
                          onChange={(e) => setTemplate({ ...template, showPaidAmount: e.target.checked })}
                          className="rounded text-[#0070ba]"
                        />
                        <span>Show Cash Tendered / Paid</span>
                      </label>
                      <input
                        type="text"
                        value={template.paidLabel}
                        onChange={(e) => setTemplate({ ...template, paidLabel: e.target.value })}
                        className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-semibold"
                        placeholder="PAID:"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={template.showChangeRefund}
                          onChange={(e) => setTemplate({ ...template, showChangeRefund: e.target.checked })}
                          className="rounded text-[#0070ba]"
                        />
                        <span>Show Change / Refund Returned</span>
                      </label>
                      <input
                        type="text"
                        value={template.changeRefundLabel}
                        onChange={(e) => setTemplate({ ...template, changeRefundLabel: e.target.value })}
                        className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-semibold"
                        placeholder="CHANGE:"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 pt-1">
                    <input
                      type="checkbox"
                      checked={template.showPaymentMethod}
                      onChange={(e) => setTemplate({ ...template, showPaymentMethod: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Print Payment Mode Tag (Cash, Online, Khata)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FOOTER, POLICIES & BARCODE */}
          {activeTab === 'footer' && (
            <div className="p-5 space-y-4 text-xs">
              {/* Word Style Footer Notes */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Footer Greetings (Word Style Editor)</span>
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={template.showFooterGreeting}
                      onChange={(e) => setTemplate({ ...template, showFooterGreeting: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span className="w-24 font-semibold">Main Greeting:</span>
                    <input
                      type="text"
                      disabled={!template.showFooterGreeting}
                      value={template.footerGreetingText}
                      onChange={(e) => setTemplate({ ...template, footerGreetingText: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 px-2 py-1 text-xs font-bold"
                      placeholder="THANK YOU! VISIT AGAIN"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={template.showFooterSubGreeting}
                      onChange={(e) => setTemplate({ ...template, showFooterSubGreeting: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span className="w-24 font-semibold">Sub Greeting:</span>
                    <input
                      type="text"
                      disabled={!template.showFooterSubGreeting}
                      value={template.footerSubGreetingText}
                      onChange={(e) => setTemplate({ ...template, footerSubGreetingText: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 px-2 py-1 text-xs"
                      placeholder="Stay Healthy - Stay Safe"
                    />
                  </div>
                </div>
              </div>

              {/* Return Policy Notice Box */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    Terms & Return Policy Notice Box
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-700">
                    <input
                      type="checkbox"
                      checked={template.showReturnPolicy}
                      onChange={(e) => setTemplate({ ...template, showReturnPolicy: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <span>Print Policy Box</span>
                  </label>
                </div>

                {template.showReturnPolicy && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notice Title:</label>
                      <input
                        type="text"
                        value={template.returnPolicyTitle}
                        onChange={(e) => setTemplate({ ...template, returnPolicyTitle: e.target.value })}
                        className="w-full bg-white border border-slate-300 px-2 py-1 text-xs font-bold"
                        placeholder="NOTICE / RETURN POLICY:"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Policy Terms (Multi-line text supported):
                      </label>
                      <textarea
                        rows={3}
                        value={template.returnPolicyText}
                        onChange={(e) => setTemplate({ ...template, returnPolicyText: e.target.value })}
                        className="w-full bg-white border border-slate-300 p-2 text-xs font-mono leading-relaxed"
                        placeholder="1. No return without bill.&#10;2. Return within 3 days."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Barcode & QR Code Section */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <BarcodeIcon className="w-4 h-4 text-[#0070ba]" />
                  <span>Dynamic Barcode & QR Code</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 p-2 bg-white border border-slate-300 rounded-xs">
                    <input
                      type="checkbox"
                      checked={template.showBarcode}
                      onChange={(e) => setTemplate({ ...template, showBarcode: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <div>
                      <div className="text-xs font-bold">Print Invoice Barcode</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Allows instant barcode scan during Sale Return
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 p-2 bg-white border border-slate-300 rounded-xs">
                    <input
                      type="checkbox"
                      checked={template.showQrCode}
                      onChange={(e) => setTemplate({ ...template, showQrCode: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <div>
                      <div className="text-xs font-bold">Print Invoice QR Code</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Quick digital verification & mobile scanning
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Software Attribution / Branding:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={template.showSoftwareCredit}
                      onChange={(e) => setTemplate({ ...template, showSoftwareCredit: e.target.checked })}
                      className="rounded text-[#0070ba]"
                    />
                    <input
                      type="text"
                      disabled={!template.showSoftwareCredit}
                      value={template.softwareCreditText}
                      onChange={(e) => setTemplate({ ...template, softwareCreditText: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 px-2 py-1 text-xs"
                      placeholder="Software by Ali Trader POS"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bottom Paper Feed / Cut Lines:</span>
                  </span>
                  <select
                    value={template.feedCutLines}
                    onChange={(e) => setTemplate({ ...template, feedCutLines: parseInt(e.target.value) || 0 })}
                    className="bg-white border border-slate-300 px-2 py-1 text-xs font-mono font-bold"
                  >
                    <option value={0}>0 blank lines (Tight)</option>
                    <option value={1}>1 blank line</option>
                    <option value={2}>2 blank lines (Standard)</option>
                    <option value={3}>3 blank lines (Easy tear)</option>
                    <option value={4}>4 blank lines</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FONTS & DIVIDERS */}
          {activeTab === 'style' && (
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Font Family & Typography</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Receipt Font Type:</label>
                    <select
                      value={template.fontFamily}
                      onChange={(e) => setTemplate({ ...template, fontFamily: e.target.value as ThermalFontFamily })}
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                    >
                      <option value="monospace">Monospace (Authentic Thermal Style)</option>
                      <option value="courier">Courier (Bold Crisp Print)</option>
                      <option value="sans-serif">Sans-Serif (Modern Clean SaaS)</option>
                      <option value="serif">Serif (Traditional Elegant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Font Scale:</label>
                    <select
                      value={template.baseFontSize}
                      onChange={(e) => setTemplate({ ...template, baseFontSize: e.target.value as ThermalBaseFontSize })}
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                    >
                      <option value="compact">Compact (9px - High density)</option>
                      <option value="standard">Standard (11px - Recommended)</option>
                      <option value="large">Large (12.5px - Easy to read)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Divider Styles */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Divider Line Style</h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'dashed', label: 'Dashed (----)' },
                    { id: 'dotted', label: 'Dotted (....)' },
                    { id: 'solid', label: 'Solid (____)' },
                    { id: 'double', label: 'Double (====)' },
                    { id: 'stars', label: 'Stars (****)' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTemplate({ ...template, dividerStyle: style.id as ThermalDividerStyle })}
                      className={`p-2 border text-center rounded-xs transition-colors cursor-pointer ${
                        template.dividerStyle === style.id
                          ? 'bg-blue-100 border-[#0070ba] text-[#002b49] font-bold'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-semibold">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Padding */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Roll Padding / Margins</h4>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'compact', label: 'Compact (8px padding)' },
                    { id: 'normal', label: 'Standard (14px padding)' },
                    { id: 'wide', label: 'Spacious (20px padding)' },
                  ].map((pad) => (
                    <button
                      key={pad.id}
                      type="button"
                      onClick={() => setTemplate({ ...template, paperPadding: pad.id as any })}
                      className={`p-2 border text-center rounded-xs transition-colors cursor-pointer ${
                        template.paperPadding === pad.id
                          ? 'bg-blue-100 border-[#0070ba] text-[#002b49] font-bold'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{pad.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Live Interactive Thermal Preview Canvas (5 cols) */}
        <div className="lg:col-span-5 bg-slate-300/70 p-4 sm:p-6 flex flex-col items-center justify-start overflow-y-auto max-h-[calc(100vh-140px)] select-none">
          <div className="mb-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-700" />
            <span>Real-time Thermal Paper Preview ({paperSize})</span>
          </div>

          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.1s ease',
            }}
          >
            {/* Authentic Thermal Paper Roll Simulation */}
            <div
              id="thermal-receipt-paper"
              className={`bg-white text-black shadow-2xl border border-slate-300 select-text ${getFontFamilyClass()} ${getBaseFontSize()} ${
                is58mm ? 'w-[265px] paper-58mm' : 'w-[360px] paper-80mm'
              } ${
                template.paperPadding === 'compact'
                  ? 'p-2.5'
                  : template.paperPadding === 'wide'
                  ? 'p-5'
                  : is58mm
                  ? 'p-3'
                  : 'p-4'
              }`}
            >
              {/* Header: Logo */}
              {template.showHeaderLogo && (
                <div
                  className={`flex mb-2 ${
                    template.logoAlignment === 'left'
                      ? 'justify-start'
                      : template.logoAlignment === 'right'
                      ? 'justify-end'
                      : 'justify-center'
                  }`}
                >
                  {storeSettings.logoUrl ? (
                    <img
                      src={storeSettings.logoUrl}
                      alt="Store Logo"
                      className={`object-contain grayscale ${
                        template.logoSize === 'small'
                          ? is58mm ? 'h-7' : 'h-8'
                          : template.logoSize === 'large'
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
                  template.storeNameAlignment === 'left'
                    ? 'text-left'
                    : template.storeNameAlignment === 'right'
                    ? 'text-right'
                    : 'text-center'
                }`}
              >
                <h1
                  className={`${getStoreNameSize()} ${template.storeNameBold ? 'font-black' : 'font-semibold'} ${
                    template.storeNameUppercase ? 'uppercase' : ''
                  } leading-tight text-black`}
                >
                  {template.storeNameText || 'MY MEDICAL STORE'}
                </h1>

                {template.showTagline && (
                  <p className={`${is58mm ? 'text-[8.5px]' : 'text-[10px]'} font-semibold text-black mt-0.5`}>
                    {template.taglineText}
                  </p>
                )}

                {template.showAddress && (
                  <p className={`${is58mm ? 'text-[8px]' : 'text-[9.5px]'} text-black`}>{template.addressText}</p>
                )}

                {template.showPhone && (
                  <p className={`${is58mm ? 'text-[8px]' : 'text-[9.5px]'} text-black font-semibold`}>
                    {template.phoneLabel} {template.phoneText}
                  </p>
                )}

                {template.showTaxId && (
                  <p className={`${is58mm ? 'text-[8px]' : 'text-[9.5px]'} text-black font-mono`}>
                    {template.taxIdLabel} {template.taxIdText}
                  </p>
                )}
              </div>

              {renderDivider()}

              {/* Metadata Details */}
              <div className="space-y-0.5">
                {template.showDate && (
                  <div className="flex justify-between">
                    <span>Date: {sampleInvoice.date}</span>
                  </div>
                )}

                {template.showInvoiceNo && (
                  <div className="flex justify-between">
                    <span className="font-bold">
                      {template.invoiceNoLabel} #{sampleInvoice.invoiceNo}
                    </span>
                    {template.showSaleType && (
                      <span className="font-semibold">Type: {sampleInvoice.saleType}</span>
                    )}
                  </div>
                )}

                {template.showCashier && (
                  <div className="flex justify-between">
                    <span>
                      {template.cashierLabel} {sampleInvoice.cashier}
                    </span>
                    {template.showPaperSizeTag && <span className="font-mono text-[8px]">[{paperSize}]</span>}
                  </div>
                )}

                {template.showCustomerName && (
                  <div className="flex justify-between font-semibold">
                    <span className="truncate">
                      {template.customerNameLabel} {sampleInvoice.customerName}
                    </span>
                  </div>
                )}

                {template.showCustomerPreviousBalance && (
                  <div className="flex justify-between text-black font-semibold">
                    <span>Prev Khata Bal:</span>
                    <span>Rs. 8,500.00</span>
                  </div>
                )}
              </div>

              {renderDivider()}

              {/* Items Section */}
              {template.itemLayout === 'two_line' ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold pb-0.5 border-b border-black">
                    <span>{template.colNameLabel}</span>
                    <span>{template.colAmountLabel}</span>
                  </div>
                  {sampleInvoice.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="font-semibold">{item.name}</div>
                      <div className="flex justify-between pl-2">
                        <span>
                          {item.qty} x {item.rate.toLocaleString()}
                          {template.showItemDiscount && item.discount > 0 && ` (Disc: -${item.discount})`}
                        </span>
                        <span className="font-bold">{item.subtotal.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="grid grid-cols-12 font-bold pb-0.5 border-b border-black">
                    <span className={is58mm ? 'col-span-5' : 'col-span-6'}>{template.colNameLabel}</span>
                    <span className={is58mm ? 'col-span-2 text-center' : 'col-span-2 text-center'}>
                      {template.colQtyLabel}
                    </span>
                    <span className={is58mm ? 'col-span-2 text-right' : 'col-span-2 text-right'}>
                      {template.colRateLabel}
                    </span>
                    <span className={is58mm ? 'col-span-3 text-right' : 'col-span-2 text-right'}>
                      {template.colAmountLabel}
                    </span>
                  </div>

                  {sampleInvoice.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-start">
                      <div className={`${is58mm ? 'col-span-5' : 'col-span-6'} truncate`}>
                        <div className="font-medium">{item.name}</div>
                        {template.showBatchNo && (
                          <div className="text-[7.5px] text-black">Batch: B-901 | Exp: 12/28</div>
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

              {template.showTotalItemsCount && (
                <div className="flex justify-between font-semibold pt-1 text-[8.5px] border-t border-dotted border-black mt-1">
                  <span>Total Items: {sampleInvoice.items.length}</span>
                  <span>Total Pcs: {sampleInvoice.items.reduce((sum, it) => sum + it.qty, 0)}</span>
                </div>
              )}

              {renderDivider()}

              {/* Totals & Calculations */}
              <div className="space-y-0.5">
                {template.showSubtotal && (
                  <div className="flex justify-between">
                    <span>Sub Total:</span>
                    <span>Rs. {sampleInvoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {template.showDiscountTotal && sampleInvoice.discountAmount > 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>Discount:</span>
                    <span>-Rs. {sampleInvoice.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {template.showNetPayable && (
                  <div
                    className={`flex justify-between my-1 ${
                      template.netPayableBoxed
                        ? 'border-2 border-black p-1 bg-black/5 font-black text-xs'
                        : template.highlightNetPayable
                        ? 'font-black text-xs'
                        : 'font-bold'
                    }`}
                  >
                    <span>{template.netPayableLabel}</span>
                    <span>Rs. {sampleInvoice.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {template.showPaidAmount && (
                  <div className="flex justify-between font-semibold">
                    <span>{template.paidLabel}</span>
                    <span>Rs. {sampleInvoice.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {template.showChangeRefund && (
                  <div className="flex justify-between font-bold">
                    <span>{template.changeRefundLabel}</span>
                    <span>Rs. {sampleInvoice.changeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {renderDivider()}

              {/* Footer Greetings & Notice */}
              <div className="text-center space-y-1 my-1">
                {template.showFooterGreeting && (
                  <div className={`uppercase tracking-wide ${template.footerGreetingBold ? 'font-black' : 'font-semibold'}`}>
                    {template.footerGreetingText}
                  </div>
                )}

                {template.showFooterSubGreeting && (
                  <div className="text-[8px] font-medium">{template.footerSubGreetingText}</div>
                )}

                {template.showReturnPolicy && (
                  <div className="border border-black p-1 text-[7.5px] text-left mt-1.5 leading-tight">
                    <div className="font-bold uppercase text-center mb-0.5">{template.returnPolicyTitle}</div>
                    <div className="whitespace-pre-line font-mono">{template.returnPolicyText}</div>
                  </div>
                )}
              </div>

              {/* Barcode & QR Code on receipt */}
              <div className="flex flex-col items-center justify-center my-1.5 gap-1">
                {template.showBarcode && (
                  <div className="text-center">
                    <BarcodeRenderer value={`INV-${sampleInvoice.invoiceNo}`} width={1.2} height={28} displayValue={false} />
                    <span className="text-[8px] font-mono font-bold tracking-wider">*INV-{sampleInvoice.invoiceNo}*</span>
                  </div>
                )}

                {template.showQrCode && (
                  <div className="text-center pt-1">
                    <div className="w-16 h-16 border border-black p-1 bg-white mx-auto flex items-center justify-center">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                    <span className="text-[7.5px] font-mono">Scan to Verify Bill</span>
                  </div>
                )}
              </div>

              {template.showSoftwareCredit && (
                <div className="text-center text-[7px] text-black/70 pt-1 border-t border-dotted border-black">
                  {template.softwareCreditText}
                </div>
              )}

              {/* Paper feed lines for tear-off */}
              {Array.from({ length: template.feedCutLines }).map((_, i) => (
                <div key={i} className="h-3.5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
