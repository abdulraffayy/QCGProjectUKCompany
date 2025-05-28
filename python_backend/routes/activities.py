"""
Activity API routes for Educational Content Platform
Migrated from TypeScript routes.ts activity endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Activity
from schemas import Activity as ActivitySchema, ActivityCreate

router = APIRouter()

@router.get("/", response_model=List[ActivitySchema])
async def get_activities(db: Session = Depends(get_db)):
    """Get all activities"""
    activities = db.query(Activity).order_by(Activity.created_at.desc()).all()
    return activities

@router.post("/", response_model=ActivitySchema)
async def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    """Create new activity"""
    db_activity = Activity(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity