@echo off
echo Finding and fixing API 500 errors...
echo.

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env file and set your DATABASE_URL
    echo Example: DATABASE_URL=postgresql://username:password@localhost:5432/database_name
    echo.
)

REM Install dependencies if missing
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Check database connection
echo Testing database connection...
python init_database.py
if errorlevel 1 (
    echo.
    echo DATABASE ERROR: Cannot connect to PostgreSQL
    echo.
    echo Fix steps:
    echo 1. Install PostgreSQL if not installed
    echo 2. Create a database for the project
    echo 3. Update DATABASE_URL in .env file
    echo 4. Run: python init_database.py
    echo.
    pause
    exit /b 1
)

REM Create uploads directory if missing
if not exist "uploads" (
    mkdir uploads
    echo Created uploads directory
)

REM Fix the most common API issues
echo Applying API fixes...

REM Ensure study materials route has proper error handling
powershell -Command "& {
    $routes = Get-Content 'server\routes.ts' -Raw
    if ($routes -notmatch 'try.*catch.*study-materials') {
        Write-Host 'Adding error handling to routes...'
        $routes = $routes -replace '(app\.get\(''/api/study-materials''.+?)(res\.json\(materials\);)', '$1try { $2 } catch (error) { console.error(''Study materials error:'', error); res.status(500).json({ message: ''Failed to fetch study materials'' }); }'
        $routes | Set-Content 'server\routes.ts'
    }
}"

echo.
echo Starting server to test...
start /b npm run dev

echo Waiting for server startup...
timeout /t 3 /nobreak >nul

echo Testing API...
curl -s http://localhost:5000/api/study-materials
if errorlevel 1 (
    echo.
    echo API test failed. Check server logs above.
) else (
    echo.
    echo API test successful!
)

echo.
echo If you still get 500 errors:
echo 1. Check server console for error details
echo 2. Verify DATABASE_URL in .env is correct
echo 3. Ensure PostgreSQL service is running
echo.
pause