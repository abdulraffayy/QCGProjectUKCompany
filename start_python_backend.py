#!/usr/bin/env python3
"""
Start Python FastAPI backend for Educational Content Platform
Run this to use Python instead of Node.js backend
"""
import os
import sys
import subprocess
from pathlib import Path

def setup_python_environment():
    """Setup Python environment and dependencies"""
    backend_dir = Path("python_backend")
    if not backend_dir.exists():
        print("Error: python_backend directory not found")
        sys.exit(1)
    
    # Install Python dependencies
    requirements_file = backend_dir / "requirements.txt"
    if requirements_file.exists():
        print("Installing Python dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
    
    return backend_dir

def start_backend():
    """Start the Python FastAPI backend"""
    backend_dir = setup_python_environment()
    
    print("🚀 Starting Python FastAPI Backend")
    print("📚 Educational Content Platform API")
    print("🔗 Frontend will connect to Python API")
    print()
    
    # Change to backend directory and start server
    os.chdir(backend_dir)
    
    # Set environment for Python backend
    os.environ["PYTHONPATH"] = str(Path.cwd())
    
    print("🌐 Backend API: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔍 Interactive API: http://localhost:8000/redoc")
    print()
    
    # Start FastAPI server
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except ImportError:
        print("Installing uvicorn...")
        subprocess.run([sys.executable, "-m", "pip", "install", "uvicorn"])
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0", 
            port=8000,
            reload=True,
            log_level="info"
        )

if __name__ == "__main__":
    start_backend()