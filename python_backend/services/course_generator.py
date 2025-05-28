"""
Course Generator Service - Ollama Integration
Generates structured course content using Ollama API
"""
import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()

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

class CourseGenerator:
    def __init__(self):
        self.ollama_base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3")
        self.timeout = 120  # 2 minutes timeout for course generation
    
    async def generate_course(self, request: CourseRequest) -> CourseResponse:
        """
        Generate a complete course structure using Ollama
        """
        try:
            # Build comprehensive prompt for course generation
            prompt = self._build_course_prompt(request)
            
            # Call Ollama API
            course_data = await self._call_ollama_api(prompt)
            
            # Parse and structure the response
            structured_course = self._parse_course_response(course_data, request)
            
            return structured_course
            
        except Exception as e:
            # Fallback to structured sample course if Ollama fails
            return self._generate_fallback_course(request)
    
    def _build_course_prompt(self, request: CourseRequest) -> str:
        """Build detailed prompt for course generation"""
        objectives_text = "\n".join([f"- {obj}" for obj in request.learning_objectives])
        
        prompt = f"""Generate a comprehensive course structure for educational content. Return response as valid JSON only.

Course Parameters:
- Title: {request.course_title}
- Target Audience: {request.target_audience}
- Difficulty Level: {request.difficulty_level}
- Duration: {request.duration_weeks} weeks
- Number of Modules: {request.modules_count}

Learning Objectives:
{objectives_text}

Generate a course with the following JSON structure:
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
          "key_concepts": ["concept1", "concept2", "concept3"]
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
    
    async def _call_ollama_api(self, prompt: str) -> Dict[str, Any]:
        """Make API call to Ollama"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.ollama_base_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "format": "json",
                        "stream": False
                    }
                )
                response.raise_for_status()
                
                result = response.json()
                
                # Parse the JSON response from Ollama
                if "response" in result:
                    return json.loads(result["response"])
                else:
                    raise ValueError("Invalid response format from Ollama")
                    
            except (httpx.RequestError, json.JSONDecodeError, KeyError) as e:
                raise Exception(f"Ollama API call failed: {str(e)}")
    
    def _parse_course_response(self, course_data: Dict[str, Any], request: CourseRequest) -> CourseResponse:
        """Parse and validate course data from Ollama"""
        try:
            # Validate and structure modules
            modules = []
            total_lessons = 0
            
            for module_data in course_data.get("modules", []):
                lessons = []
                for lesson_data in module_data.get("lessons", []):
                    lesson = LessonContent(
                        title=lesson_data.get("title", "Untitled Lesson"),
                        description=lesson_data.get("description", ""),
                        duration_minutes=lesson_data.get("duration_minutes", 45),
                        learning_outcomes=lesson_data.get("learning_outcomes", []),
                        key_concepts=lesson_data.get("key_concepts", [])
                    )
                    lessons.append(lesson)
                    total_lessons += 1
                
                module = ModuleContent(
                    module_number=module_data.get("module_number", 1),
                    title=module_data.get("title", "Untitled Module"),
                    description=module_data.get("description", ""),
                    duration_weeks=module_data.get("duration_weeks", 1.0),
                    lessons=lessons,
                    assessment_type=module_data.get("assessment_type", "quiz")
                )
                modules.append(module)
            
            return CourseResponse(
                course_title=course_data.get("course_title", request.course_title),
                description=course_data.get("description", ""),
                target_audience=course_data.get("target_audience", request.target_audience),
                difficulty_level=course_data.get("difficulty_level", request.difficulty_level),
                total_duration_weeks=course_data.get("total_duration_weeks", request.duration_weeks),
                total_lessons=total_lessons,
                learning_objectives=course_data.get("learning_objectives", request.learning_objectives),
                prerequisites=course_data.get("prerequisites", []),
                modules=modules,
                assessment_strategy=course_data.get("assessment_strategy", ""),
                resources=course_data.get("resources", [])
            )
            
        except Exception as e:
            raise Exception(f"Failed to parse course response: {str(e)}")
    
    def _generate_fallback_course(self, request: CourseRequest) -> CourseResponse:
        """Generate structured fallback course when Ollama is unavailable"""
        
        # Create sample lessons for each module
        sample_lessons = []
        lessons_per_module = max(3, min(5, 20 // request.modules_count))
        
        for i in range(lessons_per_module):
            lesson = LessonContent(
                title=f"Lesson {i+1}: Fundamentals of {request.course_title.split()[0]}",
                description=f"In this lesson, we explore key concepts related to {request.course_title}.",
                duration_minutes=45,
                learning_outcomes=[
                    f"Understand core principles of {request.course_title}",
                    f"Apply {request.difficulty_level}-level concepts",
                    "Demonstrate practical knowledge"
                ],
                key_concepts=[
                    "Theoretical foundations",
                    "Practical applications",
                    "Real-world examples"
                ]
            )
            sample_lessons.append(lesson)
        
        # Create modules
        modules = []
        weeks_per_module = request.duration_weeks / request.modules_count
        
        for i in range(request.modules_count):
            module = ModuleContent(
                module_number=i + 1,
                title=f"Module {i+1}: {request.course_title} - Part {i+1}",
                description=f"This module covers essential aspects of {request.course_title} for {request.target_audience}.",
                duration_weeks=weeks_per_module,
                lessons=sample_lessons.copy(),
                assessment_type="quiz" if i % 2 == 0 else "assignment"
            )
            modules.append(module)
        
        return CourseResponse(
            course_title=request.course_title,
            description=f"A comprehensive {request.difficulty_level}-level course on {request.course_title} designed for {request.target_audience}. This course provides practical knowledge and skills through structured learning modules.",
            target_audience=request.target_audience,
            difficulty_level=request.difficulty_level,
            total_duration_weeks=request.duration_weeks,
            total_lessons=len(sample_lessons) * request.modules_count,
            learning_objectives=request.learning_objectives,
            prerequisites=[
                f"Basic understanding of {request.course_title.split()[0].lower()}",
                "Motivation to learn",
                "Access to learning materials"
            ],
            modules=modules,
            assessment_strategy=f"Continuous assessment through quizzes, assignments, and practical exercises suitable for {request.difficulty_level} level.",
            resources=[
                "Course materials and readings",
                "Interactive exercises",
                "Video demonstrations",
                "Community discussion forums"
            ]
        )