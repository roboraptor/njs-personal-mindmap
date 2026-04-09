#!/bin/bash

cd "$(dirname "$0")"
echo ""
echo "#### #### #### ####"
echo ""
echo "Starting Personal Mind Map..."
echo "Please wait..."
echo ""
echo "#### #### #### ####"
echo ""
read -t 5 -n 1 -s

# Kontrola, zda je nainstalován NodeJS
if ! command -v npm &> /dev/null; then
    echo "NodeJS nebyl nalezen! Nainstalujte ho prosím z nodejs.org nebo pomocí 'brew install node'."
    echo ""
    exit 1
fi

# Instalace balíčků, pokud chybí složka node_modules
if [ ! -d "node_modules" ]; then
    echo "Instaluji potřebné závislosti, to může chvíli trvat..."
    echo ""
    read -t 2 -n 1 -s
    npm -d install
fi

echo ""
echo "#### #### #### ####"
echo ""
echo "Server nabíhá. Otevře se okno prohlížeče na http://localhost:3000"
echo "Tento terminál můžete minimalizovat, ale NEZAVÍREJTE HO!"
echo ""
echo "#### #### #### ####"
echo ""

read -t 2 -n 1 -s

# Otevření prohlížeče a spuštění serveru
# Na Macu příkaz 'open' otevře URL ve výchozím prohlížeči
open "http://localhost:3000"


npm run dev