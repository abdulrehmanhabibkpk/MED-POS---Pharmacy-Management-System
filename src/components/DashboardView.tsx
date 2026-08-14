import React from 'react';
import {
  ShoppingCart,
  Box,
  Receipt,
  Wallet,
  Tag,
  AlertTriangle,
  Plus,
  CalendarCheck,
  CheckSquare,
  TrendingUp,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const DashboardView: React.FC = () => {
  const {
    sales,
    purchases,
    expenses,
    credits,
    products,
    setActiveTab,
    setPreviewInvoice,
    storeSettings,
  } = usePOS();

  // Calculations
  const totalSalesAmount = sales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalBillsCount = sales.length;
  const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalCost, 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalCreditsAmount = credits.reduce((acc, c) => acc + c.amountReceived, 0);

  const totalProductItems = products.length;
  const totalProductUnits = products.reduce((acc, p) => acc + p.stock, 0);

  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);
  const lowStockCount = lowStockProducts.length;

  const recentSales = [...sales].slice(0, 10);

  return (
    <div id="dashboard-container" className="p-6 space-y-6 bg-[#f4f7fa] min-h-full">
      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Sales */}
        <div
          id="kpi-total-sales"
          onClick={() => setActiveTab('bill-history')}
          className="bg-[#0088cc] hover:bg-[#0077b5] cursor-pointer text-white p-4 rounded-none shadow-sm transition-transform active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 opacity-90" />
            <span className="text-xs font-semibold tracking-wide">Total Sales</span>
          </div>
          <div>
            <div className="text-lg font-bold">
              {storeSettings.currency} {totalSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] opacity-90">({totalBillsCount} Bills)</div>
          </div>
        </div>

        {/* Card 2: Total Purchases */}
        <div
          id="kpi-total-purchases"
          onClick={() => setActiveTab('purchase-stock')}
          className="bg-[#27ae60] hover:bg-[#219653] cursor-pointer text-white p-4 rounded-none shadow-sm transition-transform active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 opacity-90" />
            <span className="text-xs font-semibold tracking-wide">Total Purchases</span>
          </div>
          <div>
            <div className="text-lg font-bold">
              {storeSettings.currency} {totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] opacity-90">&nbsp;</div>
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div
          id="kpi-total-expenses"
          onClick={() => setActiveTab('pay-expense')}
          className="bg-[#c0392b] hover:bg-[#a93226] cursor-pointer text-white p-4 rounded-none shadow-sm transition-transform active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 opacity-90" />
            <span className="text-xs font-semibold tracking-wide">Total Expenses</span>
          </div>
          <div>
            <div className="text-lg font-bold">
              {storeSettings.currency} {totalExpensesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] opacity-90">&nbsp;</div>
          </div>
        </div>

        {/* Card 4: Credit Received */}
        <div
          id="kpi-credit-received"
          onClick={() => setActiveTab('credit-receive')}
          className="bg-[#8e44ad] hover:bg-[#7d3c98] cursor-pointer text-white p-4 rounded-none shadow-sm transition-transform active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 opacity-90" />
            <span className="text-xs font-semibold tracking-wide">Credit Received</span>
          </div>
          <div>
            <div className="text-lg font-bold">
              {storeSettings.currency} {totalCreditsAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] opacity-90">&nbsp;</div>
          </div>
        </div>

        {/* Card 5: Products */}
        <div
          id="kpi-products"
          onClick={() => setActiveTab('products')}
          className="bg-[#16a085] hover:bg-[#138d75] cursor-pointer text-white p-4 rounded-none shadow-sm transition-transform active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 opacity-90" />
            <span className="text-xs font-semibold tracking-wide">Products</span>
          </div>
          <div>
            <div className="text-lg font-bold">
              {totalProductItems} Items
            </div>
            <div className="text-[11px] opacity-90">• {totalProductUnits} Units</div>
          </div>
        </div>

        {/* Card 6: Low Stock Items */}
        <div
          id="kpi-low-stock"
          onClick={() => setActiveTab('products')}
          className="bg-[#d35400] hover:bg-[#ba4a00] cursor-pointer text-white p-4 rounded-none shadow-sm transition-transform active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 opacity-90" />
            <span className="text-xs font-semibold tracking-wide">Low Stock Items</span>
          </div>
          <div>
            <div className="text-lg font-bold">
              {lowStockCount} Products
            </div>
            <div className="text-[11px] opacity-90">&nbsp;</div>
          </div>
        </div>
      </div>

      {/* Middle Split: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Sales Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3 border-b border-slate-200 flex items-center gap-2">
            <span className="text-[#002b49] font-bold text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#0070ba]" />
              Recent Sales (Last 10)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Invoice#</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentSales.map((s, idx) => (
                    <tr
                      key={s.id}
                      onClick={() => setPreviewInvoice(s)}
                      className={`cursor-pointer transition-colors ${
                        idx === 0 ? 'bg-[#0078d7] text-white font-medium hover:bg-[#006bbd]' : 'hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-3">{s.invoiceNo}</td>
                      <td className="py-2.5 px-3">{s.date}</td>
                      <td className="py-2.5 px-3">{s.customerName}</td>
                      <td className="py-2.5 px-3">{s.saleType}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {storeSettings.currency} {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3 border-b border-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#d35400]" />
            <span className="text-[#c0392b] font-bold text-sm">Low Stock Alerts</span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-start overflow-y-auto max-h-64">
            {lowStockProducts.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-700 text-xs py-2">
                <CheckSquare className="w-4 h-4 text-slate-600" />
                <span>All products have sufficient stock!</span>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-amber-900">{p.name}</div>
                      <div className="text-slate-500 text-[10px]">
                        Barcode: {p.barcode} • Alert below: {p.minStockAlert}
                      </div>
                    </div>
                    <span className="font-bold text-red-600 px-2 py-1 bg-red-100 rounded text-[11px]">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div>
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#0070ba]" />
          <span>Quick Actions</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            id="btn-quick-new-sale"
            onClick={() => setActiveTab('sale-invoice')}
            className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-2.5 px-4 rounded-none shadow-sm flex items-center justify-center gap-2 text-xs transition-colors active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Sale Invoice</span>
          </button>

          <button
            id="btn-quick-purchase"
            onClick={() => setActiveTab('purchase-stock')}
            className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-2.5 px-4 rounded-none shadow-sm flex items-center justify-center gap-2 text-xs transition-colors active:scale-[0.99]"
          >
            <Box className="w-4 h-4" />
            <span>Add Purchase</span>
          </button>

          <button
            id="btn-quick-product"
            onClick={() => setActiveTab('products')}
            className="bg-[#8e44ad] hover:bg-[#7d3c98] text-white font-bold py-2.5 px-4 rounded-none shadow-sm flex items-center justify-center gap-2 text-xs transition-colors active:scale-[0.99]"
          >
            <Tag className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            id="btn-quick-day-closing"
            onClick={() => setActiveTab('day-closing')}
            className="bg-[#17a2b8] hover:bg-[#138496] text-white font-bold py-2.5 px-4 rounded-none shadow-sm flex items-center justify-center gap-2 text-xs transition-colors active:scale-[0.99]"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Day Closing</span>
          </button>
        </div>
      </div>

      {/* SALES OVERVIEW TREND Chart (Exact visual styling as screenshot) */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs">
        <div className="text-xs font-bold text-[#002b49] uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0078d7]" />
          <span>SALES OVERVIEW TREND</span>
        </div>

        <div className="h-44 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 800 150" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="30" x2="800" y2="30" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="70" x2="800" y2="70" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="110" x2="800" y2="110" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="140" x2="800" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Sales Trend Line */}
            <path
              d="M 60,130 Q 180,105 200,105 T 340,65 T 480,50 T 620,30"
              fill="none"
              stroke="#0088cc"
              strokeWidth="3.5"
            />

            {/* Nodes */}
            <circle cx="60" cy="130" r="5" fill="#ffffff" stroke="#0088cc" strokeWidth="3" />
            <circle cx="200" cy="105" r="5" fill="#ffffff" stroke="#0088cc" strokeWidth="3" />
            <circle cx="340" cy="65" r="5" fill="#ffffff" stroke="#0088cc" strokeWidth="3" />
            <circle cx="480" cy="50" r="5" fill="#ffffff" stroke="#0088cc" strokeWidth="3" />
            <circle cx="620" cy="30" r="5" fill="#ffffff" stroke="#0088cc" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </div>
  );
};
