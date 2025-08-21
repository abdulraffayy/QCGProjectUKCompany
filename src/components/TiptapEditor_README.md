# Enhanced TiptapEditor Component

## Overview

The Enhanced TiptapEditor is a powerful rich text editor component built with Tiptap that includes advanced text selection and AI explanation features. It provides an intuitive interface for content creation with built-in AI assistance.

## ✨ Key Features

### 🎯 Smart Text Selection
- **Intelligent Selection Detection**: Automatically detects when text is selected
- **Context-Aware Popup**: Shows relevant options based on selection
- **Position Tracking**: Maintains cursor position during content updates

### 🤖 AI Explanation System
- **Multiple Explanation Types**:
  - 💡 **Explain**: Simple, clear explanations
  - 📝 **Summary**: Concise overviews
  - 🔍 **Detailed**: Comprehensive analysis
  - 📋 **Examples**: Practical examples and use cases

- **Quick Actions**: One-click buttons for instant explanations
- **Customizable Requests**: Support for custom explanation prompts

### 🎨 Rich Text Editing
- **Full Formatting Support**: Bold, italic, underline, strikethrough
- **Bubble Menu**: Context-sensitive formatting toolbar
- **Floating Menu**: Command palette for advanced features
- **Placeholder Support**: Customizable placeholder text

## 🚀 Usage

### Basic Implementation

```tsx
import TiptapEditor from './components/TiptapEditor';

const MyComponent = () => {
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');

  // Handle text selection
  const handleTextSelection = (text: string) => {
    setSelectedText(text);
    console.log('Selected:', text);
  };

  // Handle AI explanation request
  const handleAiExplanationRequest = (text: string, explanationType?: string) => {
    console.log('AI Request:', text, 'Type:', explanationType);
    // Implement your AI logic here
  };

  return (
    <TiptapEditor
      content={content}
      onContentChange={setContent}
      onTextSelection={handleTextSelection}
      onAiExplanationRequest={handleAiExplanationRequest}
      placeholder="Start typing here..."
      className="min-h-[400px]"
    />
  );
};
```

### Advanced Implementation with Editor Reference

```tsx
import { useRef } from 'react';
import TiptapEditor from './components/TiptapEditor';

const AdvancedComponent = () => {
  const editorRef = useRef(null);
  const [content, setContent] = useState('');

  const handleAiExplanationRequest = async (text: string, explanationType?: string) => {
    try {
      // Make API call to your AI service
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: explanationType })
      });
      
      const result = await response.json();
      
      // Insert AI response into editor
      if (editorRef.current) {
        editorRef.current.insertContent(`\n\n**AI Explanation (${explanationType}):**\n${result.explanation}`);
      }
    } catch (error) {
      console.error('AI request failed:', error);
    }
  };

  return (
    <TiptapEditor
      content={content}
      onContentChange={setContent}
      onAiExplanationRequest={handleAiExplanationRequest}
      editorRef={editorRef}
      placeholder="Enhanced editor with AI features..."
    />
  );
};
```

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `''` | Current editor content |
| `onContentChange` | `(content: string) => void` | - | Callback when content changes |
| `onTextSelection` | `(selectedText: string) => void` | - | Callback when text is selected |
| `onAiExplanationRequest` | `(selectedText: string, explanationType?: string) => void` | - | Callback for AI explanation requests |
| `onReady` | `() => void` | - | Callback when editor is ready |
| `className` | `string` | `''` | Additional CSS classes |
| `editorRef` | `React.RefObject<any>` | - | Reference to editor instance |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text |
| `readOnly` | `boolean` | `false` | Whether editor is read-only |

## 🔧 Editor Methods

The editor exposes several methods through the ref:

```tsx
const editorRef = useRef(null);

// Insert content at cursor position
editorRef.current.insertContent('New content');

// Insert content at specific position
editorRef.current.insertContent('New content', 100);

// Get current content
const content = editorRef.current.getContent();

// Get plain text
const text = editorRef.current.getText();

// Get selected text
const selected = editorRef.current.getSelectedText();

// Clear selection
editorRef.current.clearSelection();

// Get cursor position
const position = editorRef.current.getCursorPosition();

// Set cursor position
editorRef.current.setCursorPosition(100);

// Update content
editorRef.current.updateContent('New content', true); // preserve cursor

// Check if editor is ready
const isReady = editorRef.current.isReady();
```

## 🎨 Customization

### CSS Customization

The component uses CSS classes that can be customized:

```css
/* Selection menu styles */
.selection-menu {
  /* Custom styles for the AI selection popup */
}

/* Button styles */
.selection-menu button {
  /* Custom button styles */
}

/* Color themes */
.selection-menu .bg-blue-600 {
  /* Custom blue theme */
}
```

### Explanation Types

You can customize the explanation types by modifying the component:

```tsx
const explanationTypes = [
  { key: 'explain', label: '💡 Explain', color: 'blue' },
  { key: 'summary', label: '📝 Summary', color: 'green' },
  { key: 'detailed', label: '🔍 Detailed', color: 'purple' },
  { key: 'examples', label: '📋 Examples', color: 'orange' },
  // Add your custom types here
];
```

## 🔌 Integration with AI Services

### Example AI Integration

```tsx
const handleAiExplanationRequest = async (text: string, explanationType?: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/ai/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      text,
      type: explanationType,
      context: 'lesson_content'
    }),
  });

  const result = await response.json();
  
  // Handle the AI response
  if (result.success) {
    // Insert or display the explanation
    insertExplanation(result.explanation, explanationType);
  }
};
```

## 🎯 User Experience Features

### Selection Menu
- **Smart Positioning**: Automatically positions above selected text
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Animations**: Elegant entrance and exit animations
- **Click Outside to Close**: Intuitive interaction patterns

### AI Integration
- **Loading States**: Visual feedback during AI requests
- **Error Handling**: Graceful error handling and user feedback
- **Response History**: Track multiple AI responses
- **Quick Actions**: Instant access to common explanation types

## 🚀 Performance Optimizations

- **Memoized Components**: Prevents unnecessary re-renders
- **Lazy Loading**: Efficient resource management
- **Cursor Position Preservation**: Maintains user context during updates
- **Retry Mechanism**: Robust editor initialization

## 🔧 Troubleshooting

### Common Issues

1. **Editor not initializing**
   - Check if all required dependencies are installed
   - Ensure proper CSS imports
   - Verify component mounting

2. **Selection menu not appearing**
   - Check z-index conflicts
   - Verify event handlers are properly bound
   - Ensure text selection is working

3. **AI requests not working**
   - Verify API endpoints are correct
   - Check authentication tokens
   - Ensure proper error handling

### Debug Mode

Enable debug logging:

```tsx
// Add to your component
useEffect(() => {
  console.log('TiptapEditor Debug Mode Enabled');
}, []);
```

## 📚 Examples

See `TiptapEditorDemo.tsx` for a complete working example with all features demonstrated.

## 🤝 Contributing

When contributing to this component:

1. Maintain backward compatibility
2. Add proper TypeScript types
3. Include CSS for new features
4. Update documentation
5. Add tests for new functionality

## 📄 License

This component is part of the QAQC Platform and follows the same licensing terms.
