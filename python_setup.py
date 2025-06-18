#!/usr/bin/env python3
"""
Complete Python + TypeScript setup for Educational Content Platform
Migrates from Node.js backend to Python FastAPI backend
"""
import os
import sys
import subprocess
import json
from pathlib import Path

def install_python_dependencies():
    """Install Python dependencies for the backend"""
    print("Installing Python dependencies...")
    requirements_file = Path("python_backend/requirements.txt")
    
    if requirements_file.exists():
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
    else:
        # Install core dependencies if requirements.txt missing
        core_deps = [
            "fastapi", "uvicorn", "sqlalchemy", "psycopg2-binary", 
            "python-dotenv", "pydantic", "python-multipart",
            "anthropic", "openai", "bcrypt", "passlib", "python-jose"
        ]
        subprocess.run([sys.executable, "-m", "pip", "install"] + core_deps)

def create_env_file():
    """Create .env file for Python backend"""
    env_file = Path(".env")
    if not env_file.exists():
        env_content = """# Python FastAPI Backend Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/education_platform
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
SECRET_KEY=your-secret-key-for-jwt
PYTHONPATH=python_backend
"""
        env_file.write_text(env_content)
        print("Created .env file - update with your actual values")

def update_frontend_config():
    """Update frontend to use Python backend"""
    # Update package.json scripts
    package_json = Path("package.json")
    if package_json.exists():
        with open(package_json) as f:
            data = json.load(f)
        
        # Add Python development scripts
        data["scripts"]["dev:python"] = "python start_python_backend.py"
        data["scripts"]["dev:frontend-only"] = "vite"
        
        with open(package_json, 'w') as f:
            json.dump(data, f, indent=2)

def create_development_guide():
    """Create development guide for Python + TypeScript setup"""
    guide_content = """# Python + TypeScript Development Guide

## Quick Start

### Option 1: Python Backend + TypeScript Frontend (Recommended)
```bash
# Terminal 1: Start Python FastAPI backend (port 8000)
python start_python_backend.py

# Terminal 2: Start TypeScript frontend (port 5173)
npm run dev:frontend-only
```

### Option 2: Use the existing Node.js backend
```bash
npm run dev  # Runs Node.js backend + frontend
```

## Backend Comparison

### Python FastAPI Backend (Recommended)
- **Port**: 8000
- **API Docs**: http://localhost:8000/docs
- **Features**: Complete API with all endpoints
- **Database**: SQLAlchemy with PostgreSQL
- **AI Integration**: OpenAI & Anthropic support

### Node.js Express Backend
- **Port**: 5000  
- **Features**: Basic API endpoints
- **Database**: Drizzle ORM with PostgreSQL

## Frontend Configuration
- **Port**: 5173 (Vite dev server)
- **Framework**: React + TypeScript
- **API Proxy**: Automatically configured for both backends

## Environment Setup
1. Copy `.env.example` to `.env`
2. Update database and API keys in `.env`
3. Choose your preferred backend option above

## Migration Benefits
- **Better Type Safety**: Python Pydantic models
- **Auto Documentation**: FastAPI generates OpenAPI docs
- **Better AI Integration**: Native Python AI libraries
- **Easier Deployment**: Python ecosystem tooling
"""
    
    Path("PYTHON_TYPESCRIPT_SETUP.md").write_text(guide_content)

def main():
    print("Setting up Python + TypeScript development environment...")
    
    # Install Python dependencies
    install_python_dependencies()
    
    # Create environment configuration
    create_env_file()
    
    # Create development guide
    create_development_guide()
    
    print("\n" + "="*60)
    print("Python + TypeScript setup complete!")
    print("="*60)
    print()
    print("Choose your development approach:")
    print()
    print("1. Python Backend + TypeScript Frontend:")
    print("   Terminal 1: python start_python_backend.py")
    print("   Terminal 2: npm run dev:frontend-only")
    print()
    print("2. Keep using Node.js backend:")
    print("   npm run dev")
    print()
    print("Backend APIs:")
    print("- Python FastAPI: http://localhost:8000/docs")
    print("- Node.js Express: http://localhost:5000")
    print()
    print("Frontend: http://localhost:5173")
    print("="*60)

if __name__ == "__main__":
    main()