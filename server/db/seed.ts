import { db } from '../../src/db/index.ts';
import { 
  userAccounts, storeSettings, suppliers, customers, products 
} from '../../src/db/schema.ts';

export async function seedDatabaseIfEmpty() {
  try {
    const existingAccounts = await db.select().from(userAccounts).limit(1);
    if (existingAccounts.length > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding initial data into PostgreSQL database...');

    // Seed default accounts
    const accounts = [
      {
        id: 'acc-master',
        name: 'Ali Trader (Master)',
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
      {
        id: 'acc-cashier',
        name: 'Asif Khan',
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
      {
        id: 'acc-manager',
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
      }
    ];

    for (const acc of accounts) {
      await db.insert(userAccounts).values(acc).onConflictDoNothing();
    }

    // Seed default settings
    const settings = {
      storeName: 'MY MEDICAL STORE',
      tagline: 'Pharmacy & General Store',
      address: 'Main Market, Pakistan',
      phone: '0300-1234567',
      logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
      currency: 'Rs.',
      footerNote: 'THANK YOU! VISIT AGAIN\nStay Healthy - Stay Safe'
    };
    await db.insert(storeSettings).values({
      key: 'settings',
      value: JSON.stringify(settings)
    }).onConflictDoNothing();

    // Seed initial suppliers
    const initialSuppliers = [
      { id: 'sup-1', name: 'Al-Madina Medicine Distributors', company: 'GlaxoSmithKline & Getz Pharma', phone: '0300-1234567', email: 'madina@dist.com', address: 'Medicine Market, Lahore', balanceOwed: 45000 },
      { id: 'sup-2', name: 'Zaman Surgical & Pharma Store', company: 'Abbott Laboratories', phone: '0321-7654321', email: 'zaman@surgicals.com', address: 'Katchery Road, Multan', balanceOwed: 12000 },
      { id: 'sup-3', name: 'Global Health Wholesalers', company: 'Pfizer & Reckitt', phone: '0333-9876543', email: 'info@globalhealth.com', address: 'I.I Chundrigar Road, Karachi', balanceOwed: 0 }
    ];
    for (const s of initialSuppliers) {
      await db.insert(suppliers).values(s).onConflictDoNothing();
    }

    // Seed initial customers
    const initialCustomers = [
      { id: 'cust-1', name: 'Muhammad Ali', phone: '0345-1112223', email: 'ali@gmail.com', address: 'Model Town, Lahore', balanceReceivable: 8500 },
      { id: 'cust-2', name: 'Dr. Tariq Mahmood', phone: '0312-3334445', email: 'tariq@health.com', address: 'Defense Phase 5, Karachi', balanceReceivable: 1500 },
      { id: 'cust-3', name: 'Ayesha Bibi (Regular)', phone: '0322-5556667', email: '', address: 'Samanabad, Lahore', balanceReceivable: 0 },
      { id: 'cust-4', name: 'Zahid Khan', phone: '0301-9998887', email: 'zahid@yahoo.com', address: 'Gulgasht Colony, Multan', balanceReceivable: 12000 }
    ];
    for (const c of initialCustomers) {
      await db.insert(customers).values(c).onConflictDoNothing();
    }

    // Seed initial products
    const initialProducts = [
      { id: 'p-1001', barcode: '1001', name: 'Cooking Oil 5L', company: 'Dalda', category: 'Grocery', purchasePrice: 2200, retailPrice: 2500, wholesalePrice: 2350, stock: 50, minStockAlert: 10, unitOfSale: 'Count' },
      { id: 'p-1004', barcode: '1004', name: 'Soap Pack', company: 'Lux', category: 'Personal Care', purchasePrice: 450, retailPrice: 550, wholesalePrice: 490, stock: 119, minStockAlert: 15, unitOfSale: 'Count' },
      { id: 'p-1003', barcode: '1003', name: 'Tea 900g', company: 'Tapal', category: 'Beverages', purchasePrice: 1400, retailPrice: 1650, wholesalePrice: 1520, stock: 23, minStockAlert: 5, unitOfSale: 'Count' },
      { id: 'p-1002', barcode: '1002', name: 'Wheat Flour 10kg', company: 'Sunridge', category: 'Grocery', purchasePrice: 1100, retailPrice: 1300, wholesalePrice: 1200, stock: 79, minStockAlert: 12, unitOfSale: 'Count' },
      { id: 'p-6576', barcode: '6576', name: 'Panadol Extra 500mg (Strip)', company: 'GSK', category: 'Pharmacy', purchasePrice: 180, retailPrice: 240, wholesalePrice: 210, stock: 85, minStockAlert: 20, unitOfSale: 'Strip' },
      { id: 'p-2001', barcode: '2001', name: 'Augmentin 625mg Tab (6s)', company: 'GSK', category: 'Pharmacy', purchasePrice: 320, retailPrice: 390, wholesalePrice: 360, stock: 45, minStockAlert: 10, unitOfSale: 'Box' },
      { id: 'p-2002', barcode: '2002', name: 'Brufen 400mg (Strip)', company: 'Abbott', category: 'Pharmacy', purchasePrice: 95, retailPrice: 130, wholesalePrice: 115, stock: 142, minStockAlert: 25, unitOfSale: 'Strip' }
    ];
    for (const p of initialProducts) {
      await db.insert(products).values(p).onConflictDoNothing();
    }

    console.log('Seeding into PostgreSQL database completed successfully!');
  } catch (error) {
    console.error('Error seeding PostgreSQL database:', error);
  }
}
