import React, { useState } from 'react';
import { RotateCcw, AlertCircle, CheckCircle2, History, Edit2, Trash2, Check, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { SaleReturn } from '../types';

export const SaleReturnView: React.FC = () => {
  const { products, addReturn, updateReturn, deleteReturn, returns, storeSettings } = usePOS();

  const [barcode, setBarcode] = useState('');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit State
  const [editingReturn, setEditingReturn] = useState<SaleReturn | null>(null);

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
      itemName: product.name,
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
    <div id="sale-return-container" className="p-4 sm:p-6 bg-[#f4f7fa] min-h-full space-y-6 max-w-7xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Return Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-[#c0392b] font-bold text-sm mb-5 border-b border-slate-100 pb-3">
            <RotateCcw className="w-5 h-5 text-[#c0392b]" />
            <span>Process Customer Sale Return</span>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine / Product Barcode:</label>
              <input
                id="return-barcode-input"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or enter barcode..."
                className="w-full bg-white border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#c0392b]"
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
                className="w-full bg-white border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#c0392b]"
              />
            </div>

            <button
              id="btn-process-return"
              type="submit"
              className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold py-2 px-6 text-xs flex items-center gap-2 shadow transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Process Return & Restock</span>
            </button>
          </form>
        </div>

        {/* Return History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <History className="w-4 h-4 text-[#0070ba]" />
              <span>Recent Return History</span>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Total Returns: <strong className="text-red-600">{returns.length}</strong>
            </div>
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
                  <th className="py-2.5 px-3 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No returns processed yet.
                    </td>
                  </tr>
                ) : (
                  returns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 text-slate-700 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{r.date}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{r.barcode}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{r.itemName}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-600">{r.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                        {storeSettings.currency}{' '}
                        {r.refundAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingReturn(r)}
                            className="p-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Return"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete return record for "${r.itemName}"?`)) {
                                deleteReturn(r.id);
                              }
                            }}
                            className="p-1 text-slate-600 hover:text-red-600 rounded hover:bg-slate-100"
                            title="Delete Return"
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

      {/* Edit Return Modal */}
      {editingReturn && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                ✏️ Edit Return Record ({editingReturn.itemName})
              </span>
              <button onClick={() => setEditingReturn(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateReturn(editingReturn);
                setEditingReturn(null);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name:</label>
                <input
                  type="text"
                  value={editingReturn.itemName}
                  onChange={(e) => setEditingReturn({ ...editingReturn, itemName: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Returned Qty:</label>
                  <input
                    type="number"
                    value={editingReturn.qty}
                    onChange={(e) => setEditingReturn({ ...editingReturn, qty: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Refund Amount ({storeSettings.currency}):</label>
                  <input
                    type="number"
                    step="any"
                    value={editingReturn.refundAmount}
                    onChange={(e) => setEditingReturn({ ...editingReturn, refundAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold text-red-600 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Return:</label>
                <input
                  type="text"
                  value={editingReturn.reason}
                  onChange={(e) => setEditingReturn({ ...editingReturn, reason: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingReturn(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#002b49] hover:bg-[#001f35] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Return</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
