@echo off
echo. 
echo #### #### #### ####
echo. 
echo Starting Personal Mind Map...
echo Please wait...
echo. 
echo #### #### #### ####
echo. 
timeout /t 2 > nul

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
    echo.
    call npm -d install
    echo. 
    timeout /t 2 > nul
)

echo. 
echo #### #### #### ####
echo. 
echo Server is starting up. If the browser didn't open automatically, go to http://localhost:3000
echo You can minimize this window, but DO NOT CLOSE IT!
echo. 
echo #### #### #### ####
echo. 
timeout /t 2 > nul
:: Start server and open browser
start http://localhost:3000

call npm run dev
