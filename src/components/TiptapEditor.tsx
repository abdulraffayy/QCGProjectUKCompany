import React, { useMemo, useState, useEffect } from 'react';
import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onTextSelection?: (selectedText: string, selectionPosition?: {from: number, to: number}) => void;
  onAiExplanationRequest?: (selectedText: string) => void;
  onReady?: () => void;
  className?: string;
  editorRef?: React.RefObject<any>; // Add backward compatibility
}

const TiptapEditor = React.forwardRef<any, TiptapEditorProps>(({
  content,
  onContentChange,
  onTextSelection,
  onAiExplanationRequest,
  onReady,
  className = "",
  editorRef
}, ref) => {
  const [showAiPopup, setShowAiPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [lastSelection, setLastSelection] = useState({ from: 0, to: 0 });

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content || '<p>Start typing your lesson content here...</p>',
    onUpdate: ({ editor }: { editor: any }) => {
      const html = editor.getHTML();
      onContentChange(html);
    },
    onSelectionUpdate: ({ editor }: { editor: any }) => {
      const { from, to } = editor.state.selection;
      
      // Store cursor position when not selecting text
      if (from === to) {
        setCursorPosition(from);
      }
      
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to);
        setSelectedText(selectedText);
        
        // Check if this is a click on already selected text (same selection as before)
        const isClickOnSelectedText = from === lastSelection.from && to === lastSelection.to;
        
        // Show popup when text is selected OR when clicking on already selected text
        if (selectedText.trim().length > 0) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setPopupPosition({
              x: rect.left + rect.width / 2,
              y: rect.top - 10
            });
            setShowAiPopup(true);
          }
        } else {
          setShowAiPopup(false);
        }
        
        // Update last selection
        setLastSelection({ from, to });
        
        if (onTextSelection) {
          onTextSelection(selectedText, { from, to });
        }
      } else {
        setShowAiPopup(false);
        setSelectedText('');
      }
    },
  });

  // Memoize the provider value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({ editor }), [editor]);

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onReady) {
      console.log('🎉 TiptapEditor is ready, notifying parent');
      onReady();
    }
  }, [editor, onReady]);

  // Restore cursor position when content changes
  useEffect(() => {
    if (editor && cursorPosition !== null) {
      // Use setTimeout to ensure the content has been updated
      setTimeout(() => {
        try {
          const pos = Math.min(cursorPosition, editor.state.doc.content.size);
          editor.commands.setTextSelection(pos);
          editor.commands.focus();
        } catch (error) {
          console.log('Could not restore cursor position:', error);
        }
      }, 0);
    }
  }, [content, editor, cursorPosition]);

  // Enhanced editor readiness check with retry mechanism
  const ensureEditorReady = (callback: () => void, retryCount = 0) => {
    if (editor && editor.isDestroyed === false) {
      callback();
    } else if (retryCount < 5) {
      console.log(`⏳ Editor not ready, retrying in 500ms... (attempt ${retryCount + 1})`);
      setTimeout(() => ensureEditorReady(callback, retryCount + 1), 500);
    } else {
      console.error('❌ Editor failed to initialize after 5 attempts');
    }
  };

  // Handle AI explanation request
  const handleAiExplanation = () => {
    if (editor && onAiExplanationRequest && selectedText) {
      onAiExplanationRequest(selectedText);
      setShowAiPopup(false);
    }
  };



  // Expose editor methods for external use
  React.useImperativeHandle(ref || editorRef, () => ({
    insertContent: (content: string, position?: number) => {
      console.log('🔧 TiptapEditor.insertContent called with:', content);
      
      const performInsert = () => {
        if (editor && editor.isDestroyed === false) {
          try {
            // Store current cursor position before insertion
            const currentPos = editor.state.selection.from;
            
            if (position !== undefined) {
              // Insert at specific position
              const pos = Math.min(position, editor.state.doc.content.size);
              
              // Convert plain text to HTML if needed
              let htmlContent = content;
              if (!content.includes('<') && !content.includes('>')) {
                // Convert plain text to HTML paragraphs
                htmlContent = content.split('\n\n').map(paragraph => 
                  paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '<p><br></p>'
                ).join('');
              }
              
              editor.chain().focus().insertContentAt(pos, htmlContent).run();
              
              // Move cursor to end of inserted content
              const newPos = pos + htmlContent.length;
              setTimeout(() => {
                editor.commands.setTextSelection(newPos);
                editor.commands.focus();
              }, 0);
            } else {
              // Insert at current cursor position
              // Convert plain text to HTML if needed
              let htmlContent = content;
              if (!content.includes('<') && !content.includes('>')) {
                // Convert plain text to HTML paragraphs
                htmlContent = content.split('\n\n').map(paragraph => 
                  paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '<p><br></p>'
                ).join('');
              }
              
              editor.chain().focus().insertContent(htmlContent).run();
              
              // Move cursor to end of inserted content
              const newPos = currentPos + htmlContent.length;
              setTimeout(() => {
                editor.commands.setTextSelection(newPos);
                editor.commands.focus();
              }, 0);
            }
            console.log('✅ Content inserted successfully into Tiptap editor');
          } catch (error) {
            console.error('❌ Error inserting content into Tiptap editor:', error);
            throw error;
          }
        } else {
          console.error('❌ Tiptap editor is not initialized');
          throw new Error('Editor not ready');
        }
      };

      // Use retry mechanism if editor is not ready
      if (editor && editor.isDestroyed === false) {
        performInsert();
      } else {
        console.log('⏳ Editor not ready, using retry mechanism...');
        ensureEditorReady(performInsert);
      }
    },
    
    getHTML: () => {
      if (editor && editor.isDestroyed === false) {
        return editor.getHTML();
      }
      return '';
    },
    
    setContent: (content: string) => {
      if (editor && editor.isDestroyed === false) {
        editor.commands.setContent(content);
        return true;
      }
      return false;
    },
    
    insertPlainText: (text: string) => {
      if (editor) {
        // Remove any existing formatting from the selected text
        editor.chain().focus().clearNodes().unsetAllMarks().insertContent(text).run();
      }
    },
    
    getContent: () => {
      const content = editor?.getHTML() || '';
      console.log('📄 TiptapEditor.getContent:', content);
      return content;
    },
    
    getText: () => editor?.getText() || '',
    
    getEditor: () => editor,
    
    isReady: () => !!(editor && editor.isDestroyed === false),
    
    getCursorPosition: () => {
      if (editor) {
        const { from } = editor.state.selection;
        return from;
      }
      return 0;
    },
    
    setCursorPosition: (position: number) => {
      if (editor) {
        try {
          const pos = Math.min(position, editor.state.doc.content.size);
          editor.commands.setTextSelection(pos);
          editor.commands.focus();
        } catch (error) {
          console.log('Could not set cursor position:', error);
        }
      }
    },
    
    updateContent: (newContent: string, preserveCursor: boolean = true) => {
      if (editor) {
        try {
          const currentPos = preserveCursor ? editor.state.selection.from : 0;
          editor.commands.setContent(newContent);
          
          if (preserveCursor) {
            // Restore cursor position after content update
            setTimeout(() => {
              const pos = Math.min(currentPos, editor.state.doc.content.size);
              editor.commands.setTextSelection(pos);
              editor.commands.focus();
            }, 0);
          }
        } catch (error) {
          console.log('Could not update content:', error);
        }
      }
    }
  }), [editor]);

  // Handle clicks and close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.ai-popup') && !target.closest('.ProseMirror')) {
        setShowAiPopup(false);
      }
    };

    const handleEditorClick = () => {
      if (editor && editor.isDestroyed === false) {
        const { from, to } = editor.state.selection;
        
        // If there's selected text, show the popup
        if (from !== to) {
          const selectedText = editor.state.doc.textBetween(from, to);
          
          if (selectedText.trim().length > 0) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              setPopupPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
              });
              setShowAiPopup(true);
              setSelectedText(selectedText);
              
              // Notify parent about text selection
              if (onTextSelection) {
                onTextSelection(selectedText, { from, to });
              }
            }
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Add click handler to the editor element
    const editorElement = document.querySelector('.ProseMirror');
    if (editorElement) {
      editorElement.addEventListener('click', handleEditorClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (editorElement) {
        editorElement.removeEventListener('click', handleEditorClick);
      }
    };
  }, [editor, onTextSelection]);

  if (!editor) {
    return <div className={`animate-pulse bg-gray-200 h-32 rounded ${className}`} />;
  }

  return (
    <EditorContext.Provider value={providerValue}>
      <div className={`relative ${className}`}>
        <EditorContent 
          editor={editor} 
          className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
        />
        
        {/* Floating Menu - appears when you type "/" */}
        <FloatingMenu 
          editor={editor}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
        >
          <div className="text-sm text-gray-600">
            Type "/" to see commands
          </div>
        </FloatingMenu>

        {/* Bubble Menu - appears when text is selected */}
        <BubbleMenu 
          editor={editor}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-50 flex gap-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
            title="Strike"
          >
            <s>S</s>
          </button>
        </BubbleMenu>

        {/* Custom AI Popup */}
        {showAiPopup && selectedText.trim().length > 0 && (
          <div 
            className="ai-popup fixed z-[60] bg-white border border-gray-200 rounded-lg shadow-lg p-2 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: popupPosition.x,
              top: popupPosition.y,
            }}
          >
            <button
              onClick={handleAiExplanation}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              title="Get AI Explanation"
            >
              🤖 Get AI Explanation
            </button>
          </div>
        )}
      </div>
    </EditorContext.Provider>
  );
});

export default TiptapEditor;
