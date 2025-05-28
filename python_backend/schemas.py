"""
Pydantic schemas for request/response validation
Equivalent to your TypeScript Zod schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from models import ContentType, VerificationStatus

# User schemas
class UserBase(BaseModel):
    username: str
    name: str
    role: str = "user"
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

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