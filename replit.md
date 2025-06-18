# QAQF Academic Content Platform

## Overview

This is a comprehensive educational content platform built with FastAPI (Python backend) and React (TypeScript frontend). The platform facilitates the creation, verification, and management of academic content aligned with the QAQF (Quality Assurance and Qualifications Framework) standards. The system supports AI-powered content generation, course creation, assessment tools, and video generation capabilities.

## System Architecture

### Backend Architecture
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based authentication with role-based access control
- **API Structure**: RESTful APIs with automatic OpenAPI documentation
- **Port**: Backend runs on port 8000

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: TanStack Query for server state, React Context for auth
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI components with Tailwind CSS styling
- **Build Tool**: Vite for development and production builds
- **Port**: Frontend runs on port 5000

### Database Schema
- **Users**: Authentication, roles (user/admin), profile management
- **Content**: Academic content with QAQF compliance tracking
- **Videos**: Educational video metadata and generation status
- **Activities**: User action logging and audit trails
- **QAQF Framework**: Levels, characteristics, and compliance rules

## Key Components

### AI Services Integration
- **Ollama**: Local AI service for content generation (replaces OpenAI/Anthropic)
- **Fallback System**: Structured content generation when Ollama is unavailable
- **Models**: Support for llama3.2, mistral, and other Ollama models
- **Local Processing**: All AI processing happens locally for privacy and cost control

### Content Management System
- **Content Generation**: AI-powered academic content creation
- **Course Generator**: Complete course structure development
- **Video Generator**: Educational video creation workflow
- **Content Verification**: Multi-stage approval process
- **British Standards Compliance**: Automated compliance checking

### QAQF Framework Implementation
- **9 Quality Levels**: From basic (Level 1) to expert (Level 9)
- **10 Characteristics**: Clarity, completeness, accuracy, coherence, etc.
- **Compliance Validation**: Automated checking against framework requirements
- **Assessment Integration**: QAQF-aligned assessment tools

### User Interface Components
- **Dashboard**: Real-time statistics and content overview
- **Content Generators**: Unified interface for content and course creation
- **Verification Panel**: Admin tools for content approval
- **Assessment Tools**: QAQF-aligned assessment creation and evaluation
- **Analytics**: Content performance and QAQF compliance metrics

## Data Flow

1. **Content Creation**: Users create content via AI-powered generators
2. **QAQF Validation**: System validates content against framework requirements
3. **Verification Queue**: Content enters approval workflow for moderators
4. **AI Enhancement**: OpenAI/Anthropic services enhance and verify content quality
5. **Publication**: Approved content becomes available to target audiences
6. **Analytics Collection**: System tracks usage and effectiveness metrics

## External Dependencies

### AI Services
- **OpenAI API**: GPT models for content generation and verification
- **Anthropic API**: Claude models as alternative AI provider
- **Ollama API**: Local AI deployment for course generation

### Core Libraries
- **FastAPI**: Modern Python web framework with automatic API documentation
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Pydantic**: Data validation using Python type annotations
- **React Query**: Server state management for React
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Alembic**: Database migration tool
- **Pytest**: Python testing framework
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Frontend build tool and development server

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Both frontend and backend support live reload
- **Environment Variables**: Secure configuration through .env files
- **Database**: PostgreSQL 16 running locally

### Production Considerations
- **Autoscale Deployment**: Configured for cloud autoscaling
- **Port Configuration**: Frontend (5000), Backend (8000)
- **CORS Setup**: Configured for cross-origin requests
- **Security**: JWT authentication, input validation, SQL injection protection

### File Structure
```
├── python_backend/          # FastAPI backend
│   ├── models.py           # SQLAlchemy database models
│   ├── schemas.py          # Pydantic validation schemas
│   ├── routes/             # API endpoint modules
│   └── services/           # Business logic and AI integration
├── client/                 # React frontend
│   ├── src/pages/          # Application pages/routes
│   ├── src/components/     # Reusable UI components
│   └── src/lib/            # Utilities and helpers
└── .replit                 # Replit configuration
```

## Changelog

Changelog:
- June 18, 2025. Initial setup
- June 18, 2025. Created comprehensive Windows 11 local setup guide
- June 18, 2025. Added static deployment guide for various hosting platforms
- June 18, 2025. Created complete CRUD API documentation with examples
- June 18, 2025. Replaced OpenAI/Anthropic with Ollama for local AI processing
- June 18, 2025. Implemented local file storage system replacing AWS S3
- June 18, 2025. Created comprehensive developer guide for new pages and CRUD operations

## User Preferences

Preferred communication style: Simple, everyday language.
Deployment preference: Local Windows 11 development with static deployment options.
Documentation requirement: Complete guides for local setup, static deployment, and API usage.
AI preference: Local Ollama instead of cloud AI services for privacy and cost control.
Storage preference: Local file system instead of cloud storage services.