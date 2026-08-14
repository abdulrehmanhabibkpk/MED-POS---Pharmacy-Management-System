import { Product, SaleInvoice, PurchaseRecord, CreditPayment, ExpenseRecord, StoreSettings } from '../types';

export const initialStoreSettings: StoreSettings = {
  storeName: 'MY MEDICAL STORE',
  tagline: 'Pharmacy & General Store',
  address: 'Main Market, Pakistan',
  phone: '0300-1234567',
  logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
  currency: 'Rs.',
  footerNote: 'THANK YOU! VISIT AGAIN\nStay Healthy - Stay Safe',
};

export const initialProducts: Product[] = [
  {
    id: 'p-1001',
    barcode: '1001',
    name: 'Cooking Oil 5L',
    company: 'Dalda',
    category: 'Grocery',
    purchasePrice: 2200,
    retailPrice: 2500,
    wholesalePrice: 2350,
    stock: 50,
    minStockAlert: 10,
  },
  {
    id: 'p-1004',
    barcode: '1004',
    name: 'Soap Pack',
    company: 'Lux',
    category: 'Personal Care',
    purchasePrice: 450,
    retailPrice: 550,
    wholesalePrice: 490,
    stock: 119,
    minStockAlert: 15,
  },
  {
    id: 'p-1003',
    barcode: '1003',
    name: 'Tea 900g',
    company: 'Tapal',
    category: 'Beverages',
    purchasePrice: 1400,
    retailPrice: 1650,
    wholesalePrice: 1520,
    stock: 23,
    minStockAlert: 5,
  },
  {
    id: 'p-1002',
    barcode: '1002',
    name: 'Wheat Flour 10kg',
    company: 'Sunridge',
    category: 'Grocery',
    purchasePrice: 1100,
    retailPrice: 1300,
    wholesalePrice: 1200,
    stock: 79,
    minStockAlert: 12,
  },
  {
    id: 'p-6576',
    barcode: '6576',
    name: 'Panadol Extra 500mg (Strip)',
    company: 'GSK',
    category: 'Pharmacy',
    purchasePrice: 180,
    retailPrice: 240,
    wholesalePrice: 210,
    stock: 85,
    minStockAlert: 20,
  },
  {
    id: 'p-2001',
    barcode: '2001',
    name: 'Augmentin 625mg Tab (6s)',
    company: 'GSK',
    category: 'Pharmacy',
    purchasePrice: 320,
    retailPrice: 390,
    wholesalePrice: 360,
    stock: 45,
    minStockAlert: 10,
  },
  {
    id: 'p-2002',
    barcode: '2002',
    name: 'Brufen 400mg (Strip)',
    company: 'Abbott',
    category: 'Pharmacy',
    purchasePrice: 95,
    retailPrice: 130,
    wholesalePrice: 115,
    stock: 120,
    minStockAlert: 25,
  },
  {
    id: 'p-2003',
    barcode: '2003',
    name: 'Disprin Regular 300mg',
    company: 'Reckitt',
    category: 'Pharmacy',
    purchasePrice: 140,
    retailPrice: 185,
    wholesalePrice: 165,
    stock: 90,
    minStockAlert: 15,
  },
  {
    id: 'p-2004',
    barcode: '2004',
    name: 'Sancos Cough Syrup 120ml',
    company: 'Novartis',
    category: 'Pharmacy',
    purchasePrice: 110,
    retailPrice: 150,
    wholesalePrice: 135,
    stock: 40,
    minStockAlert: 8,
  }
];

export const initialSales: SaleInvoice[] = [
  {
    id: 'inv-2',
    invoiceNo: 2,
    date: '2026-08-13 23:53:53',
    customerName: 'Cash Customer',
    saleType: 'Wholesale',
    items: [
      {
        barcode: '1001',
        name: 'Cooking Oil 5L',
        qty: 2,
        rate: 2350,
        discount: 0,
        subtotal: 4700,
      },
      {
        barcode: '1004',
        name: 'Soap Pack',
        qty: 1,
        rate: 490,
        discount: 0,
        subtotal: 490,
      },
      {
        barcode: '6576',
        name: 'Panadol Extra 500mg',
        qty: 1,
        rate: 370,
        discount: 0,
        subtotal: 370,
      }
    ],
    totalAmount: 5560,
    discountAmount: 0,
    netAmount: 5560,
    paidAmount: 5560,
    changeAmount: 0,
    cashier: 'Admin',
  },
  {
    id: 'inv-1',
    invoiceNo: 1,
    date: '2026-08-05 17:46:32',
    customerName: 'Cash Customer',
    saleType: 'Wholesale',
    items: [
      {
        barcode: '1001',
        name: 'Cooking Oil 5L',
        qty: 6,
        rate: 2350,
        discount: 0,
        subtotal: 14100,
      },
      {
        barcode: '1002',
        name: 'Wheat Flour 10kg',
        qty: 2,
        rate: 1310,
        discount: 0,
        subtotal: 2620,
      }
    ],
    totalAmount: 16720,
    discountAmount: 500,
    netAmount: 16220,
    paidAmount: 16220,
    changeAmount: 0,
    cashier: 'Admin',
  }
];

export const initialPurchases: PurchaseRecord[] = [
  {
    id: 'pur-1',
    date: '2026-08-04 11:20:00',
    supplierName: 'Al-Madina Distributors',
    barcode: '1001',
    itemName: 'Cooking Oil 5L',
    qtyReceived: 50,
    unitCostPrice: 2200,
    salePriceRetail: 2500,
    wholesalePrice: 2350,
    totalCost: 110000,
  }
];

export const initialCredits: CreditPayment[] = [
  {
    id: 'c-1',
    date: '2026-08-10 14:15:00',
    customerName: 'Dr. Tariq Clinic',
    amountReceived: 4500,
    notes: 'Paid via Easypaisa for July supplies',
  }
];

export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'exp-1',
    date: '2026-08-12 18:30:00',
    category: 'Electricity',
    amount: 3200,
    description: 'Store electricity bill share',
    recordedBy: 'Admin',
  },
  {
    id: 'exp-2',
    date: '2026-08-14 12:00:00',
    category: 'Tea & Refreshment',
    amount: 350,
    description: 'Tea and biscuits for staff & guests',
    recordedBy: 'Admin',
  }
];
