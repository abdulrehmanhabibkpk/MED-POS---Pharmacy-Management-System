import React, { useState } from 'react';
import { Plus, RefreshCw, Edit2, Trash2, Search, Tag, X, Check, ScanLine, FileSpreadsheet, Download, Upload, AlertCircle, Layers, ListPlus, CheckSquare, Square, Filter, SlidersHorizontal } from 'lucide-react';
import * as XLSX from 'xlsx';
import { usePOS } from '../context/POSContext';
import { Product } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { BulkProductEntryModal } from './BulkProductEntryModal';
import { BulkProductEditorModal } from './BulkProductEditorModal';
import { useHardwareScanner } from '../hooks/useHardwareScanner';
import { posSound } from '../utils/audio';

export const ProductsView: React.FC = () => {
  const { products, addProduct, addMultipleProducts, updateProduct, deleteProduct, bulkUpdateProducts, bulkDeleteProducts, importProducts, storeSettings, categories, brands, suppliers } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterSupplier, setFilterSupplier] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkEditorModal, setShowBulkEditorModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Multi-select state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Excel CSV State
  const [importPreviewList, setImportPreviewList] = useState<Product[] | null>(null);
  const [importStatusMsg, setImportStatusMsg] = useState<string>('');

  // Form State
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('Pharmacy');
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(10);

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all visible filtered products
  const handleSelectAllVisible = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedIds.size} selected products from inventory?`)) {
      bulkDeleteProducts(Array.from(selectedIds));
      setSelectedIds(new Set());
      posSound.playSuccessChime();
    }
  };

  // Hardware Scanner for Product View (if modal open, set barcode)
  useHardwareScanner({
    onScan: (scannedCode) => {
      posSound.playScanBeep();
      if (showModal) {
        setBarcode(scannedCode.trim());
      } else {
        setSearchTerm(scannedCode.trim());
      }
    },
    enabled: true,
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setBarcode(Math.floor(1000 + Math.random() * 9000).toString());
    setName('');
    setCompany('');
    setCategory('Pharmacy');
    setSupplierId('');
    setSupplierName('');
    setPurchasePrice(0);
    setRetailPrice(0);
    setWholesalePrice(0);
    setStock(10);
    setMinStockAlert(5);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setBarcode(p.barcode);
    setName(p.name);
    setCompany(p.company);
    setCategory(p.category);
    setSupplierId(p.supplierId || '');
    setSupplierName(p.supplierName || '');
    setPurchasePrice(p.purchasePrice);
    setRetailPrice(p.retailPrice);
    setWholesalePrice(p.wholesalePrice);
    setStock(p.stock);
    setMinStockAlert(p.minStockAlert);
    setShowModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || !name.trim()) {
      alert('Barcode and Product Name are required.');
      return;
    }

    const matchedSup = suppliers.find((s) => s.id === supplierId);
    const finalSupplierName = matchedSup ? matchedSup.name : supplierName.trim();

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        barcode: barcode.trim(),
        name: name.trim(),
        company: company.trim() || finalSupplierName || 'General',
        category: category.trim() || 'General',
        supplierId: supplierId || undefined,
        supplierName: finalSupplierName || undefined,
        purchasePrice,
        retailPrice,
        wholesalePrice,
        stock,
        minStockAlert,
      });
    } else {
      addProduct({
        barcode: barcode.trim(),
        name: name.trim(),
        company: company.trim() || finalSupplierName || 'General',
        category: category.trim() || 'General',
        supplierId: supplierId || undefined,
        supplierName: finalSupplierName || undefined,
        purchasePrice,
        retailPrice,
        wholesalePrice,
        stock,
        minStockAlert,
      });
    }

    setShowModal(false);
  };

  const handleDeleteProduct = (id: string, prodName: string) => {
    if (window.confirm(`Are you sure you want to delete "${prodName}" from inventory?`)) {
      deleteProduct(id);
    }
  };

  // Spreadsheet CSV column configuration (matching standard and complex fields from Image 2)
  const csvHeaders = [
    'NAME',
    'BRAND',
    'UNIT',
    'CATEGORY',
    'SUB-CATEGORY',
    'SKU (Leave blank to auto generate sku)',
    'BARCODE TYPE',
    'MANAGE STOCK (1=yes 0=No)',
    'ALERT QUANTITY',
    'EXPIRES IN',
    'EXPIRY PERIOD UNIT (months/days)',
    'APPLICABLE TAX',
    'Selling Price Tax Type (inclusive or exclusive)',
    'PRODUCT TYPE (single or variable)',
    'VARIATION NAME (Keep blank if product type is single)',
    'VARIATION VALUES',
    'VARIATION SKUs',
    'PURCHASE PRICE (Including tax)',
    'PURCHASE PRICE (Excluding tax)',
    'PROFIT MARGIN',
    'SELLING PRICE',
    'OPENING STOCK',
    'OPENING STOCK LOCATION',
    'EXPIRY DATE',
    'ENABLE IMEI OR SERIAL NUMBER(1=yes 0=No)',
    'WEIGHT',
    'RACK',
    'ROW',
    'POSITION',
    'IMAGE',
    'PRODUCT DESCRIPTION',
    'CUSTOM FIELD 1',
    'CUSTOM FIELD 2',
    'CUSTOM FIELD 3',
    'CUSTOM FIELD 4',
    'NOT FOR SELLING(1=yes 0=No)',
    'PRODUCT LOCATIONS'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [''];
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    return lines;
  };

  const downloadCSVTemplate = () => {
    const csvContent = [
      csvHeaders.join(','),
      `"Panadol Extra 500mg","GSK","Packs","Pharmacy","Tablets","8801234567890","EAN13","1","10","","","","","single","","","","15.50","15.50","20.00","25.00","500","Main Aisle 1","2027-12-31","0","","A1","R2","P3","","Pain relief and fever reduction","","","","","0","Main Warehouse"`,
      `"Surbex Z Multivitamins","Abbott","Bottles","Pharmacy","Vitamins","8809876543210","EAN13","1","5","","","","","single","","","","220.00","220.00","15.00","270.00","150","Vitamin Rack","2027-10-31","0","","B2","R1","P2","","High potency zinc and b-complex","","","","","0","Main Store"`,
      `"Dettol Antiseptic liquid","Reckitt","Bottles","Personal Care","Liquid","5011321360052","EAN13","1","15","","","","","single","","","","180.00","180.00","10.00","200.00","80","Hygiene Shelf","2028-06-30","0","","C1","R4","P1","","First aid and personal hygiene","","","","","0","Main Store"`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'medpos_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    const csvRows = [csvHeaders.join(',')];
    
    products.forEach((p) => {
      const margin = p.purchasePrice > 0 ? (((p.retailPrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(1) : '0';
      const row = [
        escapeCSV(p.name),
        escapeCSV(p.company),
        'Packs', // UNIT
        escapeCSV(p.category),
        '', // SUB-CATEGORY
        escapeCSV(p.barcode),
        'EAN13', // BARCODE TYPE
        '1', // MANAGE STOCK
        escapeCSV(p.minStockAlert),
        '', '', '', '', 'single', '', '', '', // placeholders
        escapeCSV(p.purchasePrice), // PURCHASE PRICE (Including tax)
        escapeCSV(p.purchasePrice), // PURCHASE PRICE (Excluding tax)
        margin, // PROFIT MARGIN
        escapeCSV(p.retailPrice), // SELLING PRICE
        escapeCSV(p.stock), // OPENING STOCK
        'Main Warehouse', // OPENING STOCK LOCATION
        '', // EXPIRY DATE
        '0', // ENABLE IMEI
        '', '', '', '', '', '', '', '', '', '', '0', 'Main Store'
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `medpos_exported_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        let parsedLines: string[][] = [];
        
        if (isXlsx) {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Convert sheet to JSON array of arrays
          const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
          parsedLines = rawRows.map(row => 
            row.map(cell => cell === null || cell === undefined ? '' : String(cell).trim())
          );
        } else {
          const text = event.target?.result as string;
          if (!text) {
            alert('Could not read file content.');
            return;
          }
          parsedLines = parseCSV(text);
        }
        
        if (parsedLines.length < 2) {
          alert('Spreadsheet file is empty or only has headers.');
          return;
        }
        
        // Clean and process headers
        const headerRow = parsedLines[0].map(h => h.trim().toUpperCase());
        
        const nameIdx = headerRow.findIndex(h => h === 'NAME' || h === 'PRODUCT NAME' || h === 'PRODUCT' || h === 'TITLE');
        const brandIdx = headerRow.findIndex(h => h === 'BRAND' || h === 'COMPANY' || h === 'MANUFACTURER');
        const categoryIdx = headerRow.findIndex(h => h === 'CATEGORY');
        const skuIdx = headerRow.findIndex(h => h.includes('SKU') || h.includes('BARCODE') || h === 'CODE');
        const alertQtyIdx = headerRow.findIndex(h => h.includes('ALERT QUANTITY') || h.includes('MIN STOCK') || h.includes('ALERT LIMIT'));
        const purchaseIdx = headerRow.findIndex(h => h.includes('PURCHASE PRICE') || h === 'PURCHASE' || h.includes('PURCHASE_PRICE'));
        const sellingIdx = headerRow.findIndex(h => h === 'SELLING PRICE' || h === 'SELLING_PRICE' || h === 'RETAIL PRICE' || h === 'RETAIL_PRICE' || h === 'PRICE');
        const stockIdx = headerRow.findIndex(h => h.includes('OPENING STOCK') || h === 'STOCK' || h === 'QTY' || h === 'QUANTITY');
        
        if (nameIdx === -1) {
          alert('Invalid Spreadsheet structure. The sheet must contain a "NAME" or "PRODUCT NAME" column.');
          return;
        }
        
        const tempProducts: Product[] = [];
        
        for (let i = 1; i < parsedLines.length; i++) {
          const row = parsedLines[i];
          // Skip empty rows or rows without name
          if (!row || row.length === 0 || !row[nameIdx]?.trim()) continue;
          
          const productName = row[nameIdx]?.trim();
          const productBrand = brandIdx !== -1 && row[brandIdx] ? row[brandIdx].trim() : 'General';
          const productCategory = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx].trim() : 'Pharmacy';
          
          let productBarcode = skuIdx !== -1 && row[skuIdx] ? row[skuIdx].trim() : '';
          if (!productBarcode) {
            // Auto-generate barcode if blank
            productBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
          }
          
          const alertQty = alertQtyIdx !== -1 && row[alertQtyIdx] ? parseInt(row[alertQtyIdx]) || 5 : 5;
          const purchasePriceVal = purchaseIdx !== -1 && row[purchaseIdx] ? parseFloat(row[purchaseIdx]) || 0 : 0;
          const retailPriceVal = sellingIdx !== -1 && row[sellingIdx] ? parseFloat(row[sellingIdx]) || 0 : 0;
          const stockVal = stockIdx !== -1 && row[stockIdx] ? parseInt(row[stockIdx]) || 0 : 0;
          
          tempProducts.push({
            id: `p-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
            barcode: productBarcode,
            name: productName,
            company: productBrand,
            category: productCategory,
            purchasePrice: purchasePriceVal,
            retailPrice: retailPriceVal,
            wholesalePrice: retailPriceVal * 0.9, // Wholesale defaults to 90%
            stock: stockVal,
            minStockAlert: alertQty
          });
        }
        
        if (tempProducts.length === 0) {
          alert('No valid product rows could be imported. Please verify your data.');
          return;
        }
        
        setImportPreviewList(tempProducts);
        setImportStatusMsg(`Loaded ${tempProducts.length} products from sheet. Review them below before confirming:`);
      } catch (err: any) {
        alert('An error occurred during parsing: ' + err.message);
      }
    };
    
    if (isXlsx) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
    // Reset file input so same file can be uploaded again
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (importPreviewList) {
      importProducts(importPreviewList);
      posSound.playDoubleBeep();
      setImportPreviewList(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.barcode.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(q));

    const matchCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchBrand = filterBrand === 'All' || p.company === filterBrand;
    const matchSupplier = filterSupplier === 'All' || p.supplierId === filterSupplier || p.supplierName === filterSupplier;

    return matchSearch && matchCategory && matchBrand && matchSupplier;
  });

  const selectedProductsList = products.filter((p) => selectedIds.has(p.id));

  return (
    <div id="products-management-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-4">
      {/* Top Filter & Action Bar matching Image 8 */}
      <div className="bg-white border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <label className="text-xs font-bold text-slate-700 shrink-0">Search:</label>
          <input
            id="product-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, barcode, supplier, company..."
            className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        {/* Quick Filter: Category */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold text-slate-700 shrink-0">Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-slate-300 py-1.5 px-2 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          >
            <option value="All">All Categories ({categories.length})</option>
            {categories.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter: Brand */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold text-slate-700 shrink-0">Brand:</label>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="bg-white border border-slate-300 py-1.5 px-2 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          >
            <option value="All">All Brands ({brands.length})</option>
            {brands.map((b, idx) => (
              <option key={idx} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter: Supplier */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold text-slate-700 shrink-0">Supplier:</label>
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="bg-white border border-slate-300 py-1.5 px-2 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          >
            <option value="All">All Suppliers ({suppliers.length})</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-bulk-list-product"
            onClick={() => setShowBulkModal(true)}
            type="button"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 px-3 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-[0.98] cursor-pointer"
            title="Add multiple products in a spreadsheet-style table with rapid scanning"
          >
            <ListPlus className="w-4 h-4 text-emerald-200" />
            <span>+ List Product</span>
          </button>

          <button
            id="btn-add-new-product"
            onClick={openAddModal}
            type="button"
            className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-1.5 px-3.5 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('All');
              setFilterBrand('All');
              setFilterSupplier('All');
            }}
            type="button"
            className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-1.5 px-3 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Floating Sticky Bulk Operations Toolbar when items are selected */}
      {selectedIds.size > 0 && (
        <div className="bg-[#002b49] text-white p-3 shadow-lg border border-blue-900 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded text-xs">
              {selectedIds.size} Selected
            </span>
            <span className="text-xs font-semibold text-blue-100">
              Bulk actions for {selectedIds.size} selected inventory items
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowBulkEditorModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-200" />
              <span>⚡ Bulk Price & Detail Editor</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDeleteSelected}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete ({selectedIds.size})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-1.5 px-3 text-xs cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Excel/CSV Utilities Row */}
      <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm">
            <FileSpreadsheet className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#002b49] uppercase tracking-wide">Excel / CSV Spreadsheet Integration</h4>
            <p className="text-[10px] text-slate-500 font-medium">Bulk import or export products in Microsoft Excel standard format</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={downloadCSVTemplate}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-1.5 px-3.5 text-xs flex items-center gap-1.5 transition-colors active:scale-95 shadow-xs cursor-pointer"
            title="Download Template with standard columns"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Sample Template</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-1.5 px-3.5 text-xs flex items-center gap-1.5 transition-colors active:scale-95 shadow-xs cursor-pointer"
            title="Export stock database to CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-300" />
            <span>Export Products</span>
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleCSVImport}
              id="csv-file-uploader-view"
              className="hidden"
            />
            <label
              htmlFor="csv-file-uploader-view"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 px-4 text-xs flex items-center gap-1.5 transition-colors active:scale-95 shadow-xs cursor-pointer select-none inline-flex items-center"
              title="Upload your Excel sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200 mr-1.5" />
              <span>Import Products Sheet</span>
            </label>
          </div>
        </div>
      </div>

      {/* Products Table matching Image 8 */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAllVisible}
                    className="w-4 h-4 rounded text-[#0070ba] cursor-pointer"
                    title="Select / Deselect all visible products"
                  />
                </th>
                <th className="py-2.5 px-3 font-semibold">Barcode</th>
                <th className="py-2.5 px-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Company</th>
                <th className="py-2.5 px-3 font-semibold text-right">Purchase</th>
                <th className="py-2.5 px-3 font-semibold text-right">Retail</th>
                <th className="py-2.5 px-3 font-semibold text-right">Wholesale</th>
                <th className="py-2.5 px-3 font-semibold text-center">Profit Margin</th>
                <th className="py-2.5 px-3 font-semibold text-center">Stock</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const isSelected = selectedIds.has(p.id);
                  const profit = p.retailPrice - p.purchasePrice;
                  const marginPercent = p.purchasePrice > 0
                    ? ((profit / p.purchasePrice) * 100)
                    : (p.retailPrice > 0 ? 100 : 0);

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50 font-medium text-slate-900'
                          : idx === 0
                          ? 'bg-[#0078d7] text-white font-medium hover:bg-[#006bbd]'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p.id)}
                          className="w-4 h-4 rounded text-[#0070ba] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono">{p.barcode}</td>
                      <td className="py-2.5 px-3 font-semibold">{p.name}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold">{p.company}</div>
                        {p.supplierName && (
                          <div className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 ${isSelected ? 'text-blue-900 font-extrabold' : idx === 0 ? 'text-white/80' : 'text-emerald-700'}`}>
                            Dist: {p.supplierName}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {p.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {storeSettings.currency}{' '}
                        {p.retailPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {p.wholesalePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex flex-col items-center justify-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              isSelected
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : idx === 0
                                ? profit >= 0
                                  ? 'bg-emerald-300 text-emerald-950 font-black'
                                  : 'bg-rose-300 text-rose-950 font-black'
                                : profit > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : profit < 0
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                            title={`Purchase: ${storeSettings.currency} ${p.purchasePrice.toFixed(2)} | Retail: ${storeSettings.currency} ${p.retailPrice.toFixed(2)} | Unit Profit: ${storeSettings.currency} ${profit.toFixed(2)}`}
                          >
                            {profit > 0 ? '+' : ''}{marginPercent.toFixed(1)}%
                          </span>
                          <span
                            className={`text-[9px] font-semibold mt-0.5 ${
                              isSelected
                                ? 'text-blue-700'
                                : idx === 0
                                ? 'text-white/80'
                                : profit >= 0
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {profit >= 0 ? '+' : ''}{storeSettings.currency} {profit.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            p.stock <= p.minStockAlert
                              ? idx === 0 && !isSelected
                                ? 'bg-amber-300 text-amber-900 font-black'
                                : 'bg-red-100 text-red-700 font-black'
                              : ''
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{p.category}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className={`p-1 hover:scale-110 transition-transform ${
                              idx === 0 && !isSelected ? 'text-white' : 'text-[#0070ba]'
                            }`}
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className={`p-1 hover:scale-110 transition-transform ${
                              idx === 0 && !isSelected ? 'text-rose-200' : 'text-red-500'
                            }`}
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-xl w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800">
            <div className="bg-[#002b49] text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Tag className="w-4 h-4" />
                <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Barcode *:</label>
                    <button
                      type="button"
                      onClick={() => setShowScannerModal(true)}
                      className="text-[11px] text-[#0070ba] hover:text-[#005a96] font-bold flex items-center gap-1"
                      title="Scan Barcode via Camera"
                    >
                      <span>Scan Live</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="e.g. 1001"
                      className="w-full bg-white border border-slate-300 pl-3 pr-10 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                      required
                    />
                    {/* Small Barcode Scanner Button matching Image 6 & 7 */}
                    <button
                      type="button"
                      onClick={() => setShowScannerModal(true)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-[#0070ba] hover:bg-slate-100 rounded transition-colors group"
                      title="Scan with Camera Barcode Scanner"
                    >
                      <div className="relative flex items-center justify-center w-6 h-5 bg-slate-50 border border-slate-300 rounded-xs group-hover:border-[#0070ba]">
                        <span className="font-mono text-[8px] font-black tracking-tighter text-slate-800">||| |</span>
                        <div className="absolute inset-x-0 h-0.5 bg-red-500 group-hover:shadow-[0_0_4px_#ef4444]"></div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name *:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Panadol Extra 500mg"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Brand:</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. GSK / Abbott / Dalda"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  >
                    <option value="Pharmacy">Pharmacy / Medicine</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Baby Care">Baby Care</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Associate Supplier / Distributor:</label>
                  <select
                    value={supplierId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSupplierId(selectedId);
                      const s = suppliers.find((sup) => sup.id === selectedId);
                      if (s) {
                        setSupplierName(s.name);
                        if (!company) setCompany(s.company || s.name);
                      } else if (!selectedId) {
                        setSupplierName('');
                      }
                    }}
                    className="w-full bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  >
                    <option value="">-- Select Registered Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.company ? `(${s.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Or custom/new supplier name:</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => {
                      setSupplierName(e.target.value);
                      const matched = suppliers.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
                      if (matched) setSupplierId(matched.id);
                      else setSupplierId('');
                    }}
                    placeholder="Type name if not registered..."
                    className="w-full bg-white border border-slate-300 px-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Purchase Price ({storeSettings.currency}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={purchasePrice === 0 ? '' : purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Retail Price ({storeSettings.currency}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={retailPrice === 0 ? '' : retailPrice}
                    onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Wholesale Price ({storeSettings.currency}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={wholesalePrice === 0 ? '' : wholesalePrice}
                    onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              {/* Live Profit Margin Calculator Indicator */}
              {retailPrice > 0 && (
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-[11px]">Profit Margin:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-black ${
                        retailPrice - purchasePrice > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : retailPrice - purchasePrice < 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {purchasePrice > 0
                        ? `${(((retailPrice - purchasePrice) / purchasePrice) * 100).toFixed(1)}%`
                        : '100.0%'}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-700">
                    Unit Margin:{' '}
                    <span className={retailPrice - purchasePrice >= 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                      {retailPrice - purchasePrice >= 0 ? '+' : ''}{storeSettings.currency} {(retailPrice - purchasePrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Stock Qty:</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Low Stock Alert Limit:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 5)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={(scannedBarcode) => {
          setBarcode(scannedBarcode);
          setShowScannerModal(false);
        }}
        title="Add Product Barcode Scanner"
      />

      {/* Excel Import Preview Modal */}
      {importPreviewList && (
        <div className="fixed inset-0 bg-black/60 z-55 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-4xl w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#0f5132] text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <FileSpreadsheet className="w-5 h-5 text-emerald-300 animate-bounce" />
                <span>Excel Spreadsheet - Import Preview ({importPreviewList.length} Rows Detected)</span>
              </div>
              <button
                onClick={() => setImportPreviewList(null)}
                className="text-emerald-100 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                <div>
                  <h5 className="font-bold text-emerald-900">Excel Parsing Successful!</h5>
                  <p className="text-[11px] leading-relaxed mt-0.5 text-emerald-950">
                    We mapped your spreadsheet columns to match our standard POS system schema. Below is the preview of what will be written to local storage. Overlapping barcodes will update existing products, while new barcodes will be appended.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2">Barcode SKU</th>
                      <th className="py-2 px-2">Product Name</th>
                      <th className="py-2 px-2">Brand / Company</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2 text-right">Purchase Price</th>
                      <th className="py-2 px-2 text-right">Retail Selling Price</th>
                      <th className="py-2 px-2 text-center">Profit Margin</th>
                      <th className="py-2 px-2 text-center">Opening Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {importPreviewList.map((p, idx) => {
                      const profit = p.retailPrice - p.purchasePrice;
                      const marginPct = p.purchasePrice > 0
                        ? ((profit / p.purchasePrice) * 100)
                        : (p.retailPrice > 0 ? 100 : 0);

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-2 font-mono text-slate-600">{p.barcode}</td>
                          <td className="py-2 px-2 font-bold text-slate-800">{p.name}</td>
                          <td className="py-2 px-2 text-slate-600">{p.company}</td>
                          <td className="py-2 px-2 text-slate-600">
                            <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-xs text-[9px] uppercase font-bold">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right text-slate-600 font-mono">
                            {storeSettings.currency} {p.purchasePrice.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right text-slate-800 font-bold font-mono">
                            {storeSettings.currency} {p.retailPrice.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                profit > 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : profit < 0
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {profit > 0 ? '+' : ''}{marginPct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center text-emerald-700 font-bold font-mono bg-emerald-50/30">
                            {p.stock}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Click "Confirm" to write changes locally.</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportPreviewList(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 font-bold transition-all rounded-xs cursor-pointer"
                >
                  Cancel & Reject
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 font-bold flex items-center gap-1.5 transition-all shadow-md rounded-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Save Products</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Fast Entry Modal */}
      {showBulkModal && (
        <BulkProductEntryModal
          existingProducts={products}
          storeSettings={storeSettings}
          onSaveAll={(newProds) => {
            addMultipleProducts(newProds);
          }}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {/* Bulk Product & Price Editor Modal */}
      {showBulkEditorModal && (
        <BulkProductEditorModal
          isOpen={showBulkEditorModal}
          onClose={() => setShowBulkEditorModal(false)}
          selectedProducts={selectedProductsList}
          onApplyChanges={(updated) => {
            bulkUpdateProducts(updated);
            setSelectedIds(new Set());
          }}
        />
      )}
    </div>
  );
};
