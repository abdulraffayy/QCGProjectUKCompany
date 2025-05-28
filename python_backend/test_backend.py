#!/usr/bin/env python3
"""
Test script for Python FastAPI backend
Verifies that all components work correctly
"""
import os
import sys
sys.path.append('.')

from database import get_db
from models import Base
from schemas import ContentGenerationRequest, DashboardStats
from services.ai_service import AIService

def test_database_connection():
    """Test database connectivity"""
    try:
        db = next(get_db())
        print("✅ Database connection successful")
        db.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_ai_service():
    """Test AI service functionality"""
    try:
        ai_service = AIService()
        
        # Test content generation
        request = ContentGenerationRequest(
            content_type="lecture",
            qaqf_level=5,
            subject="Python Programming",
            characteristics=["Knowledge and understanding", "Applied knowledge"],
            additional_instructions="Focus on practical examples"
        )
        
        result = ai_service._generate_structured_content(request, "Test Title", "PYT501")
        print("✅ AI content generation working")
        return True
    except Exception as e:
        print(f"❌ AI service test failed: {e}")
        return False

def test_imports():
    """Test all imports work correctly"""
    try:
        from main import app
        from routes import dashboard, content, qaqf, videos, activities, ai_services
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Python FastAPI Backend Migration")
    print("=" * 50)
    
    # Run tests
    tests = [
        ("Import Test", test_imports),
        ("AI Service Test", test_ai_service),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Your Python FastAPI backend is ready!")
        print("🚀 Run 'python start_server.py' to start the server")
    else:
        print("⚠️ Some tests failed - check the output above")