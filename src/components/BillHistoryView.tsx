import React, { useState } from 'react';
import { Search, Printer, RotateCcw, Calendar, FileText, Download, Edit2, Trash2, Check, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { SaleInvoice } from '../types';

export const BillHistoryView: React.FC = () => {
  const { sales, updateSale, deleteSale, setPreviewInvoice, storeSettings, setThermalPaperSize } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Edit Invoice State
  const [editingSale, setEditingSale] = useState<SaleInvoice | null>(null);

  const filteredSales = sales.filter((s) => {
    const matchSearch =
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.invoiceNo.toString().includes(searchTerm) ||
      s.saleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const saleDate = s.date.slice(0, 10);
    const matchDate = (!fromDate || saleDate >= fromDate) && (!toDate || saleDate <= toDate);

    return matchSearch && (matchDate || !fromDate || !toDate);
  });

  const exportToCSV = () => {
    if (filteredSales.length === 0) return;
    const headers = ['Invoice#', 'Date', 'Customer', 'Type', 'Total', 'Discount', 'Net Amount', 'Paid', 'Change'];
    const rows = filteredSales.map((s) => [
      s.invoiceNo,
      `"${s.date}"`,
      `"${s.customerName}"`,
      s.saleType,
      s.totalAmount,
      s.discountAmount,
      s.netAmount,
      s.paidAmount,
      s.changeAmount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bill_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="bill-history-container" className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider shrink-0">Search:</span>
          <div className="relative flex-1">
            <input
              id="bill-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Customer name, invoice#, product..."
              className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-600 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-800 transition-all focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Date From */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider shrink-0">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none transition-all"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider shrink-0">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none transition-all"
          />
        </div>

        {/* Export CSV */}
        <button
          type="button"
          onClick={exportToCSV}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 px-4 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-3xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Bill Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-black">Invoice#</th>
                <th className="py-3 px-4 font-black">Date & Time</th>
                <th className="py-3 px-4 font-black">Customer</th>
                <th className="py-3 px-4 font-black">Type</th>
                <th className="py-3 px-4 font-black text-right">Total</th>
                <th className="py-3 px-4 font-black text-right">Discount</th>
                <th className="py-3 px-4 font-black text-right">Net Amount</th>
                <th className="py-3 px-4 font-black text-right">Paid Status</th>
                <th className="py-3 px-4 font-black text-center">Print Thermal</th>
                <th className="py-3 px-4 font-black text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                    No matching sale invoices found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/50 text-slate-700 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-black text-blue-600">Inv #{s.invoiceNo}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 font-semibold">{s.date}</td>
                      <td className="py-3.5 px-4 font-black text-slate-800">{s.customerName}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide text-[10px]">
                          {s.saleType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold">
                        {storeSettings.currency}{' '}
                        {s.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-semibold">
                        {storeSettings.currency}{' '}
                        {s.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        {storeSettings.currency}{' '}
                        {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 inline-block">
                          {storeSettings.currency}{' '}
                          {s.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setThermalPaperSize('80mm');
                              setPreviewInvoice(s);
                            }}
                            className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer active:scale-95 transition-all"
                            title="Print 80mm Standard Thermal Receipt"
                          >
                            80mm
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setThermalPaperSize('58mm');
                              setPreviewInvoice(s);
                            }}
                            className="bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer active:scale-95 transition-all"
                            title="Print 58mm Mini Thermal Receipt"
                          >
                            58mm
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <button
                            onClick={() => setEditingSale(s)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete Invoice #${s.invoiceNo}?`)) {
                                deleteSale(s.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {editingSale && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800 rounded-3xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">
                ✏️ Edit Invoice #{editingSale.invoiceNo}
              </span>
              <button onClick={() => setEditingSale(null)} className="text-slate-400 hover:text-slate-900 p-1 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSale(editingSale);
                setEditingSale(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Customer Name:</label>
                <input
                  type="text"
                  value={editingSale.customerName}
                  onChange={(e) => setEditingSale({ ...editingSale, customerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Sale Date & Time:</label>
                  <input
                    type="text"
                    value={editingSale.date}
                    onChange={(e) => setEditingSale({ ...editingSale, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Sale Mode / Type:</label>
                  <select
                    value={editingSale.saleType}
                    onChange={(e) => setEditingSale({ ...editingSale, saleType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Net Amount ({storeSettings.currency}):</label>
                  <input
                    type="number"
                    step="any"
                    value={editingSale.netAmount}
                    onChange={(e) => setEditingSale({ ...editingSale, netAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 font-mono font-black focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Discount Amount:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingSale.discountAmount}
                    onChange={(e) => setEditingSale({ ...editingSale, discountAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-600 uppercase tracking-wider mb-2">Paid Amount:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingSale.paidAmount}
                    onChange={(e) => setEditingSale({ ...editingSale, paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-emerald-800 font-mono font-black focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-blue-100 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
