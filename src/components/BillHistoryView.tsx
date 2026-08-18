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
    <div id="bill-history-container" className="p-4 sm:p-6 bg-[#f4f7fa] min-h-full space-y-4 max-w-7xl mx-auto pb-10">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <label className="text-xs font-bold text-slate-700 shrink-0">Search:</label>
          <input
            id="bill-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Customer name, invoice#, product..."
            className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        {/* Date From */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 shrink-0">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 shrink-0">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        {/* Export CSV */}
        <button
          type="button"
          onClick={exportToCSV}
          className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Bill Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Invoice#</th>
                <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                <th className="py-2.5 px-3 font-semibold text-right">Discount</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net Amount</th>
                <th className="py-2.5 px-3 font-semibold text-right">Paid</th>
                <th className="py-2.5 px-3 font-semibold text-center">Print Thermal</th>
                <th className="py-2.5 px-3 font-semibold text-center">Edit / Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No matching sale invoices found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold font-mono text-slate-900">#{s.invoiceNo}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{s.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.customerName}</td>
                      <td className="py-2.5 px-3">{s.saleType}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {storeSettings.currency}{' '}
                        {s.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-red-600">
                        {storeSettings.currency}{' '}
                        {s.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {storeSettings.currency}{' '}
                        {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {storeSettings.currency}{' '}
                        {s.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setThermalPaperSize('80mm');
                              setPreviewInvoice(s);
                            }}
                            className="bg-blue-50 text-[#0070ba] border border-blue-200 hover:bg-blue-100 px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer"
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
                            className="bg-cyan-50 text-[#17a2b8] border border-cyan-200 hover:bg-cyan-100 px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                            title="Print 58mm Mini Thermal Receipt"
                          >
                            58mm
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <button
                            onClick={() => setEditingSale(s)}
                            className="p-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Invoice"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete Invoice #${s.invoiceNo}?`)) {
                                deleteSale(s.id);
                              }
                            }}
                            className="p-1 text-slate-600 hover:text-red-600 rounded hover:bg-slate-100"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                ✏️ Edit Invoice #{editingSale.invoiceNo}
              </span>
              <button onClick={() => setEditingSale(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSale(editingSale);
                setEditingSale(null);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name:</label>
                <input
                  type="text"
                  value={editingSale.customerName}
                  onChange={(e) => setEditingSale({ ...editingSale, customerName: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale Date & Time:</label>
                  <input
                    type="text"
                    value={editingSale.date}
                    onChange={(e) => setEditingSale({ ...editingSale, date: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale Mode / Type:</label>
                  <select
                    value={editingSale.saleType}
                    onChange={(e) => setEditingSale({ ...editingSale, saleType: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Net Amount ({storeSettings.currency}):</label>
                  <input
                    type="number"
                    step="any"
                    value={editingSale.netAmount}
                    onChange={(e) => setEditingSale({ ...editingSale, netAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Amount:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingSale.discountAmount}
                    onChange={(e) => setEditingSale({ ...editingSale, discountAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid Amount:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingSale.paidAmount}
                    onChange={(e) => setEditingSale({ ...editingSale, paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono text-emerald-800 font-bold focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#002b49] hover:bg-[#001f35] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
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
