import React, { useState } from 'react';
import {
  LayoutGrid,
  FileText,
  RotateCcw,
  ClipboardList,
  Mail,
  Box,
  Tag,
  Truck,
  Users,
  CalendarDays,
  BadgeDollarSign,
  BarChart3,
  Settings,
  Smartphone,
  LogOut,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenOnMobile, onCloseMobile }) => {
  const { activeTab, setActiveTab, logout, setShowSyncModal, userRole, currentUser } = usePOS();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'sale-invoice', label: 'SALE INVOICE', icon: <FileText className="w-5 h-5" /> },
    { id: 'sale-return', label: 'SALE RETURN', icon: <RotateCcw className="w-5 h-5" /> },
    { id: 'bill-history', label: 'BILL HISTORY', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'credit-receive', label: 'CREDIT RECEIVE', icon: <Mail className="w-5 h-5" /> },
    { id: 'purchase-stock', label: 'PURCHASE STOCK', icon: <Box className="w-5 h-5" /> },
    { id: 'products', label: 'PRODUCTS & INVENTORY', icon: <Tag className="w-5 h-5" /> },
    { id: 'suppliers', label: 'SUPPLIERS LIST', icon: <Truck className="w-5 h-5" /> },
    { id: 'customers', label: 'CUSTOMERS LEDGER', icon: <Users className="w-5 h-5" /> },
    { id: 'barcode-label', label: 'LABEL GENERATOR', icon: <Tag className="w-5 h-5" /> },
    { id: 'day-closing', label: 'DAY CLOSING', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'pay-expense', label: 'PAY EXPENSE', icon: <BadgeDollarSign className="w-5 h-5" /> },
    { id: 'reports', label: 'REPORTS & ANALYTICS', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'store-settings', label: 'SOFTWARE SETTINGS', icon: <Settings className="w-5 h-5" /> },
  ];

  if (currentUser?.email.toLowerCase() === 'alitrader@gmail.com') {
    navItems.unshift({
      id: 'master-admin',
      label: 'Master Admin Panel',
      icon: <Users className="w-5 h-5 text-amber-400 animate-pulse" />,
    });
  }

  const visibleNavItems = navItems.filter((item) => {
    if (currentUser?.email.toLowerCase() === 'alitrader@gmail.com') {
      return true;
    }
    
    if (currentUser) {
      switch (item.id) {
        case 'dashboard': return currentUser.permissions.canDashboard;
        case 'sale-invoice': return currentUser.permissions.canSale;
        case 'sale-return': return currentUser.permissions.canReturn;
        case 'bill-history': return currentUser.permissions.canBillHistory;
        case 'credit-receive': return currentUser.permissions.canCreditReceive;
        case 'purchase-stock': return currentUser.permissions.canPurchaseStock;
        case 'products': return currentUser.permissions.canProducts;
        case 'suppliers': return currentUser.permissions.canSuppliers;
        case 'customers': return currentUser.permissions.canCustomers;
        case 'barcode-label': return currentUser.permissions.canBarcodeLabel;
        case 'day-closing': return currentUser.permissions.canDayClosing;
        case 'pay-expense': return currentUser.permissions.canExpenses;
        case 'reports': return currentUser.permissions.canReports;
        case 'store-settings': return currentUser.permissions.canSettings;
        case 'plan-prd': return currentUser.permissions.canPlanPRD;
        default: return true;
      }
    }
    
    if (userRole === 'Cashier') {
      const cashierAllowed: ActiveTab[] = ['dashboard', 'sale-invoice', 'sale-return', 'bill-history', 'barcode-label', 'plan-prd'];
      return cashierAllowed.includes(item.id);
    }
    if (userRole === 'Manager') {
      const managerRestricted: ActiveTab[] = ['store-settings', 'master-admin'];
      return !managerRestricted.includes(item.id);
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-slate-950/40 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="pos-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 min-w-[18rem] bg-white text-slate-800 flex flex-col justify-between select-none shadow-xl border-r border-slate-200/85 shrink-0 transition-all duration-300 transform md:translate-x-0 ${
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
            className="p-5 flex items-center justify-between border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all duration-150 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#1E3A8A] overflow-hidden shrink-0 border border-slate-200 shadow-inner p-1.5 transition-transform hover:scale-105">
                <img 
                  src="/WhatsApp_Image_2026-08-07_at_11.56.27_PM-removebg-preview.png" 
                  alt="LimoPOS Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'text-blue-600 font-black text-xs';
                      fallback.innerText = 'Limo';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 flex items-center gap-1.5">
                  <span>Limo<span className="text-blue-600">POS</span></span>
                </h1>
                <p className="text-[11px] text-slate-500 mt-1 font-bold uppercase tracking-wider">Enterprise System</p>
              </div>
            </div>
 
            {/* Mobile close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCloseMobile?.();
              }}
              className="md:hidden text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>
          {/* User Profile Block */}
          <div className="mx-4 mt-4 mb-3">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-[#3F83F8] flex items-center justify-center font-black text-white text-sm shrink-0 shadow-xs">
                  {userRole.charAt(0)}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-black text-slate-800 leading-tight uppercase tracking-wide truncate">
                    {currentUser?.name || userRole}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1.5 mt-0.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="truncate">{currentUser?.email || userRole}</span>
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1E429F] border border-blue-100 shrink-0">
                {userRole}
              </span>
            </div>
          </div>
 
          {/* Navigation List */}
          <nav id="sidebar-nav" className="py-2.5 space-y-1 px-3 max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar scroll-smooth">
            {visibleNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-extrabold tracking-wide transition-all uppercase duration-150 active:scale-98 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-500 hover:text-slate-900'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
 
        {/* Bottom Actions */}
        <div id="sidebar-footer" className="p-4 border-t border-slate-100 space-y-3">
          <button
            id="btn-android-sync"
            onClick={() => {
              setShowSyncModal(true);
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded-2xl shadow-md shadow-emerald-100 transition-all active:scale-98 text-xs uppercase tracking-wider"
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
            className="w-full flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-3 px-4 rounded-2xl shadow-md shadow-rose-100 transition-all active:scale-98 text-xs uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
 
          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
              © THE PAK HACKTES 2026
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
