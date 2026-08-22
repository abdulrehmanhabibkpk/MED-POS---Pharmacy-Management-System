import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Box,
  Receipt,
  Wallet,
  Play,
  Download,
  Layers,
  Users,
  Building2,
  Printer,
  Calendar,
  Search,
  BookOpen,
  Filter,
  DollarSign,
  TrendingDown,
  FileSpreadsheet,
  RotateCcw,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import {
  Customer,
  Supplier,
  SaleInvoice,
  PurchaseRecord,
  ExpenseRecord,
  SaleReturn,
  Product
} from '../types';
import { CustomerLedgerModal } from './CustomerLedgerModal';
import { SupplierLedgerModal } from './SupplierLedgerModal';

export const ReportsView: React.FC = () => {
  const {
    sales,
    updateSale,
    deleteSale,
    purchases,
    updatePurchase,
    deletePurchase,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    returns,
    updateReturn,
    deleteReturn,
    products,
    updateProduct,
    customers,
    suppliers,
    customerTransactions,
    supplierTransactions,
    storeSettings,
    openThermalReceipt,
  } = usePOS();

  type ReportTab =
    | 'sales'
    | 'purchases'
    | 'expenses'
    | 'returns'
    | 'customer_ledger'
    | 'supplier_ledger'
    | 'stock'
    | 'profit_loss';

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('sales');

  // Date filters
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Entity selector filters
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('ALL');
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Ledgers
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [modalSupplier, setModalSupplier] = useState<Supplier | null>(null);

  // Edit Modals State
  const [editingSale, setEditingSale] = useState<SaleInvoice | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [editingReturn, setEditingReturn] = useState<SaleReturn | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // -------------------------------------------------------------
  // FILTERED DATASETS
  // -------------------------------------------------------------

  // 1. Sales
  const filteredSales = sales.filter((s) => {
    const saleDate = s.date.slice(0, 10);
    if (fromDate && saleDate < fromDate) return false;
    if (toDate && saleDate > toDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchInv = s.invoiceNo.toString().includes(q);
      const matchCust = s.customerName.toLowerCase().includes(q);
      const matchType = s.saleType.toLowerCase().includes(q);
      const matchItem = s.items.some((i) => i.name.toLowerCase().includes(q) || i.barcode.includes(q));
      if (!matchInv && !matchCust && !matchType && !matchItem) return false;
    }
    return true;
  });

  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalSalesDiscount = filteredSales.reduce((acc, s) => acc + s.discountAmount, 0);
  const totalSalesPaid = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalSalesCredit = totalSalesRevenue - totalSalesPaid;

  // 2. Purchases
  const filteredPurchases = purchases.filter((p) => {
    const pDate = p.date.slice(0, 10);
    if (fromDate && pDate < fromDate) return false;
    if (toDate && pDate > toDate) return false;
    if (selectedSupplierId !== 'ALL' && p.supplierName !== selectedSupplierId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchItem = p.itemName.toLowerCase().includes(q);
      const matchBarcode = p.barcode.toLowerCase().includes(q);
      const matchSup = (p.supplierName || '').toLowerCase().includes(q);
      if (!matchItem && !matchBarcode && !matchSup) return false;
    }
    return true;
  });

  const totalPurchasesCost = filteredPurchases.reduce((acc, p) => acc + p.totalCost, 0);
  const totalPurchasesUnits = filteredPurchases.reduce((acc, p) => acc + p.qtyReceived, 0);

  // 3. Expenses
  const filteredExpenses = expenses.filter((e) => {
    const eDate = e.date.slice(0, 10);
    if (fromDate && eDate < fromDate) return false;
    if (toDate && eDate > toDate) return false;
    if (selectedExpenseCategory !== 'ALL' && e.category !== selectedExpenseCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCat = e.category.toLowerCase().includes(q);
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchRec = (e.recordedBy || '').toLowerCase().includes(q);
      if (!matchCat && !matchDesc && !matchRec) return false;
    }
    return true;
  });

  const totalExpensesAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // 4. Returns
  const filteredReturns = returns.filter((r) => {
    const rDate = r.date.slice(0, 10);
    if (fromDate && rDate < fromDate) return false;
    if (toDate && rDate > toDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchItem = r.itemName.toLowerCase().includes(q);
      const matchBarcode = r.barcode.toLowerCase().includes(q);
      const matchReason = (r.reason || '').toLowerCase().includes(q);
      if (!matchItem && !matchBarcode && !matchReason) return false;
    }
    return true;
  });

  const totalReturnsRefunded = filteredReturns.reduce((acc, r) => acc + r.refundAmount, 0);
  const totalReturnsUnits = filteredReturns.reduce((acc, r) => acc + r.qty, 0);

  // 5. Customer Ledger
  const filteredCustomerTx = customerTransactions.filter((tx) => {
    const txDate = tx.date.slice(0, 10);
    if (fromDate && txDate < fromDate) return false;
    if (toDate && txDate > toDate) return false;
    if (selectedCustomerId !== 'ALL' && tx.customerId !== selectedCustomerId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCustomer = tx.customerName.toLowerCase().includes(q);
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchRef = tx.referenceNo.toLowerCase().includes(q);
      const matchItems = (tx.itemsSummary || '').toLowerCase().includes(q);
      if (!matchCustomer && !matchDesc && !matchRef && !matchItems) return false;
    }
    return true;
  });

  const totalCustomerDebit = filteredCustomerTx.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCustomerCredit = filteredCustomerTx.reduce((sum, tx) => sum + tx.credit, 0);

  // 6. Supplier Ledger
  const filteredSupplierTx = supplierTransactions.filter((tx) => {
    const txDate = tx.date.slice(0, 10);
    if (fromDate && txDate < fromDate) return false;
    if (toDate && txDate > toDate) return false;
    if (selectedSupplierId !== 'ALL' && tx.supplierId !== selectedSupplierId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSupplier = tx.supplierName.toLowerCase().includes(q);
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchRef = tx.referenceNo.toLowerCase().includes(q);
      const matchItems = (tx.itemsSummary || '').toLowerCase().includes(q);
      if (!matchSupplier && !matchDesc && !matchRef && !matchItems) return false;
    }
    return true;
  });

  const totalSupplierPurchases = filteredSupplierTx.reduce((sum, tx) => sum + tx.credit, 0);
  const totalSupplierPayments = filteredSupplierTx.reduce((sum, tx) => sum + tx.debit, 0);

  // 7. Stock Valuation
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      (p.company || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  });

  const inventoryPurchaseValuation = products.reduce((acc, p) => acc + p.purchasePrice * p.stock, 0);
  const inventoryRetailValuation = products.reduce((acc, p) => acc + p.retailPrice * p.stock, 0);
  const potentialInventoryProfit = Math.max(0, inventoryRetailValuation - inventoryPurchaseValuation);

  // Profit and Loss calculations
  const netEstimatedProfit = Math.max(0, totalSalesRevenue - totalPurchasesCost - totalExpensesAmount);

  // -------------------------------------------------------------
  // PRINT GENERATOR
  // -------------------------------------------------------------
  const handlePrintCombinedReport = (title: string, tableHtml: string, summaryHtml: string) => {
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (!printWindow) {
      alert('Please allow popups to print report.');
      return;
    }

    const printDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${storeSettings.storeName}</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 15px; }
            .header-table { width: 100%; border-bottom: 2px solid #002b49; padding-bottom: 10px; margin-bottom: 15px; }
            .store-name { font-size: 20px; font-weight: 800; color: #002b49; text-transform: uppercase; margin: 0; }
            .store-sub { font-size: 10px; color: #64748b; margin-top: 2px; }
            .badge { background: #002b49; color: #fff; padding: 5px 12px; font-size: 12px; font-weight: bold; border-radius: 4px; display: inline-block; }
            table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            table.data-table th { background: #002b49; color: #ffffff; font-size: 10px; text-transform: uppercase; padding: 7px 6px; text-align: left; border: 1px solid #002b49; }
            table.data-table td { padding: 6px; border: 1px solid #e2e8f0; font-size: 10px; vertical-align: top; }
            table.data-table tr:nth-child(even) { background: #f8fafc; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .summary-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 10px 15px; border-radius: 4px; margin-top: 15px; font-size: 11px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <h1 class="store-name">${storeSettings.storeName}</h1>
                <div class="store-sub">${storeSettings.address} | Phone: ${storeSettings.phone}</div>
              </td>
              <td class="text-right">
                <div class="badge">${title.toUpperCase()}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Period: ${fromDate || 'Start'} to ${toDate || 'Present'}</div>
              </td>
            </tr>
          </table>

          ${summaryHtml}

          ${tableHtml}

          <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
            <span>Report Generated on: ${new Date().toLocaleString()}</span>
            <span>Manager Signature: _______________________</span>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printDoc);
    printWindow.document.close();
  };

  // CSV Export for active tab
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `report_${activeReportTab}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeReportTab === 'sales') {
      headers = ['Invoice#', 'Date', 'Customer', 'Type', 'Net Amount', 'Discount', 'Paid', 'Change'];
      rows = filteredSales.map((s) => [s.invoiceNo, `"${s.date}"`, `"${s.customerName}"`, s.saleType, s.netAmount, s.discountAmount, s.paidAmount, s.changeAmount]);
    } else if (activeReportTab === 'purchases') {
      headers = ['Barcode', 'Product Name', 'Supplier', 'Date', 'Qty', 'Unit Cost', 'Retail Price', 'Total Cost'];
      rows = filteredPurchases.map((p) => [p.barcode, `"${p.itemName}"`, `"${p.supplierName}"`, `"${p.date}"`, p.qtyReceived, p.unitCostPrice, p.salePriceRetail, p.totalCost]);
    } else if (activeReportTab === 'expenses') {
      headers = ['Date', 'Category', 'Description', 'Recorded By', 'Amount'];
      rows = filteredExpenses.map((e) => [`"${e.date}"`, `"${e.category}"`, `"${e.description}"`, `"${e.recordedBy}"`, e.amount]);
    } else if (activeReportTab === 'returns') {
      headers = ['Date', 'Barcode', 'Product Name', 'Qty', 'Refund Amount', 'Reason'];
      rows = filteredReturns.map((r) => [`"${r.date}"`, r.barcode, `"${r.itemName}"`, r.qty, r.refundAmount, `"${r.reason}"`]);
    } else if (activeReportTab === 'customer_ledger') {
      headers = ['Date', 'Ref#', 'Customer', 'Description', 'Items', 'Debit', 'Credit'];
      rows = filteredCustomerTx.map((tx) => [`"${tx.date}"`, tx.referenceNo, `"${tx.customerName}"`, `"${tx.description}"`, `"${tx.itemsSummary || ''}"`, tx.debit, tx.credit]);
    } else if (activeReportTab === 'supplier_ledger') {
      headers = ['Date', 'Ref#', 'Supplier', 'Description', 'Items', 'Purchases(Credit)', 'Payments(Debit)'];
      rows = filteredSupplierTx.map((tx) => [`"${tx.date}"`, tx.referenceNo, `"${tx.supplierName}"`, `"${tx.description}"`, `"${tx.itemsSummary || ''}"`, tx.credit, tx.debit]);
    } else if (activeReportTab === 'stock') {
      headers = ['Barcode', 'Name', 'Company', 'Stock', 'Purchase Price', 'Retail Price', 'Total Value'];
      rows = filteredProducts.map((p) => [p.barcode, `"${p.name}"`, `"${p.company}"`, p.stock, p.purchasePrice, p.retailPrice, p.purchasePrice * p.stock]);
    }

    if (rows.length === 0) {
      alert('No data available to export.');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-view-container" className="p-4 sm:p-8 bg-[#F8FAFC] min-h-full space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* TOP HEADER BAR */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              LimoPOS Reports & Audit Center
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Full date-filtered reporting, detailed ledger analysis, live data editing, voucher printing, and CSV exports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer animate-in fade-in active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV Sheet</span>
          </button>
        </div>
      </div>

      {/* MAIN SETTINGS NAVIGATION TABS */}
      <div className="bg-white border border-slate-200/80 p-2.5 rounded-3xl shadow-xs flex flex-wrap items-center gap-1.5 no-print">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeReportTab === 'sales'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Sales & Invoices ({filteredSales.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('purchases')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeReportTab === 'purchases'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Purchases ({filteredPurchases.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('expenses')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeReportTab === 'expenses'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Expenses ({filteredExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('returns')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeReportTab === 'returns'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Returns ({filteredReturns.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('customer_ledger')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeReportTab === 'customer_ledger'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customer Khata ({filteredCustomerTx.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('supplier_ledger')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeReportTab === 'supplier_ledger'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Supplier Khata ({filteredSupplierTx.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('stock')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeReportTab === 'stock'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Stock Valuation</span>
        </button>

        <button
          onClick={() => setActiveReportTab('profit_loss')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeReportTab === 'profit_loss'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Profit & Loss</span>
        </button>
      </div>

      {/* Date Filter & Selector Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-4 font-semibold text-xs text-slate-800 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 transition-all font-mono"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-150">
            <button
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setFromDate(today);
                setToDate(today);
              }}
              className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => {
                const d = new Date();
                const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
                const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
                setFromDate(startOfMonth);
                setToDate(endOfMonth);
              }}
              className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-all cursor-pointer"
            >
              This Month
            </button>
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-all cursor-pointer"
            >
              All Time
            </button>
          </div>

          {/* Customer Filter */}
          {activeReportTab === 'customer_ledger' && (
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase">Customer:</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600 transition-all"
              >
                <option value="ALL">All Customers ({customers.length})</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({storeSettings.currency} {c.balanceReceivable.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Supplier Filter */}
          {(activeReportTab === 'supplier_ledger' || activeReportTab === 'purchases') && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-700">Supplier:</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0070ba]"
              >
                <option value="ALL">All Suppliers ({suppliers.length})</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Expense Category Filter */}
          {activeReportTab === 'expenses' && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-700">Category:</label>
              <select
                value={selectedExpenseCategory}
                onChange={(e) => setSelectedExpenseCategory(e.target.value)}
                className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0070ba]"
              >
                <option value="ALL">All Categories</option>
                <option value="Electricity">Electricity Bill</option>
                <option value="Store Rent">Store Rent</option>
                <option value="Staff Salary">Staff Salary / Wages</option>
                <option value="Tea & Refreshment">Tea & Refreshment</option>
                <option value="Cleaning & Maintenance">Cleaning & Maintenance</option>
                <option value="Transportation / Delivery">Transportation / Delivery</option>
                <option value="Packaging Bags & Stationery">Packaging Bags & Stationery</option>
                <option value="Software & Internet">Software & Internet</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search items, names, refs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 pl-7 pr-3 py-1 text-xs text-slate-800 w-44 focus:outline-none focus:border-[#0070ba]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
          </div>
        </div>

        {/* Action Print Button */}
        <div>
          <button
            onClick={() => {
              if (activeReportTab === 'sales') {
                const tableHtml = `
                  <table class="data-table">
                    <thead>
                      <tr><th>Invoice#</th><th>Date</th><th>Customer</th><th>Mode</th><th class="text-right">Net Amount</th><th class="text-right">Paid</th><th class="text-right">Credit Due</th></tr>
                    </thead>
                    <tbody>
                      ${filteredSales.map((s) => `
                        <tr>
                          <td><strong>#${s.invoiceNo}</strong></td><td>${s.date}</td><td>${s.customerName}</td><td>${s.saleType}</td>
                          <td class="text-right font-bold">${storeSettings.currency} ${s.netAmount.toLocaleString()}</td>
                          <td class="text-right">${storeSettings.currency} ${s.paidAmount.toLocaleString()}</td>
                          <td class="text-right">${storeSettings.currency} ${(s.netAmount - s.paidAmount).toLocaleString()}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
                const summaryHtml = `
                  <div class="summary-box">
                    <div><strong>Total Sales Revenue:</strong> ${storeSettings.currency} ${totalSalesRevenue.toLocaleString()}</div>
                    <div><strong>Total Cash Paid:</strong> ${storeSettings.currency} ${totalSalesPaid.toLocaleString()}</div>
                    <div><strong>Total Invoices:</strong> ${filteredSales.length}</div>
                  </div>
                `;
                handlePrintCombinedReport('Sales Summary & Bills Report', tableHtml, summaryHtml);
              } else if (activeReportTab === 'purchases') {
                const tableHtml = `
                  <table class="data-table">
                    <thead>
                      <tr><th>Date</th><th>Barcode</th><th>Product Name</th><th>Supplier</th><th class="text-center">Qty</th><th class="text-right">Unit Cost</th><th class="text-right">Total Cost</th></tr>
                    </thead>
                    <tbody>
                      ${filteredPurchases.map((p) => `
                        <tr>
                          <td>${p.date}</td><td>${p.barcode}</td><td>${p.itemName}</td><td>${p.supplierName}</td>
                          <td class="text-center font-bold">${p.qtyReceived}</td>
                          <td class="text-right">${storeSettings.currency} ${p.unitCostPrice.toLocaleString()}</td>
                          <td class="text-right font-bold">${storeSettings.currency} ${p.totalCost.toLocaleString()}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
                const summaryHtml = `
                  <div class="summary-box">
                    <div><strong>Total Purchases Cost:</strong> ${storeSettings.currency} ${totalPurchasesCost.toLocaleString()}</div>
                    <div><strong>Total Stock Units Received:</strong> ${totalPurchasesUnits.toLocaleString()}</div>
                  </div>
                `;
                handlePrintCombinedReport('Purchases & Stock Received Report', tableHtml, summaryHtml);
              } else if (activeReportTab === 'expenses') {
                const tableHtml = `
                  <table class="data-table">
                    <thead>
                      <tr><th>Date</th><th>Category</th><th>Description / Notes</th><th>Recorded By</th><th class="text-right">Amount</th></tr>
                    </thead>
                    <tbody>
                      ${filteredExpenses.map((e) => `
                        <tr>
                          <td>${e.date}</td><td><strong>${e.category}</strong></td><td>${e.description}</td><td>${e.recordedBy}</td>
                          <td class="text-right font-bold">${storeSettings.currency} ${e.amount.toLocaleString()}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
                const summaryHtml = `
                  <div class="summary-box">
                    <div><strong>Total Operating Expenses:</strong> ${storeSettings.currency} ${totalExpensesAmount.toLocaleString()}</div>
                    <div><strong>Expenses Recorded:</strong> ${filteredExpenses.length}</div>
                  </div>
                `;
                handlePrintCombinedReport('Daily Store Expenses Report', tableHtml, summaryHtml);
              } else if (activeReportTab === 'returns') {
                const tableHtml = `
                  <table class="data-table">
                    <thead>
                      <tr><th>Date</th><th>Barcode</th><th>Product Name</th><th>Return Reason</th><th class="text-center">Qty</th><th class="text-right">Refund Amount</th></tr>
                    </thead>
                    <tbody>
                      ${filteredReturns.map((r) => `
                        <tr>
                          <td>${r.date}</td><td>${r.barcode}</td><td>${r.itemName}</td><td>${r.reason}</td>
                          <td class="text-center font-bold">${r.qty}</td>
                          <td class="text-right font-bold">${storeSettings.currency} ${r.refundAmount.toLocaleString()}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
                const summaryHtml = `
                  <div class="summary-box">
                    <div><strong>Total Refunds Issued:</strong> ${storeSettings.currency} ${totalReturnsRefunded.toLocaleString()}</div>
                    <div><strong>Returned Units:</strong> ${totalReturnsUnits}</div>
                  </div>
                `;
                handlePrintCombinedReport('Sale Returns & Refunds Report', tableHtml, summaryHtml);
              } else if (activeReportTab === 'customer_ledger') {
                const tableHtml = `
                  <table class="data-table">
                    <thead>
                      <tr><th>Date</th><th>Ref #</th><th>Customer Name</th><th>Description & Items Given</th><th class="text-right">Debit (+Given)</th><th class="text-right">Credit (-Paid)</th></tr>
                    </thead>
                    <tbody>
                      ${filteredCustomerTx.map((tx) => `
                        <tr>
                          <td>${tx.date}</td><td><strong>${tx.referenceNo}</strong></td><td>${tx.customerName}</td><td>${tx.description} ${tx.itemsSummary ? `<br/><small>📦 ${tx.itemsSummary}</small>` : ''}</td>
                          <td class="text-right font-bold">${tx.debit > 0 ? `${storeSettings.currency} ${tx.debit.toLocaleString()}` : '-'}</td>
                          <td class="text-right font-bold">${tx.credit > 0 ? `${storeSettings.currency} ${tx.credit.toLocaleString()}` : '-'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
                const summaryHtml = `
                  <div class="summary-box">
                    <div><strong>Total Credit Goods:</strong> ${storeSettings.currency} ${totalCustomerDebit.toLocaleString()}</div>
                    <div><strong>Total Payments Received:</strong> ${storeSettings.currency} ${totalCustomerCredit.toLocaleString()}</div>
                  </div>
                `;
                handlePrintCombinedReport('Customer Ledger Statement Report', tableHtml, summaryHtml);
              } else if (activeReportTab === 'supplier_ledger') {
                const tableHtml = `
                  <table class="data-table">
                    <thead>
                      <tr><th>Date</th><th>Bill #</th><th>Distributor</th><th>Description & Stock</th><th class="text-right">Purchases (+Credit)</th><th class="text-right">Payments (-Debit)</th></tr>
                    </thead>
                    <tbody>
                      ${filteredSupplierTx.map((tx) => `
                        <tr>
                          <td>${tx.date}</td><td><strong>${tx.referenceNo}</strong></td><td>${tx.supplierName}</td><td>${tx.description} ${tx.itemsSummary ? `<br/><small>📦 ${tx.itemsSummary}</small>` : ''}</td>
                          <td class="text-right font-bold">${tx.credit > 0 ? `${storeSettings.currency} ${tx.credit.toLocaleString()}` : '-'}</td>
                          <td class="text-right font-bold">${tx.debit > 0 ? `${storeSettings.currency} ${tx.debit.toLocaleString()}` : '-'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
                const summaryHtml = `
                  <div class="summary-box">
                    <div><strong>Total Purchases Logged:</strong> ${storeSettings.currency} ${totalSupplierPurchases.toLocaleString()}</div>
                    <div><strong>Total Payments Made:</strong> ${storeSettings.currency} ${totalSupplierPayments.toLocaleString()}</div>
                  </div>
                `;
                handlePrintCombinedReport('Supplier Ledger Statement Report', tableHtml, summaryHtml);
              } else if (activeReportTab === 'stock') {
                const tableHtml = `
                  <table class="data-table">
                    <thead>
                      <tr><th>Barcode</th><th>Product Name</th><th>Company</th><th class="text-center">Stock</th><th class="text-right">Cost Price</th><th class="text-right">Retail Price</th><th class="text-right">Total Value</th></tr>
                    </thead>
                    <tbody>
                      ${filteredProducts.map((p) => `
                        <tr>
                          <td>${p.barcode}</td><td>${p.name}</td><td>${p.company}</td><td class="text-center font-bold">${p.stock}</td>
                          <td class="text-right">${storeSettings.currency} ${p.purchasePrice}</td><td class="text-right">${storeSettings.currency} ${p.retailPrice}</td>
                          <td class="text-right font-bold">${storeSettings.currency} ${(p.purchasePrice * p.stock).toLocaleString()}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
                const summaryHtml = `
                  <div class="summary-box">
                    <div><strong>Total Purchase Stock Valuation:</strong> ${storeSettings.currency} ${inventoryPurchaseValuation.toLocaleString()}</div>
                    <div><strong>Total Retail Stock Valuation:</strong> ${storeSettings.currency} ${inventoryRetailValuation.toLocaleString()}</div>
                  </div>
                `;
                handlePrintCombinedReport('Inventory Stock & Valuation Report', tableHtml, summaryHtml);
              } else if (activeReportTab === 'profit_loss') {
                const summaryHtml = `
                  <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:20px; font-size:12px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0;">
                      <span>Total Net Sales Revenue (+)</span>
                      <strong>${storeSettings.currency} ${totalSalesRevenue.toLocaleString()}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0; color:#c0392b;">
                      <span>Purchases / Stock In Cost (-)</span>
                      <strong>${storeSettings.currency} ${totalPurchasesCost.toLocaleString()}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0; color:#c0392b;">
                      <span>Store Operating Expenses (-)</span>
                      <strong>${storeSettings.currency} ${totalExpensesAmount.toLocaleString()}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0; color:#c0392b;">
                      <span>Customer Refunds Issued (-)</span>
                      <strong>${storeSettings.currency} ${totalReturnsRefunded.toLocaleString()}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:12px 0 0; font-size:14px; font-weight:bold; color:#002b49;">
                      <span>Net Estimated Store Profit (=)</span>
                      <span>${storeSettings.currency} ${netEstimatedProfit.toLocaleString()}</span>
                    </div>
                  </div>
                `;
                handlePrintCombinedReport('Store Profit & Loss Statement', '', summaryHtml);
              }
            }}
            className="bg-[#002b49] hover:bg-[#001f35] text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print {activeReportTab.replace('_', ' ').toUpperCase()} Report</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. SALES TAB */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0088cc] text-white p-3.5 shadow-xs flex flex-col justify-between h-22 rounded-none">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <TrendingUp className="w-4 h-4 opacity-90" />
                <span>Total Net Sales</span>
              </div>
              <div className="text-lg font-bold font-mono">
                {storeSettings.currency} {totalSalesRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-[#27ae60] text-white p-3.5 shadow-xs flex flex-col justify-between h-22 rounded-none">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Check className="w-4 h-4 opacity-90" />
                <span>Cash Collected</span>
              </div>
              <div className="text-lg font-bold font-mono">
                {storeSettings.currency} {totalSalesPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-[#e67e22] text-white p-3.5 shadow-xs flex flex-col justify-between h-22 rounded-none">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 opacity-90" />
                <span>Credit Sales Due</span>
              </div>
              <div className="text-lg font-bold font-mono">
                {storeSettings.currency} {totalSalesCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-[#8e44ad] text-white p-3.5 shadow-xs flex flex-col justify-between h-22 rounded-none">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Receipt className="w-4 h-4 opacity-90" />
                <span>Total Discounts</span>
              </div>
              <div className="text-lg font-bold font-mono">
                {storeSettings.currency} {totalSalesDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Sales Table with Edit / Delete & Print */}
          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#002b49] text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                    <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                    <th className="py-2.5 px-3 font-semibold">Customer Name</th>
                    <th className="py-2.5 px-3 font-semibold">Items Sold</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Net Amount</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Paid Amount</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Manage / Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No sales found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 text-slate-700 transition-colors">
                        <td className="py-2.5 px-3 font-bold font-mono text-slate-900">
                          #{s.invoiceNo}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {s.date}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {s.customerName}
                          <span className="text-[10px] text-slate-400 block font-normal">{s.saleType}</span>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-slate-600">
                          {s.items.map((i) => `${i.name} (${i.qty})`).join(', ')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                          {storeSettings.currency} {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">
                          {storeSettings.currency} {s.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Receipt Print */}
                            <button
                              onClick={() => openThermalReceipt(s)}
                              className="p-1 text-slate-600 hover:text-[#0070ba] rounded hover:bg-slate-100"
                              title="Print Thermal / A4 Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {/* Edit Invoice */}
                            <button
                              onClick={() => setEditingSale(s)}
                              className="p-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100"
                              title="Edit Invoice Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete Invoice */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete Invoice #${s.invoiceNo}?`)) {
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PURCHASES TAB */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'purchases' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Purchases Valuation
                </span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
                  {storeSettings.currency} {totalPurchasesCost.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-sm">
                <Box className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Stock Units Received
                </span>
                <span className="text-xl font-extrabold text-blue-700 mt-0.5 block font-mono">
                  {totalPurchasesUnits.toLocaleString()} Units
                </span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-sm">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Purchase Entries
                </span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
                  {filteredPurchases.length} Records
                </span>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-700 rounded-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#002b49] text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Barcode</th>
                    <th className="py-2.5 px-3 font-semibold">Item / Medicine Name</th>
                    <th className="py-2.5 px-3 font-semibold">Distributor / Supplier</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Qty Received</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Cost Price</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total Cost</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No purchase records found in this range.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 text-slate-700 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{p.date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.barcode}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.itemName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{p.supplierName}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{p.qtyReceived}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {storeSettings.currency} {p.unitCostPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#002b49]">
                          {storeSettings.currency} {p.totalCost.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingPurchase(p)}
                              className="p-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100"
                              title="Edit Purchase Entry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete purchase record for "${p.itemName}"?`)) {
                                  deletePurchase(p.id);
                                }
                              }}
                              className="p-1 text-slate-600 hover:text-red-600 rounded hover:bg-slate-100"
                              title="Delete Record"
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
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. EXPENSES TAB */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                  Total Operating Expenses
                </span>
                <span className="text-xl font-extrabold text-red-600 mt-0.5 block font-mono">
                  {storeSettings.currency} {totalExpensesAmount.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-red-50 text-red-700 rounded-sm">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Vouchers Logged
                </span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
                  {filteredExpenses.length} Vouchers
                </span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#002b49] text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Description / Purpose</th>
                    <th className="py-2.5 px-3 font-semibold">Recorded By</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Expense Amount</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No expenses recorded for this selection.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50 text-slate-700 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{e.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{e.description}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{e.recordedBy}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                          {storeSettings.currency} {e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingExpense(e)}
                              className="p-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100"
                              title="Edit Expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete expense "${e.category}" (${e.amount})?`)) {
                                  deleteExpense(e.id);
                                }
                              }}
                              className="p-1 text-slate-600 hover:text-red-600 rounded hover:bg-slate-100"
                              title="Delete Expense"
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
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. SALE RETURNS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'returns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Total Refunds Issued
                </span>
                <span className="text-xl font-extrabold text-amber-700 mt-0.5 block font-mono">
                  {storeSettings.currency} {totalReturnsRefunded.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-sm">
                <RotateCcw className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Units Returned
                </span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
                  {totalReturnsUnits} Units
                </span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-sm">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#002b49] text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Barcode</th>
                    <th className="py-2.5 px-3 font-semibold">Medicine / Item Returned</th>
                    <th className="py-2.5 px-3 font-semibold">Reason</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Refund Amount</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No return records found.
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 text-slate-700 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{r.date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.barcode}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{r.itemName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.reason}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-800">{r.qty}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                          {storeSettings.currency} {r.refundAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingReturn(r)}
                              className="p-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100"
                              title="Edit Return Entry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete return for "${r.itemName}"?`)) {
                                  deleteReturn(r.id);
                                }
                              }}
                              className="p-1 text-slate-600 hover:text-red-600 rounded hover:bg-slate-100"
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
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. CUSTOMER KHATA LEDGER TAB */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'customer_ledger' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                  Total Credit Goods Given (Debit)
                </span>
                <span className="text-xl font-extrabold text-red-600 mt-0.5 block font-mono">
                  {storeSettings.currency} {totalCustomerDebit.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-red-50 text-red-700 rounded-sm">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Total Cash Received (Credit)
                </span>
                <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block font-mono">
                  {storeSettings.currency} {totalCustomerCredit.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Transactions Count
                </span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
                  {filteredCustomerTx.length} Entries
                </span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Date & Time</th>
                  <th className="py-2.5 px-3 font-bold">Ref #</th>
                  <th className="py-2.5 px-3 font-bold">Customer Account</th>
                  <th className="py-2.5 px-3 font-bold">Transaction Description & Items</th>
                  <th className="py-2.5 px-3 font-bold text-right">Debit (+Given)</th>
                  <th className="py-2.5 px-3 font-bold text-right">Credit (-Paid)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Khata Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomerTx.length > 0 ? (
                  filteredCustomerTx.map((tx) => {
                    const custObj = customers.find(
                      (c) => c.id === tx.customerId || c.name.toLowerCase() === tx.customerName.toLowerCase()
                    );

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-2.5 px-3 font-bold font-mono text-[11px] text-slate-800">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {tx.referenceNo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {tx.customerName}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{tx.description}</div>
                          {tx.itemsSummary && (
                            <div className="text-[11px] text-blue-900 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded-xs mt-0.5">
                              📦 {tx.itemsSummary}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                          {tx.debit > 0 ? `${storeSettings.currency} ${tx.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {tx.credit > 0 ? `${storeSettings.currency} ${tx.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {custObj && (
                            <button
                              onClick={() => setModalCustomer(custObj)}
                              className="bg-[#002b49] hover:bg-[#001f35] text-white font-bold px-2.5 py-1 text-[11px] rounded-xs transition-colors shadow-xs cursor-pointer"
                              title="Open full customer statement and edit vouchers"
                            >
                              Open Ledger & Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No customer transactions found for this date range / filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. SUPPLIER KHATA LEDGER TAB */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'supplier_ledger' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                  Total Purchases / Bills (Credit)
                </span>
                <span className="text-xl font-extrabold text-red-600 mt-0.5 block font-mono">
                  {storeSettings.currency} {totalSupplierPurchases.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-red-50 text-red-700 rounded-sm">
                <Box className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Total Payments Paid (Debit)
                </span>
                <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block font-mono">
                  {storeSettings.currency} {totalSupplierPayments.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-sm">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Logged Bills & Payments
                </span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block font-mono">
                  {filteredSupplierTx.length} Entries
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Date & Time</th>
                  <th className="py-2.5 px-3 font-bold">Bill #</th>
                  <th className="py-2.5 px-3 font-bold">Distributor / Supplier</th>
                  <th className="py-2.5 px-3 font-bold">Stock Received & Payment Description</th>
                  <th className="py-2.5 px-3 font-bold text-right">Purchase Bill (+Credit)</th>
                  <th className="py-2.5 px-3 font-bold text-right">Payment Paid (-Debit)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Supplier Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSupplierTx.length > 0 ? (
                  filteredSupplierTx.map((tx) => {
                    const supObj = suppliers.find(
                      (s) => s.id === tx.supplierId || s.name.toLowerCase() === tx.supplierName.toLowerCase()
                    );

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-2.5 px-3 font-bold font-mono text-[11px] text-slate-800">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {tx.referenceNo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {tx.supplierName}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{tx.description}</div>
                          {tx.itemsSummary && (
                            <div className="text-[11px] text-emerald-900 bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded-xs mt-0.5">
                              📦 {tx.itemsSummary}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                          {tx.credit > 0 ? `${storeSettings.currency} ${tx.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {tx.debit > 0 ? `${storeSettings.currency} ${tx.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {supObj && (
                            <button
                              onClick={() => setModalSupplier(supObj)}
                              className="bg-[#002b49] hover:bg-[#001f35] text-white font-bold px-2.5 py-1 text-[11px] rounded-xs transition-colors shadow-xs cursor-pointer"
                              title="Open full supplier statement and edit vouchers"
                            >
                              Open Ledger & Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No supplier transactions found for this date range / filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. STOCK & INVENTORY VALUATION TAB */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'stock' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Purchase Stock Valuation:</div>
              <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {storeSettings.currency} {inventoryPurchaseValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Retail Stock Valuation:</div>
              <div className="text-lg font-bold text-[#0070ba] mt-1 font-mono">
                {storeSettings.currency} {inventoryRetailValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Expected Gross Inventory Margin:</div>
              <div className="text-lg font-bold text-[#28a745] mt-1 font-mono">
                {storeSettings.currency} {potentialInventoryProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Barcode</th>
                  <th className="py-2.5 px-3 font-semibold">Product Name</th>
                  <th className="py-2.5 px-3 font-semibold">Company / Brand</th>
                  <th className="py-2.5 px-3 font-semibold text-center">In Stock</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Cost Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Retail Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Margin %</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Total Inventory Value</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const profitMargin =
                    p.retailPrice > 0
                      ? (((p.retailPrice - p.purchasePrice) / p.retailPrice) * 100).toFixed(1)
                      : '0.0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 text-slate-700 transition-colors">
                      <td className="py-2.5 px-3 font-mono">{p.barcode}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3">{p.company || p.category}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{p.stock}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{p.purchasePrice}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{p.retailPrice}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {profitMargin}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#0070ba] font-mono">
                        {storeSettings.currency} {(p.purchasePrice * p.stock).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="Edit Product Stock & Pricing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. PROFIT & LOSS STATEMENT TAB */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'profit_loss' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Comprehensive Profit & Loss Statement
                </h2>
                <p className="text-xs text-slate-500">
                  Period: {fromDate || 'Start'} to {toDate || 'Present'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 block">Net Estimated Profit:</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  {storeSettings.currency} {netEstimatedProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Financial Rows */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-700">
                  (+) Total Net Sales Revenue
                  <span className="text-[10px] text-slate-400 block font-normal">{filteredSales.length} Invoices finalized</span>
                </div>
                <div className="font-bold text-slate-900 text-sm font-mono">
                  {storeSettings.currency} {totalSalesRevenue.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100 text-red-700">
                <div>
                  <span className="font-semibold">(-) Total Purchases / Stock In Cost</span>
                  <span className="text-[10px] text-red-400 block font-normal">{filteredPurchases.length} Purchase bills received</span>
                </div>
                <div className="font-bold text-sm font-mono">
                  - {storeSettings.currency} {totalPurchasesCost.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100 text-red-700">
                <div>
                  <span className="font-semibold">(-) Total Store Operating Expenses</span>
                  <span className="text-[10px] text-red-400 block font-normal">{filteredExpenses.length} Expense vouchers logged</span>
                </div>
                <div className="font-bold text-sm font-mono">
                  - {storeSettings.currency} {totalExpensesAmount.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100 text-red-700">
                <div>
                  <span className="font-semibold">(-) Total Customer Sale Returns / Refunds</span>
                  <span className="text-[10px] text-red-400 block font-normal">{filteredReturns.length} Return transactions</span>
                </div>
                <div className="font-bold text-sm font-mono">
                  - {storeSettings.currency} {totalReturnsRefunded.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-xs border border-slate-200 mt-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">Net Store Profit / Loss</span>
                  <span className="text-[11px] text-slate-500 font-medium">Revenue - Purchases - Expenses - Refunds</span>
                </div>
                <div className={`font-black text-lg font-mono ${netEstimatedProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {storeSettings.currency} {netEstimatedProfit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EDIT MODAL: SALE INVOICE */}
      {/* ------------------------------------------------------------- */}
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
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#002b49] hover:bg-[#001f35] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EDIT MODAL: PURCHASE RECORD */}
      {/* ------------------------------------------------------------- */}
      {editingPurchase && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                ✏️ Edit Purchase Record ({editingPurchase.itemName})
              </span>
              <button onClick={() => setEditingPurchase(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updatePurchase({
                  ...editingPurchase,
                  totalCost: editingPurchase.unitCostPrice * editingPurchase.qtyReceived,
                });
                setEditingPurchase(null);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item / Medicine Name:</label>
                <input
                  type="text"
                  value={editingPurchase.itemName}
                  onChange={(e) => setEditingPurchase({ ...editingPurchase, itemName: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode:</label>
                  <input
                    type="text"
                    value={editingPurchase.barcode}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, barcode: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier / Distributor:</label>
                  <input
                    type="text"
                    value={editingPurchase.supplierName}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, supplierName: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qty Received:</label>
                  <input
                    type="number"
                    value={editingPurchase.qtyReceived}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, qtyReceived: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Cost Price:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingPurchase.unitCostPrice}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, unitCostPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Sale Price:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingPurchase.salePriceRetail}
                    onChange={(e) => setEditingPurchase({ ...editingPurchase, salePriceRetail: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPurchase(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#002b49] hover:bg-[#001f35] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Purchase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EDIT MODAL: EXPENSE RECORD */}
      {/* ------------------------------------------------------------- */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                ✏️ Edit Expense Voucher
              </span>
              <button onClick={() => setEditingExpense(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateExpense(editingExpense);
                setEditingExpense(null);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category:</label>
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                >
                  <option value="Electricity">Electricity Bill</option>
                  <option value="Store Rent">Store Rent</option>
                  <option value="Staff Salary">Staff Salary / Wages</option>
                  <option value="Tea & Refreshment">Tea & Refreshment</option>
                  <option value="Cleaning & Maintenance">Cleaning & Maintenance</option>
                  <option value="Transportation / Delivery">Transportation / Delivery</option>
                  <option value="Packaging Bags & Stationery">Packaging Bags & Stationery</option>
                  <option value="Software & Internet">Software & Internet</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Amount ({storeSettings.currency}):</label>
                <input
                  type="number"
                  step="any"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold text-red-600 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes:</label>
                <input
                  type="text"
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#002b49] hover:bg-[#001f35] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EDIT MODAL: RETURN RECORD */}
      {/* ------------------------------------------------------------- */}
      {editingReturn && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                ✏️ Edit Return Record ({editingReturn.itemName})
              </span>
              <button onClick={() => setEditingReturn(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateReturn(editingReturn);
                setEditingReturn(null);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name:</label>
                <input
                  type="text"
                  value={editingReturn.itemName}
                  onChange={(e) => setEditingReturn({ ...editingReturn, itemName: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Returned Qty:</label>
                  <input
                    type="number"
                    value={editingReturn.qty}
                    onChange={(e) => setEditingReturn({ ...editingReturn, qty: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Refund Amount ({storeSettings.currency}):</label>
                  <input
                    type="number"
                    step="any"
                    value={editingReturn.refundAmount}
                    onChange={(e) => setEditingReturn({ ...editingReturn, refundAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold text-red-600 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Return:</label>
                <input
                  type="text"
                  value={editingReturn.reason}
                  onChange={(e) => setEditingReturn({ ...editingReturn, reason: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingReturn(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#002b49] hover:bg-[#001f35] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Return</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EDIT MODAL: PRODUCT */}
      {/* ------------------------------------------------------------- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in fade-in text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                ✏️ Edit Product ({editingProduct.name})
              </span>
              <button onClick={() => setEditingProduct(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProduct(editingProduct);
                setEditingProduct(null);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name:</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">In-Stock Quantity:</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Brand:</label>
                  <input
                    type="text"
                    value={editingProduct.company}
                    onChange={(e) => setEditingProduct({ ...editingProduct, company: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase / Cost Price:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingProduct.purchasePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Price:</label>
                  <input
                    type="number"
                    step="any"
                    value={editingProduct.retailPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, retailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono font-bold text-emerald-700 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#002b49] hover:bg-[#001f35] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render Customer Ledger Modal if opened from Reports */}
      {modalCustomer && (
        <CustomerLedgerModal
          customer={modalCustomer}
          isOpen={!!modalCustomer}
          onClose={() => setModalCustomer(null)}
        />
      )}

      {/* Render Supplier Ledger Modal if opened from Reports */}
      {modalSupplier && (
        <SupplierLedgerModal
          supplier={modalSupplier}
          isOpen={!!modalSupplier}
          onClose={() => setModalSupplier(null)}
        />
      )}
    </div>
  );
};
