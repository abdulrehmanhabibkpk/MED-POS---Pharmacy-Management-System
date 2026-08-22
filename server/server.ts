import express from 'express';
import cors from 'cors';
import { db } from '../src/db/index.ts';
import { 
  userAccounts, products, sales, returns, credits, purchases, expenses, 
  suppliers, customers, customerTransactions, supplierTransactions, storeSettings, tenants 
} from '../src/db/schema.ts';
import { seedDatabaseIfEmpty } from './db/seed.ts';
import { eq, and } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to seed if database is empty on any call
const ensureSeed = async () => {
  await seedDatabaseIfEmpty();
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Single Tenant Session Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    await ensureSeed();

    const emailLower = email.trim().toLowerCase();
    const userRows = await db.select().from(userAccounts).where(eq(userAccounts.email, emailLower)).limit(1);

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Invalid email address or account not found.' });
    }

    const user = userRows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect login password.' });
    }

    // Parse user permissions
    const parsedPermissions = typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions || '{}') 
      : user.permissions;

    // Check Tenant Status if not Global Super Admin
    if (user.tenantId !== 'system' && user.email !== 'alitrader@gmail.com') {
      const tenantRows = await db.select().from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);
      if (tenantRows.length === 0) {
        return res.status(403).json({ error: 'Associated company store has been removed.' });
      }

      const tenant = tenantRows[0];
      if (tenant.status === 'Suspended') {
        return res.status(403).json({ error: 'Your store account has been suspended by system Super Admin.' });
      }

      // Check Expiry
      const today = new Date().toISOString().split('T')[0];
      if (tenant.expiryDate && tenant.expiryDate < today) {
        return res.status(403).json({ error: `Your monthly subscription has expired on ${tenant.expiryDate}. Please renew immediately.` });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          permissions: parsedPermissions
        },
        tenant
      });
    }

    // Super Admin login
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: 'system',
        permissions: parsedPermissions
      },
      tenant: {
        id: 'system',
        name: 'LimoPOS SaaS Master Systems',
        status: 'Active',
        monthlyFee: 0,
        expiryDate: '2099-12-31'
      }
    });

  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Load multi-tenant POS data
app.get('/api/pos-data', async (req, res) => {
  const { tenantId } = req.query;

  if (!tenantId || typeof tenantId !== 'string') {
    return res.status(400).json({ error: 'tenantId is a required query parameter.' });
  }

  try {
    await ensureSeed();

    const accountsList = await db.select().from(userAccounts).where(eq(userAccounts.tenantId, tenantId));
    const productsList = await db.select().from(products).where(eq(products.tenantId, tenantId));
    const salesList = await db.select().from(sales).where(eq(sales.tenantId, tenantId));
    const returnsList = await db.select().from(returns).where(eq(returns.tenantId, tenantId));
    const creditsList = await db.select().from(credits).where(eq(credits.tenantId, tenantId));
    const purchasesList = await db.select().from(purchases).where(eq(purchases.tenantId, tenantId));
    const expensesList = await db.select().from(expenses).where(eq(expenses.tenantId, tenantId));
    const suppliersList = await db.select().from(suppliers).where(eq(suppliers.tenantId, tenantId));
    const customersList = await db.select().from(customers).where(eq(customers.tenantId, tenantId));
    const customerTransactionsList = await db.select().from(customerTransactions).where(eq(customerTransactions.tenantId, tenantId));
    const supplierTransactionsList = await db.select().from(supplierTransactions).where(eq(supplierTransactions.tenantId, tenantId));
    const storeSettingsList = await db.select().from(storeSettings).where(eq(storeSettings.tenantId, tenantId));

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
    const settingsRow = storeSettingsList.find(r => r.tenantId === tenantId);
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
    console.error('Error fetching tenant POS data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save complete Tenant State
app.post('/api/save-all', async (req, res) => {
  const { tenantId } = req.query;
  if (!tenantId || typeof tenantId !== 'string') {
    return res.status(400).json({ error: 'tenantId is required as a query parameter.' });
  }

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
    await db.transaction(async (tx) => {
      // Products
      if (productsIn) {
        await tx.delete(products).where(eq(products.tenantId, tenantId));
        for (const p of productsIn) {
          await tx.insert(products).values({
            id: p.id,
            tenantId,
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
          });
        }
      }

      // Sales
      if (salesIn) {
        await tx.delete(sales).where(eq(sales.tenantId, tenantId));
        for (const s of salesIn) {
          await tx.insert(sales).values({
            id: s.id,
            tenantId,
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
          });
        }
      }

      // Returns
      if (returnsIn) {
        await tx.delete(returns).where(eq(returns.tenantId, tenantId));
        for (const r of returnsIn) {
          await tx.insert(returns).values({
            id: r.id,
            tenantId,
            date: r.date,
            barcode: r.barcode,
            itemName: r.itemName,
            qty: r.qty,
            refundAmount: r.refundAmount,
            reason: r.reason || null
          });
        }
      }

      // Purchases
      if (purchasesIn) {
        await tx.delete(purchases).where(eq(purchases.tenantId, tenantId));
        for (const pur of purchasesIn) {
          await tx.insert(purchases).values({
            id: pur.id,
            tenantId,
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
          });
        }
      }

      // Credits
      if (creditsIn) {
        await tx.delete(credits).where(eq(credits.tenantId, tenantId));
        for (const c of creditsIn) {
          await tx.insert(credits).values({
            id: c.id,
            tenantId,
            date: c.date,
            customerName: c.customerName,
            amountReceived: c.amountReceived,
            notes: c.notes || null
          });
        }
      }

      // Expenses
      if (expensesIn) {
        await tx.delete(expenses).where(eq(expenses.tenantId, tenantId));
        for (const e of expensesIn) {
          await tx.insert(expenses).values({
            id: e.id,
            tenantId,
            date: e.date,
            category: e.category,
            amount: e.amount,
            description: e.description || '',
            recordedBy: e.recordedBy || ''
          });
        }
      }

      // Suppliers
      if (suppliersIn) {
        await tx.delete(suppliers).where(eq(suppliers.tenantId, tenantId));
        for (const sup of suppliersIn) {
          await tx.insert(suppliers).values({
            id: sup.id,
            tenantId,
            name: sup.name,
            company: sup.company,
            phone: sup.phone || null,
            email: sup.email || null,
            address: sup.address || null,
            balanceOwed: sup.balanceOwed
          });
        }
      }

      // Customers
      if (customersIn) {
        await tx.delete(customers).where(eq(customers.tenantId, tenantId));
        for (const cust of customersIn) {
          await tx.insert(customers).values({
            id: cust.id,
            tenantId,
            name: cust.name,
            phone: cust.phone || null,
            email: cust.email || null,
            address: cust.address || null,
            balanceReceivable: cust.balanceReceivable
          });
        }
      }

      // Customer Transactions
      if (customerTransactionsIn) {
        await tx.delete(customerTransactions).where(eq(customerTransactions.tenantId, tenantId));
        for (const txItem of customerTransactionsIn) {
          await tx.insert(customerTransactions).values({
            id: txItem.id,
            tenantId,
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
          });
        }
      }

      // Supplier Transactions
      if (supplierTransactionsIn) {
        await tx.delete(supplierTransactions).where(eq(supplierTransactions.tenantId, tenantId));
        for (const txItem of supplierTransactionsIn) {
          await tx.insert(supplierTransactions).values({
            id: txItem.id,
            tenantId,
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
          });
        }
      }

      // Store Settings
      if (storeSettingsIn) {
        await tx.insert(storeSettings).values({
          tenantId,
          value: JSON.stringify(storeSettingsIn)
        }).onConflictDoUpdate({
          target: storeSettings.tenantId,
          set: {
            value: JSON.stringify(storeSettingsIn)
          }
        });
      }

      // User Accounts
      if (userAccountsIn) {
        // Clear sub-accounts for this tenant (except global alitrader Master account)
        await tx.delete(userAccounts).where(and(eq(userAccounts.tenantId, tenantId), eq(userAccounts.id, 'acc-master')));
        // Also delete non-master sub-accounts
        await tx.delete(userAccounts).where(and(eq(userAccounts.tenantId, tenantId)));

        for (const acc of userAccountsIn) {
          if (acc.id === 'acc-master') continue; // Don't wipe super admin
          await tx.insert(userAccounts).values({
            id: acc.id,
            tenantId,
            name: acc.name,
            email: acc.email,
            password: acc.password || '',
            role: acc.role,
            permissions: JSON.stringify(acc.permissions || {})
          });
        }
      }
    });

    res.json({ success: true, message: `Tenant data (${tenantId}) successfully live-synchronized with PostgreSQL!` });
  } catch (error: any) {
    console.error('Error saving tenant POS data in transaction:', error);
    res.status(500).json({ error: error.message });
  }
});


// ============================================
//   SUPER ADMIN / SAAS MANAGEMENT ENDPOINTS
// ============================================

// Get all tenants, sub-accounts, and general system stats
app.get('/api/super-admin/data', async (req, res) => {
  try {
    await ensureSeed();

    const tenantList = await db.select().from(tenants);
    const usersList = await db.select().from(userAccounts);
    
    // Compile some helpful stats per tenant
    const detailedTenants = [];
    for (const tenant of tenantList) {
      const subAccounts = usersList.filter(u => u.tenantId === tenant.id);
      
      const salesCountRows = await db.select().from(sales).where(eq(sales.tenantId, tenant.id));
      const productsCountRows = await db.select().from(products).where(eq(products.tenantId, tenant.id));

      detailedTenants.push({
        ...tenant,
        subAccountsCount: subAccounts.length,
        salesCount: salesCountRows.length,
        productsCount: productsCountRows.length,
        totalSalesValue: salesCountRows.reduce((sum, s) => sum + s.netAmount, 0)
      });
    }

    res.json({
      tenants: detailedTenants,
      totalRegisteredUsers: usersList.length,
      revenueMonthlyProjection: tenantList.reduce((sum, t) => sum + (t.status === 'Active' ? t.monthlyFee : 0), 0)
    });
  } catch (error: any) {
    console.error('Error fetching super admin stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new tenant company & set their primary admin owner
app.post('/api/super-admin/create-tenant', async (req, res) => {
  const { name, ownerName, ownerEmail, password, monthlyFee, expiryDate } = req.body;

  if (!name || !ownerName || !ownerEmail || !password || monthlyFee === undefined || !expiryDate) {
    return res.status(400).json({ error: 'All fields are required to create a company.' });
  }

  const tenantId = `tenant-${Date.now()}`;
  const ownerId = `acc-owner-${Date.now()}`;

  try {
    const existingUser = await db.select().from(userAccounts).where(eq(userAccounts.email, ownerEmail.toLowerCase())).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'An account with this owner email already exists.' });
    }

    await db.transaction(async (tx) => {
      // 1. Insert Tenant
      await tx.insert(tenants).values({
        id: tenantId,
        name,
        status: 'Active',
        monthlyFee: Number(monthlyFee),
        expiryDate,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        ownerName,
        ownerEmail: ownerEmail.toLowerCase()
      });

      // 2. Insert Owner Admin Account
      await tx.insert(userAccounts).values({
        id: ownerId,
        tenantId,
        name: ownerName,
        email: ownerEmail.toLowerCase(),
        password,
        role: 'Admin',
        permissions: JSON.stringify({
          canDashboard: true,
          canSale: true,
          canReturn: true,
          canBillHistory: true,
          canCreditReceive: true,
          canPurchaseStock: true,
          canProducts: true,
          canSuppliers: true,
          canCustomers: true,
          canBarcodeLabel: true,
          canDayClosing: true,
          canExpenses: true,
          canReports: true,
          canSettings: true,
          canPlanPRD: true
        })
      });

      // 3. Create Default Store Settings for this brand
      const initialSettings = {
        storeName: name.toUpperCase(),
        tagline: 'Premium Pharmacy & General Store',
        address: 'Pakistan',
        phone: '0300-0000000',
        logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
        currency: 'Rs.',
        footerNote: 'THANK YOU! VISIT AGAIN\nPower by LimoPOS SaaS'
      };
      await tx.insert(storeSettings).values({
        tenantId,
        value: JSON.stringify(initialSettings)
      });
    });

    res.json({ success: true, message: `Company "${name}" created successfully and Owner Admin credentials assigned!` });
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Tenant Configuration
app.post('/api/super-admin/update-tenant', async (req, res) => {
  const { id, name, status, monthlyFee, expiryDate, ownerName, ownerEmail } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Tenant ID is required for updating.' });
  }

  try {
    await db.update(tenants)
      .set({
        name,
        status,
        monthlyFee: Number(monthlyFee),
        expiryDate,
        ownerName,
        ownerEmail: ownerEmail?.toLowerCase()
      })
      .where(eq(tenants.id, id));

    res.json({ success: true, message: 'Tenant subscription settings updated successfully.' });
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Tenant & clean all database tables Cascade style
app.delete('/api/super-admin/delete-tenant/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.transaction(async (tx) => {
      await tx.delete(tenants).where(eq(tenants.id, id));
      await tx.delete(userAccounts).where(eq(userAccounts.tenantId, id));
      await tx.delete(products).where(eq(products.tenantId, id));
      await tx.delete(sales).where(eq(sales.tenantId, id));
      await tx.delete(returns).where(eq(returns.tenantId, id));
      await tx.delete(credits).where(eq(credits.tenantId, id));
      await tx.delete(purchases).where(eq(purchases.tenantId, id));
      await tx.delete(expenses).where(eq(expenses.tenantId, id));
      await tx.delete(suppliers).where(eq(suppliers.tenantId, id));
      await tx.delete(customers).where(eq(customers.tenantId, id));
      await tx.delete(customerTransactions).where(eq(customerTransactions.tenantId, id));
      await tx.delete(supplierTransactions).where(eq(supplierTransactions.tenantId, id));
      await tx.delete(storeSettings).where(eq(storeSettings.tenantId, id));
    });

    res.json({ success: true, message: 'Tenant company and all its isolated data fully purged.' });
  } catch (error: any) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch complete backup download for a single company
app.get('/api/super-admin/backup-tenant/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tenantRows = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    if (tenantRows.length === 0) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    const tenant = tenantRows[0];
    const productsList = await db.select().from(products).where(eq(products.tenantId, id));
    const salesList = await db.select().from(sales).where(eq(sales.tenantId, id));
    const returnsList = await db.select().from(returns).where(eq(returns.tenantId, id));
    const creditsList = await db.select().from(credits).where(eq(credits.tenantId, id));
    const purchasesList = await db.select().from(purchases).where(eq(purchases.tenantId, id));
    const expensesList = await db.select().from(expenses).where(eq(expenses.tenantId, id));
    const suppliersList = await db.select().from(suppliers).where(eq(suppliers.tenantId, id));
    const customersList = await db.select().from(customers).where(eq(customers.tenantId, id));
    const customerTransactionsList = await db.select().from(customerTransactions).where(eq(customerTransactions.tenantId, id));
    const supplierTransactionsList = await db.select().from(supplierTransactions).where(eq(supplierTransactions.tenantId, id));
    const storeSettingsList = await db.select().from(storeSettings).where(eq(storeSettings.tenantId, id));

    res.json({
      metadata: {
        tenantId: tenant.id,
        tenantName: tenant.name,
        backupDate: new Date().toISOString()
      },
      products: productsList,
      sales: salesList,
      returns: returnsList,
      purchases: purchasesList,
      credits: creditsList,
      expenses: expensesList,
      suppliers: suppliersList,
      customers: customersList,
      customerTransactions: customerTransactionsList,
      supplierTransactions: supplierTransactionsList,
      storeSettings: storeSettingsList
    });

  } catch (error: any) {
    console.error('Error backing up tenant:', error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`PostgreSQL-powered LimoPOS server running on port ${PORT}`);
});
