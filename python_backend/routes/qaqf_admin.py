"""
QAQF Admin API routes for managing levels and characteristics
Full CRUD operations for QAQF framework management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import QaqfLevel, QaqfCharacteristic
from schemas import QaqfLevel as QaqfLevelSchema, QaqfCharacteristic as QaqfCharacteristicSchema
from pydantic import BaseModel

router = APIRouter()

# Request models for creating/updating
class QaqfLevelCreate(BaseModel):
    level: int
    name: str
    description: str

class QaqfLevelUpdate(BaseModel):
    level: int = None
    name: str = None
    description: str = None

class QaqfCharacteristicCreate(BaseModel):
    name: str
    description: str
    category: str

class QaqfCharacteristicUpdate(BaseModel):
    name: str = None
    description: str = None
    category: str = None

# QAQF Levels Management
@router.post("/levels", response_model=QaqfLevelSchema)
async def create_qaqf_level(level_data: QaqfLevelCreate, db: Session = Depends(get_db)):
    """Create new QAQF level"""
    # Check if level number already exists
    existing_level = db.query(QaqfLevel).filter(QaqfLevel.level == level_data.level).first()
    if existing_level:
        raise HTTPException(status_code=400, detail=f"Level {level_data.level} already exists")
    
    db_level = QaqfLevel(**level_data.dict())
    db.add(db_level)
    db.commit()
    db.refresh(db_level)
    return db_level

@router.patch("/levels/{level_id}", response_model=QaqfLevelSchema)
async def update_qaqf_level(level_id: int, level_update: QaqfLevelUpdate, db: Session = Depends(get_db)):
    """Update QAQF level"""
    level = db.query(QaqfLevel).filter(QaqfLevel.id == level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    
    update_data = level_update.dict(exclude_unset=True)
    
    # Check if level number is being changed and doesn't conflict
    if 'level' in update_data:
        existing_level = db.query(QaqfLevel).filter(
            QaqfLevel.level == update_data['level'],
            QaqfLevel.id != level_id
        ).first()
        if existing_level:
            raise HTTPException(status_code=400, detail=f"Level {update_data['level']} already exists")
    
    for field, value in update_data.items():
        setattr(level, field, value)
    
    db.commit()
    db.refresh(level)
    return level

@router.delete("/levels/{level_id}")
async def delete_qaqf_level(level_id: int, db: Session = Depends(get_db)):
    """Delete QAQF level"""
    level = db.query(QaqfLevel).filter(QaqfLevel.id == level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    
    # Check if level is being used by content
    from models import Content
    content_using_level = db.query(Content).filter(Content.qaqf_level == level.level).first()
    if content_using_level:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete level {level.level} - it is being used by existing content"
        )
    
    db.delete(level)
    db.commit()
    return {"message": f"Level {level.level} deleted successfully"}

# QAQF Characteristics Management
@router.post("/characteristics", response_model=QaqfCharacteristicSchema)
async def create_qaqf_characteristic(char_data: QaqfCharacteristicCreate, db: Session = Depends(get_db)):
    """Create new QAQF characteristic"""
    # Check if characteristic name already exists
    existing_char = db.query(QaqfCharacteristic).filter(QaqfCharacteristic.name == char_data.name).first()
    if existing_char:
        raise HTTPException(status_code=400, detail=f"Characteristic '{char_data.name}' already exists")
    
    db_char = QaqfCharacteristic(**char_data.dict())
    db.add(db_char)
    db.commit()
    db.refresh(db_char)
    return db_char

@router.patch("/characteristics/{char_id}", response_model=QaqfCharacteristicSchema)
async def update_qaqf_characteristic(char_id: int, char_update: QaqfCharacteristicUpdate, db: Session = Depends(get_db)):
    """Update QAQF characteristic"""
    characteristic = db.query(QaqfCharacteristic).filter(QaqfCharacteristic.id == char_id).first()
    if not characteristic:
        raise HTTPException(status_code=404, detail="Characteristic not found")
    
    update_data = char_update.dict(exclude_unset=True)
    
    # Check if name is being changed and doesn't conflict
    if 'name' in update_data:
        existing_char = db.query(QaqfCharacteristic).filter(
            QaqfCharacteristic.name == update_data['name'],
            QaqfCharacteristic.id != char_id
        ).first()
        if existing_char:
            raise HTTPException(status_code=400, detail=f"Characteristic '{update_data['name']}' already exists")
    
    for field, value in update_data.items():
        setattr(characteristic, field, value)
    
    db.commit()
    db.refresh(characteristic)
    return characteristic

@router.delete("/characteristics/{char_id}")
async def delete_qaqf_characteristic(char_id: int, db: Session = Depends(get_db)):
    """Delete QAQF characteristic"""
    characteristic = db.query(QaqfCharacteristic).filter(QaqfCharacteristic.id == char_id).first()
    if not characteristic:
        raise HTTPException(status_code=404, detail="Characteristic not found")
    
    db.delete(characteristic)
    db.commit()
    return {"message": f"Characteristic '{characteristic.name}' deleted successfully"}

# Bulk operations
@router.post("/levels/bulk")
async def create_bulk_levels(levels_data: List[QaqfLevelCreate], db: Session = Depends(get_db)):
    """Create multiple QAQF levels at once"""
    created_levels = []
    for level_data in levels_data:
        # Check if level already exists
        existing_level = db.query(QaqfLevel).filter(QaqfLevel.level == level_data.level).first()
        if not existing_level:
            db_level = QaqfLevel(**level_data.dict())
            db.add(db_level)
            created_levels.append(level_data.level)
    
    db.commit()
    return {"message": f"Created {len(created_levels)} levels", "levels": created_levels}

@router.post("/characteristics/bulk")
async def create_bulk_characteristics(chars_data: List[QaqfCharacteristicCreate], db: Session = Depends(get_db)):
    """Create multiple QAQF characteristics at once"""
    created_chars = []
    for char_data in chars_data:
        # Check if characteristic already exists
        existing_char = db.query(QaqfCharacteristic).filter(QaqfCharacteristic.name == char_data.name).first()
        if not existing_char:
            db_char = QaqfCharacteristic(**char_data.dict())
            db.add(db_char)
            created_chars.append(char_data.name)
    
    db.commit()
    return {"message": f"Created {len(created_chars)} characteristics", "characteristics": created_chars}