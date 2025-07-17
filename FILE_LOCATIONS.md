# File Locations Guide - QAQF Academic Content Platform

## Root Directory Files (Where you run commands)

Your project root directory contains these important files:

```
📁 Your Project Root/
├── 📄 init_database.py          ← Database setup script (HERE)
├── 📄 database_reset.py         ← Quick database fix script (HERE)
├── 📄 WINDOWS_FIX_DATABASE.md   ← Database troubleshooting guide (HERE)
├── 📄 OLLAMA_SETUP.md           ← Ollama installation guide (HERE)
├── 📄 API_CRUD_GUIDE.md         ← API documentation (HERE)
├── 📄 SETUP_COMPLETE.md         ← Summary of changes (HERE)
├── 📄 package.json              ← Frontend dependencies
├── 📄 replit.md                 ← Project documentation
├── 📁 python_backend/           ← Python API server
│   ├── 📄 main.py               ← Backend entry point
│   ├── 📄 database.py           ← Database connection
│   ├── 📄 models.py             ← Database models
│   ├── 📄 ollama_service.py     ← AI service (NEW)
│   ├── 📄 file_service.py       ← File storage (NEW)
│   └── 📁 routes/               ← API endpoints
├── 📁 client/                   ← React frontend
├── 📁 uploads/                  ← Local file storage (NEW)
└── 📁 attached_assets/          ← Your uploaded files
```

## Key Files You Need to Know

### Database Setup Files (In Root Directory)
1. **`init_database.py`** - Complete database initialization
2. **`database_reset.py`** - Quick fix for database issues  
3. **`WINDOWS_FIX_DATABASE.md`** - Step-by-step troubleshooting

### New AI & File Features (In python_backend/)
1. **`python_backend/ollama_service.py`** - Local AI integration
2. **`python_backend/file_service.py`** - Local file storage
3. **`python_backend/routes/files.py`** - File upload API

### Documentation Files (In Root Directory)
1. **`OLLAMA_SETUP.md`** - How to install Ollama for AI features
2. **`API_CRUD_GUIDE.md`** - Complete API examples
3. **`SETUP_COMPLETE.md`** - Summary of all changes made

## How to Use These Files

### Fix Database Issues
```cmd
# Option 1: Run the complete setup
python init_database.py

# Option 2: Quick reset (faster)
python database_reset.py
```

### Where to Run Commands
All commands should be run from your **main project directory** (the one containing package.json).

### File Structure Explanation

**Root Level** (where you are now):
- Setup scripts and documentation
- Configuration files (package.json, etc.)
- Main project files

**python_backend/** folder:
- All Python/FastAPI backend code
- Database models and connections
- API routes and services

**client/** folder:
- React frontend application
- TypeScript components and pages

**uploads/** folder:
- Local file storage (created automatically)
- Organized by file type (images, documents, etc.)

## What Changed vs Original

### Before (Original Setup):
```
📁 Project/
├── 📄 package.json
├── 📁 python_backend/
├── 📁 client/
└── 📄 replit.md
```

### After (With New Features):
```
📁 Project/
├── 📄 init_database.py          ← NEW: Database setup
├── 📄 database_reset.py         ← NEW: Quick database fix
├── 📄 OLLAMA_SETUP.md           ← NEW: AI setup guide
├── 📄 API_CRUD_GUIDE.md         ← NEW: API documentation
├── 📄 WINDOWS_FIX_DATABASE.md   ← NEW: Troubleshooting
├── 📄 SETUP_COMPLETE.md         ← NEW: Summary of changes
├── 📄 package.json
├── 📁 python_backend/
│   ├── 📄 ollama_service.py     ← NEW: Local AI
│   ├── 📄 file_service.py       ← NEW: File storage
│   └── 📄 routes/files.py       ← NEW: File API
├── 📁 client/
├── 📁 uploads/                  ← NEW: Local storage
└── 📄 replit.md
```

## Windows Local Setup

When you downloaded/cloned the project to your Windows 11 machine:

1. **Your project folder** contains all these files
2. **Database scripts** are in the main folder (same level as package.json)
3. **Python backend** is in the python_backend/ subfolder
4. **React frontend** is in the client/ subfolder

## Quick Reference

**To fix database:** `python database_reset.py`
**To install AI:** Follow `OLLAMA_SETUP.md`
**To see all changes:** Read `SETUP_COMPLETE.md`
**To use APIs:** Follow `API_CRUD_GUIDE.md`

All files are in your main project directory - no need to look elsewhere!