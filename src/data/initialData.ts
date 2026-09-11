import {
  Product,
  SaleInvoice,
  PurchaseRecord,
  CreditPayment,
  ExpenseRecord,
  StoreSettings,
  CustomerTransaction,
  SupplierTransaction,
  Supplier,
  Customer
} from '../types';

export const initialStoreSettings: StoreSettings = {
  storeName: 'Ali Traders',
  tagline: 'Pharmacy & Retail POS',
  address: 'Main Market, Pakistan',
  phone: '03195702823',
  logoUrl: '',
  currency: 'Rs.',
  footerNote: 'THANK YOU! VISIT AGAIN\nPowered by LimoPOS',
  defaultPaperSize: '80mm',
};

export const initialProducts: Product[] = [];
export const initialSales: SaleInvoice[] = [];
export const initialPurchases: PurchaseRecord[] = [];
export const initialCredits: CreditPayment[] = [];
export const initialExpenses: ExpenseRecord[] = [];
export const initialCustomerTransactions: CustomerTransaction[] = [];
export const initialSupplierTransactions: SupplierTransaction[] = [];

export const sampleSeedProducts: Product[] = [
  {
    id: 'prod-panadol-500',
    barcode: '896400012001',
    name: 'Panadol 500mg Tablets (Paracetamol)',
    company: 'GSK Pharma',
    category: 'Medicines (Tablets)',
    purchasePrice: 320,
    retailPrice: 380,
    wholesalePrice: 350,
    stock: 120,
    minStockAlert: 20,
    unitOfSale: 'Box (200 Tabs)',
    expiryDate: '2027-12-31',
    batchNo: 'B-8821'
  },
  {
    id: 'prod-augmentin-625',
    barcode: '896400012002',
    name: 'Augmentin 625mg Tablets',
    company: 'GSK Pharma',
    category: 'Medicines (Tablets)',
    purchasePrice: 280,
    retailPrice: 340,
    wholesalePrice: 310,
    stock: 45,
    minStockAlert: 10,
    unitOfSale: 'Strip (6 Tabs)',
    expiryDate: '2027-08-30',
    batchNo: 'AUG-4902'
  },
  {
    id: 'prod-brufen-400',
    barcode: '896400012003',
    name: 'Brufen 400mg Tablets (Ibuprofen)',
    company: 'Abbott Laboratories',
    category: 'Medicines (Tablets)',
    purchasePrice: 190,
    retailPrice: 240,
    wholesalePrice: 215,
    stock: 80,
    minStockAlert: 15,
    unitOfSale: 'Pack (30 Tabs)',
    expiryDate: '2028-01-15',
    batchNo: 'BF-3012'
  },
  {
    id: 'prod-disprin-300',
    barcode: '896400012004',
    name: 'Disprin Regular Dispersible (Aspirin)',
    company: 'Reckitt Benckiser',
    category: 'Medicines (Tablets)',
    purchasePrice: 90,
    retailPrice: 120,
    wholesalePrice: 105,
    stock: 150,
    minStockAlert: 30,
    unitOfSale: 'Pack (30 Tabs)',
    expiryDate: '2028-05-20',
    batchNo: 'DSP-994'
  },
  {
    id: 'prod-arinac-forte',
    barcode: '896400012005',
    name: 'Arinac Forte Tablets (Anti-Cold)',
    company: 'Abbott Laboratories',
    category: 'Medicines (Tablets)',
    purchasePrice: 210,
    retailPrice: 260,
    wholesalePrice: 235,
    stock: 65,
    minStockAlert: 15,
    unitOfSale: 'Pack (20 Tabs)',
    expiryDate: '2027-11-10',
    batchNo: 'AR-778'
  },
  {
    id: 'prod-flagyl-400',
    barcode: '896400012006',
    name: 'Flagyl 400mg Tablets (Metronidazole)',
    company: 'Sanofi Aventis',
    category: 'Medicines (Tablets)',
    purchasePrice: 140,
    retailPrice: 180,
    wholesalePrice: 160,
    stock: 90,
    minStockAlert: 20,
    unitOfSale: 'Strip (10 Tabs)',
    expiryDate: '2028-03-25',
    batchNo: 'FLG-551'
  },
  {
    id: 'prod-calpol-syrup',
    barcode: '896400012007',
    name: 'Calpol Paediatric Syrup 60ml',
    company: 'GSK Pharma',
    category: 'Syrups & Suspensions',
    purchasePrice: 85,
    retailPrice: 110,
    wholesalePrice: 95,
    stock: 50,
    minStockAlert: 12,
    unitOfSale: 'Bottle (60ml)',
    expiryDate: '2027-09-18',
    batchNo: 'CALP-112'
  },
  {
    id: 'prod-risek-20',
    barcode: '896400012008',
    name: 'Risek 20mg Capsules (Omeprazole)',
    company: 'Getz Pharma',
    category: 'Medicines (Tablets)',
    purchasePrice: 310,
    retailPrice: 380,
    wholesalePrice: 345,
    stock: 75,
    minStockAlert: 15,
    unitOfSale: 'Pack (14 Caps)',
    expiryDate: '2028-02-14',
    batchNo: 'RSK-908'
  }
];

export const sampleSeedSuppliers: Supplier[] = [
  {
    id: 'sup-gsk-dist',
    name: 'Al-Madina Medicine Agency (GSK)',
    company: 'GSK / GlaxoSmithKline',
    phone: '0300-9876543',
    email: 'madina.pharma@gmail.com',
    address: 'Shop 14, Central Medicine Market, Lahore',
    balanceOwed: 0
  },
  {
    id: 'sup-getz-dist',
    name: 'Khyber Pharma Distributors',
    company: 'Getz / Abbott',
    phone: '0312-3456789',
    email: 'khyber.dist@gmail.com',
    address: 'Plaza 4, Circular Road, Rawalpindi',
    balanceOwed: 0
  }
];

export const sampleSeedCustomers: Customer[] = [
  {
    id: 'cust-walk-in',
    name: 'Counter Cash Customer',
    phone: '0300-0000000',
    email: '',
    address: 'Walk-in Retail',
    balanceReceivable: 0
  },
  {
    id: 'cust-dr-tariq',
    name: 'Dr. Tariq Mahmood Clinic',
    phone: '0333-5551234',
    email: 'dr.tariq@gmail.com',
    address: 'Main Bazar Clinic, Pakistan',
    balanceReceivable: 0
  }
];
