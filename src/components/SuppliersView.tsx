import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  Wallet,
  AlertCircle,
  Check,
  X,
  BookOpen,
  FileText,
  TrendingDown,
  Printer
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Supplier } from '../types';
import { SupplierLedgerModal } from './SupplierLedgerModal';

export const SuppliersView: React.FC = () => {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    storeSettings,
    supplierTransactions,
  } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedLedgerSupplier, setSelectedLedgerSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [balanceOwed, setBalanceOwed] = useState<number>(0);

  const openAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setAddress('');
    setBalanceOwed(0);
    setShowModal(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setCompany(sup.company);
    setPhone(sup.phone);
    setEmail(sup.email);
    setAddress(sup.address);
    setBalanceOwed(sup.balanceOwed);
    setShowModal(true);
  };

  const openLedgerStatement = (sup: Supplier) => {
    setSelectedLedgerSupplier(sup);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Supplier Name is required.');
      return;
    }

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        name: name.trim(),
        company: company.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        balanceOwed,
      });
    } else {
      addSupplier({
        name: name.trim(),
        company: company.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        balanceOwed,
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, supName: string) => {
    if (window.confirm(`Are you sure you want to remove supplier "${supName}" and their ledger history?`)) {
      deleteSupplier(id);
    }
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOwed = suppliers.reduce((sum, s) => sum + s.balanceOwed, 0);

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-10 font-sans font-sans">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Suppliers & Pharmaceutical Distributors Ledger
            </h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg">
              Khata System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Maintain accounts of medicine distributors, track stock purchases, bill payments, and print formal statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm shadow-emerald-100 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Suppliers */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Total Active Suppliers
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {suppliers.length}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Total Payable Balance */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block">
              Total Payables (Balance Owed)
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">
              {storeSettings.currency} {totalOwed.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Total Supplier Transactions */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Supplier Bills & Payments Logged
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {supplierTransactions.length} Entries
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by supplier name, company, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-bold rounded-2xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>
          <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
            Showing <strong className="text-slate-800">{filteredSuppliers.length}</strong> of {suppliers.length} distributors
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-black">Supplier & Pharma Company</th>
                <th className="py-3 px-4 font-black">Contact Details</th>
                <th className="py-3 px-4 font-black">Distributor Depot / Address</th>
                <th className="py-3 px-4 font-black text-right">Payable Balance</th>
                <th className="py-3 px-4 font-black text-center">Ledger Report & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s) => {
                  const txCount = supplierTransactions.filter(
                    (tx) => tx.supplierId === s.id || tx.supplierName.toLowerCase() === s.name.toLowerCase()
                  ).length;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Company */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-xs border border-emerald-100">
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-slate-900 font-black text-sm">{s.name}</div>
                            <span className="text-[10px] text-slate-400 font-bold">{s.company}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {s.phone ? (
                          <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold italic">No phone contact</span>
                        )}
                        {s.email && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-semibold">
                            <Mail className="w-3.5 h-3.5 text-slate-300" />
                            <span>{s.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        <div className="flex items-center gap-1.5 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span title={s.address}>{s.address || 'Distributor Depot'}</span>
                        </div>
                      </td>

                      {/* Payable Balance */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        {s.balanceOwed > 0 ? (
                          <span className="inline-block px-3 py-1 text-[11px] font-black rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                            ⚠️ Payable: {storeSettings.currency} {s.balanceOwed.toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 text-[11px] font-black rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ✓ Clear / Settled
                          </span>
                        )}
                      </td>

                      {/* Ledger Statement Button & Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Main Ledger Statement Button */}
                          <button
                            onClick={() => openLedgerStatement(s)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-slate-200"
                            title="Open detailed Supplier Ledger report, view stock received, add/edit payment bills, and print statement"
                          >
                            <BookOpen className="w-4 h-4 text-slate-500" />
                            <span>Ledger Report ({txCount})</span>
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
                            title="Edit Supplier Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Quick Delete */}
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            className="p-2 text-slate-600 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
                            title="Delete Supplier Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                    No suppliers match your active search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Ledger Detailed Modal */}
      {selectedLedgerSupplier && (
        <SupplierLedgerModal
          supplier={selectedLedgerSupplier}
          isOpen={!!selectedLedgerSupplier}
          onClose={() => {
            setSelectedLedgerSupplier(null);
          }}
        />
      )}

      {/* Add / Edit Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800 rounded-3xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">
                {editingSupplier ? '✏️ Edit Supplier / Distributor' : '➕ Add New Supplier / Distributor'}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 p-1 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2 font-black">Distributor / Supplier Name *:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Al-Madina Medicine Distributors"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2 font-black">Company / Principal Brands:</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. GSK, Abbott, Getz, Reckitt"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2 font-black">Contact Phone:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2 font-black">Email (Optional):</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. madina@dist.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2 font-black">Depot / Warehouse Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Medicine Market, Lahore"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2 font-black">
                  Opening Balance Owed ({storeSettings.currency}):
                </label>
                <input
                  type="number"
                  step="any"
                  value={balanceOwed === 0 ? '' : balanceOwed}
                  onChange={(e) => setBalanceOwed(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">
                  Amount owed by the pharmacy to this supplier from past purchases.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-blue-100 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSupplier ? 'Update Supplier' : 'Save Supplier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
