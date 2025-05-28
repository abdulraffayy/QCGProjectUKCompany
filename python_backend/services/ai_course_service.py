"""
Enhanced AI Course Generation Service
Uses OpenAI for intelligent course creation with Ollama fallback
"""

import json
import os
import httpx
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class CourseRequest(BaseModel):
    """Course generation request model"""
    course_title: str = Field(..., min_length=3, max_length=200)
    target_audience: str = Field(..., min_length=3, max_length=100)
    difficulty_level: str = Field(..., pattern="^(beginner|intermediate|advanced)$")
    learning_objectives: List[str] = Field(..., min_length=1, max_length=10)
    duration_weeks: Optional[int] = Field(default=8, ge=1, le=52)
    modules_count: Optional[int] = Field(default=6, ge=3, le=20)

class LessonContent(BaseModel):
    """Individual lesson structure"""
    title: str
    description: str
    duration_minutes: int
    learning_outcomes: List[str]
    key_concepts: List[str]

class ModuleContent(BaseModel):
    """Course module structure"""
    module_number: int
    title: str
    description: str
    duration_weeks: float
    lessons: List[LessonContent]
    assessment_type: str

class CourseResponse(BaseModel):
    """Complete course structure response"""
    course_title: str
    description: str
    target_audience: str
    difficulty_level: str
    total_duration_weeks: int
    total_lessons: int
    learning_objectives: List[str]
    prerequisites: List[str]
    modules: List[ModuleContent]
    assessment_strategy: str
    resources: List[str]

class EnhancedCourseGenerator:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.ollama_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
        
    async def generate_course(self, request: CourseRequest) -> CourseResponse:
        """Generate a complete course structure using AI"""
        try:
            prompt = self._build_course_prompt(request)
            
            # Try OpenAI first for best results
            course_data = await self._call_openai_api(prompt)
            
            if not course_data:
                # Fallback to Ollama if available
                course_data = await self._call_ollama_api(prompt)
            
            if not course_data:
                # Final fallback to structured generation
                course_data = self._generate_fallback_course(request)
            
            return self._parse_course_response(course_data, request)
            
        except Exception as e:
            logger.error(f"Course generation failed: {str(e)}")
            # Always provide a structured response
            fallback_data = self._generate_fallback_course(request)
            return self._parse_course_response(fallback_data, request)

    def _build_course_prompt(self, request: CourseRequest) -> str:
        """Build detailed prompt for course generation"""
        objectives_text = "\n".join([f"- {obj}" for obj in request.learning_objectives])
        
        prompt = f"""Generate a comprehensive course structure for "{request.course_title}".

Course Details:
- Target Audience: {request.target_audience}
- Difficulty Level: {request.difficulty_level}
- Duration: {request.duration_weeks} weeks
- Number of Modules: {request.modules_count}

Learning Objectives:
{objectives_text}

Create a detailed course structure with the following JSON format:
{{
  "course_title": "{request.course_title}",
  "description": "Comprehensive 2-3 sentence course description",
  "target_audience": "{request.target_audience}",
  "difficulty_level": "{request.difficulty_level}",
  "total_duration_weeks": {request.duration_weeks},
  "total_lessons": "calculated total lessons across all modules",
  "learning_objectives": {json.dumps(request.learning_objectives)},
  "prerequisites": ["list of 2-4 prerequisites"],
  "modules": [
    {{
      "module_number": 1,
      "title": "Module title",
      "description": "Module description",
      "duration_weeks": 1.5,
      "lessons": [
        {{
          "title": "Lesson title",
          "description": "Lesson description", 
          "duration_minutes": 45,
          "learning_outcomes": ["outcome1", "outcome2"],
          "key_concepts": ["concept1", "concept2"]
        }}
      ],
      "assessment_type": "quiz/assignment/project"
    }}
  ],
  "assessment_strategy": "Overall assessment approach",
  "resources": ["resource1", "resource2", "resource3"]
}}

Requirements:
- Create exactly {request.modules_count} modules
- Each module should have 3-5 lessons
- Total duration should be {request.duration_weeks} weeks
- Lessons should be 30-90 minutes each
- Include varied assessment types
- Ensure progressive difficulty
- Make content relevant to {request.difficulty_level} level

Return only valid JSON, no additional text."""

        return prompt

    async def _call_openai_api(self, prompt: str) -> Dict[str, Any]:
        """Use OpenAI for intelligent course generation"""
        if not self.openai_api_key:
            logger.warning("OpenAI API key not available")
            return {}
            
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024
                        "messages": [
                            {"role": "system", "content": "You are an expert course designer. Generate comprehensive course structures in JSON format exactly as requested."},
                            {"role": "user", "content": prompt}
                        ],
                        "response_format": {"type": "json_object"},
                        "max_tokens": 2000
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    response_text = result["choices"][0]["message"]["content"]
                    return json.loads(response_text)
                else:
                    logger.error(f"OpenAI API error: {response.status_code}")
                    return {}
                    
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return {}

    async def _call_ollama_api(self, prompt: str) -> Dict[str, Any]:
        """Try Ollama for course generation"""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.ollama_model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    response_text = result.get("response", "")
                    return json.loads(response_text)
                else:
                    logger.warning(f"Ollama not available: {response.status_code}")
                    return {}
                    
        except Exception as e:
            logger.warning(f"Ollama not available: {str(e)}")
            return {}

    def _generate_fallback_course(self, request: CourseRequest) -> Dict[str, Any]:
        """Generate structured course when AI services are unavailable"""
        lessons_per_module = 4
        total_lessons = request.modules_count * lessons_per_module
        
        modules = []
        for i in range(request.modules_count):
            module_lessons = []
            for j in range(lessons_per_module):
                lesson = {
                    "title": f"Lesson {j+1}: {request.course_title} Fundamentals",
                    "description": f"Core concepts and practical applications for {request.difficulty_level} learners",
                    "duration_minutes": 60,
                    "learning_outcomes": [
                        f"Understand key concepts in {request.course_title}",
                        f"Apply {request.difficulty_level}-level techniques"
                    ],
                    "key_concepts": [
                        f"Concept {j+1}A",
                        f"Concept {j+1}B", 
                        f"Concept {j+1}C"
                    ]
                }
                module_lessons.append(lesson)
            
            module = {
                "module_number": i + 1,
                "title": f"Module {i+1}: Core Foundations",
                "description": f"Essential {request.course_title} concepts for {request.target_audience}",
                "duration_weeks": round(request.duration_weeks / request.modules_count, 1),
                "lessons": module_lessons,
                "assessment_type": "quiz" if i % 2 == 0 else "assignment"
            }
            modules.append(module)
        
        return {
            "course_title": request.course_title,
            "description": f"A comprehensive {request.difficulty_level}-level course designed for {request.target_audience}.",
            "target_audience": request.target_audience,
            "difficulty_level": request.difficulty_level,
            "total_duration_weeks": request.duration_weeks,
            "total_lessons": total_lessons,
            "learning_objectives": request.learning_objectives,
            "prerequisites": [f"Basic knowledge relevant to {request.difficulty_level} level"],
            "modules": modules,
            "assessment_strategy": "Progressive assessments with quizzes and practical assignments",
            "resources": [
                "Recommended textbooks and online materials",
                "Practice exercises and examples", 
                "Additional reading and resources"
            ]
        }

    def _parse_course_response(self, course_data: Dict[str, Any], request: CourseRequest) -> CourseResponse:
        """Parse and validate course data"""
        try:
            return CourseResponse(**course_data)
        except Exception as e:
            logger.error(f"Failed to parse course response: {str(e)}")
            # Return fallback response
            fallback_data = self._generate_fallback_course(request)
            return CourseResponse(**fallback_data)

# Global instance
enhanced_course_generator = EnhancedCourseGenerator()