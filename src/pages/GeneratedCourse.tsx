import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { Download, Eye, RotateCcw, Clock } from 'lucide-react';
import { GeneratedCourse } from '../types/courseTypes';
import { Button } from '../components/ui/button';
import { courseTypes } from '../types/courseTypes';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateCourseContent } from '../lib/api';
import TiptapEditor from '../components/TiptapEditor';
import { useLocation } from 'wouter';

// TypeScript interfaces
interface ExplanationAttachment {
  id: number;
  content: string;
  explanationType: string;
  isCollapsed: boolean;
  position: number; // Track position in content
}

// Basic cleanup to render API markdown-like content as plain text paragraphs
const stripBasicMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/__(.*?)__/g, '$1') // bold/underline
    .replace(/^#+\s*(.*)$/gm, '$1') // headings
    .replace(/`{1,3}([^`]*?)`{1,3}/g, '$1') // inline code
    .replace(/\*\s+/g, '') // bullets
    .replace(/^-\s+/gm, '') // dashes
    .replace(/\r?\n{2,}/g, '\n'); // condense blank lines
};

interface GeneratedCourseProps {
  course: GeneratedCourse;
  onCreateAnother: () => void;
  onExportPDF: () => void;
  onPreviewHTML: () => void;
}

export const GeneratedCourseComponent: React.FC<GeneratedCourseProps> = ({
  course,
  onCreateAnother,
  onExportPDF,
  onPreviewHTML
}) => {
  const courseType = courseTypes.find(type => type.id === course.courseType);
  const [, setLocation] = useLocation();
  
  // State variables
  const [selectedText, setSelectedText] = useState<string>('');
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
  
  // New state variables for editable course data
  const [editableTitle, setEditableTitle] = useState<string>(course.title || '');
  const [editableDescription, setEditableDescription] = useState<string>();
  const [editableLessonContent, setEditableLessonContent] = useState<string>(course.description || '');
  const [editableStatus, setEditableStatus] = useState<string>('active');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  // Refs
  const lessonContentRef = useRef<HTMLDivElement>(null);
  const tiptapEditorRef = useRef<any>(null);
  const explanationCounter = useRef<number>(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Parse markdown content
  const parseMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  // Save changes function
  const handleSaveChanges = async () => {
    // Get the actual course ID and convert to number
    let courseId: number;
    
    // Convert to number if it's a string
    if (typeof course.id === 'string') {
      courseId = parseInt(course.id, 10);
    } else {
      courseId = course.id as number;
    }
    
    // If courseId is not a valid number, create a new course instead
    if (!courseId || isNaN(courseId)) {
      // Create new course
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Authentication required. Please login again.");
          return;
        }

        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editableTitle,
            description: editableLessonContent,
            userid: "",
            status: editableStatus
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setSaveMessage('Course created successfully!');
          toast.success('Course created successfully!');
          // Update the course object with new values and ID
          course.title = editableTitle;
          course.description = editableLessonContent || '';
          course.id = result.id.toString(); // Update with new ID as string
          // Redirect to course-generator after successful creation
          setTimeout(() => {
            setLocation('/course-generator');
          }, 1500);
        } else {
          const errorData = await response.json();
          setSaveMessage(`Error creating course: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error creating course:', error);
        setSaveMessage('Error creating course. Please try again.');
      } finally {
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 3000);
      }
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editableTitle,
          lessonContent: editableLessonContent, // Use lesson content as description
          status: editableStatus
        }),
      });

      if (response.ok) {
        setSaveMessage('Changes saved successfully!');
        toast.success('Course updated successfully!');
        // Update the course object with new values
        course.title = editableTitle;
        course.description = editableLessonContent || '';
        // Redirect to course-generator after successful update
        setTimeout(() => {
          setLocation('/course-generator');
        }, 1500);
      } else {
        const errorData = await response.json();
        setSaveMessage(`Error saving changes: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      setSaveMessage('Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

 // Find the line number of selected text using TiptapEditor content
const findSelectedLinePosition = (selectedText: string): number => {
  const lines = editableLessonContent.split('\n');
  const cleanSelectedText = selectedText.trim().replace(/\s+/g, ' ').toLowerCase();

  console.log('Finding position for selected text:', selectedText);
  console.log('Clean selected text:', cleanSelectedText);

  // Find the last line containing part of the selected text
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

  // Handle text selection from TiptapEditor
  const handleTextSelection = (selectedText: string) => {
    if (selectedText && selectedText.trim() !== '') {
      setSelectedText(selectedText.trim());
      
      // Find the position of the selected line
      const linePosition = findSelectedLinePosition(selectedText.trim());
      setSelectedLinePosition(linePosition);
      
      // Show popup after delay
      setTimeout(() => {
        setIsPopupOpen(true);
        setShowTooltip(false);
      }, 300);
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
    setSelectedText(''); // Clear selected text
    
    // TiptapEditor handles its own selection clearing
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
    
    // Get current content from TipTap Editor
    const currentContent = editableLessonContent || '';
    
    // Format the AI response for better presentation
    const formattedResponse = `

## AI Response: ${latestResponse.type}

${latestResponse.content}

---
*Attached on ${new Date().toLocaleString()}*

`;
    
    // Check if we have selected text and should insert at selection
    if (selectedText && selectedText.trim() !== '' && tiptapEditorRef.current && tiptapEditorRef.current.editor) {
      try {
        // Get the editor instance
        const editor = tiptapEditorRef.current.editor;
        
        // Check if there's an active selection in the editor
        if (editor.state.selection && !editor.state.selection.empty) {
          // Insert the AI response at the current selection
          const aiContent = `\n\n${formattedResponse}\n\n`;
          editor.commands.insertContent(aiContent);
          
          // Update the editableLessonContent state to match
          setEditableLessonContent(editor.getHTML());
          
          console.log('AI response inserted at selection location');
          toast.success('AI response inserted at selected text location!');
        } else {
          // Fallback: append to end if no active selection
          const newContent = currentContent + formattedResponse;
          setEditableLessonContent(newContent);
          
          // Force update the TiptapEditor content directly with a small delay
          setTimeout(() => {
            if (tiptapEditorRef.current && tiptapEditorRef.current.editor) {
              try {
                tiptapEditorRef.current.editor.commands.setContent(newContent);
                console.log('TiptapEditor content updated directly (fallback)');
              } catch (error) {
                console.error('Error updating TiptapEditor directly:', error);
              }
            }
          }, 100);
          
          console.log('AI response attached to lesson content at the end (fallback)');
          toast.success('AI response attached to lesson content successfully!');
        }
      } catch (error) {
        console.error('Error inserting AI response at selection:', error);
        
        // Fallback: append to end if insertion fails
        const newContent = currentContent + formattedResponse;
        setEditableLessonContent(newContent);
        
        setTimeout(() => {
          if (tiptapEditorRef.current && tiptapEditorRef.current.editor) {
            try {
              tiptapEditorRef.current.editor.commands.setContent(newContent);
            } catch (error) {
              console.error('Error updating TiptapEditor directly:', error);
            }
          }
        }, 100);
        
        toast.success('AI response attached to lesson content successfully!');
      }
    } else {
      // Original behavior: append to end if no selection
      const newContent = currentContent + formattedResponse;
      setEditableLessonContent(newContent);
      
      // Force update the TiptapEditor content directly with a small delay
      setTimeout(() => {
        if (tiptapEditorRef.current && tiptapEditorRef.current.editor) {
          try {
            tiptapEditorRef.current.editor.commands.setContent(newContent);
            console.log('TiptapEditor content updated directly');
          } catch (error) {
            console.error('Error updating TiptapEditor directly:', error);
          }
        }
      }, 100);
      
      console.log('AI response attached to lesson content at the end:', latestResponse.content.substring(0, 100) + '...');
      toast.success('AI response attached to lesson content successfully!');
    }
    
    // Clear the AI response and close the dialog
    setAiResponse('');
    setResponseHistory([]);
    setIsPopupOpen(false); // Close the popup
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





  // Load generated content from localStorage when component mounts
  useEffect(() => {
    const loadGeneratedContent = () => {
      try {
        const savedContent = localStorage.getItem('latest_generated_course_content');
        if (savedContent) {
          console.log('📚 Loading generated content from localStorage:', savedContent.substring(0, 100) + '...');
          setEditableLessonContent(savedContent);
          // Clear the localStorage after loading to avoid showing old content on next visit
          localStorage.removeItem('latest_generated_course_content');
        } else {
          console.log('📚 No generated content found in localStorage');
        }
      } catch (error) {
        console.error('❌ Error loading generated content:', error);
      }
    };

    loadGeneratedContent();
  }, []);

  // Ensure TiptapEditor content is synchronized when editableLessonContent changes
  useEffect(() => {
    if (tiptapEditorRef.current && tiptapEditorRef.current.editor && editableLessonContent) {
      const currentEditorContent = tiptapEditorRef.current.editor.getHTML();
      if (currentEditorContent !== editableLessonContent) {
        console.log('Syncing TiptapEditor content with editableLessonContent');
        tiptapEditorRef.current.editor.commands.setContent(editableLessonContent);
      }
    }
  }, [editableLessonContent]);



  // Function to upload course to API
  const onCourseUploaded = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token being used:', token);
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      // Get the lesson content from TiptapEditor
      const lessonContent = editableLessonContent || '';
      
      const courseData = {
        title: editableTitle,
        lessonContent: lessonContent,
        status: editableStatus
      };
      
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Course successfully added to Lesson Plan!');
        
        // Optionally, you can navigate to LessonPlan page or refresh the courses list
        // window.location.href = '/lesson-plan';
        
        console.log('Course uploaded successfully:', result);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to upload course: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading course:', error);
      toast.error('Error uploading course. Please try again.');
    }
  };
  
  return (
    <div className=" space-y-8 animate-fade-in   ">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Success Header */}
      <div className="space-y-4 w-[100%] ">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Course Generated Successfully!
          </h1>
          <p className="text-gray-600 mt-2">
            Your course has been generated and is ready for export
          </p>
        </div>
      
       
      </div>  

             {/* Course Content */}
             <div className="content-container">
       <div className="min-l 
           bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
         <div className="w-full max-w-none mx-auto lesson-content-container">
           
           {/* Course Input Form */}
         
         

          {/* Selection Tooltip */}
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

          {/* Overlay */}
          {isPopupOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn"
              onClick={closePopup}
            ></div>
          )}

          {/* Popup */}
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

          {/* Lesson Header */}
          <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-xl w-full">
          
             <div className="space-y-4">
               {/* Title Input */}
               <div className="flex items-center gap-4">
                 <input
                   type="text"
                   placeholder="Course Title"
                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   value={editableTitle}
                   onChange={(e) => setEditableTitle(e.target.value)}
                 />
                 
                 <select
                   className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editableStatus}
                    onChange={(e) => setEditableStatus(e.target.value)}
                 >
                   <option value="active">Active</option>
                   <option value="inactive">Inactive</option>
                 </select>
                 
                 <Button
                   className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                   onClick={handleSaveChanges}
                   disabled={isSaving}
                 >
                   {isSaving ? 'Saving...' : 'Save Changes'}
                 </Button>
               </div>
               
              
              
               
               {/* Save Message */}
               {saveMessage && (
                 <p className={`text-sm ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                   {saveMessage}
                 </p>
               )}
             </div>
          
          </div>

          {/* Lesson Content */}
          <div 
            ref={lessonContentRef}
            className="bg-white bg-opacity-98 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden w-full min-h-1000vh]"
          >
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400"></div> 
            
            {/* TiptapEditor for lesson content */}
            <TiptapEditor
              key={`tiptap-${editableLessonContent?.length || 0}`}
              content={editableLessonContent || course.description || 'Start typing your lesson content here...'}
              onContentChange={setEditableLessonContent}
              onTextSelection={handleTextSelection}
              className="min-h-[800px] prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none"
              editorRef={tiptapEditorRef}
            />
            
            {/* Visual indicator when content has been attached */}
            {editableLessonContent && editableLessonContent.includes('## AI Response:') && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <span className="mr-2">✅</span>
                  <span className="text-sm font-medium">AI content has been attached to this lesson</span>
                </div>
              </div>
            )}
            
            {/* Explanations */}
            {explanations.length > 0 && (
              <div className="mt-8">
                {explanations.map((explanation) => (
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
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* CSS Animations */}
        <style>{`
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
          
          @keyframes slideIn {
            from { 
              opacity: 0; 
              transform: translateY(20px);
            }
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          
          .animate-popupIn {
            animation: popupIn 0.3s ease-out;
          }
          
          .animate-slideIn {
            animation: slideIn 0.4s ease-out;
          }
          
          /* Fix text formatting and overflow */
          [contenteditable="true"] {
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
            hyphens: auto !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            width: 100% !important;
          }
          
          [contenteditable="true"] * {
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
            max-width: 100% !important;
          }
          
          /* Full width content area */
          .lesson-content-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            position: relative !important;
            left: 0 !important;
            right: 0 !important;
          }
        `}</style>
      </div>
      </div>
    

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onExportPDF}
          className="flex-1 sm:flex-none min-w-48"
        >
          <Download className="h-4 w-4 mr-2" />
          Export as PDF
        </Button>
        <Button
          onClick={onPreviewHTML}
          variant="outline"
          className="flex-1 sm:flex-none min-w-48"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview HTML
        </Button>

        <Button
          onClick={onCourseUploaded}
          className="flex-1 sm:flex-none min-w-48"
        >
          <Download className="h-4 w-4 mr-2" />
          Go to Lesson
        </Button>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onCreateAnother}
          variant="ghost"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Create Another Course
        </Button>
      </div>
    </div>
  );
};

