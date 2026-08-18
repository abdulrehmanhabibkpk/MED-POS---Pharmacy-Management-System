import React, { useState } from 'react';
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
  Truck,
  Users,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenOnMobile, onCloseMobile }) => {
  const { activeTab, setActiveTab, logout, setShowSyncModal, userRole, setUserRole, currentUser } = usePOS();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'sale-invoice', label: 'Sale Invoice', icon: <FileText className="w-5 h-5" /> },
    { id: 'sale-return', label: 'Sale Return', icon: <RotateCcw className="w-5 h-5" /> },
    { id: 'bill-history', label: 'Bill History', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'credit-receive', label: 'Credit Receive', icon: <WalletCards className="w-5 h-5" /> },
    { id: 'purchase-stock', label: 'Purchase Stock', icon: <Package className="w-5 h-5" /> },
    { id: 'products', label: 'Products', icon: <Tag className="w-5 h-5" /> },
    { id: 'suppliers', label: 'Suppliers List', icon: <Truck className="w-5 h-5" /> },
    { id: 'customers', label: 'Customers Ledger', icon: <Users className="w-5 h-5" /> },
    { id: 'barcode-label', label: 'Label Generator', icon: <Tag className="w-5 h-5" /> },
    { id: 'day-closing', label: 'Day Closing', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'pay-expense', label: 'Pay Expense', icon: <Receipt className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'store-settings', label: 'Store Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  if (currentUser?.email.toLowerCase() === 'alitrader@gmail.com') {
    navItems.unshift({
      id: 'master-admin',
      label: 'Master Admin Panel',
      icon: <Users className="w-5 h-5 text-amber-300" />,
    });
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-all duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="pos-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 min-w-[16rem] bg-[#002244] text-white flex flex-col justify-between select-none shadow-xl border-r border-[#001730] shrink-0 transition-transform duration-300 md:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div
            id="brand-header"
            onClick={() => {
              setActiveTab('dashboard');
              onCloseMobile?.();
            }}
            className="p-4 flex items-center justify-between border-b border-[#003366] cursor-pointer hover:bg-[#002d59] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0070ba] flex items-center justify-center text-white shadow-inner">
                <Pill className="w-6 h-6 rotate-45" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-wide leading-none text-white flex items-center gap-1">
                  HACKTES POS
                </h1>
                <p className="text-xs text-[#7ec8e3] mt-1 font-medium">Pharmacy System</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCloseMobile?.();
              }}
              className="md:hidden text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {/* User Role Indicator Profile Block */}
          <div className="relative mx-3 mt-3 mb-2">
            <div
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="p-3 bg-[#001c38] border border-[#003366] rounded-sm flex items-center justify-between gap-2.5 cursor-pointer hover:bg-[#002850] transition-colors"
              title="Click to Switch User Role"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-[#0070ba] flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {userRole.charAt(0)}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-white leading-tight uppercase tracking-wider">{userRole} Session</div>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ID: {userRole === 'Admin' ? 'PK-001' : userRole === 'Manager' ? 'PK-002' : 'PK-003'}
                  </span>
                </div>
              </div>
              <span className="text-slate-400 text-xs">▼</span>
            </div>

            {/* Role selection dropdown */}
            {showRoleDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-white text-slate-800 border border-slate-200 shadow-xl rounded-sm z-55 overflow-hidden text-xs">
                <div className="p-1.5 bg-slate-100 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  Switch Active Role
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('Admin');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 font-semibold flex items-center justify-between ${
                    userRole === 'Admin' ? 'bg-slate-100 text-[#0070ba]' : 'text-slate-700'
                  }`}
                >
                  <span>👑 Admin Role</span>
                  {userRole === 'Admin' && <span className="text-[#0070ba] font-bold">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('Manager');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 font-semibold flex items-center justify-between ${
                    userRole === 'Manager' ? 'bg-slate-100 text-[#0070ba]' : 'text-slate-700'
                  }`}
                >
                  <span>💼 Manager Role</span>
                  {userRole === 'Manager' && <span className="text-[#0070ba] font-bold">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserRole('Cashier');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 font-semibold flex items-center justify-between ${
                    userRole === 'Cashier' ? 'bg-slate-100 text-[#0070ba]' : 'text-slate-700'
                  }`}
                >
                  <span>🛒 Cashier Role</span>
                  {userRole === 'Cashier' && <span className="text-[#0070ba] font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Navigation List */}
          <nav id="sidebar-nav" className="py-2 space-y-0.5 px-2 max-h-[calc(100vh-270px)] overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile?.();
                  }}
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
            onClick={() => {
              setShowSyncModal(true);
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#28a745] hover:bg-[#218838] text-white font-semibold py-2 px-3 rounded shadow transition-all active:scale-[0.98] text-sm"
          >
            <Smartphone className="w-4 h-4" />
            <span>Android Sync</span>
          </button>

          <button
            id="btn-logout"
            onClick={() => {
              logout();
              onCloseMobile?.();
            }}
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
    </>
  );
};
