# Thunder Client Step-by-Step Authentication Guide

## Problem: Your login is failing because the endpoint expects form data, not JSON

## Solution: Use the JSON login endpoint instead

## Step 1: Correct Login Request

**Change your URL to:**
```
POST http://localhost:8000/api/auth/login-json
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

## Step 2: Copy the Access Token

After successful login, you'll get a response like:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc1MDY4MTcwMH0.xyz...",
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

Copy the entire `access_token` value (the long string).

## Step 3: Test Study Materials with Token

**Create a new Thunder Client request:**

**URL:**
```
GET http://localhost:8000/api/study-materials
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc1MDY4MTcwMH0.xyz...
```

Replace the token with your actual token from Step 2.

## Step 4: Create Study Material

**URL:**
```
POST http://localhost:8000/api/study-materials
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "title": "QAQF Level 4 Introduction",
  "description": "Introduction to QAQF Level 4 standards",
  "type": "document",
  "qaqf_level": 4,
  "module_code": "QAQF401",
  "content": "This is the main content of the study material covering QAQF Level 4 requirements.",
  "characteristics": ["clear", "comprehensive", "practical"]
}
```

## Alternative: Form-based Login (if you prefer)

If you want to use the original login endpoint, change to form data:

**URL:**
```
POST http://localhost:8000/api/auth/login
```

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (Form URL Encoded):**
```
username=admin
password=admin123
```

## Quick Thunder Client Setup

1. Create Collection: "QAQF API Tests"
2. Create Environment: "Local Dev"
   - Variable: `baseUrl` = `http://localhost:8000`
   - Variable: `token` = `Bearer YOUR_TOKEN_HERE` (update after login)

3. Use variables:
   - URL: `{{baseUrl}}/api/auth/login-json`
   - Authorization: `{{token}}`