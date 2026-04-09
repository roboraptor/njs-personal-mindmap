# Osobní Myšlenková Mapa 🧠

*Číst v dalších jazycích: [English / Anglicky](README.md)*

Moderní Next.js aplikace určená k vytváření, správě a vizualizaci osobních myšlenkových map. Pomáhá uspořádat myšlenky, propojovat nápady a získat hlubší náhled do vaší mysli pomocí AI. 

## ✨ Hlavní funkce

- **AI Analýza Osobnosti:** Jedním kliknutím vygenerujete strukturovaný Markdown prompt. Ten pak stačí vložit do ChatGPT, Clauda nebo Gemini a získáte tak hluboký psychologický rozbor vašich myšlenkových vzorců a skrytých souvislostí.
- **Dva pohledy na stejná data:** Přepínejte mezi vizualizací "Vesmír" (fyzikálně simulovaný shluk přes Force Graph) a "Strom" (hierarchicky formátovaný diagram přes React Flow).
- **Tvorba a správa map:** Vytvářejte oddělené mapy pro různá témata nebo životní projekty.
- **Pokročilá správa uzlů:** Uzly podporují zanořování do potomků (`parent_id`), křížové propojování (`cross_links`) a sbalovací mechanismus (`collapsible`).
- **Inteligentní přesouvání větví:** Při zobrazení "Stromu" si můžete zapnout funkci přesouvání včetně potomků a snadno organizovat celé logické větve pouhým tažením.
- **Fyzikální přizpůsobení:** Přizpůsobte si organický layout ve "Vesmíru" nastavením váhy uzlů, vzdáleností vazeb a gravitačních sil.

## 🚀 Jak aplikaci jednoduše spustit

Na Windows nebo Macu můžete použít `Start-MindMap.bat` nebo `start.command` pro automatické spuštění.

Ke spuštění celé aplikace u vás lokálně stačí tyto 3 rychlé kroky.

### 1. Instalace závislostí
```bash
npm install
```

### 2. Spuštění aplikace
```bash
npm run dev
```

To je vše! 🎉 Otevřete si v prohlížeči [http://localhost:3000](http://localhost:3000). V horní liště si vyberte testovací mapu a můžete zkoušet přepínání pohledů i tlačítko pro AI analýzu.

## Použité technologie
- **Framework:** Next.js (App Router)
- **Databáze:** SQLite (lokální soubor `mindmap.db`) s Drizzle ORM
- **Vizualizace:** `@xyflow/react` (Strom pohled), `react-force-graph-2d` (Vesmírný pohled)
