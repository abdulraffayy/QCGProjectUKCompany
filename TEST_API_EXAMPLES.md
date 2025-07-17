# Quick API Testing Examples

## 1. Start Python Backend
**In a separate terminal/command prompt:**
```bash
cd python_backend
python main.py
```
Backend runs on: http://localhost:8000

**Verify it's running:**
```bash
curl http://localhost:8000/api/health
```
Expected: `{"status":"healthy","message":"Educational Content Platform API is running"}`

## 2. Test Authentication (Get Token)

**Thunder Client Setup:**
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

Body:
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

## 3. Use Token for Protected Endpoints

**Copy the access_token and use it:**
```
GET http://localhost:8000/api/study-materials
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

## 4. Create Study Material
```
POST http://localhost:8000/api/study-materials
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "title": "QAQF Level 4 Introduction",
  "description": "Basic introduction to QAQF Level 4",
  "type": "document",
  "qaqf_level": 4,
  "module_code": "QAQF401",
  "content": "This is the main content...",
  "characteristics": ["clear", "comprehensive"]
}
```

## 5. Alternative Test Credentials
- Admin: username=`admin`, password=`admin123`
- User: username=`user`, password=`user123`

## 6. If Backend Won't Start
Run database reset:
```bash
python database_reset.py
```

Then restart backend:
```bash
cd python_backend
python main.py
```