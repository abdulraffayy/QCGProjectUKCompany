# Ollama Setup Guide - QAQF Academic Content Platform

## What is Ollama?

Ollama is a local AI service that runs large language models on your computer. This replaces cloud-based AI services like OpenAI and Anthropic, giving you privacy and cost control while generating educational content.

## Installation

### Windows 11 (Recommended)

1. **Download Ollama**
   - Visit [ollama.ai](https://ollama.ai/download)
   - Download the Windows installer
   - Run the installer and follow the setup wizard

2. **Verify Installation**
   ```cmd
   ollama --version
   ```

### Alternative Installation Methods

**Linux/WSL:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**macOS:**
```bash
brew install ollama
```

## Required Models

Install these AI models for educational content generation:

### Primary Model (Recommended)
```bash
ollama pull llama3.2
```
- Best balance of quality and speed
- Excellent for educational content
- Good at following QAQF standards

### Alternative Models
```bash
# For faster responses (smaller model)
ollama pull llama3.2:1b

# For higher quality (larger model)
ollama pull llama3.1:8b

# For coding content
ollama pull codellama

# For general purpose
ollama pull mistral
```

## Starting Ollama Service

### Windows
Ollama runs automatically as a service after installation. If needed:
```cmd
ollama serve
```

### Linux/macOS
```bash
ollama serve
```

The service runs on `http://localhost:11434` by default.

## Testing Your Setup

### 1. Check Service Status
```bash
curl http://localhost:11434/api/tags
```

Expected response: List of installed models

### 2. Test Content Generation
```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2",
    "prompt": "Create a lesson plan for QAQF Level 5 Mathematics covering algebra basics",
    "stream": false
  }'
```

### 3. Test with Platform
Start your platform and try generating content:
1. Login with admin/admin123
2. Go to Content Generator
3. Select Mathematics, Level 5
4. Click Generate Content

## Troubleshooting

### Ollama Service Not Running
```bash
# Check if running
curl http://localhost:11434/api/tags

# If not running, start manually
ollama serve
```

### Model Not Found Error
```bash
# List installed models
ollama list

# Install missing model
ollama pull llama3.2
```

### Performance Issues
- **Memory**: Ollama needs 4-8GB RAM for llama3.2
- **Storage**: Models require 2-7GB disk space each
- **CPU**: Works on most modern processors

### Port Conflicts
If port 11434 is busy:
```bash
# Use different port
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

Update `python_backend/ollama_service.py`:
```python
ollama_service = OllamaService("http://localhost:11435")
```

## Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| llama3.2:1b | 1.3GB | Fast | Good | Quick responses |
| llama3.2 | 2.0GB | Medium | Better | General content |
| llama3.1:8b | 4.7GB | Slow | Best | Complex content |
| mistral | 4.1GB | Medium | Good | Alternative choice |
| codellama | 3.8GB | Medium | Good | Programming lessons |

## Platform Integration

The platform automatically:
- Detects if Ollama is running
- Falls back to structured content if unavailable
- Uses the configured model (default: llama3.2)
- Handles errors gracefully

### Configuration Options

In `python_backend/ollama_service.py`, you can modify:
```python
class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.model = "llama3.2"  # Change default model here
```

## Benefits of Local AI

### Privacy
- No data sent to external services
- Content stays on your computer
- GDPR and privacy compliant

### Cost Control
- No per-token charges
- No monthly subscription fees
- Unlimited content generation

### Reliability
- Works offline
- No API rate limits
- Consistent availability

### Performance
- Fast responses after model loads
- No network latency
- Customizable for your hardware

## Advanced Configuration

### Custom Prompts
Modify prompts in `ollama_service.py` to match your specific needs:
```python
def _build_content_prompt(self, content_type, qaqf_level, subject, characteristics):
    # Customize this method for your content style
```

### Multiple Models
Configure different models for different content types:
```python
def __init__(self):
    self.models = {
        'lesson': 'llama3.2',
        'assessment': 'llama3.1:8b',
        'course': 'mistral'
    }
```

### Performance Tuning
```bash
# Set memory usage (in MB)
export OLLAMA_MEMORY=4096

# Set number of CPU threads
export OLLAMA_NUM_THREADS=4
```

## Getting Help

If you encounter issues:
1. Check the [Ollama documentation](https://github.com/ollama/ollama)
2. Verify your system meets minimum requirements
3. Test with smaller models first (llama3.2:1b)
4. Check system resources (RAM, disk space)

The platform will continue working with fallback content generation even if Ollama isn't available, but you'll get much better results with Ollama running properly.