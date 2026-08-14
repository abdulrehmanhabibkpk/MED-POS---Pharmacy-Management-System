import React, { useState } from 'react';
import { Plus, RefreshCw, Edit2, Trash2, Search, Tag, X, Check, ScanLine } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { useHardwareScanner } from '../hooks/useHardwareScanner';
import { posSound } from '../utils/audio';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, storeSettings } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Form State
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('Pharmacy');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(10);

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

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        barcode: barcode.trim(),
        name: name.trim(),
        company: company.trim() || 'General',
        category: category.trim() || 'General',
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
        company: company.trim() || 'General',
        category: category.trim() || 'General',
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

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      p.barcode.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div id="products-management-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-4">
      {/* Top Filter & Action Bar matching Image 8 */}
      <div className="bg-white border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <label className="text-xs font-bold text-slate-700 shrink-0">Search:</label>
          <input
            id="product-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, barcode, company..."
            className="w-full max-w-md bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-add-new-product"
            onClick={openAddModal}
            type="button"
            className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-1.5 px-4 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </button>

          <button
            onClick={() => setSearchTerm('')}
            type="button"
            className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-1.5 px-4 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Products Table matching Image 8 */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Barcode</th>
                <th className="py-2.5 px-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Company</th>
                <th className="py-2.5 px-3 font-semibold text-right">Purchase</th>
                <th className="py-2.5 px-3 font-semibold text-right">Retail</th>
                <th className="py-2.5 px-3 font-semibold text-right">Wholesale</th>
                <th className="py-2.5 px-3 font-semibold text-center">Stock</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      idx === 0
                        ? 'bg-[#0078d7] text-white font-medium hover:bg-[#006bbd]'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono">{p.barcode}</td>
                    <td className="py-2.5 px-3 font-semibold">{p.name}</td>
                    <td className="py-2.5 px-3">{p.company}</td>
                    <td className="py-2.5 px-3 text-right">
                      {storeSettings.currency}{' '}
                      {p.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {storeSettings.currency}{' '}
                      {p.retailPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {storeSettings.currency}{' '}
                      {p.wholesalePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          p.stock <= p.minStockAlert
                            ? idx === 0
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
                            idx === 0 ? 'text-white' : 'text-[#0070ba]'
                          }`}
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className={`p-1 hover:scale-110 transition-transform ${
                            idx === 0 ? 'text-rose-200' : 'text-red-500'
                          }`}
                          title="Delete Product"
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
    </div>
  );
};
