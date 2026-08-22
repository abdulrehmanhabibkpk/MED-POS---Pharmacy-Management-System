-- MEDPOS Supabase Database Schema
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com/dashboard/project/jbwuskiuutolxstytyul/sql/new) and run it.

-- 1. User Accounts Table
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions TEXT NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    barcode TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    category TEXT NOT NULL,
    supplier_id TEXT,
    supplier_name TEXT,
    purchase_price DOUBLE PRECISION NOT NULL,
    retail_price DOUBLE PRECISION NOT NULL,
    wholesale_price DOUBLE PRECISION NOT NULL,
    stock DOUBLE PRECISION NOT NULL,
    min_stock_alert DOUBLE PRECISION NOT NULL,
    batch_no TEXT,
    expiry_date TEXT,
    unit_of_sale TEXT NOT NULL,
    weight_value DOUBLE PRECISION
);

-- 3. Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    invoice_no INTEGER NOT NULL,
    date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    sale_type TEXT NOT NULL,
    items TEXT NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    discount_amount DOUBLE PRECISION NOT NULL,
    net_amount DOUBLE PRECISION NOT NULL,
    paid_amount DOUBLE PRECISION NOT NULL,
    change_amount DOUBLE PRECISION NOT NULL,
    cashier TEXT NOT NULL
);

-- 4. Returns Table
CREATE TABLE IF NOT EXISTS public.returns (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    barcode TEXT NOT NULL,
    item_name TEXT NOT NULL,
    qty DOUBLE PRECISION NOT NULL,
    refund_amount DOUBLE PRECISION NOT NULL,
    reason TEXT
);

-- 5. Credits Table
CREATE TABLE IF NOT EXISTS public.credits (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    amount_received DOUBLE PRECISION NOT NULL,
    notes TEXT
);

-- 6. Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    supplier_id TEXT,
    supplier_name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    item_name TEXT NOT NULL,
    qty_received DOUBLE PRECISION NOT NULL,
    unit_cost_price DOUBLE PRECISION NOT NULL,
    sale_price_retail DOUBLE PRECISION NOT NULL,
    wholesale_price DOUBLE PRECISION NOT NULL,
    total_cost DOUBLE PRECISION NOT NULL
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    recorded_by TEXT NOT NULL
);

-- 8. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    balance_owed DOUBLE PRECISION NOT NULL
);

-- 9. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    balance_receivable DOUBLE PRECISION NOT NULL
);

-- 10. Customer Transactions Table
CREATE TABLE IF NOT EXISTS public.customer_transactions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_no TEXT NOT NULL,
    description TEXT NOT NULL,
    items_summary TEXT,
    debit DOUBLE PRECISION NOT NULL,
    credit DOUBLE PRECISION NOT NULL,
    balance DOUBLE PRECISION NOT NULL,
    payment_method TEXT,
    notes TEXT
);

-- 11. Supplier Transactions Table
CREATE TABLE IF NOT EXISTS public.supplier_transactions (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_no TEXT NOT NULL,
    description TEXT NOT NULL,
    items_summary TEXT,
    debit DOUBLE PRECISION NOT NULL,
    credit DOUBLE PRECISION NOT NULL,
    balance DOUBLE PRECISION NOT NULL,
    payment_method TEXT,
    notes TEXT
);

-- 12. Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Enable Row Level Security (RLS) but allow authenticated & service role access
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist to prevent errors when re-running
DROP POLICY IF EXISTS "Allow all to service role" ON public.user_accounts;
DROP POLICY IF EXISTS "Allow all to service role" ON public.products;
DROP POLICY IF EXISTS "Allow all to service role" ON public.sales;
DROP POLICY IF EXISTS "Allow all to service role" ON public.returns;
DROP POLICY IF EXISTS "Allow all to service role" ON public.credits;
DROP POLICY IF EXISTS "Allow all to service role" ON public.purchases;
DROP POLICY IF EXISTS "Allow all to service role" ON public.expenses;
DROP POLICY IF EXISTS "Allow all to service role" ON public.suppliers;
DROP POLICY IF EXISTS "Allow all to service role" ON public.customers;
DROP POLICY IF EXISTS "Allow all to service role" ON public.customer_transactions;
DROP POLICY IF EXISTS "Allow all to service role" ON public.supplier_transactions;
DROP POLICY IF EXISTS "Allow all to service role" ON public.store_settings;

DROP POLICY IF EXISTS "Allow anon public access" ON public.user_accounts;
DROP POLICY IF EXISTS "Allow anon public access" ON public.products;
DROP POLICY IF EXISTS "Allow anon public access" ON public.sales;
DROP POLICY IF EXISTS "Allow anon public access" ON public.returns;
DROP POLICY IF EXISTS "Allow anon public access" ON public.credits;
DROP POLICY IF EXISTS "Allow anon public access" ON public.purchases;
DROP POLICY IF EXISTS "Allow anon public access" ON public.expenses;
DROP POLICY IF EXISTS "Allow anon public access" ON public.suppliers;
DROP POLICY IF EXISTS "Allow anon public access" ON public.customers;
DROP POLICY IF EXISTS "Allow anon public access" ON public.customer_transactions;
DROP POLICY IF EXISTS "Allow anon public access" ON public.supplier_transactions;
DROP POLICY IF EXISTS "Allow anon public access" ON public.store_settings;

-- Create permissive RLS policies for the service_role and anon keys
CREATE POLICY "Allow all to service role" ON public.user_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.sales FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.returns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.credits FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.purchases FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.expenses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.suppliers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.customers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.customer_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.supplier_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to service role" ON public.store_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Also allow anon public access
CREATE POLICY "Allow anon public access" ON public.user_accounts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.products FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.sales FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.returns FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.credits FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.purchases FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.expenses FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.suppliers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.customers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.customer_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.supplier_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon public access" ON public.store_settings FOR ALL TO anon USING (true) WITH CHECK (true);
