# Centralized Options Usage Examples

## 1. Module Type Options

### Import karein:
```typescript
import { MODULE_TYPE_OPTIONS, ModuleType } from '../types';
```

### Select dropdown mein use karein:
```typescript
<select value={selectedType} onChange={e => setSelectedType(e.target.value as ModuleType)}>
  {Object.entries(MODULE_TYPE_OPTIONS).map(([value, label]) => (
    <option key={value} value={value}>{label}</option>
  ))}
</select>
```

### Display name get karein:
```typescript
const getModuleTypeName = (type: ModuleType) => {
  return MODULE_TYPE_OPTIONS[type];
};

// Usage
console.log(getModuleTypeName('lecture')); // "Lecture"
console.log(getModuleTypeName('case_study')); // "Case Study"
```

## 2. QAQF Levels

### Import karein:
```typescript
import { QAQF_LEVELS } from '../types';
```

### Select dropdown mein use karein:
```typescript
<select value={selectedLevel} onChange={e => setSelectedLevel(Number(e.target.value))}>
  {Object.entries(QAQF_LEVELS).map(([level, name]) => (
    <option key={level} value={level}>{name}</option>
  ))}
</select>
```

### Level name get karein:
```typescript
const getQAQFLevelName = (level: number) => {
  return QAQF_LEVELS[level] || 'Unknown';
};

// Usage
console.log(getQAQFLevelName(1)); // "Entry"
console.log(getQAQFLevelName(5)); // "Advanced"
```

## 3. Complete Component Example

```typescript
import React, { useState } from 'react';
import { MODULE_TYPE_OPTIONS, QAQF_LEVELS, ModuleType } from '../types';

const ModuleForm: React.FC = () => {
  const [moduleType, setModuleType] = useState<ModuleType>('lecture');
  const [qaqfLevel, setQaqfLevel] = useState(1);

  return (
    <div className="space-y-4">
      {/* Module Type Select */}
      <div>
        <label>Module Type:</label>
        <select 
          value={moduleType} 
          onChange={e => setModuleType(e.target.value as ModuleType)}
          className="border rounded px-2 py-1 w-full"
        >
          {Object.entries(MODULE_TYPE_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* QAQF Level Select */}
      <div>
        <label>QAQF Level:</label>
        <select 
          value={qaqfLevel} 
          onChange={e => setQaqfLevel(Number(e.target.value))}
          className="border rounded px-2 py-1 w-full"
        >
          {Object.entries(QAQF_LEVELS).map(([level, name]) => (
            <option key={level} value={level}>{name}</option>
          ))}
        </select>
      </div>

      {/* Display selected values */}
      <div>
        <p>Selected Type: {MODULE_TYPE_OPTIONS[moduleType]}</p>
        <p>Selected Level: {QAQF_LEVELS[qaqfLevel]}</p>
      </div>
    </div>
  );
};
```

## 4. Validation Example

```typescript
import { ModuleType, MODULE_TYPE_OPTIONS } from '../types';

const isValidModuleType = (type: string): type is ModuleType => {
  return type in MODULE_TYPE_OPTIONS;
};

const handleTypeChange = (type: string) => {
  if (isValidModuleType(type)) {
    setModuleType(type); // Type is now guaranteed to be ModuleType
  } else {
    console.error('Invalid module type:', type);
  }
};
```

## 5. Mapping Example

```typescript
import { MODULE_TYPE_OPTIONS, ModuleType } from '../types';

// Get all module types as array
const moduleTypes: ModuleType[] = Object.keys(MODULE_TYPE_OPTIONS) as ModuleType[];

// Get all display names as array
const moduleTypeNames: string[] = Object.values(MODULE_TYPE_OPTIONS);

// Create options for a form library
const moduleTypeOptions = Object.entries(MODULE_TYPE_OPTIONS).map(([value, label]) => ({
  value,
  label
}));
```

## 6. Benefits

✅ **Centralized Management** - Ek jagah change = sab jagah update  
✅ **Type Safety** - TypeScript ensures valid values  
✅ **Consistency** - Sab jagah same names  
✅ **Maintainability** - Easy to add/remove options  
✅ **Reusability** - Pure application mein use kar sakte hain  

## 7. Adding New Options

### Types file mein add karein:
```typescript
// src/types/index.ts
export type ModuleType = 
  | "lecture" 
  | "practical" 
  | "seminar" 
  | "activity" 
  | "case_study" 
  | "quiz" 
  | "exam" 
  | "assignment"
  | "workshop"; // New option

export const MODULE_TYPE_OPTIONS: { [key in ModuleType]: string } = {
  lecture: "Lecture",
  practical: "Practical",
  seminar: "Seminar", 
  activity: "Activity",
  case_study: "Case Study",
  quiz: "Quiz",
  exam: "Exam",
  assignment: "Assignment",
  workshop: "Workshop" // New option
};
```

### Automatically available everywhere! 🎉

Is tarah aap pure application mein consistent options use kar sakte hain!

