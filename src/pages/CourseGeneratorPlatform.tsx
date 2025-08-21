import { useState, useEffect } from 'react';
import { Sparkles, Target, Palette, FileText, Edit, Trash2, BookOpen, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseType, courseTypes } from '../types/courseTypes';
import { CourseTypeCard } from '../pages/CourseTypeCard';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import React, { useRef} from 'react';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ReactElement } from 'react';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import TiptapEditor from '../components/TiptapEditor';
import 'react-toastify/dist/ReactToastify.css';

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
  const [courses, setCourses] = useState<{ id: string, title: string, description?: string, status?: string, lessonContent?: string }[]>([]);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<{ id: string, title: string } | null>(null);
  const [editingCourse, setEditingCourse] = useState<{ id: string, title: string, description: string, status: string, lessonContent?: string } | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    status: 'Active'
  });

  // Add lesson content state
  const [lessonContentInput, setLessonContentInput] = useState<string>('<p>Start typing your lesson content here...</p>');

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
  
  // Refs
  const lessonContentRef = useRef<HTMLDivElement>(null);
  const tiptapEditorRef = useRef<any>(null);
  const selectedTextEditorRef = useRef<any>(null);
  const explanationCounter = useRef<number>(0);
  const tooltipRef = useRef<HTMLDivElement>(null);


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

      const response = await fetch('http://localhost:5000/api/courses', {
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
        
        console.log('Course uploaded successfully:', result);
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

  console.log('Finding position for selected text:', selectedText);
  console.log('Clean selected text:', cleanSelectedText);

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
      console.log('Found element at index (end of selection):', elementIndex);
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
      console.log('Found matching word in line:', i, 'Line content:', lines[i]);
    }
  }

  if (lastMatchingLine !== -1) {
    console.log('Returning last matching line:', lastMatchingLine);
    return lastMatchingLine;
  }

  // Final fallback: try exact/partial text match
  for (let i = lines.length - 1; i >= 0; i--) {
    const cleanLine = lines[i].replace(/\s+/g, ' ').toLowerCase();
    if (
      cleanLine.includes(cleanSelectedText) ||
      cleanSelectedText.includes(cleanLine)
    ) {
      console.log('Found exact match at line:', i);
      return i;
    }
  }

  console.log('No match found for selected text');
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
      console.log('Complex selection detected');
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
      const qaqf_level = "1"; // Default QAQF level
      const subject = selectedText;
      const userquery = aiQuery || `Please ${currentExplanationType} this text: ${selectedText}`;

      const response = await fetch('http://69.197.176.134:5000/api/ai/assessment-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          generation_type,
          material,
          qaqf_level,
          subject,
          userquery,
          courseid: '', // You can add course ID if needed
        }),
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

  // Attach AI response to TipTap Editor content
  const attachExplanation = () => {
    // Get the latest response (first in the array)
    const latestResponse = responseHistory[0];
    if (!latestResponse) {
      alert('No AI response available to attach. Please generate a response first.');
      return;
    }
    
    // Format the AI response for better presentation (HTML format for TiptapEditor)
    const formattedResponse = `
<div style="margin-top: 2rem; padding: 1rem; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; border-radius: 8px;">
  <h3 style="color: #1e40af; margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">🤖 AI Response: ${latestResponse.type.charAt(0).toUpperCase() + latestResponse.type.slice(1)}</h3>
  <div style="color: #374151; line-height: 1.6;">
    ${latestResponse.content.replace(/\n/g, '<br>')}
  </div>
  <hr style="margin: 1rem 0; border: none; border-top: 1px solid #d1d5db;">
  <p style="margin: 0; font-size: 0.875rem; color: #6b7280; font-style: italic;">
    📅 Attached on ${new Date().toLocaleString()}
  </p>
</div>
`;
    
    console.log('=== Starting AI Content Attachment ===');
    console.log('Latest response:', latestResponse);
    console.log('Formatted response length:', formattedResponse.length);
    
    // Method 1: Try to use TiptapEditor's insertContent at the end
    if (tiptapEditorRef.current && tiptapEditorRef.current.editor) {
      try {
        const editor = tiptapEditorRef.current.editor;
        console.log('TiptapEditor found, attempting to append content');
        
        // Move cursor to the end of the document
        const docSize = editor.state.doc.content.size;
        editor.commands.setTextSelection(docSize);
        
        // Insert the AI response at the end
        editor.commands.insertContent(formattedResponse);
        
        // Get the updated content and sync state
        const updatedContent = editor.getHTML();
        setLessonContentInput(updatedContent);
        
        console.log('✅ AI response successfully appended using insertContent');
        console.log('Updated content length:', updatedContent.length);
        
        toast({
          title: 'Success',
          description: 'AI response has been attached to the end of your lesson content!'
        });
        
      } catch (error) {
        console.error('❌ Error with insertContent method:', error);
        
        // Method 2: Fallback - Get current content and append manually
        try {
          const editor = tiptapEditorRef.current.editor;
          const currentContent = editor.getHTML();
          console.log('Current content length:', currentContent.length);
          
          const newContent = currentContent + formattedResponse;
          editor.commands.setContent(newContent);
          setLessonContentInput(newContent);
          
          console.log('✅ AI response appended using setContent fallback');
          console.log('New content length:', newContent.length);
          
          toast({
            title: 'Success',
            description: 'AI response has been attached to the end of your lesson content!'
          });
          
        } catch (fallbackError) {
          console.error('❌ Error with setContent fallback:', fallbackError);
          
          // Method 3: Final fallback - Update state directly
          const currentContent = lessonContentInput || '';
          const newContent = currentContent + formattedResponse;
          setLessonContentInput(newContent);
          
          console.log('✅ AI response appended using state update fallback');
          console.log('New content length:', newContent.length);
          
          // Force update the TiptapEditor content directly with a delay
          setTimeout(() => {
            if (tiptapEditorRef.current && tiptapEditorRef.current.editor) {
              try {
                tiptapEditorRef.current.editor.commands.setContent(newContent);
                console.log('✅ TiptapEditor content updated directly');
              } catch (error) {
                console.error('❌ Error updating TiptapEditor directly:', error);
              }
            }
          }, 200);
          
          toast({
            title: 'Success',
            description: 'AI response attached to lesson content successfully!'
          });
        }
      }
    } else {
      console.log('❌ TiptapEditor not available, using state update only');
      
      // Method 4: Editor not available - Update state only
      const currentContent = lessonContentInput || '';
      const newContent = currentContent + formattedResponse;
      setLessonContentInput(newContent);
      
      console.log('✅ AI response appended using state update only');
      console.log('New content length:', newContent.length);
      
      // Try to update editor later if it becomes available
      setTimeout(() => {
        if (tiptapEditorRef.current && tiptapEditorRef.current.editor) {
          try {
            tiptapEditorRef.current.editor.commands.setContent(newContent);
            console.log('✅ TiptapEditor content updated with delay');
          } catch (error) {
            console.error('❌ Error updating TiptapEditor with delay:', error);
          }
        }
      }, 300);
      
      toast({
        title: 'Success',
        description: 'AI response attached to lesson content successfully!'
      });
    }
    
    console.log('=== AI Content Attachment Complete ===');
    
    // Clear the AI response and close the dialog
    setAiResponse('');
    setResponseHistory([]);
    setIsPopupOpen(false); // Close the popup
  };

  // Update selected text in TiptapEditor when edited in popup
  const updateSelectedTextInEditor = (newText: string) => {
    if (tiptapEditorRef.current && selectedText && newText !== selectedText) {
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
          
          console.log('✅ Selected text updated in TiptapEditor');
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
    
    console.log('Rendering lesson content with explanations:', sortedExplanations);
    console.log('Total explanations:', explanations.length);
    console.log('Line positions of explanations:', sortedExplanations.map(exp => exp.position));
    console.log('Total lines in content:', lines.length);
    
    let result: ReactElement[] = [];
    let explanationIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
    
      result.push(
        <div key={`line-${i}`} className="mb-2" dangerouslySetInnerHTML={{ __html: parseMarkdown(lines[i]) }}></div>
      );
      
      // Check if there are explanations to insert after this line
      while (explanationIndex < sortedExplanations.length && sortedExplanations[explanationIndex].position === i) {
        const explanation = sortedExplanations[explanationIndex];
        console.log(`Inserting explanation ${explanation.id} after line ${i} for text: "${explanation.content.substring(0, 50)}..."`);
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
        console.log('Auto-converted markdown to HTML in useEffect');
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
        const res = await fetch('/api/courses', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        const coursesData = Array.isArray(data) ? data : [];
        setCourses(coursesData);
        console.log("Courses loaded:", coursesData);
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
        status: mappedStatus
      });
      // Set lesson content to default or from course data if available
      let content = course.description || '<p>Start typing your lesson content here...</p>';
      
      // Convert markdown to HTML if the content contains markdown formatting
      if (content && (content.includes('**') || content.includes('*') || content.includes('`'))) {
        content = content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>');
        console.log('Converted markdown content to HTML:', content.substring(0, 200));
      }
      
      setLessonContentInput(content);
      setShowEditPopup(true);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      const token = localStorage.getItem('token');
      const userid = localStorage.getItem('userid') || '1'; 
      
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
        setEditForm({ title: '', status: 'active' });
        
        console.log('Course updated successfully');
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

    try {
      const token = localStorage.getItem('token');
      const userid = localStorage.getItem('userid') || '1'; 
      
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          title: editForm.title,
          status: editForm.status,
          description: lessonContentInput,
          userid: userid
        })
      });

      if (response.ok) {
        // Update the courses list
        setCourses(prev => prev.map(course => 
          course.id === editingCourse.id 
            ? { ...course, title: editForm.title, status: editForm.status, description: lessonContentInput }
            : course
        ));
       
        // Close the edit popup
        setShowEditPopup(false);
        setEditingCourse(null);
        setEditForm({ title: '', status: 'active' });
        
        console.log('Course updated successfully via right side module edit');
        toast({
          title: "API Created Successfully!",
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
    setShowEditPopup(false);
    setEditingCourse(null);
    setEditForm({ title: '', status: 'Active' });
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
        console.log('Course deleted successfully');
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
                
                {/* Title, Description, Status - All on One Line */}
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
                  <div className="mt-4">
                                      <TiptapEditor
                    content={lessonContentInput}
                    onContentChange={(content) => {
                      console.log('TiptapEditor content changed:', content.substring(0, 200));
                      setLessonContentInput(content);
                    }}
                    onTextSelection={(selectedText) => {
                      setSelectedText(selectedText);
                      if (selectedText.trim()) {
                        setIsPopupOpen(true);
                      }
                    }}
                    className="min-h-[400px] prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
                    editorRef={tiptapEditorRef}
                    onReady={() => {
                      console.log('TiptapEditor is ready');
                      // Force a content update to ensure proper rendering
                      if (tiptapEditorRef.current && tiptapEditorRef.current.editor) {
                        setTimeout(() => {
                          try {
                            const currentContent = lessonContentInput;
                            if (currentContent && currentContent.includes('**')) {
                              // Convert markdown to HTML if needed
                              const htmlContent = currentContent
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/`(.*?)`/g, '<code>$1</code>');
                              tiptapEditorRef.current.editor.commands.setContent(htmlContent);
                              setLessonContentInput(htmlContent);
                              console.log('Converted markdown to HTML:', htmlContent.substring(0, 200));
                            }
                          } catch (error) {
                            console.error('Error updating TiptapEditor content:', error);
                          }
                        }, 100);
                      }
                    }}
                  />
                    
                    {/* Visual indicator when content has been attached */}
                    {lessonContentInput && lessonContentInput.includes('<h2>AI Response:') && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-700">
                          <span className="mr-2">✅</span>
                          <span className="text-sm font-medium">AI content has been attached to this lesson</span>
                        </div>
                      </div>
                    )}
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
                      onClick={attachExplanation}
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
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-popupIn {
    animation: popupIn 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default CourseGeneratorPlatform
