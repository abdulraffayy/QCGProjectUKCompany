# API CRUD Guide - QAQF Academic Content Platform

## Overview

This guide provides complete examples for using the platform's API endpoints with Ollama integration and local file storage.

## Authentication

All API endpoints require authentication except login and registration.

### Get Access Token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
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

### Use Token in Requests
```bash
export TOKEN="your_access_token_here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/endpoint
```

## Content Generation (Ollama Integration)

### Generate Educational Content
```bash
curl -X POST http://localhost:8000/api/generate/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "lesson",
    "qaqf_level": 5,
    "subject": "Mathematics",
    "characteristics": ["clarity", "completeness", "accuracy"],
    "additional_instructions": "Focus on algebra basics for beginners",
    "source_content": "Cover linear equations and graphing"
  }'
```

Response:
```json
{
  "title": "Mathematics - Level 5 Lesson",
  "content": "# Mathematics - QAQF Level 5\n\n## Learning Objectives...",
  "module_code": "MAT051"
}
```

### Verify Content Quality
```bash
curl -X POST http://localhost:8000/api/verify/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your educational content here...",
    "qaqf_level": 5
  }'
```

Response:
```json
{
  "score": 85,
  "feedback": "Content analysis for QAQF Level 5: Well-structured and appropriate for the level",
  "characteristics": {
    "clarity": 8,
    "completeness": 9,
    "accuracy": 8,
    "coherence": 8,
    "appropriateness": 9
  }
}
```

### Check British Standards Compliance
```bash
curl -X POST http://localhost:8000/api/verify/british-standards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your content to check for British standards compliance"
  }'
```

Response:
```json
{
  "compliant": true,
  "issues": [],
  "suggestions": ["Content appears to follow British standards"]
}
```

## Content Management CRUD

### Create Content
```bash
curl -X POST http://localhost:8000/api/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Algebra",
    "description": "Basic algebra concepts for QAQF Level 5",
    "type": "lesson",
    "qaqf_level": 5,
    "module_code": "MAT051",
    "content": "# Algebra Basics\n\nThis lesson covers...",
    "characteristics": ["clarity", "completeness", "accuracy"]
  }'
```

### Get All Content
```bash
curl -X GET "http://localhost:8000/api/content?skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Specific Content
```bash
curl -X GET http://localhost:8000/api/content/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update Content
```bash
curl -X PUT http://localhost:8000/api/content/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Algebra Introduction",
    "description": "Enhanced algebra concepts"
  }'
```

### Delete Content
```bash
curl -X DELETE http://localhost:8000/api/content/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Approve Content (Admin Only)
```bash
curl -X POST http://localhost:8000/api/content/1/approve \
  -H "Authorization: Bearer $TOKEN"
```

## File Upload and Management

### Upload File
```bash
curl -X POST http://localhost:8000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "category=documents"
```

Response:
```json
{
  "message": "File uploaded successfully",
  "file": {
    "name": "file.pdf",
    "filename": "uuid-generated-name.pdf",
    "path": "documents/uuid-generated-name.pdf",
    "url": "/uploads/documents/uuid-generated-name.pdf",
    "size": 1048576,
    "mime_type": "application/pdf",
    "category": "documents",
    "uploaded_by": 1,
    "uploaded_at": "2025-06-18T15:30:00Z",
    "hash": "md5-hash-here"
  }
}
```

### List Files
```bash
curl -X GET "http://localhost:8000/api/list?category=documents" \
  -H "Authorization: Bearer $TOKEN"
```

### Get File Information
```bash
curl -X GET http://localhost:8000/api/info/documents/filename.pdf \
  -H "Authorization: Bearer $TOKEN"
```

### Delete File
```bash
curl -X DELETE http://localhost:8000/api/delete/documents/filename.pdf \
  -H "Authorization: Bearer $TOKEN"
```

### Get Storage Statistics (Admin Only)
```bash
curl -X GET http://localhost:8000/api/stats \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "total_files": 25,
  "total_size": 52428800,
  "categories": {
    "images": {"file_count": 10, "size": 20971520},
    "documents": {"file_count": 8, "size": 15728640},
    "videos": {"file_count": 3, "size": 10485760},
    "audio": {"file_count": 2, "size": 3145728},
    "archives": {"file_count": 2, "size": 2097152}
  }
}
```

## User Management

### Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "new-email@example.com"
  }'
```

### Change Password
```bash
curl -X POST http://localhost:8000/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "current_password",
    "new_password": "new_secure_password"
  }'
```

## Analytics and Reporting

### Get Content Statistics
```bash
curl -X GET http://localhost:8000/api/analytics/content-stats \
  -H "Authorization: Bearer $TOKEN"
```

### Get User Activity
```bash
curl -X GET "http://localhost:8000/api/analytics/user-activity?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

### Get QAQF Compliance Report
```bash
curl -X GET http://localhost:8000/api/analytics/qaqf-compliance \
  -H "Authorization: Bearer $TOKEN"
```

## Video Generation

### Generate Video Metadata
```bash
curl -X POST http://localhost:8000/api/videos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Algebra Basics Video",
    "description": "Visual explanation of algebra concepts",
    "qaqf_level": 5,
    "module_code": "MAT051",
    "animation_style": "2D",
    "duration": "10 minutes",
    "characteristics": ["visual", "interactive", "engaging"]
  }'
```

## Study Materials

### Create Study Material
```bash
curl -X POST http://localhost:8000/api/study-materials \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Algebra Reference Guide",
    "description": "Quick reference for algebra formulas",
    "type": "document",
    "qaqf_level": 5,
    "module_code": "MAT051",
    "content": "Formula reference content...",
    "characteristics": ["reference", "comprehensive"],
    "tags": ["algebra", "formulas", "reference"]
  }'
```

### Upload Study Material File
```bash
curl -X POST http://localhost:8000/api/study-materials \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Algebra Worksheet",
    "description": "Practice problems for algebra",
    "type": "document",
    "qaqf_level": 5,
    "file_url": "/uploads/documents/algebra-worksheet.pdf",
    "file_name": "algebra-worksheet.pdf",
    "file_size": 1048576,
    "characteristics": ["practice", "interactive"]
  }'
```

## Collections

### Create Collection
```bash
curl -X POST http://localhost:8000/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Algebra Complete Course",
    "description": "All materials for algebra course",
    "is_public": false,
    "material_ids": [1, 2, 3, 4]
  }'
```

## Templates

### Create Template
```bash
curl -X POST http://localhost:8000/api/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Standard Lesson Plan",
    "description": "Template for creating lesson plans",
    "type": "lesson_plan",
    "qaqf_level": 5,
    "content_structure": {
      "sections": ["objectives", "content", "activities", "assessment"],
      "duration": "60 minutes",
      "resources": []
    },
    "is_public": true
  }'
```

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Could not validate credentials"
}
```

**403 Forbidden:**
```json
{
  "detail": "Not enough permissions"
}
```

**404 Not Found:**
```json
{
  "detail": "Content not found"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "qaqf_level"],
      "msg": "ensure this value is greater than or equal to 1",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

**503 Service Unavailable (Ollama not running):**
```json
{
  "detail": "Ollama service is not available. Please ensure Ollama is running on localhost:11434"
}
```

## Testing with Different Users

### Admin User (Full Access)
```bash
# Login as admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Regular User (Limited Access)
```bash
# Login as user
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "user123"}'
```

## Batch Operations

### Bulk Content Upload
```bash
# Create multiple content items
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/content \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Test Content $i\",
      \"description\": \"Test description $i\",
      \"type\": \"lesson\",
      \"qaqf_level\": $((i % 9 + 1)),
      \"content\": \"Test content body $i\",
      \"characteristics\": [\"clarity\", \"completeness\"]
    }"
done
```

This guide provides comprehensive examples for all major API operations. The platform automatically handles Ollama integration and falls back gracefully when the service is unavailable.