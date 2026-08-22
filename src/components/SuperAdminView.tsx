import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  CreditCard,
  UserCheck,
  RefreshCw,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Check,
  X,
  Sliders,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { CompanyAccount } from '../types';

export const SuperAdminView: React.FC = () => {
  const {
    storeSettings,
    addCompany,
    updateCompany,
    deleteCompany,
    userAccounts,
    addUserAccount,
    currentUser,
  } = usePOS();

  // Extract companies from storeSettings (fallback to empty array if none)
  const companies = storeSettings.companies || [];

  // Local component states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // New Company form states
  const [name, setName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number>(5000);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Pending'>('Pending');
  const [billingStatus, setBillingStatus] = useState<'Active' | 'Suspended'>('Active');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Editing state
  const [editingCompany, setEditingCompany] = useState<CompanyAccount | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !adminEmail.trim() || !adminPassword.trim() || !dueDate) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    const emailLower = adminEmail.trim().toLowerCase();

    // Check if company email already exists in either companies list or user accounts
    const companyExists = companies.some((c) => c.adminEmail.toLowerCase() === emailLower);
    const accountExists = userAccounts.some((acc) => acc.email.toLowerCase() === emailLower);

    if (companyExists || accountExists) {
      showToast('An account with this email address already exists.', 'error');
      return;
    }

    // 1. Create company account entry
    addCompany({
      name: name.trim(),
      adminEmail: emailLower,
      adminPassword,
      monthlyFee,
      paymentStatus,
      billingStatus,
      dueDate,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });

    // 2. Automatically seed an Admin user login account for this company
    addUserAccount({
      name: `${name.trim()} Administrator`,
      email: emailLower,
      password: adminPassword,
      role: 'Admin',
      permissions: {
        canDashboard: true,
        canSale: true,
        canReturn: true,
        canBillHistory: true,
        canCreditReceive: true,
        canPurchaseStock: true,
        canProducts: true,
        canSuppliers: true,
        canCustomers: true,
        canBarcodeLabel: true,
        canDayClosing: true,
        canExpenses: true,
        canReports: true,
        canSettings: true,
        canPlanPRD: true,
      },
    });

    showToast(`Company "${name}" registered successfully and Admin credentials generated.`);

    // Reset Form
    setName('');
    setAdminEmail('');
    setAdminPassword('');
    setMonthlyFee(5000);
    setPaymentStatus('Pending');
    setBillingStatus('Active');
    setDueDate(() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    });
    setPhone('');
    setAddress('');
  };

  const handleStartEdit = (comp: CompanyAccount) => {
    setEditingCompany(comp);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    if (!editingCompany.name.trim() || !editingCompany.adminEmail.trim() || !editingCompany.dueDate) {
      showToast('Please fill all required fields for editing.', 'error');
      return;
    }

    updateCompany(editingCompany);
    showToast(`Company details for "${editingCompany.name}" updated successfully.`);
    setEditingCompany(null);
  };

  const handleDeleteCompany = (comp: CompanyAccount) => {
    if (confirm(`Are you sure you want to permanently delete company "${comp.name}"? This will restrict their access.`)) {
      deleteCompany(comp.id);
      showToast(`Company "${comp.name}" and all associated bindings removed.`, 'success');
    }
  };

  // Calculations for SaaS KPI Cards
  const totalCompaniesCount = companies.length;
  const activeCompaniesCount = companies.filter((c) => c.billingStatus === 'Active').length;
  const suspendedCompaniesCount = companies.filter((c) => c.billingStatus === 'Suspended').length;

  const totalMonthlyRevenue = companies
    .filter((c) => c.paymentStatus === 'Paid')
    .reduce((sum, c) => sum + c.monthlyFee, 0);

  const pendingPaymentsAmount = companies
    .filter((c) => c.paymentStatus === 'Pending' || c.paymentStatus === 'Unpaid')
    .reduce((sum, c) => sum + c.monthlyFee, 0);

  // Filter companies
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || c.billingStatus.toLowerCase() === statusFilter;
    const matchesPayment = paymentFilter === 'all' || c.paymentStatus.toLowerCase() === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen space-y-6 pb-24 md:pb-12 text-slate-900">
      {/* Top Banner / SaaS Title Contract */}
      <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#DBEAFE] p-2.5 rounded-xl text-blue-700 shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">SaaS Account Control Center</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Monthly fee collection, tenant subscription statuses, and system-wide merchant company onboarding.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-2.5 px-4 rounded-xl text-blue-800 text-xs font-semibold self-start md:self-auto">
          <UserCheck className="w-4.5 h-4.5 text-blue-600" />
          <span>Super Admin Active: <strong className="text-blue-900">{currentUser?.email}</strong></span>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-xs transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-[#DCFCE7] border-green-200 text-green-950'
              : 'bg-[#FEE2E2] border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-[10px] uppercase font-bold tracking-wider hover:opacity-85"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row (Anti-AI minimalist design with distinct contrast) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Merchants
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{totalCompaniesCount}</span>
              <span className="text-xs text-gray-500">registered</span>
            </div>
          </div>
          <div className="bg-gray-100 p-2.5 rounded-lg text-gray-600">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Active Stores
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-green-700">{activeCompaniesCount}</span>
              <span className="text-xs text-gray-500">/ {suspendedCompaniesCount} suspended</span>
            </div>
          </div>
          <div className="bg-[#DCFCE7] p-2.5 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Monthly Revenue
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-blue-700">Rs. {totalMonthlyRevenue.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-1">PAID</span>
            </div>
          </div>
          <div className="bg-[#DBEAFE] p-2.5 rounded-lg text-blue-700">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Pending Collections
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-700">Rs. {pendingPaymentsAmount.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1">DUE</span>
            </div>
          </div>
          <div className="bg-[#FEF3C7] p-2.5 rounded-lg text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main SaaS split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Onboard Merchant Form / Edit Form */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 self-start shadow-xs">
          {editingCompany ? (
            /* Editing Store details */
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-sm text-gray-900 uppercase flex items-center gap-1.5">
                  <Edit className="w-4.5 h-4.5 text-blue-600" />
                  <span>Edit Store Details</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="text-xs text-gray-500 hover:text-gray-900 underline font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Store / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCompany.name}
                    onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Onboarded Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled
                    value={editingCompany.adminEmail}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Monthly License Fee (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingCompany.monthlyFee}
                      onChange={(e) => setEditingCompany({ ...editingCompany, monthlyFee: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Billing Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingCompany.dueDate}
                      onChange={(e) => setEditingCompany({ ...editingCompany, dueDate: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Payment Status
                    </label>
                    <select
                      value={editingCompany.paymentStatus}
                      onChange={(e) => setEditingCompany({ ...editingCompany, paymentStatus: e.target.value as any })}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Subscription Status
                    </label>
                    <select
                      value={editingCompany.billingStatus}
                      onChange={(e) => setEditingCompany({ ...editingCompany, billingStatus: e.target.value as any })}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Store Phone No
                  </label>
                  <input
                    type="text"
                    value={editingCompany.phone || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                    placeholder="e.g. 0300-1122334"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Physical Store Address
                  </label>
                  <textarea
                    rows={2}
                    value={editingCompany.address || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                    placeholder="e.g. Commercial Area Phase 1 DHA Lahore"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold p-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>SAVE CHANGES</span>
                </button>
              </div>
            </form>
          ) : (
            /* Create new Store/Merchant onboarding */
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-sm text-gray-900 uppercase flex items-center gap-1.5">
                  <Plus className="w-4.5 h-4.5 text-blue-600" />
                  <span>Onboard New Store</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Create a physical merchant profile. An Admin POS login will be generated instantly.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Store / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shaheen Medicos & Gen Store"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Admin Email Username *
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="shaheen@gmail.com"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Admin Login Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="e.g. shaheen123"
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Monthly Fee (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Next Billing Due *
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Subscription Active
                    </label>
                    <select
                      value={billingStatus}
                      onChange={(e) => setBillingStatus(e.target.value as any)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Physical Store Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0321-4567890"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Physical Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Sector G, DHA Phase 6, Lahore"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold p-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>ONBOARD & SEED MERCHANT</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Registered Merchant Directories & Filtering */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
          {/* Header & Searching bar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="font-extrabold text-xs md:text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4.5 h-4.5 text-blue-700" />
                <span>Onboarded Merchants Directory ({filteredCompanies.length})</span>
              </span>
              <span className="text-[10px] font-bold bg-[#DBEAFE] text-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Cloud Synchronized
              </span>
            </div>

            {/* Searching Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="relative sm:col-span-6">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by store name, email or phone..."
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Subscription Status</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Billing Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="overflow-x-auto max-h-[600px]">
            {filteredCompanies.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-gray-400">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">No stores found</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Adjust your searches or register a new client.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Store Name / Admin Email</th>
                    <th className="p-4">Monthly Fee</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4">License Status</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredCompanies.map((comp) => {
                    const isOverdue = new Date(comp.dueDate) < new Date() && comp.paymentStatus !== 'Paid';

                    return (
                      <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                        {/* Store Info */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-gray-900 block">{comp.name}</span>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                              <span className="font-mono flex items-center gap-1 text-gray-400">
                                <Mail className="w-3 h-3 text-gray-300" />
                                {comp.adminEmail}
                              </span>
                              {comp.phone && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-gray-400">
                                    <Phone className="w-3 h-3 text-gray-300" />
                                    {comp.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="p-4 font-extrabold text-gray-900 font-mono">
                          Rs. {comp.monthlyFee.toLocaleString()}
                        </td>

                        {/* Payment Status Badge */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              comp.paymentStatus === 'Paid'
                                ? 'bg-[#DCFCE7] text-green-800'
                                : comp.paymentStatus === 'Pending'
                                ? 'bg-[#FEF3C7] text-amber-800'
                                : 'bg-[#FEE2E2] text-red-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                comp.paymentStatus === 'Paid'
                                  ? 'bg-green-600'
                                  : comp.paymentStatus === 'Pending'
                                  ? 'bg-amber-600'
                                  : 'bg-red-600'
                              }`}
                            />
                            {comp.paymentStatus}
                          </span>
                        </td>

                        {/* Subscription Status Badge */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                              comp.billingStatus === 'Active'
                                ? 'bg-[#DBEAFE] text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {comp.billingStatus === 'Active' ? 'Active' : 'Suspended'}
                          </span>
                        </td>

                        {/* Due Date & Alerts */}
                        <td className="p-4 font-mono">
                          <div className="space-y-0.5">
                            <span className="text-gray-700 block">{comp.dueDate}</span>
                            {isOverdue && (
                              <span className="text-[9px] font-black text-red-600 bg-red-50 p-1 rounded inline-block uppercase tracking-wider animate-pulse">
                                Overdue Alert
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(comp)}
                              className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                              title="Edit merchant details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCompany(comp)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                              title="Remove company and bindings"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
