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
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Suppliers & Pharmaceutical Distributors Ledger
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Khata System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain accounts of medicine distributors, track stock purchases, bill payments, and print formal statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="bg-[#002b49] hover:bg-[#001f35] text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Supplier</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Suppliers */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Active Suppliers
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
              {suppliers.length}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-sm">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Total Payable Balance */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Total Payables (Balance Owed)
            </span>
            <span className="text-xl font-extrabold text-amber-600 mt-0.5 block font-mono">
              {storeSettings.currency} {totalOwed.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-sm">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Total Supplier Transactions */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Supplier Bills & Payments Logged
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
              {supplierTransactions.length} Entries
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-sm">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 shadow-xs">
        {/* Search Toolbar */}
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by supplier name, company, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#0070ba]"
            />
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-800">{filteredSuppliers.length}</strong> of {suppliers.length} distributors
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Supplier & Pharma Company</th>
                <th className="py-2.5 px-3 font-semibold">Contact Details</th>
                <th className="py-2.5 px-3 font-semibold">Distributor Depot / Address</th>
                <th className="py-2.5 px-3 font-semibold text-right">Payable Balance</th>
                <th className="py-2.5 px-3 font-semibold text-center">Ledger Report & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s) => {
                  const txCount = supplierTransactions.filter(
                    (tx) => tx.supplierId === s.id || tx.supplierName.toLowerCase() === s.name.toLowerCase()
                  ).length;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & Company */}
                      <td className="py-3 px-3 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold">{s.name}</div>
                            <span className="text-[10px] text-slate-500 font-normal">{s.company}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3 text-slate-600">
                        {s.phone ? (
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{s.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone contact</span>
                        )}
                        {s.email && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{s.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span title={s.address}>{s.address || 'Distributor Depot'}</span>
                        </div>
                      </td>

                      {/* Payable Balance */}
                      <td className="py-3 px-3 text-right font-mono">
                        {s.balanceOwed > 0 ? (
                          <span className="inline-block px-2.5 py-1 text-xs font-black rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            ⚠️ Payable: {storeSettings.currency} {s.balanceOwed.toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Clear / Settled
                          </span>
                        )}
                      </td>

                      {/* Ledger Statement Button & Actions */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Main Ledger Statement Button */}
                          <button
                            onClick={() => openLedgerStatement(s)}
                            className="bg-[#002b49] hover:bg-[#001f35] text-white font-bold py-1.5 px-3 text-xs flex items-center gap-1.5 rounded-xs transition-colors shadow-xs cursor-pointer"
                            title="Open detailed Supplier Ledger report, view stock received, add/edit payment bills, and print statement"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Ledger Report ({txCount})</span>
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Supplier Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Delete */}
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100"
                            title="Delete Supplier Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                {editingSupplier ? '✏️ Edit Supplier / Distributor' : '➕ Add New Supplier / Distributor'}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Distributor / Supplier Name *:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Al-Madina Medicine Distributors"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Principal Brands:</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. GSK, Abbott, Getz, Reckitt"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (Optional):</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. madina@dist.com"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Depot / Warehouse Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Medicine Market, Lahore"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Opening Balance Owed ({storeSettings.currency}):
                </label>
                <input
                  type="number"
                  step="any"
                  value={balanceOwed === 0 ? '' : balanceOwed}
                  onChange={(e) => setBalanceOwed(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Amount owed by the pharmacy to this supplier from past purchases.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#002b49] hover:bg-[#001f35] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
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
