"""
Dashboard API routes for Educational Content Platform
Migrated from TypeScript routes.ts dashboard endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Content, Video
from schemas import DashboardStats

router = APIRouter()

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics
    Equivalent to GET /api/dashboard/stats in TypeScript backend
    """
    try:
        # Count total content
        content_count = db.query(Content).count()
        
        # Count verified content
        verified_content_count = db.query(Content).filter(
            Content.verification_status == "verified"
        ).count()
        
        # Count pending verification content
        pending_verification_count = db.query(Content).filter(
            Content.verification_status == "pending"
        ).count()
        
        # Count total videos
        video_count = db.query(Video).count()
        
        return DashboardStats(
            content_count=content_count,
            verified_content_count=verified_content_count,
            pending_verification_count=pending_verification_count,
            video_count=video_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard stats")