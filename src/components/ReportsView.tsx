import React, { useState } from 'react';
import { BarChart3, TrendingUp, Box, Receipt, Wallet, Play, Download, Layers } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const ReportsView: React.FC = () => {
  const { sales, purchases, expenses, products, storeSettings } = usePOS();

  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'stock' | 'profit'>('sales');
  const [fromDate, setFromDate] = useState('2026-07-14');
  const [toDate, setToDate] = useState('2026-08-14');

  const filteredSales = sales.filter((s) => {
    const saleDate = s.date.slice(0, 10);
    return (!fromDate || saleDate >= fromDate) && (!toDate || saleDate <= toDate);
  });

  const totalSalesFiltered = filteredSales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalPurchasesFiltered = purchases
    .filter((p) => {
      const purDate = p.date.slice(0, 10);
      return (!fromDate || purDate >= fromDate) && (!toDate || purDate <= toDate);
    })
    .reduce((acc, p) => acc + p.totalCost, 0);

  const totalExpensesFiltered = expenses
    .filter((e) => {
      const expDate = e.date.slice(0, 10);
      return (!fromDate || expDate >= fromDate) && (!toDate || expDate <= toDate);
    })
    .reduce((acc, e) => acc + e.amount, 0);

  const totalProfitFiltered = Math.max(0, totalSalesFiltered - totalExpensesFiltered);

  // Total inventory retail & purchase valuation
  const inventoryPurchaseValuation = products.reduce((acc, p) => acc + p.purchasePrice * p.stock, 0);
  const inventoryRetailValuation = products.reduce((acc, p) => acc + p.retailPrice * p.stock, 0);
  const potentialInventoryProfit = Math.max(0, inventoryRetailValuation - inventoryPurchaseValuation);

  return (
    <div id="reports-view-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-5">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-none transition-all ${
            activeReportTab === 'sales'
              ? 'bg-[#002b49] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Sales Summary</span>
        </button>

        <button
          onClick={() => setActiveReportTab('stock')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-none transition-all ${
            activeReportTab === 'stock'
              ? 'bg-[#002b49] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Product Stock</span>
        </button>
      </div>

      {/* Date Filter Bar matching Image 11 */}
      <div className="bg-white border border-slate-200 p-3 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
          />
        </div>

        <button
          type="button"
          className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-1.5 px-4 text-xs flex items-center gap-1.5 shadow transition-colors active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Report</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards matching Image 11 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-[#0088cc] text-white p-4 rounded-none shadow-sm flex flex-col justify-between h-24">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 opacity-90" />
            <span>Total Sales</span>
          </div>
          <div className="text-lg font-bold">
            {storeSettings.currency} {totalSalesFiltered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Purchases */}
        <div className="bg-[#27ae60] text-white p-4 rounded-none shadow-sm flex flex-col justify-between h-24">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Box className="w-4 h-4 opacity-90" />
            <span>Purchases</span>
          </div>
          <div className="text-lg font-bold">
            {storeSettings.currency} {totalPurchasesFiltered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-[#c0392b] text-white p-4 rounded-none shadow-sm flex flex-col justify-between h-24">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Receipt className="w-4 h-4 opacity-90" />
            <span>Expenses</span>
          </div>
          <div className="text-lg font-bold">
            {storeSettings.currency} {totalExpensesFiltered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Profit */}
        <div className="bg-[#8e44ad] text-white p-4 rounded-none shadow-sm flex flex-col justify-between h-24">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Wallet className="w-4 h-4 opacity-90" />
            <span>Profit</span>
          </div>
          <div className="text-lg font-bold">
            {storeSettings.currency} {totalProfitFiltered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Main Report Table */}
      {activeReportTab === 'sales' ? (
        <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Invoice#</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Net Amount</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Discount</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No sales data available in the selected period.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        idx === 0
                          ? 'bg-[#0078d7] text-white font-medium hover:bg-[#006bbd]'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-3">{s.invoiceNo}</td>
                      <td className="py-2.5 px-3">{s.date}</td>
                      <td className="py-2.5 px-3">{s.customerName}</td>
                      <td className="py-2.5 px-3">{s.saleType}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {storeSettings.currency}{' '}
                        {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {s.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {storeSettings.currency}{' '}
                        {s.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Purchase Stock Value:</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {storeSettings.currency} {inventoryPurchaseValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Retail Stock Value:</div>
              <div className="text-lg font-bold text-[#0070ba] mt-1">
                {storeSettings.currency} {inventoryRetailValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Potential Gross Margin:</div>
              <div className="text-lg font-bold text-[#28a745] mt-1">
                {storeSettings.currency} {potentialInventoryProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3">Barcode</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">In Stock</th>
                  <th className="py-2.5 px-3 text-right">Cost Price</th>
                  <th className="py-2.5 px-3 text-right">Retail Price</th>
                  <th className="py-2.5 px-3 text-right">Total Inventory Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 text-slate-700">
                    <td className="py-2.5 px-3 font-mono">{p.barcode}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3">{p.category}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{p.stock}</td>
                    <td className="py-2.5 px-3 text-right">{p.purchasePrice}</td>
                    <td className="py-2.5 px-3 text-right">{p.retailPrice}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#0070ba]">
                      {storeSettings.currency} {(p.purchasePrice * p.stock).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
