# Thunder Client API Testing Guide - QAQF Educational Platform

## Setup Instructions

### 1. Install Thunder Client in VS Code
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Search for "Thunder Client"
- Install by Ranga Vadhineni

### 2. Backend Server Setup
Make sure your Python backend is running:
```bash
cd python_backend
python main.py
```
Server runs on: `http://localhost:8000`

## Authentication Flow

### Step 1: Login to Get Access Token

**Request:**
```
Method: POST
URL: http://localhost:8000/api/auth/login
Headers: 
  Content-Type: application/json
Body (JSON):
{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Step 2: Copy the Access Token
Copy the `access_token` value from the response (without quotes).

### Step 3: Use Token for Protected Endpoints
For all protected API calls, add this header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

## API Endpoints Testing

### Authentication APIs

#### 1. Login
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 2. Register New User
```
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

#### 3. Get Current User Profile
```
GET http://localhost:8000/api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Study Materials APIs (Protected)

#### 1. Get All Study Materials
```
GET http://localhost:8000/api/study-materials
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

#### 2. Create Study Material
```
POST http://localhost:8000/api/study-materials
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "title": "Introduction to QAQF Level 4",
  "description": "Comprehensive guide to QAQF Level 4 requirements",
  "type": "document",
  "qaqf_level": 4,
  "module_code": "QAQF401",
  "content": "This is the main content of the study material...",
  "characteristics": ["clear", "comprehensive", "practical"]
}
```

#### 3. Get Study Material by ID
```
GET http://localhost:8000/api/study-materials/1
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

#### 4. Update Study Material
```
PUT http://localhost:8000/api/study-materials/1
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### 5. Delete Study Material
```
DELETE http://localhost:8000/api/study-materials/1
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Content Generation APIs (Protected)

#### 1. Generate Academic Content
```
POST http://localhost:8000/api/content/generate
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "content_type": "lecture",
  "subject": "Mathematics",
  "qaqf_level": 5,
  "characteristics": ["clear", "comprehensive", "practical"],
  "additional_instructions": "Focus on practical applications"
}
```

#### 2. Generate Course Structure
```
POST http://localhost:8000/api/content/generate-course
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "subject": "Computer Science",
  "qaqf_level": 6,
  "duration_weeks": 12,
  "target_audience": "undergraduate students"
}
```

### File Upload APIs (Protected)

#### 1. Upload File
```
POST http://localhost:8000/api/files/upload
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: multipart/form-data

Form Data:
- file: [Select your file]
- category: "documents" (optional)
```

#### 2. Get File List
```
GET http://localhost:8000/api/files
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### QAQF Reference APIs (Public)

#### 1. Get QAQF Levels
```
GET http://localhost:8000/api/qaqf/levels
```

#### 2. Get QAQF Characteristics
```
GET http://localhost:8000/api/qaqf/characteristics
```

## Thunder Client Collection Setup

### Create Environment Variables
1. In Thunder Client, go to "Env" tab
2. Create new environment called "QAQF Local"
3. Add variables:
   - `baseUrl`: `http://localhost:8000`
   - `token`: `Bearer YOUR_TOKEN_HERE` (update after login)

### Use Variables in Requests
- URL: `{{baseUrl}}/api/study-materials`
- Authorization: `{{token}}`

## Common Issues & Solutions

### 1. "Not authenticated" Error
- Make sure you've logged in first
- Copy the access token correctly
- Include "Bearer " before the token
- Check token hasn't expired (24 hours)

### 2. "404 Not Found" Error
- Verify Python backend is running on port 8000
- Check the endpoint URL is correct
- Ensure database is initialized

### 3. "422 Validation Error"
- Check required fields in request body
- Verify data types match API expectations
- Review field names for typos

### 4. "500 Internal Server Error"
- Check Python backend console for error details
- Verify database connection is working
- Check if required services (Ollama) are running

## Demo Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Regular User:**
- Username: `user`  
- Password: `user123`

## Testing Workflow

1. **Start Backend**: Run Python backend server
2. **Login**: Get access token using login endpoint
3. **Set Token**: Copy token to Authorization header
4. **Test APIs**: Use token for all protected endpoints
5. **Refresh Token**: Login again when token expires

## API Documentation
- Interactive docs: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

## File Structure for Testing
```
Thunder Client Collections/
├── Auth/
│   ├── Login
│   ├── Register
│   └── Get Profile
├── Study Materials/
│   ├── Get All
│   ├── Create
│   ├── Get by ID
│   ├── Update
│   └── Delete
├── Content Generation/
│   ├── Generate Content
│   └── Generate Course
└── Files/
    ├── Upload
    └── List Files
```