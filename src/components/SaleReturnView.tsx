import React, { useState } from 'react';
import { RotateCcw, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const SaleReturnView: React.FC = () => {
  const { products, addReturn, returns, storeSettings } = usePOS();

  const [barcode, setBarcode] = useState('');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      setMessage({ type: 'error', text: 'Please enter a product barcode.' });
      return;
    }

    const product = products.find(
      (p) => p.barcode.trim().toLowerCase() === barcode.trim().toLowerCase()
    );

    if (!product) {
      setMessage({
        type: 'error',
        text: `Product with barcode "${barcode}" not found in system records.`,
      });
      return;
    }

    if (returnQty <= 0) {
      setMessage({ type: 'error', text: 'Return quantity must be at least 1.' });
      return;
    }

    const refundAmount = product.retailPrice * returnQty;

    addReturn({
      barcode: product.barcode,
      productName: product.name,
      qty: returnQty,
      refundAmount,
      reason: 'Customer return / refund',
    });

    setMessage({
      type: 'success',
      text: `Successfully returned ${returnQty}x "${product.name}". ${storeSettings.currency} ${refundAmount.toFixed(2)} refunded and stock replenished to ${product.stock + returnQty} units.`,
    });

    setBarcode('');
    setReturnQty(1);
  };

  return (
    <div id="sale-return-container" className="p-3 md:p-6 bg-[#f4f7fa] min-h-full space-y-4 md:space-y-6">
      {/* Return Card */}
      <div className="bg-white border border-slate-200 p-6 shadow-xs max-w-xl">
        <div className="flex items-center gap-2 text-[#c0392b] font-bold text-base mb-6">
          <RotateCcw className="w-5 h-5 text-[#c0392b]" />
          <span>Process Sale Return</span>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 border text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleProcessReturn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode:</label>
            <input
              id="return-barcode-input"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter product barcode..."
              className="w-full bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#c0392b]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Return Quantity:
            </label>
            <input
              id="return-qty-input"
              type="number"
              min="1"
              value={returnQty}
              onChange={(e) => setReturnQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full max-w-xs bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#c0392b]"
            />
          </div>

          <button
            id="btn-process-return"
            type="submit"
            className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold py-2 px-6 text-xs flex items-center gap-2 shadow transition-colors active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Process Return</span>
          </button>
        </form>
      </div>

      {/* Return History Table */}
      <div className="bg-white border border-slate-200 shadow-xs max-w-4xl">
        <div className="p-3 border-b border-slate-200 flex items-center gap-2 text-slate-800 font-bold text-xs">
          <History className="w-4 h-4 text-[#0070ba]" />
          <span>Recent Return History</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Barcode</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-center">Returned Qty</th>
                <th className="py-2.5 px-3 text-right">Refund Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No returns processed yet.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 text-slate-700">
                    <td className="py-2.5 px-3">{r.date}</td>
                    <td className="py-2.5 px-3 font-mono">{r.barcode}</td>
                    <td className="py-2.5 px-3 font-medium">{r.productName}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-red-600">{r.qty}</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {storeSettings.currency}{' '}
                      {r.refundAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
