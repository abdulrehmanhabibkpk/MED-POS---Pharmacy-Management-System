import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { SaleInvoiceView } from './components/SaleInvoiceView';
import { SaleReturnView } from './components/SaleReturnView';
import { BillHistoryView } from './components/BillHistoryView';
import { CreditReceiveView } from './components/CreditReceiveView';
import { PurchaseStockView } from './components/PurchaseStockView';
import { ProductsView } from './components/ProductsView';
import { DayClosingView } from './components/DayClosingView';
import { PayExpenseView } from './components/PayExpenseView';
import { ReportsView } from './components/ReportsView';
import { StoreSettingsView } from './components/StoreSettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { AndroidSyncModal } from './components/AndroidSyncModal';
import { MobileScannerTerminal } from './components/MobileScannerTerminal';

const MainLayout: React.FC = () => {
  const { isAuthenticated, activeTab } = usePOS();
  const [showMobileScanner, setShowMobileScanner] = useState(false);

  useEffect(() => {
    const handleOpenMobileScanner = () => {
      setShowMobileScanner(true);
    };

    window.addEventListener('open-mobile-scanner', handleOpenMobileScanner);
    return () => {
      window.removeEventListener('open-mobile-scanner', handleOpenMobileScanner);
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // If user opens the Android Scanner Gun Terminal view
  if (showMobileScanner) {
    return <MobileScannerTerminal onBack={() => setShowMobileScanner(false)} />;
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
      case 'day-closing':
        return 'Day Closing Report';
      case 'pay-expense':
        return 'Pay Daily Expense';
      case 'reports':
        return 'Reports Analytics';
      case 'store-settings':
        return 'Store Business Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7fa]">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header title={getPageTitle()} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'sale-invoice' && <SaleInvoiceView />}
          {activeTab === 'sale-return' && <SaleReturnView />}
          {activeTab === 'bill-history' && <BillHistoryView />}
          {activeTab === 'credit-receive' && <CreditReceiveView />}
          {activeTab === 'purchase-stock' && <PurchaseStockView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'day-closing' && <DayClosingView />}
          {activeTab === 'pay-expense' && <PayExpenseView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'store-settings' && <StoreSettingsView />}
        </main>
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
