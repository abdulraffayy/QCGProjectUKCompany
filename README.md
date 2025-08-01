# QAQF Academic Content Platform

A comprehensive educational content platform built with React (TypeScript frontend) and FastAPI (Python backend). The platform facilitates the creation, verification, and management of academic content aligned with the QAQF (Quality Assurance and Qualifications Framework) standards.

## 🚀 Quick Start

### Frontend (React + TypeScript)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5000` and will automatically redirect to the login page.

### Backend (Python FastAPI)
```bash
# Navigate to backend directory
cd python_backend

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The backend API will be available at `http://localhost:8000`.

## 🔐 Authentication & Routing

### Default Landing Page
- **Unauthenticated users**: Automatically redirected to `/login`
- **Authenticated users**: Automatically redirected to `/dashboard`

### Available Routes
- `/` - Default route (redirects based on auth status)
- `/login` - Login page
- `/signup` - Registration page
- `/dashboard` - Main dashboard (requires authentication)
- `/content-generator` - AI Content Studio
- `/video-generator` - Video Generation Tool
- `/verification` - Content Verification
- `/moderation` - Content Moderation
- `/assessment` - Assessment Tools
- `/analytics` - Analytics Dashboard
- `/settings` - User Settings

## 🛠️ Features

- **AI-Powered Content Generation**: Create academic content using local Ollama AI
- **QAQF Framework Integration**: Built-in quality assurance and qualifications framework
- **Video Generation**: Create educational videos with AI assistance
- **Content Verification**: Multi-level content verification system
- **Assessment Tools**: Comprehensive assessment and marking criteria
- **Analytics Dashboard**: Track content performance and user engagement
- **Role-Based Access Control**: Different permissions for users, verifiers, and moderators

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **AI Services**: Ollama (local AI processing)
- **Authentication**: JWT-based with role management
- **File Storage**: Local filesystem storage

## 📁 Project Structure

```
rafayqcgproject/
├── src/                    # React frontend source
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts (Auth, etc.)
│   └── lib/              # Utility functions
├── python_backend/       # FastAPI backend
│   ├── routes/           # API route handlers
│   ├── models/           # Database models
│   └── services/         # Business logic
└── uploads/              # File upload storage
```

## 🔧 Development

### Default Behavior
When you start the application:
1. Navigate to `http://localhost:5000`
2. You'll be automatically redirected to the login page
3. After successful login, you'll be redirected to the dashboard

### Testing Credentials
- **Admin**: `admin/admin123`
- **User**: `user/user123`

## 📝 License

This project is developed for educational content management and quality assurance.
