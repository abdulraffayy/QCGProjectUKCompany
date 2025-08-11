# Centralized Types System

## Overview

Ye centralized types system aapke React TypeScript project mein consistency maintain karne ke liye banaya gaya hai. Sab types ek jagah define hain aur pure application mein reuse ho sakte hain.

## File Structure

```
src/
├── types/
│   ├── index.ts          # Main types file
│   └── README.md         # This file
```

## How to Use

### 1. Import Types

Kisi bhi file mein types import karne ke liye:

```typescript
import { 
  Module, 
  ModuleType, 
  Course, 
  User,
  QAQF_LEVELS 
} from '../types';
```

### 2. Use Types in Components

```typescript
import React from 'react';
import { Module, ModuleType } from '../types';

interface ModuleCardProps {
  module: Module;
  onEdit: (module: Module) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onEdit }) => {
  return (
    <div>
      <h3>{module.title}</h3>
      <p>Type: {module.type}</p>
      <p>QAQF Level: {QAQF_LEVELS[module.qaqfLevel]}</p>
    </div>
  );
};
```

### 3. Use Types in State

```typescript
import { useState } from 'react';
import { Module, ModuleFormData } from '../types';

const [modules, setModules] = useState<Module[]>([]);
const [formData, setFormData] = useState<ModuleFormData>({
  title: '',
  type: 'lecture',
  duration: '',
  qaqfLevel: 1,
  level: 1,
  description: '',
  courseid: '',
  userid: ''
});
```

### 4. Use Types in Functions

```typescript
import { Module, ApiResponse } from '../types';

const fetchModules = async (courseId: string): Promise<ApiResponse<Module[]>> => {
  const response = await fetch(`/api/modules?courseId=${courseId}`);
  return response.json();
};
```

## Available Types

### Basic Entity Types
- `SimpleCourse` - Basic course info
- `SimpleWeek` - Basic week info  
- `SimpleLesson` - Basic lesson info

### Module/Lesson Types
- `Module` - Complete module data
- `ModuleType` - Module type union
- `ModuleFormData` - Form data for modules

### Course Types
- `Course` - Complete course data
- `CourseFormData` - Form data for courses

### Week Types
- `Week` - Complete week data
- `WeekFormData` - Form data for weeks

### QAQF Types
- `QAQFLevel` - QAQF level data
- `QAQFCharacteristic` - QAQF characteristics
- `QAQF_LEVELS` - QAQF level constants

### AI Generation Types
- `AIGenerationRequest` - AI generation request
- `AIGenerationResponse` - AI generation response

### Content Types
- `Content` - Content data
- `ContentType` - Content type union

### Assessment Types
- `Assessment` - Assessment data
- `AssessmentType` - Assessment type union
- `AssessmentQuestion` - Assessment question
- `AssessmentCriteria` - Assessment criteria

### User & Auth Types
- `User` - User data
- `UserRole` - User role union
- `AuthContextType` - Auth context type

### API Response Types
- `ApiResponse<T>` - Generic API response
- `PaginatedResponse<T>` - Paginated API response

### Utility Types
- `FormState` - Form state
- `DialogState` - Dialog state
- `SortDirection` - Sort direction
- `FilterConfig` - Filter configuration

## Adding New Types

### 1. Add to index.ts

```typescript
// Add your new type
export interface NewType {
  id: number;
  name: string;
  description: string;
}

// Add to exports if needed
export type {
  NewType as NewTypeAlias,
};
```

### 2. Import and Use

```typescript
import { NewType } from '../types';

const [data, setData] = useState<NewType[]>([]);
```

## Best Practices

### 1. Always Use Centralized Types
❌ Don't define types locally:
```typescript
interface LocalType { ... } // Avoid this
```

✅ Use centralized types:
```typescript
import { Module } from '../types';
```

### 2. Use Type Aliases for Clarity
```typescript
import { Module as Lesson } from '../types';

const [lessons, setLessons] = useState<Lesson[]>([]);
```

### 3. Extend Types When Needed
```typescript
import { Module } from '../types';

interface ExtendedModule extends Module {
  customField: string;
}
```

### 4. Use Union Types for Flexibility
```typescript
import { ModuleType } from '../types';

const allowedTypes: ModuleType[] = ['lecture', 'practical', 'quiz'];
```

## Migration Guide

### From Local Types to Centralized

1. **Find local type definitions**
```typescript
// Old way
interface LocalModule {
  id: number;
  title: string;
}
```

2. **Replace with import**
```typescript
// New way
import { Module } from '../types';
```

3. **Update usage**
```typescript
// Old
const [modules, setModules] = useState<LocalModule[]>([]);

// New  
const [modules, setModules] = useState<Module[]>([]);
```

## Benefits

✅ **Consistency** - Sab jagah same types  
✅ **Maintainability** - Ek jagah change karo, sab jagah reflect hoga  
✅ **Type Safety** - Better TypeScript support  
✅ **Reusability** - Types ko reuse kar sakte hain  
✅ **Documentation** - Types serve as documentation  
✅ **IDE Support** - Better autocomplete and error detection  

## Examples

### Complete Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { 
  Module, 
  ModuleType, 
  Course, 
  QAQF_LEVELS,
  ApiResponse 
} from '../types';

interface ModuleListProps {
  courseId: string;
  onModuleSelect: (module: Module) => void;
}

const ModuleList: React.FC<ModuleListProps> = ({ courseId, onModuleSelect }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const response: ApiResponse<Module[]> = await fetch(`/api/modules/${courseId}`);
        setModules(response.data);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  return (
    <div>
      {modules.map((module) => (
        <div key={module.id} onClick={() => onModuleSelect(module)}>
          <h3>{module.title}</h3>
          <p>Type: {module.type}</p>
          <p>QAQF Level: {QAQF_LEVELS[module.qaqfLevel]}</p>
        </div>
      ))}
    </div>
  );
};

export default ModuleList;
```

Is tarah aap pure application mein consistent types use kar sakte hain!

