# Osobní myšlenková mapa

Toto je Next.js aplikace určená k vytváření a správě osobních myšlenkových map. Umožňuje uživatelům vizuálně organizovat své myšlenky, nápady a informace v hierarchické struktuře grafu.

## Funkce

- **Vytváření a správa map:** Snadno vytvářejte nové myšlenkové mapy pro různá témata nebo projekty.
- **Správa uzlů:** Přidávejte, upravujte a mažte uzly v rámci myšlenkové mapy.
- **Vizualizace grafu:** Zobrazte si svou myšlenkovou mapu jako interaktivní graf.

## Použité technologie

- **Framework:** [Next.js](https://nextjs.org/)
- **Jazyk:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Databáze:** PostgreSQL (předpoklad, lze použít i jinou SQL databázi podporovanou Drizzle)
- **UI:** React Server Components & Client Components

## Jak začít

Postupujte podle těchto pokynů, abyste projekt zprovoznili na svém lokálním počítači.

### Předpoklady

- [Node.js](https://nodejs.org/en/) (doporučena verze 18.x nebo novější)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/) nebo [pnpm](https://pnpm.io/)
- Spuštěná instance databáze PostgreSQL.

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

3.  **Nakonfigurujte své prostředí:**
    Vytvořte soubor `.env.local` v kořenovém adresáři projektu a přidejte svůj připojovací řetězec k databázi:
    ```
    DATABASE_URL="postgresql://uzivatel:heslo@host:port/nazev_databaze"
    ```

4.  **Spusťte databázové migrace:**
    Tento příkaz aplikuje schéma databáze.
    ```bash
    npm run db:migrate
    ```

5.  **Spusťte vývojový server:**
    ```bash
    npm run dev
    ```

Otevřete [http://localhost:3000](http://localhost:3000) ve svém prohlížeči a uvidíte výsledek.

## Struktura projektu

-   `drizzle/`: Obsahuje soubory s migracemi databáze generované nástrojem Drizzle.
-   `src/app/`: Stránky a layouty pro Next.js App Router.
-   `src/components/`: Opakovaně použitelné React komponenty.
-   `src/actions/`: Server Actions pro odesílání formulářů a mutace dat.
-   `src/data/`: Repozitáře pro interakci s databází.
-   `src/db/`: Nastavení Drizzle ORM, definice schémat a připojení k databázi.
-   `scripts/`: Skripty pro úlohy, jako je migrace databáze.
