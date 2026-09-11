-- =========================================================================
-- Hostinger MySQL Database Schema for LimoPOS / MedPOS
-- Compatible with: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Instructions:
-- 1. Open Hostinger hPanel -> Databases -> phpMyAdmin
-- 2. Select your Database
-- 3. Click on the "SQL" tab
-- 4. Paste this entire file and click "Go" (Run)
-- =========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table (Authentication & Permissions)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL DEFAULT '123456',
  role VARCHAR(50) NOT NULL DEFAULT 'Admin',
  phone VARCHAR(50) DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Store Configuration & Custom Settings
CREATE TABLE IF NOT EXISTS store_settings (
  user_id VARCHAR(100) NOT NULL PRIMARY KEY,
  store_settings LONGTEXT NULL,
  categories LONGTEXT NULL,
  brands LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Unified Realtime Record Storage (Products, Sales, Purchases, Returns, Khata, etc.)
CREATE TABLE IF NOT EXISTS generic_records (
  id VARCHAR(150) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  collection_name VARCHAR(100) NOT NULL,
  data LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id, user_id, collection_name),
  INDEX idx_user_collection (user_id, collection_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Dedicated Products Table (Optional direct queries)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  barcode VARCHAR(100) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  purchase_price DECIMAL(12, 2) DEFAULT 0.00,
  retail_price DECIMAL(12, 2) DEFAULT 0.00,
  wholesale_price DECIMAL(12, 2) DEFAULT 0.00,
  stock INT DEFAULT 0,
  min_stock_alert INT DEFAULT 10,
  unit_of_sale VARCHAR(50) DEFAULT 'Pcs',
  expiry_date VARCHAR(50) DEFAULT NULL,
  batch_no VARCHAR(100) DEFAULT NULL,
  raw_data LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_prod_user (user_id),
  INDEX idx_prod_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Dedicated Sales Invoices Table
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  invoice_number VARCHAR(100) DEFAULT NULL,
  customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
  total_amount DECIMAL(12, 2) DEFAULT 0.00,
  discount DECIMAL(12, 2) DEFAULT 0.00,
  final_amount DECIMAL(12, 2) DEFAULT 0.00,
  paid_amount DECIMAL(12, 2) DEFAULT 0.00,
  change_amount DECIMAL(12, 2) DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  raw_data LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sales_user (user_id),
  INDEX idx_sales_inv (invoice_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Dedicated Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  balance_owed DECIMAL(12, 2) DEFAULT 0.00,
  raw_data LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sup_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Dedicated Customers Table (Khata)
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  balance_receivable DECIMAL(12, 2) DEFAULT 0.00,
  raw_data LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cust_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Dedicated Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) DEFAULT 'General',
  amount DECIMAL(12, 2) DEFAULT 0.00,
  expense_date VARCHAR(50) DEFAULT NULL,
  raw_data LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_exp_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- Initial Master Admin Account Seed (Password: 123456)
-- You can change your password anytime after logging in
-- =========================================================================
INSERT INTO users (id, name, email, password, role, active)
VALUES ('user_admin_01', 'Ali Traders (Admin)', 'alitrader@gmail.com', '123456', 'Admin', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

SET FOREIGN_KEY_CHECKS = 1;
