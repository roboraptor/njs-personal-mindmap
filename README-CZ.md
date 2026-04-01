# Osobní myšlenková mapa

Toto je moderní Next.js aplikace určená k vytváření a správě osobních myšlenkových map. Umožňuje uživatelům vizuálně organizovat své myšlenky, nápady a informace ve volně poskládaném organickém grafu (Vesmír) i strukturovaném hierarchickém stromě (Strom).

## Hlavní funkce

- **Dva pohledy na stejná data:** Přepínejte mezi vizualizací "Vesmír" (fyzikálně simulovaný shluk přes Force Graph) a "Strom" (hierarchicky formátovaný diagram přes React Flow).
- **Vytváření a správa map:** Snadno vytvářejte nové myšlenkové mapy pro různá témata nebo projekty.
- **Pokročilá správa uzlů:** Uzly (nodes) podporují zanořování do potomků (`parent_id`), libovolné spojování (`cross_links`) a mohou sloužit i jako rozbalovací kontejnery (`collapsible`).
- **Inteligentní přesouvání větví:** Při zobrazení "Stromu" si můžete zapnout funkci "Přesouvat vč. potomků" a libovolně si uspořádat celou logickou větev pouhým tažením.
- **Fyzikální přizpůsobení:** Nody podporují atributy jako váha (`mass`), délka vazby (`distance`) nebo barva pro jemné doladění organického layoutu ve Vesmíru.

## Použité technologie

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Jazyk:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Databáze:** [SQLite](https://sqlite.org/) (lokální databáze pomocí `better-sqlite3`, soubor `mindmap.db`)
- **Vizualizace:** 
  - `@xyflow/react` (Strom / React Flow)
  - `react-force-graph-2d` (Vesmír / Force Graph)
  - `d3-force` & `dagre` (Simulace a automatické retopologie uzlů)
- **UI:** React Server Components & Client Components, Bootstrap 5

## Jak začít

Postupujte podle těchto pokynů, abyste projekt zprovoznili na svém lokálním počítači.

### Předpoklady

- [Node.js](https://nodejs.org/en/) (doporučena verze 18.x nebo novější)
- `npm`, `yarn` nebo `pnpm`

### Instalace a nastavení

1.  **Naklonujte repozitář:**
    ```bash
    git clone <url-vašeho-repozitáře>
    cd njs-personal-mindmap
    ```

2.  **Nainstalujte závislosti:**
    ```bash
    npm install
    ```

3.  **Spusťte databázové migrace:**
    Projekt používá lokální SQLite databázi. Tento příkaz vám automaticky vytvoří soubor `mindmap.db` a nasadí tabulky.
    ```bash
    npx drizzle-kit push
    ```

4.  **Naplňte databázi testovacími daty (volitelné, ale doporučené):**
    Tento skript vám vygeneruje krásnou "Velkou rozsáhlou mapu" vč. struktury Backend/Frontend větví na vyzkoušení všech funkcí.
    ```bash
    npx tsx scripts/seed-map.ts
    ```

5.  **Spusťte vývojový server:**
    ```bash
    npm run dev
    ```

Otevřete [http://localhost:3000](http://localhost:3000) ve svém prohlížeči. Horní lišta vám umožní vybrat nahranou mapu.

## Struktura projektu

-   `drizzle/`: Obsahuje soubory s migracemi databáze generované nástrojem Drizzle.
-   `src/app/`: Stránky a layouty pro Next.js App Router.
-   `src/components/`: Opakovaně použitelné React komponenty.
-   `src/actions/`: Server Actions pro odesílání formulářů a mutace dat.
-   `src/data/`: Repozitáře pro interakci s databází.
-   `src/db/`: Nastavení Drizzle ORM, definice schémat a připojení k databázi.
-   `scripts/`: Skripty pro úlohy, jako je migrace databáze.
