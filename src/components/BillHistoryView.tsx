import React, { useState } from 'react';
import { Search, Printer, RotateCcw, Calendar, FileText, Download } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { SaleInvoice } from '../types';

export const BillHistoryView: React.FC = () => {
  const { sales, setPreviewInvoice, storeSettings, thermalPaperSize, setThermalPaperSize } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('2026-07-14');
  const [toDate, setToDate] = useState('2026-08-14');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const filteredSales = sales.filter((s) => {
    const matchSearch =
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.invoiceNo.toString().includes(searchTerm) ||
      s.saleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Date check (if sale date contains YYYY-MM-DD)
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
    <div id="bill-history-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-4">
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

        {/* Search Button */}
        <button
          type="button"
          className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-1.5 px-4 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-[0.98]"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>

        {/* Export CSV */}
        <button
          type="button"
          onClick={exportToCSV}
          className="bg-[#28a745] hover:bg-[#218838] text-white font-semibold py-1.5 px-3 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* Bill Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002b49] text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Invoice#</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                <th className="py-2.5 px-3 font-semibold text-right">Discount</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net</th>
                <th className="py-2.5 px-3 font-semibold text-right">Paid</th>
                <th className="py-2.5 px-3 font-semibold text-right">Change</th>
                <th className="py-2.5 px-3 font-semibold text-center">Receipt</th>
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
                filteredSales.map((s, idx) => {
                  const isSelected = selectedInvoiceId === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedInvoiceId(s.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected || idx === 0
                          ? 'bg-[#0078d7] text-white font-medium hover:bg-[#006bbd]'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold">{s.invoiceNo}</td>
                      <td className="py-2.5 px-3">{s.date}</td>
                      <td className="py-2.5 px-3">{s.customerName}</td>
                      <td className="py-2.5 px-3">{s.saleType}</td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {s.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {s.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {storeSettings.currency}{' '}
                        {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {s.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {s.changeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setThermalPaperSize('80mm');
                              setPreviewInvoice(s);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-transform hover:scale-105 ${
                              isSelected || idx === 0
                                ? 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                                : 'bg-blue-50 text-[#0070ba] border-blue-200 hover:bg-blue-100'
                            }`}
                            title="Print 80mm Thermal Receipt"
                          >
                            80mm
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setThermalPaperSize('58mm');
                              setPreviewInvoice(s);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-transform hover:scale-105 ${
                              isSelected || idx === 0
                                ? 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                                : 'bg-cyan-50 text-[#17a2b8] border-cyan-200 hover:bg-cyan-100'
                            }`}
                            title="Print 58mm Mini Thermal Receipt"
                          >
                            58mm
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
    </div>
  );
};
