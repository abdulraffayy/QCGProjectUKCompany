@echo off
echo ========================================
echo Educational Content Platform Setup
echo Windows 11 Local Development Setup
echo ========================================
echo.

echo Step 1: Creating Python virtual environment...
cd python_backend
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    echo Make sure Python is installed and in PATH
    pause
    exit /b 1
)

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat

echo Step 3: Installing Python dependencies...
pip install --upgrade pip
pip install -r ..\python_requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo Step 4: Going back to project root...
cd ..

echo Step 5: Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set up PostgreSQL database (see LOCAL_SETUP_GUIDE.md)
echo 2. Create .env file with your configuration
echo 3. Run: npm run db:push
echo 4. Run: npm run dev
echo.
echo For detailed instructions, see LOCAL_SETUP_GUIDE.md
echo.
pause