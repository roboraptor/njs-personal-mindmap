@echo off
echo Starting Personal Mind Map...
echo Please wait...

:: Check if NodeJS is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo NodeJS not found! Please install it from nodejs.org.
    pause
    exit
)

:: Install packages if node_modules folder is missing
if not exist "node_modules\" (
    echo Installing necessary dependencies, this may take a while...
    call npm install
)

:: Generate database if it's missing
if not exist "mindmap.db" (
    echo Initializing database...
    call npx drizzle-kit push
    
    echo Seeding database with initial data...
    call npx tsx scripts/seed-map.ts
)

:: Start server and open browser
start http://localhost:3000
echo Server is running. If the browser didn't open automatically, go to http://localhost:3000
echo You can minimize this window, but DO NOT CLOSE IT!
call npm run dev
