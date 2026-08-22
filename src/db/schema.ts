import { pgTable, text, doublePrecision, integer } from 'drizzle-orm/pg-core';

export const userAccounts = pgTable('user_accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  permissions: text('permissions').notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  barcode: text('barcode').notNull(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  category: text('category').notNull(),
  supplierId: text('supplier_id'),
  supplierName: text('supplier_name'),
  purchasePrice: doublePrecision('purchase_price').notNull(),
  retailPrice: doublePrecision('retail_price').notNull(),
  wholesalePrice: doublePrecision('wholesale_price').notNull(),
  stock: doublePrecision('stock').notNull(),
  minStockAlert: doublePrecision('min_stock_alert').notNull(),
  batchNo: text('batch_no'),
  expiryDate: text('expiry_date'),
  unitOfSale: text('unit_of_sale').notNull(),
  weightValue: doublePrecision('weight_value'),
});

export const sales = pgTable('sales', {
  id: text('id').primaryKey(),
  invoiceNo: integer('invoice_no').notNull(),
  date: text('date').notNull(),
  customerName: text('customer_name').notNull(),
  saleType: text('sale_type').notNull(),
  items: text('items').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  discountAmount: doublePrecision('discount_amount').notNull(),
  netAmount: doublePrecision('net_amount').notNull(),
  paidAmount: doublePrecision('paid_amount').notNull(),
  changeAmount: doublePrecision('change_amount').notNull(),
  cashier: text('cashier').notNull(),
});

export const returns = pgTable('returns', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  barcode: text('barcode').notNull(),
  itemName: text('item_name').notNull(),
  qty: doublePrecision('qty').notNull(),
  refundAmount: doublePrecision('refund_amount').notNull(),
  reason: text('reason'),
});

export const credits = pgTable('credits', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  customerName: text('customer_name').notNull(),
  amountReceived: doublePrecision('amount_received').notNull(),
  notes: text('notes'),
});

export const purchases = pgTable('purchases', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  supplierId: text('supplier_id'),
  supplierName: text('supplier_name').notNull(),
  barcode: text('barcode').notNull(),
  itemName: text('item_name').notNull(),
  qtyReceived: doublePrecision('qty_received').notNull(),
  unitCostPrice: doublePrecision('unit_cost_price').notNull(),
  salePriceRetail: doublePrecision('sale_price_retail').notNull(),
  wholesalePrice: doublePrecision('wholesale_price').notNull(),
  totalCost: doublePrecision('total_cost').notNull(),
});

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  amount: doublePrecision('amount').notNull(),
  description: text('description').notNull(),
  recordedBy: text('recorded_by').notNull(),
});

export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  balanceOwed: doublePrecision('balance_owed').notNull(),
});

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  balanceReceivable: doublePrecision('balance_receivable').notNull(),
});

export const customerTransactions = pgTable('customer_transactions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(),
  referenceNo: text('reference_no').notNull(),
  description: text('description').notNull(),
  itemsSummary: text('items_summary'),
  debit: doublePrecision('debit').notNull(),
  credit: doublePrecision('credit').notNull(),
  balance: doublePrecision('balance').notNull(),
  paymentMethod: text('payment_method'),
  notes: text('notes'),
});

export const supplierTransactions = pgTable('supplier_transactions', {
  id: text('id').primaryKey(),
  supplierId: text('supplier_id').notNull(),
  supplierName: text('supplier_name').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(),
  referenceNo: text('reference_no').notNull(),
  description: text('description').notNull(),
  itemsSummary: text('items_summary'),
  debit: doublePrecision('debit').notNull(),
  credit: doublePrecision('credit').notNull(),
  balance: doublePrecision('balance').notNull(),
  paymentMethod: text('payment_method'),
  notes: text('notes'),
});

export const storeSettings = pgTable('store_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
