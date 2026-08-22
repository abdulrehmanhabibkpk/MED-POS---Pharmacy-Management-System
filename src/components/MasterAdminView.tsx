import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, CreditCard, Calendar, CheckCircle, AlertTriangle, 
  Plus, Edit2, Download, Trash2, Mail, Lock, User, RefreshCw, ChevronDown, ChevronUp, DollarSign, Ban
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

interface DetailedTenant {
  id: string;
  name: string;
  status: string; // 'Active' | 'Suspended' | 'Expired'
  monthlyFee: number;
  expiryDate: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  subAccountsCount: number;
  salesCount: number;
  productsCount: number;
  totalSalesValue: number;
}

export const MasterAdminView: React.FC = () => {
  const { currentUser, logout } = usePOS();
  
  // Tenants and metrics state
  const [tenants, setTenants] = useState<DetailedTenant[]>([]);
  const [totalSubAccounts, setTotalSubAccounts] = useState(0);
  const [mrr, setMrr] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Expandable tenant rows state
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);

  // New Tenant Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newMonthlyFee, setNewMonthlyFee] = useState(3500);
  const [newExpiryDate, setNewExpiryDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1); // default 1 month from now
    return d.toISOString().split('T')[0];
  });

  // Edit Tenant Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<DetailedTenant | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editMonthlyFee, setEditMonthlyFee] = useState(3500);
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');

  // Load SaaS dashboard data
  const loadSaaSData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/super-admin/data');
      if (!res.ok) {
        throw new Error('Failed to retrieve SaaS systems data.');
      }
      const data = await res.json();
      setTenants(data.tenants || []);
      setTotalSubAccounts(data.totalRegisteredUsers || 0);
      setMrr(data.revenueMonthlyProjection || 0);
    } catch (err: any) {
      setError(err.message || 'Error communicating with PostgreSQL server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaaSData();
  }, []);

  // Create new tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newOwnerName.trim() || !newOwnerEmail.trim() || !newPassword.trim()) {
      setError('Please provide all parameters to create a new workspace.');
      return;
    }

    setIsActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/super-admin/create-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompanyName.trim(),
          ownerName: newOwnerName.trim(),
          ownerEmail: newOwnerEmail.trim(),
          password: newPassword,
          monthlyFee: newMonthlyFee,
          expiryDate: newExpiryDate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create workspace.');
      }

      setSuccess(data.message || 'Company Workspace created successfully!');
      setShowCreateModal(false);
      
      // Reset inputs
      setNewCompanyName('');
      setNewOwnerName('');
      setNewOwnerEmail('');
      setNewPassword('');
      setNewMonthlyFee(3500);
      
      // Reload
      await loadSaaSData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (t: DetailedTenant) => {
    setEditingTenant(t);
    setEditName(t.name);
    setEditStatus(t.status);
    setEditMonthlyFee(t.monthlyFee);
    setEditExpiryDate(t.expiryDate);
    setEditOwnerName(t.ownerName);
    setEditOwnerEmail(t.ownerEmail);
    setShowEditModal(true);
  };

  // Save Tenant edits
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    setIsActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/super-admin/update-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTenant.id,
          name: editName.trim(),
          status: editStatus,
          monthlyFee: editMonthlyFee,
          expiryDate: editExpiryDate,
          ownerName: editOwnerName.trim(),
          ownerEmail: editOwnerEmail.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update workspace properties.');
      }

      setSuccess(data.message || 'Workspace configuration updated successfully.');
      setShowEditModal(false);
      setEditingTenant(null);
      await loadSaaSData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Tenant
  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`CRITICAL WARNING:\nAre you absolutely sure you want to permanently delete "${name}" workspace?\nAll isolated sales, khata ledgers, customers, and employees will be deleted. This action is irreversible.`)) {
      return;
    }

    setIsActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/super-admin/delete-tenant/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete workspace.');
      }

      setSuccess(data.message || 'Workspace fully purged from primary servers.');
      await loadSaaSData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Download Backup of Workspace
  const downloadTenantBackup = async (id: string, name: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/super-admin/backup-tenant/${id}`);
      if (!res.ok) {
        throw new Error('Failed to retrieve backup stream from database server.');
      }

      const backupData = await res.json();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SaaS_Backup_${name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(`Isolated database backup of "${name}" successfully extracted.`);
    } catch (err: any) {
      setError(err.message || 'Failed to download company data backup.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F9FAFB] min-h-screen space-y-8 select-none font-sans">
      
      {/* Top row heading and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            SaaS Platform Master Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1">
            Centrally manage tenant company stores, recurring subscription plans, and secure system database records.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadSaaSData}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Live</span>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#3F83F8] hover:bg-[#2563EB] text-white transition-all flex items-center gap-2 text-xs font-bold shadow-md shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Workspace</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-900 uppercase font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-green-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-900 uppercase font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Company Stores
            </div>
            <div className="text-2xl font-black text-gray-900 mt-1">
              {tenants.length}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Monthly Recurring Revenue (MRR)
            </div>
            <div className="text-2xl font-black text-gray-900 mt-1 font-mono">
              Rs. {mrr.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              System Sub-Accounts
            </div>
            <div className="text-2xl font-black text-gray-900 mt-1">
              {totalSubAccounts}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Flagged Workspace Alerts
            </div>
            <div className="text-2xl font-black text-gray-900 mt-1">
              {tenants.filter(t => t.status !== 'Active').length}
            </div>
          </div>
        </div>

      </div>

      {/* Main SaaS Workspace Manager Table container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            <span>SaaS Workspaces & Active Licenses ({tenants.length})</span>
          </h2>
          <span className="text-[10px] bg-blue-100 text-[#1E429F] font-bold px-2.5 py-1 rounded-full border border-blue-200 uppercase tracking-wide">
            Live Cloud SQL Postgres
          </span>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-500">Retrieving secure workspace matrices...</span>
          </div>
        ) : tenants.length === 0 ? (
          <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-2">
            <Building2 className="w-12 h-12 text-gray-300" />
            <div className="text-sm font-bold">No active workspaces configured.</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-[#2563EB] text-xs font-bold hover:underline mt-2"
            >
              Click here to register the first client.
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
                  <th className="py-3.5 px-5">Store Name & Owner</th>
                  <th className="py-3.5 px-4">Status & Health</th>
                  <th className="py-3.5 px-4">Monthly fee</th>
                  <th className="py-3.5 px-4">License Expiry</th>
                  <th className="py-3.5 px-4 text-center">Cloud Storage</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((t) => {
                  const isExpanded = expandedTenantId === t.id;
                  const isExpiredSoon = new Date(t.expiryDate) < new Date(Date.now() + 7 * 24 * 3600 * 1000);
                  
                  return (
                    <React.Fragment key={t.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        {/* Company Name and Owner Info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700 uppercase shrink-0 border border-gray-200">
                              {t.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-extrabold text-gray-900 text-xs sm:text-sm flex items-center gap-2">
                                <span>{t.name}</span>
                                <button
                                  onClick={() => setExpandedTenantId(isExpanded ? null : t.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                                <User className="w-3 h-3 text-gray-400" />
                                <span>{t.ownerName}</span>
                                <span>•</span>
                                <span className="font-mono">{t.ownerEmail}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            t.status === 'Active'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : t.status === 'Suspended'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              t.status === 'Active' ? 'bg-green-500' : t.status === 'Suspended' ? 'bg-red-500' : 'bg-amber-500'
                            }`} />
                            <span>{t.status}</span>
                          </span>
                        </td>

                        {/* Monthly Fee */}
                        <td className="py-4 px-4 font-mono text-xs font-bold text-gray-900">
                          Rs. {t.monthlyFee.toLocaleString()}
                        </td>

                        {/* Expiry Date */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className={isExpiredSoon && t.status === 'Active' ? 'text-amber-600' : ''}>
                              {t.expiryDate}
                            </span>
                            {isExpiredSoon && t.status === 'Active' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-ping" />
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5 font-mono">
                            Created: {t.createdAt.slice(0, 10)}
                          </div>
                        </td>

                        {/* Usage Metrics overview */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-grid grid-cols-3 gap-3 text-center border border-gray-100 rounded-lg p-1 bg-gray-50/50">
                            <div className="px-1.5">
                              <div className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Products</div>
                              <div className="text-xs font-black text-gray-700 font-mono">{t.productsCount}</div>
                            </div>
                            <div className="px-1.5 border-x border-gray-200">
                              <div className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Sales</div>
                              <div className="text-xs font-black text-gray-700 font-mono">{t.salesCount}</div>
                            </div>
                            <div className="px-1.5">
                              <div className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Staff</div>
                              <div className="text-xs font-black text-gray-700 font-mono">{t.subAccountsCount}</div>
                            </div>
                          </div>
                        </td>

                        {/* Interactive actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => downloadTenantBackup(t.id, t.name)}
                              title="Download Backup"
                              className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openEditModal(t)}
                              title="Edit Workspace"
                              className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTenant(t.id, t.name)}
                              title="Wipe Workspace"
                              className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row for showing detailed info */}
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={6} className="p-4 border-t border-gray-100">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-4">
                              <h3 className="text-xs font-extrabold uppercase text-gray-600 tracking-wider">
                                Platform Analytics & Sub-Accounts of "{t.name}"
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium text-gray-600">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Total Sales Invoiced Volume</div>
                                  <div className="text-base font-extrabold text-gray-800 mt-1 font-mono">Rs. {t.totalSalesValue.toLocaleString()}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Workspace Owner Account</div>
                                  <div className="text-base font-extrabold text-gray-800 mt-1">{t.ownerName}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Platform Security Domain</div>
                                  <div className="text-base font-extrabold text-gray-800 mt-1 font-mono">{t.id}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Created Timestamp</div>
                                  <div className="text-base font-extrabold text-gray-800 mt-1 font-mono">{t.createdAt}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE WORKSPACE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-gray-100 text-slate-800 animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Register SaaS Company Workspace</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase">Cancel</button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Company / Store Name</label>
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Al-Karam Medicine Traders"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Owner Full Name</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g. Dr. Tariq Mahmood"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Owner Email Address</label>
                  <input
                    type="email"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    placeholder="e.g. owner@alkaram.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-medium font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Primary Owner Admin Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set workspace password"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monthly Subscription Fee (Rs.)</label>
                  <input
                    type="number"
                    value={newMonthlyFee}
                    onChange={(e) => setNewMonthlyFee(Number(e.target.value))}
                    placeholder="e.g. 3500"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">License Subscription Expiry</label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-xl text-xs font-bold transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="bg-[#3F83F8] hover:bg-[#2563EB] disabled:bg-gray-400 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {isActionLoading ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  <span>Initialize Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORKSPACE CONFIG MODAL */}
      {showEditModal && editingTenant && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-gray-100 text-slate-800 animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <span>Configure Workspace: {editingTenant.name}</span>
              </h3>
              <button onClick={() => { setShowEditModal(false); setEditingTenant(null); }} className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase">Cancel</button>
            </div>

            <form onSubmit={handleUpdateTenant} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Company / Store Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Workspace Status & Health</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-bold"
                  >
                    <option value="Active">Active (Unrestricted)</option>
                    <option value="Suspended">Suspended (Access Denied)</option>
                    <option value="Expired">Expired (Unlicensed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Owner Email Address</label>
                  <input
                    type="email"
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-medium font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monthly Subscription Fee (Rs.)</label>
                  <input
                    type="number"
                    value={editMonthlyFee}
                    onChange={(e) => setEditMonthlyFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subscription Expiry Date</label>
                  <input
                    type="date"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingTenant(null); }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-xl text-xs font-bold transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="bg-[#3F83F8] hover:bg-[#2563EB] disabled:bg-gray-400 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {isActionLoading ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer support block */}
      <div className="text-center pt-8 text-[11px] text-[#9CA3AF] font-bold border-t border-gray-200">
        POWERED BY THE PAK HACKTES SAAS CORE SYSTEMS • SECURED BY CLOUD SQL POSTGRES
      </div>

    </div>
  );
};
