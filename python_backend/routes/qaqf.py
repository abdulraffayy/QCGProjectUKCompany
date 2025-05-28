"""
QAQF API routes for Educational Content Platform
Migrated from TypeScript routes.ts QAQF endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import QaqfLevel, QaqfCharacteristic
from schemas import QaqfLevel as QaqfLevelSchema, QaqfCharacteristic as QaqfCharacteristicSchema

router = APIRouter()

@router.get("/levels", response_model=List[QaqfLevelSchema])
async def get_qaqf_levels(db: Session = Depends(get_db)):
    """Get all QAQF levels"""
    levels = db.query(QaqfLevel).all()
    return levels

@router.get("/characteristics", response_model=List[QaqfCharacteristicSchema])
async def get_qaqf_characteristics(db: Session = Depends(get_db)):
    """Get all QAQF characteristics"""
    characteristics = db.query(QaqfCharacteristic).all()
    return characteristics