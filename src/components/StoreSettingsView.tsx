import React, { useState, useRef } from 'react';
import {
  Settings,
  Save,
  Upload,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Printer,
  Tag,
  Building2,
  Truck,
  Plus,
  Edit2,
  Check,
  X,
  Volume2,
  Database,
  Download,
  Layers,
  Search,
  Sparkles,
  Layout,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ThermalPaperSize, Supplier } from '../types';
import { posSound } from '../utils/audio';
import { ThermalReceiptDesigner } from './ThermalReceiptDesigner';

type SettingsSubTab = 'profile' | 'designer' | 'categories' | 'brands' | 'suppliers' | 'printer' | 'backup';

export const StoreSettingsView: React.FC = () => {
  const {
    storeSettings,
    updateStoreSettings,
    resetToDefaults,
    thermalPaperSize,
    setThermalPaperSize,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    products,
    exportDatabase,
    importDatabase,
  } = usePOS();

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('profile');

  // Store Profile Form State
  const [storeName, setStoreName] = useState(storeSettings.storeName);
  const [tagline, setTagline] = useState(storeSettings.tagline);
  const [address, setAddress] = useState(storeSettings.address);
  const [phone, setPhone] = useState(storeSettings.phone);
  const [currency, setCurrency] = useState(storeSettings.currency || 'Rs.');
  const [logoUrl, setLogoUrl] = useState(storeSettings.logoUrl);
  const [footerNote, setFooterNote] = useState(storeSettings.footerNote);
  const [defaultPaperSize, setDefaultPaperSize] = useState<ThermalPaperSize>(
    storeSettings.defaultPaperSize || thermalPaperSize || '80mm'
  );

  const [savedMsg, setSavedMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  // Category Manager State
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCat, setEditingCat] = useState<{ oldName: string; newName: string } | null>(null);
  const [catSearch, setCatSearch] = useState('');

  // Brand Manager State
  const [newBrandInput, setNewBrandInput] = useState('');
  const [editingBrand, setEditingBrand] = useState<{ oldName: string; newName: string } | null>(null);
  const [brandSearch, setBrandSearch] = useState('');

  // Supplier Manager State
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supBalance, setSupBalance] = useState<number>(0);

  const showFeedback = (msg: string) => {
    setSavedMsg(msg);
    posSound.playSuccessChime();
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      alert('Store / Business Name is required');
      return;
    }

    updateStoreSettings({
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      currency: currency.trim() || 'Rs.',
      logoUrl,
      footerNote,
      defaultPaperSize,
    });
    setThermalPaperSize(defaultPaperSize);
    showFeedback('Store business profile & settings updated successfully!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setLogoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Category Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    addCategory(newCatInput.trim());
    setNewCatInput('');
    showFeedback(`Category "${newCatInput.trim()}" added successfully!`);
  };

  const handleSaveEditCategory = () => {
    if (!editingCat || !editingCat.newName.trim()) return;
    updateCategory(editingCat.oldName, editingCat.newName.trim());
    showFeedback(`Category renamed to "${editingCat.newName.trim()}"`);
    setEditingCat(null);
  };

  const handleDeleteCat = (name: string) => {
    const count = products.filter((p) => p.category === name).length;
    if (window.confirm(`Delete category "${name}"? (${count} products currently use this category)`)) {
      deleteCategory(name);
      showFeedback(`Category "${name}" removed`);
    }
  };

  // Brand Handlers
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandInput.trim()) return;
    addBrand(newBrandInput.trim());
    setNewBrandInput('');
    showFeedback(`Brand / Company "${newBrandInput.trim()}" added successfully!`);
  };

  const handleSaveEditBrand = () => {
    if (!editingBrand || !editingBrand.newName.trim()) return;
    updateBrand(editingBrand.oldName, editingBrand.newName.trim());
    showFeedback(`Brand renamed to "${editingBrand.newName.trim()}"`);
    setEditingBrand(null);
  };

  const handleDeleteBrand = (name: string) => {
    const count = products.filter((p) => p.company === name).length;
    if (window.confirm(`Delete brand "${name}"? (${count} products currently use this brand)`)) {
      deleteBrand(name);
      showFeedback(`Brand "${name}" removed`);
    }
  };

  // Supplier Handlers
  const openAddSupplier = () => {
    setEditingSupplier(null);
    setSupName('');
    setSupCompany('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setSupBalance(0);
    setShowSupplierModal(true);
  };

  const openEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupName(s.name);
    setSupCompany(s.company);
    setSupPhone(s.phone);
    setSupEmail(s.email);
    setSupAddress(s.address);
    setSupBalance(s.balanceOwed);
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) {
      alert('Supplier name is required');
      return;
    }

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        name: supName.trim(),
        company: supCompany.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        address: supAddress.trim(),
        balanceOwed: supBalance,
      });
      showFeedback(`Supplier "${supName.trim()}" updated successfully!`);
    } else {
      addSupplier({
        name: supName.trim(),
        company: supCompany.trim() || 'General',
        phone: supPhone.trim(),
        email: supEmail.trim(),
        address: supAddress.trim(),
        balanceOwed: supBalance,
      });
      showFeedback(`New Supplier "${supName.trim()}" added successfully!`);
    }

    setShowSupplierModal(false);
  };

  const handleDeleteSup = (id: string, name: string) => {
    if (window.confirm(`Delete supplier "${name}" from master database?`)) {
      deleteSupplier(id);
      showFeedback(`Supplier "${name}" deleted`);
    }
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = importDatabase(content);
        if (success) {
          showFeedback('Database successfully restored from JSON backup!');
        } else {
          alert('Invalid backup file structure.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div id="store-settings-container" className="p-6 bg-[#F9FAFB] min-h-full space-y-6">
      
      {/* Alert notifications */}
      {savedMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs font-bold rounded shadow-xs flex items-center justify-between no-print animate-in fade-in duration-150">
          <span>🎉 {savedMsg}</span>
          <button onClick={() => setSavedMsg('')} className="text-emerald-500 hover:text-emerald-800 font-bold">&times;</button>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-gray-200">
            <Settings className="w-6 h-6 text-[#002b49]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Software & Store Master Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage store business profile details, customize printed thermal bills, configure categories/brands, and manage cloud/offline backups.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN SETTINGS NAVIGATION TABS */}
      <div className="bg-white border border-gray-200 p-2 rounded-xl shadow-xs flex flex-wrap items-center gap-1.5 no-print">
        {/* Profile Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-[#002b49] text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-150'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Business Profile</span>
        </button>

        {/* Categories Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'categories'
              ? 'bg-[#002b49] text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-150'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Category Master ({categories.length})</span>
        </button>

        {/* Brands Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('brands')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'brands'
              ? 'bg-[#002b49] text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-150'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-orange-400" />
          <span>Brand Master ({brands.length})</span>
        </button>

        {/* Suppliers Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('suppliers')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'suppliers'
              ? 'bg-[#002b49] text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-150'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span>Supplier Master ({suppliers.length})</span>
        </button>

        {/* Thermal Receipt Designer Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('designer')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'designer'
              ? 'bg-[#002b49] text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-150'
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-purple-400" />
          <span>Thermal Receipt Designer</span>
        </button>

        {/* Hardware & Beep Feedback Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('printer')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'printer'
              ? 'bg-[#002b49] text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-150'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hardware & Beep Feedback</span>
        </button>

        {/* Database Backup Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'backup'
              ? 'bg-[#002b49] text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-150'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-rose-400" />
          <span>Database Backup & Restore</span>
        </button>
      </div>

      {/* SUB-TABS INTERACTIVE SECTIONS */}

      {/* ========================================== */}
      {/* 1. BUSINESS PROFILE SETTINGS TAB */}
      {/* ========================================== */}
      {activeSubTab === 'profile' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 max-w-5xl">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Text fields form inputs */}
              <div className="lg:col-span-7 space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1.5">
                    Store / Pharmacy Name *
                  </label>
                  <input
                    id="settings-store-name"
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. HACKTES MEDICAL STORE"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1.5">
                    Slogan / Tagline / Brand Subtitle
                  </label>
                  <input
                    id="settings-tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Modern Point of Sale & Medicine Tracker"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase mb-1.5">
                      Helpline Contacts / Phone No
                    </label>
                    <input
                      id="settings-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0319-5702823"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 font-bold font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase mb-1.5">
                      Default Sales Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="e.g. Rs."
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 font-black focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1.5">
                    Outlet Business Location Address
                  </label>
                  <input
                    id="settings-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Main Market, Pakistan"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase mb-1.5">
                      Standard Bill Roll width
                    </label>
                    <select
                      value={defaultPaperSize}
                      onChange={(e) => setDefaultPaperSize(e.target.value as ThermalPaperSize)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="80mm">80mm Thermal Receipt (Standard Desktop Printer)</option>
                      <option value="58mm">58mm Thermal Receipt (Mobile / Handheld Bluetooth)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase mb-1.5">
                      Receipt Bottom Memo Footer Note
                    </label>
                    <input
                      type="text"
                      value={footerNote}
                      onChange={(e) => setFooterNote(e.target.value)}
                      placeholder="e.g. THANK YOU! PLEASE VISIT AGAIN"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Store logo image base64 management */}
              <div className="lg:col-span-5 bg-gray-50 border border-gray-200 p-5 rounded-xl flex flex-col justify-start items-center">
                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-4">
                  Printed Store Logo Header
                </h4>

                <div className="w-48 h-36 border-2 border-dashed border-gray-300 rounded-xl bg-white flex items-center justify-center overflow-hidden relative group shadow-inner">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Store Logo Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center p-4 text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                      <span className="text-[10px] font-bold block">No Logo Selected</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 w-full max-w-[200px]">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                    id="logo-file-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#002b49] hover:bg-slate-900 text-white font-extrabold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="bg-gray-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-extrabold px-4 py-2 rounded-lg text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-150 flex justify-end">
              <button
                type="submit"
                className="bg-[#002b49] hover:bg-slate-900 text-white font-extrabold px-6 py-3 rounded-xl text-xs tracking-widest uppercase transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4.5 h-4.5" />
                <span>Save Configuration Parameters</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. THERMAL RECEIPT DESIGNER STUDIO */}
      {activeSubTab === 'designer' && (
        <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
          <ThermalReceiptDesigner />
        </div>
      )}

      {/* 3. CATEGORY MASTER MANAGER */}
      {activeSubTab === 'categories' && (
        <div className="bg-white border border-slate-200 p-6 shadow-xs max-w-5xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-black text-[#002b49] uppercase">Product Categories Management</h3>
              <p className="text-xs text-slate-500">
                Add, rename, or delete categories. Modifying a category updates all assigned products instantly.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-slate-50 border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Enter new category name (e.g. Tablets, Injections, Baby Food)..."
              className="flex-1 bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0070ba]"
            />
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </form>

          {/* Categories Grid Table */}
          <div className="border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-3">Category Name</th>
                  <th className="py-2.5 px-3 text-center w-32">Product Count</th>
                  <th className="py-2.5 px-3 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories
                  .filter((c) => c.toLowerCase().includes(catSearch.toLowerCase().trim()))
                  .map((cat, idx) => {
                    const count = products.filter((p) => p.category === cat).length;
                    const isEditing = editingCat?.oldName === cat;

                    return (
                      <tr key={cat} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingCat.newName}
                                onChange={(e) => setEditingCat({ ...editingCat, newName: e.target.value })}
                                className="bg-white border border-[#0070ba] px-2 py-1 text-xs text-slate-900 font-bold"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={handleSaveEditCategory}
                                className="p-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xs"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCat(null)}
                                className="p-1 bg-slate-300 text-slate-700 hover:bg-slate-400 rounded-xs"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span>{cat}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold font-mono">
                            {count} Items
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCat({ oldName: cat, newName: cat })}
                              className="text-[#0070ba] hover:underline flex items-center gap-1 p-1"
                              title="Rename Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCat(cat)}
                              className="text-rose-600 hover:underline flex items-center gap-1 p-1"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BRAND / COMPANY MASTER MANAGER */}
      {activeSubTab === 'brands' && (
        <div className="bg-white border border-slate-200 p-6 shadow-xs max-w-5xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-black text-[#002b49] uppercase">Brand & Manufacturer Company Management</h3>
              <p className="text-xs text-slate-500">
                Add new pharmaceutical companies, manufacturers, or brands. Enables quick auto-complete during stock intake and sales.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands/companies..."
                className="w-full bg-slate-50 border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Add Brand Form */}
          <form onSubmit={handleAddBrand} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newBrandInput}
              onChange={(e) => setNewBrandInput(e.target.value)}
              placeholder="Enter new brand name (e.g. GSK, Abbott, Getz, Pfizer)..."
              className="flex-1 bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0070ba]"
            />
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Brand</span>
            </button>
          </form>

          {/* Brands Grid Table */}
          <div className="border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-3">Brand / Company Name</th>
                  <th className="py-2.5 px-3 text-center w-32">Product Count</th>
                  <th className="py-2.5 px-3 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands
                  .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase().trim()))
                  .map((brand, idx) => {
                    const count = products.filter((p) => p.company === brand).length;
                    const isEditing = editingBrand?.oldName === brand;

                    return (
                      <tr key={brand} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingBrand.newName}
                                onChange={(e) => setEditingBrand({ ...editingBrand, newName: e.target.value })}
                                className="bg-white border border-[#0070ba] px-2 py-1 text-xs text-slate-900 font-bold"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={handleSaveEditBrand}
                                className="p-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xs"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBrand(null)}
                                className="p-1 bg-slate-300 text-slate-700 hover:bg-slate-400 rounded-xs"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span>{brand}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold font-mono">
                            {count} Items
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingBrand({ oldName: brand, newName: brand })}
                              className="text-[#0070ba] hover:underline flex items-center gap-1 p-1"
                              title="Rename Brand"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBrand(brand)}
                              className="text-rose-600 hover:underline flex items-center gap-1 p-1"
                              title="Delete Brand"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUPPLIER MASTER MANAGER */}
      {activeSubTab === 'suppliers' && (
        <div className="bg-white border border-slate-200 p-6 shadow-xs max-w-5xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-black text-[#002b49] uppercase">Suppliers & Distributors Master</h3>
              <p className="text-xs text-slate-500">
                Manage medicine distributors and wholesale suppliers, credit balances, and contacts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Search supplier..."
                  className="w-full bg-slate-50 border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={openAddSupplier}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Supplier</span>
              </button>
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3">Supplier / Agency Name</th>
                  <th className="py-2.5 px-3">Representing Company</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3 text-right">Balance Owed ({storeSettings.currency})</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                      s.company.toLowerCase().includes(supplierSearch.toLowerCase())
                  )
                  .map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sup.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{sup.company}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{sup.phone}</td>
                      <td className="py-2.5 px-3 text-slate-600">{sup.address}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span className={sup.balanceOwed > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                          {sup.balanceOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditSupplier(sup)}
                            className="p-1 text-[#0070ba] hover:underline"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSup(sup.id, sup.name)}
                            className="p-1 text-rose-600 hover:underline"
                            title="Delete Supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Supplier Modal */}
          {showSupplierModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                <div className="bg-[#002b49] text-white px-4 py-3 flex items-center justify-between">
                  <h4 className="font-bold text-xs">
                    {editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier / Distributor'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(false)}
                    className="text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveSupplier} className="p-5 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Supplier / Distributor Name *</label>
                    <input
                      type="text"
                      value={supName}
                      onChange={(e) => setSupName(e.target.value)}
                      placeholder="e.g. Al-Madina Medicine Agency"
                      required
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand / Company Represented</label>
                    <input
                      type="text"
                      value={supCompany}
                      onChange={(e) => setSupCompany(e.target.value)}
                      placeholder="e.g. GSK, Abbott, Getz Pharma"
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={supPhone}
                        onChange={(e) => setSupPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={supEmail}
                        onChange={(e) => setSupEmail(e.target.value)}
                        placeholder="supplier@pharma.com"
                        className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Address / Medicine Market</label>
                    <input
                      type="text"
                      value={supAddress}
                      onChange={(e) => setSupAddress(e.target.value)}
                      placeholder="Shop 12, Medicine Market, Lahore"
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Opening Balance Owed ({storeSettings.currency})
                    </label>
                    <input
                      type="number"
                      value={supBalance}
                      onChange={(e) => setSupBalance(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSupplierModal(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-1.5 text-xs font-bold"
                    >
                      Save Supplier
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. PRINTER & HARDWARE SETTINGS */}
      {activeSubTab === 'printer' && (
        <div className="bg-white border border-slate-200 p-6 shadow-xs max-w-5xl space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-[#002b49] uppercase">Thermal Receipt Printer & Hardware Configuration</h3>
            <p className="text-xs text-slate-500">
              Configure receipt formats, standard paper widths, and barcode scanner audio feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Paper Size Setting */}
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Printer className="w-4 h-4 text-[#0070ba]" />
                <span>Default Thermal Paper Roll Size</span>
              </h4>

              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                    defaultPaperSize === '80mm'
                      ? 'bg-blue-50 border-[#0070ba] font-bold text-[#002b49]'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultPaperPref"
                    checked={defaultPaperSize === '80mm'}
                    onChange={() => {
                      setDefaultPaperSize('80mm');
                      setThermalPaperSize('80mm');
                      updateStoreSettings({ ...storeSettings, defaultPaperSize: '80mm' });
                      showFeedback('Default paper size set to 80mm Standard');
                    }}
                    className="text-[#0070ba]"
                  />
                  <div>
                    <div className="text-xs font-bold">80mm (3-Inch) Standard POS Slip</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Full columns for item name, batch, qty, rate, discount, and subtotal. Recommended for fast retail pharmacies.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                    defaultPaperSize === '58mm'
                      ? 'bg-blue-50 border-[#0070ba] font-bold text-[#002b49]'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultPaperPref"
                    checked={defaultPaperSize === '58mm'}
                    onChange={() => {
                      setDefaultPaperSize('58mm');
                      setThermalPaperSize('58mm');
                      updateStoreSettings({ ...storeSettings, defaultPaperSize: '58mm' });
                      showFeedback('Default paper size set to 58mm Mini');
                    }}
                    className="text-[#0070ba]"
                  />
                  <div>
                    <div className="text-xs font-bold">58mm (2-Inch) Compact Thermal Slip</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Streamlined layout optimized for mobile Bluetooth & small counter printers.
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('designer')}
                  className="w-full bg-[#0070ba] hover:bg-[#005a96] text-white font-bold py-2 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Launch Visual Thermal Receipt Designer (Word / Photoshop Studio)</span>
                </button>
              </div>
            </div>

            {/* Audio Feedback Test */}
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Barcode Scanner Audio & Sound FX</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                Audible confirmation on product scans, cash receipts, and error notifications.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => posSound.playScanBeep()}
                  className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2 px-3 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span>Test Standard Scanner Beep</span>
                  <span className="text-[10px] text-blue-600">Play ▶</span>
                </button>

                <button
                  type="button"
                  onClick={() => posSound.playSuccessChime()}
                  className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2 px-3 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span>Test Sale Success Chime</span>
                  <span className="text-[10px] text-emerald-600">Play ▶</span>
                </button>

                <button
                  type="button"
                  onClick={() => posSound.playErrorBeep()}
                  className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2 px-3 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span>Test Error Warning Tone</span>
                  <span className="text-[10px] text-rose-600">Play ▶</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. DATABASE & BACKUP */}
      {activeSubTab === 'backup' && (
        <div className="bg-white border border-slate-200 p-6 shadow-xs max-w-5xl space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-[#002b49] uppercase">Database Backup, Export & System Maintenance</h3>
            <p className="text-xs text-slate-500">
              Download complete local JSON database backups or restore previous records securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Export Complete POS Database</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                Exports all products, sales invoices, stock intake records, suppliers, customer khata ledgers, and settings in a single JSON file.
              </p>
              <button
                type="button"
                onClick={exportDatabase}
                className="bg-[#002b49] hover:bg-[#001f35] text-white font-bold py-2 px-4 text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Database Backup (.JSON)</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Restore Database From Backup</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                Select a previously downloaded `.json` backup file to restore all your system records.
              </p>
              <input
                type="file"
                ref={jsonImportRef}
                accept=".json"
                onChange={handleJSONImport}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => jsonImportRef.current?.click()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Restore Backup (.JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
