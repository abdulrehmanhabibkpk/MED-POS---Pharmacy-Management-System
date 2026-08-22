import express from 'express';
import cors from 'cors';
import { db } from '../src/db/index.ts';
import { 
  userAccounts, products, sales, returns, credits, purchases, expenses, 
  suppliers, customers, customerTransactions, supplierTransactions, storeSettings 
} from '../src/db/schema.ts';
import { seedDatabaseIfEmpty } from './db/seed.ts';
import { eq } from 'drizzle-orm';
import { syncAllToSupabase } from './supabaseSync.ts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Single Round-Trip: Load all POS data from PostgreSQL database
app.get('/api/pos-data', async (req, res) => {
  try {
    // Ensure seed data is populated if empty (lazy loading check)
    await seedDatabaseIfEmpty();

    const accountsList = await db.select().from(userAccounts);
    const productsList = await db.select().from(products);
    const salesList = await db.select().from(sales);
    const returnsList = await db.select().from(returns);
    const creditsList = await db.select().from(credits);
    const purchasesList = await db.select().from(purchases);
    const expensesList = await db.select().from(expenses);
    const suppliersList = await db.select().from(suppliers);
    const customersList = await db.select().from(customers);
    const customerTransactionsList = await db.select().from(customerTransactions);
    const supplierTransactionsList = await db.select().from(supplierTransactions);
    const storeSettingsList = await db.select().from(storeSettings);

    // Parse JSON columns
    const formattedUserAccounts = accountsList.map(acc => ({
      ...acc,
      permissions: typeof acc.permissions === 'string' ? JSON.parse(acc.permissions || '{}') : acc.permissions
    }));

    const formattedSales = salesList.map(s => ({
      ...s,
      items: typeof s.items === 'string' ? JSON.parse(s.items || '[]') : s.items
    }));

    // Find and parse store settings
    const settingsRow = storeSettingsList.find(r => r.key === 'settings');
    const parsedStoreSettings = settingsRow ? (typeof settingsRow.value === 'string' ? JSON.parse(settingsRow.value) : settingsRow.value) : null;

    res.json({
      userAccounts: formattedUserAccounts,
      products: productsList,
      sales: formattedSales,
      returns: returnsList,
      credits: creditsList,
      purchases: purchasesList,
      expenses: expensesList,
      suppliers: suppliersList,
      customers: customersList,
      customerTransactions: customerTransactionsList,
      supplierTransactions: supplierTransactionsList,
      storeSettings: parsedStoreSettings
    });
  } catch (error: any) {
    console.error('Error fetching POS data from PostgreSQL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Single Round-Trip: Save/Restore entire state (Perfect for automatic complete sync & recovery)
app.post('/api/save-all', async (req, res) => {
  const {
    products: productsIn,
    sales: salesIn,
    returns: returnsIn,
    purchases: purchasesIn,
    credits: creditsIn,
    expenses: expensesIn,
    suppliers: suppliersIn,
    customers: customersIn,
    customerTransactions: customerTransactionsIn,
    supplierTransactions: supplierTransactionsIn,
    storeSettings: storeSettingsIn,
    userAccounts: userAccountsIn
  } = req.body;

  try {
    // We execute inside a Drizzle transaction
    await db.transaction(async (tx) => {
      if (productsIn) {
        await tx.delete(products);
        for (const p of productsIn) {
          await tx.insert(products).values({
            id: p.id,
            barcode: p.barcode,
            name: p.name,
            company: p.company,
            category: p.category,
            supplierId: p.supplierId || null,
            supplierName: p.supplierName || null,
            purchasePrice: p.purchasePrice || 0,
            retailPrice: p.retailPrice || 0,
            wholesalePrice: p.wholesalePrice || 0,
            stock: p.stock || 0,
            minStockAlert: p.minStockAlert || 0,
            batchNo: p.batchNo || null,
            expiryDate: p.expiryDate || null,
            unitOfSale: p.unitOfSale || 'Item',
            weightValue: p.weightValue || null
          }).onConflictDoUpdate({
            target: products.id,
            set: {
              barcode: p.barcode,
              name: p.name,
              company: p.company,
              category: p.category,
              supplierId: p.supplierId || null,
              supplierName: p.supplierName || null,
              purchasePrice: p.purchasePrice || 0,
              retailPrice: p.retailPrice || 0,
              wholesalePrice: p.wholesalePrice || 0,
              stock: p.stock || 0,
              minStockAlert: p.minStockAlert || 0,
              batchNo: p.batchNo || null,
              expiryDate: p.expiryDate || null,
              unitOfSale: p.unitOfSale || 'Item',
              weightValue: p.weightValue || null
            }
          });
        }
      }

      if (salesIn) {
        await tx.delete(sales);
        for (const s of salesIn) {
          await tx.insert(sales).values({
            id: s.id,
            invoiceNo: s.invoiceNo,
            date: s.date,
            customerName: s.customerName,
            saleType: s.saleType,
            items: JSON.stringify(s.items || []),
            totalAmount: s.totalAmount,
            discountAmount: s.discountAmount,
            netAmount: s.netAmount,
            paidAmount: s.paidAmount,
            changeAmount: s.changeAmount,
            cashier: s.cashier
          }).onConflictDoUpdate({
            target: sales.id,
            set: {
              invoiceNo: s.invoiceNo,
              date: s.date,
              customerName: s.customerName,
              saleType: s.saleType,
              items: JSON.stringify(s.items || []),
              totalAmount: s.totalAmount,
              discountAmount: s.discountAmount,
              netAmount: s.netAmount,
              paidAmount: s.paidAmount,
              changeAmount: s.changeAmount,
              cashier: s.cashier
            }
          });
        }
      }

      if (returnsIn) {
        await tx.delete(returns);
        for (const r of returnsIn) {
          await tx.insert(returns).values({
            id: r.id,
            date: r.date,
            barcode: r.barcode,
            itemName: r.itemName,
            qty: r.qty,
            refundAmount: r.refundAmount,
            reason: r.reason || null
          }).onConflictDoUpdate({
            target: returns.id,
            set: {
              date: r.date,
              barcode: r.barcode,
              itemName: r.itemName,
              qty: r.qty,
              refundAmount: r.refundAmount,
              reason: r.reason || null
            }
          });
        }
      }

      if (purchasesIn) {
        await tx.delete(purchases);
        for (const pur of purchasesIn) {
          await tx.insert(purchases).values({
            id: pur.id,
            date: pur.date,
            supplierId: pur.supplierId || null,
            supplierName: pur.supplierName,
            barcode: pur.barcode,
            itemName: pur.itemName,
            qtyReceived: pur.qtyReceived,
            unitCostPrice: pur.unitCostPrice,
            salePriceRetail: pur.salePriceRetail,
            wholesalePrice: pur.wholesalePrice,
            totalCost: pur.totalCost
          }).onConflictDoUpdate({
            target: purchases.id,
            set: {
              date: pur.date,
              supplierId: pur.supplierId || null,
              supplierName: pur.supplierName,
              barcode: pur.barcode,
              itemName: pur.itemName,
              qtyReceived: pur.qtyReceived,
              unitCostPrice: pur.unitCostPrice,
              salePriceRetail: pur.salePriceRetail,
              wholesalePrice: pur.wholesalePrice,
              totalCost: pur.totalCost
            }
          });
        }
      }

      if (creditsIn) {
        await tx.delete(credits);
        for (const c of creditsIn) {
          await tx.insert(credits).values({
            id: c.id,
            date: c.date,
            customerName: c.customerName,
            amountReceived: c.amountReceived,
            notes: c.notes || null
          }).onConflictDoUpdate({
            target: credits.id,
            set: {
              date: c.date,
              customerName: c.customerName,
              amountReceived: c.amountReceived,
              notes: c.notes || null
            }
          });
        }
      }

      if (expensesIn) {
        await tx.delete(expenses);
        for (const e of expensesIn) {
          await tx.insert(expenses).values({
            id: e.id,
            date: e.date,
            category: e.category,
            amount: e.amount,
            description: e.description || '',
            recordedBy: e.recordedBy || ''
          }).onConflictDoUpdate({
            target: expenses.id,
            set: {
              date: e.date,
              category: e.category,
              amount: e.amount,
              description: e.description || '',
              recordedBy: e.recordedBy || ''
            }
          });
        }
      }

      if (suppliersIn) {
        await tx.delete(suppliers);
        for (const sup of suppliersIn) {
          await tx.insert(suppliers).values({
            id: sup.id,
            name: sup.name,
            company: sup.company,
            phone: sup.phone || null,
            email: sup.email || null,
            address: sup.address || null,
            balanceOwed: sup.balanceOwed
          }).onConflictDoUpdate({
            target: suppliers.id,
            set: {
              name: sup.name,
              company: sup.company,
              phone: sup.phone || null,
              email: sup.email || null,
              address: sup.address || null,
              balanceOwed: sup.balanceOwed
            }
          });
        }
      }

      if (customersIn) {
        await tx.delete(customers);
        for (const cust of customersIn) {
          await tx.insert(customers).values({
            id: cust.id,
            name: cust.name,
            phone: cust.phone || null,
            email: cust.email || null,
            address: cust.address || null,
            balanceReceivable: cust.balanceReceivable
          }).onConflictDoUpdate({
            target: customers.id,
            set: {
              name: cust.name,
              phone: cust.phone || null,
              email: cust.email || null,
              address: cust.address || null,
              balanceReceivable: cust.balanceReceivable
            }
          });
        }
      }

      if (customerTransactionsIn) {
        await tx.delete(customerTransactions);
        for (const txItem of customerTransactionsIn) {
          await tx.insert(customerTransactions).values({
            id: txItem.id,
            customerId: txItem.customerId,
            customerName: txItem.customerName,
            date: txItem.date,
            type: txItem.type,
            referenceNo: txItem.referenceNo,
            description: txItem.description,
            itemsSummary: txItem.itemsSummary || null,
            debit: txItem.debit,
            credit: txItem.credit,
            balance: txItem.balance,
            paymentMethod: txItem.paymentMethod || null,
            notes: txItem.notes || null
          }).onConflictDoUpdate({
            target: customerTransactions.id,
            set: {
              customerId: txItem.customerId,
              customerName: txItem.customerName,
              date: txItem.date,
              type: txItem.type,
              referenceNo: txItem.referenceNo,
              description: txItem.description,
              itemsSummary: txItem.itemsSummary || null,
              debit: txItem.debit,
              credit: txItem.credit,
              balance: txItem.balance,
              paymentMethod: txItem.paymentMethod || null,
              notes: txItem.notes || null
            }
          });
        }
      }

      if (supplierTransactionsIn) {
        await tx.delete(supplierTransactions);
        for (const txItem of supplierTransactionsIn) {
          await tx.insert(supplierTransactions).values({
            id: txItem.id,
            supplierId: txItem.supplierId,
            supplierName: txItem.supplierName,
            date: txItem.date,
            type: txItem.type,
            referenceNo: txItem.referenceNo,
            description: txItem.description,
            itemsSummary: txItem.itemsSummary || null,
            debit: txItem.debit,
            credit: txItem.credit,
            balance: txItem.balance,
            paymentMethod: txItem.paymentMethod || null,
            notes: txItem.notes || null
          }).onConflictDoUpdate({
            target: supplierTransactions.id,
            set: {
              supplierId: txItem.supplierId,
              supplierName: txItem.supplierName,
              date: txItem.date,
              type: txItem.type,
              referenceNo: txItem.referenceNo,
              description: txItem.description,
              itemsSummary: txItem.itemsSummary || null,
              debit: txItem.debit,
              credit: txItem.credit,
              balance: txItem.balance,
              paymentMethod: txItem.paymentMethod || null,
              notes: txItem.notes || null
            }
          });
        }
      }

      if (storeSettingsIn) {
        await tx.insert(storeSettings).values({
          key: 'settings',
          value: JSON.stringify(storeSettingsIn)
        }).onConflictDoUpdate({
          target: storeSettings.key,
          set: {
            value: JSON.stringify(storeSettingsIn)
          }
        });
      }

      if (userAccountsIn) {
        await tx.delete(userAccounts);
        for (const acc of userAccountsIn) {
          await tx.insert(userAccounts).values({
            id: acc.id,
            name: acc.name,
            email: acc.email,
            password: acc.password || '',
            role: acc.role,
            permissions: JSON.stringify(acc.permissions || {})
          }).onConflictDoUpdate({
            target: userAccounts.id,
            set: {
              name: acc.name,
              email: acc.email,
              password: acc.password || '',
              role: acc.role,
              permissions: JSON.stringify(acc.permissions || {})
            }
          });
        }
      }
    });

    // Replicate database tables to Supabase project in the background (asynchronously)
    syncAllToSupabase(req.body);

    res.json({ success: true, message: 'All POS database tables successfully live-synchronized with PostgreSQL!' });
  } catch (error: any) {
    console.error('Error saving all POS data in PostgreSQL transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dynamic Incremental Mutations
app.post('/api/products', async (req, res) => {
  const p = req.body;
  try {
    await db.insert(products).values({
      id: p.id,
      barcode: p.barcode,
      name: p.name,
      company: p.company,
      category: p.category,
      supplierId: p.supplierId || null,
      supplierName: p.supplierName || null,
      purchasePrice: p.purchasePrice || 0,
      retailPrice: p.retailPrice || 0,
      wholesalePrice: p.wholesalePrice || 0,
      stock: p.stock || 0,
      minStockAlert: p.minStockAlert || 0,
      batchNo: p.batchNo || null,
      expiryDate: p.expiryDate || null,
      unitOfSale: p.unitOfSale || 'Item',
      weightValue: p.weightValue || null
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        barcode: p.barcode,
        name: p.name,
        company: p.company,
        category: p.category,
        supplierId: p.supplierId || null,
        supplierName: p.supplierName || null,
        purchasePrice: p.purchasePrice || 0,
        retailPrice: p.retailPrice || 0,
        wholesalePrice: p.wholesalePrice || 0,
        stock: p.stock || 0,
        minStockAlert: p.minStockAlert || 0,
        batchNo: p.batchNo || null,
        expiryDate: p.expiryDate || null,
        unitOfSale: p.unitOfSale || 'Item',
        weightValue: p.weightValue || null
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error posting product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.delete(products).where(eq(products.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const s = req.body;
  try {
    await db.insert(sales).values({
      id: s.id,
      invoiceNo: s.invoiceNo,
      date: s.date,
      customerName: s.customerName,
      saleType: s.saleType,
      items: JSON.stringify(s.items || []),
      totalAmount: s.totalAmount,
      discountAmount: s.discountAmount,
      netAmount: s.netAmount,
      paidAmount: s.paidAmount,
      changeAmount: s.changeAmount,
      cashier: s.cashier
    }).onConflictDoUpdate({
      target: sales.id,
      set: {
        invoiceNo: s.invoiceNo,
        date: s.date,
        customerName: s.customerName,
        saleType: s.saleType,
        items: JSON.stringify(s.items || []),
        totalAmount: s.totalAmount,
        discountAmount: s.discountAmount,
        netAmount: s.netAmount,
        paidAmount: s.paidAmount,
        changeAmount: s.changeAmount,
        cashier: s.cashier
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  try {
    await db.delete(sales).where(eq(sales.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/returns', async (req, res) => {
  const r = req.body;
  try {
    await db.insert(returns).values({
      id: r.id,
      date: r.date,
      barcode: r.barcode,
      itemName: r.itemName,
      qty: r.qty,
      refundAmount: r.refundAmount,
      reason: r.reason || null
    }).onConflictDoUpdate({
      target: returns.id,
      set: {
        date: r.date,
        barcode: r.barcode,
        itemName: r.itemName,
        qty: r.qty,
        refundAmount: r.refundAmount,
        reason: r.reason || null
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/returns/:id', async (req, res) => {
  try {
    await db.delete(returns).where(eq(returns.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  const pur = req.body;
  try {
    await db.insert(purchases).values({
      id: pur.id,
      date: pur.date,
      supplierId: pur.supplierId || null,
      supplierName: pur.supplierName,
      barcode: pur.barcode,
      itemName: pur.itemName,
      qtyReceived: pur.qtyReceived,
      unitCostPrice: pur.unitCostPrice,
      salePriceRetail: pur.salePriceRetail,
      wholesalePrice: pur.wholesalePrice,
      totalCost: pur.totalCost
    }).onConflictDoUpdate({
      target: purchases.id,
      set: {
        date: pur.date,
        supplierId: pur.supplierId || null,
        supplierName: pur.supplierName,
        barcode: pur.barcode,
        itemName: pur.itemName,
        qtyReceived: pur.qtyReceived,
        unitCostPrice: pur.unitCostPrice,
        salePriceRetail: pur.salePriceRetail,
        wholesalePrice: pur.wholesalePrice,
        totalCost: pur.totalCost
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/purchases/:id', async (req, res) => {
  try {
    await db.delete(purchases).where(eq(purchases.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/credits', async (req, res) => {
  const c = req.body;
  try {
    await db.insert(credits).values({
      id: c.id,
      date: c.date,
      customerName: c.customerName,
      amountReceived: c.amountReceived,
      notes: c.notes || null
    }).onConflictDoUpdate({
      target: credits.id,
      set: {
        date: c.date,
        customerName: c.customerName,
        amountReceived: c.amountReceived,
        notes: c.notes || null
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/credits/:id', async (req, res) => {
  try {
    await db.delete(credits).where(eq(credits.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  const e = req.body;
  try {
    await db.insert(expenses).values({
      id: e.id,
      date: e.date,
      category: e.category,
      amount: e.amount,
      description: e.description || '',
      recordedBy: e.recordedBy || ''
    }).onConflictDoUpdate({
      target: expenses.id,
      set: {
        date: e.date,
        category: e.category,
        amount: e.amount,
        description: e.description || '',
        recordedBy: e.recordedBy || ''
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await db.delete(expenses).where(eq(expenses.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  const sup = req.body;
  try {
    await db.insert(suppliers).values({
      id: sup.id,
      name: sup.name,
      company: sup.company,
      phone: sup.phone || null,
      email: sup.email || null,
      address: sup.address || null,
      balanceOwed: sup.balanceOwed
    }).onConflictDoUpdate({
      target: suppliers.id,
      set: {
        name: sup.name,
        company: sup.company,
        phone: sup.phone || null,
        email: sup.email || null,
        address: sup.address || null,
        balanceOwed: sup.balanceOwed
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const cust = req.body;
  try {
    await db.insert(customers).values({
      id: cust.id,
      name: cust.name,
      phone: cust.phone || null,
      email: cust.email || null,
      address: cust.address || null,
      balanceReceivable: cust.balanceReceivable
    }).onConflictDoUpdate({
      target: customers.id,
      set: {
        name: cust.name,
        phone: cust.phone || null,
        email: cust.email || null,
        address: cust.address || null,
        balanceReceivable: cust.balanceReceivable
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await db.delete(customers).where(eq(customers.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer-transactions', async (req, res) => {
  const txItem = req.body;
  try {
    await db.insert(customerTransactions).values({
      id: txItem.id,
      customerId: txItem.customerId,
      customerName: txItem.customerName,
      date: txItem.date,
      type: txItem.type,
      referenceNo: txItem.referenceNo,
      description: txItem.description,
      itemsSummary: txItem.itemsSummary || null,
      debit: txItem.debit,
      credit: txItem.credit,
      balance: txItem.balance,
      paymentMethod: txItem.paymentMethod || null,
      notes: txItem.notes || null
    }).onConflictDoUpdate({
      target: customerTransactions.id,
      set: {
        customerId: txItem.customerId,
        customerName: txItem.customerName,
        date: txItem.date,
        type: txItem.type,
        referenceNo: txItem.referenceNo,
        description: txItem.description,
        itemsSummary: txItem.itemsSummary || null,
        debit: txItem.debit,
        credit: txItem.credit,
        balance: txItem.balance,
        paymentMethod: txItem.paymentMethod || null,
        notes: txItem.notes || null
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customer-transactions/:id', async (req, res) => {
  try {
    await db.delete(customerTransactions).where(eq(customerTransactions.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/supplier-transactions', async (req, res) => {
  const txItem = req.body;
  try {
    await db.insert(supplierTransactions).values({
      id: txItem.id,
      supplierId: txItem.supplierId,
      supplierName: txItem.supplierName,
      date: txItem.date,
      type: txItem.type,
      referenceNo: txItem.referenceNo,
      description: txItem.description,
      itemsSummary: txItem.itemsSummary || null,
      debit: txItem.debit,
      credit: txItem.credit,
      balance: txItem.balance,
      paymentMethod: txItem.paymentMethod || null,
      notes: txItem.notes || null
    }).onConflictDoUpdate({
      target: supplierTransactions.id,
      set: {
        supplierId: txItem.supplierId,
        supplierName: txItem.supplierName,
        date: txItem.date,
        type: txItem.type,
        referenceNo: txItem.referenceNo,
        description: txItem.description,
        itemsSummary: txItem.itemsSummary || null,
        debit: txItem.debit,
        credit: txItem.credit,
        balance: txItem.balance,
        paymentMethod: txItem.paymentMethod || null,
        notes: txItem.notes || null
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/supplier-transactions/:id', async (req, res) => {
  try {
    await db.delete(supplierTransactions).where(eq(supplierTransactions.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user-accounts', async (req, res) => {
  const acc = req.body;
  try {
    await db.insert(userAccounts).values({
      id: acc.id,
      name: acc.name,
      email: acc.email,
      password: acc.password || '',
      role: acc.role,
      permissions: JSON.stringify(acc.permissions || {})
    }).onConflictDoUpdate({
      target: userAccounts.id,
      set: {
        name: acc.name,
        email: acc.email,
        password: acc.password || '',
        role: acc.role,
        permissions: JSON.stringify(acc.permissions || {})
      }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/user-accounts/:id', async (req, res) => {
  try {
    await db.delete(userAccounts).where(eq(userAccounts.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`PostgreSQL-powered LimoPOS server running on port ${PORT}`);
});
