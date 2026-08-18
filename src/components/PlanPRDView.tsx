import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  FileText,
  CheckCircle2,
  ListTodo,
  Terminal,
  Cpu,
  RefreshCw,
  ShieldAlert,
  Database,
  ArrowRight,
  Sparkles,
  User,
  Users
} from 'lucide-react';

export const PlanPRDView: React.FC = () => {
  const { userRole, setUserRole, products, sales, expenses, credits, returns, purchases } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<'blueprint' | 'roadmap' | 'specifications'>('blueprint');

  // Multi-User Interactive Simulation logs
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    `[SYSTEM INITIALIZATION] Offline-First local storage databases loaded successfully.`,
    `[SECURITY] Default session initialized with active user role: "${userRole}"`,
    `[MULTI-DEVICE] BroadcastChannel listener established on channel "med_pos_channel" for fast scanner sync.`,
    `[DATABASE] Loaded ${products.length} products, ${sales.length} invoices, and ${expenses.length} expense records.`,
  ]);

  const handleSimulateAction = (actionType: string) => {
    let logMsg = '';
    const now = new Date().toLocaleTimeString();
    switch (actionType) {
      case 'cashier_scan':
        logMsg = `[${now}] [CASHIER ACTION] Barcode scanned: "8801234567890" -> Synced cross-device to main sales counter cart.`;
        break;
      case 'manager_purchase':
        logMsg = `[${now}] [MANAGER ACTION] Stock purchase completed for "Panadol Extra". Total Cost: Rs. 1,200 (Supplier: GSK).`;
        break;
      case 'admin_z_report':
        logMsg = `[${now}] [ADMIN ACTION] Day closing Z-Report preview generated. Sales: Rs. ${sales.reduce((acc, s) => acc + s.netAmount, 0).toLocaleString()}, Cash Drawer matching.`;
        break;
      case 'db_export':
        logMsg = `[${now}] [SYSTEM ACTION] High-fidelity backup file structured. JSON payload serialized with checksums.`;
        break;
      default:
        logMsg = `[${now}] [SYSTEM ACTION] Action simulated.`;
    }
    setSimulationLogs((prev) => [logMsg, ...prev].slice(0, 10));
  };

  // Status of each feature in POS
  const roadmapFeatures = [
    { name: 'Dual-Rate Sales Billing (Retail & Wholesale)', status: 'COMPLETED', detail: 'Toggle active rates, instant subtotal calculation, automated discount sheets' },
    { name: 'Hardware Barcode Scanner Support (USB/Bluetooth Guns)', status: 'COMPLETED', detail: 'High performance listener capturing rapid inputs with automatic focus fallback' },
    { name: 'Mobile Barcode Scanner Terminal (Android PWA)', status: 'COMPLETED', detail: 'Using high-speed 60fps native BarcodeDetector API with Cross-Device real-time sync' },
    { name: 'Universal Dual thermal printing layout (80mm & 58mm)', status: 'COMPLETED', detail: 'Fully custom CSS @media print rules with logo and cashier metadata details' },
    { name: 'Sale Returns & Product Refund Management', status: 'COMPLETED', detail: 'Track returns, auto-increment inventory stock counters, calculate refund amount' },
    { name: 'Customer Credit Ledger & Payment Tracking (Khata)', status: 'COMPLETED', detail: 'Customer billing profiles, tracking total paid, outstanding receivables' },
    { name: 'Day Closing Sessions (Z-Reports)', status: 'COMPLETED', detail: 'Summarized cash desk closings, track hand-over cash drawers, report discrepancies' },
    { name: 'Supplier Purchases & Inventory Auto-Restock', status: 'COMPLETED', detail: 'Log wholesale supplier purchases, auto-update cost prices and retail pricing dynamically' },
    { name: 'Comprehensive Expense Trackings', status: 'COMPLETED', detail: 'Track daily business costs, group under standard heads, subtract from net margins' },
    { name: 'Role-Based Access Control (RBAC Switcher)', status: 'COMPLETED', detail: 'Restrict core actions/views dynamically based on logged in user: Admin, Manager, Cashier' },
    { name: 'Multi-Product Sticker Barcode Label Generator', status: 'COMPLETED', detail: 'Render custom sheets with scannable barcode elements, store name, retail rate' },
  ];

  return (
    <div className="p-4 md:p-6 bg-[#f4f7fa] min-h-full space-y-6">
      {/* Page Header Banner */}
      <div className="bg-[#002b49] text-white px-4 py-3 flex flex-wrap items-center justify-between shadow-xs gap-3">
        <div className="flex items-center gap-2 font-bold tracking-wide text-sm md:text-base">
          <FileText className="w-5 h-5 text-white animate-pulse" />
          <span>MED POS - HIGH FIDELITY PRODUCT REQUIREMENTS DOCUMENT (PRD) & BLUEPRINT</span>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[#001f35] px-3 py-1 rounded border border-[#004070] font-semibold">
          <Users className="w-3.5 h-3.5 text-lime-400" />
          <span>Active Session Role: <span className="text-[#00c0ff] font-bold uppercase">{userRole}</span></span>
        </div>
      </div>

      {/* Interactive Role Switcher Panel */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-none flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Interactive Role Switcher (Demonstrate RBAC Permissions)</span>
          </h4>
          <p className="text-slate-600 text-[11px] leading-tight">
            Click any role to swap access dynamically. This showcases the real-time permissions check embedded inside the POS components.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['Admin', 'Manager', 'Cashier'] as const).map((role) => (
            <button
              key={role}
              onClick={() => {
                setUserRole(role);
                handleSimulateAction(role === 'Admin' ? 'admin_z_report' : role === 'Manager' ? 'manager_purchase' : 'cashier_scan');
              }}
              className={`px-4 py-2 text-xs font-bold transition-all border shrink-0 ${
                userRole === role
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/50'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {role === 'Admin' && '👑 Admin Role'}
              {role === 'Manager' && '💼 Manager Role'}
              {role === 'Cashier' && '🛒 Cashier Role'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Checklist & Interactive Simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Side: PRD Checklist (8 columns) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 p-5 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex border-b border-slate-100 pb-2 mb-4 gap-4">
              <button
                onClick={() => setActiveSubTab('blueprint')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeSubTab === 'blueprint'
                    ? 'border-b-2 border-[#0070ba] text-[#0070ba]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1. System Architectural Blueprint
              </button>
              <button
                onClick={() => setActiveSubTab('roadmap')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeSubTab === 'roadmap'
                    ? 'border-b-2 border-[#0070ba] text-[#0070ba]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Interactive Feature Matrix ({roadmapFeatures.length}/{roadmapFeatures.length})
              </button>
              <button
                onClick={() => setActiveSubTab('specifications')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeSubTab === 'specifications'
                    ? 'border-b-2 border-[#0070ba] text-[#0070ba]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Hardware Specs & Thermal Printing Rules
              </button>
            </div>

            {/* TAB 1: SYSTEM BLUEPRINT */}
            {activeSubTab === 'blueprint' && (
              <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                <div className="bg-slate-50 p-4 border border-slate-200">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <Database className="w-4 h-4 text-[#0070ba]" />
                    <span>H fidelity Offline-First Local Database Design Schema</span>
                  </h4>
                  <p className="mb-3 text-[11px]">
                    The POS system runs 100% locally on the device with zero-delay loading states, automatically persisting state changes to browser high-fidelity serialized stores.
                  </p>
                  <pre className="bg-slate-900 text-slate-200 p-3 rounded-xs text-[10px] overflow-x-auto font-mono">
{`// Database Registry Keys (Stored in client state with automated recovery)
- medpos_products: [ { id, barcode, name, company, purchasePrice, retailPrice, stock } ]
- medpos_sales:    [ { id, invoiceNo, date, customerName, saleType, items, netAmount, paidAmount } ]
- medpos_purchases:[ { id, date, supplierName, qtyReceived, unitCostPrice, salePriceRetail } ]
- medpos_expenses: [ { id, date, category, amount, description, recordedBy } ]
- medpos_credits:  [ { id, date, customerName, amountReceived, notes } ]
- medpos_settings: [ { storeName, tagline, address, phone, currency, defaultPaperSize } ]`}
                  </pre>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <Cpu className="w-4 h-4 text-cyan-600" />
                    <span>Android Wireless Scanner Gun Integration Blueprint</span>
                  </h4>
                  <p className="text-[11px]">
                    Allows cashiers to utilize any Android smartphone camera as a wireless laser scanner gun syncing to the main sales desk instantaneously without any cables or physical setup!
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] mt-2">
                    <li>Cashier launches the <strong className="text-slate-800">MED Scanner Gun Terminal</strong> on an Android mobile device.</li>
                    <li>Mobile uses hardware-accelerated <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono text-[10px]">BarcodeDetector API</code> decoding UPC, EAN, and Code128 format at 60 frames per second.</li>
                    <li>On successful scan, Android vibrates, issues a barcode beep sound, and broadcasts a secure cross-domain payload.</li>
                    <li>PC Sales desk interceptor registers event instantly and pushes the product directly into the active checkout invoice list.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE FEATURE MATRIX */}
            {activeSubTab === 'roadmap' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-500 mb-2">
                  Double check the state of core point-of-sale business requirements below. All features are active and populated with mock transactional templates.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {roadmapFeatures.map((f, i) => (
                    <div key={i} className="p-3 border border-slate-100 bg-slate-50/50 flex gap-2.5 items-start">
                      <CheckCircle2 className="w-4 h-4 text-[#28a745] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-slate-800 leading-tight">{f.name}</div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{f.detail}</p>
                        <span className="inline-block mt-1.5 text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-xs">
                          {f.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SPECIFICATIONS */}
            {activeSubTab === 'specifications' && (
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="bg-slate-50 p-4 border border-slate-200">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span>Receipt Printers Compatible Hardware List</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>Xprinter XP-365B / XP-420B (Thermal sticker & barcode labels)</li>
                    <li>Epson TM-T88VI (80mm standard paper receipts)</li>
                    <li>Mini Portable Bluetooth thermal printer (58mm mobile slips)</li>
                    <li>Posiflex / Star Micronics parallel and network interfaces</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <FileText className="w-4 h-4 text-[#dc3545]" />
                    <span>Print Stylesheet CSS Override Configuration</span>
                  </h4>
                  <p className="text-[11px] mb-2">
                    Custom CSS overrides guarantee that receipts print perfectly on narrow paper rolls. All page-overflow blocks, sidebars, header navigations, and interactive buttons are hid automatically during execution.
                  </p>
                  <pre className="bg-slate-900 text-slate-200 p-3 rounded-xs text-[9px] overflow-x-auto font-mono">
{`@media print {
  body { background: white; color: black; font-size: 11px; }
  #pos-sidebar, #brand-header, #sidebar-nav, #sidebar-footer, header, form, button {
    display: none !important; /* Hide non-receipt controls */
  }
  #thermal-receipt-preview {
    width: 100% !important; max-width: 100% !important;
    padding: 0 !important; margin: 0 !important;
    box-shadow: none !important; border: none !important;
  }
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>MED POS System Architecture v3.1</span>
            <span className="font-semibold text-[#0070ba]">Verified & Sealed by THE PAK HACKERS</span>
          </div>
        </div>

        {/* Right Side: Interactive Simulation Terminal (4 columns) */}
        <div className="xl:col-span-4 bg-[#0d1b2a] border border-slate-800 p-5 rounded-none text-white flex flex-col justify-between min-h-[460px]">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>POS Event Simulation Terminal</span>
            </h3>

            {/* Quick Actions Panel */}
            <div className="space-y-2 mb-6">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Trigger Real-time Events:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateAction('cashier_scan')}
                  className="bg-slate-800 hover:bg-slate-700 text-left text-[11px] px-2.5 py-2 font-medium border border-slate-700 rounded-sm text-lime-400 active:scale-95 transition-all"
                >
                  ⚡ Scan Barcode
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAction('manager_purchase')}
                  className="bg-slate-800 hover:bg-slate-700 text-left text-[11px] px-2.5 py-2 font-medium border border-slate-700 rounded-sm text-cyan-400 active:scale-95 transition-all"
                >
                  📦 Restock Stock
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAction('admin_z_report')}
                  className="bg-slate-800 hover:bg-slate-700 text-left text-[11px] px-2.5 py-2 font-medium border border-slate-700 rounded-sm text-amber-400 active:scale-95 transition-all"
                >
                  📝 Day Close (Z)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAction('db_export')}
                  className="bg-slate-800 hover:bg-slate-700 text-left text-[11px] px-2.5 py-2 font-medium border border-slate-700 rounded-sm text-purple-400 active:scale-95 transition-all"
                >
                  💾 Export DB
                </button>
              </div>
            </div>

            {/* Console Log Area */}
            <div>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Live Console output:
              </span>
              <div className="bg-slate-950 p-3.5 border border-slate-800 text-[10.5px] font-mono rounded-xs h-60 overflow-y-auto space-y-2 select-text divide-y divide-slate-900">
                {simulationLogs.map((log, index) => {
                  let colorClass = 'text-slate-300';
                  if (log.includes('[SYSTEM INITIALIZATION]') || log.includes('[SYSTEM ACTION]')) {
                    colorClass = 'text-slate-400';
                  } else if (log.includes('CASHIER ACTION')) {
                    colorClass = 'text-lime-400';
                  } else if (log.includes('MANAGER ACTION')) {
                    colorClass = 'text-cyan-400';
                  } else if (log.includes('ADMIN ACTION')) {
                    colorClass = 'text-amber-400 text-semibold';
                  } else if (log.includes('[SECURITY]')) {
                    colorClass = 'text-purple-300';
                  }
                  return (
                    <div key={index} className={`pt-1.5 first:pt-0 ${colorClass}`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>Terminal: Active</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span>Online Sync Connected</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
