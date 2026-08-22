export const schema = `
  CREATE TABLE IF NOT EXISTS user_accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      permissions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      barcode TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      category TEXT NOT NULL,
      supplierId TEXT,
      supplierName TEXT,
      purchasePrice REAL NOT NULL,
      retailPrice REAL NOT NULL,
      wholesalePrice REAL NOT NULL,
      stock REAL NOT NULL,
      minStockAlert REAL NOT NULL,
      batchNo TEXT,
      expiryDate TEXT,
      unitOfSale TEXT NOT NULL,
      weightValue REAL
  );

  CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      invoiceNo INTEGER NOT NULL,
      date TEXT NOT NULL,
      customerName TEXT NOT NULL,
      saleType TEXT NOT NULL,
      items TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      discountAmount REAL NOT NULL,
      netAmount REAL NOT NULL,
      paidAmount REAL NOT NULL,
      changeAmount REAL NOT NULL,
      cashier TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      barcode TEXT NOT NULL,
      itemName TEXT NOT NULL,
      qty REAL NOT NULL,
      refundAmount REAL NOT NULL,
      reason TEXT
  );

  CREATE TABLE IF NOT EXISTS credits (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      customerName TEXT NOT NULL,
      amountReceived REAL NOT NULL,
      notes TEXT
  );

  CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      supplierId TEXT,
      supplierName TEXT NOT NULL,
      barcode TEXT NOT NULL,
      itemName TEXT NOT NULL,
      qtyReceived REAL NOT NULL,
      unitCostPrice REAL NOT NULL,
      salePriceRetail REAL NOT NULL,
      wholesalePrice REAL NOT NULL,
      totalCost REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      recordedBy TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      balanceOwed REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      balanceReceivable REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customer_transactions (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      referenceNo TEXT NOT NULL,
      description TEXT NOT NULL,
      itemsSummary TEXT,
      debit REAL NOT NULL,
      credit REAL NOT NULL,
      balance REAL NOT NULL,
      paymentMethod TEXT,
      notes TEXT
  );

  CREATE TABLE IF NOT EXISTS supplier_transactions (
      id TEXT PRIMARY KEY,
      supplierId TEXT NOT NULL,
      supplierName TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      referenceNo TEXT NOT NULL,
      description TEXT NOT NULL,
      itemsSummary TEXT,
      debit REAL NOT NULL,
      credit REAL NOT NULL,
      balance REAL NOT NULL,
      paymentMethod TEXT,
      notes TEXT
  );

  CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
  );
`;
