"""
Video API routes for Educational Content Platform
Migrated from TypeScript routes.ts video endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Video
from schemas import Video as VideoSchema, VideoCreate, VideoUpdate

router = APIRouter()

@router.get("/", response_model=List[VideoSchema])
async def get_videos(db: Session = Depends(get_db)):
    """Get all videos"""
    videos = db.query(Video).all()
    return videos

@router.get("/{video_id}", response_model=VideoSchema)
async def get_video(video_id: int, db: Session = Depends(get_db)):
    """Get video by ID"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@router.post("/", response_model=VideoSchema)
async def create_video(video: VideoCreate, db: Session = Depends(get_db)):
    """Create new video"""
    db_video = Video(**video.dict())
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video

@router.patch("/{video_id}", response_model=VideoSchema)
async def update_video(video_id: int, video_update: VideoUpdate, db: Session = Depends(get_db)):
    """Update video"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    update_data = video_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(video, field, value)
    
    db.commit()
    db.refresh(video)
    return video