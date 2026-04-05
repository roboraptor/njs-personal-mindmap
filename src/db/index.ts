import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// Cesta k souboru s databází
const dbPath = path.resolve(process.cwd(), 'mindmap.db');

const sqlite = new Database(dbPath);
// sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema, logger: process.env.NODE_ENV === 'development' });

// Spustíme migrace automaticky při startu v dev modu
if (process.env.NODE_ENV === 'development') {
  console.log('Spouštění migrací ve vývojovém režimu...');
  migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
  console.log('Migrace dokončeny.');
}

// Zajistíme, aby se připojení k databázi korektně uzavřelo při ukončení aplikace
process.on('exit', () => sqlite.close());