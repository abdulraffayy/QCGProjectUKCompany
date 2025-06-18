# Educational Content Platform - QAQF Framework

## Overview

The Educational Content Platform is a comprehensive full-stack application designed to generate, manage, and verify academic content using the QAQF (Quality Assessment & Qualification Framework) framework. The platform supports AI-powered content generation with multiple AI providers, course creation, assessment tools, and content verification workflows.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Primary Backend**: Node.js/TypeScript with Express.js
- **Alternative Backend**: Python FastAPI (complete migration available)
- **Database**: PostgreSQL with Drizzle ORM (Node.js) / SQLAlchemy (Python)
- **API Design**: RESTful endpoints with proper error handling
- **File Processing**: Multer for file uploads and content extraction

### Data Storage
- **Database**: PostgreSQL as primary database
- **ORM**: Drizzle Kit for schema management and migrations
- **Schema**: Comprehensive schema supporting users, content, QAQF levels, characteristics, activities, and verification workflows

## Key Components

### AI Integration Services
- **OpenAI**: Primary AI service for content generation using GPT-4o
- **Anthropic**: Claude 3.5 Sonnet integration as alternative AI provider
- **Ollama**: Local/self-hosted AI integration for cost-effective content generation
- **Fallback System**: Structured content generation when AI services are unavailable

### QAQF Framework Implementation
- **9 Levels**: Progressive quality levels from basic to 21st Century Innovation
- **9 Characteristics**: Comprehensive quality characteristics for educational content
- **Verification System**: Multi-stage content verification against QAQF standards
- **British Standards Compliance**: Automated checking for UK academic standards

### Content Management System
- **Content Types**: Support for academic papers, assessments, videos, lectures, and courses
- **Batch Processing**: Bulk content operations and management
- **Version Control**: Content versioning and update tracking
- **Template System**: Reusable content templates and course structures

### Assessment & Analytics
- **Assessment Builder**: QAQF-aligned assessment creation tools
- **Marking Criteria**: Automated generation of marking rubrics
- **Analytics Dashboard**: Comprehensive content and usage analytics
- **Quality Assurance**: Multi-tier quality checking and verification

## Data Flow

### Content Generation Flow
1. User selects content type, QAQF level, and characteristics
2. Optional source content upload (PDF, DOCX, images with OCR)
3. AI service processes request with QAQF compliance requirements
4. Generated content undergoes automated British standards checking
5. Content enters verification workflow for manual review
6. Approved content becomes available in content library

### Verification Workflow
1. Content submitted for verification with QAQF level assignment
2. Automated checks for format, structure, and basic compliance
3. Manual review by verified educators or administrators
4. Feedback loop for content improvements
5. Final approval and publishing to content library

### Course Generation Flow
1. Course parameters specified (title, audience, duration, objectives)
2. AI generates comprehensive course structure with modules and lessons
3. Learning outcomes and assessment strategies automatically created
4. Course content aligned with specified QAQF levels
5. Integration with existing content library for resource recommendations

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o for advanced content generation
- **Anthropic API**: Claude for alternative AI processing
- **Ollama API**: Local AI model hosting (optional)

### Database & Infrastructure
- **PostgreSQL**: Primary database server
- **Node.js Runtime**: Server-side JavaScript execution
- **Python Runtime**: Alternative backend implementation

### File Processing
- **PDF Processing**: Content extraction from PDF documents
- **OCR Capabilities**: Text extraction from images using Tesseract
- **Document Processing**: Support for DOCX and other document formats

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit cloud development
- **Local Development**: Windows 11 setup guides with automated scripts
- **Hot Reload**: Vite HMR for frontend, nodemon for backend

### Production Deployment
- **Containerization**: Docker support for consistent deployments
- **Autoscaling**: Configured for autoscale deployment target
- **Environment Variables**: Comprehensive environment configuration
- **Database Migrations**: Automated schema updates with Drizzle

### Monitoring & Logging
- **Request Logging**: Detailed API request/response logging
- **Error Handling**: Comprehensive error boundaries and reporting
- **Performance Monitoring**: Built-in performance tracking
- **User Activity**: Complete audit trail for content operations

## Changelog

```
Changelog:
- June 18, 2025: Initial setup
- June 18, 2025: Fixed Windows 11 compatibility issues
  * Resolved WebSocket connection errors (wss://localhost/v2 ECONNREFUSED)
  * Fixed network binding issues (ENOTSUP on 0.0.0.0:5000)
  * Replaced Ollama WebSocket dependencies with local content generation
  * Created content-generator.ts for offline development
  * Updated server to use localhost binding on Windows platform
- June 18, 2025: Completely resolved WebSocket connection issues
  * Identified root cause: Drizzle ORM Neon database WebSocket integration
  * Replaced Neon WebSocket database with standard PostgreSQL connection
  * Removed @neondatabase/serverless and ws packages
  * Added pg and @types/pg for standard PostgreSQL support
  * API now returns HTTP 200, all endpoints functional
  * Local Windows development environment fully operational
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```