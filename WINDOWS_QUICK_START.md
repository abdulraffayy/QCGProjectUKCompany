# Windows 11 Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites Check
```bash
# Check if you have these installed:
python --version    # Should be 3.10+
node --version      # Should be 18+
psql --version      # PostgreSQL 14+
```

### 1. One-Click Setup
```bash
# Option A: Command Prompt
setup_windows.bat

# Option B: PowerShell (Run as Administrator)
PowerShell -ExecutionPolicy Bypass -File setup_windows.ps1
```

### 2. Database Setup
```bash
# Connect to PostgreSQL
psql -U postgres

# Run the setup script
\i create_database.sql
\q
```

### 3. Configure Environment
```bash
# Copy environment template
copy .env.example .env

# Edit .env with your settings:
# - Update DATABASE_URL password
# - Add API keys (optional)
```

### 4. Initialize Database
```bash
python init_database.py
```

### 5. Start Application
```bash
npm run dev
```

**🎉 Application running at: http://localhost:5000**

## 📁 What You Get

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + FastAPI (Python)
- **Database**: PostgreSQL with full schema
- **Features**: Study Materials, Content Generation, QAQF Framework

## 🔧 Daily Development

```bash
# Start everything
start_local.bat

# Or manually
npm run dev
```

## ❓ Having Issues?

### Database Connection Error
```bash
# Check PostgreSQL service is running
services.msc
# Start PostgreSQL service if stopped
```

### Python Virtual Environment Issues
```bash
# Recreate environment
cd python_backend
rmdir /s venv
python -m venv venv
venv\Scripts\activate
pip install -r ..\python_requirements.txt
```

### Port 5000 Already in Use
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### File Upload Not Working
- Ensure `uploads` folder exists in project root
- Check file permissions
- Verify .env UPLOAD_DIR setting

## 📚 Full Documentation
See `LOCAL_SETUP_GUIDE.md` for detailed instructions and troubleshooting.