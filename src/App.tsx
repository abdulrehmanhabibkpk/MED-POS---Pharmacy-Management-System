import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { MasterAdminView } from './components/MasterAdminView';
import { SaleInvoiceView } from './components/SaleInvoiceView';
import { SaleReturnView } from './components/SaleReturnView';
import { BillHistoryView } from './components/BillHistoryView';
import { CreditReceiveView } from './components/CreditReceiveView';
import { PurchaseStockView } from './components/PurchaseStockView';
import { ProductsView } from './components/ProductsView';
import { SuppliersView } from './components/SuppliersView';
import { CustomersView } from './components/CustomersView';
import { DayClosingView } from './components/DayClosingView';
import { PayExpenseView } from './components/PayExpenseView';
import { ReportsView } from './components/ReportsView';
import { StoreSettingsView } from './components/StoreSettingsView';
import { BarcodeLabelView } from './components/BarcodeLabelView';
import { PlanPRDView } from './components/PlanPRDView';
import { ReceiptModal } from './components/ReceiptModal';
import { AndroidSyncModal } from './components/AndroidSyncModal';
import { MobileScannerTerminal } from './components/MobileScannerTerminal';
import { ShieldAlert, LayoutDashboard, FileText, ClipboardList, Tag, Menu } from 'lucide-react';
import { ActiveTab } from './types';

const MainLayout: React.FC = () => {
  const { isAuthenticated, activeTab, setActiveTab, userRole, currentUser } = usePOS();
  const [showMobileScanner, setShowMobileScanner] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if opened with ?mode=scanner (PWA shortcut or Android launcher)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'scanner') {
        setShowMobileScanner(true);
      }
    }

    const handleOpenMobileScanner = () => {
      setShowMobileScanner(true);
    };

    window.addEventListener('open-mobile-scanner', handleOpenMobileScanner);
    return () => {
      window.removeEventListener('open-mobile-scanner', handleOpenMobileScanner);
    };
  }, []);

  // If user opens the Android Scanner Gun Terminal view directly via PWA or button
  if (showMobileScanner) {
    return <MobileScannerTerminal onBack={() => setShowMobileScanner(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'sale-invoice':
        return 'New Sale Invoice';
      case 'sale-return':
        return 'Sale Return / Refund';
      case 'bill-history':
        return 'Bill History';
      case 'credit-receive':
        return 'Credit Receive / Khata';
      case 'purchase-stock':
        return 'Purchase / Stock Receiving';
      case 'products':
        return 'Products Management';
      case 'suppliers':
        return 'Suppliers Registry & Payables';
      case 'customers':
        return 'Customers Credit Ledger (Khata Book)';
      case 'barcode-label':
        return 'Sticker Barcode Label Generator';
      case 'day-closing':
        return 'Day Closing Report';
      case 'pay-expense':
        return 'Pay Daily Expense';
      case 'reports':
        return 'Reports Analytics';
      case 'store-settings':
        return 'Store Business Settings';
      case 'plan-prd':
        return 'Interactive POS Roadmap & PRD Plan';
      case 'master-admin':
        return 'Master Admin Panel';
      default:
        return 'Dashboard';
    }
  };

  const hasAccess = (): boolean => {
    if (currentUser) {
      // Custom permissions based check
      if (activeTab === 'sale-invoice' && !currentUser.permissions.canSale) return false;
      if (activeTab === 'sale-return' && !currentUser.permissions.canReturn) return false;
      if (activeTab === 'products' && !currentUser.permissions.canStock) return false;
      if (activeTab === 'purchase-stock' && !currentUser.permissions.canStock) return false;
      if (activeTab === 'store-settings' && !currentUser.permissions.canSettings) return false;
      if (activeTab === 'reports' && !currentUser.permissions.canReports) return false;
      if (activeTab === 'day-closing' && !currentUser.permissions.canReports) return false;
      if (activeTab === 'pay-expense' && !currentUser.permissions.canExpenses) return false;
      
      // 'master-admin' is ONLY for Master Admin
      if (activeTab === 'master-admin' && currentUser.email.toLowerCase() !== 'alitrader@gmail.com') {
        return false;
      }
    } else {
      // Fallback
      if (userRole === 'Cashier') {
        const cashierAllowed: ActiveTab[] = ['dashboard', 'sale-invoice', 'sale-return', 'bill-history', 'barcode-label', 'plan-prd'];
        return cashierAllowed.includes(activeTab);
      }
      if (userRole === 'Manager') {
        const managerRestricted: ActiveTab[] = ['store-settings', 'master-admin'];
        return !managerRestricted.includes(activeTab);
      }
    }
    return true;
  };

  const PermissionShield = () => (
    <div className="flex items-center justify-center min-h-[400px] p-6 bg-[#f4f7fa]">
      <div className="bg-white p-8 max-w-md w-full text-center space-y-4 border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Permission Restricted</h3>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            The view <strong className="text-slate-700">"{getPageTitle()}"</strong> requires higher security clearance than your active <strong className="text-slate-700">"{userRole}"</strong> role session.
          </p>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            You can elevate your privileges instantly inside the <span className="font-semibold text-[#0070ba] cursor-pointer hover:underline" onClick={() => setActiveTab('plan-prd')}>Interactive Plan</span> switcher.
          </p>
        </div>
        <div className="pt-2 flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded transition-all"
          >
            Go Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plan-prd')}
            className="bg-[#0070ba] hover:bg-[#005a96] text-white text-xs font-bold py-2 px-4 rounded shadow transition-all"
          >
            Switch Role
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7fa]">
      {/* Sidebar - static on desktop, sliding drawer with overlay on mobile */}
      <Sidebar 
        isOpenOnMobile={mobileSidebarOpen} 
        onCloseMobile={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          title={getPageTitle()} 
          onMenuClick={() => setMobileSidebarOpen(true)} 
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {!hasAccess() ? (
            <PermissionShield />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'sale-invoice' && <SaleInvoiceView />}
              {activeTab === 'sale-return' && <SaleReturnView />}
              {activeTab === 'bill-history' && <BillHistoryView />}
              {activeTab === 'credit-receive' && <CreditReceiveView />}
              {activeTab === 'purchase-stock' && <PurchaseStockView />}
              {activeTab === 'products' && <ProductsView />}
              {activeTab === 'suppliers' && <SuppliersView />}
              {activeTab === 'customers' && <CustomersView />}
              {activeTab === 'barcode-label' && <BarcodeLabelView />}
              {activeTab === 'day-closing' && <DayClosingView />}
              {activeTab === 'pay-expense' && <PayExpenseView />}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'store-settings' && <StoreSettingsView />}
              {activeTab === 'plan-prd' && <PlanPRDView />}
              {activeTab === 'master-admin' && <MasterAdminView />}
            </>
          )}
        </main>

        {/* Bottom Tab Bar for Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg flex justify-around items-center h-16 px-2 z-30 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
              activeTab === 'dashboard' ? 'text-[#0070ba] font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sale-invoice')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
              activeTab === 'sale-invoice' ? 'text-[#0070ba] font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">New Sale</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bill-history')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
              activeTab === 'bill-history' ? 'text-[#0070ba] font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <ClipboardList className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
              activeTab === 'products' ? 'text-[#0070ba] font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <Tag className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Products</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 font-medium"
          >
            <Menu className="w-5 h-5 mb-0.5 text-slate-600" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </div>

      {/* Global Modals */}
      <ReceiptModal />
      <AndroidSyncModal />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
