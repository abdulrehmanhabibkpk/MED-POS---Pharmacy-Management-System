import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Building2, Wallet, AlertCircle, Check, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Supplier } from '../types';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, storeSettings } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [balanceOwed, setBalanceOwed] = useState<number>(0);

  // Payment Record Form State
  const [payAmount, setPayAmount] = useState<number>(0);

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

  const openPaymentModal = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setPayAmount(Math.min(sup.balanceOwed, 5000));
    setShowPaymentModal(true);
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

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || payAmount <= 0) return;

    updateSupplier({
      ...selectedSupplier,
      balanceOwed: Math.max(0, selectedSupplier.balanceOwed - payAmount),
    });
    setShowPaymentModal(false);
    alert(`Successfully recorded payment of ${storeSettings.currency} ${payAmount.toLocaleString()} to ${selectedSupplier.name}!`);
  };

  const handleDelete = (id: string, supName: string) => {
    if (window.confirm(`Are you sure you want to remove supplier "${supName}"?`)) {
      deleteSupplier(id);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  const totalOwed = suppliers.reduce((sum, s) => sum + s.balanceOwed, 0);

  return (
    <div className="p-6 bg-[#f4f7fa] min-h-full space-y-4">
      {/* KPI Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Registered Suppliers</span>
            <h3 className="text-xl font-extrabold text-[#002b49] mt-0.5">{suppliers.length}</h3>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-sm border border-blue-100">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Outstanding Payables</span>
            <h3 className="text-xl font-extrabold text-amber-600 mt-0.5">
              {storeSettings.currency} {totalOwed.toLocaleString()}
            </h3>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-sm border border-amber-100">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">High Balance Creditors</span>
            <h3 className="text-xl font-extrabold text-red-600 mt-0.5">
              {suppliers.filter(s => s.balanceOwed > 20000).length} Suppliers
            </h3>
          </div>
          <div className="p-2 bg-red-50 text-red-700 rounded-sm border border-red-100">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Control Search Bar */}
      <div className="bg-white border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <label className="text-xs font-bold text-slate-700 shrink-0">Search Suppliers:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, company, mobile number..."
            className="w-full max-w-md bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        <button
          onClick={openAddModal}
          type="button"
          className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-1.5 px-4 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Supplier</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Supplier Details</th>
                <th className="py-2.5 px-3 font-semibold">Major Brands/Products</th>
                <th className="py-2.5 px-3 font-semibold">Contact Info</th>
                <th className="py-2.5 px-3 font-semibold">Address</th>
                <th className="py-2.5 px-3 font-semibold text-right">Outstanding Payable Balance</th>
                <th className="py-2.5 px-3 font-semibold text-center">Actions Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-3 font-bold text-slate-800">
                      <div>{s.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">ID: {s.id}</span>
                    </td>

                    {/* Company */}
                    <td className="py-3 px-3 text-slate-600 font-medium font-sans">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.company || 'Not Specified'}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-3 text-slate-600">
                      {s.phone && (
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{s.phone}</span>
                        </div>
                      )}
                      {s.email && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{s.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3 px-3 text-slate-500 font-normal max-w-xs truncate">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span title={s.address}>{s.address || 'Local Market'}</span>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-extrabold rounded-full ${
                          s.balanceOwed > 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {storeSettings.currency} {s.balanceOwed.toLocaleString()}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {s.balanceOwed > 0 && (
                          <button
                            onClick={() => openPaymentModal(s)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-black py-1 px-2.5 rounded text-[10px] uppercase transition-colors"
                          >
                            💸 Pay Supplier
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="Edit Info"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1 text-slate-600 hover:text-red-600 rounded hover:bg-slate-100"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No suppliers match your active search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                {editingSupplier ? '✏️ Edit Supplier Details' : '➕ Add New Supplier'}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier Name *:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Al-Madina Distributors"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Principal Brand:</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. GlaxoSmithKline GSK"
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
                  <label className="block font-bold text-slate-700 mb-1">Email Address:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. info@madinadist.com"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / Hub Location:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Medicine Wholesale Market, Lahore"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Outstanding Balance / Payable Amount ({storeSettings.currency}):</label>
                <input
                  type="number"
                  min="0"
                  value={balanceOwed === 0 ? '' : balanceOwed}
                  onChange={(e) => setBalanceOwed(parseFloat(e.target.value) || 0)}
                  placeholder="Amount you currently owe this supplier"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-1.5 font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingSupplier ? 'Update Supplier' : 'Save Supplier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Entry Modal */}
      {showPaymentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800">
            <div className="bg-[#0f5132] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">💸 Record Payment Output</span>
              <button onClick={() => setShowPaymentModal(false)} className="text-emerald-100 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="font-bold text-slate-700">{selectedSupplier.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Current Outstanding Balance:</div>
                <div className="text-base font-extrabold text-[#002b49] font-mono mt-0.5">
                  {storeSettings.currency} {selectedSupplier.balanceOwed.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Amount Paid ({storeSettings.currency}) *:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedSupplier.balanceOwed}
                  required
                  value={payAmount === 0 ? '' : payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5000"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-extrabold font-mono text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-1.5 font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Cash Outflow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
