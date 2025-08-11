# Types Usage Examples

## 1. Basic Import Example

```typescript
// Kisi bhi file mein types import karein
import { 
  Module, 
  ModuleType, 
  Course, 
  User,
  QAQF_LEVELS 
} from '../types';
```

## 2. Component mein use karna

```typescript
import React, { useState } from 'react';
import { Module, ModuleType, QAQF_LEVELS } from '../types';

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
      <button onClick={() => onEdit(module)}>Edit</button>
    </div>
  );
};
```

## 3. State mein use karna

```typescript
import { useState } from 'react';
import { Module, ModuleFormData } from '../types';

// Array of modules
const [modules, setModules] = useState<Module[]>([]);

// Single module form data
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

## 4. Functions mein use karna

```typescript
import { Module, ApiResponse } from '../types';

// Function that returns typed data
const fetchModules = async (courseId: string): Promise<ApiResponse<Module[]>> => {
  const response = await fetch(`/api/modules?courseId=${courseId}`);
  return response.json();
};

// Function that takes typed parameters
const createModule = async (moduleData: ModuleFormData): Promise<Module> => {
  const response = await fetch('/api/modules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(moduleData)
  });
  return response.json();
};
```

## 5. API calls mein use karna

```typescript
import { AIGenerationRequest, AIGenerationResponse } from '../types';

const generateContent = async (request: AIGenerationRequest): Promise<AIGenerationResponse> => {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
};
```

## 6. Form handling mein use karna

```typescript
import { ModuleFormData, ModuleType } from '../types';

const handleFormSubmit = (formData: ModuleFormData) => {
  // Form data is already typed
  console.log('Submitting:', formData.title, formData.type);
  
  // Type safety - you can't assign invalid values
  // formData.type = 'invalid_type'; // ❌ This will give error
  formData.type = 'lecture'; // ✅ This is valid
};
```

## 7. Constants use karna

```typescript
import { QAQF_LEVELS } from '../types';

// QAQF levels dropdown
const QAQFLevelSelect = () => {
  return (
    <select>
      {Object.entries(QAQF_LEVELS).map(([level, name]) => (
        <option key={level} value={level}>
          {name}
        </option>
      ))}
    </select>
  );
};
```

## 8. Type aliases use karna

```typescript
import { Module as Lesson } from '../types';

// Ab Module ko Lesson ke naam se use kar sakte hain
const [lessons, setLessons] = useState<Lesson[]>([]);
```

## 9. Extending types

```typescript
import { Module } from '../types';

// Existing type ko extend karna
interface ExtendedModule extends Module {
  customField: string;
  metadata?: {
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  };
}
```

## 10. Union types use karna

```typescript
import { ModuleType } from '../types';

// Valid module types
const allowedTypes: ModuleType[] = ['lecture', 'practical', 'quiz'];

// Type checking
const isValidType = (type: string): type is ModuleType => {
  return allowedTypes.includes(type as ModuleType);
};
```

## Benefits

✅ **Type Safety** - Compile time errors  
✅ **IntelliSense** - Better autocomplete  
✅ **Consistency** - Sab jagah same types  
✅ **Maintainability** - Ek jagah change = sab jagah update  
✅ **Documentation** - Types serve as documentation  

## Migration Tips

1. **Find local types** in your files
2. **Replace with imports** from `../types`
3. **Update usage** to use centralized types
4. **Remove duplicate definitions**

Is tarah aap pure application mein consistent types use kar sakte hain! 🎉

