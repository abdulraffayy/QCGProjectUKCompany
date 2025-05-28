"""
Content API routes for Educational Content Platform
Migrated from TypeScript routes.ts content endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Content
from schemas import Content as ContentSchema, ContentCreate, ContentUpdate

router = APIRouter()

@router.get("/", response_model=List[ContentSchema])
async def get_contents(db: Session = Depends(get_db)):
    """Get all content"""
    contents = db.query(Content).all()
    return contents

@router.get("/{content_id}", response_model=ContentSchema)
async def get_content(content_id: int, db: Session = Depends(get_db)):
    """Get content by ID"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.get("/user/{user_id}", response_model=List[ContentSchema])
async def get_contents_by_user(user_id: int, db: Session = Depends(get_db)):
    """Get content by user ID"""
    contents = db.query(Content).filter(Content.created_by_user_id == user_id).all()
    return contents

@router.get("/verification/{status}", response_model=List[ContentSchema])
async def get_contents_by_verification_status(status: str, db: Session = Depends(get_db)):
    """Get content by verification status"""
    contents = db.query(Content).filter(Content.verification_status == status).all()
    return contents

@router.post("/", response_model=ContentSchema)
async def create_content(content: ContentCreate, db: Session = Depends(get_db)):
    """Create new content"""
    db_content = Content(**content.dict())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

@router.patch("/{content_id}", response_model=ContentSchema)
async def update_content(content_id: int, content_update: ContentUpdate, db: Session = Depends(get_db)):
    """Update content"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    update_data = content_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    return content

@router.delete("/{content_id}")
async def delete_content(content_id: int, db: Session = Depends(get_db)):
    """Delete content"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}