# Local Development Setup Guide for Windows 11

This guide will help you set up and run the Educational Content Platform locally on Windows 11 using Python virtual environments.

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Choose LTS version
   - Verify installation: `node --version` and `npm --version`

2. **Python** (3.10 or 3.11)
   - Download from: https://python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Verify installation: `python --version`

3. **PostgreSQL** (v14 or higher)
   - Download from: https://www.postgresql.org/download/windows/
   - Remember the password you set for the `postgres` user
   - Verify installation: `psql --version`

4. **Git** (optional but recommended)
   - Download from: https://git-scm.com/download/win

## Project Setup

### 1. Clone/Download Project
```bash
# If using Git
git clone <your-repository-url>
cd educational-content-platform

# Or download and extract the ZIP file
```

### 2. Database Setup
```bash
# Open Command Prompt or PowerShell as Administrator
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE educational_content_db;
CREATE USER edu_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE educational_content_db TO edu_user;
\q
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
# Database Configuration
DATABASE_URL=postgresql://edu_user:your_secure_password@localhost:5432/educational_content_db

# API Keys (get these from respective providers)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server Configuration
NODE_ENV=development
PORT=5000
```

### 4. Python Backend Setup
```bash
# Navigate to Python backend directory
cd python_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Initialize database (run this once)
python -c "
from database import engine
from models import Base
Base.metadata.create_all(bind=engine)
print('Database tables created successfully!')
"
```

### 5. Node.js Frontend Setup
```bash
# Navigate back to project root
cd ..

# Install Node.js dependencies
npm install

# Run database migrations
npm run db:push
```

## Running the Application

### Method 1: Full Stack (Recommended)
```bash
# From project root, start both frontend and backend
npm run dev

# This will start:
# - Frontend: http://localhost:5000
# - Backend API: http://localhost:5000/api
```

### Method 2: Separate Processes

#### Terminal 1 - Python Backend
```bash
cd python_backend
venv\Scripts\activate
python main.py

# Backend will run on: http://localhost:8000
```

#### Terminal 2 - Node.js Frontend
```bash
# From project root
npm run dev

# Frontend will run on: http://localhost:5000
```

## API Keys Setup

### OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Create account and generate API key
3. Add to `.env` file

### Anthropic API Key
1. Go to: https://console.anthropic.com/
2. Create account and generate API key
3. Add to `.env` file

## Testing the Setup

### 1. Check Database Connection
```bash
# From python_backend directory with venv activated
python test_backend.py
```

### 2. Test Frontend
1. Open browser to: http://localhost:5000
2. You should see the dashboard
3. Try creating content in different sections

### 3. Test File Upload
1. Navigate to Study Material page
2. Upload a PDF file
3. Verify it appears in the list

## Troubleshooting

### Common Issues

#### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
# Windows: Check Services (services.msc) for PostgreSQL service
# Or restart PostgreSQL service
```

#### Python Module Not Found
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall requirements
pip install -r requirements.txt
```

#### Node.js Port Already in Use
```bash
# Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

#### File Upload Issues
- Ensure `uploads` directory exists in project root
- Check file permissions
- Verify file size limits in configuration

### Database Reset (if needed)
```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate database
DROP DATABASE educational_content_db;
CREATE DATABASE educational_content_db;
GRANT ALL PRIVILEGES ON DATABASE educational_content_db TO edu_user;
\q

# Recreate tables
cd python_backend
venv\Scripts\activate
python -c "
from database import engine
from models import Base
Base.metadata.create_all(bind=engine)
"
```

## Development Workflow

### Daily Development
1. Activate Python environment: `python_backend\venv\Scripts\activate`
2. Start the application: `npm run dev`
3. Access application: http://localhost:5000

### Making Changes
- Frontend changes: Edit files in `client/src/`
- Backend changes: Edit files in `server/` or `python_backend/`
- Database changes: Update schemas in `shared/schema.ts` and run `npm run db:push`

## Production Deployment

For production deployment, consider:
1. Using environment-specific configuration
2. Setting up proper SSL certificates
3. Using a production PostgreSQL instance
4. Implementing proper security measures
5. Setting up monitoring and logging

## Support

If you encounter issues:
1. Check the logs in the terminal
2. Verify all environment variables are set
3. Ensure all services (PostgreSQL, Node.js, Python) are running
4. Check firewall settings if having connection issues

## Project Structure
```
educational-content-platform/
├── client/                 # React frontend
├── server/                # Node.js/Express backend
├── python_backend/        # FastAPI Python backend
├── shared/               # Shared TypeScript schemas
├── uploads/              # File uploads storage
├── .env                  # Environment variables
├── package.json          # Node.js dependencies
└── LOCAL_SETUP_GUIDE.md  # This guide
```