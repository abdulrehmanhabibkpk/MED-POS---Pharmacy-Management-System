import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  SaleInvoice,
  SaleReturn,
  PurchaseRecord,
  CreditPayment,
  ExpenseRecord,
  StoreSettings,
  ActiveTab,
  ThermalPaperSize,
} from '../types';
import {
  initialProducts,
  initialSales,
  initialPurchases,
  initialCredits,
  initialExpenses,
  initialStoreSettings,
} from '../data/initialData';

interface POSContextType {
  isAuthenticated: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  sales: SaleInvoice[];
  addSale: (sale: Omit<SaleInvoice, 'id' | 'invoiceNo'>) => SaleInvoice;
  returns: SaleReturn[];
  addReturn: (ret: Omit<SaleReturn, 'id' | 'date'>) => void;
  purchases: PurchaseRecord[];
  addPurchase: (p: Omit<PurchaseRecord, 'id' | 'date'>) => void;
  credits: CreditPayment[];
  addCredit: (c: Omit<CreditPayment, 'id' | 'date'>) => void;
  expenses: ExpenseRecord[];
  addExpense: (e: Omit<ExpenseRecord, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;
  storeSettings: StoreSettings;
  updateStoreSettings: (s: StoreSettings) => void;
  previewInvoice: SaleInvoice | null;
  setPreviewInvoice: (invoice: SaleInvoice | null) => void;
  thermalPaperSize: ThermalPaperSize;
  setThermalPaperSize: (size: ThermalPaperSize) => void;
  openThermalReceipt: (invoice: SaleInvoice, size?: ThermalPaperSize) => void;
  showSyncModal: boolean;
  setShowSyncModal: (show: boolean) => void;
  resetToDefaults: () => void;
  exportDatabase: () => void;
  importDatabase: (jsonData: string) => boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('medpos_auth');
    return saved ? JSON.parse(saved) : true; // Default logged in for immediate viewing, or can toggle
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('medpos_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [sales, setSales] = useState<SaleInvoice[]>(() => {
    const saved = localStorage.getItem('medpos_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [returns, setReturns] = useState<SaleReturn[]>(() => {
    const saved = localStorage.getItem('medpos_returns');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('medpos_purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [credits, setCredits] = useState<CreditPayment[]>(() => {
    const saved = localStorage.getItem('medpos_credits');
    return saved ? JSON.parse(saved) : initialCredits;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('medpos_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('medpos_settings');
    return saved ? JSON.parse(saved) : initialStoreSettings;
  });

  const [previewInvoice, setPreviewInvoice] = useState<SaleInvoice | null>(null);
  const [thermalPaperSize, setThermalPaperSize] = useState<ThermalPaperSize>(() => {
    const saved = localStorage.getItem('medpos_thermal_paper_size');
    return (saved === '58mm' || saved === '80mm') ? saved : (storeSettings.defaultPaperSize || '80mm');
  });
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('medpos_thermal_paper_size', thermalPaperSize);
  }, [thermalPaperSize]);
  useEffect(() => {
    localStorage.setItem('medpos_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('medpos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('medpos_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('medpos_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem('medpos_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('medpos_credits', JSON.stringify(credits));
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('medpos_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('medpos_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  const login = (u: string, _p: string) => {
    if (u.trim().length > 0) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...p,
      id: `p-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (p: Product) => {
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const addSale = (saleData: Omit<SaleInvoice, 'id' | 'invoiceNo'>): SaleInvoice => {
    const nextInvoiceNo = sales.length > 0 ? Math.max(...sales.map((s) => s.invoiceNo)) + 1 : 1;
    const newSale: SaleInvoice = {
      ...saleData,
      id: `inv-${Date.now()}`,
      invoiceNo: nextInvoiceNo,
    };

    // Deduct stock for each sold item
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = saleData.items.find(
          (item) => item.barcode.trim().toLowerCase() === prod.barcode.trim().toLowerCase()
        );
        if (soldItem) {
          const updatedStock = Math.max(0, prod.stock - soldItem.qty);
          return { ...prod, stock: updatedStock };
        }
        return prod;
      })
    );

    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const addReturn = (ret: Omit<SaleReturn, 'id' | 'date'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newReturn: SaleReturn = {
      ...ret,
      id: `ret-${Date.now()}`,
      date: formattedDate,
    };

    // Increase product stock back
    setProducts((prev) =>
      prev.map((p) => {
        if (p.barcode.trim().toLowerCase() === ret.barcode.trim().toLowerCase()) {
          return { ...p, stock: p.stock + ret.qty };
        }
        return p;
      })
    );

    setReturns((prev) => [newReturn, ...prev]);
  };

  const addPurchase = (pur: Omit<PurchaseRecord, 'id' | 'date'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newPurchase: PurchaseRecord = {
      ...pur,
      id: `pur-${Date.now()}`,
      date: formattedDate,
    };

    // Update product stock and prices if product exists, or create product if not
    setProducts((prev) => {
      const existing = prev.find((p) => p.barcode.trim().toLowerCase() === pur.barcode.trim().toLowerCase());
      if (existing) {
        return prev.map((p) => {
          if (p.id === existing.id) {
            return {
              ...p,
              stock: p.stock + pur.qtyReceived,
              purchasePrice: pur.unitCostPrice > 0 ? pur.unitCostPrice : p.purchasePrice,
              retailPrice: pur.salePriceRetail > 0 ? pur.salePriceRetail : p.retailPrice,
              wholesalePrice: pur.wholesalePrice > 0 ? pur.wholesalePrice : p.wholesalePrice,
            };
          }
          return p;
        });
      } else {
        const created: Product = {
          id: `p-${Date.now()}`,
          barcode: pur.barcode,
          name: pur.itemName,
          company: pur.supplierName || 'General',
          category: 'General',
          purchasePrice: pur.unitCostPrice,
          retailPrice: pur.salePriceRetail,
          wholesalePrice: pur.wholesalePrice,
          stock: pur.qtyReceived,
          minStockAlert: 10,
        };
        return [created, ...prev];
      }
    });

    setPurchases((prev) => [newPurchase, ...prev]);
  };

  const addCredit = (c: Omit<CreditPayment, 'id' | 'date'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newCredit: CreditPayment = {
      ...c,
      id: `c-${Date.now()}`,
      date: formattedDate,
    };
    setCredits((prev) => [newCredit, ...prev]);
  };

  const addExpense = (e: Omit<ExpenseRecord, 'id' | 'date'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newExpense: ExpenseRecord = {
      ...e,
      id: `exp-${Date.now()}`,
      date: formattedDate,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const updateStoreSettings = (s: StoreSettings) => {
    setStoreSettings(s);
  };

  const resetToDefaults = () => {
    setProducts(initialProducts);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setCredits(initialCredits);
    setExpenses(initialExpenses);
    setReturns([]);
    setStoreSettings(initialStoreSettings);
    localStorage.clear();
  };

  const exportDatabase = () => {
    const data = {
      products,
      sales,
      returns,
      purchases,
      credits,
      expenses,
      storeSettings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medpos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.sales) setSales(parsed.sales);
      if (parsed.returns) setReturns(parsed.returns);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.credits) setCredits(parsed.credits);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.storeSettings) setStoreSettings(parsed.storeSettings);
      return true;
    } catch {
      return false;
    }
  };

  const openThermalReceipt = (invoice: SaleInvoice, size?: ThermalPaperSize) => {
    if (size) {
      setThermalPaperSize(size);
    }
    setPreviewInvoice(invoice);
  };

  return (
    <POSContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        activeTab,
        setActiveTab,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        sales,
        addSale,
        returns,
        addReturn,
        purchases,
        addPurchase,
        credits,
        addCredit,
        expenses,
        addExpense,
        deleteExpense,
        storeSettings,
        updateStoreSettings,
        previewInvoice,
        setPreviewInvoice,
        thermalPaperSize,
        setThermalPaperSize,
        openThermalReceipt,
        showSyncModal,
        setShowSyncModal,
        resetToDefaults,
        exportDatabase,
        importDatabase,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
