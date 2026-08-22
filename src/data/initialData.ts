import { Product, SaleInvoice, PurchaseRecord, CreditPayment, ExpenseRecord, StoreSettings, CustomerTransaction, SupplierTransaction } from '../types';

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
