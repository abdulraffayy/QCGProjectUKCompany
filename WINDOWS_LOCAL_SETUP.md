# QAQF Academic Content Platform - Windows 11 Local Setup Guide

## Prerequisites

### 1. Install Node.js
- Download Node.js 20+ from [nodejs.org](https://nodejs.org/)
- Choose the LTS version (recommended)
- Verify installation: Open Command Prompt and run:
```bash
node --version
npm --version
```

### 2. Install Python (for backend)
- Download Python 3.11+ from [python.org](https://www.python.org/)
- **Important**: Check "Add Python to PATH" during installation
- Verify installation:
```bash
python --version
pip --version
```

### 3. Install PostgreSQL Database
- Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
- During installation, remember your password for the `postgres` user
- Default port is 5432

### 4. Install Git (Optional but recommended)
- Download from [git-scm.com](https://git-scm.com/)

## Project Setup

### 1. Clone/Download Project
```bash
git clone <your-repository-url>
cd qaqf-platform
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
pip install -r python_requirements.txt
```

### 4. Database Setup
Create a PostgreSQL database:
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE qaqf_platform;
CREATE USER qaqf_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE qaqf_platform TO qaqf_user;
```

### 5. Environment Configuration
Create `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL=postgresql://qaqf_user:your_password@localhost:5432/qaqf_platform
PGHOST=localhost
PGPORT=5432
PGUSER=qaqf_user
PGPASSWORD=your_password
PGDATABASE=qaqf_platform

# API Keys (Optional - get from respective services)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Security
JWT_SECRET=your-secret-key-here
```

## Running the Application

### Method 1: Development Mode
Open two terminal windows:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd python_backend
python main.py
```

### Method 2: Using Batch Scripts
Create `start_local.bat`:
```batch
@echo off
echo Starting QAQF Academic Content Platform...
start "Frontend" cmd /k "npm run dev"
timeout /t 3
start "Backend" cmd /k "cd python_backend && python main.py"
echo Both servers starting...
pause
```

## Access the Application
- Frontend: http://localhost:5000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Default Login Credentials
- **Admin**: username `admin`, password `admin123`
- **User**: username `user`, password `user123`

## Troubleshooting

### Common Issues:

1. **Port Already in Use**
   - Kill processes using ports 5000 or 8000
   - Or change ports in configuration

2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check credentials in `.env` file
   - Ensure database exists

3. **Python Module Not Found**
   - Install missing modules: `pip install module_name`
   - Or reinstall all: `pip install -r python_requirements.txt`

4. **Node Module Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

## Windows Firewall
If accessing from other devices on your network:
1. Open Windows Defender Firewall
2. Allow Node.js and Python through firewall
3. Access via your computer's IP address

## Performance Tips
- Use Windows Terminal for better command line experience
- Consider using VS Code with extensions for better development
- Enable Windows Developer Mode for better file system performance