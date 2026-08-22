import express from 'express';
import cors from 'cors';
import db from './db/database';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper function to run queries with async/await
const query = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Single Round-Trip: Load all POS data from SQLite database
app.get('/api/pos-data', async (req, res) => {
  try {
    const user_accounts = await query('SELECT * FROM user_accounts');
    const products = await query('SELECT * FROM products');
    const sales = await query('SELECT * FROM sales');
    const returns = await query('SELECT * FROM returns');
    const credits = await query('SELECT * FROM credits');
    const purchases = await query('SELECT * FROM purchases');
    const expenses = await query('SELECT * FROM expenses');
    const suppliers = await query('SELECT * FROM suppliers');
    const customers = await query('SELECT * FROM customers');
    const customer_transactions = await query('SELECT * FROM customer_transactions');
    const supplier_transactions = await query('SELECT * FROM supplier_transactions');
    const store_settings_rows = await query('SELECT * FROM store_settings');

    // Parse JSON columns
    const formattedUserAccounts = user_accounts.map(acc => ({
      ...acc,
      permissions: JSON.parse(acc.permissions || '{}')
    }));

    const formattedSales = sales.map(s => ({
      ...s,
      items: JSON.parse(s.items || '[]')
    }));

    // Find and parse store settings
    const settingsRow = store_settings_rows.find(r => r.key === 'settings');
    const storeSettings = settingsRow ? JSON.parse(settingsRow.value) : null;

    res.json({
      userAccounts: formattedUserAccounts,
      products,
      sales: formattedSales,
      returns,
      credits,
      purchases,
      expenses,
      suppliers,
      customers,
      customerTransactions: customer_transactions,
      supplierTransactions: supplier_transactions,
      storeSettings
    });
  } catch (error: any) {
    console.error('Error fetching POS data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Single Round-Trip: Save/Restore entire state (Perfect for automatic complete sync & recovery)
app.post('/api/save-all', async (req, res) => {
  const {
    products,
    sales,
    returns,
    purchases,
    credits,
    expenses,
    suppliers,
    customers,
    customerTransactions,
    supplierTransactions,
    storeSettings,
    userAccounts
  } = req.body;

  try {
    // We execute inside a SQLite transaction
    await run('BEGIN TRANSACTION');

    if (products) {
      await run('DELETE FROM products');
      for (const p of products) {
        await run(
          `INSERT OR REPLACE INTO products (id, barcode, name, company, category, supplierId, supplierName, purchasePrice, retailPrice, wholesalePrice, stock, minStockAlert, batchNo, expiryDate, unitOfSale, weightValue) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.barcode,
            p.name,
            p.company,
            p.category,
            p.supplierId || null,
            p.supplierName || null,
            p.purchasePrice || 0,
            p.retailPrice || 0,
            p.wholesalePrice || 0,
            p.stock || 0,
            p.minStockAlert || 0,
            p.batchNo || null,
            p.expiryDate || null,
            p.unitOfSale || 'Item',
            p.weightValue || null
          ]
        );
      }
    }

    if (sales) {
      await run('DELETE FROM sales');
      for (const s of sales) {
        await run(
          `INSERT OR REPLACE INTO sales (id, invoiceNo, date, customerName, saleType, items, totalAmount, discountAmount, netAmount, paidAmount, changeAmount, cashier)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id,
            s.invoiceNo,
            s.date,
            s.customerName,
            s.saleType,
            JSON.stringify(s.items || []),
            s.totalAmount,
            s.discountAmount,
            s.netAmount,
            s.paidAmount,
            s.changeAmount,
            s.cashier
          ]
        );
      }
    }

    if (returns) {
      await run('DELETE FROM returns');
      for (const r of returns) {
        await run(
          `INSERT OR REPLACE INTO returns (id, date, barcode, itemName, qty, refundAmount, reason)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [r.id, r.date, r.barcode, r.itemName, r.qty, r.refundAmount, r.reason || null]
        );
      }
    }

    if (purchases) {
      await run('DELETE FROM purchases');
      for (const pur of purchases) {
        await run(
          `INSERT OR REPLACE INTO purchases (id, date, supplierId, supplierName, barcode, itemName, qtyReceived, unitCostPrice, salePriceRetail, wholesalePrice, totalCost)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pur.id,
            pur.date,
            pur.supplierId || null,
            pur.supplierName,
            pur.barcode,
            pur.itemName,
            pur.qtyReceived,
            pur.unitCostPrice,
            pur.salePriceRetail,
            pur.wholesalePrice,
            pur.totalCost
          ]
        );
      }
    }

    if (credits) {
      await run('DELETE FROM credits');
      for (const c of credits) {
        await run(
          `INSERT OR REPLACE INTO credits (id, date, customerName, amountReceived, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [c.id, c.date, c.customerName, c.amountReceived, c.notes || null]
        );
      }
    }

    if (expenses) {
      await run('DELETE FROM expenses');
      for (const e of expenses) {
        await run(
          `INSERT OR REPLACE INTO expenses (id, date, category, amount, description, recordedBy)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [e.id, e.date, e.category, e.amount, e.description || '', e.recordedBy || '']
        );
      }
    }

    if (suppliers) {
      await run('DELETE FROM suppliers');
      for (const sup of suppliers) {
        await run(
          `INSERT OR REPLACE INTO suppliers (id, name, company, phone, email, address, balanceOwed)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [sup.id, sup.name, sup.company, sup.phone || null, sup.email || null, sup.address || null, sup.balanceOwed]
        );
      }
    }

    if (customers) {
      await run('DELETE FROM customers');
      for (const cust of customers) {
        await run(
          `INSERT OR REPLACE INTO customers (id, name, phone, email, address, balanceReceivable)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [cust.id, cust.name, cust.phone || null, cust.email || null, cust.address || null, cust.balanceReceivable]
        );
      }
    }

    if (customerTransactions) {
      await run('DELETE FROM customer_transactions');
      for (const tx of customerTransactions) {
        await run(
          `INSERT OR REPLACE INTO customer_transactions (id, customerId, customerName, date, type, referenceNo, description, itemsSummary, debit, credit, balance, paymentMethod, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tx.id,
            tx.customerId,
            tx.customerName,
            tx.date,
            tx.type,
            tx.referenceNo,
            tx.description,
            tx.itemsSummary || null,
            tx.debit,
            tx.credit,
            tx.balance,
            tx.paymentMethod || null,
            tx.notes || null
          ]
        );
      }
    }

    if (supplierTransactions) {
      await run('DELETE FROM supplier_transactions');
      for (const tx of supplierTransactions) {
        await run(
          `INSERT OR REPLACE INTO supplier_transactions (id, supplierId, supplierName, date, type, referenceNo, description, itemsSummary, debit, credit, balance, paymentMethod, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tx.id,
            tx.supplierId,
            tx.supplierName,
            tx.date,
            tx.type,
            tx.referenceNo,
            tx.description,
            tx.itemsSummary || null,
            tx.debit,
            tx.credit,
            tx.balance,
            tx.paymentMethod || null,
            tx.notes || null
          ]
        );
      }
    }

    if (storeSettings) {
      await run(
        `INSERT OR REPLACE INTO store_settings (key, value) VALUES ('settings', ?)`,
        [JSON.stringify(storeSettings)]
      );
    }

    if (userAccounts) {
      await run('DELETE FROM user_accounts');
      for (const acc of userAccounts) {
        await run(
          `INSERT OR REPLACE INTO user_accounts (id, name, email, password, role, permissions)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [acc.id, acc.name, acc.email, acc.password || '', acc.role, JSON.stringify(acc.permissions || {})]
        );
      }
    }

    await run('COMMIT');
    res.json({ success: true, message: 'All POS database tables successfully live-synchronized!' });
  } catch (error: any) {
    await run('ROLLBACK');
    console.error('Error saving all POS data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dynamic Incremental Mutations (To allow instant lightweight writes)
app.post('/api/products', async (req, res) => {
  const p = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO products (id, barcode, name, company, category, supplierId, supplierName, purchasePrice, retailPrice, wholesalePrice, stock, minStockAlert, batchNo, expiryDate, unitOfSale, weightValue) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.barcode, p.name, p.company, p.category, p.supplierId || null, p.supplierName || null,
        p.purchasePrice || 0, p.retailPrice || 0, p.wholesalePrice || 0, p.stock || 0, p.minStockAlert || 0,
        p.batchNo || null, p.expiryDate || null, p.unitOfSale || 'Item', p.weightValue || null
      ]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const s = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO sales (id, invoiceNo, date, customerName, saleType, items, totalAmount, discountAmount, netAmount, paidAmount, changeAmount, cashier)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id, s.invoiceNo, s.date, s.customerName, s.saleType, JSON.stringify(s.items || []),
        s.totalAmount, s.discountAmount, s.netAmount, s.paidAmount, s.changeAmount, s.cashier
      ]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  try {
    await run('DELETE FROM sales WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/returns', async (req, res) => {
  const r = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO returns (id, date, barcode, itemName, qty, refundAmount, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.date, r.barcode, r.itemName, r.qty, r.refundAmount, r.reason || null]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/returns/:id', async (req, res) => {
  try {
    await run('DELETE FROM returns WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  const pur = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO purchases (id, date, supplierId, supplierName, barcode, itemName, qtyReceived, unitCostPrice, salePriceRetail, wholesalePrice, totalCost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pur.id, pur.date, pur.supplierId || null, pur.supplierName, pur.barcode, pur.itemName,
        pur.qtyReceived, pur.unitCostPrice, pur.salePriceRetail, pur.wholesalePrice, pur.totalCost
      ]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/purchases/:id', async (req, res) => {
  try {
    await run('DELETE FROM purchases WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/credits', async (req, res) => {
  const c = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO credits (id, date, customerName, amountReceived, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [c.id, c.date, c.customerName, c.amountReceived, c.notes || null]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/credits/:id', async (req, res) => {
  try {
    await run('DELETE FROM credits WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  const e = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO expenses (id, date, category, amount, description, recordedBy)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [e.id, e.date, e.category, e.amount, e.description || '', e.recordedBy || '']
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await run('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  const sup = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO suppliers (id, name, company, phone, email, address, balanceOwed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sup.id, sup.name, sup.company, sup.phone || null, sup.email || null, sup.address || null, sup.balanceOwed]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await run('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const cust = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO customers (id, name, phone, email, address, balanceReceivable)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cust.id, cust.name, cust.phone || null, cust.email || null, cust.address || null, cust.balanceReceivable]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await run('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer-transactions', async (req, res) => {
  const tx = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO customer_transactions (id, customerId, customerName, date, type, referenceNo, description, itemsSummary, debit, credit, balance, paymentMethod, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id, tx.customerId, tx.customerName, tx.date, tx.type, tx.referenceNo, tx.description,
        tx.itemsSummary || null, tx.debit, tx.credit, tx.balance, tx.paymentMethod || null, tx.notes || null
      ]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customer-transactions/:id', async (req, res) => {
  try {
    await run('DELETE FROM customer_transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/supplier-transactions', async (req, res) => {
  const tx = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO supplier_transactions (id, supplierId, supplierName, date, type, referenceNo, description, itemsSummary, debit, credit, balance, paymentMethod, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id, tx.supplierId, tx.supplierName, tx.date, tx.type, tx.referenceNo, tx.description,
        tx.itemsSummary || null, tx.debit, tx.credit, tx.balance, tx.paymentMethod || null, tx.notes || null
      ]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/supplier-transactions/:id', async (req, res) => {
  try {
    await run('DELETE FROM supplier_transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user-accounts', async (req, res) => {
  const acc = req.body;
  try {
    await run(
      `INSERT OR REPLACE INTO user_accounts (id, name, email, password, role, permissions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [acc.id, acc.name, acc.email, acc.password || '', acc.role, JSON.stringify(acc.permissions || {})]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/user-accounts/:id', async (req, res) => {
  try {
    await run('DELETE FROM user_accounts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
