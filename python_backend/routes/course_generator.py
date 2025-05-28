"""
Course Generator API Routes
Production-ready endpoints for course generation with Ollama integration
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import asyncio
import logging
from services.course_generator import CourseGenerator, CourseRequest, CourseResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
course_generator = CourseGenerator()

@router.post("/generate/course", response_model=CourseResponse)
async def generate_course(request: CourseRequest):
    """
    Generate a complete course structure using Ollama API
    
    This endpoint creates comprehensive course content including:
    - Course overview and description
    - Module breakdown with lessons
    - Learning objectives and outcomes
    - Assessment strategies
    - Resource recommendations
    """
    try:
        logger.info(f"Starting course generation for: {request.course_title}")
        
        # Validate request parameters
        if not request.course_title.strip():
            raise HTTPException(status_code=400, detail="Course title is required")
        
        if not request.learning_objectives:
            raise HTTPException(status_code=400, detail="At least one learning objective is required")
        
        # Generate course content
        course = await course_generator.generate_course(request)
        
        logger.info(f"Successfully generated course: {course.course_title}")
        
        return course
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Course generation failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to generate course content. Please check your input and try again."
        )

@router.get("/generate/course/status")
async def check_ollama_status():
    """
    Check if Ollama API is available and responsive
    """
    try:
        # Simple connectivity test
        import httpx
        import os
        
        ollama_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{ollama_url}/api/tags")
            
            if response.status_code == 200:
                return {"status": "available", "message": "Ollama API is ready"}
            else:
                return {"status": "unavailable", "message": "Ollama API not responding"}
                
    except Exception as e:
        return {
            "status": "unavailable", 
            "message": "Ollama API connection failed. Using fallback generation."
        }

@router.get("/generate/course/templates")
async def get_course_templates():
    """
    Get predefined course templates for quick start
    """
    templates = [
        {
            "id": "web-dev-beginner",
            "title": "Web Development Fundamentals",
            "target_audience": "Beginners with no programming experience",
            "difficulty_level": "beginner",
            "duration_weeks": 12,
            "modules_count": 8,
            "learning_objectives": [
                "Build responsive websites using HTML, CSS, and JavaScript",
                "Understand web development best practices",
                "Deploy websites to production environments"
            ]
        },
        {
            "id": "data-science-intermediate",
            "title": "Data Science with Python",
            "target_audience": "Professionals with basic programming knowledge",
            "difficulty_level": "intermediate",
            "duration_weeks": 16,
            "modules_count": 10,
            "learning_objectives": [
                "Analyze data using Python and pandas",
                "Create data visualizations and insights",
                "Build machine learning models"
            ]
        },
        {
            "id": "business-strategy-advanced",
            "title": "Strategic Business Management",
            "target_audience": "Senior managers and executives",
            "difficulty_level": "advanced",
            "duration_weeks": 8,
            "modules_count": 6,
            "learning_objectives": [
                "Develop comprehensive business strategies",
                "Lead organizational transformation",
                "Make data-driven strategic decisions"
            ]
        }
    ]
    
    return {"templates": templates}

@router.post("/generate/course/preview")
async def generate_course_preview(request: CourseRequest):
    """
    Generate a quick course outline preview without full content
    """
    try:
        # Create a simplified version for preview
        preview = {
            "course_title": request.course_title,
            "estimated_duration": f"{request.duration_weeks} weeks",
            "total_modules": request.modules_count,
            "difficulty": request.difficulty_level,
            "target_audience": request.target_audience,
            "learning_objectives": request.learning_objectives,
            "estimated_lessons": request.modules_count * 4,  # Avg 4 lessons per module
            "time_commitment": f"{request.duration_weeks * 3}-{request.duration_weeks * 5} hours per week"
        }
        
        return {"preview": preview}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate course preview")