# Ollama Setup Guide for Course Generator

## 🚀 Quick Setup Instructions

Your Course Generator is ready to use with Ollama! Here's how to get it fully operational:

### Option 1: Local Ollama Installation
1. **Install Ollama** (if not already installed):
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Start Ollama service**:
   ```bash
   ollama serve
   ```

3. **Pull a model** (recommended):
   ```bash
   ollama pull llama3
   ```

4. **Set environment variables** in your `.env` file:
   ```
   OLLAMA_API_URL=http://localhost:11434
   OLLAMA_MODEL=llama3
   ```

### Option 2: Remote Ollama Instance
If you have Ollama running on a different server:
```
OLLAMA_API_URL=http://your-ollama-server:11434
OLLAMA_MODEL=your-preferred-model
```

### Option 3: Alternative AI Services
The Course Generator also works with:
- **OpenAI** (using your existing OPENAI_API_KEY)
- **Anthropic** (using your existing ANTHROPIC_API_KEY)

## 🔧 Configuration Options

1. **Local Ollama** (Best performance, no API costs)
2. **Cloud Ollama** (Remote access, shared resources)
3. **Fallback Mode** (Works without any AI service)

## ✅ Testing Your Setup

Once configured, your Course Generator will:
- Show "Ollama Connected" status when working
- Show "Using Fallback Mode" if Ollama is unavailable
- Generate comprehensive course structures regardless

Would you like me to help you with any specific configuration option?