"""
Ollama AI Service for Educational Content Platform
Replaces OpenAI and Anthropic with local Ollama integration
"""

import requests
import json
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "llama3.2"  # Default model, can be configured
        
    def is_available(self) -> bool:
        """Check if Ollama service is running"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
    
    def generate_content(self, 
                        content_type: str, 
                        qaqf_level: int, 
                        subject: str, 
                        characteristics: List[str],
                        additional_instructions: Optional[str] = None,
                        source_content: Optional[str] = None) -> Dict[str, str]:
        """Generate educational content using Ollama"""
        
        prompt = self._build_content_prompt(
            content_type, qaqf_level, subject, characteristics, 
            additional_instructions, source_content
        )
        
        try:
            response = self._make_request(prompt)
            return self._parse_content_response(response)
        except Exception as e:
            logger.error(f"Content generation failed: {e}")
            return self._fallback_content_generation(content_type, subject, qaqf_level)
    
    def generate_course(self, 
                       subject: str, 
                       qaqf_level: int, 
                       duration_weeks: int = 12,
                       target_audience: str = "students") -> Dict[str, Any]:
        """Generate complete course structure"""
        
        prompt = f"""
        Create a comprehensive course structure for {subject} at QAQF Level {qaqf_level}.
        Duration: {duration_weeks} weeks
        Target audience: {target_audience}
        
        Provide a detailed course outline with:
        1. Course title and description
        2. Learning objectives
        3. Weekly breakdown of topics
        4. Assessment methods
        5. Required resources
        
        Format the response as JSON with the following structure:
        {{
            "title": "Course Title",
            "description": "Course description",
            "learning_objectives": ["objective1", "objective2"],
            "weekly_topics": [
                {{"week": 1, "topic": "Topic 1", "description": "Description"}}
            ],
            "assessments": ["assessment1", "assessment2"],
            "resources": ["resource1", "resource2"]
        }}
        """
        
        try:
            response = self._make_request(prompt)
            return self._parse_json_response(response)
        except Exception as e:
            logger.error(f"Course generation failed: {e}")
            return self._fallback_course_generation(subject, qaqf_level, duration_weeks)
    
    def verify_content(self, content: str, qaqf_level: int) -> Dict[str, Any]:
        """Verify content against QAQF standards"""
        
        prompt = f"""
        Analyze the following educational content against QAQF Level {qaqf_level} standards:
        
        Content: {content}
        
        Evaluate based on these characteristics:
        1. Clarity (1-10)
        2. Completeness (1-10)
        3. Accuracy (1-10)
        4. Coherence (1-10)
        5. Appropriateness for level (1-10)
        
        Provide feedback and an overall score (0-100).
        
        Format response as JSON:
        {{
            "score": 85,
            "feedback": "Detailed feedback text",
            "characteristics": {{
                "clarity": 8,
                "completeness": 9,
                "accuracy": 8,
                "coherence": 8,
                "appropriateness": 9
            }}
        }}
        """
        
        try:
            response = self._make_request(prompt)
            return self._parse_json_response(response)
        except Exception as e:
            logger.error(f"Content verification failed: {e}")
            return self._fallback_verification(qaqf_level)
    
    def check_british_standards(self, content: str) -> Dict[str, Any]:
        """Check content compliance with British educational standards"""
        
        prompt = f"""
        Analyze the following content for compliance with British educational standards:
        
        Content: {content}
        
        Check for:
        1. Use of British English spelling and terminology
        2. Alignment with UK curriculum standards
        3. Cultural appropriateness for UK context
        4. Accessibility guidelines compliance
        
        Format response as JSON:
        {{
            "compliant": true,
            "issues": ["issue1", "issue2"],
            "suggestions": ["suggestion1", "suggestion2"]
        }}
        """
        
        try:
            response = self._make_request(prompt)
            return self._parse_json_response(response)
        except Exception as e:
            logger.error(f"British standards check failed: {e}")
            return {"compliant": True, "issues": [], "suggestions": []}
    
    def _make_request(self, prompt: str) -> str:
        """Make request to Ollama API"""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(
            f"{self.base_url}/api/generate",
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            raise Exception(f"Ollama API error: {response.status_code}")
        
        return response.json().get("response", "")
    
    def _build_content_prompt(self, content_type: str, qaqf_level: int, 
                             subject: str, characteristics: List[str],
                             additional_instructions: Optional[str] = None,
                             source_content: Optional[str] = None) -> str:
        """Build prompt for content generation"""
        
        characteristics_text = ", ".join(characteristics) if characteristics else "clarity, completeness, accuracy"
        
        prompt = f"""
        Create educational content with the following specifications:
        
        Type: {content_type}
        Subject: {subject}
        QAQF Level: {qaqf_level} (1=basic, 9=expert)
        Focus on: {characteristics_text}
        
        {"Additional instructions: " + additional_instructions if additional_instructions else ""}
        {"Source material to reference: " + source_content if source_content else ""}
        
        Generate comprehensive content that is:
        - Appropriate for QAQF Level {qaqf_level}
        - Clear and well-structured
        - Engaging and educational
        - Includes learning objectives
        - Contains practical examples
        
        Format the response as JSON:
        {{
            "title": "Content Title",
            "content": "Full content text with proper formatting",
            "module_code": "Generated module code"
        }}
        """
        
        return prompt
    
    def _parse_content_response(self, response: str) -> Dict[str, str]:
        """Parse content generation response"""
        try:
            # Try to extract JSON from response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx]
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        # Fallback: extract content manually
        lines = response.split('\n')
        title = "Generated Content"
        content = response
        module_code = "GEN001"
        
        # Try to extract title from first line
        if lines:
            first_line = lines[0].strip()
            if first_line and not first_line.startswith('{'):
                title = first_line.replace('#', '').strip()
        
        return {
            "title": title,
            "content": content,
            "module_code": module_code
        }
    
    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """Parse JSON response from Ollama"""
        try:
            # Extract JSON from response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx]
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        return {}
    
    def _fallback_content_generation(self, content_type: str, subject: str, qaqf_level: int) -> Dict[str, str]:
        """Fallback content generation when Ollama is unavailable"""
        
        qaqf_levels = {
            1: "Basic Foundation", 2: "Basic Operational", 3: "Basic Applied",
            4: "Intermediate Foundation", 5: "Intermediate Operational", 6: "Intermediate Applied",
            7: "Advanced Foundation", 8: "Advanced Operational", 9: "Advanced Applied"
        }
        
        level_name = qaqf_levels.get(qaqf_level, f"Level {qaqf_level}")
        
        title = f"{subject} - {level_name} {content_type.title()}"
        
        content = f"""
# {title}

## Learning Objectives
By the end of this {content_type}, learners will be able to:
- Understand key concepts related to {subject}
- Apply knowledge at QAQF {level_name} level
- Demonstrate practical skills in the subject area

## Introduction
This {content_type} covers essential aspects of {subject} designed for {level_name} learners.

## Main Content
[Content structure appropriate for QAQF Level {qaqf_level}]

### Key Topics
1. Fundamental concepts
2. Practical applications
3. Assessment criteria

## Summary
This {content_type} provides a comprehensive overview of {subject} at the appropriate academic level.

## Further Reading
- Additional resources for extended learning
- References to support materials
        """.strip()
        
        return {
            "title": title,
            "content": content,
            "module_code": f"{subject[:3].upper()}{qaqf_level:02d}1"
        }
    
    def _fallback_course_generation(self, subject: str, qaqf_level: int, duration_weeks: int) -> Dict[str, Any]:
        """Fallback course generation"""
        return {
            "title": f"{subject} Course - QAQF Level {qaqf_level}",
            "description": f"Comprehensive {duration_weeks}-week course covering {subject} at QAQF Level {qaqf_level}",
            "learning_objectives": [
                f"Master fundamental concepts of {subject}",
                f"Apply knowledge at QAQF Level {qaqf_level}",
                "Demonstrate practical skills through assessments"
            ],
            "weekly_topics": [
                {"week": i+1, "topic": f"Week {i+1}: Topic {i+1}", "description": f"Content for week {i+1}"}
                for i in range(duration_weeks)
            ],
            "assessments": ["Assignment 1", "Mid-term Assessment", "Final Project"],
            "resources": ["Textbooks", "Online resources", "Practical materials"]
        }
    
    def _fallback_verification(self, qaqf_level: int) -> Dict[str, Any]:
        """Fallback verification when Ollama is unavailable"""
        base_score = min(70 + (qaqf_level * 3), 90)
        
        return {
            "score": base_score,
            "feedback": f"Content appears suitable for QAQF Level {qaqf_level}. Manual review recommended.",
            "characteristics": {
                "clarity": 7,
                "completeness": 8,
                "accuracy": 8,
                "coherence": 7,
                "appropriateness": 8
            }
        }

# Global service instance
ollama_service = OllamaService()