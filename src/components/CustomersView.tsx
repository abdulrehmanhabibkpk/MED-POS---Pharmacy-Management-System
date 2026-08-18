import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, User, FileText, TrendingDown, TrendingUp, DollarSign, Check, X, AlertCircle } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Customer } from '../types';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, storeSettings } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [balanceReceivable, setBalanceReceivable] = useState<number>(0);

  // Ledger Action Form State
  const [ledgerActionType, setLedgerActionType] = useState<'RECEIVE' | 'CHARGE'>('RECEIVE');
  const [ledgerAmount, setLedgerAmount] = useState<number>(0);
  const [ledgerNotes, setLedgerNotes] = useState('');

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

  const openLedgerModal = (c: Customer, initialType: 'RECEIVE' | 'CHARGE') => {
    setSelectedCustomer(c);
    setLedgerActionType(initialType);
    setLedgerAmount(initialType === 'RECEIVE' ? Math.min(c.balanceReceivable, 2000) : 500);
    setLedgerNotes('');
    setShowLedgerModal(true);
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

  const handleRecordLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || ledgerAmount <= 0) return;

    let updatedBalance = selectedCustomer.balanceReceivable;
    if (ledgerActionType === 'RECEIVE') {
      updatedBalance = selectedCustomer.balanceReceivable - ledgerAmount;
    } else {
      updatedBalance = selectedCustomer.balanceReceivable + ledgerAmount;
    }

    updateCustomer({
      ...selectedCustomer,
      balanceReceivable: updatedBalance,
    });
    
    setShowLedgerModal(false);
    
    const message = ledgerActionType === 'RECEIVE'
      ? `Successfully received ${storeSettings.currency} ${ledgerAmount.toLocaleString()} payment from ${selectedCustomer.name}! New Balance: ${storeSettings.currency} ${updatedBalance.toLocaleString()}`
      : `Successfully added ${storeSettings.currency} ${ledgerAmount.toLocaleString()} credit charge to ${selectedCustomer.name}'s account! New Balance: ${storeSettings.currency} ${updatedBalance.toLocaleString()}`;
    
    alert(message);
  };

  const handleDelete = (id: string, custName: string) => {
    if (window.confirm(`Are you sure you want to remove customer account "${custName}"?`)) {
      deleteCustomer(id);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const totalReceivable = customers.reduce((sum, c) => sum + (c.balanceReceivable > 0 ? c.balanceReceivable : 0), 0);
  const activeDebtors = customers.filter(c => c.balanceReceivable > 0).length;

  return (
    <div className="p-6 bg-[#f4f7fa] min-h-full space-y-4">
      {/* KPI Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Customer Accounts</span>
            <h3 className="text-xl font-extrabold text-[#002b49] mt-0.5">{customers.length}</h3>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-sm border border-blue-100">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Outstanding Khata (Receivables)</span>
            <h3 className="text-xl font-extrabold text-red-600 mt-0.5">
              {storeSettings.currency} {totalReceivable.toLocaleString()}
            </h3>
          </div>
          <div className="p-2 bg-red-50 text-red-700 rounded-sm border border-red-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Debtors (Pasy Dany Hain)</span>
            <h3 className="text-xl font-extrabold text-amber-600 mt-0.5">
              {activeDebtors} Customers
            </h3>
          </div>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-sm border border-amber-100">
            <AlertCircle className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Control Search Bar */}
      <div className="bg-white border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <label className="text-xs font-bold text-slate-700 shrink-0">Search Customers Ledger:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, mobile number, area..."
            className="w-full max-w-md bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        <button
          onClick={openAddModal}
          type="button"
          className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-1.5 px-4 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Customer Account</span>
        </button>
      </div>

      {/* Main Customers Ledger Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Customer Name</th>
                <th className="py-2.5 px-3 font-semibold">Contact Details</th>
                <th className="py-2.5 px-3 font-semibold">Home / Business Address</th>
                <th className="py-2.5 px-3 font-semibold text-right">Credit Status / Ledger Balance</th>
                <th className="py-2.5 px-3 font-semibold text-center">Manage Account Ledger (Khata Book)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-3 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <div>{c.name}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal pl-3.5">ID: {c.id}</span>
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

                    {/* Receivable Balance (Credit Ledger Status) */}
                    <td className="py-3 px-3 text-right">
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

                    {/* Managing Credit Account */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Option 1: Receive credit payment */}
                        <button
                          onClick={() => openLedgerModal(c, 'RECEIVE')}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1 px-2.5 text-[10px] uppercase transition-colors rounded-xs shadow-xs"
                          title="Record Cash Payment received from this customer"
                        >
                          💸 Receive Cash
                        </button>

                        {/* Option 2: Add credit purchase */}
                        <button
                          onClick={() => openLedgerModal(c, 'CHARGE')}
                          className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-300 font-bold py-1 px-2.5 text-[10px] uppercase transition-colors rounded-xs"
                          title="Add a new credit transaction/charge"
                        >
                          ➕ Charge Credit
                        </button>

                        {/* Standard Controls */}
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 ml-1"
                          title="Edit Customer Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Add / Edit Customer Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800">
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
                  <label className="block font-bold text-slate-700 mb-1">Email Address:</label>
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
                <label className="block font-bold text-slate-700 mb-1">Home / Business Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Model Town, Block C, Lahore"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Opening Credit Receivable Balance ({storeSettings.currency}):</label>
                <input
                  type="number"
                  value={balanceReceivable === 0 ? '' : balanceReceivable}
                  onChange={(e) => setBalanceReceivable(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5000 (Set positive if customer owes you money)"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Keep it 0 for new accounts. Set a positive balance if this customer is carrying outstanding debt from prior logs.
                </p>
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
                  className="bg-[#0078d7] hover:bg-[#0066b8] text-white px-5 py-1.5 font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCustomer ? 'Update Profile' : 'Save Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Book Payment/Debit Modal */}
      {showLedgerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800">
            <div className={`text-white p-3.5 flex items-center justify-between ${ledgerActionType === 'RECEIVE' ? 'bg-[#0f5132]' : 'bg-[#842029]'}`}>
              <span className="font-bold text-xs uppercase tracking-wider">
                {ledgerActionType === 'RECEIVE' ? '💸 Receive Payment (Vsoli)' : '⚠️ Charge Credit account'}
              </span>
              <button onClick={() => setShowLedgerModal(false)} className="text-white hover:opacity-85">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordLedger} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="font-bold text-slate-700">{selectedCustomer.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Current Credit/Khata Balance:</div>
                <div className={`text-base font-extrabold font-mono mt-0.5 ${selectedCustomer.balanceReceivable > 0 ? 'text-red-700' : 'text-slate-900'}`}>
                  {storeSettings.currency} {selectedCustomer.balanceReceivable.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {ledgerActionType === 'RECEIVE' ? 'Cash Amount Received *:' : 'New Credit Amount Charged *:'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={ledgerAmount === 0 ? '' : ledgerAmount}
                  onChange={(e) => setLedgerAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 1500"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-extrabold font-mono text-sm focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ref / Invoice / Ledger Notes:</label>
                <input
                  type="text"
                  value={ledgerNotes}
                  onChange={(e) => setLedgerNotes(e.target.value)}
                  placeholder="e.g. Invoice #102 or Partial Cash paid"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`text-white px-5 py-1.5 font-bold flex items-center gap-1.5 shadow ${
                    ledgerActionType === 'RECEIVE' ? 'bg-[#198754] hover:bg-[#157347]' : 'bg-[#dc3545] hover:bg-[#bb2d3b]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{ledgerActionType === 'RECEIVE' ? 'Record Cash Received' : 'Record Credit Debt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
