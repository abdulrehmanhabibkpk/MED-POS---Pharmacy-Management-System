import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  UserPlus,
  Trash2,
  Edit,
  Lock,
  Mail,
  UserCheck,
  Check,
  X,
  User,
  Settings,
  DollarSign,
  Briefcase,
  Layers,
  Key,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { UserAccount, UserRole } from '../types';

export const MasterAdminView: React.FC = () => {
  const { userAccounts, addUserAccount, updateUserAccount, deleteUserAccount, currentUser, storeSettings } = usePOS();

  // New Account state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Cashier');
  
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
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Cashier');
  
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

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
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
    setEditRole(selectedRole);
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
    if (!name.trim() || !email.trim() || !password.trim()) {
      setNotification({ type: 'error', message: 'All fields are required!' });
      return;
    }

    const emailLower = email.trim().toLowerCase();
    const emailExists = userAccounts.some((acc) => acc.email.toLowerCase() === emailLower);
    if (emailExists) {
      setNotification({ type: 'error', message: 'This email is already in use by another account.' });
      return;
    }

    addUserAccount({
      name: name.trim(),
      email: emailLower,
      password: password,
      role: role,
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

    setNotification({ type: 'success', message: `Account "${name}" created successfully as ${role}.` });
    
    // Reset fields
    setName('');
    setEmail('');
    setPassword('');
    setRole('Cashier');
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
  };

  const handleStartEdit = (acc: UserAccount) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditEmail(acc.email);
    setEditPassword(acc.password || '');
    setEditRole(acc.role);
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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!editName.trim() || !editEmail.trim() || !editPassword.trim()) {
      setNotification({ type: 'error', message: 'All fields are required to update account!' });
      return;
    }

    const emailLower = editEmail.trim().toLowerCase();
    const emailExists = userAccounts.some(
      (acc) => acc.id !== editingAccount.id && acc.email.toLowerCase() === emailLower
    );
    if (emailExists) {
      setNotification({ type: 'error', message: 'This email is already taken!' });
      return;
    }

    updateUserAccount({
      id: editingAccount.id,
      name: editName.trim(),
      email: emailLower,
      password: editPassword,
      role: editRole,
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

    setNotification({ type: 'success', message: 'Account updated successfully!' });
    setEditingAccount(null);
  };

  const handleDeleteAccount = (acc: UserAccount) => {
    if (acc.id === 'acc-master') {
      alert('Security Alert: Master Admin Account cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${acc.name}'s account (${acc.role})?`)) {
      deleteUserAccount(acc.id);
      setNotification({ type: 'success', message: 'Account deleted successfully!' });
    }
  };

  return (
    <div className="p-3 md:p-6 bg-[#f4f7fa] min-h-full space-y-6 pb-24 md:pb-8">
      {/* Upper Brand Area */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase">Master Admin Panel</h1>
            <p className="text-xs text-slate-500">Manage admin credentials, employee accounts, and customize access permissions.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 p-2 px-3 rounded-lg text-blue-800 text-xs">
          <UserCheck className="w-4 h-4" />
          <span>Active Session: <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.role})</span>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-[10px] uppercase font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Accounts List (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="font-black text-xs md:text-sm text-[#002b49] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-[#0070ba]" />
              <span>Registered Accounts List ({userAccounts.length})</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded-full">
              LOCAL DATABASE
            </span>
          </div>

          <div className="p-3 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {userAccounts.map((acc) => {
              const isMaster = acc.id === 'acc-master';
              const isCurrent = acc.id === currentUser?.id;

              return (
                <div key={acc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex gap-3">
                    {/* User Avatar Badge based on Role */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      acc.role === 'Admin'
                        ? 'bg-red-100 text-red-700'
                        : acc.role === 'Manager'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{acc.name}</span>
                        {isMaster && (
                          <span className="bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.1 rounded uppercase">
                            MASTER
                          </span>
                        )}
                        {isCurrent && (
                          <span className="bg-blue-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.1 rounded uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex flex-wrap gap-1 items-center">
                        <Mail className="w-3 h-3 inline text-slate-400" />
                        <span>{acc.email}</span>
                        <span>•</span>
                        <Lock className="w-3 h-3 inline text-slate-400" />
                        <span className="text-slate-400 font-password">
                          {acc.password ? '*'.repeat(acc.password.length) : '••••'}
                        </span>
                        <span>•</span>
                        <span className={`font-bold uppercase tracking-wider text-[9px] px-1.5 rounded-xs ${
                          acc.role === 'Admin'
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : acc.role === 'Manager'
                            ? 'bg-purple-50 border border-purple-200 text-purple-700'
                            : 'bg-green-50 border border-green-200 text-green-700'
                        }`}>
                          {acc.role}
                        </span>
                      </div>

                      {/* Permissions Flags row */}
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-md">
                        {acc.permissions.canDashboard && (
                          <span className="bg-slate-50 border border-slate-200 text-slate-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Dashboard
                          </span>
                        )}
                        {acc.permissions.canSale && (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Sales
                          </span>
                        )}
                        {acc.permissions.canReturn && (
                          <span className="bg-red-50 border border-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Returns
                          </span>
                        )}
                        {acc.permissions.canBillHistory && (
                          <span className="bg-teal-50 border border-teal-100 text-teal-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Bill History
                          </span>
                        )}
                        {acc.permissions.canCreditReceive && (
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Khata
                          </span>
                        )}
                        {acc.permissions.canPurchaseStock && (
                          <span className="bg-cyan-50 border border-cyan-100 text-cyan-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Purchase
                          </span>
                        )}
                        {acc.permissions.canProducts && (
                          <span className="bg-violet-50 border border-violet-100 text-violet-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Products
                          </span>
                        )}
                        {acc.permissions.canSuppliers && (
                          <span className="bg-orange-50 border border-orange-100 text-orange-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Suppliers
                          </span>
                        )}
                        {acc.permissions.canCustomers && (
                          <span className="bg-sky-50 border border-sky-100 text-sky-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Customers
                          </span>
                        )}
                        {acc.permissions.canBarcodeLabel && (
                          <span className="bg-lime-50 border border-lime-100 text-lime-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Barcode Label
                          </span>
                        )}
                        {acc.permissions.canDayClosing && (
                          <span className="bg-pink-50 border border-pink-100 text-pink-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Day Closing
                          </span>
                        )}
                        {acc.permissions.canExpenses && (
                          <span className="bg-amber-50 border border-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Expenses
                          </span>
                        )}
                        {acc.permissions.canReports && (
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Reports
                          </span>
                        )}
                        {acc.permissions.canSettings && (
                          <span className="bg-slate-50 border border-slate-100 text-slate-800 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Settings
                          </span>
                        )}
                        {acc.permissions.canPlanPRD && (
                          <span className="bg-[#e0f7fa] border border-[#b2ebf2] text-[#006064] text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                            Roadmap
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(acc)}
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-bold"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {!isMaster && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Add/Edit Account panel (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {editingAccount ? (
            /* Editing State Form */
            <form onSubmit={handleSaveEdit}>
              <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                <span className="font-black text-xs md:text-sm text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit className="w-4.5 h-4.5" />
                  <span>Edit Credentials: {editingAccount.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="text-amber-800 text-xs font-bold hover:underline"
                >
                  Cancel
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Password / PIN:
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Role & Base Hierarchy:
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => handleEditRoleChange(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-300 px-2 py-2 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Manager">Manager (Intermediate Access)</option>
                    <option value="Cashier">Cashier (Sales Register Only)</option>
                  </select>
                </div>

                {/* Granular Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    CUSTOMIZE PERMISSIONS (Toggle Menu Items & Buttons)
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanDashboard}
                        onChange={(e) => setEditCanDashboard(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Dashboard Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanSale}
                        onChange={(e) => setEditCanSale(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Sale Invoice Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanReturn}
                        onChange={(e) => setEditCanReturn(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Sale Return Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanBillHistory}
                        onChange={(e) => setEditCanBillHistory(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Bill History Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanCreditReceive}
                        onChange={(e) => setEditCanCreditReceive(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Credit Receive Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanPurchaseStock}
                        onChange={(e) => setEditCanPurchaseStock(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Purchase Stock Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanProducts}
                        onChange={(e) => setEditCanProducts(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Products Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanSuppliers}
                        onChange={(e) => setEditCanSuppliers(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Suppliers Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanCustomers}
                        onChange={(e) => setEditCanCustomers(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Customers Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanBarcodeLabel}
                        onChange={(e) => setEditCanBarcodeLabel(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Barcode Generator</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanDayClosing}
                        onChange={(e) => setEditCanDayClosing(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Day Closing Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editCanExpenses}
                        onChange={(e) => setEditCanExpenses(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Pay Expense Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none col-span-2">
                      <input
                        type="checkbox"
                        checked={editCanReports}
                        onChange={(e) => setEditCanReports(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Reports & Analytics Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none col-span-2">
                      <input
                        type="checkbox"
                        checked={editCanSettings}
                        onChange={(e) => setEditCanSettings(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Store Settings Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none col-span-2">
                      <input
                        type="checkbox"
                        checked={editCanPlanPRD}
                        onChange={(e) => setEditCanPlanPRD(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Interactive Roadmap Tab</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#1e7e34] hover:bg-[#155724] text-white font-extrabold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>SAVE & UPDATE CREDENTIALS</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Creation State Form */
            <form onSubmit={handleCreateAccount}>
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5">
                <UserPlus className="w-4.5 h-4.5 text-[#0070ba]" />
                <span className="font-black text-xs md:text-sm text-[#002b49] uppercase tracking-wider">
                  Create Account / Employee
                </span>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Employee / Admin Name:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba]"
                    placeholder="e.g. Hammad Malik"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Login Email Address:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba]"
                    placeholder="hammad@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Login Password:
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] font-mono"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                    Designated Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-300 px-2 py-2 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  >
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Manager">Manager (Intermediate Access)</option>
                    <option value="Cashier">Cashier (Sales Register Only)</option>
                  </select>
                </div>

                {/* Granular Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    SET CUSTOM PERMISSIONS (Toggle Menu Items & Buttons)
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canDashboard}
                        onChange={(e) => setCanDashboard(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Dashboard Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canSale}
                        onChange={(e) => setCanSale(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Sale Invoice Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canReturn}
                        onChange={(e) => setCanReturn(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Sale Return Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canBillHistory}
                        onChange={(e) => setCanBillHistory(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Bill History Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canCreditReceive}
                        onChange={(e) => setCanCreditReceive(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Credit Receive Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canPurchaseStock}
                        onChange={(e) => setCanPurchaseStock(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Purchase Stock Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canProducts}
                        onChange={(e) => setCanProducts(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Products Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canSuppliers}
                        onChange={(e) => setCanSuppliers(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Suppliers Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canCustomers}
                        onChange={(e) => setCanCustomers(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Customers Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canBarcodeLabel}
                        onChange={(e) => setCanBarcodeLabel(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Barcode Generator</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canDayClosing}
                        onChange={(e) => setCanDayClosing(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Day Closing Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={canExpenses}
                        onChange={(e) => setCanExpenses(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Pay Expense Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none col-span-2">
                      <input
                        type="checkbox"
                        checked={canReports}
                        onChange={(e) => setCanReports(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Reports & Analytics Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none col-span-2">
                      <input
                        type="checkbox"
                        checked={canSettings}
                        onChange={(e) => setCanSettings(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Store Settings Tab</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer select-none col-span-2">
                      <input
                        type="checkbox"
                        checked={canPlanPRD}
                        onChange={(e) => setCanPlanPRD(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">Interactive Roadmap Tab</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#0070ba] hover:bg-[#005a96] text-white font-extrabold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>CREATE ACCOUNT / EMPLOYEE</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
