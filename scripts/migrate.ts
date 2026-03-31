import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../src/db';
import path from 'path';

console.log('Spouštění databázových migrací...');

// Tento příkaz spustí migrace a přeskočí ty, které již byly aplikovány.
migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });

console.log('Migrace byly úspěšně aplikovány.');
