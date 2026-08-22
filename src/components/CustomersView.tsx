import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Check,
  X,
  AlertCircle,
  Receipt,
  BookOpen,
  Printer,
  Download
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Customer } from '../types';
import { CustomerLedgerModal } from './CustomerLedgerModal';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, storeSettings, customerTransactions } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [balanceReceivable, setBalanceReceivable] = useState<number>(0);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setBalanceReceivable(0);
    setShowModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address);
    setBalanceReceivable(c.balanceReceivable);
    setShowModal(true);
  };

  const openLedgerStatement = (c: Customer) => {
    setSelectedLedgerCustomer(c);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Customer Name is required.');
      return;
    }

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        balanceReceivable,
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        balanceReceivable,
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${customerName}" and all associated ledger entries?`)) {
      deleteCustomer(id);
    }
  };

  // Filters
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceivable = customers.reduce((sum, c) => sum + (c.balanceReceivable > 0 ? c.balanceReceivable : 0), 0);
  const totalAdvance = customers.reduce((sum, c) => sum + (c.balanceReceivable < 0 ? Math.abs(c.balanceReceivable) : 0), 0);

  return (
    <div className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Customers Ledger & Khata Management
            </h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg">
              Khata System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Track customer khata books, date-wise itemized credit sales, payments received, and print statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm shadow-emerald-100 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Registered Accounts
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {customers.length}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outstanding Receivable */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">
              Total Khata Receivable
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">
              {storeSettings.currency} {totalReceivable.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Total Advance Paid */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block">
              Advance Balance Paid
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">
              {storeSettings.currency} {totalAdvance.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Active Transactions Count */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Total Khata Transactions
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {customerTransactions.length}
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
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
              placeholder="Search by customer name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-bold rounded-2xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>
          <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
            Showing <strong className="text-slate-800">{filteredCustomers.length}</strong> of {customers.length} customers
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-black">Customer Account</th>
                <th className="py-3 px-4 font-black">Contact Details</th>
                <th className="py-3 px-4 font-black">Area / Address</th>
                <th className="py-3 px-4 font-black text-right">Khata Balance</th>
                <th className="py-3 px-4 font-black text-center">Ledger Report & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const txCount = customerTransactions.filter(
                    (tx) => tx.customerId === c.id || tx.customerName.toLowerCase() === c.name.toLowerCase()
                  ).length;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-700 font-black flex items-center justify-center text-xs border border-blue-100">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-slate-900 font-black text-sm">{c.name}</div>
                            <span className="text-[9px] text-slate-400 font-bold font-mono">ID: {c.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {c.phone ? (
                          <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold italic">No phone contact</span>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-semibold">
                            <Mail className="w-3.5 h-3.5 text-slate-300" />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        <div className="flex items-center gap-1.5 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span title={c.address}>{c.address || 'Local Customer'}</span>
                        </div>
                      </td>

                      {/* Receivable Balance */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        {c.balanceReceivable > 0 ? (
                          <span className="inline-block px-3 py-1 text-[11px] font-black rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                            ⚠️ Receivable: {storeSettings.currency} {c.balanceReceivable.toLocaleString()}
                          </span>
                        ) : c.balanceReceivable < 0 ? (
                          <span className="inline-block px-3 py-1 text-[11px] font-black rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                            💵 Advance: {storeSettings.currency} {Math.abs(c.balanceReceivable).toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 text-[11px] font-bold rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                            Settled / Nil
                          </span>
                        )}
                      </td>

                      {/* Ledger Statement Button & Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Main Ledger Statement Button */}
                          <button
                            onClick={() => openLedgerStatement(c)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-slate-200"
                            title="Open detailed Khata Ledger report, view items given, add/edit payments, and print statement"
                          >
                            <BookOpen className="w-4 h-4 text-slate-500" />
                            <span>Ledger Report ({txCount})</span>
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
                            title="Edit Customer Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Quick Delete */}
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="p-2 text-slate-600 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
                            title="Delete Customer Account"
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
                    No customers match your active search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Ledger Detailed Modal */}
      {selectedLedgerCustomer && (
        <CustomerLedgerModal
          customer={selectedLedgerCustomer}
          isOpen={!!selectedLedgerCustomer}
          onClose={() => {
            // refresh customer reference from state if updated
            setSelectedLedgerCustomer(null);
          }}
        />
      )}

      {/* Add / Edit Customer Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800 rounded-3xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">
                {editingCustomer ? '✏️ Edit Customer Profile' : '➕ Add New Customer Account'}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 p-1 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2 font-black">Customer Name *:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Mobile Contact Phone:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0345-1112223"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Email (Optional):</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ali@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Address / Location Details:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Model Town, Link Road, Lahore"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">
                  Opening Khata Balance ({storeSettings.currency}):
                </label>
                <input
                  type="number"
                  step="any"
                  value={balanceReceivable === 0 ? '' : balanceReceivable}
                  onChange={(e) => setBalanceReceivable(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">
                  Enter positive amount if customer already owes money to the store.
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
                  <span>{editingCustomer ? 'Update Profile' : 'Save Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
