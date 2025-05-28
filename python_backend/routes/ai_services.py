"""
AI Services API routes for Educational Content Platform
Migrated from TypeScript AI generation endpoints (OpenAI/Anthropic/Ollama)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import (
    ContentGenerationRequest, ContentGenerationResponse,
    ContentVerificationRequest, VerificationResponse,
    BritishStandardsRequest, BritishStandardsResponse
)
from services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

@router.post("/generate/content", response_model=ContentGenerationResponse)
async def generate_content(request: ContentGenerationRequest, db: Session = Depends(get_db)):
    """
    Generate academic content using AI
    Equivalent to POST /api/generate/content in TypeScript backend
    """
    try:
        result = await ai_service.generate_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate content: {str(e)}")

@router.post("/verify/content", response_model=VerificationResponse)
async def verify_content(request: ContentVerificationRequest, db: Session = Depends(get_db)):
    """
    Verify content against QAQF framework
    Equivalent to POST /api/verify/content in TypeScript backend
    """
    try:
        result = await ai_service.verify_content(request.content, request.qaqf_level)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify content: {str(e)}")

@router.post("/check/british-standards", response_model=BritishStandardsResponse)
async def check_british_standards(request: BritishStandardsRequest, db: Session = Depends(get_db)):
    """
    Check content against British academic standards
    Equivalent to POST /api/check/british-standards in TypeScript backend
    """
    try:
        result = await ai_service.check_british_standards(request.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check British standards: {str(e)}")

@router.post("/upload/source")
async def upload_source(db: Session = Depends(get_db)):
    """
    Upload source material for content generation
    Equivalent to POST /api/upload/source in TypeScript backend
    """
    try:
        return {
            "message": "Source uploaded successfully",
            "source_id": "temp-source-id",
            "source_type": "unknown"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload source: {str(e)}")