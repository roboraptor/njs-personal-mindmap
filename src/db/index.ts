import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: BetterSQLite3Database<typeof schema>;
  migrated?: boolean;
  exitListenerAttached?: boolean;
};

// Cesta k souboru s databází
const dbPath = path.resolve(process.cwd(), 'mindmap.db');

const sqlite = globalForDb.sqlite ?? new Database(dbPath);
// sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db =
  globalForDb.db ??
  drizzle(sqlite, { schema, logger: process.env.NODE_ENV === 'development' });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sqlite = sqlite;
  globalForDb.db = db;
}

// Spustíme migrace automaticky při startu v dev modu (jednou za proces)
if (process.env.NODE_ENV === 'development' && !globalForDb.migrated) {
  console.log('Spouštění migrací ve vývojovém režimu...');
  migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
  globalForDb.migrated = true;
  console.log('Migrace dokončeny.');
}

// Zajistíme, aby se připojení k databázi korektně uzavřelo při ukončení aplikace
if (!globalForDb.exitListenerAttached) {
  globalForDb.exitListenerAttached = true;
  process.on('exit', () => sqlite.close());
}
