import React, { useState } from 'react';
import { WalletCards, ClipboardList, CheckCircle2 } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const CreditReceiveView: React.FC = () => {
  const { credits, addCredit, storeSettings } = usePOS();

  const [customerName, setCustomerName] = useState('');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter a customer name.');
      return;
    }
    if (amountReceived <= 0) {
      alert('Please enter a valid amount received.');
      return;
    }

    addCredit({
      customerName: customerName.trim(),
      amountReceived,
      notes: notes.trim() || undefined,
    });

    setSuccessMsg(`Payment of ${storeSettings.currency} ${amountReceived.toFixed(2)} recorded for ${customerName}.`);
    setTimeout(() => setSuccessMsg(''), 4000);

    setCustomerName('');
    setAmountReceived(0);
    setNotes('');
  };

  const totalCreditReceived = credits.reduce((acc, c) => acc + c.amountReceived, 0);

  return (
    <div id="credit-receive-container" className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Header banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <WalletCards className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Customer Credit (Khata) Payments
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Record manual cash & online recovery payments received from credit customers to balance their khata account ledgers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Record Credit Payment (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
            <span>➕ Record Credit Recovery</span>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePayment} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Customer Name *
              </label>
              <input
                id="credit-customer-input"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Type customer name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Amount Received ({storeSettings.currency}) *
              </label>
              <input
                id="credit-amount-input"
                type="number"
                min="1"
                step="any"
                value={amountReceived === 0 ? '' : amountReceived}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Notes / Reference
              </label>
              <input
                id="credit-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional payment notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <button
              id="btn-save-credit-payment"
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-purple-100 transition-all active:scale-95 uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Credit Payment</span>
            </button>
          </form>
        </div>

        {/* Right Table: Credit History (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
              <ClipboardList className="w-4 h-4 text-purple-600" />
              <span>Credit payment Ledger Log</span>
            </div>
            <div className="text-xs text-slate-500 font-bold bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl font-mono">
              Total Collections:{' '}
              <span className="text-purple-600 font-black">
                {storeSettings.currency} {totalCreditReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-black">Date</th>
                  <th className="py-3 px-4 font-black">Customer</th>
                  <th className="py-3 px-4 text-right font-black">Amount Received</th>
                  <th className="py-3 px-4 font-black">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {credits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 font-bold">
                      No credit payment records found.
                    </td>
                  </tr>
                ) : (
                  credits.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{c.date}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{c.customerName}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-purple-600 bg-purple-50/20">
                        {storeSettings.currency}{' '}
                        {c.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.notes || '-'}</td>
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
