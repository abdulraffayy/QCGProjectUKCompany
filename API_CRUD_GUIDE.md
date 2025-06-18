# Complete CRUD API Guide - QAQF Academic Content Platform

## API Structure Overview

### Base URLs
- **Development**: `http://localhost:8000`
- **Production**: `https://your-api-domain.com`

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication APIs

### POST /api/auth/login
**Purpose**: User login
**Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "name": "Administrator",
    "role": "admin"
  }
}
```

### POST /api/auth/register
**Purpose**: Create new user account
**Body**:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "name": "New User",
  "role": "user"
}
```

### GET /api/auth/me
**Purpose**: Get current user info
**Headers**: `Authorization: Bearer <token>`
**Response**: User object

## Content Management APIs

### GET /api/contents
**Purpose**: List all content with pagination
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `qaqf_level`: Filter by QAQF level (1-9)
- `type`: Filter by content type
- `status`: Filter by verification status

**Response**:
```json
{
  "items": [
    {
      "id": 1,
      "title": "Introduction to Mathematics",
      "description": "Basic mathematical concepts",
      "type": "lesson",
      "qaqf_level": 3,
      "verification_status": "verified",
      "created_at": "2025-01-01T10:00:00Z",
      "creator": {
        "id": 1,
        "name": "Teacher Name"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10
}
```

### POST /api/contents
**Purpose**: Create new content
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
  "title": "New Lesson",
  "description": "Lesson description",
  "type": "lesson",
  "qaqf_level": 5,
  "module_code": "MATH101",
  "content": "Lesson content here...",
  "characteristics": [
    {"name": "clarity", "score": 8},
    {"name": "completeness", "score": 9}
  ]
}
```

### GET /api/contents/{id}
**Purpose**: Get specific content by ID
**Response**: Single content object with full details

### PUT /api/contents/{id}
**Purpose**: Update existing content
**Headers**: `Authorization: Bearer <token>`
**Body**: Same as POST, partial updates allowed

### DELETE /api/contents/{id}
**Purpose**: Delete content
**Headers**: `Authorization: Bearer <token>`
**Response**: `{"message": "Content deleted successfully"}`

## QAQF Framework APIs

### GET /api/qaqf/levels
**Purpose**: Get all QAQF levels (1-9)
**Response**:
```json
[
  {
    "id": 1,
    "level": 1,
    "name": "Basic Foundation",
    "description": "Fundamental knowledge and skills"
  },
  {
    "id": 2,
    "level": 2,
    "name": "Basic Operational",
    "description": "Basic operational skills"
  }
]
```

### GET /api/qaqf/characteristics
**Purpose**: Get all quality characteristics
**Response**:
```json
[
  {
    "id": 1,
    "name": "clarity",
    "description": "Clear and understandable content",
    "category": "presentation"
  },
  {
    "id": 2,
    "name": "completeness",
    "description": "Comprehensive coverage of topic",
    "category": "content"
  }
]
```

## Content Generation APIs

### POST /api/generate/content
**Purpose**: AI-powered content generation
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
  "content_type": "lesson",
  "qaqf_level": 5,
  "subject": "Mathematics",
  "characteristics": ["clarity", "completeness"],
  "additional_instructions": "Focus on practical examples",
  "source_type": "internal",
  "source_content": "Optional source material"
}
```
**Response**:
```json
{
  "title": "Generated Lesson Title",
  "content": "Generated lesson content...",
  "module_code": "MATH101"
}
```

### POST /api/generate/course
**Purpose**: Generate complete course structure
**Body**:
```json
{
  "subject": "Data Science",
  "qaqf_level": 7,
  "duration_weeks": 12,
  "target_audience": "graduate students"
}
```

### POST /api/verify/content
**Purpose**: Verify content against QAQF standards
**Body**:
```json
{
  "content": "Content to verify...",
  "qaqf_level": 5
}
```
**Response**:
```json
{
  "score": 85,
  "feedback": "Content meets most requirements...",
  "characteristics": {
    "clarity": 8,
    "completeness": 9,
    "accuracy": 7
  }
}
```

## User Management APIs (Admin Only)

### GET /api/admin/users
**Purpose**: List all users
**Headers**: `Authorization: Bearer <admin-token>`
**Query Parameters**: `page`, `limit`, `role`, `status`

### PUT /api/admin/users/{id}
**Purpose**: Update user details/role
**Body**:
```json
{
  "role": "admin",
  "is_active": true
}
```

### DELETE /api/admin/users/{id}
**Purpose**: Deactivate user account

## Analytics APIs

### GET /api/analytics/dashboard
**Purpose**: Get dashboard statistics
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "content_count": 150,
  "verified_content_count": 120,
  "pending_verification_count": 30,
  "user_count": 45,
  "recent_activity": [...]
}
```

### GET /api/analytics/content-performance
**Purpose**: Content performance metrics
**Query Parameters**: `start_date`, `end_date`, `content_id`

## File Upload APIs

### POST /api/upload/file
**Purpose**: Upload files (documents, images)
**Headers**: `Authorization: Bearer <token>`
**Body**: `multipart/form-data`
**Response**:
```json
{
  "file_url": "https://storage.com/uploads/file.pdf",
  "file_name": "document.pdf",
  "file_size": 1024000
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Contents Table
```sql
CREATE TABLE contents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    qaqf_level INTEGER NOT NULL CHECK (qaqf_level >= 1 AND qaqf_level <= 9),
    module_code VARCHAR(50),
    created_by_user_id INTEGER REFERENCES users(id),
    verification_status VARCHAR(20) DEFAULT 'pending',
    verified_by_user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    characteristics JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### QAQF Tables
```sql
CREATE TABLE qaqf_levels (
    id SERIAL PRIMARY KEY,
    level INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE qaqf_characteristics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL
);
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": "validation_error",
  "message": "Invalid input data",
  "details": {
    "field": "qaqf_level",
    "issue": "Must be between 1 and 9"
  },
  "status_code": 400
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Testing the APIs

### Using curl
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get contents (with token)
curl -X GET http://localhost:8000/api/contents \
  -H "Authorization: Bearer <your-token>"

# Create content
curl -X POST http://localhost:8000/api/contents \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Content",
    "description": "Test description",
    "type": "lesson",
    "qaqf_level": 5,
    "content": "Test content...",
    "characteristics": []
  }'
```

### Using Python requests
```python
import requests

# Login
response = requests.post("http://localhost:8000/api/auth/login", 
                        json={"username": "admin", "password": "admin123"})
token = response.json()["access_token"]

# Use token for authenticated requests
headers = {"Authorization": f"Bearer {token}"}
contents = requests.get("http://localhost:8000/api/contents", headers=headers)
```

## Frontend Integration Examples

### React with Axios
```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Content operations
export const contentAPI = {
  getAll: (params) => apiClient.get('/api/contents', { params }),
  getById: (id) => apiClient.get(`/api/contents/${id}`),
  create: (data) => apiClient.post('/api/contents', data),
  update: (id, data) => apiClient.put(`/api/contents/${id}`, data),
  delete: (id) => apiClient.delete(`/api/contents/${id}`),
};
```

### React Query Integration
```typescript
// hooks/useContent.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentAPI } from '../api/client';

export const useContents = (params) => {
  return useQuery({
    queryKey: ['contents', params],
    queryFn: () => contentAPI.getAll(params),
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: contentAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
};
```