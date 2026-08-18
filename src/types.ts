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

export interface CustomerTransaction {
  id: string;
  customerId: string;
  customerName: string;
  date: string; // YYYY-MM-DD HH:mm:ss
  type: 'INVOICE_CREDIT' | 'PAYMENT_RECEIVED' | 'OPENING_BALANCE' | 'RETURN_REFUND' | 'MANUAL_ADJUSTMENT';
  referenceNo: string; // e.g. "#INV-1002", "#REC-45", "#ADJ-1"
  description: string;
  itemsSummary?: string; // e.g. "Panadol Extra 500mg x 2, Brufen 400mg x 1"
  debit: number; // Items/Credit given (increases customer debt/receivable)
  credit: number; // Cash/Payment received (reduces customer debt/receivable)
  balance: number; // Running balance after this transaction
  paymentMethod?: string; // e.g. 'Cash', 'Bank Transfer', 'Easypaisa', 'Cheque'
  notes?: string;
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string; // YYYY-MM-DD HH:mm:ss
  type: 'PURCHASE_BILL' | 'PAYMENT_PAID' | 'OPENING_BALANCE' | 'PURCHASE_RETURN' | 'MANUAL_ADJUSTMENT';
  referenceNo: string; // e.g. "#PUR-101", "#PAY-20", "#ADJ-5"
  description: string;
  itemsSummary?: string; // e.g. "Panadol 500mg (50 packs), Augmentin (20 boxes)"
  debit: number; // Payment paid to supplier (reduces balance owed)
  credit: number; // Stock received/Bill (increases balance owed)
  balance: number; // Running balance owed
  paymentMethod?: string;
  notes?: string;
}

export interface UserPermissions {
  canDashboard: boolean;
  canSale: boolean;
  canReturn: boolean;
  canBillHistory: boolean;
  canCreditReceive: boolean;
  canPurchaseStock: boolean;
  canProducts: boolean;
  canSuppliers: boolean;
  canCustomers: boolean;
  canBarcodeLabel: boolean;
  canDayClosing: boolean;
  canExpenses: boolean;
  canReports: boolean;
  canSettings: boolean;
  canPlanPRD: boolean;
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
