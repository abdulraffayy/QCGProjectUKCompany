#!/usr/bin/env python3
"""
Ollama Setup Script for Course Generator
Helps configure and test Ollama connection
"""

import asyncio
import httpx
import json
import os
from typing import Dict, Any

class OllamaSetup:
    def __init__(self):
        self.default_url = "http://localhost:11434"
        self.default_model = "llama3"
        
    async def check_ollama_status(self, url: str = None) -> Dict[str, Any]:
        """Check if Ollama is running and accessible"""
        ollama_url = url or self.default_url
        
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                # Test basic connectivity
                response = await client.get(f"{ollama_url}/api/tags")
                
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    return {
                        "status": "connected",
                        "url": ollama_url,
                        "models_available": len(models),
                        "models": [model.get("name", "unknown") for model in models[:5]]
                    }
                else:
                    return {
                        "status": "error",
                        "message": f"Ollama responded with status {response.status_code}"
                    }
                    
        except httpx.ConnectError:
            return {
                "status": "connection_failed",
                "message": f"Cannot connect to Ollama at {ollama_url}"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Unexpected error: {str(e)}"
            }
    
    async def test_model_generation(self, url: str = None, model: str = None) -> Dict[str, Any]:
        """Test course generation with a specific model"""
        ollama_url = url or self.default_url
        ollama_model = model or self.default_model
        
        test_prompt = """Generate a brief course outline for "Introduction to Python Programming" for beginners. 
        Response should be in JSON format with: title, description, modules (array with title and lessons).
        Keep it concise - 3 modules maximum."""
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{ollama_url}/api/generate",
                    json={
                        "model": ollama_model,
                        "prompt": test_prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "status": "success",
                        "model": ollama_model,
                        "response_length": len(result.get("response", "")),
                        "generation_time": result.get("total_duration", 0) / 1000000000  # Convert to seconds
                    }
                else:
                    return {
                        "status": "model_error",
                        "message": f"Model generation failed with status {response.status_code}"
                    }
                    
        except Exception as e:
            return {
                "status": "generation_error",
                "message": f"Generation test failed: {str(e)}"
            }
    
    def create_env_config(self, url: str = None, model: str = None):
        """Create environment configuration for Ollama"""
        ollama_url = url or self.default_url
        ollama_model = model or self.default_model
        
        config = f"""
# Ollama Configuration for Course Generator
OLLAMA_API_URL={ollama_url}
OLLAMA_MODEL={ollama_model}

# Add these lines to your .env file
"""
        return config

async def main():
    """Main setup function"""
    setup = OllamaSetup()
    
    print("🚀 Ollama Setup for Course Generator")
    print("=" * 50)
    
    # Check default connection
    print("Checking Ollama connection...")
    status = await setup.check_ollama_status()
    
    if status["status"] == "connected":
        print(f"✅ Ollama is running at {status['url']}")
        print(f"📦 Found {status['models_available']} models available")
        
        if status["models"]:
            print("Available models:", ", ".join(status["models"]))
            
            # Test generation with first available model
            test_model = status["models"][0] if status["models"] else "llama3"
            print(f"\n🧪 Testing course generation with {test_model}...")
            
            test_result = await setup.test_model_generation(model=test_model)
            
            if test_result["status"] == "success":
                print(f"✅ Generation test successful!")
                print(f"⏱️  Generation time: {test_result['generation_time']:.2f}s")
                
                # Create config
                config = setup.create_env_config(model=test_model)
                print("\n📝 Environment Configuration:")
                print(config)
                
            else:
                print(f"❌ Generation test failed: {test_result['message']}")
        
    else:
        print(f"❌ {status['message']}")
        print("\n💡 Setup Instructions:")
        print("1. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh")
        print("2. Start Ollama: ollama serve")
        print("3. Pull a model: ollama pull llama3")
        print("4. Run this script again")

if __name__ == "__main__":
    asyncio.run(main())