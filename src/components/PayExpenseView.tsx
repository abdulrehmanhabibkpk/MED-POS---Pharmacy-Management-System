import React, { useState } from 'react';
import { Receipt, Plus, Trash2, CheckCircle2, Edit2, Check, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ExpenseRecord } from '../types';

export const PayExpenseView: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, storeSettings } = usePOS();

  const [category, setCategory] = useState('Electricity');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [recordedBy, setRecordedBy] = useState('Admin');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit State
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    addExpense({
      category,
      amount,
      description: description.trim() || 'General daily expense',
      recordedBy: recordedBy.trim() || 'Admin',
    });

    setSuccessMsg(`Expense of ${storeSettings.currency} ${amount.toFixed(2)} recorded under "${category}".`);
    setTimeout(() => setSuccessMsg(''), 4000);

    setAmount(0);
    setDescription('');
  };

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div id="pay-expense-container" className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Upper header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Daily Expense Registry & Petty Cash
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Log daily utility bills, tea, transportation, packaging, salaries, and store rent payments to calculate accurate end-of-day net profit.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add Daily Expense (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
            <span>➕ Record New Expense</span>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveExpense} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              >
                <option value="Electricity">Electricity Bill</option>
                <option value="Store Rent">Store Rent</option>
                <option value="Staff Salary">Staff Salary / Wages</option>
                <option value="Tea & Refreshment">Tea & Refreshment</option>
                <option value="Cleaning & Maintenance">Cleaning & Maintenance</option>
                <option value="Transportation / Delivery">Transportation / Delivery</option>
                <option value="Packaging Bags & Stationery">Packaging Bags & Stationery</option>
                <option value="Software & Internet">Software & Internet</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Expense Amount ({storeSettings.currency}) *
              </label>
              <input
                id="expense-amount-input"
                type="number"
                min="1"
                step="any"
                value={amount === 0 ? '' : amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Description / Remarks
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter details about this expense payment..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Recorded By
              </label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <button
              id="btn-save-expense"
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-100 transition-all active:scale-95 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </form>
        </div>

        {/* Right Table: Expense History (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-rose-600" />
              <span>Expense ledger history log</span>
            </div>
            <div className="text-xs text-slate-500 font-bold bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl font-mono">
              Total Expenses:{' '}
              <span className="text-rose-600 font-black">
                {storeSettings.currency} {totalExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-black">Date</th>
                  <th className="py-3 px-4 font-black">Category</th>
                  <th className="py-3 px-4 font-black">Description</th>
                  <th className="py-3 px-4 text-right font-black">Amount</th>
                  <th className="py-3 px-4 font-black">Recorded By</th>
                  <th className="py-3 px-4 text-center font-black">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">
                      No expense records logged yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{e.date}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl font-black text-[10px] border border-slate-200 uppercase tracking-wider">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{e.description}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-rose-600 bg-rose-50/20">
                        {storeSettings.currency}{' '}
                        {e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{e.recordedBy}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingExpense(e)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete expense "${e.category}" (${e.amount})?`)) {
                                deleteExpense(e.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Expense Record Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-800 rounded-3xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">
                ✏️ Edit Expense Voucher
              </span>
              <button onClick={() => setEditingExpense(null)} className="text-slate-400 hover:text-slate-950 p-1 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateExpense(editingExpense);
                setEditingExpense(null);
              }}
              className="p-6 space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Expense Category:</label>
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                >
                  <option value="Electricity">Electricity Bill</option>
                  <option value="Store Rent">Store Rent</option>
                  <option value="Staff Salary">Staff Salary / Wages</option>
                  <option value="Tea & Refreshment">Tea & Refreshment</option>
                  <option value="Cleaning & Maintenance">Cleaning & Maintenance</option>
                  <option value="Transportation / Delivery">Transportation / Delivery</option>
                  <option value="Packaging Bags & Stationery">Packaging Bags & Stationery</option>
                  <option value="Software & Internet">Software & Internet</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Expense Amount ({storeSettings.currency}):</label>
                <input
                  type="number"
                  step="any"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-rose-600 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Description / Notes:</label>
                <input
                  type="text"
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Recorded By:</label>
                <input
                  type="text"
                  value={editingExpense.recordedBy}
                  onChange={(e) => setEditingExpense({ ...editingExpense, recordedBy: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
