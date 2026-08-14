import React from 'react';
import {
  LayoutDashboard,
  FileText,
  RotateCcw,
  ClipboardList,
  WalletCards,
  Package,
  Tag,
  CalendarCheck,
  Receipt,
  BarChart3,
  Settings,
  Smartphone,
  LogOut,
  Pill,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, logout, setShowSyncModal } = usePOS();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'sale-invoice', label: 'Sale Invoice', icon: <FileText className="w-5 h-5" /> },
    { id: 'sale-return', label: 'Sale Return', icon: <RotateCcw className="w-5 h-5" /> },
    { id: 'bill-history', label: 'Bill History', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'credit-receive', label: 'Credit Receive', icon: <WalletCards className="w-5 h-5" /> },
    { id: 'purchase-stock', label: 'Purchase Stock', icon: <Package className="w-5 h-5" /> },
    { id: 'products', label: 'Products', icon: <Tag className="w-5 h-5" /> },
    { id: 'day-closing', label: 'Day Closing', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'pay-expense', label: 'Pay Expense', icon: <Receipt className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'store-settings', label: 'Store Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside
      id="pos-sidebar"
      className="w-64 min-w-[16rem] bg-[#002244] text-white flex flex-col justify-between select-none shadow-xl border-r border-[#001730] shrink-0"
    >
      {/* Brand Header */}
      <div>
        <div
          id="brand-header"
          onClick={() => setActiveTab('dashboard')}
          className="p-4 flex items-center gap-3 border-b border-[#003366] cursor-pointer hover:bg-[#002d59] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#0070ba] flex items-center justify-center text-white shadow-inner">
            <Pill className="w-6 h-6 rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide leading-none text-white flex items-center gap-1">
              MED POS
            </h1>
            <p className="text-xs text-[#7ec8e3] mt-1 font-medium">Pharmacy System</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav id="sidebar-nav" className="py-2 space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0078d7] text-white shadow-md font-semibold'
                    : 'text-slate-200 hover:bg-[#003366] hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-300'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div id="sidebar-footer" className="p-3 border-t border-[#003366] space-y-2">
        <button
          id="btn-android-sync"
          onClick={() => setShowSyncModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#28a745] hover:bg-[#218838] text-white font-semibold py-2 px-3 rounded shadow transition-all active:scale-[0.98] text-sm"
        >
          <Smartphone className="w-4 h-4" />
          <span>Android Sync</span>
        </button>

        <button
          id="btn-logout"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-[#dc3545] hover:bg-[#c82333] text-white font-semibold py-2 px-3 rounded shadow transition-all active:scale-[0.98] text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400 font-sans tracking-wide">
            © THE PAK HACKERS 2025
          </p>
        </div>
      </div>
    </aside>
  );
};
