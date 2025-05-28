"""
FastAPI main application entry point for Educational Content Platform
Migration from Node.js/TypeScript backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from database import engine
from models import Base
from routes import content, dashboard, qaqf, videos, activities, ai_services

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Educational Content Platform API",
    description="AI-powered academic content generation with QAQF framework compliance",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

# Include API routes
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(qaqf.router, prefix="/api/qaqf", tags=["qaqf"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(ai_services.router, prefix="/api", tags=["ai-services"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Educational Content Platform API is running"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Educational Content Platform API", "docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )