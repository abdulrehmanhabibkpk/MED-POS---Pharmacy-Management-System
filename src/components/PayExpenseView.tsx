import React, { useState } from 'react';
import { Receipt, Plus, Trash2, CheckCircle2, DollarSign } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const PayExpenseView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, storeSettings } = usePOS();

  const [category, setCategory] = useState('Electricity');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [recordedBy, setRecordedBy] = useState('Admin');
  const [successMsg, setSuccessMsg] = useState('');

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
    <div id="pay-expense-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add Daily Expense (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-[#002b49] font-bold text-sm mb-4 border-b border-slate-100 pb-3">
            <Receipt className="w-5 h-5 text-[#c0392b]" />
            <span>Pay Daily Expense</span>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveExpense} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#c0392b]"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense Amount ({storeSettings.currency}) *:
              </label>
              <input
                id="expense-amount-input"
                type="number"
                min="1"
                step="any"
                value={amount === 0 ? '' : amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#c0392b]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Remarks:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter details about this expense payment..."
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#c0392b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recorded By:
              </label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#c0392b]"
              />
            </div>

            <button
              id="btn-save-expense"
              type="submit"
              className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold py-2 px-5 text-xs flex items-center gap-2 shadow transition-colors active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </form>
        </div>

        {/* Right Table: Expense History (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Receipt className="w-4 h-4 text-[#c0392b]" />
              <span>Expense History Log</span>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Total Expenses:{' '}
              <strong className="text-[#c0392b]">
                {storeSettings.currency} {totalExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#c0392b] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Recorded By</th>
                  <th className="py-2.5 px-2 font-semibold text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No expense records logged yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-red-50 text-slate-700">
                      <td className="py-2.5 px-3">{e.date}</td>
                      <td className="py-2.5 px-3 font-semibold">{e.category}</td>
                      <td className="py-2.5 px-3 text-slate-600">{e.description}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#c0392b]">
                        {storeSettings.currency}{' '}
                        {e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{e.recordedBy}</td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => deleteExpense(e.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
