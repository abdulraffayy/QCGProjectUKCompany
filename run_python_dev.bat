@echo off
echo Starting Python FastAPI + TypeScript development environment...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.8+ and add to PATH
    pause
    exit /b 1
)

REM Setup Python environment
echo Setting up Python backend...
python python_setup.py

echo.
echo ================================================================
echo Python + TypeScript Educational Content Platform
echo ================================================================
echo.
echo To start development, run these commands in separate terminals:
echo.
echo Terminal 1 (Python Backend):
echo   python start_python_backend.py
echo.
echo Terminal 2 (TypeScript Frontend):
echo   npm run dev:frontend-only
echo.
echo Backend API: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo ================================================================
echo.
pause