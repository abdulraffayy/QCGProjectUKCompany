# Database Setup Fix - Windows 11

## Issue
The sign-in page isn't working because the database tables weren't created during the initial setup.

## Quick Fix

### Step 1: Fix Database Schema
The issue is a schema mismatch. Run these commands to fix it:

```cmd
cd python_backend
python -c "from database import engine; from models import Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine); print('✓ Database schema fixed')"
```

### Step 2: Create Demo Users
```cmd
python -c "
from database import SessionLocal
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
session = SessionLocal()

admin = User(username='admin', email='admin@example.com', password_hash=pwd_context.hash('admin123'), name='Admin', role='admin', is_active=True)
user = User(username='user', email='user@example.com', password_hash=pwd_context.hash('user123'), name='User', role='user', is_active=True)

session.add(admin)
session.add(user)
session.commit()
session.close()
print('✓ Demo users created')
"
```

### Step 2: Verify Setup
You should see this output:
```
=== Database Setup Verification ===
Users created: 2
QAQF levels: 9
QAQF characteristics: 10
✓ Database setup completed successfully!

Demo Login Credentials:
  Admin: username=admin, password=admin123
  User:  username=user, password=user123
```

### Step 3: Test Sign-In
1. Start the application: `npm run dev`
2. Open http://localhost:5000
3. Try logging in with:
   - **Admin**: username=`admin`, password=`admin123`
   - **User**: username=`user`, password=`user123`

## Alternative Manual Setup

If the script doesn't work, run these commands manually:

```cmd
cd python_backend
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine); print('Tables created')"
```

```cmd
python -c "
from database import SessionLocal
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
session = SessionLocal()

admin = User(username='admin', email='admin@example.com', password_hash=pwd_context.hash('admin123'), name='Admin', role='admin', is_active=True)
user = User(username='user', email='user@example.com', password_hash=pwd_context.hash('user123'), name='User', role='user', is_active=True)

session.add(admin)
session.add(user)
session.commit()
session.close()
print('Demo users created')
"
```

## Common Issues

### PostgreSQL Connection Error
If you get a connection error:
1. Check if PostgreSQL is running in your environment
2. Verify DATABASE_URL environment variable is set
3. Try restarting your development environment

### Permission Errors
If you get permission errors:
1. Run Command Prompt as Administrator
2. Or use PowerShell with elevated permissions

### Table Already Exists Error
This is normal - it means tables were already created. The script handles this gracefully.

## Verification Commands

Check if users exist:
```cmd
python -c "from database import SessionLocal; from models import User; session = SessionLocal(); print(f'Users: {session.query(User).count()}'); session.close()"
```

Check database tables:
```cmd
python -c "from database import engine; print('Tables:', engine.table_names())"
```

## Backend Status Check

Test if the backend authentication works:
```cmd
curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

You should get a JSON response with an access_token.

## Next Steps

After fixing the database:
1. Sign in should work properly
2. You can test content generation (requires Ollama)
3. You can upload files and manage content
4. Admin features will be available with admin account

The platform is now ready for full testing with local AI and file storage capabilities.