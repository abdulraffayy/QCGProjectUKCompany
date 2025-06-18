@echo off
echo ========================================
echo API Error Diagnostic Tool
echo ========================================
echo.

echo Checking project structure...
if not exist "server\routes.ts" (
    echo ERROR: server\routes.ts not found
    echo Are you in the correct project directory?
    pause
    exit /b 1
)

echo ✓ Project structure looks correct
echo.

echo Checking environment configuration...
if not exist ".env" (
    echo WARNING: .env file not found
    echo You need to create .env file with DATABASE_URL
    echo Copy .env.example to .env and configure it
) else (
    echo ✓ .env file exists
    findstr "DATABASE_URL" .env >nul
    if errorlevel 1 (
        echo WARNING: DATABASE_URL not found in .env
    ) else (
        echo ✓ DATABASE_URL configured
    )
)

echo.
echo Checking Node.js dependencies...
if not exist "node_modules" (
    echo ERROR: node_modules not found
    echo Run: npm install
    pause
    exit /b 1
) else (
    echo ✓ node_modules exists
)

echo.
echo Checking database connection...
echo Testing with Python database script...
python init_database.py
if errorlevel 1 (
    echo ERROR: Database connection failed
    echo Check your DATABASE_URL in .env file
    echo Make sure PostgreSQL is running
) else (
    echo ✓ Database connection works
)

echo.
echo Starting server and testing API...
echo Starting server in background...
start /b cmd /c "npm run dev > server_output.log 2>&1"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Testing API endpoint...
curl -s http://localhost:5000/api/study-materials > api_test.json
if errorlevel 1 (
    echo ERROR: API request failed
    echo Server might not be running
) else (
    echo ✓ API responded
    echo Response saved to api_test.json
    type api_test.json
)

echo.
echo Checking server logs...
if exist "server_output.log" (
    echo === Recent server logs ===
    type server_output.log
) else (
    echo No server logs found
)

echo.
echo ========================================
echo Diagnostic complete
echo ========================================
echo.
echo Common fixes:
echo 1. Create .env file with proper DATABASE_URL
echo 2. Run: npm install
echo 3. Initialize database: python init_database.py
echo 4. Start server: npm run dev
echo.
pause