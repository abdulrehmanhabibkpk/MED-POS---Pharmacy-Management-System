import React, { useState } from 'react';
import { WalletCards, ClipboardList, CheckCircle2, DollarSign } from 'lucide-react';
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
    <div id="credit-receive-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Record Credit Payment (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-[#002b49] font-bold text-sm mb-4 border-b border-slate-100 pb-3">
            <WalletCards className="w-5 h-5 text-[#0070ba]" />
            <span>Record Credit Payment</span>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name:
              </label>
              <input
                id="credit-customer-input"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name..."
                className="w-full bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Received ({storeSettings.currency}):
              </label>
              <input
                id="credit-amount-input"
                type="number"
                min="1"
                step="any"
                value={amountReceived === 0 ? '' : amountReceived}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0070ba]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes:
              </label>
              <input
                id="credit-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
              />
            </div>

            <button
              id="btn-save-credit-payment"
              type="submit"
              className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-2 px-5 text-xs flex items-center gap-2 shadow transition-colors active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Payment</span>
            </button>
          </form>
        </div>

        {/* Right Table: Credit History (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <ClipboardList className="w-4 h-4 text-[#8e44ad]" />
              <span>Credit History</span>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Total Collections:{' '}
              <strong className="text-[#8e44ad]">
                {storeSettings.currency} {totalCreditReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#8e44ad] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount Received</th>
                  <th className="py-2.5 px-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {credits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      No credit payment records found.
                    </td>
                  </tr>
                ) : (
                  credits.map((c) => (
                    <tr key={c.id} className="hover:bg-purple-50 text-slate-700">
                      <td className="py-2.5 px-3">{c.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{c.customerName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#8e44ad]">
                        {storeSettings.currency}{' '}
                        {c.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{c.notes || '-'}</td>
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
