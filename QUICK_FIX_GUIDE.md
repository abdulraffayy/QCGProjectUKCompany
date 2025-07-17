# Quick Fix for Thunder Client Authentication

## The Problem in Your Screenshot
Your login request is failing because `/api/auth/login` expects form data, not JSON.

## Immediate Solution

### Step 1: Fix Your Login Request
Change your Thunder Client request:

**URL:** `http://localhost:8000/api/auth/login-json`
**Method:** POST
**Headers:** Content-Type: application/json
**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Step 2: Copy the Access Token
You'll get a response like:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {...}
}
```

Copy the `access_token` value.

### Step 3: Use Token in Study Materials Request
**URL:** `http://localhost:8000/api/study-materials`
**Method:** GET
**Headers:** 
- Authorization: Bearer YOUR_COPIED_TOKEN_HERE

### Step 4: Create Study Material
**URL:** `http://localhost:8000/api/study-materials`
**Method:** POST
**Headers:** 
- Authorization: Bearer YOUR_TOKEN_HERE
- Content-Type: application/json

**Body (JSON):**
```json
{
  "title": "Test Study Material",
  "description": "A test study material",
  "type": "document",
  "qaqf_level": 4,
  "content": "This is test content",
  "characteristics": ["clear", "comprehensive"]
}
```

## Thunder Client Environment Setup
1. Create Environment: "QAQF Local"
2. Add variable: `baseUrl` = `http://localhost:8000`
3. Add variable: `authToken` = `Bearer YOUR_TOKEN` (update after login)
4. Use: `{{baseUrl}}/api/study-materials` and `{{authToken}}`

## Start Backend First
Before testing, make sure Python backend is running:
```bash
cd python_backend
python main.py
```