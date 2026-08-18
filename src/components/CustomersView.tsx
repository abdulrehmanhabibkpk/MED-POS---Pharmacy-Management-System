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
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Customers Ledger & Khata Management
            </h1>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Khata System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer khata books, date-wise itemized credit sales, payments received, and print statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="bg-[#002b49] hover:bg-[#001f35] text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Customers */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Registered Accounts
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
              {customers.length}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-sm">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outstanding Receivable */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
              Total Khata Receivable
            </span>
            <span className="text-xl font-extrabold text-red-600 mt-0.5 block font-mono">
              {storeSettings.currency} {totalReceivable.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 bg-red-50 text-red-700 rounded-sm">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Total Advance Paid */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Advance Balance Paid
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block font-mono">
              {storeSettings.currency} {totalAdvance.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Active Transactions Count */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Khata Transactions
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
              {customerTransactions.length}
            </span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-sm">
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
              placeholder="Search by customer name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#0070ba]"
            />
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-800">{filteredCustomers.length}</strong> of {customers.length} customers
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Customer Account</th>
                <th className="py-2.5 px-3 font-semibold">Contact Details</th>
                <th className="py-2.5 px-3 font-semibold">Area / Address</th>
                <th className="py-2.5 px-3 font-semibold text-right">Khata Balance</th>
                <th className="py-2.5 px-3 font-semibold text-center">Ledger Report & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const txCount = customerTransactions.filter(
                    (tx) => tx.customerId === c.id || tx.customerName.toLowerCase() === c.name.toLowerCase()
                  ).length;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-3 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold">{c.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3 text-slate-600">
                        {c.phone ? (
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone contact</span>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span title={c.address}>{c.address || 'Local Customer'}</span>
                        </div>
                      </td>

                      {/* Receivable Balance */}
                      <td className="py-3 px-3 text-right font-mono">
                        {c.balanceReceivable > 0 ? (
                          <span className="inline-block px-2.5 py-1 text-xs font-black rounded-full bg-red-100 text-red-800 border border-red-200">
                            ⚠️ Receivable: {storeSettings.currency} {c.balanceReceivable.toLocaleString()}
                          </span>
                        ) : c.balanceReceivable < 0 ? (
                          <span className="inline-block px-2.5 py-1 text-xs font-black rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            💵 Advance: {storeSettings.currency} {Math.abs(c.balanceReceivable).toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-500">
                            Settled / Nil
                          </span>
                        )}
                      </td>

                      {/* Ledger Statement Button & Actions */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Main Ledger Statement Button */}
                          <button
                            onClick={() => openLedgerStatement(c)}
                            className="bg-[#002b49] hover:bg-[#001f35] text-white font-bold py-1.5 px-3 text-xs flex items-center gap-1.5 rounded-xs transition-colors shadow-xs cursor-pointer"
                            title="Open detailed Khata Ledger report, view items given, add/edit payments, and print statement"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                            <span>Ledger Report ({txCount})</span>
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Customer Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Delete */}
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100"
                            title="Delete Customer Account"
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                {editingCustomer ? '✏️ Edit Customer Profile' : '➕ Add New Customer Account'}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name *:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Contact Phone:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0345-1112223"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (Optional):</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ali@gmail.com"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / Location Details:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Model Town, Link Road, Lahore"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Opening Khata Balance ({storeSettings.currency}):
                </label>
                <input
                  type="number"
                  step="any"
                  value={balanceReceivable === 0 ? '' : balanceReceivable}
                  onChange={(e) => setBalanceReceivable(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter positive amount if customer already owes money to the store.
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
