import React, { useState } from 'react';
import {
  X,
  Printer,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  Wallet,
  FileText,
  TrendingDown,
  TrendingUp,
  Download,
  Check,
  Phone,
  MapPin,
  Clock,
  Search,
  Receipt,
  Mail
} from 'lucide-react';
import { Supplier, SupplierTransaction } from '../types';
import { usePOS } from '../context/POSContext';

interface SupplierLedgerModalProps {
  supplier: Supplier;
  isOpen: boolean;
  onClose: () => void;
}

export const SupplierLedgerModal: React.FC<SupplierLedgerModalProps> = ({
  supplier,
  isOpen,
  onClose,
}) => {
  const {
    supplierTransactions,
    addSupplierTransaction,
    updateSupplierTransaction,
    deleteSupplierTransaction,
    storeSettings,
  } = usePOS();

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Entry Modal
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SupplierTransaction | null>(null);

  // Form Fields
  const [entryDate, setEntryDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  });
  const [entryType, setEntryType] = useState<'PURCHASE_BILL' | 'PAYMENT_PAID' | 'OPENING_BALANCE' | 'PURCHASE_RETURN' | 'MANUAL_ADJUSTMENT'>('PAYMENT_PAID');
  const [entryRef, setEntryRef] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryItemsSummary, setEntryItemsSummary] = useState('');
  const [entryAmount, setEntryAmount] = useState<number>(0);
  const [entryPaymentMethod, setEntryPaymentMethod] = useState<string>('Cash');
  const [entryNotes, setEntryNotes] = useState('');

  if (!isOpen) return null;

  // Filter transactions for this supplier
  const allSupplierTx = supplierTransactions.filter(
    (tx) => tx.supplierId === supplier.id || tx.supplierName.toLowerCase() === supplier.name.toLowerCase()
  );

  // Sort chronologically (oldest to newest for running balance math)
  const sortedTx = [...allSupplierTx].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Compute running balance: +Credit (Stock received/Bill) -Debit (Payment made to supplier)
  let currentRunning = 0;
  const computedTx = sortedTx.map((tx) => {
    currentRunning += (tx.credit - tx.debit);
    return {
      ...tx,
      balance: Math.max(0, currentRunning),
    };
  });

  // Apply User Filters
  const filteredTx = computedTx.filter((tx) => {
    const txDateOnly = tx.date.slice(0, 10);
    if (fromDate && txDateOnly < fromDate) return false;
    if (toDate && txDateOnly > toDate) return false;
    if (filterType !== 'ALL' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchItems = (tx.itemsSummary || '').toLowerCase().includes(q);
      const matchRef = tx.referenceNo.toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      if (!matchDesc && !matchItems && !matchRef && !matchNotes) return false;
    }
    return true;
  });

  // Totals for filtered view
  const totalPurchasesBill = filteredTx.reduce((sum, tx) => sum + tx.credit, 0);
  const totalPaymentsPaid = filteredTx.reduce((sum, tx) => sum + tx.debit, 0);

  // Open Form to Add
  const handleOpenAddEntry = (type: 'PAYMENT_PAID' | 'PURCHASE_BILL' = 'PAYMENT_PAID') => {
    setEditingEntry(null);
    const now = new Date();
    setEntryDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
    setEntryType(type);
    setEntryRef(type === 'PAYMENT_PAID' ? `#PAY-${Math.floor(100 + Math.random() * 900)}` : `#PUR-${Math.floor(1000 + Math.random() * 9000)}`);
    setEntryDescription(type === 'PAYMENT_PAID' ? 'Payment Made to Supplier' : 'Purchase Bill / Stock Received');
    setEntryItemsSummary('');
    setEntryAmount(0);
    setEntryPaymentMethod('Cash');
    setEntryNotes('');
    setShowAddEntryModal(true);
  };

  // Open Form to Edit
  const handleOpenEditEntry = (tx: SupplierTransaction) => {
    setEditingEntry(tx);
    setEntryDate(tx.date);
    setEntryType(tx.type);
    setEntryRef(tx.referenceNo);
    setEntryDescription(tx.description);
    setEntryItemsSummary(tx.itemsSummary || '');
    setEntryAmount(tx.credit > 0 ? tx.credit : tx.debit);
    setEntryPaymentMethod(tx.paymentMethod || 'Cash');
    setEntryNotes(tx.notes || '');
    setShowAddEntryModal(true);
  };

  // Save Transaction
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    const isCredit = entryType === 'PURCHASE_BILL' || entryType === 'OPENING_BALANCE' || (entryType === 'MANUAL_ADJUSTMENT' && entryAmount > 0);
    const isDebit = entryType === 'PAYMENT_PAID' || entryType === 'PURCHASE_RETURN';

    const creditVal = isCredit ? entryAmount : 0;
    const debitVal = isDebit ? entryAmount : 0;

    if (editingEntry) {
      updateSupplierTransaction({
        ...editingEntry,
        date: entryDate,
        type: entryType,
        referenceNo: entryRef.trim() || `#STX-${Date.now().toString().slice(-4)}`,
        description: entryDescription.trim() || 'Supplier Ledger Entry',
        itemsSummary: entryItemsSummary.trim(),
        credit: creditVal,
        debit: debitVal,
        paymentMethod: entryPaymentMethod,
        notes: entryNotes.trim(),
      });
    } else {
      addSupplierTransaction({
        supplierId: supplier.id,
        supplierName: supplier.name,
        date: entryDate,
        type: entryType,
        referenceNo: entryRef.trim() || `#STX-${Date.now().toString().slice(-4)}`,
        description: entryDescription.trim() || 'Supplier Ledger Entry',
        itemsSummary: entryItemsSummary.trim(),
        credit: creditVal,
        debit: debitVal,
        balance: 0, // auto computed
        paymentMethod: entryPaymentMethod,
        notes: entryNotes.trim(),
      });
    }

    setShowAddEntryModal(false);
  };

  // Delete Transaction
  const handleDeleteEntry = (tx: SupplierTransaction) => {
    if (window.confirm(`Are you sure you want to delete entry "${tx.referenceNo} - ${tx.description}"?`)) {
      deleteSupplierTransaction(tx.id);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Reference No', 'Type', 'Description', 'Stock Received / Items Breakdown', 'Purchase Bill (Credit)', 'Payment Made (Debit)', 'Running Balance Owed', 'Payment Method', 'Notes'];
    const rows = filteredTx.map((tx) => [
      `"${tx.date}"`,
      `"${tx.referenceNo}"`,
      `"${tx.type}"`,
      `"${tx.description}"`,
      `"${(tx.itemsSummary || '').replace(/"/g, '""')}"`,
      tx.credit.toFixed(2),
      tx.debit.toFixed(2),
      tx.balance.toFixed(2),
      `"${tx.paymentMethod || ''}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Supplier_Ledger_${supplier.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Supplier Statement (A4 Voucher)
  const handlePrintStatement = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Please allow popups to print supplier statement.');
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Supplier Ledger Statement - ${supplier.name}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #1e293b; margin: 0; padding: 20px; line-height: 1.4; }
            .header-table { width: 100%; border-bottom: 2px solid #002b49; padding-bottom: 12px; margin-bottom: 15px; }
            .store-name { font-size: 22px; font-weight: 800; color: #002b49; text-transform: uppercase; margin: 0; }
            .store-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
            .statement-badge { background: #0f766e; color: #fff; padding: 6px 14px; font-size: 13px; font-weight: 700; border-radius: 4px; display: inline-block; }
            .supplier-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 15px; margin-bottom: 18px; display: flex; justify-content: space-between; }
            .supplier-info h3 { margin: 0 0 4px 0; font-size: 15px; color: #0f172a; font-weight: 700; }
            .supplier-info p { margin: 2px 0; color: #475569; font-size: 11px; }
            .balance-box { text-align: right; }
            .balance-box .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
            .balance-box .amount { font-size: 20px; font-weight: 800; color: ${supplier.balanceOwed > 0 ? '#b91c1c' : '#047857'}; margin-top: 2px; }
            .ledger-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .ledger-table th { background: #002b49; color: #ffffff; font-size: 11px; text-transform: uppercase; padding: 8px 6px; text-align: left; border: 1px solid #002b49; }
            .ledger-table td { padding: 8px 6px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: top; }
            .ledger-table tr:nth-child(even) { background: #f8fafc; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .summary-table { width: 360px; margin-left: auto; border-collapse: collapse; margin-bottom: 30px; }
            .summary-table td { padding: 6px 10px; border: 1px solid #cbd5e1; font-size: 12px; }
            .summary-table .header-row { background: #f1f5f9; font-weight: bold; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 15px; }
            .signature-line { width: 220px; border-top: 1px solid #94a3b8; text-align: center; font-size: 11px; color: #475569; padding-top: 5px; }
            .footer-note { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            .item-badge { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 2px 4px; border-radius: 3px; font-size: 10px; display: inline-block; margin-top: 3px; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <h1 class="store-name">${storeSettings.storeName}</h1>
                <div class="store-sub">${storeSettings.tagline || 'Pharmacy & General Store'}</div>
                <div class="store-sub">${storeSettings.address} | Phone: ${storeSettings.phone}</div>
              </td>
              <td class="text-right">
                <div class="statement-badge">SUPPLIER LEDGER STATEMENT</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${new Date().toLocaleString()}</div>
              </td>
            </tr>
          </table>

          <div class="supplier-card">
            <div class="supplier-info">
              <h3>${supplier.name} (${supplier.company || 'Pharmaceutical Distributor'})</h3>
              <p><strong>Phone:</strong> ${supplier.phone || 'N/A'}</p>
              <p><strong>Address:</strong> ${supplier.address || 'Distributor Depot'}</p>
              <p><strong>Statement Period:</strong> ${fromDate || 'Start'} to ${toDate || 'Present'}</p>
            </div>
            <div class="balance-box">
              <div class="label">Total Payable Balance Owed</div>
              <div class="amount">${storeSettings.currency} ${supplier.balanceOwed.toLocaleString()}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                ${supplier.balanceOwed > 0 ? '⚠️ Payable by Store' : 'All Clear / Settled'}
              </div>
            </div>
          </div>

          <table class="ledger-table">
            <thead>
              <tr>
                <th style="width: 15%;">Date & Time</th>
                <th style="width: 13%;">Bill / Ref #</th>
                <th style="width: 38%;">Description & Stock Received Breakdown</th>
                <th style="width: 11%;" class="text-right">Bill (+Credit)</th>
                <th style="width: 11%;" class="text-right">Paid (-Debit)</th>
                <th style="width: 12%;" class="text-right">Balance Owed</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTx.length > 0 ? filteredTx.map((tx) => `
                <tr>
                  <td>${tx.date}</td>
                  <td class="font-bold">${tx.referenceNo}</td>
                  <td>
                    <strong>${tx.description}</strong>
                    ${tx.itemsSummary ? `<br/><span class="item-badge">📦 ${tx.itemsSummary}</span>` : ''}
                    ${tx.paymentMethod ? `<br/><small style="color:#64748b;">Payment Mode: ${tx.paymentMethod}</small>` : ''}
                    ${tx.notes ? `<br/><small style="color:#64748b; font-style:italic;">Notes: ${tx.notes}</small>` : ''}
                  </td>
                  <td class="text-right font-bold" style="color: ${tx.credit > 0 ? '#b91c1c' : '#64748b'};">
                    ${tx.credit > 0 ? `${storeSettings.currency} ${tx.credit.toLocaleString()}` : '-'}
                  </td>
                  <td class="text-right font-bold" style="color: ${tx.debit > 0 ? '#047857' : '#64748b'};">
                    ${tx.debit > 0 ? `${storeSettings.currency} ${tx.debit.toLocaleString()}` : '-'}
                  </td>
                  <td class="text-right font-bold">
                    ${storeSettings.currency} ${tx.balance.toLocaleString()}
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" class="text-center" style="padding: 20px; color: #94a3b8;">
                    No transactions recorded for this supplier in selected period.
                  </td>
                </tr>
              `}
            </tbody>
          </table>

          <table class="summary-table">
            <tr class="header-row">
              <td colspan="2">Supplier Account Summary</td>
            </tr>
            <tr>
              <td>Total Stock Received / Bills (Total Purchases):</td>
              <td class="text-right font-bold" style="color: #b91c1c;">${storeSettings.currency} ${totalPurchasesBill.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Total Payments Made to Supplier:</td>
              <td class="text-right font-bold" style="color: #047857;">${storeSettings.currency} ${totalPaymentsPaid.toLocaleString()}</td>
            </tr>
            <tr style="background: #f8fafc; font-size: 13px;">
              <td class="font-bold">Net Closing Payable Balance:</td>
              <td class="text-right font-bold" style="color: #0f172a;">${storeSettings.currency} ${supplier.balanceOwed.toLocaleString()}</td>
            </tr>
          </table>

          <div class="signatures">
            <div class="signature-line">Supplier / Distributor Representative</div>
            <div class="signature-line">Store Owner / Manager Signature</div>
          </div>

          <div class="footer-note">
            ${storeSettings.footerNote || 'Thank you for your partnership. Official ledger statement of account.'}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 backdrop-blur-xs">
      <div className="bg-white max-w-6xl w-full h-[92vh] border border-slate-300 shadow-2xl flex flex-col animate-in fade-in text-slate-800 rounded-sm">
        {/* Top Header */}
        <div className="bg-[#002b49] text-white p-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/40 rounded-sm">
              <Building2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base tracking-wide">
                  Supplier Ledger & Purchases Statement
                </h2>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  Supplier ID: {supplier.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Detailed date-wise log of stock purchases, medicines received, payments paid & payables balance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintStatement}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5 rounded-xs transition-colors cursor-pointer shadow-xs"
              title="Print A4 Supplier Statement"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 rounded-xs transition-colors cursor-pointer"
              title="Export statement to CSV"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 hover:bg-slate-700/50 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Supplier Bio Info Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0 text-xs">
          {/* Col 1 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
              {supplier.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier Name</span>
              <span className="font-extrabold text-slate-800 text-sm">{supplier.name}</span>
              <span className="text-[10px] text-slate-500 block truncate">{supplier.company}</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact & Address</span>
            <div className="flex items-center gap-1 font-mono text-slate-700 mt-0.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{supplier.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate mt-0.5" title={supplier.address}>
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{supplier.address || 'Distributor'}</span>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchase History</span>
            <div className="text-slate-700 font-semibold mt-0.5">
              Recorded Bills: <span className="font-bold text-slate-900">{computedTx.length} Entries</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Total Stock Value: <span className="font-bold text-slate-800">{storeSettings.currency} {computedTx.reduce((s, t) => s + t.credit, 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Col 4 */}
          <div className="bg-white border border-slate-200 p-2.5 rounded-sm flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Payable Balance Owed</span>
              <span className={`text-base font-extrabold block ${supplier.balanceOwed > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {storeSettings.currency} {supplier.balanceOwed.toLocaleString()}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${supplier.balanceOwed > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {supplier.balanceOwed > 0 ? 'Payable' : 'Settled'}
            </span>
          </div>
        </div>

        {/* Filter and Action Controls Bar */}
        <div className="bg-white border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* From Date */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba]"
              />
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setFromDate(''); setToDate(''); }}
                className={`px-2.5 py-1 text-[11px] font-bold border transition-colors ${!fromDate && !toDate ? 'bg-[#002b49] text-white border-[#002b49]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setFromDate(today);
                  setToDate(today);
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
                  const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
                  setFromDate(startOfMonth);
                  setToDate(endOfMonth);
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                This Month
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search bill#, medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 pl-7 pr-3 py-1 text-xs text-slate-800 w-48 focus:outline-none focus:border-[#0070ba]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddEntry('PAYMENT_PAID')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 px-3 text-xs flex items-center gap-1.5 rounded-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment to Supplier</span>
            </button>
            <button
              onClick={() => handleOpenAddEntry('PURCHASE_BILL')}
              className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-1.5 px-3 text-xs flex items-center gap-1.5 rounded-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Purchase Bill / Stock</span>
            </button>
          </div>
        </div>

        {/* Ledger Table Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
          <div className="bg-white border border-slate-200 shadow-xs rounded-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#002b49] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Date & Time</th>
                  <th className="py-2.5 px-3 font-bold">Bill / Ref #</th>
                  <th className="py-2.5 px-3 font-bold">Purchase Description & Medicines Breakdown</th>
                  <th className="py-2.5 px-3 font-bold text-right">Purchase Bill (+Credit)</th>
                  <th className="py-2.5 px-3 font-bold text-right">Payment Paid (-Debit)</th>
                  <th className="py-2.5 px-3 font-bold text-right">Balance Owed</th>
                  <th className="py-2.5 px-3 font-bold text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.length > 0 ? (
                  filteredTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      {/* Date */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{tx.date}</span>
                        </div>
                      </td>

                      {/* Reference No */}
                      <td className="py-2.5 px-3 font-bold text-slate-800 font-mono text-[11px]">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                          {tx.referenceNo}
                        </span>
                      </td>

                      {/* Description & Items */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800 text-xs">
                          {tx.description}
                        </div>
                        {tx.itemsSummary && (
                          <div className="text-[11px] text-emerald-900 bg-emerald-50/70 border border-emerald-100 px-2 py-1 rounded-xs mt-1 leading-relaxed">
                            <span className="font-bold text-emerald-950">📦 Stock Received:</span> {tx.itemsSummary}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                          {tx.paymentMethod && (
                            <span>Mode: <strong className="text-slate-600">{tx.paymentMethod}</strong></span>
                          )}
                          {tx.notes && (
                            <span className="italic">Note: {tx.notes}</span>
                          )}
                        </div>
                      </td>

                      {/* Purchase Bill (Credit) */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {tx.credit > 0 ? (
                          <span className="font-black text-red-600">
                            +{storeSettings.currency} {tx.credit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Payment Paid (Debit) */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {tx.debit > 0 ? (
                          <span className="font-black text-emerald-700">
                            -{storeSettings.currency} {tx.debit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Running Balance */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={`font-black text-xs ${tx.balance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {storeSettings.currency} {tx.balance.toLocaleString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditEntry(tx)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(tx)}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">No supplier transactions found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Add a new purchase bill or payment using the buttons above.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary Row */}
        <div className="bg-slate-100 border-t border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Purchases In Period</span>
              <span className="font-black text-red-600 text-sm font-mono">
                {storeSettings.currency} {totalPurchasesBill.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Payments Paid In Period</span>
              <span className="font-black text-emerald-700 text-sm font-mono">
                {storeSettings.currency} {totalPaymentsPaid.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Net Balance Owed</span>
              <span className={`font-black text-sm font-mono ${supplier.balanceOwed > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {storeSettings.currency} {supplier.balanceOwed.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-1.5 rounded-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Ledger Entry Modal */}
      {showAddEntryModal && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl animate-in zoom-in-95 text-slate-800 rounded-xs">
            <div className="bg-[#002b49] text-white p-3 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                {editingEntry ? '✏️ Edit Supplier Ledger Entry' : '➕ Add Supplier Ledger Entry'}
              </span>
              <button onClick={() => setShowAddEntryModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="p-4 space-y-3 text-xs">
              {/* Type selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction Nature *:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEntryType('PAYMENT_PAID');
                      if (!editingEntry) setEntryDescription('Payment Made to Supplier');
                    }}
                    className={`py-2 px-3 text-xs font-bold text-center border rounded-xs transition-all ${
                      entryType === 'PAYMENT_PAID'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    💸 Payment Made to Supplier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntryType('PURCHASE_BILL');
                      if (!editingEntry) setEntryDescription('Stock Purchase Bill');
                    }}
                    className={`py-2 px-3 text-xs font-bold text-center border rounded-xs transition-all ${
                      entryType === 'PURCHASE_BILL'
                        ? 'bg-[#0078d7] text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📦 Add Purchase Bill / Stock
                  </button>
                </div>
              </div>

              {/* Date & Ref */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date & Time *:</label>
                  <input
                    type="text"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bill / Payment Ref #:</label>
                  <input
                    type="text"
                    value={entryRef}
                    onChange={(e) => setEntryRef(e.target.value)}
                    placeholder="e.g. #PAY-101 or #PUR-204"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              </div>

              {/* Amount & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount ({storeSettings.currency}) *:
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={entryAmount === 0 ? '' : entryAmount}
                    onChange={(e) => setEntryAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 15000"
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 font-bold text-sm focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method:</label>
                  <select
                    value={entryPaymentMethod}
                    onChange={(e) => setEntryPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                  >
                    <option value="Cash">Cash Handed</option>
                    <option value="Bank Transfer">Bank Online Transfer</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Easypaisa">Easypaisa / JazzCash</option>
                    <option value="Credit Bill">Credit Purchase Bill</option>
                  </select>
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Title *:</label>
                <input
                  type="text"
                  required
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                  placeholder="e.g. Paid against invoice #PUR-1002"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              {/* Items Summary */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Stock / Medicines Received Breakdown (Optional):
                </label>
                <textarea
                  rows={2}
                  value={entryItemsSummary}
                  onChange={(e) => setEntryItemsSummary(e.target.value)}
                  placeholder="e.g. Panadol Extra x 50 boxes (Rs 9,000), Augmentin x 20 (Rs 6,400)..."
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes:</label>
                <input
                  type="text"
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  placeholder="e.g. Handed to representative Aslam Bhai"
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddEntryModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
