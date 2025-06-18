"""
SQLAlchemy models for Educational Content Platform
Converted from TypeScript Drizzle schema to Python SQLAlchemy
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from enum import Enum

# Enums for content types and verification status
class ContentType(str, Enum):
    ACADEMIC_PAPER = "academic_paper"
    ASSESSMENT = "assessment"
    VIDEO = "video"
    LECTURE = "lecture"
    COURSE = "course"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    IN_REVIEW = "in_review"

# User model with authentication
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")  # 'user' or 'admin'
    avatar = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Password reset functionality
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    created_contents = relationship("Content", foreign_keys="Content.created_by_user_id", back_populates="creator")
    verified_contents = relationship("Content", foreign_keys="Content.verified_by_user_id", back_populates="verifier")
    created_videos = relationship("Video", foreign_keys="Video.created_by_user_id", back_populates="creator")
    verified_videos = relationship("Video", foreign_keys="Video.verified_by_user_id", back_populates="verifier")
    activities = relationship("Activity", back_populates="user")

# QAQF Level model
class QaqfLevel(Base):
    __tablename__ = "qaqf_levels"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)

# QAQF Characteristics model
class QaqfCharacteristic(Base):
    __tablename__ = "qaqf_characteristics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)

# Content model
class Content(Base):
    __tablename__ = "contents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String, nullable=False)
    qaqf_level = Column(Integer, nullable=False)
    module_code = Column(String)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_status = Column(String, nullable=False, default=VerificationStatus.PENDING)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    characteristics = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by_user_id], back_populates="created_contents")
    verifier = relationship("User", foreign_keys=[verified_by_user_id], back_populates="verified_contents")

# Video model
class Video(Base):
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    qaqf_level = Column(Integer, nullable=False)
    module_code = Column(String)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_status = Column(String, nullable=False, default=VerificationStatus.PENDING)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"))
    animation_style = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    characteristics = Column(JSON, nullable=False)
    url = Column(String)
    thumbnail_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by_user_id], back_populates="created_videos")
    verifier = relationship("User", foreign_keys=[verified_by_user_id], back_populates="verified_videos")

# Study Material model
class StudyMaterial(Base):
    __tablename__ = "study_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # 'document', 'video', 'audio', 'link'
    qaqf_level = Column(Integer, nullable=False)
    module_code = Column(String)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_status = Column(String, nullable=False, default=VerificationStatus.PENDING)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)  # For text content
    file_url = Column(String)  # For uploaded files
    file_name = Column(String)
    file_size = Column(Integer)
    characteristics = Column(JSON, nullable=False)
    tags = Column(JSON)  # Array of tags
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by_user_id])
    verifier = relationship("User", foreign_keys=[verified_by_user_id])

# Collection model for organizing study materials
class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    material_ids = Column(JSON, default=[])  # Array of study material IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User")

# Template model for reusable content structures
class Template(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    type = Column(String, nullable=False)  # 'lesson_plan', 'assessment', 'course_outline'
    qaqf_level = Column(Integer, nullable=False)
    content_structure = Column(JSON, nullable=False)  # Template structure
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User")

# Activity model
class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=False)
    details = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="activities")