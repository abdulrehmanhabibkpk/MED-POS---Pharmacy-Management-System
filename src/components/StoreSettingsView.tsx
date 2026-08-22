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
  Users,
  ShieldAlert,
  Mail,
  Lock,
  User,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ThermalPaperSize, Supplier, UserRole, UserAccount } from '../types';
import { posSound } from '../utils/audio';
import { ThermalReceiptDesigner } from './ThermalReceiptDesigner';

type SettingsSubTab = 'profile' | 'designer' | 'categories' | 'brands' | 'suppliers' | 'printer' | 'backup' | 'accounts';

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
    userAccounts,
    addUserAccount,
    updateUserAccount,
    deleteUserAccount,
    currentUser,
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

  // Employee Accounts Management State
  const [accName, setAccName] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accRole, setAccRole] = useState<UserRole>('Cashier');
  
  // New Account Permissions state
  const [canDashboard, setCanDashboard] = useState(true);
  const [canSale, setCanSale] = useState(true);
  const [canReturn, setCanReturn] = useState(true);
  const [canBillHistory, setCanBillHistory] = useState(true);
  const [canCreditReceive, setCanCreditReceive] = useState(false);
  const [canPurchaseStock, setCanPurchaseStock] = useState(false);
  const [canProducts, setCanProducts] = useState(false);
  const [canSuppliers, setCanSuppliers] = useState(false);
  const [canCustomers, setCanCustomers] = useState(false);
  const [canBarcodeLabel, setCanBarcodeLabel] = useState(true);
  const [canDayClosing, setCanDayClosing] = useState(false);
  const [canExpenses, setCanExpenses] = useState(false);
  const [canReports, setCanReports] = useState(false);
  const [canSettings, setCanSettings] = useState(false);
  const [canPlanPRD, setCanPlanPRD] = useState(true);

  // Edit Account state
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [editAccName, setEditAccName] = useState('');
  const [editAccEmail, setEditAccEmail] = useState('');
  const [editAccPassword, setEditAccPassword] = useState('');
  const [editAccRole, setEditAccRole] = useState<UserRole>('Cashier');
  
  // Edit Permissions state
  const [editCanDashboard, setEditCanDashboard] = useState(true);
  const [editCanSale, setEditCanSale] = useState(true);
  const [editCanReturn, setEditCanReturn] = useState(true);
  const [editCanBillHistory, setEditCanBillHistory] = useState(true);
  const [editCanCreditReceive, setEditCanCreditReceive] = useState(false);
  const [editCanPurchaseStock, setEditCanPurchaseStock] = useState(false);
  const [editCanProducts, setEditCanProducts] = useState(false);
  const [editCanSuppliers, setEditCanSuppliers] = useState(false);
  const [editCanCustomers, setEditCanCustomers] = useState(false);
  const [editCanBarcodeLabel, setEditCanBarcodeLabel] = useState(true);
  const [editCanDayClosing, setEditCanDayClosing] = useState(false);
  const [editCanExpenses, setEditCanExpenses] = useState(false);
  const [editCanReports, setEditCanReports] = useState(false);
  const [editCanSettings, setEditCanSettings] = useState(false);
  const [editCanPlanPRD, setEditCanPlanPRD] = useState(true);

  const handleRoleChange = (selectedRole: UserRole) => {
    setAccRole(selectedRole);
    if (selectedRole === 'Admin') {
      setCanDashboard(true);
      setCanSale(true);
      setCanReturn(true);
      setCanBillHistory(true);
      setCanCreditReceive(true);
      setCanPurchaseStock(true);
      setCanProducts(true);
      setCanSuppliers(true);
      setCanCustomers(true);
      setCanBarcodeLabel(true);
      setCanDayClosing(true);
      setCanExpenses(true);
      setCanReports(true);
      setCanSettings(true);
      setCanPlanPRD(true);
    } else if (selectedRole === 'Manager') {
      setCanDashboard(true);
      setCanSale(true);
      setCanReturn(true);
      setCanBillHistory(true);
      setCanCreditReceive(true);
      setCanPurchaseStock(true);
      setCanProducts(true);
      setCanSuppliers(true);
      setCanCustomers(true);
      setCanBarcodeLabel(true);
      setCanDayClosing(true);
      setCanExpenses(true);
      setCanReports(true);
      setCanSettings(false);
      setCanPlanPRD(false);
    } else {
      setCanDashboard(true);
      setCanSale(true);
      setCanReturn(true);
      setCanBillHistory(true);
      setCanCreditReceive(false);
      setCanPurchaseStock(false);
      setCanProducts(false);
      setCanSuppliers(false);
      setCanCustomers(false);
      setCanBarcodeLabel(true);
      setCanDayClosing(false);
      setCanExpenses(false);
      setCanReports(false);
      setCanSettings(false);
      setCanPlanPRD(true);
    }
  };

  const handleEditRoleChange = (selectedRole: UserRole) => {
    setEditAccRole(selectedRole);
    if (selectedRole === 'Admin') {
      setEditCanDashboard(true);
      setEditCanSale(true);
      setEditCanReturn(true);
      setEditCanBillHistory(true);
      setEditCanCreditReceive(true);
      setEditCanPurchaseStock(true);
      setEditCanProducts(true);
      setEditCanSuppliers(true);
      setEditCanCustomers(true);
      setEditCanBarcodeLabel(true);
      setEditCanDayClosing(true);
      setEditCanExpenses(true);
      setEditCanReports(true);
      setEditCanSettings(true);
      setEditCanPlanPRD(true);
    } else if (selectedRole === 'Manager') {
      setEditCanDashboard(true);
      setEditCanSale(true);
      setEditCanReturn(true);
      setEditCanBillHistory(true);
      setEditCanCreditReceive(true);
      setEditCanPurchaseStock(true);
      setEditCanProducts(true);
      setEditCanSuppliers(true);
      setEditCanCustomers(true);
      setEditCanBarcodeLabel(true);
      setEditCanDayClosing(true);
      setEditCanExpenses(true);
      setEditCanReports(true);
      setEditCanSettings(false);
      setEditCanPlanPRD(false);
    } else {
      setEditCanDashboard(true);
      setEditCanSale(true);
      setEditCanReturn(true);
      setEditCanBillHistory(true);
      setEditCanCreditReceive(false);
      setEditCanPurchaseStock(false);
      setEditCanProducts(false);
      setEditCanSuppliers(false);
      setEditCanCustomers(false);
      setEditCanBarcodeLabel(true);
      setEditCanDayClosing(false);
      setEditCanExpenses(false);
      setEditCanReports(false);
      setEditCanSettings(false);
      setEditCanPlanPRD(true);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim() || !accEmail.trim() || !accPassword.trim()) {
      alert('All fields are required!');
      return;
    }

    const emailLower = accEmail.trim().toLowerCase();
    const emailExists = userAccounts.some((acc) => acc.email.toLowerCase() === emailLower);
    if (emailExists) {
      alert('This email is already in use by another account.');
      return;
    }

    addUserAccount({
      name: accName.trim(),
      email: emailLower,
      password: accPassword,
      role: accRole,
      permissions: {
        canDashboard,
        canSale,
        canReturn,
        canBillHistory,
        canCreditReceive,
        canPurchaseStock,
        canProducts,
        canSuppliers,
        canCustomers,
        canBarcodeLabel,
        canDayClosing,
        canExpenses,
        canReports,
        canSettings,
        canPlanPRD,
      },
    });

    showFeedback(`Account "${accName}" registered successfully!`);
    
    // Reset
    setAccName('');
    setAccEmail('');
    setAccPassword('');
    setAccRole('Cashier');
  };

  const handleStartEditAccount = (acc: UserAccount) => {
    setEditingAccount(acc);
    setEditAccName(acc.name);
    setEditAccEmail(acc.email);
    setEditAccPassword(acc.password || '');
    setEditAccRole(acc.role);
    setEditCanDashboard(acc.permissions.canDashboard ?? true);
    setEditCanSale(acc.permissions.canSale);
    setEditCanReturn(acc.permissions.canReturn);
    setEditCanBillHistory(acc.permissions.canBillHistory ?? true);
    setEditCanCreditReceive(acc.permissions.canCreditReceive ?? true);
    setEditCanPurchaseStock(acc.permissions.canPurchaseStock ?? true);
    setEditCanProducts(acc.permissions.canProducts ?? true);
    setEditCanSuppliers(acc.permissions.canSuppliers ?? true);
    setEditCanCustomers(acc.permissions.canCustomers ?? true);
    setEditCanBarcodeLabel(acc.permissions.canBarcodeLabel ?? true);
    setEditCanDayClosing(acc.permissions.canDayClosing ?? true);
    setEditCanExpenses(acc.permissions.canExpenses);
    setEditCanReports(acc.permissions.canReports);
    setEditCanSettings(acc.permissions.canSettings);
    setEditCanPlanPRD(acc.permissions.canPlanPRD ?? true);
  };

  const handleSaveEditAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!editAccName.trim() || !editAccEmail.trim() || !editAccPassword.trim()) {
      alert('All fields are required!');
      return;
    }

    const emailLower = editAccEmail.trim().toLowerCase();
    const emailExists = userAccounts.some(
      (acc) => acc.id !== editingAccount.id && acc.email.toLowerCase() === emailLower
    );
    if (emailExists) {
      alert('This email is already in use!');
      return;
    }

    updateUserAccount({
      id: editingAccount.id,
      name: editAccName.trim(),
      email: emailLower,
      password: editAccPassword,
      role: editAccRole,
      permissions: {
        canDashboard: editCanDashboard,
        canSale: editCanSale,
        canReturn: editCanReturn,
        canBillHistory: editCanBillHistory,
        canCreditReceive: editCanCreditReceive,
        canPurchaseStock: editCanPurchaseStock,
        canProducts: editCanProducts,
        canSuppliers: editCanSuppliers,
        canCustomers: editCanCustomers,
        canBarcodeLabel: editCanBarcodeLabel,
        canDayClosing: editCanDayClosing,
        canExpenses: editCanExpenses,
        canReports: editCanReports,
        canSettings: editCanSettings,
        canPlanPRD: editCanPlanPRD,
      },
    });

    showFeedback('Employee account updated successfully!');
    setEditingAccount(null);
  };

  const handleDeleteAccount = (acc: UserAccount) => {
    if (acc.id === currentUser?.id) {
      alert('Security Alert: You cannot delete your own active session account.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete employee account "${acc.name}"?`)) {
      deleteUserAccount(acc.id);
      showFeedback('Employee account deleted successfully.');
    }
  };

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
    <div id="store-settings-container" className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Alert notifications */}
      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl shadow-sm flex items-center justify-between no-print animate-in fade-in duration-150">
          <span>🎉 {savedMsg}</span>
          <button onClick={() => setSavedMsg('')} className="text-emerald-500 hover:text-emerald-800 font-bold">&times;</button>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Software & Store Master Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Manage store business profile details, customize printed thermal bills, configure categories/brands, and manage cloud/offline backups.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN SETTINGS NAVIGATION TABS */}
      <div className="bg-white border border-slate-200/80 p-2 rounded-3xl shadow-xs flex flex-wrap items-center gap-1.5 no-print">
        {/* Profile Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Business Profile</span>
        </button>

        {/* Categories Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'categories'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Category Master ({categories.length})</span>
        </button>

        {/* Brands Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('brands')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'brands'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Brand Master ({brands.length})</span>
        </button>

        {/* Suppliers Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'suppliers'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Supplier Master ({suppliers.length})</span>
        </button>

        {/* Thermal Receipt Designer Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('designer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'designer'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Thermal Receipt Designer</span>
        </button>

        {/* Hardware & Beep Feedback Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('printer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'printer'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Hardware & Beep</span>
        </button>

        {/* Database Backup Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'backup'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup & Restore</span>
        </button>

        {/* Employee Accounts Tab */}
        <button
          type="button"
          onClick={() => setActiveSubTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'accounts'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Employee Accounts ({userAccounts.length})</span>
        </button>
      </div>

      {/* SUB-TABS INTERACTIVE SECTIONS */}

      {/* ========================================== */}
      {/* 1. BUSINESS PROFILE SETTINGS TAB */}
      {/* ========================================== */}
      {activeSubTab === 'profile' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden p-6 max-w-5xl">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Text fields form inputs */}
              <div className="lg:col-span-7 space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                    Store / Pharmacy Name *
                  </label>
                  <input
                    id="settings-store-name"
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. HACKTES MEDICAL STORE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                    Slogan / Tagline / Brand Subtitle
                  </label>
                  <input
                    id="settings-tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Modern Point of Sale & Medicine Tracker"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Helpline Contacts / Phone No
                    </label>
                    <input
                      id="settings-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0319-5702823"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 font-bold font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Default Sales Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="e.g. Rs."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 font-black focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                    Outlet Business Location Address
                  </label>
                  <input
                    id="settings-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Main Market, Pakistan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Standard Bill Roll width
                    </label>
                    <select
                      value={defaultPaperSize}
                      onChange={(e) => setDefaultPaperSize(e.target.value as ThermalPaperSize)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    >
                      <option value="80mm">80mm Thermal Receipt (Standard Desktop Printer)</option>
                      <option value="58mm">58mm Thermal Receipt (Mobile / Handheld Bluetooth)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Receipt Bottom Memo Footer Note
                    </label>
                    <input
                      type="text"
                      value={footerNote}
                      onChange={(e) => setFooterNote(e.target.value)}
                      placeholder="e.g. THANK YOU! PLEASE VISIT AGAIN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Store logo image base64 management */}
              <div className="lg:col-span-5 bg-slate-50/50 border border-slate-200 p-6 rounded-3xl flex flex-col justify-start items-center">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">
                  Printed Store Logo Header
                </h4>

                <div className="w-48 h-36 border border-dashed border-slate-300 rounded-2xl bg-white flex items-center justify-center overflow-hidden relative group shadow-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Store Logo Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-100"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-extrabold px-4 py-2 rounded-2xl text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-100"
              >
                <Save className="w-4.5 h-4.5" />
                <span>Save Settings Configuration</span>
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Product Categories Management</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Add, rename, or delete categories. Modifying a category updates all assigned products instantly.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Enter new category name..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Categories Grid Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 w-12 font-black">#</th>
                  <th className="py-3 px-4 font-black">Category Name</th>
                  <th className="py-3 px-4 text-center w-32 font-black">Product Count</th>
                  <th className="py-3 px-4 text-right w-44 font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories
                  .filter((c) => c.toLowerCase().includes(catSearch.toLowerCase().trim()))
                  .map((cat, idx) => {
                    const count = products.filter((p) => p.category === cat).length;
                    const isEditing = editingCat?.oldName === cat;

                    return (
                      <tr key={cat} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingCat.newName}
                                onChange={(e) => setEditingCat({ ...editingCat, newName: e.target.value })}
                                className="bg-white border border-blue-600 rounded-xl px-3 py-1 text-xs text-slate-900 font-bold focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={handleSaveEditCategory}
                                className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCat(null)}
                                className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-black text-slate-900">{cat}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono">
                            {count} Items
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingCat({ oldName: cat, newName: cat })}
                              className="text-slate-600 hover:text-blue-600 hover:bg-slate-100 font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                              title="Rename Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCat(cat)}
                              className="text-slate-600 hover:text-rose-600 hover:bg-slate-100 font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Brand & Manufacturer Company Management</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Add new pharmaceutical companies, manufacturers, or brands. Enables quick auto-complete during stock intake and sales.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands/companies..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Add Brand Form */}
          <form onSubmit={handleAddBrand} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newBrandInput}
              onChange={(e) => setNewBrandInput(e.target.value)}
              placeholder="Enter new brand name..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Brands Grid Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 w-12 font-black">#</th>
                  <th className="py-3 px-4 font-black">Brand / Company Name</th>
                  <th className="py-3 px-4 text-center w-32 font-black">Product Count</th>
                  <th className="py-3 px-4 text-right w-44 font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands
                  .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase().trim()))
                  .map((brand, idx) => {
                    const count = products.filter((p) => p.company === brand).length;
                    const isEditing = editingBrand?.oldName === brand;

                    return (
                      <tr key={brand} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingBrand.newName}
                                onChange={(e) => setEditingBrand({ ...editingBrand, newName: e.target.value })}
                                className="bg-white border border-blue-600 rounded-xl px-3 py-1 text-xs text-slate-900 font-bold focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={handleSaveEditBrand}
                                className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBrand(null)}
                                className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-black text-slate-900">{brand}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono">
                            {count} Items
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingBrand({ oldName: brand, newName: brand })}
                              className="text-slate-600 hover:text-blue-600 hover:bg-slate-100 font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                              title="Rename Brand"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBrand(brand)}
                              className="text-slate-600 hover:text-rose-600 hover:bg-slate-100 font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Suppliers & Distributors Master</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Manage medicine distributors and wholesale suppliers, credit balances, and contacts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Search supplier..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={openAddSupplier}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-100 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add</span>
              </button>
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-black">Supplier / Agency Name</th>
                  <th className="py-3 px-4 font-black">Representing Company</th>
                  <th className="py-3 px-4 font-black">Phone</th>
                  <th className="py-3 px-4 font-black">Address</th>
                  <th className="py-3 px-4 text-right font-black">Balance Owed ({storeSettings.currency})</th>
                  <th className="py-3 px-4 text-center font-black">Actions</th>
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
                    <tr key={sup.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900">{sup.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{sup.company}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{sup.phone}</td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{sup.address}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={sup.balanceOwed > 0 ? 'text-amber-600' : 'text-emerald-700'}>
                          {sup.balanceOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditSupplier(sup)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSup(sup.id, sup.name)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white border border-slate-100 shadow-2xl w-full max-w-lg rounded-3xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    {editingSupplier ? '✏️ Edit Supplier Details' : '➕ Add New Supplier / Distributor'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(false)}
                    className="text-slate-400 hover:text-slate-950 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveSupplier} className="p-6 space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Supplier / Distributor Name *</label>
                    <input
                      type="text"
                      value={supName}
                      onChange={(e) => setSupName(e.target.value)}
                      placeholder="e.g. Al-Madina Medicine Agency"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Brand / Company Represented</label>
                    <input
                      type="text"
                      value={supCompany}
                      onChange={(e) => setSupCompany(e.target.value)}
                      placeholder="e.g. GSK, Abbott, Getz Pharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={supPhone}
                        onChange={(e) => setSupPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Email</label>
                      <input
                        type="email"
                        value={supEmail}
                        onChange={(e) => setSupEmail(e.target.value)}
                        placeholder="supplier@pharma.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Address / Medicine Market</label>
                    <input
                      type="text"
                      value={supAddress}
                      onChange={(e) => setSupAddress(e.target.value)}
                      placeholder="Shop 12, Medicine Market, Lahore"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">
                      Opening Balance Owed ({storeSettings.currency})
                    </label>
                    <input
                      type="number"
                      value={supBalance}
                      onChange={(e) => setSupBalance(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSupplierModal(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs max-w-5xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">Thermal Receipt Printer & Hardware Configuration</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Configure receipt formats, standard paper widths, and barcode scanner audio feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
            {/* Paper Size Setting */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
              <h4 className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                <Printer className="w-5 h-5 text-blue-600" />
                <span>Default Thermal Paper Roll Size</span>
              </h4>

              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${
                    defaultPaperSize === '80mm'
                      ? 'bg-blue-50/50 border-blue-500 font-bold text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="text-xs font-black">80mm (3-Inch) Standard POS Slip</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                      Full columns for item name, batch, qty, rate, discount, and subtotal. Recommended for fast retail pharmacies.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${
                    defaultPaperSize === '58mm'
                      ? 'bg-blue-50/50 border-blue-500 font-bold text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="text-xs font-black">58mm (2-Inch) Compact Thermal Slip</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                      Streamlined layout optimized for mobile Bluetooth & small counter printers.
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('designer')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-100 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Launch Visual Thermal Receipt Designer</span>
                </button>
              </div>
            </div>

            {/* Audio Feedback Test */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
              <h4 className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <span>Barcode Scanner Audio & Sound FX</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Audible confirmation on product scans, cash receipts, and error notifications.
              </p>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => posSound.playScanBeep()}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Test Standard Scanner Beep</span>
                  <span className="text-[10px] text-blue-600 uppercase tracking-wider">Play ▶</span>
                </button>

                <button
                  type="button"
                  onClick={() => posSound.playSuccessChime()}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Test Sale Success Chime</span>
                  <span className="text-[10px] text-emerald-600 uppercase tracking-wider">Play ▶</span>
                </button>

                <button
                  type="button"
                  onClick={() => posSound.playErrorBeep()}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Test Error Warning Tone</span>
                  <span className="text-[10px] text-rose-600 uppercase tracking-wider">Play ▶</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. DATABASE & BACKUP */}
      {activeSubTab === 'backup' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs max-w-5xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">Database Backup, Export & System Maintenance</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Download complete local JSON database backups or restore previous records securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
              <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Download className="w-5 h-5 text-blue-600" />
                <span>Export Complete POS Database</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Exports all products, sales invoices, stock intake records, suppliers, customer khata ledgers, and settings in a single JSON file.
              </p>
              <button
                type="button"
                onClick={exportDatabase}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-100 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup (.JSON)</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
              <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Restore Database From Backup</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-100 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Restore Backup (.JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 7. EMPLOYEE ACCOUNTS MANAGEMENT */}
      {activeSubTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl">
          
          {/* Left Column: Registered Employees list */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Registered Employee Accounts ({userAccounts.length})</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage logins and system permissions for cashiers and store managers.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto space-y-3">
              {userAccounts.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-medium text-xs">
                  No separate employee accounts created. Please use the form to register cashiers.
                </div>
              ) : (
                userAccounts.map((acc) => {
                  const isCurrent = acc.id === currentUser?.id;
                  return (
                    <div key={acc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          acc.role === 'Admin' ? 'bg-red-100 text-red-700' : acc.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{acc.name}</span>
                            {isCurrent && (
                              <span className="bg-blue-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.1 rounded uppercase">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex flex-wrap gap-1 items-center">
                            <Mail className="w-3 h-3 text-slate-400 inline" />
                            <span>{acc.email}</span>
                            <span>•</span>
                            <Lock className="w-3 h-3 text-slate-400 inline" />
                            <span>{acc.password ? '*'.repeat(acc.password.length) : '••••'}</span>
                            <span>•</span>
                            <span className={`font-bold uppercase tracking-wider text-[9px] px-1.5 rounded-xs ${
                              acc.role === 'Admin' ? 'bg-red-50 text-red-700 border border-red-200' : acc.role === 'Manager' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                              {acc.role}
                            </span>
                          </div>

                          {/* Permission Badges */}
                          <div className="flex flex-wrap gap-1 mt-2 max-w-md">
                            {acc.permissions.canDashboard && <span className="bg-slate-50 border border-slate-200 text-slate-700 text-[9px] font-bold px-1 py-0.2 rounded">Dashboard</span>}
                            {acc.permissions.canSale && <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold px-1 py-0.2 rounded">Sales</span>}
                            {acc.permissions.canReturn && <span className="bg-red-50 border border-red-200 text-red-800 text-[9px] font-bold px-1 py-0.2 rounded">Returns</span>}
                            {acc.permissions.canBillHistory && <span className="bg-teal-50 border border-teal-200 text-teal-800 text-[9px] font-bold px-1 py-0.2 rounded">History</span>}
                            {acc.permissions.canCreditReceive && <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[9px] font-bold px-1 py-0.2 rounded">Khata</span>}
                            {acc.permissions.canProducts && <span className="bg-violet-50 border border-violet-200 text-violet-800 text-[9px] font-bold px-1 py-0.2 rounded">Inventory</span>}
                            {acc.permissions.canCustomers && <span className="bg-sky-50 border border-sky-200 text-sky-800 text-[9px] font-bold px-1 py-0.2 rounded">Customers</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleStartEditAccount(acc)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-bold"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => handleDeleteAccount(acc)}
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-bold"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Creation/Edit form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            {editingAccount ? (
              <form onSubmit={handleSaveEditAccount} className="space-y-4 text-xs font-semibold">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center bg-amber-50/50 p-3 rounded-2xl">
                  <span className="font-black text-amber-900 uppercase">Edit Credentials: {editingAccount.name}</span>
                  <button type="button" onClick={() => setEditingAccount(null)} className="text-amber-800 font-bold hover:underline">Cancel</button>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Employee Full Name</label>
                  <input
                    type="text"
                    value={editAccName}
                    onChange={(e) => setEditAccName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Email / Username</label>
                  <input
                    type="email"
                    value={editAccEmail}
                    onChange={(e) => setEditAccEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Password</label>
                  <input
                    type="text"
                    value={editAccPassword}
                    onChange={(e) => setEditAccPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Role Type</label>
                  <select
                    value={editAccRole}
                    onChange={(e) => handleEditRoleChange(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Manager">Manager (Intermediate Access)</option>
                    <option value="Cashier">Cashier (Sales Register Only)</option>
                  </select>
                </div>

                {/* Granular Permissions */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">CUSTOMIZE ACCESS PERMISSIONS</span>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={editCanDashboard} onChange={(e) => setEditCanDashboard(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Dashboard</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={editCanSale} onChange={(e) => setEditCanSale(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Sales</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={editCanReturn} onChange={(e) => setEditCanReturn(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Returns</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={editCanBillHistory} onChange={(e) => setEditCanBillHistory(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">History</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={editCanProducts} onChange={(e) => setEditCanProducts(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Inventory</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={editCanCustomers} onChange={(e) => setEditCanCustomers(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Customers</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#3F83F8] hover:bg-[#2563EB] text-white font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Update Account Configuration</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-4 text-xs font-semibold">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-black text-slate-800 uppercase">Register New Employee</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Register login credentials and specify system permissions.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Employee Full Name</label>
                  <input
                    type="text"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="e.g. Aslam Khan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Login Email Address</label>
                  <input
                    type="email"
                    value={accEmail}
                    onChange={(e) => setAccEmail(e.target.value)}
                    placeholder="e.g. cashier@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Set Password</label>
                  <input
                    type="text"
                    value={accPassword}
                    onChange={(e) => setAccPassword(e.target.value)}
                    placeholder="Set temporary password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Select Role</label>
                  <select
                    value={accRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Manager">Manager (Intermediate Access)</option>
                    <option value="Cashier">Cashier (Sales Register Only)</option>
                  </select>
                </div>

                {/* Granular Permissions */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">CUSTOMIZE ACCESS PERMISSIONS</span>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={canDashboard} onChange={(e) => setCanDashboard(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Dashboard</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={canSale} onChange={(e) => setCanSale(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Sales</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={canReturn} onChange={(e) => setCanReturn(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Returns</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={canBillHistory} onChange={(e) => setCanBillHistory(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">History</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={canProducts} onChange={(e) => setCanProducts(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Inventory</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={canCustomers} onChange={(e) => setCanCustomers(e.target.checked)} className="rounded text-blue-600 h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold text-slate-700">Customers</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-100">
                  <Plus className="w-4 h-4" />
                  <span>Register Employee</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
