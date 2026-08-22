import { createClient } from '@supabase/supabase-js';

// Configuration parameters with code-level fallback and environment overrides
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jbwuskiuutolxstytyul.supabase.co';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impid3Vza2l1dXRvbHhzdHl0eXVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM5MDMxMiwiZXhwIjoyMTAyOTY2MzEyfQ.DYlZT2tqmR346hvAyITyKOD55FUd5AKYikdRizqGsl8';

// Initialize Supabase Client with bypass-RLS service role key
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

/**
 * Utility to convert Javascript camelCase objects to SQL snake_case models
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function mapToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(mapToSnakeCase);
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const newKey = toSnakeCase(key);
      if (val !== undefined) {
        // Stringify nested objects/arrays if they are inserted into standard text columns (like permissions or items)
        if (key === 'permissions' || key === 'items' || key === 'value') {
          newObj[newKey] = typeof val === 'string' ? val : JSON.stringify(val);
        } else if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
          newObj[newKey] = JSON.stringify(val);
        } else {
          newObj[newKey] = val;
        }
      }
    }
    return newObj;
  }
  return obj;
}

/**
 * Sync individual table by deleting existing rows and inserting new payload
 */
async function syncTable(tableName: string, dataArray: any[], idField: string = 'id') {
  if (!dataArray || !Array.isArray(dataArray)) return;

  try {
    const snakeData = mapToSnakeCase(dataArray);

    // Delete all records to perform complete refresh sync
    const { error: deleteErr } = await supabase
      .from(tableName)
      .delete()
      .neq(idField, '_nonexistent_id_to_clear_all_');

    if (deleteErr) {
      console.warn(`[Supabase Sync] Warning clearing table "${tableName}":`, deleteErr.message);
    }

    if (snakeData.length > 0) {
      // Chunk insertions if they are large to avoid HTTP payload limits (limit chunk size to 200 items)
      const chunkSize = 200;
      for (let i = 0; i < snakeData.length; i += chunkSize) {
        const chunk = snakeData.slice(i, i + chunkSize);
        const { error: insertErr } = await supabase
          .from(tableName)
          .insert(chunk);

        if (insertErr) {
          console.error(`[Supabase Sync] Error inserting chunk to "${tableName}":`, insertErr.message);
          throw insertErr;
        }
      }
    }
    console.log(`[Supabase Sync] Success synchronized "${tableName}" (${snakeData.length} rows)`);
  } catch (err: any) {
    console.warn(`[Supabase Sync] Skipping table "${tableName}" sync. Make sure table exists in Supabase. Error:`, err.message);
  }
}

/**
 * Live sync entire state to Supabase in one round-trip
 */
export async function syncAllToSupabase(payload: any) {
  console.log('[Supabase Sync] Initiating full background database replication...');
  
  const tasks = [];

  if (payload.userAccounts) tasks.push(syncTable('user_accounts', payload.userAccounts));
  if (payload.products) tasks.push(syncTable('products', payload.products));
  if (payload.sales) tasks.push(syncTable('sales', payload.sales));
  if (payload.returns) tasks.push(syncTable('returns', payload.returns));
  if (payload.credits) tasks.push(syncTable('credits', payload.credits));
  if (payload.purchases) tasks.push(syncTable('purchases', payload.purchases));
  if (payload.expenses) tasks.push(syncTable('expenses', payload.expenses));
  if (payload.suppliers) tasks.push(syncTable('suppliers', payload.suppliers));
  if (payload.customers) tasks.push(syncTable('customers', payload.customers));
  if (payload.customerTransactions) tasks.push(syncTable('customer_transactions', payload.customerTransactions));
  if (payload.supplierTransactions) tasks.push(syncTable('supplier_transactions', payload.supplierTransactions));

  if (payload.storeSettings) {
    // StoreSettings is a key-value row
    const settingsRow = [{ key: 'settings', value: payload.storeSettings }];
    tasks.push(syncTable('store_settings', settingsRow, 'key'));
  }

  // Execute all synchronizations concurrently in the background without blocking core server responses
  Promise.all(tasks)
    .then(() => {
      console.log('[Supabase Sync] Complete database replication finished successfully.');
    })
    .catch((err) => {
      console.error('[Supabase Sync] Replication failed:', err.message);
    });
}

/**
 * Real-time incremental upsert helper for specific row updates
 */
export async function upsertRowToSupabase(tableName: string, record: any) {
  try {
    const snakeRecord = mapToSnakeCase(record);
    const { error } = await supabase
      .from(tableName)
      .upsert(snakeRecord);
    
    if (error) {
      console.warn(`[Supabase Sync] Incremental upsert to "${tableName}" skipped:`, error.message);
    } else {
      console.log(`[Supabase Sync] Success incremental upsert to "${tableName}" for ID: ${record.id || record.key}`);
    }
  } catch (err: any) {
    console.warn(`[Supabase Sync] Incremental upsert to "${tableName}" failed:`, err.message);
  }
}

/**
 * Real-time incremental delete helper
 */
export async function deleteRowFromSupabase(tableName: string, id: string, idField: string = 'id') {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(idField, id);
    
    if (error) {
      console.warn(`[Supabase Sync] Incremental delete from "${tableName}" skipped:`, error.message);
    } else {
      console.log(`[Supabase Sync] Success incremental delete from "${tableName}" for ID: ${id}`);
    }
  } catch (err: any) {
    console.warn(`[Supabase Sync] Incremental delete from "${tableName}" failed:`, err.message);
  }
}
