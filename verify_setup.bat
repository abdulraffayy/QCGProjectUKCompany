@echo off
echo ========================================
echo Educational Content Platform Verification
echo ========================================
echo.

echo Testing Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    goto :error
)

echo Testing Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found
    goto :error
)

echo Testing PostgreSQL installation...
psql --version
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL not found
    goto :error
)

echo.
echo Checking project structure...
if not exist "python_backend" (
    echo ERROR: python_backend directory not found
    goto :error
)

if not exist "python_backend\venv" (
    echo ERROR: Python virtual environment not found
    echo Run setup_windows.bat first
    goto :error
)

if not exist ".env" (
    echo WARNING: .env file not found
    echo Copy .env.example to .env and configure it
)

if not exist "uploads" (
    echo Creating uploads directory...
    mkdir uploads
)

echo.
echo Testing database connection...
python init_database.py
if %errorlevel% neq 0 (
    echo ERROR: Database connection failed
    echo Check your .env DATABASE_URL setting
    goto :error
)

echo.
echo Testing API endpoints...
timeout /t 2 /nobreak >nul
curl -s -X GET http://localhost:5000/api/study-materials >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: API not responding - start the server first with "npm run dev"
) else (
    echo ✓ API endpoints responding correctly
)

echo.
echo ========================================
echo ✓ All checks passed!
echo ========================================
echo.
echo Your setup is ready. You can start the application with:
echo npm run dev
echo.
echo The application will be available at:
echo http://localhost:5000
echo.
goto :end

:error
echo.
echo ========================================
echo ✗ Setup verification failed
echo ========================================
echo.
echo Please check the errors above and:
echo 1. Install missing dependencies
echo 2. Run setup_windows.bat
echo 3. Configure your .env file
echo.

:end
pause