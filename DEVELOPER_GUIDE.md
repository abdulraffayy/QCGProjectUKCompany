# Developer Guide - QAQF Academic Content Platform

## Project Architecture Overview

This project uses:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL
- **AI**: Ollama (local) instead of OpenAI/Anthropic
- **File Storage**: Local filesystem instead of AWS S3

## Creating New Frontend Pages

### 1. Basic Page Structure

Create a new page in `src/pages/`:

```typescript
// src/pages/NewPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function NewPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data when component mounts
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/your-endpoint');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Page</h1>
        <p className="text-gray-600">Description of your new page</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Section</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Your page content here */}
          <p>Page content goes here</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. Add Route to App.tsx

```typescript
// src/App.tsx
import NewPage from './pages/NewPage';

// Add to your router configuration
<Route path="/new-page" component={NewPage} />
```

### 3. Add Navigation (if needed)

Update your navigation component to include the new page:

```typescript
// In your navigation component
<Link href="/new-page">New Page</Link>
```

## Creating CRUD Operations

### 1. Backend API Endpoints

Create a new route file in `python_backend/routes/`:

```python
# python_backend/routes/your_entity.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import User, YourEntity
from routes.auth import get_current_user
from schemas import YourEntityCreate, YourEntityUpdate, YourEntity as YourEntitySchema

router = APIRouter()

@router.get("/your-entities", response_model=List[YourEntitySchema])
async def get_your_entities(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all entities with pagination"""
    entities = db.query(YourEntity).offset(skip).limit(limit).all()
    return entities

@router.get("/your-entities/{entity_id}", response_model=YourEntitySchema)
async def get_your_entity(
    entity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific entity by ID"""
    entity = db.query(YourEntity).filter(YourEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found"
        )
    return entity

@router.post("/your-entities", response_model=YourEntitySchema)
async def create_your_entity(
    entity_data: YourEntityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new entity"""
    entity = YourEntity(
        **entity_data.dict(),
        created_by_user_id=current_user.id
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity

@router.put("/your-entities/{entity_id}", response_model=YourEntitySchema)
async def update_your_entity(
    entity_id: int,
    entity_data: YourEntityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing entity"""
    entity = db.query(YourEntity).filter(YourEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found"
        )
    
    # Check permissions (only owner or admin can update)
    if entity.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this entity"
        )
    
    # Update fields
    for field, value in entity_data.dict(exclude_unset=True).items():
        setattr(entity, field, value)
    
    db.commit()
    db.refresh(entity)
    return entity

@router.delete("/your-entities/{entity_id}")
async def delete_your_entity(
    entity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an entity"""
    entity = db.query(YourEntity).filter(YourEntity.id == entity_id).first()
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found"
        )
    
    # Check permissions
    if entity.created_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this entity"
        )
    
    db.delete(entity)
    db.commit()
    return {"message": "Entity deleted successfully"}
```

### 2. Database Model

Add your model to `python_backend/models.py`:

```python
# In python_backend/models.py
class YourEntity(Base):
    __tablename__ = "your_entities"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="your_entities")
```

### 3. Pydantic Schemas

Add schemas to `python_backend/schemas.py`:

```python
# In python_backend/schemas.py
class YourEntityBase(BaseModel):
    title: str
    description: Optional[str] = None

class YourEntityCreate(YourEntityBase):
    pass

class YourEntityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class YourEntity(YourEntityBase):
    id: int
    created_by_user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### 4. Frontend CRUD Component

Create a comprehensive CRUD component:

```typescript
// src/pages/YourEntityManager.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, Edit, Plus } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

interface YourEntity {
  id: number;
  title: string;
  description?: string;
  created_by_user_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function YourEntityManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<YourEntity | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Fetch entities
  const { data: entities, isLoading } = useQuery({
    queryKey: ['/api/your-entities'],
    queryFn: async () => {
      const response = await fetch('/api/your-entities');
      if (!response.ok) throw new Error('Failed to fetch entities');
      return response.json();
    },
  });

  // Create entity mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await fetch('/api/your-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create entity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/your-entities'] });
      setIsCreateOpen(false);
      form.reset();
    },
  });

  // Update entity mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof formSchema> }) => {
      const response = await fetch(`/api/your-entities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update entity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/your-entities'] });
      setEditingEntity(null);
      form.reset();
    },
  });

  // Delete entity mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/your-entities/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete entity');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/your-entities'] });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingEntity) {
      updateMutation.mutate({ id: editingEntity.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entity: YourEntity) => {
    setEditingEntity(entity);
    form.setValue('title', entity.title);
    form.setValue('description', entity.description || '');
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this entity?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading entities...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Entity Manager</h1>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Entity</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {entities?.map((entity: YourEntity) => (
          <Card key={entity.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{entity.title}</CardTitle>
                  {entity.description && (
                    <p className="text-gray-600 mt-2">{entity.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(entity)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(entity.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                Created: {new Date(entity.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntity} onOpenChange={() => setEditingEntity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entity</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingEntity(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Setting Up Ollama

### 1. Install Ollama

**Windows:**
- Download from [ollama.ai](https://ollama.ai/download)
- Run the installer

**Linux/Mac:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Install Models

```bash
# Install recommended model for educational content
ollama pull llama3.2

# Alternative models
ollama pull mistral
ollama pull codellama
```

### 3. Start Ollama Service

```bash
ollama serve
```

The service runs on `http://localhost:11434` by default.

### 4. Test Installation

```bash
# Test the API
curl http://localhost:11434/api/tags

# Test content generation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3.2", "prompt": "Generate a math lesson for grade 5", "stream": false}'
```

## File Upload Setup

The local file service automatically creates these directories:
- `uploads/images/` - Image files
- `uploads/documents/` - PDF, Word docs, etc.
- `uploads/videos/` - Video files
- `uploads/audio/` - Audio files
- `uploads/archives/` - ZIP, RAR files

### File Upload Component Example

```typescript
// src/components/FileUpload.tsx
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      setUploadedFile(result.file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
      />
      
      {uploading && <p>Uploading...</p>}
      
      {uploadedFile && (
        <div className="p-4 border rounded">
          <p>File uploaded successfully!</p>
          <p>URL: {uploadedFile.url}</p>
        </div>
      )}
    </div>
  );
}
```

## Database Migrations

When you add new models, run:

```bash
# Create migration
alembic revision --autogenerate -m "Add new entity model"

# Apply migration
alembic upgrade head
```

## Testing Your Setup

1. **Test Ollama Integration:**
   ```bash
   curl -X POST http://localhost:8000/api/generate/content \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"content_type": "lesson", "qaqf_level": 5, "subject": "Mathematics", "characteristics": ["clarity"]}'
   ```

2. **Test File Upload:**
   ```bash
   curl -X POST http://localhost:8000/api/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.jpg"
   ```

3. **Test CRUD Operations:**
   Use the API endpoints with your entity routes.

## Best Practices

1. **Error Handling:** Always wrap API calls in try-catch blocks
2. **Loading States:** Show loading indicators during async operations
3. **Validation:** Use Zod schemas for form validation
4. **Permissions:** Check user roles before allowing operations
5. **File Security:** Validate file types and sizes
6. **Database:** Use transactions for related operations
7. **Caching:** Implement proper cache invalidation with React Query

This guide covers the essentials for extending the platform. The modular structure makes it easy to add new features while maintaining consistency across the application.