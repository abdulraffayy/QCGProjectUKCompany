@echo off
echo ========================================
echo Starting Educational Content Platform
echo ========================================
echo.

echo Checking if virtual environment exists...
if not exist "python_backend\venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run setup_windows.bat first
    pause
    exit /b 1
)

echo Starting the application...
echo Frontend will be available at: http://localhost:5000
echo API will be available at: http://localhost:5000/api
echo.
echo Press Ctrl+C to stop the application
echo.

npm run dev