import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
} from '../firebase';
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
} from '../data/initialData';

interface POSContextType {
  storeId: string;
  isAuthenticated: boolean;
  login: (u: string, p: string) => boolean;
  loginWithFirebase: (u: string, p: string) => Promise<{ success: boolean; error?: string }>;
  registerWithFirebase: (u: string, p: string, name?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  resetPasswordFirebase: (email: string) => Promise<{ success: boolean; error?: string }>;
  firebaseUser: FirebaseUser | null;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState<boolean>(true);
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

  // Active user identifier (Firebase UID or sanitized user ID)
  const activeUserId = firebaseUser?.uid || currentUser?.id || null;
  // Active store identifier (scoped to authenticated user's store)
  const activeStoreId = currentUser?.storeId || (activeUserId ? `store_${activeUserId}` : 'store_default');

  // Sync current user role & auth state
  useEffect(() => {
    localStorage.setItem('medpos_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('medpos_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('medpos_current_user');
    }
  }, [currentUser]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setFirebaseAuthLoading(false);

      if (fbUser && fbUser.email) {
        const emailLower = fbUser.email.trim().toLowerCase();
        const existing = userAccounts.find(
          (a) => a.email.trim().toLowerCase() === emailLower
        );

        if (existing) {
          const withStore = { ...existing, storeId: existing.storeId || `store_${fbUser.uid}` };
          setCurrentUser(withStore);
          setUserRoleState(withStore.role);
          setIsAuthenticated(true);
        } else {
          const isMaster = emailLower === 'alitrader@gmail.com';
          const newAccount: UserAccount = {
            id: fbUser.uid,
            storeId: `store_${fbUser.uid}`,
            name: fbUser.displayName || emailLower.split('@')[0] || 'LimoPOS User',
            email: fbUser.email,
            role: isMaster ? 'Admin' : 'Admin',
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
          setUserAccounts((prev) => {
            if (!prev.some((p) => p.email.toLowerCase() === emailLower)) {
              return [...prev, newAccount];
            }
            return prev;
          });
          setCurrentUser(newAccount);
          setUserRoleState(newAccount.role);
          setIsAuthenticated(true);
          setDoc(doc(db, 'userAccounts', newAccount.id), newAccount, { merge: true }).catch(() => {});
        }
      } else {
        // Clear all state on logout
        setCurrentUser(null);
        setIsAuthenticated(false);
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
        setStoreSettings(initialStoreSettings);
      }
    });

    return () => unsubscribe();
  }, [userAccounts]);

  // =========================================================
  // CLOUD FIRESTORE USER & STORE-NESTED HIERARCHY
  // Queries are automatically filtered by storeId for complete data isolation:
  // /users/{userId}/products where storeId == activeStoreId
  // /users/{userId}/sales where storeId == activeStoreId
  // /users/{userId}/returns where storeId == activeStoreId
  // /users/{userId}/purchases where storeId == activeStoreId
  // /users/{userId}/credits where storeId == activeStoreId
  // /users/{userId}/expenses where storeId == activeStoreId
  // /users/{userId}/suppliers where storeId == activeStoreId
  // /users/{userId}/customers where storeId == activeStoreId
  // /users/{userId}/customerTransactions where storeId == activeStoreId
  // /users/{userId}/supplierTransactions where storeId == activeStoreId
  // /users/{userId}/settings/store_config
  // =========================================================
  useEffect(() => {
    if (!activeUserId) {
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
      return;
    }

    setIsCloudSyncing(true);

    // 1. User's isolated Products (filtered by storeId)
    const qProducts = query(
      collection(db, 'users', activeUserId, 'products'),
      where('storeId', '==', activeStoreId)
    );
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Product);
      });
      setProducts(list);
      setIsCloudSyncing(false);
    }, (err) => {
      console.warn('Products sync note:', err.message);
      setIsCloudSyncing(false);
    });

    // 2. User's isolated Sales (filtered by storeId)
    const qSales = query(
      collection(db, 'users', activeUserId, 'sales'),
      where('storeId', '==', activeStoreId)
    );
    const unsubSales = onSnapshot(qSales, (snapshot) => {
      const list: SaleInvoice[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SaleInvoice);
      });
      list.sort((a, b) => (b.invoiceNo || 0) - (a.invoiceNo || 0));
      setSales(list);
    }, (err) => {
      console.warn('Sales sync note:', err.message);
    });

    // 3. User's isolated Returns (filtered by storeId)
    const qReturns = query(
      collection(db, 'users', activeUserId, 'returns'),
      where('storeId', '==', activeStoreId)
    );
    const unsubReturns = onSnapshot(qReturns, (snapshot) => {
      const list: SaleReturn[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SaleReturn);
      });
      setReturns(list);
    }, (err) => {
      console.warn('Returns sync note:', err.message);
    });

    // 4. User's isolated Purchases (filtered by storeId)
    const qPurchases = query(
      collection(db, 'users', activeUserId, 'purchases'),
      where('storeId', '==', activeStoreId)
    );
    const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
      const list: PurchaseRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as PurchaseRecord);
      });
      setPurchases(list);
    }, (err) => {
      console.warn('Purchases sync note:', err.message);
    });

    // 5. User's isolated Credits (filtered by storeId)
    const qCredits = query(
      collection(db, 'users', activeUserId, 'credits'),
      where('storeId', '==', activeStoreId)
    );
    const unsubCredits = onSnapshot(qCredits, (snapshot) => {
      const list: CreditPayment[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CreditPayment);
      });
      setCredits(list);
    }, (err) => {
      console.warn('Credits sync note:', err.message);
    });

    // 6. User's isolated Expenses (filtered by storeId)
    const qExpenses = query(
      collection(db, 'users', activeUserId, 'expenses'),
      where('storeId', '==', activeStoreId)
    );
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const list: ExpenseRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ExpenseRecord);
      });
      setExpenses(list);
    }, (err) => {
      console.warn('Expenses sync note:', err.message);
    });

    // 7. User's isolated Suppliers (filtered by storeId)
    const qSuppliers = query(
      collection(db, 'users', activeUserId, 'suppliers'),
      where('storeId', '==', activeStoreId)
    );
    const unsubSuppliers = onSnapshot(qSuppliers, (snapshot) => {
      const list: Supplier[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Supplier);
      });
      setSuppliers(list);
    }, (err) => {
      console.warn('Suppliers sync note:', err.message);
    });

    // 8. User's isolated Customers (filtered by storeId)
    const qCustomers = query(
      collection(db, 'users', activeUserId, 'customers'),
      where('storeId', '==', activeStoreId)
    );
    const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
      const list: Customer[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Customer);
      });
      setCustomers(list);
    }, (err) => {
      console.warn('Customers sync note:', err.message);
    });

    // 9. User's isolated Customer Transactions (filtered by storeId)
    const qCustomerTx = query(
      collection(db, 'users', activeUserId, 'customerTransactions'),
      where('storeId', '==', activeStoreId)
    );
    const unsubCustomerTx = onSnapshot(qCustomerTx, (snapshot) => {
      const list: CustomerTransaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CustomerTransaction);
      });
      setCustomerTransactions(list);
    }, (err) => {
      console.warn('Customer transactions sync note:', err.message);
    });

    // 10. User's isolated Supplier Transactions (filtered by storeId)
    const qSupplierTx = query(
      collection(db, 'users', activeUserId, 'supplierTransactions'),
      where('storeId', '==', activeStoreId)
    );
    const unsubSupplierTx = onSnapshot(qSupplierTx, (snapshot) => {
      const list: SupplierTransaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SupplierTransaction);
      });
      setSupplierTransactions(list);
    }, (err) => {
      console.warn('Supplier transactions sync note:', err.message);
    });

    // 11. User's isolated Settings document: /users/{userId}/settings/store_config
    const unsubSettings = onSnapshot(doc(db, 'users', activeUserId, 'settings', 'store_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.storeSettings) setStoreSettings(data.storeSettings);
        if (data.categories) setCategories(data.categories);
        if (data.brands) setBrands(data.brands);
      } else {
        // Initialize default settings doc inside user's folder
        setDoc(doc(db, 'users', activeUserId, 'settings', 'store_config'), {
          userId: activeUserId,
          storeId: activeStoreId,
          storeSettings: { ...initialStoreSettings, storeId: activeStoreId },
          categories: defaultCategories,
          brands: defaultBrands,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }
    }, (err) => {
      console.warn('Settings sync note:', err.message);
    });

    // 12. User accounts collection (filtered by storeId)
    const qAccounts = query(collection(db, 'userAccounts'), where('storeId', '==', activeStoreId));
    const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
      const list: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as UserAccount);
      });
      if (list.length > 0) {
        setUserAccounts(list);
      }
    }, (err) => {
      console.warn('User accounts sync note:', err.message);
    });

    return () => {
      unsubProducts();
      unsubSales();
      unsubReturns();
      unsubPurchases();
      unsubCredits();
      unsubExpenses();
      unsubSuppliers();
      unsubCustomers();
      unsubCustomerTx();
      unsubSupplierTx();
      unsubSettings();
      unsubAccounts();
    };
  }, [activeUserId, activeStoreId]);

  // Firestore save helper (saves in user-nested subcollection: /users/{userId}/{colName}/{docId} with storeId)
  const saveToFirestore = async (colName: string, docId: string, data: any) => {
    if (!activeUserId) return;
    try {
      const payload = {
        ...data,
        userId: activeUserId,
        storeId: activeStoreId,
        updatedAt: new Date().toISOString()
      };

      // 1. Write inside user's specific subcollection
      await setDoc(doc(db, 'users', activeUserId, colName, docId), payload, { merge: true });

      // 2. Ensure the parent user document exists and has storeId metadata
      await setDoc(doc(db, 'users', activeUserId), {
        id: activeUserId,
        email: currentUser?.email || firebaseUser?.email || '',
        name: currentUser?.name || firebaseUser?.displayName || 'LimoPOS User',
        role: userRole,
        storeId: activeStoreId,
        storeName: storeSettings?.storeName || 'LimoPOS Store',
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (err: any) {
      console.warn(`Firestore save to /users/${activeUserId}/${colName}/${docId} note:`, err.message);
    }
  };

  const deleteFromFirestore = async (colName: string, docId: string) => {
    if (!activeUserId) return;
    try {
      await deleteDoc(doc(db, 'users', activeUserId, colName, docId));
    } catch (err: any) {
      console.warn(`Firestore delete from /users/${activeUserId}/${colName}/${docId} note:`, err.message);
    }
  };

  // Login
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

  // Firebase Email/Password Sign In
  const loginWithFirebase = async (u: string, p: string): Promise<{ success: boolean; error?: string }> => {
    const email = u.trim();
    const password = p.trim();
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      setFirebaseUser(fbUser);

      const emailLower = fbUser.email?.toLowerCase() || '';
      const existing = userAccounts.find((a) => a.email.toLowerCase() === emailLower);
      if (existing) {
        setCurrentUser(existing);
        setUserRole(existing.role);
      } else {
        const isMaster = emailLower === 'alitrader@gmail.com';
        const newAccount: UserAccount = {
          id: fbUser.uid,
          name: fbUser.displayName || emailLower.split('@')[0] || 'LimoPOS User',
          email: fbUser.email || email,
          role: isMaster ? 'Admin' : 'Admin',
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
        setUserAccounts((prev) => [...prev, newAccount]);
        setCurrentUser(newAccount);
        setUserRole(newAccount.role);
        setDoc(doc(db, 'userAccounts', newAccount.id), newAccount, { merge: true }).catch(() => {});
      }
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      return { success: true };
    } catch (err: any) {
      console.error('LimoPOS login error:', err);
      let errorMsg = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (err.code === 'auth/user-disabled') {
        errorMsg = 'This account has been disabled.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please try again later.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  // Firebase Email/Password Registration
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      if (displayName) {
        await updateProfile(fbUser, { displayName });
      }

      setFirebaseUser(fbUser);
      const isMaster = email.toLowerCase() === 'alitrader@gmail.com';
      const actualRole: UserRole = isMaster ? 'Admin' : role;

      const newAccount: UserAccount = {
        id: fbUser.uid,
        storeId: `store_${fbUser.uid}`,
        name: displayName || email.split('@')[0],
        email: email,
        password: password,
        role: actualRole,
        permissions: {
          canDashboard: true,
          canSale: true,
          canReturn: true,
          canBillHistory: true,
          canCreditReceive: actualRole !== 'Cashier',
          canPurchaseStock: actualRole !== 'Cashier',
          canProducts: actualRole !== 'Cashier',
          canSuppliers: actualRole !== 'Cashier',
          canCustomers: actualRole !== 'Cashier',
          canBarcodeLabel: true,
          canDayClosing: actualRole !== 'Cashier',
          canExpenses: actualRole !== 'Cashier',
          canReports: actualRole !== 'Cashier',
          canSettings: actualRole === 'Admin',
          canPlanPRD: true,
        },
      };

      setUserAccounts((prev) => [...prev, newAccount]);
      setCurrentUser(newAccount);
      setUserRole(newAccount.role);
      setIsAuthenticated(true);
      setActiveTab('dashboard');

      setDoc(doc(db, 'userAccounts', newAccount.id), newAccount, { merge: true }).catch(() => {});

      // Seed root user document and settings inside user hierarchy with storeId
      setDoc(doc(db, 'users', fbUser.uid), {
        id: fbUser.uid,
        storeId: `store_${fbUser.uid}`,
        email: email,
        name: displayName || email.split('@')[0],
        role: actualRole,
        storeName: 'LimoPOS Store',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});

      setDoc(doc(db, 'users', fbUser.uid, 'settings', 'store_config'), {
        userId: fbUser.uid,
        storeId: `store_${fbUser.uid}`,
        storeSettings: { ...initialStoreSettings, storeId: `store_${fbUser.uid}` },
        categories: defaultCategories,
        brands: defaultBrands,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});

      return { success: true };
    } catch (err: any) {
      console.error('Firebase register error:', err);
      let errorMsg = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  // Password Reset Email
  const resetPasswordFirebase = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { success: false, error: 'Please enter your email address' };
    }
    try {
      await sendPasswordResetEmail(auth, trimmed);
      return { success: true };
    } catch (err: any) {
      console.error('Firebase password reset error:', err);
      let errorMsg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'No user account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    signOut(auth).catch((e) => console.warn('Firebase signout note:', e));
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
    setDoc(doc(db, 'userAccounts', newAcc.id), newAcc, { merge: true }).catch(() => {});
  };

  const updateUserAccount = (acc: UserAccount) => {
    const updatedAcc = { ...acc, storeId: acc.storeId || activeStoreId };
    setUserAccounts((prev) => prev.map((item) => (item.id === acc.id ? updatedAcc : item)));
    if (currentUser && currentUser.id === acc.id) {
      setCurrentUser(updatedAcc);
    }
    setDoc(doc(db, 'userAccounts', acc.id), updatedAcc, { merge: true }).catch(() => {});
  };

  const deleteUserAccount = (id: string) => {
    if (id === 'acc-master') return;
    setUserAccounts((prev) => prev.filter((item) => item.id !== id));
    deleteDoc(doc(db, 'userAccounts', id)).catch(() => {});
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
    saveToFirestore('products', newProduct.id, newProduct);
  };

  const addMultipleProducts = (newProds: Omit<Product, 'id'>[]) => {
    const created: Product[] = newProds.map((p, idx) => ({
      ...p,
      id: `p-${Date.now()}-${idx}-${Math.floor(Math.random() * 100000)}`,
    }));
    setProducts((prev) => [...created, ...prev]);
    created.forEach((item) => {
      saveToFirestore('products', item.id, item);
    });
  };

  const updateProduct = (p: Product) => {
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
    saveToFirestore('products', p.id, p);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    deleteFromFirestore('products', id);
  };

  const bulkUpdateProducts = (updatedProds: Product[]) => {
    setProducts((prev) => {
      const map = new Map(updatedProds.map((p) => [p.id, p]));
      return prev.map((p) => map.get(p.id) || p);
    });
    updatedProds.forEach((prod) => {
      saveToFirestore('products', prod.id, prod);
    });
  };

  const bulkDeleteProducts = (ids: string[]) => {
    const idSet = new Set(ids);
    setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
    ids.forEach((id) => {
      deleteFromFirestore('products', id);
    });
  };

  const importProducts = (newProducts: Product[]) => {
    setProducts((prev) => {
      const updated = [...prev];
      newProducts.forEach((newP) => {
        const idx = updated.findIndex(
          (p) =>
            p.barcode.trim().toLowerCase() === newP.barcode.trim().toLowerCase() &&
            Number(p.retailPrice) === Number(newP.retailPrice)
        );
        if (idx !== -1) {
          const updatedItem = { ...updated[idx], ...newP, id: updated[idx].id };
          updated[idx] = updatedItem;
          saveToFirestore('products', updatedItem.id, updatedItem);
        } else {
          const newItem = {
            ...newP,
            id: newP.id || `p-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
          };
          updated.push(newItem);
          saveToFirestore('products', newItem.id, newItem);
        }
      });
      return updated;
    });
  };

  // Categories & Brands
  const addCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (!trimmed || !activeUserId) return;
    setCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...prev, trimmed];
      saveToFirestore('settings', 'store_config', {
        storeSettings,
        categories: updated,
        brands,
        updatedAt: new Date().toISOString()
      });
      return updated;
    });
  };

  const updateCategory = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew || !activeUserId) return;
    setCategories((prev) => {
      const updated = prev.map((c) => (c === oldName ? trimmedNew : c));
      saveToFirestore('settings', 'store_config', {
        storeSettings,
        categories: updated,
        brands,
        updatedAt: new Date().toISOString()
      });
      return updated;
    });
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmedNew } : p))
    );
  };

  const deleteCategory = (catName: string) => {
    if (!activeUserId) return;
    setCategories((prev) => {
      const updated = prev.filter((c) => c !== catName);
      saveToFirestore('settings', 'store_config', {
        storeSettings,
        categories: updated,
        brands,
        updatedAt: new Date().toISOString()
      });
      return updated;
    });
  };

  const addBrand = (brandName: string) => {
    const trimmed = brandName.trim();
    if (!trimmed || !activeUserId) return;
    setBrands((prev) => {
      if (prev.some((b) => b.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...prev, trimmed];
      saveToFirestore('settings', 'store_config', {
        storeSettings,
        categories,
        brands: updated,
        updatedAt: new Date().toISOString()
      });
      return updated;
    });
  };

  const updateBrand = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew || !activeUserId) return;
    setBrands((prev) => {
      const updated = prev.map((b) => (b === oldName ? trimmedNew : b));
      saveToFirestore('settings', 'store_config', {
        storeSettings,
        categories,
        brands: updated,
        updatedAt: new Date().toISOString()
      });
      return updated;
    });
    setProducts((prev) =>
      prev.map((p) => (p.company === oldName ? { ...p, company: trimmedNew } : p))
    );
  };

  const deleteBrand = (brandName: string) => {
    if (!activeUserId) return;
    setBrands((prev) => {
      const updated = prev.filter((b) => b !== brandName);
      saveToFirestore('settings', 'store_config', {
        storeSettings,
        categories,
        brands: updated,
        updatedAt: new Date().toISOString()
      });
      return updated;
    });
  };

  // Suppliers
  const addSupplier = (s: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...s,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    saveToFirestore('suppliers', newSup.id, newSup);
  };

  const updateSupplier = (s: Supplier) => {
    setSuppliers((prev) => prev.map((item) => (item.id === s.id ? s : item)));
    saveToFirestore('suppliers', s.id, s);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((item) => item.id !== id));
    deleteFromFirestore('suppliers', id);
  };

  // Customers
  const addCustomer = (c: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [newCust, ...prev]);
    saveToFirestore('customers', newCust.id, newCust);

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
      saveToFirestore('customerTransactions', opTx.id, opTx);
    }
  };

  const updateCustomer = (c: Customer) => {
    setCustomers((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    saveToFirestore('customers', c.id, c);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((item) => item.id !== id));
    setCustomerTransactions((prev) => prev.filter((tx) => tx.customerId !== id));
    deleteFromFirestore('customers', id);
  };

  const addCustomerTransaction = (txData: Omit<CustomerTransaction, 'id'>) => {
    const newTx: CustomerTransaction = {
      ...txData,
      id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    setCustomerTransactions((prev) => [newTx, ...prev]);
    saveToFirestore('customerTransactions', newTx.id, newTx);

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === txData.customerId || c.name.toLowerCase() === txData.customerName.toLowerCase()) {
          const delta = txData.debit - txData.credit;
          const updated = { ...c, balanceReceivable: c.balanceReceivable + delta };
          saveToFirestore('customers', updated.id, updated);
          return updated;
        }
        return c;
      })
    );
  };

  const updateCustomerTransaction = (updatedTx: CustomerTransaction) => {
    setCustomerTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
    saveToFirestore('customerTransactions', updatedTx.id, updatedTx);
  };

  const deleteCustomerTransaction = (id: string) => {
    const target = customerTransactions.find((tx) => tx.id === id);
    if (target) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === target.customerId || c.name.toLowerCase() === target.customerName.toLowerCase()) {
            const delta = target.debit - target.credit;
            const updated = { ...c, balanceReceivable: Math.max(0, c.balanceReceivable - delta) };
            saveToFirestore('customers', updated.id, updated);
            return updated;
          }
          return c;
        })
      );
    }
    setCustomerTransactions((prev) => prev.filter((tx) => tx.id !== id));
    deleteFromFirestore('customerTransactions', id);
  };

  const addSupplierTransaction = (txData: Omit<SupplierTransaction, 'id'>) => {
    const newTx: SupplierTransaction = {
      ...txData,
      id: `stx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    setSupplierTransactions((prev) => [newTx, ...prev]);
    saveToFirestore('supplierTransactions', newTx.id, newTx);

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === txData.supplierId || s.name.toLowerCase() === txData.supplierName.toLowerCase()) {
          const delta = txData.credit - txData.debit;
          const updated = { ...s, balanceOwed: Math.max(0, s.balanceOwed + delta) };
          saveToFirestore('suppliers', updated.id, updated);
          return updated;
        }
        return s;
      })
    );
  };

  const updateSupplierTransaction = (updatedTx: SupplierTransaction) => {
    setSupplierTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
    saveToFirestore('supplierTransactions', updatedTx.id, updatedTx);
  };

  const deleteSupplierTransaction = (id: string) => {
    const target = supplierTransactions.find((tx) => tx.id === id);
    if (target) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === target.supplierId || s.name.toLowerCase() === target.supplierName.toLowerCase()) {
            const delta = target.credit - target.debit;
            const updated = { ...s, balanceOwed: Math.max(0, s.balanceOwed - delta) };
            saveToFirestore('suppliers', updated.id, updated);
            return updated;
          }
          return s;
        })
      );
    }
    setSupplierTransactions((prev) => prev.filter((tx) => tx.id !== id));
    deleteFromFirestore('supplierTransactions', id);
  };

  // ==========================================
  // SALE INVOICES & RETURNS
  // ==========================================
  const addSale = (saleData: Omit<SaleInvoice, 'id' | 'invoiceNo'>): SaleInvoice => {
    const nextInvoiceNo = sales.length > 0 ? Math.max(...sales.map((s) => s.invoiceNo)) + 1 : 1;
    const newSale: SaleInvoice = {
      ...saleData,
      id: `inv-${Date.now()}`,
      invoiceNo: nextInvoiceNo,
    };

    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = saleData.items.find(
          (item) => item.barcode.trim().toLowerCase() === prod.barcode.trim().toLowerCase()
        );
        if (soldItem) {
          const updatedStock = parseFloat(Math.max(0, prod.stock - soldItem.qty).toFixed(3));
          const updatedProd = { ...prod, stock: updatedStock };
          saveToFirestore('products', updatedProd.id, updatedProd);
          return updatedProd;
        }
        return prod;
      })
    );

    setSales((prev) => [newSale, ...prev]);
    saveToFirestore('sales', newSale.id, newSale);

    return newSale;
  };

  const updateSale = (updatedSale: SaleInvoice) => {
    setSales((prev) => prev.map((s) => (s.id === updatedSale.id ? updatedSale : s)));
    saveToFirestore('sales', updatedSale.id, updatedSale);
  };

  const deleteSale = (id: string) => {
    const targetSale = sales.find((s) => s.id === id);
    if (targetSale) {
      setProducts((prev) =>
        prev.map((prod) => {
          const soldItem = targetSale.items.find(
            (item) => item.barcode.trim().toLowerCase() === prod.barcode.trim().toLowerCase()
          );
          if (soldItem) {
            const updatedStock = parseFloat((prod.stock + soldItem.qty).toFixed(3));
            const updatedProd = { ...prod, stock: updatedStock };
            saveToFirestore('products', updatedProd.id, updatedProd);
            return updatedProd;
          }
          return prod;
        })
      );
    }
    setSales((prev) => prev.filter((s) => s.id !== id));
    deleteFromFirestore('sales', id);
  };

  const addReturn = (ret: Omit<SaleReturn, 'id' | 'date'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newReturn: SaleReturn = {
      ...ret,
      id: `ret-${Date.now()}`,
      date: formattedDate,
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.barcode.trim().toLowerCase() === ret.barcode.trim().toLowerCase()) {
          const updatedProd = { ...p, stock: p.stock + ret.qty };
          saveToFirestore('products', updatedProd.id, updatedProd);
          return updatedProd;
        }
        return p;
      })
    );

    setReturns((prev) => [newReturn, ...prev]);
    saveToFirestore('returns', newReturn.id, newReturn);
  };

  const updateReturn = (updatedRet: SaleReturn) => {
    setReturns((prev) => prev.map((r) => (r.id === updatedRet.id ? updatedRet : r)));
    saveToFirestore('returns', updatedRet.id, updatedRet);
  };

  const deleteReturn = (id: string) => {
    setReturns((prev) => prev.filter((r) => r.id !== id));
    deleteFromFirestore('returns', id);
  };

  // ==========================================
  // PURCHASES, CREDITS & EXPENSES
  // ==========================================
  const addPurchase = (pur: Omit<PurchaseRecord, 'id' | 'date'>, mode?: 'update_existing' | 'create_batch') => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    let targetSupplier = suppliers.find(
      (s) => (pur.supplierId && s.id === pur.supplierId) || (pur.supplierName && s.name.toLowerCase() === pur.supplierName.trim().toLowerCase())
    );

    if (!targetSupplier && pur.supplierName && pur.supplierName.trim() && pur.supplierName.trim().toLowerCase() !== 'general') {
      const newSupId = `sup-${Date.now()}`;
      const newSup: Supplier = {
        id: newSupId,
        name: pur.supplierName.trim(),
        company: pur.supplierName.trim(),
        phone: '',
        email: '',
        address: '',
        balanceOwed: pur.totalCost,
      };
      setSuppliers((prev) => [newSup, ...prev]);
      saveToFirestore('suppliers', newSup.id, newSup);
      targetSupplier = newSup;
    } else if (targetSupplier) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === targetSupplier!.id) {
            const updated = { ...s, balanceOwed: s.balanceOwed + pur.totalCost };
            saveToFirestore('suppliers', updated.id, updated);
            return updated;
          }
          return s;
        })
      );
    }

    const matchedSupplierId = targetSupplier ? targetSupplier.id : pur.supplierId;
    const matchedSupplierName = targetSupplier ? targetSupplier.name : (pur.supplierName || 'General');

    const newPurchase: PurchaseRecord = {
      ...pur,
      supplierId: matchedSupplierId,
      supplierName: matchedSupplierName,
      id: `pur-${Date.now()}`,
      date: formattedDate,
    };

    if (targetSupplier || (matchedSupplierName && matchedSupplierName !== 'General')) {
      const supTx: SupplierTransaction = {
        id: `stx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        supplierId: matchedSupplierId || 'sup-gen',
        supplierName: matchedSupplierName,
        date: formattedDate,
        type: 'PURCHASE_BILL',
        referenceNo: `#PUR-${Math.floor(1000 + Math.random() * 9000)}`,
        description: `Stock Inward: ${pur.itemName}`,
        itemsSummary: `${pur.itemName} (${pur.qtyReceived} units @ Rs. ${pur.unitCostPrice})`,
        debit: 0,
        credit: pur.totalCost,
        balance: (targetSupplier ? targetSupplier.balanceOwed : 0) + pur.totalCost,
        paymentMethod: 'Credit Bill',
        notes: `Inwarded to Inventory (Barcode: ${pur.barcode})`,
      };
      setSupplierTransactions((prev) => [supTx, ...prev]);
      saveToFirestore('supplierTransactions', supTx.id, supTx);
    }

    setProducts((prev) => {
      const existing = prev.find((p) => p.barcode.trim().toLowerCase() === pur.barcode.trim().toLowerCase());

      if (mode === 'create_batch') {
        const batchProduct: Product = {
          id: `p-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          barcode: pur.barcode,
          name: pur.itemName,
          company: pur.supplierName || 'General',
          category: 'Pharmacy',
          supplierId: matchedSupplierId,
          supplierName: matchedSupplierName,
          purchasePrice: pur.unitCostPrice,
          retailPrice: pur.salePriceRetail,
          wholesalePrice: pur.wholesalePrice,
          stock: pur.qtyReceived,
          minStockAlert: 5,
          batchNo: `B-${Date.now().toString().slice(-4)}`,
          unitOfSale: 'Count',
        };
        saveToFirestore('products', batchProduct.id, batchProduct);
        return [batchProduct, ...prev];
      }

      if (existing) {
        return prev.map((p) => {
          if (p.id === existing.id) {
            const updatedProd = {
              ...p,
              stock: p.stock + pur.qtyReceived,
              supplierId: matchedSupplierId || p.supplierId,
              supplierName: matchedSupplierName || p.supplierName,
              purchasePrice: pur.unitCostPrice > 0 ? pur.unitCostPrice : p.purchasePrice,
              retailPrice: pur.salePriceRetail > 0 ? pur.salePriceRetail : p.retailPrice,
              wholesalePrice: pur.wholesalePrice > 0 ? pur.wholesalePrice : p.wholesalePrice,
            };
            saveToFirestore('products', updatedProd.id, updatedProd);
            return updatedProd;
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
          supplierId: matchedSupplierId,
          supplierName: matchedSupplierName,
          purchasePrice: pur.unitCostPrice,
          retailPrice: pur.salePriceRetail,
          wholesalePrice: pur.wholesalePrice,
          stock: pur.qtyReceived,
          minStockAlert: 10,
          unitOfSale: 'Count',
        };
        saveToFirestore('products', created.id, created);
        return [created, ...prev];
      }
    });

    setPurchases((prev) => [newPurchase, ...prev]);
    saveToFirestore('purchases', newPurchase.id, newPurchase);
  };

  const updatePurchase = (updatedPur: PurchaseRecord) => {
    setPurchases((prev) => prev.map((p) => (p.id === updatedPur.id ? updatedPur : p)));
    saveToFirestore('purchases', updatedPur.id, updatedPur);
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    deleteFromFirestore('purchases', id);
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
    saveToFirestore('credits', newCredit.id, newCredit);
  };

  const updateCredit = (updatedCredit: CreditPayment) => {
    setCredits((prev) => prev.map((c) => (c.id === updatedCredit.id ? updatedCredit : c)));
    saveToFirestore('credits', updatedCredit.id, updatedCredit);
  };

  const deleteCredit = (id: string) => {
    setCredits((prev) => prev.filter((c) => c.id !== id));
    deleteFromFirestore('credits', id);
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
    saveToFirestore('expenses', newExpense.id, newExpense);
  };

  const updateExpense = (updatedExp: ExpenseRecord) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
    saveToFirestore('expenses', updatedExp.id, updatedExp);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteFromFirestore('expenses', id);
  };

  const updateStoreSettings = (s: StoreSettings) => {
    setStoreSettings(s);
    if (activeUserId) {
      saveToFirestore('settings', 'store_config', {
        storeSettings: s,
        categories,
        brands,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const openThermalReceipt = (invoice: SaleInvoice, size: ThermalPaperSize = '80mm') => {
    setPreviewInvoice(invoice);
    setThermalPaperSize(size);
  };

  const resetToDefaults = () => {
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
    setStoreSettings(initialStoreSettings);
  };

  const clearAllTemporaryData = () => {
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
  };

  const exportDatabase = () => {
    const data = {
      version: '3.0.0',
      exportDate: new Date().toISOString(),
      products,
      sales,
      returns,
      purchases,
      credits,
      expenses,
      storeSettings,
      suppliers,
      customers,
      customerTransactions,
      supplierTransactions,
      categories,
      brands,
      userAccounts,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `limopos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        data.products.forEach((p: Product) => saveToFirestore('products', p.id, p));
      }
      if (data.sales && Array.isArray(data.sales)) {
        setSales(data.sales);
        data.sales.forEach((s: SaleInvoice) => saveToFirestore('sales', s.id, s));
      }
      if (data.returns && Array.isArray(data.returns)) {
        setReturns(data.returns);
        data.returns.forEach((r: SaleReturn) => saveToFirestore('returns', r.id, r));
      }
      if (data.purchases && Array.isArray(data.purchases)) {
        setPurchases(data.purchases);
        data.purchases.forEach((p: PurchaseRecord) => saveToFirestore('purchases', p.id, p));
      }
      if (data.credits && Array.isArray(data.credits)) {
        setCredits(data.credits);
        data.credits.forEach((c: CreditPayment) => saveToFirestore('credits', c.id, c));
      }
      if (data.expenses && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
        data.expenses.forEach((e: ExpenseRecord) => saveToFirestore('expenses', e.id, e));
      }
      if (data.suppliers && Array.isArray(data.suppliers)) {
        setSuppliers(data.suppliers);
        data.suppliers.forEach((s: Supplier) => saveToFirestore('suppliers', s.id, s));
      }
      if (data.customers && Array.isArray(data.customers)) {
        setCustomers(data.customers);
        data.customers.forEach((c: Customer) => saveToFirestore('customers', c.id, c));
      }
      if (data.customerTransactions && Array.isArray(data.customerTransactions)) {
        setCustomerTransactions(data.customerTransactions);
        data.customerTransactions.forEach((tx: CustomerTransaction) => saveToFirestore('customerTransactions', tx.id, tx));
      }
      if (data.supplierTransactions && Array.isArray(data.supplierTransactions)) {
        setSupplierTransactions(data.supplierTransactions);
        data.supplierTransactions.forEach((tx: SupplierTransaction) => saveToFirestore('supplierTransactions', tx.id, tx));
      }
      if (data.storeSettings) {
        setStoreSettings(data.storeSettings);
        if (activeUserId) {
          saveToFirestore('settings', `${activeUserId}_settings`, {
            storeSettings: data.storeSettings,
            categories: data.categories || defaultCategories,
            brands: data.brands || defaultBrands,
            updatedAt: new Date().toISOString()
          });
        }
      }
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
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
