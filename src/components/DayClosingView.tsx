import React, { useState } from 'react';
import { CalendarCheck, Printer, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const DayClosingView: React.FC = () => {
  const { sales, purchases, credits, expenses, storeSettings } = usePOS();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const [showPrintSlip, setShowPrintSlip] = useState(false);

  // Filter for today
  const todaySales = sales.filter((s) => s.date.startsWith(selectedDate));
  const todaySalesAmount = todaySales.reduce((acc, s) => acc + s.netAmount, 0);
  const todaySalesCount = todaySales.length;

  const totalSalesAllTime = sales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalPurchasesAllTime = purchases.reduce((acc, p) => acc + p.totalCost, 0);

  const todayCredits = credits.filter((c) => c.date.startsWith(selectedDate));
  const todayCreditsAmount = todayCredits.reduce((acc, c) => acc + c.amountReceived, 0);
  const totalCreditsAllTime = credits.reduce((acc, c) => acc + c.amountReceived, 0);

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
    <div id="day-closing-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-6">
      {/* Date selector */}
      <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 shadow-xs max-w-xl">
        <label className="text-xs font-bold text-slate-700">Select Closing Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white border border-slate-300 px-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
        />
      </div>

      {/* Main Closing Card matching Image 9 */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-xs max-w-xl text-slate-800 space-y-5 print:border-none print:shadow-none">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-xl font-bold text-[#002b49]">
            <CalendarCheck className="w-6 h-6 text-[#0070ba]" />
            <span>End of Day Closing Report</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Date: {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#002b49]"></span>
              Today's Sales Invoices
            </span>
            <span className="font-bold text-slate-900">{todaySalesCount} Bills</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#28a745]"></span>
              Today's Sales Amount
            </span>
            <span className="font-bold text-[#28a745]">
              {storeSettings.currency} {todaySalesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0070ba]"></span>
              Total Sales (All Time)
            </span>
            <span className="font-bold text-[#0070ba]">
              {storeSettings.currency} {totalSalesAllTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8e44ad]"></span>
              Total Purchases
            </span>
            <span className="font-bold text-[#8e44ad]">
              {storeSettings.currency} {totalPurchasesAllTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#17a2b8]"></span>
              Credit Collections
            </span>
            <span className="font-bold text-[#17a2b8]">
              {storeSettings.currency} {todayCreditsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#dc3545]"></span>
              Today's Expenses
            </span>
            <span className="font-bold text-[#dc3545]">
              {storeSettings.currency} {todayExpensesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e67e22]"></span>
              Total Expenses (All Time)
            </span>
            <span className="font-bold text-[#e67e22]">
              {storeSettings.currency} {totalExpensesAllTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-slate-200 my-3"></div>

          {/* Net Cash In Hand (Today) */}
          <div className="flex justify-between items-center py-1 bg-slate-50 p-2 border border-slate-200">
            <span className="font-black text-[#002b49] text-xs uppercase tracking-wide">
              💵 NET CASH IN HAND (Today)
            </span>
            <span className="font-black text-sm text-[#28a745]">
              {storeSettings.currency} {netCashInHandToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Estimated Profit (All) */}
          <div className="flex justify-between items-center py-1 bg-blue-50/50 p-2 border border-blue-100">
            <span className="font-black text-[#002b49] text-xs uppercase tracking-wide">
              📈 ESTIMATED PROFIT (All)
            </span>
            <span className="font-black text-sm text-[#0070ba]">
              {storeSettings.currency} {estimatedProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 print:hidden">
          <button
            id="btn-print-day-closing"
            onClick={handlePrintClosing}
            className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-2.5 px-6 text-xs flex items-center gap-2 shadow transition-colors active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Closing Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
