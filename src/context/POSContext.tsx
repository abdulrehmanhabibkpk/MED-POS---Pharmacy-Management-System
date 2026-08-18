import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  UserRole,
  Supplier,
  Customer,
  CustomerTransaction,
  SupplierTransaction,
  UserPermissions,
  UserAccount,
} from '../types';
import {
  initialProducts,
  initialSales,
  initialPurchases,
  initialCredits,
  initialExpenses,
  initialStoreSettings,
  initialCustomerTransactions,
  initialSupplierTransactions,
} from '../data/initialData';

interface POSContextType {
  isAuthenticated: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  importProducts: (newProducts: Product[]) => void;
  sales: SaleInvoice[];
  addSale: (sale: Omit<SaleInvoice, 'id' | 'invoiceNo'>) => SaleInvoice;
  updateSale: (sale: SaleInvoice) => void;
  deleteSale: (id: string) => void;
  returns: SaleReturn[];
  addReturn: (ret: Omit<SaleReturn, 'id' | 'date'>) => void;
  updateReturn: (ret: SaleReturn) => void;
  deleteReturn: (id: string) => void;
  purchases: PurchaseRecord[];
  addPurchase: (p: Omit<PurchaseRecord, 'id' | 'date'>) => void;
  updatePurchase: (p: PurchaseRecord) => void;
  deletePurchase: (id: string) => void;
  credits: CreditPayment[];
  addCredit: (c: Omit<CreditPayment, 'id' | 'date'>) => void;
  updateCredit: (c: CreditPayment) => void;
  deleteCredit: (id: string) => void;
  expenses: ExpenseRecord[];
  addExpense: (e: Omit<ExpenseRecord, 'id' | 'date'>) => void;
  updateExpense: (e: ExpenseRecord) => void;
  deleteExpense: (id: string) => void;
  suppliers: Supplier[];
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
  customerTransactions: CustomerTransaction[];
  addCustomerTransaction: (tx: Omit<CustomerTransaction, 'id'>) => void;
  updateCustomerTransaction: (tx: CustomerTransaction) => void;
  deleteCustomerTransaction: (id: string) => void;
  supplierTransactions: SupplierTransaction[];
  addSupplierTransaction: (tx: Omit<SupplierTransaction, 'id'>) => void;
  updateSupplierTransaction: (tx: SupplierTransaction) => void;
  deleteSupplierTransaction: (id: string) => void;
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
  userAccounts: UserAccount[];
  addUserAccount: (acc: Omit<UserAccount, 'id'>) => void;
  updateUserAccount: (acc: UserAccount) => void;
  deleteUserAccount: (id: string) => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const defaultAccounts: UserAccount[] = [
  {
    id: 'acc-master',
    name: 'Ali Trader (Master)',
    email: 'alitrader@gmail.com',
    password: 'alitrader',
    role: 'Admin',
    permissions: {
      canDashboard: true,
      canSale: true,
      canReturn: true,
      canBillHistory: true,
      canCreditReceive: true,
      canPurchaseStock: true,
      canProducts: true,
      canSuppliers: true,
      canCustomers: true,
      canBarcodeLabel: true,
      canDayClosing: true,
      canExpenses: true,
      canReports: true,
      canSettings: true,
      canPlanPRD: true,
    }
  },
  {
    id: 'acc-cashier',
    name: 'Asif Khan',
    email: 'cashier@gmail.com',
    password: 'cashier',
    role: 'Cashier',
    permissions: {
      canDashboard: true,
      canSale: true,
      canReturn: true,
      canBillHistory: true,
      canCreditReceive: false,
      canPurchaseStock: false,
      canProducts: false,
      canSuppliers: false,
      canCustomers: false,
      canBarcodeLabel: true,
      canDayClosing: false,
      canExpenses: false,
      canReports: false,
      canSettings: false,
      canPlanPRD: true,
    }
  },
  {
    id: 'acc-manager',
    name: 'Manager Malik',
    email: 'manager@gmail.com',
    password: 'manager',
    role: 'Manager',
    permissions: {
      canDashboard: true,
      canSale: true,
      canReturn: true,
      canBillHistory: true,
      canCreditReceive: true,
      canPurchaseStock: true,
      canProducts: true,
      canSuppliers: true,
      canCustomers: true,
      canBarcodeLabel: true,
      canDayClosing: true,
      canExpenses: true,
      canReports: true,
      canSettings: false,
      canPlanPRD: false,
    }
  }
];

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('medpos_user_accounts');
    return saved ? JSON.parse(saved) : defaultAccounts;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('medpos_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('medpos_auth');
    return saved ? JSON.parse(saved) : false; // Default false to enforce security based login
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('medpos_user_role');
    return (saved === 'Admin' || saved === 'Manager' || saved === 'Cashier') ? saved : 'Admin';
  });

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem('medpos_user_role', role);
  };

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

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('medpos_suppliers');
    return saved ? JSON.parse(saved) : [
      { id: 'sup-1', name: 'Al-Madina Medicine Distributors', company: 'GlaxoSmithKline & Getz Pharma', phone: '0300-1234567', email: 'madina@dist.com', address: 'Medicine Market, Lahore', balanceOwed: 45000 },
      { id: 'sup-2', name: 'Zaman Surgical & Pharma Store', company: 'Abbott Laboratories', phone: '0321-7654321', email: 'zaman@surgicals.com', address: 'Katchery Road, Multan', balanceOwed: 12000 },
      { id: 'sup-3', name: 'Global Health Wholesalers', company: 'Pfizer & Reckitt', phone: '0333-9876543', email: 'info@globalhealth.com', address: 'I.I Chundrigar Road, Karachi', balanceOwed: 0 },
    ];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('medpos_customers');
    return saved ? JSON.parse(saved) : [
      { id: 'cust-1', name: 'Muhammad Ali', phone: '0345-1112223', email: 'ali@gmail.com', address: 'Model Town, Lahore', balanceReceivable: 8500 },
      { id: 'cust-2', name: 'Dr. Tariq Mahmood', phone: '0312-3334445', email: 'tariq@health.com', address: 'Defense Phase 5, Karachi', balanceReceivable: 1500 },
      { id: 'cust-3', name: 'Ayesha Bibi (Regular)', phone: '0322-5556667', email: '', address: 'Samanabad, Lahore', balanceReceivable: 0 },
      { id: 'cust-4', name: 'Zahid Khan', phone: '0301-9998887', email: 'zahid@yahoo.com', address: 'Gulgasht Colony, Multan', balanceReceivable: 12000 },
    ];
  });

  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>(() => {
    const saved = localStorage.getItem('medpos_customer_transactions');
    return saved ? JSON.parse(saved) : initialCustomerTransactions;
  });

  const [supplierTransactions, setSupplierTransactions] = useState<SupplierTransaction[]>(() => {
    const saved = localStorage.getItem('medpos_supplier_transactions');
    return saved ? JSON.parse(saved) : initialSupplierTransactions;
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

  useEffect(() => {
    localStorage.setItem('medpos_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('medpos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('medpos_customer_transactions', JSON.stringify(customerTransactions));
  }, [customerTransactions]);

  useEffect(() => {
    localStorage.setItem('medpos_supplier_transactions', JSON.stringify(supplierTransactions));
  }, [supplierTransactions]);

  useEffect(() => {
    localStorage.setItem('medpos_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('medpos_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('medpos_current_user');
    }
  }, [currentUser]);

  const login = (u: string, p: string) => {
    const emailLower = u.trim().toLowerCase();
    const passwordLower = p.trim();

    // Look up in our custom accounts
    const found = userAccounts.find(
      (acc) => acc.email.trim().toLowerCase() === emailLower && acc.password === passwordLower
    );

    if (found) {
      setIsAuthenticated(true);
      setCurrentUser(found);
      setUserRole(found.role);
      if (emailLower === 'alitrader@gmail.com') {
        setActiveTab('master-admin');
      } else {
        setActiveTab('dashboard');
      }
      return true;
    }

    // Fallback default system accounts for testing/safety
    if (emailLower === 'admin' && passwordLower === 'admin') {
      const fallbackAdmin: UserAccount = {
        id: 'acc-fallback-admin',
        name: 'Default Admin',
        email: 'admin',
        password: 'admin',
        role: 'Admin',
        permissions: {
          canDashboard: true,
          canSale: true,
          canReturn: true,
          canBillHistory: true,
          canCreditReceive: true,
          canPurchaseStock: true,
          canProducts: true,
          canSuppliers: true,
          canCustomers: true,
          canBarcodeLabel: true,
          canDayClosing: true,
          canExpenses: true,
          canReports: true,
          canSettings: true,
          canPlanPRD: true,
        }
      };
      setIsAuthenticated(true);
      setCurrentUser(fallbackAdmin);
      setUserRole('Admin');
      setActiveTab('dashboard');
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addUserAccount = (acc: Omit<UserAccount, 'id'>) => {
    const newAcc: UserAccount = {
      ...acc,
      id: `acc-${Date.now()}`,
    };
    setUserAccounts((prev) => [...prev, newAcc]);
  };

  const updateUserAccount = (acc: UserAccount) => {
    setUserAccounts((prev) => prev.map((item) => (item.id === acc.id ? acc : item)));
    if (currentUser && currentUser.id === acc.id) {
      setCurrentUser(acc);
    }
  };

  const deleteUserAccount = (id: string) => {
    if (id === 'acc-master') return; // Do not delete Master Admin!
    setUserAccounts((prev) => prev.filter((item) => item.id !== id));
    if (currentUser && currentUser.id === id) {
      logout();
    }
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

  const importProducts = (newProducts: Product[]) => {
    setProducts((prev) => {
      const updated = [...prev];
      newProducts.forEach((newP) => {
        const idx = updated.findIndex((p) => p.barcode.trim() === newP.barcode.trim());
        if (idx !== -1) {
          // Keep existing ID, overwrite attributes
          updated[idx] = { ...updated[idx], ...newP };
        } else {
          updated.push({
            ...newP,
            id: newP.id || `p-${Date.now()}-${Math.floor(Math.random() * 100000)}`
          });
        }
      });
      return updated;
    });
  };

  const addSupplier = (s: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...s,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [newSup, ...prev]);
  };

  const updateSupplier = (s: Supplier) => {
    setSuppliers((prev) => prev.map((item) => (item.id === s.id ? s : item)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((item) => item.id !== id));
  };

  const addCustomer = (c: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [newCust, ...prev]);

    // If opening balance is entered, create an opening transaction
    if (c.balanceReceivable > 0) {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const opTx: CustomerTransaction = {
        id: `ctx-${Date.now()}`,
        customerId: newCust.id,
        customerName: newCust.name,
        date: formattedDate,
        type: 'OPENING_BALANCE',
        referenceNo: `#OP-${Math.floor(100 + Math.random() * 900)}`,
        description: 'Opening Khata Balance',
        itemsSummary: 'Opening account balance carried forward',
        debit: c.balanceReceivable,
        credit: 0,
        balance: c.balanceReceivable,
        paymentMethod: 'Cash',
        notes: 'Initial opening balance',
      };
      setCustomerTransactions((prev) => [opTx, ...prev]);
    }
  };

  const updateCustomer = (c: Customer) => {
    setCustomers((prev) => prev.map((item) => (item.id === c.id ? c : item)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((item) => item.id !== id));
    setCustomerTransactions((prev) => prev.filter((tx) => tx.customerId !== id));
  };

  const addCustomerTransaction = (txData: Omit<CustomerTransaction, 'id'>) => {
    const newTx: CustomerTransaction = {
      ...txData,
      id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    setCustomerTransactions((prev) => [newTx, ...prev]);

    // Sync Customer balance
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === txData.customerId || c.name.toLowerCase() === txData.customerName.toLowerCase()) {
          const delta = txData.debit - txData.credit;
          return { ...c, balanceReceivable: c.balanceReceivable + delta };
        }
        return c;
      })
    );
  };

  const updateCustomerTransaction = (updatedTx: CustomerTransaction) => {
    setCustomerTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
  };

  const deleteCustomerTransaction = (id: string) => {
    const target = customerTransactions.find((tx) => tx.id === id);
    if (target) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === target.customerId || c.name.toLowerCase() === target.customerName.toLowerCase()) {
            const delta = target.debit - target.credit;
            return { ...c, balanceReceivable: Math.max(0, c.balanceReceivable - delta) };
          }
          return c;
        })
      );
    }
    setCustomerTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const addSupplierTransaction = (txData: Omit<SupplierTransaction, 'id'>) => {
    const newTx: SupplierTransaction = {
      ...txData,
      id: `stx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    setSupplierTransactions((prev) => [newTx, ...prev]);

    // Sync Supplier balance
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === txData.supplierId || s.name.toLowerCase() === txData.supplierName.toLowerCase()) {
          const delta = txData.credit - txData.debit;
          return { ...s, balanceOwed: Math.max(0, s.balanceOwed + delta) };
        }
        return s;
      })
    );
  };

  const updateSupplierTransaction = (updatedTx: SupplierTransaction) => {
    setSupplierTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
  };

  const deleteSupplierTransaction = (id: string) => {
    const target = supplierTransactions.find((tx) => tx.id === id);
    if (target) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === target.supplierId || s.name.toLowerCase() === target.supplierName.toLowerCase()) {
            const delta = target.credit - target.debit;
            return { ...s, balanceOwed: Math.max(0, s.balanceOwed - delta) };
          }
          return s;
        })
      );
    }
    setSupplierTransactions((prev) => prev.filter((tx) => tx.id !== id));
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

  const updateSale = (updatedSale: SaleInvoice) => {
    setSales((prev) => prev.map((s) => (s.id === updatedSale.id ? updatedSale : s)));
  };

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
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

  const updateReturn = (updatedRet: SaleReturn) => {
    setReturns((prev) => prev.map((r) => (r.id === updatedRet.id ? updatedRet : r)));
  };

  const deleteReturn = (id: string) => {
    setReturns((prev) => prev.filter((r) => r.id !== id));
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

  const updatePurchase = (updatedPur: PurchaseRecord) => {
    setPurchases((prev) => prev.map((p) => (p.id === updatedPur.id ? updatedPur : p)));
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
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

  const updateCredit = (updatedCredit: CreditPayment) => {
    setCredits((prev) => prev.map((c) => (c.id === updatedCredit.id ? updatedCredit : c)));
  };

  const deleteCredit = (id: string) => {
    setCredits((prev) => prev.filter((c) => c.id !== id));
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

  const updateExpense = (updatedExpense: ExpenseRecord) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)));
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
    setCustomerTransactions(initialCustomerTransactions);
    setSupplierTransactions(initialSupplierTransactions);
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
      customerTransactions,
      supplierTransactions,
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
      if (parsed.customerTransactions) setCustomerTransactions(parsed.customerTransactions);
      if (parsed.supplierTransactions) setSupplierTransactions(parsed.supplierTransactions);
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
        userRole,
        setUserRole,
        activeTab,
        setActiveTab,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        importProducts,
        sales,
        addSale,
        updateSale,
        deleteSale,
        returns,
        addReturn,
        updateReturn,
        deleteReturn,
        purchases,
        addPurchase,
        updatePurchase,
        deletePurchase,
        credits,
        addCredit,
        updateCredit,
        deleteCredit,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        customerTransactions,
        addCustomerTransaction,
        updateCustomerTransaction,
        deleteCustomerTransaction,
        supplierTransactions,
        addSupplierTransaction,
        updateSupplierTransaction,
        deleteSupplierTransaction,
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
        userAccounts,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount,
        currentUser,
        setCurrentUser,
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
