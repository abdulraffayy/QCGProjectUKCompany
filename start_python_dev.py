#!/usr/bin/env python3
"""
Development startup script for Python FastAPI + TypeScript frontend
Starts both backend and frontend development servers
"""
import subprocess
import sys
import os
import time
from pathlib import Path

def check_python_deps():
    """Check if Python dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        print("✓ Python dependencies ready")
        return True
    except ImportError as e:
        print(f"✗ Missing Python dependency: {e}")
        print("Installing Python dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "python_backend/requirements.txt"])
        return True

def start_backend():
    """Start FastAPI backend server"""
    print("🚀 Starting Python FastAPI backend on port 8000...")
    os.chdir("python_backend")
    return subprocess.Popen([
        sys.executable, "start_server.py"
    ])

def start_frontend():
    """Start Vite frontend development server"""
    print("⚡ Starting Vite frontend development server...")
    os.chdir(Path(__file__).parent)
    return subprocess.Popen([
        "npm", "run", "dev:frontend"
    ], shell=True)

def main():
    print("🔄 Starting Educational Content Platform - Python + TypeScript")
    print("Backend: Python FastAPI")
    print("Frontend: React + TypeScript + Vite")
    
    # Check dependencies
    if not check_python_deps():
        sys.exit(1)
    
    try:
        # Start backend
        backend_process = start_backend()
        time.sleep(2)  # Give backend time to start
        
        # Start frontend
        os.chdir(Path(__file__).parent)
        frontend_process = start_frontend()
        
        print("\n" + "="*50)
        print("🌐 Development servers started:")
        print("📚 Backend API: http://localhost:8000")
        print("🎨 Frontend: http://localhost:5173")
        print("📖 API Docs: http://localhost:8000/docs")
        print("="*50)
        
        # Wait for processes
        try:
            backend_process.wait()
            frontend_process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Shutting down development servers...")
            backend_process.terminate()
            frontend_process.terminate()
            
    except Exception as e:
        print(f"Error starting development servers: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()