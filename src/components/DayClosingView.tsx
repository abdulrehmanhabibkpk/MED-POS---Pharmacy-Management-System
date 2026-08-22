import React, { useState } from 'react';
import { CalendarCheck, Printer, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const DayClosingView: React.FC = () => {
  const { sales, purchases, credits, expenses, storeSettings } = usePOS();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  // Filter for today
  const todaySales = sales.filter((s) => s.date.startsWith(selectedDate));
  const todaySalesAmount = todaySales.reduce((acc, s) => acc + s.netAmount, 0);
  const todaySalesCount = todaySales.length;

  const totalSalesAllTime = sales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalPurchasesAllTime = purchases.reduce((acc, p) => acc + p.totalCost, 0);

  const todayCredits = credits.filter((c) => c.date.startsWith(selectedDate));
  const todayCreditsAmount = todayCredits.reduce((acc, c) => acc + c.amountReceived, 0);

  const todayExpenses = expenses.filter((e) => e.date.startsWith(selectedDate));
  const todayExpensesAmount = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalExpensesAllTime = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Net cash in hand today = Today's Sales Cash + Credit Collected Today - Today's Expenses
  const netCashInHandToday = Math.max(0, todaySalesAmount + todayCreditsAmount - todayExpensesAmount);

  // Estimated profit (All time) = Total Sales - Total Expenses (and approximate cost)
  const estimatedProfit = Math.max(0, totalSalesAllTime - totalExpensesAllTime);

  const handlePrintClosing = () => {
    window.print();
  };

  return (
    <div id="day-closing-container" className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-2xl mx-auto pb-12 font-sans">
      
      {/* Upper header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Day Closing & Cash Reconciliation
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Select any calendar date to audit shift logs, inspect total collections, and verify net cash in hand safely.
            </p>
          </div>
        </div>
      </div>

      {/* Date selector */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Select Closing Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 font-extrabold focus:outline-none focus:border-blue-600 transition-all font-mono"
        />
      </div>

      {/* Main Closing Card */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xs text-slate-800 space-y-6 print:border-none print:shadow-none">
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-base font-black text-slate-900 uppercase tracking-wider">
            <span>Shift Closure Report</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-bold">
            Target Date:{' '}
            <span className="text-slate-800">
              {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-4 text-xs font-bold">
          <div className="flex justify-between items-center py-1">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Today's Sales Invoices
            </span>
            <span className="font-black text-slate-900 text-sm">{todaySalesCount} Bills</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Today's Sales Amount
            </span>
            <span className="font-black text-emerald-600 text-sm">
              {storeSettings.currency} {todaySalesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              Total Sales (All Time)
            </span>
            <span className="font-black text-slate-900">
              {storeSettings.currency} {totalSalesAllTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Total Purchases (All Time)
            </span>
            <span className="font-black text-amber-600">
              {storeSettings.currency} {totalPurchasesAllTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              Credit Collections (Khata Today)
            </span>
            <span className="font-black text-purple-600">
              {storeSettings.currency} {todayCreditsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              Today's Expenses
            </span>
            <span className="font-black text-rose-600">
              {storeSettings.currency} {todayExpensesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              Total Expenses (All Time)
            </span>
            <span className="font-black text-slate-700">
              {storeSettings.currency} {totalExpensesAllTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-slate-200/60 my-4"></div>

          {/* Net Cash In Hand (Today) */}
          <div className="flex justify-between items-center py-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 font-black">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              💵 NET CASH IN HAND (Today)
            </span>
            <span className="text-base text-emerald-600 font-mono">
              {storeSettings.currency} {netCashInHandToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Estimated Profit (All) */}
          <div className="flex justify-between items-center py-3 bg-blue-50/50 border border-blue-100 rounded-2xl px-4 font-black">
            <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
              📈 ESTIMATED PROFIT (All)
            </span>
            <span className="text-base text-blue-600 font-mono">
              {storeSettings.currency} {estimatedProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 print:hidden">
          <button
            id="btn-print-day-closing"
            onClick={handlePrintClosing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-100 transition-all active:scale-95 uppercase tracking-wider"
          >
            <Printer className="w-4 h-4" />
            <span>Print Shift Closing Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
