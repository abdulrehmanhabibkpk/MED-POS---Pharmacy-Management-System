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
    <div id="dashboard-container" className="p-4 md:p-8 space-y-6 md:space-y-8 bg-[#F8FAFC] min-h-full pb-20 md:pb-8 font-sans">
      
      {/* 5 Grid KPI Cards + Spanning Low Stock Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {/* Card 1: Total Sales */}
          <div
            id="kpi-total-sales"
            onClick={() => setActiveTab('bill-history')}
            className="bg-white hover:bg-slate-50 cursor-pointer p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-start justify-between min-h-[110px]"
          >
            <div className="space-y-2">
              <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wider block">Total Sales</span>
              <div className="text-xl md:text-2xl font-black text-slate-950">
                {storeSettings.currency} {totalSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md inline-block">
                {totalBillsCount} Bills
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Total Purchases */}
          <div
            id="kpi-total-purchases"
            onClick={() => setActiveTab('purchase-stock')}
            className="bg-white hover:bg-slate-50 cursor-pointer p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-start justify-between min-h-[110px]"
          >
            <div className="space-y-2">
              <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wider block">Total Purchases</span>
              <div className="text-xl md:text-2xl font-black text-slate-950">
                {storeSettings.currency} {totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md inline-block">
                Purchased Inventory
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
              <Box className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div
            id="kpi-total-expenses"
            onClick={() => setActiveTab('pay-expense')}
            className="bg-white hover:bg-slate-50 cursor-pointer p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-start justify-between min-h-[110px]"
          >
            <div className="space-y-2">
              <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wider block">Total Expenses</span>
              <div className="text-xl md:text-2xl font-black text-slate-950">
                {storeSettings.currency} {totalExpensesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md inline-block">
                Store Operations
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Credit Received */}
          <div
            id="kpi-credit-received"
            onClick={() => setActiveTab('credit-receive')}
            className="bg-white hover:bg-slate-50 cursor-pointer p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-start justify-between min-h-[110px]"
          >
            <div className="space-y-2">
              <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wider block">Credit Received</span>
              <div className="text-xl md:text-2xl font-black text-slate-950">
                {storeSettings.currency} {totalCreditsAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md inline-block">
                Accounts Ledger
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Card 5: Products */}
          <div
            id="kpi-products"
            onClick={() => setActiveTab('products')}
            className="bg-white hover:bg-slate-50 cursor-pointer p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-start justify-between min-h-[110px]"
          >
            <div className="space-y-2">
              <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wider block">Products</span>
              <div className="text-xl md:text-2xl font-black text-slate-950">
                {totalProductItems} Items
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md inline-block">
                {totalProductUnits} Units
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-inner">
              <Tag className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Spanning Wide Orange/Amber Banner: Low Stock Items */}
        {lowStockCount > 0 && (
          <div
            id="kpi-low-stock"
            onClick={() => setActiveTab('products')}
            className="bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer text-amber-900 p-4 px-5 rounded-2xl shadow-xs transition-all duration-150 active:scale-[0.99] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
              </div>
              <div>
                <span className="text-xs md:text-sm font-black uppercase tracking-wider block">LOW STOCK ALERT TRIGGERED</span>
                <span className="text-[11px] text-amber-700 font-medium">Some inventory items have dropped below their minimum safe margin levels.</span>
              </div>
            </div>
            <div className="text-sm md:text-lg font-black bg-amber-200 px-4 py-1.5 rounded-xl border border-amber-300">
              {lowStockCount} Products
            </div>
          </div>
        )}
      </div>

      {/* Middle Grid: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
        
        {/* Recent Sales Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-slate-900 font-black text-xs md:text-sm uppercase tracking-wider">
              Recent Sales (Last 10)
            </span>
          </div>

          {/* Desktop View Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-black">Invoice#</th>
                  <th className="py-3 px-4 font-black">Date</th>
                  <th className="py-3 px-4 font-black">Customer</th>
                  <th className="py-3 px-4 font-black">Type</th>
                  <th className="py-3 px-4 font-black text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentSales.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setPreviewInvoice(s)}
                      className="hover:bg-slate-50/80 text-slate-700 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-black text-blue-600">Inv #{s.invoiceNo}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-semibold">{s.date}</td>
                      <td className="py-3.5 px-4 font-black text-slate-800">{s.customerName}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-150 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {s.saleType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {storeSettings.currency} {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (Exact layout of Image) */}
          <div className="md:hidden divide-y divide-slate-100">
            {recentSales.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                No sales recorded yet.
              </div>
            ) : (
              recentSales.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setPreviewInvoice(s)}
                  className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer flex flex-col gap-1 text-slate-800"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Inv #{s.invoiceNo}</span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      {storeSettings.currency} {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-medium">{s.date}</span>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] bg-slate-150 px-1.5 py-0.5 rounded-md">
                      {s.saleType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-bold">{s.customerName}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col overflow-hidden">
          <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-slate-900 font-black text-xs md:text-sm uppercase tracking-wider">
              Low Stock Alerts
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-start overflow-y-auto max-h-[340px] space-y-2.5">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 text-slate-400 text-xs py-10 justify-center h-full">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-500">All products have sufficient stock!</span>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs hover:border-amber-200 transition-all duration-150"
                >
                  <div className="space-y-1">
                    <div className="font-black text-slate-900 text-xs">{p.name}</div>
                    <div className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider">
                      Barcode: {p.barcode} • Alert below: {p.minStockAlert}
                    </div>
                  </div>
                  <span className="font-black text-rose-600 px-3 py-1 bg-rose-50 border border-rose-100 rounded-xl text-[10px]">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>⚡ QUICK ACTIONS Workspace</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <button
            id="btn-quick-new-sale"
            onClick={() => setActiveTab('sale-invoice')}
            className="bg-[#3F83F8] hover:bg-[#2563EB] text-white font-bold py-3.5 px-4 rounded-2xl shadow-sm shadow-blue-100 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale</span>
          </button>

          <button
            id="btn-quick-purchase"
            onClick={() => setActiveTab('purchase-stock')}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3.5 px-4 rounded-2xl shadow-sm shadow-emerald-100 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Purchase</span>
          </button>

          <button
            id="btn-quick-product"
            onClick={() => setActiveTab('products')}
            className="bg-slate-55 hover:bg-slate-100 text-[#111827] border border-slate-200 font-bold py-3.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            id="btn-quick-day-closing"
            onClick={() => setActiveTab('day-closing')}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider transition-all duration-150 active:scale-[0.98]"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Day Closing</span>
          </button>
        </div>
      </div>

      {/* SALES OVERVIEW TREND Chart */}
      <div className="bg-white border border-slate-200/80 p-5 md:p-6 rounded-3xl shadow-xs">
        <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>📈 SALES OVERVIEW TREND analytics</span>
        </div>

        <div className="h-32 md:h-40 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3F83F8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3F83F8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Horizontal grid lines */}
            <line x1="0" y1="20" x2="800" y2="20" stroke="#f8fafc" strokeWidth="1" />
            <line x1="0" y1="50" x2="800" y2="50" stroke="#f8fafc" strokeWidth="1" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="#f8fafc" strokeWidth="1" />
            <line x1="0" y1="110" x2="800" y2="110" stroke="#f1f5f9" strokeWidth="1.5" />

            {/* Gradient fill area under the line */}
            <path
              d="M 50,110 L 50,100 C 150,95 230,85 300,75 C 400,60 480,55 580,55 C 680,55 720,25 760,25 L 760,110 Z"
              fill="url(#chartGradient)"
            />

            {/* Sales Trend Curve */}
            <path
              d="M 50,100 C 150,95 230,85 300,75 C 400,60 480,55 580,55 C 680,55 720,25 760,25"
              fill="none"
              stroke="#3F83F8"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Glowing nodes with white centers */}
            <circle cx="50" cy="100" r="6" fill="#ffffff" stroke="#3F83F8" strokeWidth="4" />
            <circle cx="300" cy="75" r="6" fill="#ffffff" stroke="#3F83F8" strokeWidth="4" />
            <circle cx="580" cy="55" r="6" fill="#ffffff" stroke="#3F83F8" strokeWidth="4" />
            <circle cx="760" cy="25" r="6" fill="#ffffff" stroke="#3F83F8" strokeWidth="4" />
          </svg>
        </div>
      </div>
    </div>
  );
};
