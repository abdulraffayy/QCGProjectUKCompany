"""
Study Materials routes for Educational Content Platform
Handles CRUD operations for study materials, collections, and templates
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from database import get_db
from models import StudyMaterial, Collection, Template, User
from schemas import (
    StudyMaterial as StudyMaterialSchema,
    StudyMaterialCreate, StudyMaterialUpdate,
    Collection as CollectionSchema,
    CollectionCreate, CollectionUpdate,
    Template as TemplateSchema,
    TemplateCreate, TemplateUpdate
)
from routes.auth import get_current_active_user, get_admin_user

router = APIRouter()

# Ensure upload directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Study Materials endpoints
@router.get("/study-materials", response_model=List[StudyMaterialSchema])
async def get_study_materials(
    skip: int = 0,
    limit: int = 100,
    type_filter: Optional[str] = None,
    qaqf_level: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all study materials with optional filtering"""
    query = db.query(StudyMaterial)
    
    if type_filter:
        query = query.filter(StudyMaterial.type == type_filter)
    if qaqf_level:
        query = query.filter(StudyMaterial.qaqf_level == qaqf_level)
    
    materials = query.offset(skip).limit(limit).all()
    return materials

@router.get("/study-materials/{material_id}", response_model=StudyMaterialSchema)
async def get_study_material(
    material_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific study material by ID"""
    material = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study material not found"
        )
    return material

@router.post("/study-materials", response_model=StudyMaterialSchema)
async def create_study_material(
    material: StudyMaterialCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new study material"""
    material.created_by_user_id = current_user.id
    
    db_material = StudyMaterial(**material.dict())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    
    return db_material

@router.put("/study-materials/{material_id}", response_model=StudyMaterialSchema)
async def update_study_material(
    material_id: int,
    material_update: StudyMaterialUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a study material"""
    material = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study material not found"
        )
    
    # Check permissions - only creator or admin can update
    if material.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this material"
        )
    
    # Update fields
    update_data = material_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(material, field, value)
    
    material.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(material)
    
    return material

@router.delete("/study-materials/{material_id}")
async def delete_study_material(
    material_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a study material"""
    material = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study material not found"
        )
    
    # Check permissions
    if material.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this material"
        )
    
    # Delete file if exists
    if material.file_url:
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(material.file_url))
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.delete(material)
    db.commit()
    
    return {"message": "Study material deleted successfully"}

@router.post("/study-materials/{material_id}/upload")
async def upload_material_file(
    material_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a file for a study material"""
    material = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study material not found"
        )
    
    # Check permissions
    if material.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload file for this material"
        )
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{material_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update material with file info
    material.file_url = f"/uploads/{material_id}_{file.filename}"
    material.file_name = file.filename
    material.file_size = os.path.getsize(file_path)
    material.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(material)
    
    return {"message": "File uploaded successfully", "file_url": material.file_url}

# Collections endpoints
@router.get("/collections", response_model=List[CollectionSchema])
async def get_collections(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all collections"""
    query = db.query(Collection)
    
    # Only show public collections or user's own collections
    if current_user.role != "admin":
        query = query.filter(
            (Collection.is_public == True) | 
            (Collection.created_by_user_id == current_user.id)
        )
    
    collections = query.offset(skip).limit(limit).all()
    return collections

@router.get("/collections/{collection_id}", response_model=CollectionSchema)
async def get_collection(
    collection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific collection by ID"""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Check access permissions
    if not collection.is_public and collection.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this collection"
        )
    
    return collection

@router.post("/collections", response_model=CollectionSchema)
async def create_collection(
    collection: CollectionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new collection"""
    collection.created_by_user_id = current_user.id
    
    db_collection = Collection(**collection.dict())
    db.add(db_collection)
    db.commit()
    db.refresh(db_collection)
    
    return db_collection

@router.put("/collections/{collection_id}", response_model=CollectionSchema)
async def update_collection(
    collection_id: int,
    collection_update: CollectionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a collection"""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Check permissions
    if collection.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this collection"
        )
    
    # Update fields
    update_data = collection_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(collection, field, value)
    
    collection.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(collection)
    
    return collection

@router.delete("/collections/{collection_id}")
async def delete_collection(
    collection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a collection"""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found"
        )
    
    # Check permissions
    if collection.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this collection"
        )
    
    db.delete(collection)
    db.commit()
    
    return {"message": "Collection deleted successfully"}

# Templates endpoints
@router.get("/templates", response_model=List[TemplateSchema])
async def get_templates(
    skip: int = 0,
    limit: int = 100,
    type_filter: Optional[str] = None,
    qaqf_level: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all templates with optional filtering"""
    query = db.query(Template)
    
    # Only show public templates or user's own templates
    if current_user.role != "admin":
        query = query.filter(
            (Template.is_public == True) | 
            (Template.created_by_user_id == current_user.id)
        )
    
    if type_filter:
        query = query.filter(Template.type == type_filter)
    if qaqf_level:
        query = query.filter(Template.qaqf_level == qaqf_level)
    
    templates = query.offset(skip).limit(limit).all()
    return templates

@router.get("/templates/{template_id}", response_model=TemplateSchema)
async def get_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific template by ID"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check access permissions
    if not template.is_public and template.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this template"
        )
    
    return template

@router.post("/templates", response_model=TemplateSchema)
async def create_template(
    template: TemplateCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new template"""
    template.created_by_user_id = current_user.id
    
    db_template = Template(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    return db_template

@router.put("/templates/{template_id}", response_model=TemplateSchema)
async def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check permissions
    if template.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this template"
        )
    
    # Update fields
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    
    return template

@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check permissions
    if template.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this template"
        )
    
    db.delete(template)
    db.commit()
    
    return {"message": "Template deleted successfully"}

@router.post("/templates/{template_id}/use")
async def use_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark template as used (increment usage count)"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Check access permissions
    if not template.is_public and template.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use this template"
        )
    
    template.usage_count += 1
    template.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Template usage recorded", "usage_count": template.usage_count}