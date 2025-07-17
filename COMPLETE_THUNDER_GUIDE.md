# Complete Thunder Client API Testing Guide

## Step 1: Start Python Backend Server

Open a new terminal in VS Code and run:
```bash
cd python_backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## Step 2: Verify Server is Running

Test with this Thunder Client request:
```
GET http://localhost:8000/api/health
```
Expected response: `{"status":"healthy","message":"Educational Content Platform API is running"}`

## Step 3: Login to Get Authentication Token

**Thunder Client Request:**
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

**Response Example:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NTA0NDMyODF9.abc123...",
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

## Step 4: Copy Access Token

Copy the entire `access_token` value (the long string after the colon, without quotes).

## Step 5: Test Protected Study Materials Endpoint

**Thunder Client Request:**
```
Method: GET
URL: http://localhost:8000/api/study-materials
Headers:
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NTA0NDMyODF9.abc123...
```

Replace the token with your actual token from Step 3.

## Step 6: Create New Study Material

**Thunder Client Request:**
```
Method: POST
URL: http://localhost:8000/api/study-materials
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
Body (JSON):
{
  "title": "QAQF Level 4 Mathematics",
  "description": "Introduction to mathematical concepts at QAQF Level 4",
  "type": "document",
  "qaqf_level": 4,
  "module_code": "MATH401",
  "content": "This study material covers fundamental mathematical concepts required for QAQF Level 4 certification including algebra, geometry, and basic statistics.",
  "characteristics": ["clear", "comprehensive", "practical"]
}
```

## Thunder Client Collection Setup

1. Create new collection called "QAQF API"
2. Create environment:
   - Name: "Local Development"
   - Variables:
     - `baseUrl`: `http://localhost:8000`
     - `authToken`: `Bearer YOUR_TOKEN_HERE`

3. Organize requests by folders:
   - Authentication
   - Study Materials
   - Content Generation
   - File Management

## Common API Endpoints

### Authentication
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register new user
- GET `/api/auth/me` - Get current user

### Study Materials (All require authentication)
- GET `/api/study-materials` - List all
- POST `/api/study-materials` - Create new
- GET `/api/study-materials/{id}` - Get by ID
- PUT `/api/study-materials/{id}` - Update
- DELETE `/api/study-materials/{id}` - Delete

### QAQF Framework (Public)
- GET `/api/qaqf/levels` - Get all QAQF levels
- GET `/api/qaqf/characteristics` - Get all characteristics

### Content Generation (Requires authentication)
- POST `/api/content/generate` - Generate academic content
- POST `/api/course-generator/generate` - Generate course structure

## Demo Users Available

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Can access all endpoints

**Regular User:**
- Username: `user`
- Password: `user123`
- Limited access

## Troubleshooting

**"Not authenticated" Error:**
- Verify you included `Authorization: Bearer TOKEN` header
- Check token is complete and not expired
- Login again to get fresh token

**"Connection refused" Error:**
- Make sure Python backend is running on port 8000
- Check firewall settings
- Verify URL is `http://localhost:8000`

**"422 Validation Error":**
- Check required fields in request body
- Verify JSON format is correct
- Check data types match API expectations

## API Documentation
- Interactive docs: http://localhost:8000/docs
- Raw schema: http://localhost:8000/openapi.json