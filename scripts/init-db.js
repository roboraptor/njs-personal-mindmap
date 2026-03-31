import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'mindmap.db');

// Pokud databáze již existuje, skript nic neudělá
if (fs.existsSync(dbPath)) {
    console.log('Databázový soubor již existuje. Inicializace se přeskakuje.');
    process.exit(0);
}

try {
    const db = new Database(dbPath);
    const schema = fs.readFileSync(path.resolve(process.cwd(), 'src/db/schema.sql'), 'utf8');
    db.exec(schema);
    db.close();
    console.log(`Databáze byla úspěšně inicializována v souboru: ${dbPath}`);
} catch (error) {
    console.error('Chyba při inicializaci databáze:', error);
    // Pokud se něco pokazí, smažeme nekompletní soubor
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }
    process.exit(1);
}
