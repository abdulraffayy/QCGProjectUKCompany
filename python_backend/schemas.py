"""
Pydantic schemas for request/response validation
Equivalent to your TypeScript Zod schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from models import ContentType, VerificationStatus

# Authentication schemas
class UserLogin(BaseModel):
    username: str
    password: str

class UserSignup(BaseModel):
    username: str
    email: str
    password: str
    name: str
    role: str = "user"

class UserBase(BaseModel):
    username: str
    email: str
    name: str
    role: str = "user"
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    avatar: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    name: str
    role: str
    avatar: Optional[str] = None
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class PasswordReset(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# QAQF Level schemas
class QaqfLevelBase(BaseModel):
    level: int
    name: str
    description: str

class QaqfLevelCreate(QaqfLevelBase):
    pass

class QaqfLevel(QaqfLevelBase):
    id: int
    
    class Config:
        from_attributes = True

# QAQF Characteristic schemas
class QaqfCharacteristicBase(BaseModel):
    name: str
    description: str
    category: str

class QaqfCharacteristicCreate(QaqfCharacteristicBase):
    pass

class QaqfCharacteristic(QaqfCharacteristicBase):
    id: int
    
    class Config:
        from_attributes = True

# Content schemas
class ContentBase(BaseModel):
    title: str
    description: str
    type: str
    qaqf_level: int = Field(..., ge=1, le=9)
    module_code: Optional[str] = None
    content: str
    characteristics: List[Any]

class ContentCreate(ContentBase):
    created_by_user_id: int
    verification_status: str = VerificationStatus.PENDING
    verified_by_user_id: Optional[int] = None

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    verification_status: Optional[str] = None
    verified_by_user_id: Optional[int] = None
    content: Optional[str] = None

class Content(ContentBase):
    id: int
    created_by_user_id: int
    verification_status: str
    verified_by_user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Video schemas
class VideoBase(BaseModel):
    title: str
    description: str
    qaqf_level: int = Field(..., ge=1, le=9)
    module_code: Optional[str] = None
    animation_style: str
    duration: str
    characteristics: List[Any]
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None

class VideoCreate(VideoBase):
    created_by_user_id: int
    verification_status: str = VerificationStatus.PENDING
    verified_by_user_id: Optional[int] = None

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    verification_status: Optional[str] = None
    verified_by_user_id: Optional[int] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None

class Video(VideoBase):
    id: int
    created_by_user_id: int
    verification_status: str
    verified_by_user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Study Material schemas
class StudyMaterialBase(BaseModel):
    title: str
    description: str
    type: str  # 'document', 'video', 'audio', 'link'
    qaqf_level: int = Field(..., ge=1, le=9)
    module_code: Optional[str] = None
    content: Optional[str] = None
    characteristics: List[Any]
    tags: Optional[List[str]] = None

class StudyMaterialCreate(StudyMaterialBase):
    created_by_user_id: int
    verification_status: str = "pending"
    verified_by_user_id: Optional[int] = None

class StudyMaterialUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    verification_status: Optional[str] = None
    verified_by_user_id: Optional[int] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None

class StudyMaterial(StudyMaterialBase):
    id: int
    created_by_user_id: int
    verification_status: str
    verified_by_user_id: Optional[int]
    file_url: Optional[str]
    file_name: Optional[str]
    file_size: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Collection schemas
class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False
    material_ids: List[int] = []

class CollectionCreate(CollectionBase):
    created_by_user_id: int

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    material_ids: Optional[List[int]] = None

class Collection(CollectionBase):
    id: int
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Template schemas
class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str  # 'lesson_plan', 'assessment', 'course_outline'
    qaqf_level: int = Field(..., ge=1, le=9)
    content_structure: Dict[str, Any]
    is_public: bool = False

class TemplateCreate(TemplateBase):
    created_by_user_id: int

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content_structure: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class Template(TemplateBase):
    id: int
    created_by_user_id: int
    usage_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Activity schemas
class ActivityBase(BaseModel):
    action: str
    entity_type: str
    entity_id: int
    details: Optional[Dict[str, Any]] = None

class ActivityCreate(ActivityBase):
    user_id: int

class Activity(ActivityBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# AI Content Generation schemas
class ContentGenerationRequest(BaseModel):
    content_type: str
    qaqf_level: int = Field(..., ge=1, le=9)
    subject: str = Field(..., min_length=3)
    characteristics: List[str]
    additional_instructions: Optional[str] = None
    source_type: str = "internal"
    source_content: Optional[str] = None

class ContentGenerationResponse(BaseModel):
    title: str
    content: str
    module_code: str

# Verification schemas
class ContentVerificationRequest(BaseModel):
    content: str
    qaqf_level: int = Field(..., ge=1, le=9)

class VerificationResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    feedback: str
    characteristics: Dict[str, int]

# British Standards Check schemas
class BritishStandardsRequest(BaseModel):
    content: str

class BritishStandardsResponse(BaseModel):
    compliant: bool
    issues: List[str]
    suggestions: List[str]

# Dashboard stats schema
class DashboardStats(BaseModel):
    content_count: int
    verified_content_count: int
    pending_verification_count: int
    video_count: int