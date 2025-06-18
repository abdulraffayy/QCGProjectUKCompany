"""
Local File Upload Service for Educational Content Platform
Replaces AWS S3 with local file storage
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, Dict, List, Any
from fastapi import UploadFile, HTTPException
import mimetypes
import hashlib
from datetime import datetime

class LocalFileService:
    def __init__(self, base_upload_dir: str = "uploads"):
        self.base_upload_dir = Path(base_upload_dir)
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.allowed_extensions = {
            'images': {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'},
            'documents': {'.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'},
            'videos': {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'},
            'audio': {'.mp3', '.wav', '.ogg', '.m4a', '.aac'},
            'archives': {'.zip', '.rar', '.7z', '.tar', '.gz'}
        }
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Create necessary directories"""
        directories = [
            self.base_upload_dir,
            self.base_upload_dir / "images",
            self.base_upload_dir / "documents", 
            self.base_upload_dir / "videos",
            self.base_upload_dir / "audio",
            self.base_upload_dir / "archives",
            self.base_upload_dir / "temp"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def upload_file(self, file: UploadFile, user_id: int, 
                   category: Optional[str] = None) -> Dict[str, Any]:
        """Upload file to local storage"""
        
        # Validate file
        self._validate_file(file)
        
        # Determine file category
        if not category:
            category = self._determine_category(file.filename)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Create file path
        upload_dir = self.base_upload_dir / category
        file_path = upload_dir / unique_filename
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
        
        # Get file info
        file_info = self._get_file_info(file_path, file.filename, user_id)
        
        return file_info
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from local storage"""
        try:
            full_path = self.base_upload_dir / file_path
            if full_path.exists() and full_path.is_file():
                full_path.unlink()
                return True
            return False
        except Exception:
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """Get public URL for file"""
        # In production, this would be your domain + file path
        return f"/uploads/{file_path}"
    
    def get_file_info(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Get file information"""
        try:
            full_path = self.base_upload_dir / file_path
            if not full_path.exists():
                return None
            
            stat = full_path.stat()
            return {
                "name": full_path.name,
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime),
                "mime_type": mimetypes.guess_type(str(full_path))[0],
                "url": self.get_file_url(file_path)
            }
        except Exception:
            return None
    
    def list_files(self, category: Optional[str] = None, 
                  user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """List files in storage"""
        files = []
        
        if category:
            search_dirs = [self.base_upload_dir / category]
        else:
            search_dirs = [
                self.base_upload_dir / cat 
                for cat in ['images', 'documents', 'videos', 'audio', 'archives']
            ]
        
        for directory in search_dirs:
            if directory.exists():
                for file_path in directory.iterdir():
                    if file_path.is_file():
                        relative_path = file_path.relative_to(self.base_upload_dir)
                        file_info = self.get_file_info(str(relative_path))
                        if file_info:
                            file_info['category'] = directory.name
                            file_info['path'] = str(relative_path)
                            files.append(file_info)
        
        return files
    
    def create_thumbnail(self, image_path: str, size: tuple = (200, 200)) -> Optional[str]:
        """Create thumbnail for image files"""
        try:
            from PIL import Image
            
            full_path = self.base_upload_dir / image_path
            if not full_path.exists():
                return None
            
            # Create thumbnail directory
            thumb_dir = self.base_upload_dir / "thumbnails"
            thumb_dir.mkdir(exist_ok=True)
            
            # Generate thumbnail path
            thumb_filename = f"thumb_{full_path.name}"
            thumb_path = thumb_dir / thumb_filename
            
            # Create thumbnail
            with Image.open(full_path) as img:
                img.thumbnail(size, Image.Resampling.LANCZOS)
                img.save(thumb_path, format='JPEG', quality=85)
            
            return f"thumbnails/{thumb_filename}"
        
        except ImportError:
            # PIL not available, skip thumbnail generation
            return None
        except Exception:
            return None
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        stats = {
            "total_files": 0,
            "total_size": 0,
            "categories": {}
        }
        
        for category in ['images', 'documents', 'videos', 'audio', 'archives']:
            category_dir = self.base_upload_dir / category
            if category_dir.exists():
                files = list(category_dir.iterdir())
                category_files = [f for f in files if f.is_file()]
                category_size = sum(f.stat().st_size for f in category_files)
                
                stats["categories"][category] = {
                    "file_count": len(category_files),
                    "size": category_size
                }
                
                stats["total_files"] += len(category_files)
                stats["total_size"] += category_size
        
        return stats
    
    def _validate_file(self, file: UploadFile):
        """Validate uploaded file"""
        # Check file size
        if file.size and file.size > self.max_file_size:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size: {self.max_file_size // (1024*1024)}MB"
            )
        
        # Check file extension
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        file_extension = Path(file.filename).suffix.lower()
        all_extensions = set()
        for extensions in self.allowed_extensions.values():
            all_extensions.update(extensions)
        
        if file_extension not in all_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {', '.join(all_extensions)}"
            )
    
    def _determine_category(self, filename: str) -> str:
        """Determine file category based on extension"""
        file_extension = Path(filename).suffix.lower()
        
        for category, extensions in self.allowed_extensions.items():
            if file_extension in extensions:
                return category
        
        return "documents"  # Default category
    
    def _get_file_info(self, file_path: Path, original_name: str, user_id: int) -> Dict[str, Any]:
        """Get comprehensive file information"""
        stat = file_path.stat()
        relative_path = file_path.relative_to(self.base_upload_dir)
        
        # Calculate file hash for deduplication
        file_hash = self._calculate_file_hash(file_path)
        
        return {
            "name": original_name,
            "filename": file_path.name,
            "path": str(relative_path),
            "url": self.get_file_url(str(relative_path)),
            "size": stat.st_size,
            "mime_type": mimetypes.guess_type(str(file_path))[0],
            "category": file_path.parent.name,
            "uploaded_by": user_id,
            "uploaded_at": datetime.fromtimestamp(stat.st_ctime),
            "hash": file_hash
        }
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate MD5 hash of file"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception:
            return ""

# Global service instance
file_service = LocalFileService()