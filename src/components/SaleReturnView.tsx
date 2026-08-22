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
    <div id="sale-return-container" className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Customer Sale Returns & Restocking
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Enter barcodes to process items returned by customers, automatically calculate refunds, and safely restock medicine units.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Return Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
            <span>🔄 Process Return Details</span>
          </div>

          {message && (
            <div
              className={`p-4 border text-xs font-semibold rounded-2xl flex items-start gap-2.5 animate-in fade-in duration-150 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
                  : 'bg-rose-50 border-rose-150 text-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleProcessReturn} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Medicine / Product Barcode</label>
              <input
                id="return-barcode-input"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or enter barcode..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Return Quantity
              </label>
              <input
                id="return-qty-input"
                type="number"
                min="1"
                value={returnQty}
                onChange={(e) => setReturnQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <button
              id="btn-process-return"
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-100 transition-all active:scale-95 uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Process Return & Restock</span>
            </button>
          </form>
        </div>

        {/* Return History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
              <History className="w-4 h-4 text-blue-600" />
              <span>Recent Return History Log</span>
            </div>
            <div className="text-xs text-slate-500 font-bold bg-white border border-slate-200 px-3 py-1 rounded-xl">
              Total Returns: <span className="text-rose-600 font-black">{returns.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-black">Date</th>
                  <th className="py-3 px-4 font-black">Barcode</th>
                  <th className="py-3 px-4 font-black">Product Name</th>
                  <th className="py-3 px-4 text-center font-black">Returned Qty</th>
                  <th className="py-3 px-4 text-right font-black">Refund Amount</th>
                  <th className="py-3 px-4 text-center font-black">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {returns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">
                      No returns processed yet.
                    </td>
                  </tr>
                ) : (
                  returns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{r.date}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{r.barcode}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{r.itemName}</td>
                      <td className="py-3 px-4 text-center font-black text-rose-600 bg-rose-50/20">{r.qty}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        {storeSettings.currency}{' '}
                        {r.refundAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingReturn(r)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
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
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all"
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
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-800 rounded-3xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">
                ✏️ Edit Return Record ({editingReturn.itemName})
              </span>
              <button onClick={() => setEditingReturn(null)} className="text-slate-400 hover:text-slate-950 p-1 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateReturn(editingReturn);
                setEditingReturn(null);
              }}
              className="p-6 space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Item Name:</label>
                <input
                  type="text"
                  value={editingReturn.itemName}
                  onChange={(e) => setEditingReturn({ ...editingReturn, itemName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Returned Qty:</label>
                  <input
                    type="number"
                    value={editingReturn.qty}
                    onChange={(e) => setEditingReturn({ ...editingReturn, qty: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Refund Amount ({storeSettings.currency}):</label>
                  <input
                    type="number"
                    step="any"
                    value={editingReturn.refundAmount}
                    onChange={(e) => setEditingReturn({ ...editingReturn, refundAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-mono font-bold text-rose-600 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Reason for Return:</label>
                <input
                  type="text"
                  value={editingReturn.reason}
                  onChange={(e) => setEditingReturn({ ...editingReturn, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReturn(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
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
