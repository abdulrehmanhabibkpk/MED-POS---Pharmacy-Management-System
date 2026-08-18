export interface Product {
  id: string;
  barcode: string;
  name: string;
  company: string;
  category: string;
  purchasePrice: number;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  minStockAlert: number;
}

export interface CartItem {
  product: Product;
  qty: number;
  rate: number;
  discount: number;
  subtotal: number;
}

export interface SaleInvoiceItem {
  barcode: string;
  name: string;
  qty: number;
  rate: number;
  discount: number;
  subtotal: number;
}

export interface SaleInvoice {
  id: string;
  invoiceNo: number;
  date: string; // ISO string or formatted YYYY-MM-DD HH:mm:ss
  customerName: string;
  saleType: 'Retail' | 'Wholesale' | 'Walk-in';
  items: SaleInvoiceItem[];
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  changeAmount: number;
  cashier: string;
}

export interface SaleReturn {
  id: string;
  date: string;
  barcode: string;
  productName: string;
  qty: number;
  refundAmount: number;
  reason?: string;
}

export interface CreditPayment {
  id: string;
  date: string;
  customerName: string;
  amountReceived: number;
  notes?: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  supplierName: string;
  barcode: string;
  itemName: string;
  qtyReceived: number;
  unitCostPrice: number;
  salePriceRetail: number;
  wholesalePrice: number;
  totalCost: number;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  recordedBy: string;
}

export type ThermalPaperSize = '58mm' | '80mm';

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  logoUrl: string;
  currency: string;
  footerNote: string;
  defaultPaperSize?: ThermalPaperSize;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  balanceOwed: number; // Positive = we owe them money (payable)
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balanceReceivable: number; // Positive = they owe us money (receivable)
}

export interface UserPermissions {
  canSale: boolean;
  canReturn: boolean;
  canStock: boolean;
  canSettings: boolean;
  canReports: boolean;
  canExpenses: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Manager' | 'Cashier';
  permissions: UserPermissions;
}

export type UserRole = 'Admin' | 'Manager' | 'Cashier';

export type ActiveTab =
  | 'dashboard'
  | 'sale-invoice'
  | 'sale-return'
  | 'bill-history'
  | 'credit-receive'
  | 'purchase-stock'
  | 'products'
  | 'suppliers'
  | 'customers'
  | 'day-closing'
  | 'pay-expense'
  | 'reports'
  | 'store-settings'
  | 'barcode-label'
  | 'plan-prd'
  | 'master-admin';
