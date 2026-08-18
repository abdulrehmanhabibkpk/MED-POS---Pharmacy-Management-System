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
  History,
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
    <div id="dashboard-container" className="p-3 md:p-6 space-y-4 md:space-y-6 bg-[#f4f7fa] min-h-full pb-20 md:pb-6">
      
      {/* 5 Grid KPI Cards + Spanning Low Stock Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-4">
          {/* Card 1: Total Sales */}
          <div
            id="kpi-total-sales"
            onClick={() => setActiveTab('bill-history')}
            className="bg-[#0081d4] hover:bg-[#0070b8] cursor-pointer text-white p-3 md:p-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex flex-col justify-between h-24 md:h-28"
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <ShoppingCart className="w-4 h-4 opacity-90" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Total Sales</span>
            </div>
            <div>
              <div className="text-sm md:text-lg font-black">
                {storeSettings.currency} {totalSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <div className="text-[9px] md:text-[11px] opacity-80 font-medium">({totalBillsCount} Bills)</div>
            </div>
          </div>

          {/* Card 2: Total Purchases */}
          <div
            id="kpi-total-purchases"
            onClick={() => setActiveTab('purchase-stock')}
            className="bg-[#1baf55] hover:bg-[#158c43] cursor-pointer text-white p-3 md:p-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex flex-col justify-between h-24 md:h-28"
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <Box className="w-4 h-4 opacity-90" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Total Purchases</span>
            </div>
            <div>
              <div className="text-sm md:text-lg font-black">
                {storeSettings.currency} {totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <div className="text-[9px] md:text-[11px] opacity-80 font-medium">&nbsp;</div>
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div
            id="kpi-total-expenses"
            onClick={() => setActiveTab('pay-expense')}
            className="bg-[#d93a49] hover:bg-[#bc2f3c] cursor-pointer text-white p-3 md:p-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex flex-col justify-between h-24 md:h-28"
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <Receipt className="w-4 h-4 opacity-90" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Total Expenses</span>
            </div>
            <div>
              <div className="text-sm md:text-lg font-black">
                {storeSettings.currency} {totalExpensesAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <div className="text-[9px] md:text-[11px] opacity-80 font-medium">&nbsp;</div>
            </div>
          </div>

          {/* Card 4: Credit Received */}
          <div
            id="kpi-credit-received"
            onClick={() => setActiveTab('credit-receive')}
            className="bg-[#8545b6] hover:bg-[#6c3499] cursor-pointer text-white p-3 md:p-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex flex-col justify-between h-24 md:h-28"
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <Wallet className="w-4 h-4 opacity-90" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Credit Received</span>
            </div>
            <div>
              <div className="text-sm md:text-lg font-black">
                {storeSettings.currency} {totalCreditsAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <div className="text-[9px] md:text-[11px] opacity-80 font-medium">&nbsp;</div>
            </div>
          </div>

          {/* Card 5: Products */}
          <div
            id="kpi-products"
            onClick={() => setActiveTab('products')}
            className="bg-[#1499b8] hover:bg-[#0f7a94] cursor-pointer text-white p-3 md:p-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex flex-col justify-between h-24 md:h-28 col-span-2 sm:col-span-1"
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <Tag className="w-4 h-4 opacity-90" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Products</span>
            </div>
            <div>
              <div className="text-sm md:text-lg font-black">
                {totalProductItems} Items
              </div>
              <div className="text-[9px] md:text-[11px] opacity-80 font-medium">+ {totalProductUnits} Units</div>
            </div>
          </div>
        </div>

        {/* Spanning Wide Orange Banner: Low Stock Items */}
        <div
          id="kpi-low-stock"
          onClick={() => setActiveTab('products')}
          className="bg-[#d35400] hover:bg-[#ba4a00] cursor-pointer text-white p-3.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 opacity-90 text-amber-200" />
            <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider">LOW STOCK ITEMS</span>
          </div>
          <div className="text-sm md:text-lg font-black">
            {lowStockCount} Products
          </div>
        </div>
      </div>

      {/* Middle Grid: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Recent Sales Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#0070ba]" />
            <span className="text-[#002b49] font-black text-xs md:text-sm uppercase tracking-wide">
              Recent Sales (Last 10)
            </span>
          </div>

          {/* Desktop View Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Invoice#</th>
                  <th className="py-2.5 px-3 font-bold">Date</th>
                  <th className="py-2.5 px-3 font-bold">Customer</th>
                  <th className="py-2.5 px-3 font-bold">Type</th>
                  <th className="py-2.5 px-3 font-bold text-right">Net Amount</th>
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
                  recentSales.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setPreviewInvoice(s)}
                      className="hover:bg-blue-50 text-slate-700 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold">Inv #{s.invoiceNo}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{s.customerName}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {s.saleType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
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
              <div className="py-8 text-center text-slate-400 text-xs">
                No sales recorded yet.
              </div>
            ) : (
              recentSales.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setPreviewInvoice(s)}
                  className="p-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer flex flex-col gap-1 text-slate-800"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Inv #{s.invoiceNo}</span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      {storeSettings.currency} {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-medium">{s.date}</span>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] bg-slate-100 px-1 py-0.2 rounded-xs">
                      {s.saleType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold">{s.customerName}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#d35400]" />
            <span className="text-[#c0392b] font-black text-xs md:text-sm uppercase tracking-wide">
              Low Stock Alerts
            </span>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-start overflow-y-auto max-h-72 space-y-2">
            {lowStockProducts.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-4 justify-center">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>All products have sufficient stock!</span>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 bg-[#fffbeb] border border-[#fef3c7] rounded-lg text-xs"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{p.name}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5 font-medium">
                      Barcode: {p.barcode} • Alert below: {p.minStockAlert}
                    </div>
                  </div>
                  <span className="font-bold text-red-600 px-2 py-0.5 bg-red-50 border border-red-200 rounded text-[10px]">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION (Matches Image) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2">
        <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#0070ba]" />
          <span>⚡ QUICK ACTIONS</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            id="btn-quick-new-sale"
            onClick={() => setActiveTab('sale-invoice')}
            className="bg-[#0081d4] hover:bg-[#0070b8] text-white font-bold py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1 text-[11px] md:text-xs transition-colors active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Sale Invoice</span>
          </button>

          <button
            id="btn-quick-purchase"
            onClick={() => setActiveTab('purchase-stock')}
            className="bg-[#1baf55] hover:bg-[#158c43] text-white font-bold py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1 text-[11px] md:text-xs transition-colors active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Purchase</span>
          </button>

          <button
            id="btn-quick-product"
            onClick={() => setActiveTab('products')}
            className="bg-[#8545b6] hover:bg-[#6c3499] text-white font-bold py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1 text-[11px] md:text-xs transition-colors active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 rotate-45" />
            <span>Add Product</span>
          </button>

          <button
            id="btn-quick-day-closing"
            onClick={() => setActiveTab('day-closing')}
            className="bg-[#1499b8] hover:bg-[#0f7a94] text-white font-bold py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1 text-[11px] md:text-xs transition-colors active:scale-[0.98]"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>📅 Day Closing</span>
          </button>
        </div>
      </div>

      {/* SALES OVERVIEW TREND Chart (Exact wave line representation) */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#0081d4]" />
          <span>📈 SALES OVERVIEW TREND</span>
        </div>

        <div className="h-28 md:h-36 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
            {/* Horizontal grid lines */}
            <line x1="0" y1="20" x2="800" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="50" x2="800" y2="50" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="110" x2="800" y2="110" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Sales Trend Curve matching screenshot */}
            <path
              d="M 50,100 C 150,95 230,85 300,75 C 400,60 480,55 580,55 C 680,55 720,25 760,25"
              fill="none"
              stroke="#0081d4"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Glowing nodes with white centers */}
            <circle cx="50" cy="100" r="6" fill="#ffffff" stroke="#0081d4" strokeWidth="4.5" />
            <circle cx="300" cy="75" r="6" fill="#ffffff" stroke="#0081d4" strokeWidth="4.5" />
            <circle cx="580" cy="55" r="6" fill="#ffffff" stroke="#0081d4" strokeWidth="4.5" />
            <circle cx="760" cy="25" r="6" fill="#ffffff" stroke="#0081d4" strokeWidth="4.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
