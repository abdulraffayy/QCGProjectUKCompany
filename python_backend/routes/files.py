"""
File upload and management routes
Local file storage instead of AWS S3
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import User
from routes.auth import get_current_user
from file_service import file_service
from schemas import UserResponse

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file to local storage"""
    try:
        file_info = file_service.upload_file(file, current_user.id, category)
        
        # Create thumbnail for images
        if file_info["category"] == "images":
            thumbnail_path = file_service.create_thumbnail(file_info["path"])
            if thumbnail_path:
                file_info["thumbnail_url"] = file_service.get_file_url(thumbnail_path)
        
        return {
            "message": "File uploaded successfully",
            "file": file_info
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list")
async def list_files(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List uploaded files"""
    files = file_service.list_files(category=category)
    return {
        "files": files,
        "total": len(files)
    }

@router.get("/stats")
async def get_storage_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get storage statistics"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    stats = file_service.get_storage_stats()
    return stats

@router.delete("/delete/{file_path:path}")
async def delete_file(
    file_path: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a file"""
    # Admin can delete any file, users can delete their own files
    if current_user.role != "admin":
        # In a real app, you'd check if the file belongs to the current user
        pass
    
    success = file_service.delete_file(file_path)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return {"message": "File deleted successfully"}

@router.get("/info/{file_path:path}")
async def get_file_info(
    file_path: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get file information"""
    file_info = file_service.get_file_info(file_path)
    if not file_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return file_info