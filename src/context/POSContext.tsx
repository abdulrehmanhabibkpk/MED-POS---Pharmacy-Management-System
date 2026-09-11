import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  UserAccount,
} from '../types';
import {
  initialStoreSettings,
  sampleSeedProducts,
  sampleSeedSuppliers,
  sampleSeedCustomers,
} from '../data/initialData';

interface POSContextType {
  storeId: string;
  isAuthenticated: boolean;
  login: (u: string, p: string) => boolean;
  loginWithFirebase: (u: string, p: string) => Promise<{ success: boolean; error?: string }>;
  registerWithFirebase: (u: string, p: string, name?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  resetPasswordFirebase: (email: string) => Promise<{ success: boolean; error?: string }>;
  firebaseUser: any | null;
  firebaseAuthLoading: boolean;
  isCloudSyncing: boolean;
  logout: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  addMultipleProducts: (newProducts: Omit<Product, 'id'>[]) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  bulkUpdateProducts: (updatedProducts: Product[]) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  importProducts: (newProducts: Product[]) => void;
  categories: string[];
  addCategory: (name: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  brands: string[];
  addBrand: (name: string) => void;
  updateBrand: (oldName: string, newName: string) => void;
  deleteBrand: (name: string) => void;
  sales: SaleInvoice[];
  addSale: (sale: Omit<SaleInvoice, 'id' | 'invoiceNo'>) => SaleInvoice;
  updateSale: (sale: SaleInvoice) => void;
  deleteSale: (id: string) => void;
  returns: SaleReturn[];
  addReturn: (ret: Omit<SaleReturn, 'id' | 'date'>) => void;
  updateReturn: (ret: SaleReturn) => void;
  deleteReturn: (id: string) => void;
  purchases: PurchaseRecord[];
  addPurchase: (p: Omit<PurchaseRecord, 'id' | 'date'>, mode?: 'update_existing' | 'create_batch') => void;
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
  clearAllTemporaryData: () => void;
  exportDatabase: () => void;
  importDatabase: (jsonData: string) => boolean;
  userAccounts: UserAccount[];
  addUserAccount: (acc: Omit<UserAccount, 'id'>) => void;
  updateUserAccount: (acc: UserAccount) => void;
  deleteUserAccount: (id: string) => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  seedSampleDataToCloud: () => Promise<{ success: boolean; count: number }>;
  syncAllToCloud: () => Promise<{ success: boolean }>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const defaultCategories = [
  'Pharmacy',
  'Medicines (Tablets)',
  'Syrups & Suspensions',
  'Injections & Drops',
  'Surgical & Dental',
  'General Items',
  'Cosmetics & Skin',
  'Baby Care',
  'Beverages & Food',
  'Snacks & Grocery',
];

const defaultBrands = [
  'GlaxoSmithKline (GSK)',
  'Abbott Laboratories',
  'Getz Pharma',
  'Pfizer Pakistan',
  'Reckitt Benckiser',
  'Sami Pharmaceuticals',
  'Searle Company',
  'Unilever',
  'Nestle Pakistan',
  'General / Local',
];

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // User Accounts
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('medpos_user_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('medpos_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('medpos_auth');
    return saved ? JSON.parse(saved) : false;
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

  // Core Data States - ISOLATED PER USER
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [credits, setCredits] = useState<CreditPayment[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(initialStoreSettings);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([]);
  const [supplierTransactions, setSupplierTransactions] = useState<SupplierTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [brands, setBrands] = useState<string[]>(defaultBrands);

  const [previewInvoice, setPreviewInvoice] = useState<SaleInvoice | null>(null);
  const [thermalPaperSize, setThermalPaperSize] = useState<ThermalPaperSize>(() => {
    const saved = localStorage.getItem('medpos_thermal_paper_size');
    return (saved === '58mm' || saved === '80mm') ? saved : (storeSettings.defaultPaperSize || '80mm');
  });
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  // Active user identifier (from Node.js auth)
  const activeUserId = currentUser?.id || 'default_user';
  const activeStoreId = currentUser?.storeId || `store_${activeUserId}`;

  // Sync auth state to local storage
  useEffect(() => {
    localStorage.setItem('medpos_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('medpos_current_user', JSON.stringify(currentUser));
      setFirebaseUser({
        uid: currentUser.id,
        email: currentUser.email,
        displayName: currentUser.name
      });
    } else {
      localStorage.removeItem('medpos_current_user');
      setFirebaseUser(null);
    }
  }, [currentUser]);

  // Load User Data from Hostinger Node.js & MySQL
  const loadUserDataFromMySQL = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsCloudSyncing(true);

    try {
      const collections = [
        'products',
        'sales',
        'returns',
        'purchases',
        'credits',
        'expenses',
        'suppliers',
        'customers',
        'customerTransactions',
        'supplierTransactions',
        'settings'
      ];

      const results = await Promise.allSettled(
        collections.map((col) => fetch(`/api/mysql/${userId}/${col}`).then((r) => r.json()))
      );

      results.forEach((res, idx) => {
        if (res.status === 'fulfilled' && res.value && res.value.success) {
          const colName = collections[idx];
          const data = res.value.data || [];

          if (colName === 'products') setProducts(data);
          else if (colName === 'sales') {
            data.sort((a: any, b: any) => (b.invoiceNo || 0) - (a.invoiceNo || 0));
            setSales(data);
          }
          else if (colName === 'returns') setReturns(data);
          else if (colName === 'purchases') setPurchases(data);
          else if (colName === 'credits') setCredits(data);
          else if (colName === 'expenses') setExpenses(data);
          else if (colName === 'suppliers') setSuppliers(data);
          else if (colName === 'customers') setCustomers(data);
          else if (colName === 'customerTransactions') setCustomerTransactions(data);
          else if (colName === 'supplierTransactions') setSupplierTransactions(data);
          else if (colName === 'settings' && data.length > 0) {
            const s = data[0];
            if (s.store_settings) setStoreSettings(s.store_settings);
            if (s.categories) setCategories(s.categories);
            if (s.brands) setBrands(s.brands);
          }
        }
      });
    } catch (err) {
      console.warn('MySQL data load notice:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  }, []);

  // Trigger load when authenticated user changes
  useEffect(() => {
    if (isAuthenticated && activeUserId) {
      loadUserDataFromMySQL(activeUserId);
    }
  }, [isAuthenticated, activeUserId, loadUserDataFromMySQL]);

  // Save Record Helper to Node.js & MySQL
  const saveToStorage = async (colName: string, docId: string, data: any) => {
    if (!activeUserId) return;
    try {
      const payload = {
        ...data,
        userId: activeUserId,
        storeId: activeStoreId,
        updatedAt: new Date().toISOString()
      };

      await fetch(`/api/mysql/${activeUserId}/${colName}/${docId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      console.warn(`Storage save note:`, err.message);
    }
  };

  const deleteFromStorage = async (colName: string, docId: string) => {
    if (!activeUserId) return;
    try {
      await fetch(`/api/mysql/${activeUserId}/${colName}/${docId}`, {
        method: 'DELETE'
      });
    } catch (err: any) {
      console.warn(`Storage delete note:`, err.message);
    }
  };

  // Node.js Native Login
  const login = (u: string, p: string) => {
    const emailLower = u.trim().toLowerCase();
    const passwordLower = p.trim();

    const found = userAccounts.find(
      (acc) => acc.email.trim().toLowerCase() === emailLower && acc.password === passwordLower
    );

    if (found) {
      setIsAuthenticated(true);
      setCurrentUser(found);
      setUserRole(found.role);
      setActiveTab('dashboard');
      return true;
    }

    return false;
  };

  // Node.js & MySQL Authentication
  const loginWithFirebase = async (u: string, p: string): Promise<{ success: boolean; error?: string }> => {
    const email = u.trim();
    const password = p.trim();
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!result.success) {
        return { success: false, error: result.error || 'Invalid credentials' };
      }

      const user = result.user;
      const newAccount: UserAccount = {
        id: user.id,
        storeId: `store_${user.id}`,
        name: user.name,
        email: user.email,
        role: (user.role as UserRole) || 'Admin',
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
        },
      };

      setCurrentUser(newAccount);
      setUserRole(newAccount.role);
      setIsAuthenticated(true);
      setActiveTab('dashboard');

      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: 'Failed to connect to authentication server' };
    }
  };

  // Node.js & MySQL Registration
  const registerWithFirebase = async (
    u: string,
    p: string,
    displayName?: string,
    role: UserRole = 'Cashier'
  ): Promise<{ success: boolean; error?: string }> => {
    const email = u.trim();
    const password = p.trim();
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: displayName, role })
      });

      const result = await response.json();
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to register account' };
      }

      const user = result.user;
      const newAccount: UserAccount = {
        id: user.id,
        storeId: `store_${user.id}`,
        name: user.name,
        email: user.email,
        role: (user.role as UserRole) || role,
        permissions: {
          canDashboard: true,
          canSale: true,
          canReturn: true,
          canBillHistory: true,
          canCreditReceive: role !== 'Cashier',
          canPurchaseStock: role !== 'Cashier',
          canProducts: role !== 'Cashier',
          canSuppliers: role !== 'Cashier',
          canCustomers: role !== 'Cashier',
          canBarcodeLabel: true,
          canDayClosing: role !== 'Cashier',
          canExpenses: role !== 'Cashier',
          canReports: role !== 'Cashier',
          canSettings: role === 'Admin',
          canPlanPRD: true,
        },
      };

      setCurrentUser(newAccount);
      setUserRole(newAccount.role);
      setIsAuthenticated(true);
      setActiveTab('dashboard');

      return { success: true };
    } catch (err: any) {
      console.error('Register error:', err);
      return { success: false, error: 'Failed to register account' };
    }
  };

  // Password Reset
  const resetPasswordFirebase = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { success: false, error: 'Please enter your email address' };
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed })
      });
      const data = await res.json();
      return { success: data.success, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setFirebaseUser(null);
    setProducts([]);
    setSales([]);
    setReturns([]);
    setPurchases([]);
    setCredits([]);
    setExpenses([]);
    setSuppliers([]);
    setCustomers([]);
    setCustomerTransactions([]);
    setSupplierTransactions([]);
    localStorage.removeItem('medpos_auth');
    localStorage.removeItem('medpos_current_user');
  };

  const addUserAccount = (acc: Omit<UserAccount, 'id'>) => {
    const newAcc: UserAccount = {
      ...acc,
      id: `acc-${Date.now()}`,
      storeId: acc.storeId || activeStoreId,
    };
    setUserAccounts((prev) => [...prev, newAcc]);
    saveToStorage('userAccounts', newAcc.id, newAcc);
  };

  const updateUserAccount = (acc: UserAccount) => {
    const updatedAcc = { ...acc, storeId: acc.storeId || activeStoreId };
    setUserAccounts((prev) => prev.map((item) => (item.id === acc.id ? updatedAcc : item)));
    if (currentUser && currentUser.id === acc.id) {
      setCurrentUser(updatedAcc);
    }
    saveToStorage('userAccounts', acc.id, updatedAcc);
  };

  const deleteUserAccount = (id: string) => {
    if (id === 'acc-master') return;
    setUserAccounts((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('userAccounts', id);
    if (currentUser && currentUser.id === id) {
      logout();
    }
  };

  // ==========================================
  // PRODUCTS & INVENTORY OPERATIONS
  // ==========================================
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...p,
      id: `p-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    saveToStorage('products', newProduct.id, newProduct);
  };

  const addMultipleProducts = (newProds: Omit<Product, 'id'>[]) => {
    const created: Product[] = newProds.map((p, idx) => ({
      ...p,
      id: `p-${Date.now()}-${idx}-${Math.floor(Math.random() * 100000)}`,
    }));
    setProducts((prev) => [...created, ...prev]);
    created.forEach((item) => {
      saveToStorage('products', item.id, item);
    });
  };

  const updateProduct = (p: Product) => {
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
    saveToStorage('products', p.id, p);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('products', id);
  };

  const bulkUpdateProducts = (updatedProds: Product[]) => {
    setProducts((prev) => {
      const map = new Map(updatedProds.map((p) => [p.id, p]));
      return prev.map((p) => map.get(p.id) || p);
    });
    updatedProds.forEach((prod) => {
      saveToStorage('products', prod.id, prod);
    });
  };

  const bulkDeleteProducts = (ids: string[]) => {
    const idSet = new Set(ids);
    setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
    ids.forEach((id) => {
      deleteFromStorage('products', id);
    });
  };

  const importProducts = (newProducts: Product[]) => {
    setProducts((prev) => {
      const updated = [...prev];
      newProducts.forEach((newP) => {
        const idx = updated.findIndex(
          (p) =>
            p.barcode.trim().toLowerCase() === newP.barcode.trim().toLowerCase() &&
            p.barcode.trim() !== ''
        );
        if (idx >= 0) {
          updated[idx] = { ...newP, id: updated[idx].id };
          saveToStorage('products', updated[idx].id, updated[idx]);
        } else {
          updated.push(newP);
          saveToStorage('products', newP.id, newP);
        }
      });
      return updated;
    });
  };

  // Categories & Brands
  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      saveToStorage('settings', 'store_config', { storeSettings, categories: updated, brands });
    }
  };

  const updateCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== oldName) {
      const updated = categories.map((c) => (c === oldName ? trimmed : c));
      setCategories(updated);
      saveToStorage('settings', 'store_config', { storeSettings, categories: updated, brands });
    }
  };

  const deleteCategory = (name: string) => {
    const updated = categories.filter((c) => c !== name);
    setCategories(updated);
    saveToStorage('settings', 'store_config', { storeSettings, categories: updated, brands });
  };

  const addBrand = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !brands.includes(trimmed)) {
      const updated = [...brands, trimmed];
      setBrands(updated);
      saveToStorage('settings', 'store_config', { storeSettings, categories, brands: updated });
    }
  };

  const updateBrand = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== oldName) {
      const updated = brands.map((b) => (b === oldName ? trimmed : b));
      setBrands(updated);
      saveToStorage('settings', 'store_config', { storeSettings, categories, brands: updated });
    }
  };

  const deleteBrand = (name: string) => {
    const updated = brands.filter((b) => b !== name);
    setBrands(updated);
    saveToStorage('settings', 'store_config', { storeSettings, categories, brands: updated });
  };

  // Sales
  const addSale = (saleData: Omit<SaleInvoice, 'id' | 'invoiceNo'>): SaleInvoice => {
    const nextInvoiceNo = (sales.length > 0 ? Math.max(...sales.map((s) => s.invoiceNo || 0)) : 0) + 1;
    const newSale: SaleInvoice = {
      ...saleData,
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      invoiceNo: nextInvoiceNo,
    };

    setSales((prev) => [newSale, ...prev]);
    saveToStorage('sales', newSale.id, newSale);

    // Adjust product inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const item = newSale.items.find((i) => i.barcode === prod.barcode);
        if (item) {
          const updated = { ...prod, stock: Math.max(0, prod.stock - item.qty) };
          saveToStorage('products', updated.id, updated);
          return updated;
        }
        return prod;
      })
    );

    return newSale;
  };

  const updateSale = (sale: SaleInvoice) => {
    setSales((prev) => prev.map((s) => (s.id === sale.id ? sale : s)));
    saveToStorage('sales', sale.id, sale);
  };

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
    deleteFromStorage('sales', id);
  };

  // Returns
  const addReturn = (retData: Omit<SaleReturn, 'id' | 'date'>) => {
    const newReturn: SaleReturn = {
      ...retData,
      id: `ret-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
    };

    setReturns((prev) => [newReturn, ...prev]);
    saveToStorage('returns', newReturn.id, newReturn);

    // Restock returned items
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.barcode === newReturn.barcode) {
          const updated = { ...prod, stock: prod.stock + (newReturn.qty || 1) };
          saveToStorage('products', updated.id, updated);
          return updated;
        }
        return prod;
      })
    );
  };

  const updateReturn = (ret: SaleReturn) => {
    setReturns((prev) => prev.map((r) => (r.id === ret.id ? ret : r)));
    saveToStorage('returns', ret.id, ret);
  };

  const deleteReturn = (id: string) => {
    setReturns((prev) => prev.filter((r) => r.id !== id));
    deleteFromStorage('returns', id);
  };

  // Purchases
  const addPurchase = (
    pData: Omit<PurchaseRecord, 'id' | 'date'>,
    mode: 'update_existing' | 'create_batch' = 'update_existing'
  ) => {
    const newPurchase: PurchaseRecord = {
      ...pData,
      id: `pur-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
    };

    setPurchases((prev) => [newPurchase, ...prev]);
    saveToStorage('purchases', newPurchase.id, newPurchase);

    // Update product stock and prices
    setProducts((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((p) => p.barcode === newPurchase.barcode);
      if (idx >= 0) {
        const prod = updated[idx];
        const newQty = (prod.stock || 0) + (newPurchase.qtyReceived || 0);
        updated[idx] = {
          ...prod,
          stock: newQty,
          purchasePrice: newPurchase.unitCostPrice > 0 ? newPurchase.unitCostPrice : prod.purchasePrice,
          retailPrice: newPurchase.salePriceRetail > 0 ? newPurchase.salePriceRetail : prod.retailPrice,
          wholesalePrice: newPurchase.wholesalePrice && newPurchase.wholesalePrice > 0 ? newPurchase.wholesalePrice : prod.wholesalePrice,
        };
        saveToStorage('products', updated[idx].id, updated[idx]);
      }
      return updated;
    });
  };

  const updatePurchase = (p: PurchaseRecord) => {
    setPurchases((prev) => prev.map((item) => (item.id === p.id ? p : item)));
    saveToStorage('purchases', p.id, p);
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('purchases', id);
  };

  // Credits
  const addCredit = (cData: Omit<CreditPayment, 'id' | 'date'>) => {
    const newCredit: CreditPayment = {
      ...cData,
      id: `crd-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
    };
    setCredits((prev) => [newCredit, ...prev]);
    saveToStorage('credits', newCredit.id, newCredit);
  };

  const updateCredit = (c: CreditPayment) => {
    setCredits((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    saveToStorage('credits', c.id, c);
  };

  const deleteCredit = (id: string) => {
    setCredits((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('credits', id);
  };

  // Expenses
  const addExpense = (eData: Omit<ExpenseRecord, 'id' | 'date'>) => {
    const newExpense: ExpenseRecord = {
      ...eData,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    saveToStorage('expenses', newExpense.id, newExpense);
  };

  const updateExpense = (e: ExpenseRecord) => {
    setExpenses((prev) => prev.map((item) => (item.id === e.id ? e : item)));
    saveToStorage('expenses', e.id, e);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('expenses', id);
  };

  // Suppliers
  const addSupplier = (sData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...sData,
      id: `sup-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    saveToStorage('suppliers', newSupplier.id, newSupplier);
  };

  const updateSupplier = (s: Supplier) => {
    setSuppliers((prev) => prev.map((item) => (item.id === s.id ? s : item)));
    saveToStorage('suppliers', s.id, s);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('suppliers', id);
  };

  // Customers
  const addCustomer = (cData: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...cData,
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };
    setCustomers((prev) => [...prev, newCust]);
    saveToStorage('customers', newCust.id, newCust);
  };

  const updateCustomer = (c: Customer) => {
    setCustomers((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    saveToStorage('customers', c.id, c);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('customers', id);
  };

  // Transactions
  const addCustomerTransaction = (tx: Omit<CustomerTransaction, 'id'>) => {
    const newTx: CustomerTransaction = { ...tx, id: `ctx-${Date.now()}` };
    setCustomerTransactions((prev) => [newTx, ...prev]);
    saveToStorage('customerTransactions', newTx.id, newTx);
  };

  const updateCustomerTransaction = (tx: CustomerTransaction) => {
    setCustomerTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)));
    saveToStorage('customerTransactions', tx.id, tx);
  };

  const deleteCustomerTransaction = (id: string) => {
    setCustomerTransactions((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('customerTransactions', id);
  };

  const addSupplierTransaction = (tx: Omit<SupplierTransaction, 'id'>) => {
    const newTx: SupplierTransaction = { ...tx, id: `stx-${Date.now()}` };
    setSupplierTransactions((prev) => [newTx, ...prev]);
    saveToStorage('supplierTransactions', newTx.id, newTx);
  };

  const updateSupplierTransaction = (tx: SupplierTransaction) => {
    setSupplierTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)));
    saveToStorage('supplierTransactions', tx.id, tx);
  };

  const deleteSupplierTransaction = (id: string) => {
    setSupplierTransactions((prev) => prev.filter((item) => item.id !== id));
    deleteFromStorage('supplierTransactions', id);
  };

  // Settings
  const updateStoreSettings = (s: StoreSettings) => {
    setStoreSettings(s);
    saveToStorage('settings', 'store_config', { storeSettings: s, categories, brands });
  };

  const openThermalReceipt = (invoice: SaleInvoice, size?: ThermalPaperSize) => {
    setPreviewInvoice(invoice);
    if (size) setThermalPaperSize(size);
  };

  const resetToDefaults = () => {
    setStoreSettings(initialStoreSettings);
    setCategories(defaultCategories);
    setBrands(defaultBrands);
    saveToStorage('settings', 'store_config', {
      storeSettings: initialStoreSettings,
      categories: defaultCategories,
      brands: defaultBrands,
    });
  };

  const clearAllTemporaryData = () => {
    setSales([]);
    setReturns([]);
    setPurchases([]);
    setCredits([]);
    setExpenses([]);
  };

  const exportDatabase = () => {
    const backup = {
      storeSettings,
      categories,
      brands,
      products,
      sales,
      returns,
      purchases,
      credits,
      expenses,
      suppliers,
      customers,
      customerTransactions,
      supplierTransactions,
      exportDate: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `limopos_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const importDatabase = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.products) {
        setProducts(data.products);
        data.products.forEach((p: Product) => saveToStorage('products', p.id, p));
      }
      if (data.sales) {
        setSales(data.sales);
        data.sales.forEach((s: SaleInvoice) => saveToStorage('sales', s.id, s));
      }
      if (data.suppliers) {
        setSuppliers(data.suppliers);
        data.suppliers.forEach((s: Supplier) => saveToStorage('suppliers', s.id, s));
      }
      if (data.customers) {
        setCustomers(data.customers);
        data.customers.forEach((c: Customer) => saveToStorage('customers', c.id, c));
      }
      if (data.storeSettings) {
        setStoreSettings(data.storeSettings);
      }
      return true;
    } catch {
      return false;
    }
  };

  const seedSampleDataToCloud = async (): Promise<{ success: boolean; count: number }> => {
    if (!activeUserId) return { success: false, count: 0 };
    try {
      setIsCloudSyncing(true);
      for (const p of sampleSeedProducts) {
        await saveToStorage('products', p.id, p);
      }
      for (const s of sampleSeedSuppliers) {
        await saveToStorage('suppliers', s.id, s);
      }
      for (const c of sampleSeedCustomers) {
        await saveToStorage('customers', c.id, c);
      }
      await saveToStorage('settings', 'store_config', {
        storeSettings,
        categories: categories.length ? categories : defaultCategories,
        brands: brands.length ? brands : defaultBrands,
      });
      setIsCloudSyncing(false);
      return { success: true, count: sampleSeedProducts.length };
    } catch (e) {
      console.error('Seed sample data error:', e);
      setIsCloudSyncing(false);
      return { success: false, count: 0 };
    }
  };

  const syncAllToCloud = async (): Promise<{ success: boolean }> => {
    if (!activeUserId) return { success: false };
    try {
      setIsCloudSyncing(true);
      products.forEach((p) => saveToStorage('products', p.id, p));
      sales.forEach((s) => saveToStorage('sales', s.id, s));
      returns.forEach((r) => saveToStorage('returns', r.id, r));
      purchases.forEach((p) => saveToStorage('purchases', p.id, p));
      credits.forEach((c) => saveToStorage('credits', c.id, c));
      expenses.forEach((e) => saveToStorage('expenses', e.id, e));
      suppliers.forEach((s) => saveToStorage('suppliers', s.id, s));
      customers.forEach((c) => saveToStorage('customers', c.id, c));
      customerTransactions.forEach((tx) => saveToStorage('customerTransactions', tx.id, tx));
      supplierTransactions.forEach((tx) => saveToStorage('supplierTransactions', tx.id, tx));
      await saveToStorage('settings', 'store_config', {
        storeSettings,
        categories,
        brands,
      });
      setIsCloudSyncing(false);
      return { success: true };
    } catch (e) {
      console.error('Sync error:', e);
      setIsCloudSyncing(false);
      return { success: false };
    }
  };

  return (
    <POSContext.Provider
      value={{
        storeId: activeStoreId,
        isAuthenticated,
        login,
        loginWithFirebase,
        registerWithFirebase,
        resetPasswordFirebase,
        firebaseUser,
        firebaseAuthLoading,
        isCloudSyncing,
        logout,
        userRole,
        setUserRole,
        activeTab,
        setActiveTab,
        products,
        addProduct,
        addMultipleProducts,
        updateProduct,
        deleteProduct,
        bulkUpdateProducts,
        bulkDeleteProducts,
        importProducts,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
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
        clearAllTemporaryData,
        exportDatabase,
        importDatabase,
        userAccounts,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount,
        currentUser,
        setCurrentUser,
        seedSampleDataToCloud,
        syncAllToCloud,
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
