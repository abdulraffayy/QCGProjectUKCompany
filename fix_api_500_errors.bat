@echo off
echo ========================================
echo Fixing API 500 Errors on Windows
echo ========================================
echo.

REM Step 1: Check and create .env file
echo Step 1: Checking environment configuration...
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo CRITICAL: You must edit .env file and set DATABASE_URL
    echo Example: DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/your_database
    echo.
    echo After editing .env, re-run this script.
    pause
    exit /b 1
) else (
    echo ✓ .env file exists
)

REM Step 2: Verify DATABASE_URL is set
findstr "DATABASE_URL=" .env >nul
if errorlevel 1 (
    echo ERROR: DATABASE_URL not found in .env
    echo Please add: DATABASE_URL=postgresql://postgres:password@localhost:5432/database
    pause
    exit /b 1
) else (
    echo ✓ DATABASE_URL configured
)

REM Step 3: Test database connection
echo.
echo Step 2: Testing database connection...
python init_database.py
if errorlevel 1 (
    echo.
    echo DATABASE CONNECTION FAILED!
    echo.
    echo Common fixes:
    echo 1. Start PostgreSQL service
    echo 2. Create database: psql -U postgres -c "CREATE DATABASE your_database;"
    echo 3. Update .env with correct credentials
    echo 4. Test with: psql -U postgres -d your_database
    echo.
    pause
    exit /b 1
) else (
    echo ✓ Database connection successful
)

REM Step 4: Install dependencies
echo.
echo Step 3: Checking dependencies...
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies installed
)

REM Step 5: Create required directories
echo.
echo Step 4: Creating required directories...
if not exist "uploads" (
    mkdir uploads
    echo ✓ Created uploads directory
) else (
    echo ✓ uploads directory exists
)

REM Step 6: Add better error logging to catch specific issues
echo.
echo Step 5: Adding enhanced error logging...
powershell -Command "& {
    $content = Get-Content 'server\storage.ts' -Raw
    if ($content -notmatch 'console\.log.*Database connection') {
        $content = $content -replace '(export const db = drizzle.*)', '$1`r`nconsole.log(\"Database connection initialized\");'
        $content | Set-Content 'server\storage.ts'
        Write-Host '✓ Added database logging'
    } else {
        Write-Host '✓ Database logging already exists'
    }
}"

REM Step 7: Test the API directly
echo.
echo Step 6: Testing API...
echo Starting server...
start /b cmd /c "npm run dev > api_test.log 2>&1"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Testing study materials endpoint...
curl -v http://localhost:5000/api/study-materials > test_response.json 2>test_error.log

echo.
echo === API Test Results ===
if exist "test_response.json" (
    echo Response:
    type test_response.json
) else (
    echo No response file created
)

echo.
if exist "test_error.log" (
    echo Connection Details:
    type test_error.log
)

echo.
if exist "api_test.log" (
    echo Server Logs:
    type api_test.log
)

echo.
echo ========================================
echo If you still see 500 errors:
echo ========================================
echo 1. Check the server logs above for specific error details
echo 2. Verify PostgreSQL is running: services.msc
echo 3. Test database manually: psql -U postgres
echo 4. Check .env file has correct DATABASE_URL
echo.
echo For immediate help, share the server logs shown above.
echo.
pause