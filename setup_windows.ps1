# Educational Content Platform Setup for Windows 11
# PowerShell Script

Write-Host "========================================" -ForegroundColor Green
Write-Host "Educational Content Platform Setup" -ForegroundColor Green
Write-Host "Windows 11 Local Development Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python not found. Please install Python 3.10+ and add to PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "Found Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found. Please install Node.js 18+ and add to PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Step 1: Creating Python virtual environment..." -ForegroundColor Yellow
Set-Location python_backend

if (Test-Path "venv") {
    Write-Host "Virtual environment already exists, removing old one..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create virtual environment" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Step 2: Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

Write-Host "Step 3: Installing Python dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r ..\python_requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Python dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Step 4: Going back to project root..." -ForegroundColor Yellow
Set-Location ..

Write-Host "Step 5: Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Node.js dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up PostgreSQL database (see LOCAL_SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "2. Copy .env.example to .env and configure your settings" -ForegroundColor White
Write-Host "3. Run: npm run db:push" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host
Write-Host "For detailed instructions, see LOCAL_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host
Read-Host "Press Enter to exit"