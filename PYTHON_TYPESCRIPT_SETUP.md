# Python + TypeScript Development Guide

## Quick Start

### Option 1: Python Backend + TypeScript Frontend (Recommended)
```bash
# Terminal 1: Start Python FastAPI backend (port 8000)
python start_python_backend.py

# Terminal 2: Start TypeScript frontend (port 5173)
npm run dev:frontend-only
```

### Option 2: Use the existing Node.js backend
```bash
npm run dev  # Runs Node.js backend + frontend
```

## Backend Comparison

### Python FastAPI Backend (Recommended)
- **Port**: 8000
- **API Docs**: http://localhost:8000/docs
- **Features**: Complete API with all endpoints
- **Database**: SQLAlchemy with PostgreSQL
- **AI Integration**: OpenAI & Anthropic support

### Node.js Express Backend
- **Port**: 5000  
- **Features**: Basic API endpoints
- **Database**: Drizzle ORM with PostgreSQL

## Frontend Configuration
- **Port**: 5173 (Vite dev server)
- **Framework**: React + TypeScript
- **API Proxy**: Automatically configured for both backends

## Environment Setup
1. Copy `.env.example` to `.env`
2. Update database and API keys in `.env`
3. Choose your preferred backend option above

## Migration Benefits
- **Better Type Safety**: Python Pydantic models
- **Auto Documentation**: FastAPI generates OpenAPI docs
- **Better AI Integration**: Native Python AI libraries
- **Easier Deployment**: Python ecosystem tooling
