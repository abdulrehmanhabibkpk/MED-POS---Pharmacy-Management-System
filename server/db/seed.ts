import { db } from '../../src/db/index.ts';
import { 
  userAccounts, storeSettings, suppliers, customers, products, tenants 
} from '../../src/db/schema.ts';

export async function seedDatabaseIfEmpty() {
  try {
    const existingAccounts = await db.select().from(userAccounts).limit(1);
    if (existingAccounts.length > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding initial multi-tenant data into PostgreSQL database...');

    // Seed default tenants (Companies)
    const initialTenants = [
      {
        id: 'tenant-default',
        name: 'Ali Pharmacy & General Store',
        status: 'Active',
        monthlyFee: 3500,
        expiryDate: '2027-12-31',
        createdAt: '2026-08-22 10:00:00',
        ownerName: 'Ali Trader',
        ownerEmail: 'owner@gmail.com'
      },
      {
        id: 'tenant-2',
        name: 'Al-Madina Medical Center',
        status: 'Active',
        monthlyFee: 5000,
        expiryDate: '2026-09-22', // expires soon for demo
        createdAt: '2026-08-20 12:00:00',
        ownerName: 'Dr. Tariq Mahmood',
        ownerEmail: 'tariq@medical.com'
      },
      {
        id: 'tenant-3',
        name: 'Zaman Surgical Store',
        status: 'Suspended', // suspended for demo
        monthlyFee: 4000,
        expiryDate: '2026-10-15',
        createdAt: '2026-08-15 08:30:00',
        ownerName: 'Zahid Zaman',
        ownerEmail: 'zaman@surgical.com'
      }
    ];

    for (const t of initialTenants) {
      await db.insert(tenants).values(t).onConflictDoNothing();
    }

    // Seed default accounts
    const accounts = [
      // 1. GLOBAL SUPER ADMIN
      {
        id: 'acc-master',
        tenantId: 'system',
        name: 'Super Admin Malik',
        email: 'alitrader@gmail.com',
        password: 'alitrader',
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
      },
      // 2. TENANT 1 (Ali Pharmacy) - ADMIN
      {
        id: 'acc-owner-1',
        tenantId: 'tenant-default',
        name: 'Ali Trader (Owner)',
        email: 'owner@gmail.com',
        password: 'owner',
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
      },
      // 3. TENANT 1 (Ali Pharmacy) - CASHIER
      {
        id: 'acc-cashier-1',
        tenantId: 'tenant-default',
        name: 'Asif Khan (Cashier)',
        email: 'cashier@gmail.com',
        password: 'cashier',
        role: 'Cashier',
        permissions: JSON.stringify({
          canDashboard: true,
          canSale: true,
          canReturn: true,
          canBillHistory: true,
          canCreditReceive: false,
          canPurchaseStock: false,
          canProducts: false,
          canSuppliers: false,
          canCustomers: false,
          canBarcodeLabel: true,
          canDayClosing: false,
          canExpenses: false,
          canReports: false,
          canSettings: false,
          canPlanPRD: true
        })
      },
      // 4. TENANT 1 (Ali Pharmacy) - MANAGER
      {
        id: 'acc-manager-1',
        tenantId: 'tenant-default',
        name: 'Manager Malik',
        email: 'manager@gmail.com',
        password: 'manager',
        role: 'Manager',
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
          canSettings: false,
          canPlanPRD: false
        })
      },
      // 5. TENANT 2 - ADMIN
      {
        id: 'acc-owner-2',
        tenantId: 'tenant-2',
        name: 'Dr. Tariq (Owner)',
        email: 'tariq@medical.com',
        password: 'tariq',
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
      }
    ];

    for (const acc of accounts) {
      await db.insert(userAccounts).values(acc).onConflictDoNothing();
    }

    // Seed default settings for tenant-default
    const settings = {
      storeName: 'ALI PHARMACY & GENERAL',
      tagline: 'Stay Healthy, Live Happy',
      address: 'Main Market, Lahore, Pakistan',
      phone: '0300-1234567',
      logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
      currency: 'Rs.',
      footerNote: 'THANK YOU! VISIT AGAIN\nPowered by LimoPOS SaaS'
    };
    await db.insert(storeSettings).values({
      tenantId: 'tenant-default',
      value: JSON.stringify(settings)
    }).onConflictDoNothing();

    // Seed initial suppliers
    const initialSuppliers = [
      { id: 'sup-1', tenantId: 'tenant-default', name: 'Al-Madina Medicine Distributors', company: 'GlaxoSmithKline & Getz Pharma', phone: '0300-1234567', email: 'madina@dist.com', address: 'Medicine Market, Lahore', balanceOwed: 45000 },
      { id: 'sup-2', tenantId: 'tenant-default', name: 'Zaman Surgical & Pharma Store', company: 'Abbott Laboratories', phone: '0321-7654321', email: 'zaman@surgicals.com', address: 'Katchery Road, Multan', balanceOwed: 12000 }
    ];
    for (const s of initialSuppliers) {
      await db.insert(suppliers).values(s).onConflictDoNothing();
    }

    // Seed initial customers
    const initialCustomers = [
      { id: 'cust-1', tenantId: 'tenant-default', name: 'Muhammad Ali', phone: '0345-1112223', email: 'ali@gmail.com', address: 'Model Town, Lahore', balanceReceivable: 8500 },
      { id: 'cust-2', tenantId: 'tenant-default', name: 'Zahid Khan', phone: '0301-9998887', email: 'zahid@yahoo.com', address: 'Gulgasht Colony, Multan', balanceReceivable: 12000 }
    ];
    for (const c of initialCustomers) {
      await db.insert(customers).values(c).onConflictDoNothing();
    }

    // Seed initial products for tenant-default
    const initialProductsList = [
      { id: 'p-1001', tenantId: 'tenant-default', barcode: '1001', name: 'Cooking Oil 5L', company: 'Dalda', category: 'Grocery', purchasePrice: 2200, retailPrice: 2500, wholesalePrice: 2350, stock: 50, minStockAlert: 10, unitOfSale: 'Count' },
      { id: 'p-1004', tenantId: 'tenant-default', barcode: '1004', name: 'Soap Pack', company: 'Lux', category: 'Personal Care', purchasePrice: 450, retailPrice: 550, wholesalePrice: 490, stock: 119, minStockAlert: 15, unitOfSale: 'Count' },
      { id: 'p-1003', tenantId: 'tenant-default', barcode: '1003', name: 'Tea 900g', company: 'Tapal', category: 'Beverages', purchasePrice: 1400, retailPrice: 1650, wholesalePrice: 1520, stock: 23, minStockAlert: 5, unitOfSale: 'Count' },
      { id: 'p-1002', tenantId: 'tenant-default', barcode: '1002', name: 'Wheat Flour 10kg', company: 'Sunridge', category: 'Grocery', purchasePrice: 1100, retailPrice: 1300, wholesalePrice: 1200, stock: 79, minStockAlert: 12, unitOfSale: 'Count' },
      { id: 'p-6576', tenantId: 'tenant-default', barcode: '6576', name: 'Panadol Extra 500mg (Strip)', company: 'GSK', category: 'Pharmacy', purchasePrice: 180, retailPrice: 240, wholesalePrice: 210, stock: 85, minStockAlert: 20, unitOfSale: 'Strip' },
      { id: 'p-2001', tenantId: 'tenant-default', barcode: '2001', name: 'Augmentin 625mg Tab (6s)', company: 'GSK', category: 'Pharmacy', purchasePrice: 320, retailPrice: 390, wholesalePrice: 360, stock: 45, minStockAlert: 10, unitOfSale: 'Box' }
    ];
    for (const p of initialProductsList) {
      await db.insert(products).values(p).onConflictDoNothing();
    }

    console.log('Seeding into PostgreSQL database completed successfully!');
  } catch (error) {
    console.error('Error seeding PostgreSQL database:', error);
  }
}
