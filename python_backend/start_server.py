#!/usr/bin/env python3
"""
Startup script for Python FastAPI backend
Run this to start your migrated Educational Content Platform API
"""
import os
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print("🚀 Starting Educational Content Platform - Python FastAPI Backend")
    print("📚 Migrated from TypeScript/Node.js to Python")
    print("🔗 Frontend compatibility maintained - React app works unchanged!")
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    print(f"🌐 Server will start on http://0.0.0.0:{port}")
    print("📖 API Documentation available at /docs")
    print("🔍 Interactive API explorer at /redoc")
    
    # Start the FastAPI server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )