import { useState, useEffect } from 'react';
import { Sparkles, Target, Palette, FileText, Edit, Trash2, BookOpen, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseType, courseTypes } from '@/types/courseTypes';
import { CourseTypeCard } from '@/pages/CourseTypeCard';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useRef} from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReactElement } from 'react';
import { useToast } from '@/hooks/use-toast';
import TiptapEditor from '@/components/TiptapEditor';
import 'react-toastify/dist/ReactToastify.css';
import { QAQF_LEVELS } from '@/types/index';
import { marked } from "marked";


// TypeScript interfaces
interface ExplanationAttachment {
  id: number;
  content: string;
  
  explanationType: string;
  isCollapsed: boolean;
  position: number; // Track position in content
}


const CourseGeneratorPlatform = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [courses, setCourses] = useState<{ id: string, title: string, description?: string, status?: string, lessonContent?: string, level?: string }[]>([]);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<{ id: string, title: string } | null>(null);
  const [editingCourse, setEditingCourse] = useState<{ id: string, title: string, description: string, status: string, lessonContent?: string, level?: string } | null>(null);
  const [editForm, setEditForm] = useState<{ title: string, status: string, level: QAQF_LEVELS }>({
    title: '',
    status: 'Active',
    level: QAQF_LEVELS.Awareness
  });

  // Add lesson content state
  const [lessonContentInput, setLessonContentInput] = useState<string>('<p>Start typing your lesson content here...</p>');
  const [forceEditorUpdate, setForceEditorUpdate] = useState<number>(0);
  const [isUpdatingEditor, setIsUpdatingEditor] = useState<boolean>(false);

  // Data table states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'title' | 'status'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [selectedLinePosition, setSelectedLinePosition] = useState<number>(-1);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentExplanationType, setCurrentExplanationType] = useState<string>('explain');
  const [aiResponse, setAiResponse] = useState<string>('');

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [explanations, setExplanations] = useState<ExplanationAttachment[]>([]);
  
  // New state variables for AI API
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiReference, setAiReference] = useState<string>('');
  const [isAIGenerating, setIsAIGenerating] = useState<boolean>(false);
  const [responseHistory, setResponseHistory] = useState<Array<{type: string, content: string, timestamp: number}>>([]);
  
  // Store the latest API response for direct access
  const [latestApiResponse, setLatestApiResponse] = useState<string>('');
  
  // State for Ask Query button in Edit Course
  const [showAskQueryButton, setShowAskQueryButton] = useState<boolean>(false);
  
  // Flag to prevent continuous syncing during content updates
  const [isUpdatingContent, setIsUpdatingContent] = useState<boolean>(false);
  
  // Track if editor is ready
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  
  // Refs
  const lessonContentRef = useRef<HTMLDivElement>(null);
  const tiptapEditorRef = useRef<any>(null);
  const selectedTextEditorRef = useRef<any>(null);
  const explanationCounter = useRef<number>(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Function to check if content contains AI responses
  const hasAIResponse = (content: string): boolean => {
    // Check for AI response markers in the content
    return content.includes('🤖 AI Response:') || 
           content.includes('## AI Response:') || 
           content.includes('*Attached on') ||
           content.includes('AI Response:') ||
           content.includes('background: linear-gradient(135deg, #f0f9ff') ||
           content.includes('📅 Attached on') ||
           content.includes('📅 Generated on') ||
           content.includes('🤖 AI Response:') ||
           content.includes('Generated on') ||
           content.includes('Attached on') ||
           content.includes('color: #1e40af') || // AI response header color
           content.includes('border-left: 4px solid #3b82f6') || // AI response border
           content.length > 200; // Fallback check for substantial content
  };

  // Function to properly format content for TiptapEditor
  const formatContentForEditor = (content: string): string => {
    if (!content) return '<p>Start typing your lesson content here...</p>';
    
    // If content already contains AI responses, preserve it as is without any modification
    if (hasAIResponse(content)) {
      // Clean up any extra whitespace or formatting issues while preserving the structure
      return content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/>\s+</g, '><') // Remove spaces between HTML tags
        .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
        .trim();
    }
    
    // If content doesn't have HTML tags, wrap it in paragraphs
    if (!content.includes('<') && !content.includes('>')) {
      return content.split('\n\n').map(paragraph => 
        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '<p><br></p>'
      ).join('');
    }
    
    // If content has markdown formatting, convert to HTML
    if (content.includes('**') || content.includes('*') || content.includes('`')) {
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    }
    
    // Ensure content starts with a paragraph tag if it's not already HTML
    if (!content.startsWith('<p>') && !content.startsWith('<div>') && !content.startsWith('<h')) {
      return `<p>${content}</p>`;
    }
    
    return content;
  };

  // Function to sync content from editor to state (for saving)
  const syncContentToState = () => {
    if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
      try {
        const editorContent = tiptapEditorRef.current.getHTML();
        if (editorContent !== lessonContentInput) {
          setLessonContentInput(editorContent);
        }
      } catch (error) {
        console.error('❌ Error syncing content from editor:', error);
      }
    }
  };

  // Effect to ensure AI content is properly displayed in editor after attachment
  useEffect(() => {
    if (lessonContentInput && hasAIResponse(lessonContentInput)) {
      // Add a small delay to ensure the editor is ready
      const timer = setTimeout(() => {
        if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
          try {
            const currentContent = tiptapEditorRef.current.getHTML();
            // Only update if the content is different and contains AI response
            if (currentContent !== lessonContentInput && hasAIResponse(lessonContentInput)) {
              tiptapEditorRef.current.setContent(lessonContentInput);
            }
          } catch (error) {
            console.error('❌ Error ensuring AI content display:', error);
          }
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [lessonContentInput]);

  // NEW: Comprehensive content formatting function for production environments
  const formatContentForProduction = (content: string): string => {
    if (!content) return '<p>Start typing your lesson content here...</p>';
    
    // If content already contains AI responses or is already HTML, preserve it as is
    if (hasAIResponse(content) || content.includes('<div') || content.includes('<h3')) {
      // Only clean up whitespace issues while preserving the structure
      return content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/>\s+</g, '><') // Remove spaces between HTML tags
        .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
        .trim();
    }
    
    let html = content;
    
    // Only process markdown if the content doesn't already contain HTML tags
    if (!html.includes('<') || html.includes('**') || html.includes('*') || html.includes('`') || html.includes('+')) {
      // Convert markdown lists to HTML lists
      // Handle unordered lists with * and +
      html = html.replace(/^(\s*)[*+]\s+(.+)$/gm, '$1<li>$2</li>');
      
      // Wrap consecutive list items in <ul> tags
      html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
        const items = match.match(/<li>.*?<\/li>/g);
        if (items && items.length > 0) {
          return '<ul>' + items.join('') + '</ul>';
        }
        return match;
      });
      
      // Handle bold, italic, and code formatting
      html = html
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
      
      // Handle paragraph breaks
      html = html.replace(/\n\n/g, '</p><p>');
      html = html.replace(/\n/g, '<br>');
      
      // Ensure proper HTML structure - wrap in p tags if not already wrapped and doesn't contain lists
      if (!html.startsWith('<p>') && !html.startsWith('<ul>') && !html.startsWith('<div>') && !html.startsWith('<h')) {
        html = '<p>' + html + '</p>';
      }
      
      // Fix any nested ul/ol inside p tags by moving them outside
      html = html.replace(/<p>(.*?)<ul>(.*?)<\/ul>(.*?)<\/p>/g, '<p>$1</p><ul>$2</ul><p>$3</p>');
      html = html.replace(/<p>(.*?)<ol>(.*?)<\/ol>(.*?)<\/p>/g, '<p>$1</p><ol>$2</ol><p>$3</p>');
    }
    
    return html;
  };

  // NEW: Effect to properly restore content when edit dialog opens
  useEffect(() => {
    if (showEditPopup && editingCourse && lessonContentInput) {
      // Add a longer delay to ensure the editor is fully initialized
      const timer = setTimeout(() => {
        if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
          try {
            const currentContent = tiptapEditorRef.current.getHTML();
            // Use the original formatContentForEditor for consistenc
            const expectedContent = formatContentForEditor(lessonContentInput);
            
            // Only update if the content is different and not just whitespace differences
            const normalizedCurrent = currentContent.replace(/\s+/g, ' ').trim();
            const normalizedExpected = expectedContent.replace(/\s+/g, ' ').trim();
            
            if (normalizedCurrent !== normalizedExpected) {
              console.log('🔄 Restoring content in edit dialog');
              console.log('Current:', normalizedCurrent.substring(0, 100));
              console.log('Expected:', normalizedExpected.substring(0, 100));
              
              tiptapEditorRef.current.setContent(expectedContent);
              
              // Force a re-render to ensure content is displayed
              setForceEditorUpdate(prev => prev + 1);
            }
          } catch (error) {
            console.error('❌ Error restoring content in edit dialog:', error);
          }
        }
      }, 500); // Increased delay for better reliability
      
      return () => clearTimeout(timer);
    }
  }, [showEditPopup, editingCourse, lessonContentInput]);

  // NEW: Effect to ensure content is properly formatted when lessonContentInput changes
  useEffect(() => {
    if (lessonContentInput && showEditPopup && !isUpdatingContent) {
      // Only reformat if we're not currently updating content from API
      const formattedContent = formatContentForEditor(lessonContentInput);
      if (formattedContent !== lessonContentInput && !hasAIResponse(lessonContentInput)) {
        setLessonContentInput(formattedContent);
      }
    }
  }, [lessonContentInput, showEditPopup, isUpdatingContent]);

  // Effect to update editor when lessonContentInput changes
  useEffect(() => {
    if (lessonContentInput && isEditorReady) {
      if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
        try {
          const currentContent = tiptapEditorRef.current.getHTML();
          if (currentContent !== lessonContentInput) {
            const success = tiptapEditorRef.current.setContent(lessonContentInput);
            if (success) {
              setForceEditorUpdate(prev => prev + 1);
            }
          }
        } catch (error) {
          console.error('❌ Error updating editor from lessonContentInput change:', error);
        }
      }
    }
  }, [lessonContentInput, isEditorReady]);

  // Debug function to check content state
  const debugContentState = () => {
    // Debug function - console logs removed for cleaner code
  };

  // Force update editor content function
  const forceUpdateEditorContent = () => {
    if (!lessonContentInput) {
      return;
    }
    
    if (!isEditorReady) {
      return;
    }
    
    if (tiptapEditorRef.current && typeof tiptapEditorRef.current.setContent === 'function') {
      try {
        // Use the exposed setContent method from TiptapEditor
        const success = tiptapEditorRef.current.setContent(lessonContentInput);
        
        if (success) {
          // Force a re-render
          setForceEditorUpdate(prev => prev + 1);
        }
        
      } catch (error) {
        console.error('❌ Error updating editor content:', error);
      }
    }
  };


   // Function to upload course to API
   const onCourseUploaded = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication required. Please login again.",
          variant: "destructive",
        });
        return;
      }

      // Get the lesson content from the contentEditable div
     
      
      const courseData = {
        title: editForm.title,
        description: lessonContentInput,
        userid: 1, // Default user ID
        status: editForm.status
      };

      const response = await fetch('http://69.197.176.134:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Course successfully added to Lesson Plan!",
          variant: "default",
        });
        
        // Optionally, you can navigate to LessonPlan page or refresh the courses list
        // window.location.href = '/lesson-plan';
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to upload course: ${errorData.error || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading course:', error);
      toast({
        title: "Error",
        description: "Error uploading course. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Parse markdown content
  const parseMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

 // Find the line number of selected text using DOM position (always return last line)
const findSelectedLinePosition = (selectedText: string, range: Range): number => {
  if (!lessonContentRef.current) return -1;

  const lines = lessonContent.split('\n');
  const cleanSelectedText = selectedText.trim().replace(/\s+/g, ' ').toLowerCase();

  const container = lessonContentRef.current;

  // ✅ Use the END of selection instead of the start
  let currentNode = range.endContainer;
  let targetElement: Element | null = null;

  // Walk up the DOM tree to find the closest block element (DIV or P)
  while (currentNode && currentNode !== container) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as Element;
      if (element.tagName === 'DIV' || element.tagName === 'P') {
        targetElement = element;
        break;
      }
    }
    currentNode = currentNode.parentNode as Node;
  }

  // If we found a DOM element, map it to its index
  if (targetElement) {
    const allDivs = Array.from(container.querySelectorAll('div'));
    const elementIndex = allDivs.indexOf(targetElement as HTMLDivElement);

    if (elementIndex !== -1) {
      return elementIndex; // ✅ always the last line
    }
  }

  // Fallback: find the last line containing part of the selected text
  let lastMatchingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const cleanLine = lines[i].replace(/\s+/g, ' ').toLowerCase();
    const selectedWords = cleanSelectedText.split(' ');

    const hasMatchingWord = selectedWords.some(
      (word) => word.length > 2 && cleanLine.includes(word)
    );

    if (hasMatchingWord) {
      lastMatchingLine = i;
    }
  }

  if (lastMatchingLine !== -1) {
    return lastMatchingLine;
  }

  // Final fallback: try exact/partial text match
  for (let i = lines.length - 1; i >= 0; i--) {
    const cleanLine = lines[i].replace(/\s+/g, ' ').toLowerCase();
    if (
      cleanLine.includes(cleanSelectedText) ||
      cleanSelectedText.includes(cleanLine)
    ) {
      return i;
    }
  }

  return -1;
};


  // Handle text selection
  const handleTextSelection = (e: React.MouseEvent | React.TouchEvent) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const text = selection.toString().trim();
    if (text !== '') {
      setSelectedText(text);
      setSelectedRange(selection.getRangeAt(0));
      
      // Find the position of the selected line
      const linePosition = findSelectedLinePosition(text, selection.getRangeAt(0));
      setSelectedLinePosition(linePosition);
      
      // Position tooltip
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setTooltipPosition({ x: clientX, y: clientY - 40 });
      setShowTooltip(true);
      
      // Show popup after delay
      setTimeout(() => {
        setIsPopupOpen(true);
        setShowTooltip(false);
      }, 300);
    }
  };

  // Highlight selected text
  const highlightSelectedText = () => {
    if (!selectedRange || !lessonContentRef.current) return;
    
    const span = document.createElement('span');
    span.className = 'bg-gradient-to-r from-cyan-200 to-pink-200 p-0.5 rounded-md animate-pulse';
    
    try {
      selectedRange.surroundContents(span);
    } catch (e) {
      // Complex selection detected
    }
  };

  // Close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setAiResponse('');
    setAiQuery('');
    setAiReference('');
    setSelectedLinePosition(-1);
    setResponseHistory([]); // Clear response history when closing popup
    setShowAskQueryButton(false); // Hide Ask Query button when closing popup
    
    // Clear selection highlighting
    if (lessonContentRef.current) {
      const highlighted = lessonContentRef.current.querySelectorAll('.bg-gradient-to-r');
      highlighted.forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          parent.normalize();
        }
      });
    }
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // Real AI request function
  const sendExplanationRequest = async () => {
    // Validation checks
    if (!selectedText.trim()) {
      alert('Please select some text first!');
      return;
    }
    
    if (!editingCourse?.id) {
      alert('Please select a course first!');
      return;
    }
    
    if (!editForm.level) {
      alert('Please select a QAF Level first!');
      return;
    }
    
    setIsLoading(true);
    setIsAIGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User token is missing! Please login again.');
        return;
      }

      // Map explanation types to generation types
      const generationTypeMap: { [key: string]: string } = {
        'explain': 'explanation',
        'summary': 'summary',
        'detailed': 'detailed_explanation',
        'examples': 'examples'
      };

      const generation_type = generationTypeMap[currentExplanationType] || 'explanation';
      const material = aiReference || selectedText;
      const subject = selectedText;
      const userquery = aiQuery || `Please ${currentExplanationType} this text: ${selectedText}`;

      // Debug: Log what we're sending to the API
      const requestBody = {
        generation_type,
        material,
        qaqf_level: editForm.level,
        subject,
        userquery,
        courseid: editingCourse?.id ? (typeof editingCourse.id === 'string' ? parseInt(editingCourse.id, 10) : editingCourse.id) : 0,
      };
      
      console.log('🚀 Sending AI request with:', requestBody);
      
      // Show success message with selected parameters
      toast({
        title: "AI Request Sent!",
        description: `QAF Level: ${editForm.level} | Course: ${editingCourse?.title}`,
      });

      const response = await fetch('http://69.197.176.134:5000/api/ai/assessment-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      
             if (data.generated_content && data.generated_content.length > 0) {
         // ✅ Add new response to history (newest first)
         const newResponse = {
           type: currentExplanationType,
           content: data.generated_content,
           timestamp: Date.now()
         };
         
         setResponseHistory(prev => [newResponse, ...prev]); // Add new response at the beginning
         
         // Update the main AI response to show all responses (newest first)
         const allResponses = [newResponse, ...responseHistory];
         const formattedResponses = allResponses.map((resp,) => {
           const time = new Date(resp.timestamp).toLocaleTimeString();
           return `--- ${resp.type.toUpperCase()} (${time}) ---\n\n${resp.content}`;
         }).join('\n\n');
         
         setAiResponse(formattedResponses);
         
         // Store the latest API response for direct access
         setLatestApiResponse(data.generated_content);
         
         // 🆕 AUTOMATICALLY ADD API RESPONSE TO LESSON CONTENT
         const formattedResponse = `

<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 8px;">
  <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
    🤖 AI Response: ${currentExplanationType.charAt(0).toUpperCase() + currentExplanationType.slice(1)}
  </h3>
  <div style="color: #374151; line-height: 1.6;">
    ${data.generated_content}
  </div>
  <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #dbeafe; font-size: 12px; color: #6b7280;">
    📅 Generated on ${new Date().toLocaleString()}
  </div>
</div>

`;
         
         // Get current content and append the new AI response
         let currentContent = lessonContentInput || '';
         
         // Ensure we have the latest content from the editor if available
         if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
           try {
             const editorContent = tiptapEditorRef.current.getHTML();
             currentContent = editorContent;
           } catch (error) {
             console.error('❌ Error getting content from editor:', error);
           }
         }
         
         // Append the AI response to the existing content
         const newContent = currentContent + formattedResponse;
         
         // Temporarily disable content change handling to prevent conflicts
         setIsUpdatingContent(true);
         
         // Update the lesson content state
         setLessonContentInput(newContent);
         
         // Update the TipTap editor content IMMEDIATELY
         if (tiptapEditorRef.current && typeof tiptapEditorRef.current.setContent === 'function') {
           try {
             // Set the entire content directly to ensure immediate visibility
             tiptapEditorRef.current.setContent(newContent);
             
             // Force a re-render by updating the forceEditorUpdate counter
             setForceEditorUpdate(prev => prev + 1);
             
           } catch (error) {
             console.error('❌ Error updating editor content:', error);
           }
         }
         
         // Re-enable content change handling after a longer delay to ensure content is stable
         setTimeout(() => {
           setIsUpdatingContent(false);
         }, 500);
       } else {
         setAiResponse('No content generated. Please try again.');
       }
    } catch (error) {
      console.error('AI Generate error:', error);
      setAiResponse('AI generation failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setIsAIGenerating(false);
    }
  };

  // Attach AI response to TipTap Editor content - IMMEDIATE VISIBILITY
  const attachExplanation = () => {
    // Get the latest response (first in the array)
    let latestResponse = responseHistory[0];
    let responseContent = '';
    let responseType = currentExplanationType;
    
    // If no response in history, try to use the latest API response
    if (!latestResponse) {
      if (latestApiResponse) {
        responseContent = latestApiResponse;
        responseType = currentExplanationType || 'explanation';
      } else {
        alert('No AI response available to attach. Please generate a response first.');
        return;
      }
    } else {
      responseContent = latestResponse.content;
      responseType = latestResponse.type;
    }
    
    // Format the AI response for better presentation
    const formattedResponse = `

<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 8px;">
  <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
    🤖 AI Response: ${responseType.charAt(0).toUpperCase() + responseType.slice(1)}
  </h3>
  <div style="color: #374151; line-height: 1.6;">
    ${responseContent}
  </div>
  <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #dbeafe; font-size: 12px; color: #6b7280;">
    📅 Attached on ${new Date().toLocaleString()}
  </div>
</div>

`;
    
    try {
      // Get current content from TipTap Editor
      let currentContent = lessonContentInput || '';
      
      // Ensure we have the latest content from the editor
      if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
        try {
          const editorContent = tiptapEditorRef.current.getHTML();
          currentContent = editorContent;
        } catch (error) {
          console.error('❌ Error getting content from editor:', error);
        }
      }
      
      // Always append the AI response to the bottom of existing content
      const newContent = currentContent + formattedResponse;
      
      // Temporarily disable content change handling to prevent conflicts
      setIsUpdatingContent(true);
      
      // Update the state first
      setLessonContentInput(newContent);
      
      // Update the TipTap editor content IMMEDIATELY
      if (tiptapEditorRef.current && typeof tiptapEditorRef.current.setContent === 'function') {
        try {
          // Set the entire content directly to ensure immediate visibility
          tiptapEditorRef.current.setContent(newContent);
          
          // Force a re-render by updating the forceEditorUpdate counter
          setForceEditorUpdate(prev => prev + 1);
          
          // Add a temporary highlight to the newly attached content
          setTimeout(() => {
            const editor = tiptapEditorRef.current.getEditor();
            if (editor && editor.view && editor.view.dom) {
              const editorElement = editor.view.dom;
              const aiResponseElements = editorElement.querySelectorAll('[style*="background: linear-gradient(135deg, #f0f9ff"]');
              aiResponseElements.forEach((element: any) => {
                element.style.animation = 'highlightPulse 2s ease-in-out';
              });
            }
          }, 200);
          
          // Scroll to the bottom to show the new content
          setTimeout(() => {
            const editor = tiptapEditorRef.current.getEditor();
            if (editor && editor.view && editor.view.dom) {
              const editorElement = editor.view.dom;
              editorElement.scrollTop = editorElement.scrollHeight;
            }
          }, 100);
          
          // Re-enable content change handling after a short delay
          setTimeout(() => {
            setIsUpdatingContent(false);
          }, 500);
        } catch (error) {
          console.error('❌ Error setting content in editor:', error);
          
          // Try alternative approach: insert at end
          try {
            const editor = tiptapEditorRef.current.getEditor();
            if (editor) {
              const docSize = editor.state.doc.content.size;
              editor.commands.setTextSelection(docSize);
              editor.commands.insertContent(formattedResponse);
              
              // Re-enable content change handling after a short delay
              setTimeout(() => {
                setIsUpdatingContent(false);
              }, 500);
            }
          } catch (fallbackError) {
            console.error('❌ Alternative approach also failed:', fallbackError);
            
            // Re-enable content change handling even if both approaches fail
            setTimeout(() => {
              setIsUpdatingContent(false);
            }, 500);
          }
        }
      }
      
      // Show success message
      toast({
        title: 'Success',
        description: 'AI response attached to lesson content successfully! Check the bottom of your content.',
        variant: 'default'
      });
      
    } catch (error) {
      console.error('❌ Error in attachExplanation:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach AI response. Please try again.',
        variant: 'destructive'
      });
    }
    
    // Clear the AI response and close the dialog
    setAiResponse('');
    setResponseHistory([]);
    setIsPopupOpen(false);
  };


  // Update selected text in TiptapEditor when edited in popup
  const updateSelectedTextInEditor = (newText: string) => {
    if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function' && selectedText && newText !== selectedText) {
      try {
        const currentContent = tiptapEditorRef.current.getHTML();
        const selectedTextIndex = currentContent.indexOf(selectedText);
        
        if (selectedTextIndex !== -1) {
          // Replace the selected text with the new text
          const beforeSelected = currentContent.substring(0, selectedTextIndex);
          const afterSelected = currentContent.substring(selectedTextIndex + selectedText.length);
          const newContent = beforeSelected + newText + afterSelected;
          
          // Update the editor content
          tiptapEditorRef.current.setContent(newContent);
          setLessonContentInput(newContent);
        }
      } catch (error) {
        console.error('❌ Error updating selected text:', error);
      }
    }
  };

  // Toggle explanation visibility
  const toggleExplanation = (id: number) => {
    setExplanations(explanations.map(exp => 
      exp.id === id ? { ...exp, isCollapsed: !exp.isCollapsed } : exp
    ));
  };


  const removeExplanation = (id: number) => {
    setExplanations(explanations.filter(exp => exp.id !== id));
  };

  // Render lesson content with explanations inserted at their positions
  const renderLessonContentWithExplanations = () => {
    const lines = lessonContent.split('\n');
    const sortedExplanations = [...explanations].sort((a, b) => a.position - b.position);
    
    let result: ReactElement[] = [];
    let explanationIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
    
      result.push(
        <div key={`line-${i}`} className="mb-2" dangerouslySetInnerHTML={{ __html: parseMarkdown(lines[i]) }}></div>
      );
      
      // Check if there are explanations to insert after this line
      while (explanationIndex < sortedExplanations.length && sortedExplanations[explanationIndex].position === i) {
        const explanation = sortedExplanations[explanationIndex];
        result.push(
          <div 
            key={`explanation-${explanation.id}`}
            className="my-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg animate-slideIn"
          >
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleExplanation(explanation.id)}
            >
              <div className="font-bold text-gray-800 flex items-center">
                <span className="mr-2">💡</span>
                AI Explanation ({explanation.explanationType})
              </div>
              <div className="flex gap-2">
                <button 
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newContent = prompt('Edit explanation:', explanation.content);
                    if (newContent) {
                      setExplanations(explanations.map(exp => 
                        exp.id === explanation.id ? { ...exp, content: newContent } : exp
                      ));
                    }
                  }}
                >
                  ✏️
                </button>
                <button 
                  className="text-red-500 hover:text-red-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExplanation(explanation.id);
                  }}
                >
                  🗑️
                </button>
                <span>{explanation.isCollapsed ? '➡️' : '⬇️'}</span>
              </div>
            </div>
            
            {!explanation.isCollapsed && (
              <div 
                className="mt-3 text-gray-700"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(explanation.content) }}
              ></div>
            )}
          </div>
        );
        explanationIndex++;
      }
    }
    
    return result;
  };



  useEffect(() => {
    if (selectedText && isPopupOpen) {
      highlightSelectedText();
    }
  }, [selectedText, isPopupOpen]);

  // Lesson content
  const lessonContent = lessonContentInput || '';

  // Ensure content is properly formatted as HTML
  useEffect(() => {
    if (lessonContentInput && (lessonContentInput.includes('**') || lessonContentInput.includes('*') || lessonContentInput.includes('`'))) {
      const htmlContent = lessonContentInput
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
      
      if (htmlContent !== lessonContentInput) {
        setLessonContentInput(htmlContent);
      }
    }
  }, [lessonContentInput]);

  const handleSelectCourseType = (courseType: CourseType) => {
    setLocation(`/course-generator/wizard/${courseType.id}`);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://69.197.176.134:5000/api/courses', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
const coursesData = Array.isArray(data) ? data.map(c => ({
  ...c,
  lessonContent: c.lessonContent || c.description || ''
})) : [];
setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEditCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      // Map status values to match Select component options
      const mapStatus = (status: string) => {
        if (status === 'Active' || status === 'active') return 'Active';
        if (status === 'Not Active' || status === 'inactive' || status === 'Inactive') return 'Not Active';
        return 'Active'; // default
      };

      const mappedStatus = mapStatus(course.status || 'Active');
      
      setEditingCourse({
        id: course.id,
        title: course.title,
        description: course.description || '',
        status: mappedStatus,
        lessonContent: course.lessonContent
      });
      setEditForm({
        title: course.title,
        status: mappedStatus,
        level: (course.level as QAQF_LEVELS) || QAQF_LEVELS.Awareness
      });
      
      // Set lesson content to default or from course data if available
      let content = course.lessonContent || course.description || '<p>Start typing your lesson content here...</p>';

      // 🔑 Convert Markdown → HTML if description exists
      if (course.description) {
        content = marked.parse(course.description) as string;
        content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/>\s+</g, '><') // Remove spaces between HTML tags
        .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
        .trim();
      }
      // Clean up the content before formatting to remove any formatting issues
      
      
      // Use the original formatContentForEditor for consistency
      content = formatContentForEditor(content);
      
      console.log('📝 Setting lesson content for edit:', content.substring(0, 200) + '...');
      
      setLessonContentInput(content);
      setShowEditPopup(true);
      
      // Force update the TiptapEditor content after a longer delay to ensure it's fully initialized
      setTimeout(() => {
        if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
          try {
            // Check if the editor already has the correct content
            const currentEditorContent = tiptapEditorRef.current.getHTML();
            const normalizedCurrent = currentEditorContent.replace(/\s+/g, ' ').trim();
            const normalizedExpected = content.replace(/\s+/g, ' ').trim();
            
            if (normalizedCurrent !== normalizedExpected) {
              console.log('🔄 Updating TiptapEditor content in handleEditCourse');
              tiptapEditorRef.current.setContent(content);
              
              // Force a re-render to ensure content is displayed
              setForceEditorUpdate(prev => prev + 1);
            }
          } catch (error) {
            console.error('❌ Error updating TiptapEditor content:', error);
          }
        }
      }, 500); // Increased delay for better reliability
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user') || '{"id":1}'; 
      const user = JSON.parse(userString);
      const userid = user.id;
      
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {

          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          title: editForm.title,
          status: editForm.status,
          userid: userid
        })
      });

      if (response.ok) {
       
        setCourses(prev => prev.map(course => 
          course.id === editingCourse.id 
            ? { ...course, title: editForm.title, status: editForm.status }
            : course
        ));
       
        setShowEditPopup(false);
        setEditingCourse(null);
        setEditForm({ title: '', status: 'active', level: QAQF_LEVELS.Awareness });
        
        // Course updated successfully
      } else {
        console.error('Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  // Handle save for right side module edit
  const handleSaveRightSideModuleEdit = async () => {
    if (!editingCourse) return;

    // Sync content from editor to state before saving
    syncContentToState();

    // Get the final content to save
    let contentToSave = lessonContentInput;
    
          // Ensure we have the latest content from the editor
      if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
        try {
          const editorContent = tiptapEditorRef.current.getHTML();
          contentToSave = editorContent;
        } catch (error) {
          console.error('❌ Error getting content from editor:', error);
        }
      }

    try {
      const token = localStorage.getItem('token');
     
      const userString = localStorage.getItem('user') || '{"id":1}'; 
      const user = JSON.parse(userString);
      const userid = user.id;
      const response = await fetch(`http://69.197.176.134:5000/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          title: editForm.title,
          status: editForm.status,
          level: editForm.level,
          description: contentToSave,
          userid: userid
        })
      });

      if (response.ok) {
        // Update the courses list
        setCourses(prev => prev.map(course => 
          course.id === editingCourse.id 
            ? { ...course, title: editForm.title, status: editForm.status, description: contentToSave }
            : course
        ));
       
        // Close the edit popup
        setShowEditPopup(false);
        setEditingCourse(null);
        setEditForm({ title: '', status: 'active', level: QAQF_LEVELS.Awareness });
        
        toast({
          title: "Course Updated Successfully!",
          description: "Course and lesson content have been updated successfully.",
          variant: "default",
        });
      } else {
        console.error('Failed to update course');
        toast({
          title: "Error",
          description: "Failed to update course. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Error updating course. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    // Sync content from editor to state before closing
    syncContentToState();
    
    setShowEditPopup(false);
    setEditingCourse(null);
    setEditForm({ title: '', status: 'Active', level: QAQF_LEVELS.Awareness });
    setShowAskQueryButton(false); // Reset Ask Query button when closing edit popup
  };

  const handleDeleteCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setDeletingCourse({
        id: course.id,
        title: course.title
      });
      setShowDeletePopup(true);
    }
  };

  const confirmDeleteCourse = async () => {
    if (!deletingCourse) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${deletingCourse.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      if (res.ok) {
        setCourses(prev => prev.filter(course => course.id !== deletingCourse.id));
        // Course deleted successfully
      } else {
        console.error('Failed to delete course');
      }
    } catch (err) {
      console.error("Error deleting course:", err);
    } finally {
      setShowDeletePopup(false);
      setDeletingCourse(null);
    }
  };

  const cancelDeleteCourse = () => {
    setShowDeletePopup(false);
    setDeletingCourse(null);
  };

  // Data table utility functions
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.status && course.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = sortedCourses.slice(startIndex, endIndex);

  const handleSort = (field: 'title' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: 'title' | 'status' }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-blue-600" /> : 
      <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Course Generator Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create professional, engaging courses with AI-powered templates tailored to your specific needs
          </p>
        </div>
      </div>

      {(
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Course Type
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the format that best matches your educational goals and audience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseTypes.map((courseType) => (
              <CourseTypeCard
                key={courseType.id}
                courseType={courseType}
                onSelect={handleSelectCourseType}
                isExpanded={false}
              />
            ))}
          </div>
        </div>
      )}

      
      <div className="bg-gray-50 py-16">
        <div className="w-full px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              My Courses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage and edit your created courses
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-500">No courses yet</p>
              <p className="text-sm text-gray-400">Create your first course to see it here</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border w-full">
              {/* Search and Controls */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="items-per-page" className="text-sm text-gray-600">Show:</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/4"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-2">
                          Title
                          <SortIcon field="title" />
                        </div>
                      </th>

                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/6"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          <SortIcon field="status" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            course.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {course.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCourse(course.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedCourses.length)} of {sortedCourses.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="h-8 w-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Professional Templates
              </h3>
              <p className="text-gray-600">
                AI-powered templates based on educational best practices and industry standards
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Palette className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Customizable Content
              </h3>
              <p className="text-gray-600">
                Tailor every aspect to your specific audience, objectives, and requirements
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-600">
                Export to PDF, HTML, presentation slides, and more for maximum flexibility
              </p>
            </div>
          </div>
        </div>
      </div>

     
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Sparkles className="h-4 w-4" />
            <span>Made with Manus</span>
          </div>
        </div>
             </div>
     </div>

          
            {showEditPopup && editingCourse && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Side Panel */}
          <div className="w-full bg-white h-full shadow-2xl transform transition-transform duration-300 ease-in-out">
            {/* Side Panel Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Edit Course</h1>
                <button 
                  onClick={handleCancelEdit}
                  className="text-white hover:text-gray-200 text-2xl transition-colors p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Side Panel Content */}
            <div className="h-[calc(100vh-80px)] overflow-y-auto bg-gray-50">
              <div className="w-full p-6">
                
                {/* Title, Status, Level - All on One Line */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center gap-4">
                    {/* Title Input */}
                    <div className="flex-1">
                      <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 mb-1 block">
                        Title
                      </Label>
                      <Input
                        id="edit-title"
                        type="text"
                        placeholder="Enter course title"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex-1">
                      <Label
                        htmlFor="edit-status"
                        className="text-sm font-medium text-gray-700 mb-1 block"
                      >
                        Status
                      </Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Not Active">Not Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-end gap-2">
                      <Button
                        onClick={handleSaveRightSideModuleEdit}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                      >
                        Save Changes
                      </Button>

                      <Button
                        onClick={onCourseUploaded}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                      >
                        Go to Lesson
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lesson Content Section */}
                <div className="bg-white bg-opacity-98 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  {/* Decorative gradient bar */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400"></div>
                  
                  {/* TiptapEditor for rich text editing */}
                  <div className="mt-4 relative">
                    <TiptapEditor
                     
                      content={lessonContentInput}
                      onContentChange={(content) => {
                        // Only update state if it's a user-initiated change, not programmatic
                        if (!isUpdatingContent && content !== lessonContentInput) {
                          setLessonContentInput(content);
                        }
                      }}
                      onTextSelection={(selectedText) => {
                        setSelectedText(selectedText);
                        if (selectedText.trim()) {
                          setShowAskQueryButton(true);
                        }
                      }}
                      className="min-h-[400px] prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
                      editorRef={tiptapEditorRef}
                      onReady={() => {
                        setIsEditorReady(true);
                        
                        // Use a delay to ensure the ref methods are available
                        setTimeout(() => {
                          // Enhanced content restoration logic
                          if (tiptapEditorRef.current && typeof tiptapEditorRef.current.getHTML === 'function') {
                            try {
                              const currentEditorContent = tiptapEditorRef.current.getHTML();
                              const expectedContent = formatContentForEditor(lessonContentInput);
                              
                              // Normalize content for comparison to avoid whitespace issues
                              const normalizedCurrent = currentEditorContent.replace(/\s+/g, ' ').trim();
                              const normalizedExpected = expectedContent.replace(/\s+/g, ' ').trim();
                              
                              // Check if content needs to be restored
                              if (normalizedCurrent !== normalizedExpected) {
                                // Only set content if the editor is empty or has default content
                                if (currentEditorContent === '<p>' || 
                                    currentEditorContent === '<p></p>' ||
                                    currentEditorContent === '' ||
                                    currentEditorContent === '<p><br></p>' ||
                                    !hasAIResponse(currentEditorContent)) {
                                  
                                  if (lessonContentInput && 
                                      lessonContentInput !== '<p>' &&
                                      lessonContentInput.trim() !== '') {
                                    
                                    console.log('🔄 Setting content in onReady callback');
                                    console.log('Expected content preview:', normalizedExpected.substring(0, 100));
                                    
                                    tiptapEditorRef.current.setContent(expectedContent);
                                    
                                    // Force a re-render to ensure content is displayed
                                    setForceEditorUpdate(prev => prev + 1);
                                  }
                                }
                              }
                            } catch (error) {
                              console.error('❌ Error setting content after editor ready:', error);
                            }
                          } else {
                            console.log('⏳ Editor ref methods not ready yet, will retry...');
                          }
                        }, 100); // Small delay to ensure ref is set up
                      }}
                    />
                    
                    {/* Ask Query Button - Right Side */}
                    {showAskQueryButton && (
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
                          onClick={() => {
                            setShowAskQueryButton(false);
                            setTimeout(() => setIsPopupOpen(true), 100);
                          }}
                        >
                          Ask Query
                        </button>
                      </div>
                    )}
                    
                    {/* Visual indicator when content has been attached */}
                    {lessonContentInput && hasAIResponse(lessonContentInput) && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-700">
                          <span className="mr-2">✅</span>
                          <span className="text-sm font-medium">AI content has been attached to this lesson</span>
                        </div>
                        <div className="mt-2 text-xs text-green-600">
                          Scroll down to see the attached AI responses at the bottom of your content.
                        </div>
                      </div>
                    )}
                    
                    {/* Debug Info */}
                    <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                      <button
                        onClick={debugContentState}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        🔍 Debug Content State
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation Popup */}
      {showTooltip && (
        <div 
          ref={tooltipRef}
          className="fixed bg-gray-900 text-white py-2 px-3 rounded-lg text-sm z-50 transition-opacity"
          style={{ 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          Click to explain this text
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-5 border-r-5 border-t-5 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* AI Explanation Overlay */}
      {isPopupOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={closePopup}
        ></div>
      )}

      {/* AI Explanation Popup */}
      {isPopupOpen && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-popupIn">
          {/* Header - Fixed */}
          <div className="border-b border-gray-200 p-5 flex justify-between items-center bg-white">
            <h3 className="text-xl font-bold text-gray-800">🧠 AI Explanation</h3>
            <button 
              className="text-gray-500 hover:text-red-500 text-2xl transition-colors"
              onClick={closePopup}
            >
              ✕
            </button>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
            <div className="p-5 border-b border-gray-100 bg-gray-50 rounded-t-lg">
              <strong className="text-gray-700">Selected text:</strong>
              <div className="mt-2 relative">
                <input
                  type="text"
                  className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedText}
                  onChange={(e) => setSelectedText(e.target.value)}
                  placeholder="Selected text will appear here..."
                />
                {selectedText && (
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSelectedText('')}
                    title="Clear selected text"
                  >
                    ✕
                  </button>
                )}
              </div>


              <div className="flex-1">
                      <Label
                        htmlFor="edit-level"
                        className="text-sm font-medium text-gray-700 mb-1 block"
                      >
                        QAFF Level
                      </Label>
                      <Select
                        value={editForm.level}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, level: value as QAQF_LEVELS }))
                        }
                      >
                        <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          <SelectValue placeholder="Select QAFF level" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(QAQF_LEVELS).map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

            </div>
            
            <div className="p-5 flex flex-wrap gap-2">
              {['explain', 'summary', 'detailed', 'examples'].map((type) => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    currentExplanationType === type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 transform -translate-y-0.5'
                      : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                  }`}
                  onClick={() => setCurrentExplanationType(type)}
                >
                  {type === 'explain' && '💡 Explain'}
                  {type === 'summary' && '📝 Summary'}
                  {type === 'detailed' && '🔍 Detailed'}
                  {type === 'examples' && '📋 Examples'}
                </button>
              ))}
            </div>
            
            <div className="p-5">
              <button
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center"
                onClick={sendExplanationRequest}
                disabled={isLoading || isAIGenerating}
              >
                {isLoading || isAIGenerating ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isAIGenerating ? 'Get AI Explanation...' : 'Get Ai Explaination...'}
                  </div>
                ) : (
                  <>
                    🚀 Get AI Explanation
                  </>
                )}
              </button>
              
              {aiResponse && (
                <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-green-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex justify-between items-center">
                    <span>🤖 AI Response ({responseHistory.length} responses)</span>
                    <button
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-300 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        setAiResponse('');
                        setResponseHistory([]);
                      }}
                      title="Clear all responses"
                    >
                      🗑️ Clear
                    </button>
                  </h4>
                  <div className="text-gray-700 max-h-60 overflow-y-auto space-y-4">
                    {responseHistory.map((response, index) => (
                      <div 
                        key={response.timestamp}
                        className={`p-3 rounded-lg border ${
                          index === 0 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {index === 0 && (
                          <div className="text-xs text-blue-600 font-semibold mb-2 flex items-center">
                            <span className="mr-1">🆕</span> Latest Response
                          </div>
                        )}
                        <div 
                          className="text-sm"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(response.content) }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(response.timestamp).toLocaleTimeString()} - {response.type}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                                          <button
                        className="flex-1 py-2 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                        onClick={() => {
                          forceUpdateEditorContent();
                          attachExplanation();
                        }}
                      >
                        ✅ Attach to Course
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

           {/* Delete Course Confirmation Popup */}
      {showDeletePopup && deletingCourse && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cancelDeleteCourse}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Delete Course</h3>
            </div>

            <div className="space-y-4 w-[500px]">
              <div className="text-center flex flex-col items-center justify-center">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this Course ID: <span className="font-mono text-red-700">{deletingCourse.id}</span>
                </p>
              </div>

             <div className="flex justify-end space-x-3 pt-4">
               <Button
                 variant="outline"
                 onClick={cancelDeleteCourse}
               >
                 Cancel
               </Button>
               <Button
                 onClick={confirmDeleteCourse}
                 className="bg-red-600 hover:bg-red-700"
               >
                 Delete
               </Button>
             </div>
           </div>
         </div>
       </div>
     )}
     </>
   )
 }

// Add CSS animations for the popup
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes popupIn {
    from { 
      opacity: 0; 
      transform: translate(-50%, -50%) scale(0.9);
    }
    to { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  @keyframes highlightPulse {
    0% { 
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
      transform: scale(1);
    }
    50% { 
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.3);
      transform: scale(1.02);
    }
    100% { 
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
      transform: scale(1);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-popupIn {
    animation: popupIn 0.3s ease-out;
  }
  
  /* Prevent blinking in TiptapEditor */
  .ProseMirror {
    transition: none !important;
  }
  
  .ProseMirror * {
    transition: none !important;
  }
  
  /* Fix for AI response formatting */
  .ProseMirror div[style*="background: linear-gradient(135deg, #f0f9ff"] {
    margin: 16px 0 !important;
    padding: 16px !important;
    border-radius: 8px !important;
    border-left: 4px solid #3b82f6 !important;
    white-space: normal !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  
  /* Ensure proper spacing in AI response content */
  .ProseMirror div[style*="background: linear-gradient(135deg, #f0f9ff"] p {
    margin: 8px 0 !important;
    line-height: 1.6 !important;
  }
  
  /* Fix spacing issues in AI response headers */
  .ProseMirror h3[style*="color: #1e40af"] {
    margin: 0 0 12px 0 !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    line-height: 1.4 !important;
  }
  
  /* Ensure proper content flow */
  .ProseMirror p {
    margin: 0.5em 0 !important;
  }
  
  /* Fix for content overflow */
  .ProseMirror {
    overflow-wrap: break-word !important;
    word-wrap: break-word !important;
  }
  
  /* Ensure AI response content is properly styled */
  .ProseMirror h3[style*="color: #1e40af"] {
    margin: 0 0 12px 0 !important;
    font-size: 18px !important;
    font-weight: 600 !important;
  }
  
  /* Fix for timestamp styling */
  .ProseMirror div[style*="font-size: 12px; color: #6b7280"] {
    margin-top: 12px !important;
    padding-top: 8px !important;
    border-top: 1px solid #dbeafe !important;
  }
  
  /* Fix for list formatting in production */
  .ProseMirror ul {
    list-style-type: disc !important;
    margin: 1em 0 !important;
    padding-left: 2em !important;
  }
  
  .ProseMirror ol {
    list-style-type: decimal !important;
    margin: 1em 0 !important;
    padding-left: 2em !important;
  }
  
  .ProseMirror li {
    margin: 0.5em 0 !important;
    line-height: 1.6 !important;
  }
  
  /* Ensure proper spacing for list items */
  .ProseMirror ul li, .ProseMirror ol li {
    display: list-item !important;
    list-style-position: outside !important;
  }
  
  /* Fix for nested lists */
  .ProseMirror ul ul, .ProseMirror ol ol, .ProseMirror ul ol, .ProseMirror ol ul {
    margin: 0.5em 0 !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default CourseGeneratorPlatform
