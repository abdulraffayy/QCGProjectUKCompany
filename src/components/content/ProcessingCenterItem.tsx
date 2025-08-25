import React, { useState, useEffect } from "react";
import { useRef,} from 'react';
import TiptapEditor from '../TiptapEditor';


import { MODULE_TYPE_OPTIONS } from "../../types";
import { QAQF_LEVELS } from "../../types";
import {
  Card,

  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";


import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Video,
  BookOpen,
  Settings,
  X,
  User,
  Shield,
  Edit3,
} from "lucide-react";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// TypeScript interfaces
interface ExplanationAttachment {
  id: number;
  content: string;
  explanationType: string;
  isCollapsed: boolean;
  position: number; // Track position in content
  selectedText?: string; // Store the selected text for reference
}

interface ProcessingCenterItemProps {
  item: {
    id: string;
    title: string;
    type: string;
    status?: "verified" | "unverified" | "rejected" | "pending";
    progress?: number;
    createdAt: string;
    createdBy: string;
    description?: string;
    qaqfLevel?: number;
    level?: number;
    qaqf_level?: number;
    qaqfComplianceScore?: number;
    estimatedTime?: string;
    content?: string;
    metadata?: any;
    verificationStatus?: "verified" | "unverified" | "rejected" | "pending"; // Add verification status
  };
  lessons?: any[];
  onAction?: (action: string, itemId: string, newDescription?: string) => void;
  selectedCourseId?: string; // Add selected course ID prop
}

const ProcessingCenterItem: React.FC<ProcessingCenterItemProps> = ({
  item,
  onAction,
  selectedCourseId,
}) => {

  const [status] = useState(item.status || "pending");
  const [editorContent, setEditorContent] = useState<string>('');
 
  
  // Helper function to convert numeric level to full QAQF string
  const getQaqfLevelString = (level: any): string => {
    if (!level) return "";
    
    // If it's already a full string, return as is
    if (typeof level === 'string' && level.includes('Qaqf Level')) {
      return level;
    }
    
    // If it's a number, convert to full string
    const levelMap: { [key: number]: string } = {
      1: "Qaqf level 1 – Awareness",
      2: "Qaqf Level 2 – Application", 
      3: "Qaqf Level 3 – Competence",
      4: "Qaqf Level 4 – Functional Independence",
      5: "Qaqf Level 5 – Adaptive Performance",
      6: "Qaqf Level 6 – Proficient Practitioner",
      7: "Qaqf Level 7 – Specialist Expertise",
      8: "Qaqf Level 8 – Strategic Leadership",
      9: "Qaqf Level 9 – Mastery / Innovation"
    };
    
    const numLevel = typeof level === 'string' ? parseInt(level) : level;
    return levelMap[numLevel] || "";
  };

  // Add state for editable fields
  const [editableData, setEditableData] = useState({
    title: item.title || "",
    type: item.type || "",
    duration: (item.metadata && item.metadata.duration) || "",
    level: getQaqfLevelString(item.level || item.qaqfLevel),
    userid: (item.metadata && item.metadata.userid) || "",
    courseid: (item.metadata && item.metadata.courseid) || "",
    description: item.description || (item.metadata && item.metadata.description) || "",
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Add state for card height (for resizing)
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isResizing = React.useRef(false);

  // Force re-render when description changes
  const [, setDescriptionUpdateTrigger] = useState(0);

  // State variables for AI explanation
  const [selectedText, setSelectedText] = useState<string>('');
  const [editableInputText, setEditableInputText] = useState<string>('');
  const [explanationAttached, setExplanationAttached] = useState<boolean>(false);
  
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentExplanationType, setCurrentExplanationType] = useState<string>('explain');
  const [aiResponse, setAiResponse] = useState<string>('');

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  // New state variables for AI API
  const [isAIGenerating, setIsAIGenerating] = useState<boolean>(false);
  const [responseHistory, setResponseHistory] = useState<Array<{type: string, content: string, timestamp: number}>>([]);
  
  // Refs
  const lessonContentRef = useRef<HTMLDivElement>(null);
  const tiptapEditorRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // AI Explanation state for Edit Lesson dialog
  const [editLessonSelectedText, setEditLessonSelectedText] = useState<string>('');
  const [editLessonIsPopupOpen, setEditLessonIsPopupOpen] = useState<boolean>(false);
  const [editLessonIsLoading, setEditLessonIsLoading] = useState<boolean>(false);
  const [editLessonCurrentExplanationType, setEditLessonCurrentExplanationType] = useState<string>('explain');
  const [editLessonAiResponse, setEditLessonAiResponse] = useState<string>('');
  const [editLessonShowTooltip, setEditLessonShowTooltip] = useState<boolean>(false);
  const [editLessonTooltipPosition, setEditLessonTooltipPosition] = useState({ x: 0, y: 0 });
  const [editLessonAiQuery, setEditLessonAiQuery] = useState<string>('');
  const [editLessonAiReference, setEditLessonAiReference] = useState<string>('');
  const [editLessonIsAIGenerating, setEditLessonIsAIGenerating] = useState<boolean>(false);
  const [editLessonResponseHistory, setEditLessonResponseHistory] = useState<Array<{type: string, content: string, timestamp: number}>>([]);
  const [editLessonSelectedLinePosition, setEditLessonSelectedLinePosition] = useState<number>(-1);
  const [editLessonSelectedLineEndPosition, setEditLessonSelectedLineEndPosition] = useState<number>(-1);
  const [editLessonIsEditorReady, setEditLessonIsEditorReady] = useState<boolean>(false);
  
  // New state for Ask Query button
  const [editLessonShowAskQueryButton, setEditLessonShowAskQueryButton] = useState<boolean>(false);
  const [editLessonAskQueryButtonPosition, setEditLessonAskQueryButtonPosition] = useState({ x: 0, y: 0 });

  // Refs for Edit Lesson dialog
  const editLessonTiptapEditorRef = useRef<any>(null);
  const editLessonSelectedTextEditorRef = useRef<any>(null);
  const editLessonAiResponseEditorRef = useRef<any>(null);
  const editLessonTooltipRef = useRef<HTMLDivElement>(null);

  
  // Parse markdown content
  const parseMarkdown = (text: string): string => {
    if (!text) return '';
    
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Ensure proper HTML structure - wrap in p tags if not already wrapped
    if (!html.startsWith('<p>')) {
      html = '<p>' + html + '</p>';
    }
    
    // Fix any nested ul/ol inside p tags by moving them outside
    html = html.replace(/<p>(.*?)<ul>(.*?)<\/ul>(.*?)<\/p>/g, '<p>$1</p><ul>$2</ul><p>$3</p>');
    html = html.replace(/<p>(.*?)<ol>(.*?)<\/ol>(.*?)<\/p>/g, '<p>$1</p><ol>$2</ol><p>$3</p>');
    
    return html;
  };
  

  
  

  

  
      // Close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setAiResponse('');
    setEditableInputText('');
    setExplanationAttached(false);
    setResponseHistory([]); // Clear response history when closing popup
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // Handle text selection for Edit Lesson dialog
  const handleEditLessonTextSelection = (selectedText: string, selectionPosition?: {from: number, to: number}) => {
    if (selectedText && selectedText.trim() !== '') {
      const text = selectedText.trim();
      setEditLessonSelectedText(text);
      
      // Store selection position for later use
      if (selectionPosition) {
        setEditLessonSelectedLinePosition(selectionPosition.from);
        setEditLessonSelectedLineEndPosition(selectionPosition.to);
      }
      
      console.log('Edit Lesson - Selected text:', text);
      console.log('Edit Lesson - Selection position:', selectionPosition);
      
      // Calculate button position based on selection
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Ensure button doesn't go off-screen
        const buttonWidth = 100; // Approximate button width
        const buttonHeight = 32; // Approximate button height
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let x = rect.right + 10;
        let y = rect.top;
        
        // Adjust if button would go off the right edge
        if (x + buttonWidth > windowWidth - 20) {
          x = rect.left - buttonWidth - 10;
        }
        
        // Adjust if button would go off the bottom edge
        if (y + buttonHeight > windowHeight - 20) {
          y = rect.bottom - buttonHeight;
        }
        
        // Ensure minimum values
        x = Math.max(20, x);
        y = Math.max(20, y);
        
        setEditLessonAskQueryButtonPosition({ x, y });
        setEditLessonShowAskQueryButton(true);
      }
    } else {
      setEditLessonShowAskQueryButton(false);
    }
  };

  // Close popup for Edit Lesson dialog
  const closeEditLessonPopup = () => {
    setEditLessonIsPopupOpen(false);
    setEditLessonAiResponse('');
    setEditLessonAiQuery('');
    setEditLessonAiReference('');
    setEditLessonSelectedLinePosition(-1);
    setEditLessonSelectedLineEndPosition(-1);
    setEditLessonResponseHistory([]);
    setEditLessonIsEditorReady(false);
    setEditLessonShowAskQueryButton(false);
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // Handle Ask Query button click
  const handleAskQueryClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling
    if (editLessonSelectedText && editLessonSelectedText.trim() !== '') {
      setEditLessonShowAskQueryButton(false);
      setEditLessonIsPopupOpen(true);
      setEditLessonShowTooltip(false);
    }
  };

  // Handle click outside to hide Ask Query button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editLessonShowAskQueryButton) {
        const target = event.target as Element;
        // Hide button if clicking outside the editor or the button itself
        if (!target.closest('.ProseMirror') && !target.closest('[data-ask-query-button]')) {
          setEditLessonShowAskQueryButton(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editLessonShowAskQueryButton]);

  // Send AI explanation request for Edit Lesson dialog
  const sendEditLessonExplanationRequest = async () => {
    setEditLessonIsLoading(true);
    setEditLessonIsAIGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('User token is missing! Please login again.', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Map explanation types to generation types
      const generationTypeMap: { [key: string]: string } = {
        'explain': 'explanation',
        'summary': 'summary',
        'detailed': 'detailed_explanation',
        'examples': 'examples'
      };

      const generation_type = generationTypeMap[editLessonCurrentExplanationType] || 'explanation';
      const material = editLessonAiReference || editLessonSelectedText;
      const qaqf_level = "1"; // Default QAQF level
      const subject = editLessonSelectedText;
      const userquery = editLessonAiQuery || `Please ${editLessonCurrentExplanationType} this text: ${editLessonSelectedText}`;

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
        // ✅ Add new response to history
        const newResponse = {
          type: editLessonCurrentExplanationType,
          content: data.generated_content,
          timestamp: Date.now()
        };
        
        setEditLessonResponseHistory(prev => [...prev, newResponse]);
        
        // Update the main AI response to show all responses (newest first)
        const allResponses = [...editLessonResponseHistory, newResponse];
        const formattedResponses = allResponses.reverse().map((resp,) => {
          return resp.content;
        }).join('\n\n');
        
        setEditLessonAiResponse(formattedResponses);
      } else {
        setEditLessonAiResponse('No content generated. Please try again.');
      }
    } catch (error) {
      console.error('AI Generate error:', error);
      setEditLessonAiResponse('AI generation failed. Please check your connection and try again.');
    } finally {
      setEditLessonIsLoading(false);
      setEditLessonIsAIGenerating(false);
    }
  };

  // Attach explanation for Edit Lesson dialog
  const attachEditLessonExplanation = () => {
    console.log('Edit Lesson - Selected text:', editLessonSelectedText);
    console.log('Edit Lesson - AI Response:', editLessonAiResponse);
    console.log('Edit Lesson - Editor ref:', editLessonTiptapEditorRef.current);
    console.log('Edit Lesson - Selected line position:', editLessonSelectedLinePosition);
    console.log('Edit Lesson - Selected line end position:', editLessonSelectedLineEndPosition);
    
    // Check if editor is ready
    if (!editLessonTiptapEditorRef.current || !editLessonTiptapEditorRef.current.isReady() || !editLessonIsEditorReady) {
      console.error('❌ Edit Lesson Editor not ready');
      console.log('editLessonIsEditorReady:', editLessonIsEditorReady);
      console.log('editor.isReady():', editLessonTiptapEditorRef.current?.isReady());
      toast.error('Editor not ready. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Create formatted AI explanation content
    const formattedExplanation = `
<div class="my-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-md">
  <div class="font-bold text-gray-800 flex items-center mb-2">
    🤖 AI Explanation
  </div>
  <div class="mt-3 text-gray-700">
    ${editLessonAiResponse}
  </div>
</div>
    `;

    console.log('Edit Lesson - Formatted explanation:', formattedExplanation);

    try {
      // Always insert AI response at the end of the editor content
      const contentLength = editLessonTiptapEditorRef.current.getEditor().state.doc.content.size;
      const insertPosition = contentLength;
      const successMessage = 'AI explanation attached successfully at the bottom!';
      
      console.log('Edit Lesson - Appending to end of editor, position:', insertPosition);
      
      // Insert content at the end
      const result = editLessonTiptapEditorRef.current.insertContent(formattedExplanation, insertPosition);
      
      console.log('✅ Edit Lesson - AI response inserted successfully');
      console.log('Edit Lesson - Insert result:', result);
      
      // Update the lesson content state
      const newContent = editLessonTiptapEditorRef.current.getContent();
      setEditorContent(newContent);
      setEditableData(prev => ({ ...prev, description: newContent }));
      console.log('✅ Edit Lesson - Content updated');
      
      // Show success message
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      closeEditLessonPopup();
    } catch (error) {
      console.error('❌ Edit Lesson - Error inserting content:', error);
      
      // Fallback: try to update the state directly by appending to the end
      try {
        const currentContent = editorContent || '';
        const updatedContent = currentContent + formattedExplanation;
        setEditorContent(updatedContent);
        setEditableData(prev => ({ ...prev, description: updatedContent }));
        
        console.log('✅ Edit Lesson - Fallback: Updated lesson content state (appended to end)');
        toast.success(`AI explanation attached at the bottom (fallback method)!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        closeEditLessonPopup();
      } catch (fallbackError) {
        console.error('❌ Edit Lesson - Fallback also failed:', fallbackError);
        toast.error('Failed to insert AI explanation. Please try again.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
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
        const material = editableInputText || selectedText;
        const qaqf_level = "1"; // Default QAQF level
        const subject = editableInputText || selectedText;
        const userquery = `Please ${currentExplanationType} this text: ${editableInputText || selectedText}`;
  
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
           // ✅ Add new response to history
           const newResponse = {
             type: currentExplanationType,
             content: data.generated_content,
             timestamp: Date.now()
           };
           
           // Update response history and show all responses
           setResponseHistory(prev => {
             const updatedHistory = [...prev, newResponse];
             
                          // Format all responses (newest first) - no gaps between responses
             const formattedResponses = updatedHistory
               .sort((a, b) => b.timestamp - a.timestamp) // Sort newest first (new response above, old response below)
               .map((resp) => {
                 const time = new Date(resp.timestamp).toLocaleTimeString();
                 return `--- ${resp.type.toUpperCase()} (${time}) ---\n${resp.content}`;
               })
               .join('\n');
           
             // Set the AI response immediately
           setAiResponse(formattedResponses);
             
             return updatedHistory;
           });
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
  
    // Attach explanation to lesson content
    const attachExplanation = () => {
          const textToUse = editableInputText || selectedText;
    if (!textToUse.trim()) {
      toast.error('No text to explain. Please select some text or type something in the input field.', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    if (!aiResponse.trim()) {
      toast.error('No AI response to attach. Please generate an explanation first.', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
      
      // Format the explanation to match the API response format exactly - no gaps
      const formattedExplanation = `<div class="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <div class="text-sm text-blue-600 font-semibold mb-2">🤖 AI Explanation for: "${textToUse.substring(0, 50)}${textToUse.length > 50 ? '...' : ''}"</div>
          <div class="text-gray-700">
            ${aiResponse}
          </div>
        </div>`;
      
      // Append the explanation at the end of the TiptapEditor content
      if (tiptapEditorRef.current && tiptapEditorRef.current.getEditor) {
        try {
          const editor = tiptapEditorRef.current.getEditor();
          if (editor) {
            // Move cursor to the end of the document
            editor.commands.setTextSelection(editor.state.doc.content.size);
            
            // Insert the explanation at the end
            editor.commands.insertContent(formattedExplanation);
            
            // Show success message
            const successMessage = `✅ Explanation attached to the end of lesson content`;
            console.log(successMessage);
            
            // Show success and close popup
            setExplanationAttached(true);
            
            setTimeout(() => {
              closePopup();
            }, 1500);
          } else {
            // Fallback: append to end if editor is not available
            const newContent = editorContent + formattedExplanation;
            setEditorContent(newContent);
            setEditableData(prev => ({ ...prev, description: newContent }));
            
            setExplanationAttached(true);
            setTimeout(() => {
              closePopup();
            }, 1500);
          }
        } catch (error) {
          console.error('Error inserting content:', error);
          // Fallback: append to end if insertion fails
          const newContent = editorContent + formattedExplanation;
          setEditorContent(newContent);
          setEditableData(prev => ({ ...prev, description: newContent }));
          
          setExplanationAttached(true);
          setTimeout(() => {
            closePopup();
          }, 1500);
        }
      } else {
        // Fallback: append to end if editor ref is not available
        const newContent = editorContent + formattedExplanation;
        setEditorContent(newContent);
        setEditableData(prev => ({ ...prev, description: newContent }));
        
        setExplanationAttached(true);
        setTimeout(() => {
          closePopup();
        }, 1500);
      }
    };
  

  

  
  
  

  
  // Helper function to convert large timestamp IDs to smaller integers
  const getApiId = (id: string): number => {
    // If ID is already a small number (1-3 digits), return it
    if (/^\d{1,3}$/.test(id)) {
      return parseInt(id);
    }
    // For larger IDs, take the last 3 digits and convert to integer
    const last3Digits = id.slice(-3);
    const apiId = parseInt(last3Digits);
    console.log(`ID conversion: ${id} -> ${apiId}`);
    return apiId;
  };

  // Restore AI-generated content from localStorage if available
  useEffect(() => {
    const savedContent = localStorage.getItem(`processingCenterContent_${item.id}`);
    if (savedContent && savedContent !== editorContent) {
      setEditableData(prev => ({
        ...prev,
        description: savedContent
      }));
      setEditorContent(savedContent);
    }
  }, [item.id, editorContent]);

  // Initialize editor content when dialog opens
  useEffect(() => {
    if (isEditDialogOpen) {
      // Set the editor content to the current description
      const currentDescription = editableData.description || item.description || (item.metadata && item.metadata.description) || '';
      setEditorContent(currentDescription);
      console.log('Edit dialog opened with content:', currentDescription);
    }
  }, [isEditDialogOpen, editableData.description, item.description, item.metadata]);



  // Update editableData when item prop changes (e.g., after API update)
  useEffect(() => {
    // Force update with fresh data from item prop
    const newDescription = item.description || (item.metadata && item.metadata.description) || "";
    
    // Only update if the content has actually changed to avoid unnecessary re-renders
    if (newDescription !== editorContent) {
      setEditableData(prev => ({
        ...prev,
        title: item.title || "",
        type: item.type || "",
        description: newDescription,
        level: getQaqfLevelString(item.level || item.qaqfLevel),
        userid: (item.metadata && item.metadata.userid) || "",
        courseid: (item.metadata && item.metadata.courseid) || "",
        duration: (item.metadata && item.metadata.duration) || "",
      }));
      setEditorContent(newDescription);
    }
  }, [item.title, item.type, item.description, item.level, item.qaqfLevel, item.metadata, editorContent]);

  // Mouse event handlers for resizing (vertical only)
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isResizing.current && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const newHeight = e.clientY - rect.top;
        if (newHeight > 100) setCardHeight(newHeight); // minimum height
      }
    }
    function handleMouseUp() {
      isResizing.current = false;
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);



 

  // Add verification status functions
  const getVerificationStatusIcon = (verificationStatus: string | undefined) => {
    switch (verificationStatus) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "unverified":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVerificationStatusColor = (verificationStatus: string | undefined) => {
    switch (verificationStatus) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "unverified":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVerificationStatusText = (verificationStatus: string | undefined) => {
    switch (verificationStatus) {
      case "verified":
        return "Verified";
      case "rejected":
        return "Rejected";
      case "unverified":
        return "Unverified";
      case "pending":
        return "Pending";
      default:
        return "Pending";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "course":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  const handleDeleteLesson = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('User token is missing! Please login again.', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Convert large ID to smaller integer for API
      const apiId = getApiId(item.id);
      console.log(`Original ID: ${item.id}, API ID: ${apiId}`);

      const res = await fetch(`/api/lessons/${apiId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete lesson");
      
      // Mark as deleted immediately
      setIsDeleted(true);
      
      // Notify parent component about the deletion
      if (onAction) {
        onAction("deleted", item.id);
      }
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      toast.error("Could not delete lesson. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (courseid: string) => {
    console.log('Course ID being sent:', courseid);
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('User token is missing! Please login again.', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Convert large ID to smaller integer for API
      const apiId = getApiId(item.id);
      console.log(`Original ID: ${item.id}, API ID: ${apiId}`);

      // Get the current content from the Edit Lesson editor
      const currentContent = editLessonTiptapEditorRef.current?.getContent() || editorContent || editableData.description;

      const requestBody = {
        title: editableData.title,
        type: editableData.type,
        description: currentContent,
        level: editableData.level || null,
        userid: editableData.userid,
        courseid: editableData.courseid,
        duration: editableData.duration
      };

      const res = await fetch(`/api/lessons/${apiId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error("Failed to update lesson");
      

      
      // Store current cursor position before updating content
      const currentCursorPosition = editLessonTiptapEditorRef.current?.getCursorPosition?.() || 0;
      
      // Update the local editable data to reflect the saved changes
      setEditableData(prev => ({
        ...prev,
        title: editableData.title,
        type: editableData.type,
        description: currentContent,
        level: editableData.level,
        userid: editableData.userid,
        courseid: editableData.courseid,
        duration: editableData.duration
      }));

      // Update the editor content state
      setEditorContent(currentContent);
      
      // Restore cursor position after content update
      setTimeout(() => {
        if (editLessonTiptapEditorRef.current?.setCursorPosition) {
          editLessonTiptapEditorRef.current.setCursorPosition(currentCursorPosition);
        }
      }, 100);
      
      // Also update the item prop to reflect changes immediately
      // This ensures the preview shows updated data
      if (onAction) {
        onAction("updated", item.id, currentContent);
      }
      
      // Force parent component to refresh data from API
      setTimeout(() => {
        if (onAction) {
          onAction("refresh", item.id);
        }
      }, 500);
      
      // Force re-render to update the view section
      setDescriptionUpdateTrigger(prev => prev + 1);
      setIsEditDialogOpen(false); // <-- Close dialog after update
      
      // Clear localStorage content since it's now saved to database
      localStorage.removeItem(`processingCenterContent_${item.id}`);
      
      // Show success message
      toast.success("Changes saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
     
    } catch (err) {
      console.error("Failed to update lesson:", err);
      toast.error("Failed to save changes. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSaveLoading(false);
    }
  };

  



  


  // useEffect to handle deletion state
  useEffect(() => {
    if (isDeleted) {
      // The component will be removed from the parent's state
      // This useEffect ensures the deletion state is properly managed
    }
  }, [isDeleted]);

  // Debug useEffect to track description changes
  useEffect(() => {
    console.log(`Item ${item.id} description:`, item.description);
    console.log(`Item ${item.id} metadata description:`, item.metadata?.description);
  }, [item.description, item.metadata?.description, item.id]);

  // Don't render if deleted
  if (isDeleted) {
    return null;
  }

  return (
    <div
      className="relative group"
      style={{ minHeight: cardHeight || undefined, width: '100%' }}
      ref={cardRef}
    >
      <Card
        className="transition-all hover:shadow-md w-full"
        style={{ minHeight: cardHeight, height: cardHeight, width: '100%' }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center gap-2">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate ">{item.title}</CardTitle>
                <CardDescription className="mt-1">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.createdBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.qaqfLevel && <span>Level {item.qaqfLevel}</span>}
                    {/* Add verification status badge */}
                
                  </div>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Status Section - Grid Layout */}
              <div className="flex justify-between text-center space-x-6 p-2">
  {/* Status */}
  <div className="flex flex-col items-center ">
    <span className="px-2 py-2 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
      Status
    </span>
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 mt-2">
      <Clock className="h-3 w-3 text-blue-600" />
    </div>
  </div>

  {/* Verification */}
  <div className="flex flex-col items-center">
    <span className="px-2 py-2 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
      Verification
    </span>
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 mt-2">
      <CheckCircle className="h-3 w-3 text-yellow-600" />
    </div>
  </div>

  {/* Moderation */}
  <div className="flex flex-col items-center">
    <span className="px-2 py-2 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      Moderation
    </span>
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 mt-2">
      <Shield className="h-3 w-3 text-purple-600" />
    </div>
  </div>

  <div className="flex">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={()=>handleEditClick(selectedCourseId || "")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                <Button
                variant="ghost"
                size="icon"
                className=""
                onClick={handleDeleteLesson}
                disabled={deleteLoading || isDeleted}
                aria-label="Close"
              >
                {deleteLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
              </div>
              
            
</div>

              
              {/* Action Buttons */}
            
            </div>
          </div>

          {status === "unverified" && item.progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Processing...</span>
                <span>{Math.round(item.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              {item.estimatedTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated time remaining: {item.estimatedTime}
                </p>
              )}
            </div>
          )}
        </CardHeader>

    
      </Card>

      {/* Fullscreen Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          // Reset Ask Query button state when dialog closes
          setEditLessonShowAskQueryButton(false);
          setEditLessonSelectedText('');
        }
      }}>
        <DialogContent className="w-[100%] h-screen max-w-full max-h-full p-0 flex flex-col mx-auto">
          <DialogHeader className="p-6">
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] bg-white p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="max-w-6xl mx-auto">
       
        {/* Edit Lesson Selection Tooltip */}
        {editLessonShowTooltip && (
          <div 
            ref={editLessonTooltipRef}
            className="fixed bg-gray-900 text-white py-2 px-3 rounded-lg text-sm z-50 transition-opacity"
            style={{ 
              left: `${editLessonTooltipPosition.x}px`, 
              top: `${editLessonTooltipPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            Click to explain this text
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-5 border-r-5 border-t-5 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Edit Lesson Overlay */}
        {editLessonIsPopupOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={closeEditLessonPopup}
          ></div>
        )}

        {/* Ask Query Button */}
        {editLessonShowAskQueryButton && editLessonSelectedText && (
          <div 
            className="fixed z-50 animate-slideIn"
            style={{
              left: `${editLessonAskQueryButtonPosition.x}px`,
              top: `${editLessonAskQueryButtonPosition.y}px`,
            }}
          >
            <button
              onClick={handleAskQueryClick}
              data-ask-query-button
              className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-purple-700 flex items-center gap-1 border border-white"
              title="Ask AI about this text"
            >
              🤖 Ask Query
            </button>
          </div>
        )}

        {/* Edit Lesson Popup */}
        {editLessonIsPopupOpen && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-popupIn">
            {/* Header - Fixed */}
            <div className="border-b border-gray-200 p-5 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-gray-800">🧠 AI Explanation</h3>
              <button 
                className="text-gray-500 hover:text-red-500 text-2xl transition-colors"
                onClick={closeEditLessonPopup}
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="p-5 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <strong className="text-gray-700">Selected text:</strong>
                <div className="mt-2">
                  <TiptapEditor
                    ref={editLessonSelectedTextEditorRef}
                    content={editLessonSelectedText}
                    onContentChange={(newContent) => setEditLessonSelectedText(newContent)}
                    className="bg-white border border-gray-200 rounded-lg min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="p-5 flex flex-wrap gap-2">
                {['explain', 'summary', 'detailed', 'examples'].map((type) => (
                  <button
                    key={type}
                    className={`px-4 py-2 rounded-full border-2 transition-all ${
                      editLessonCurrentExplanationType === type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 transform -translate-y-0.5'
                        : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setEditLessonCurrentExplanationType(type)}
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
                  onClick={sendEditLessonExplanationRequest}
                  disabled={editLessonIsLoading || editLessonIsAIGenerating}
                >
                  {editLessonIsLoading || editLessonIsAIGenerating ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editLessonIsAIGenerating ? 'Get AI Explanation...' : 'Get AI Explanation...'}
                    </div>
                  ) : (
                    <>
                      🚀 Get AI Explanation
                    </>
                  )}
                </button>
                
                {editLessonAiResponse && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-green-200">
                    <div className="flex justify-end mb-3">
                      <button
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-300 hover:bg-red-50 transition-colors"
                        onClick={() => {
                          setEditLessonAiResponse('');
                          setEditLessonResponseHistory([]);
                        }}
                        title="Clear all responses"
                      >
                        🗑️ Clear
                      </button>
                    </div>
                    <div className="text-gray-700 max-h-60 overflow-y-auto">
                      <TiptapEditor
                        ref={editLessonAiResponseEditorRef}
                        content={editLessonAiResponse}
                        onContentChange={(newContent) => setEditLessonAiResponse(newContent)}
                        className="bg-white border border-gray-200 rounded-lg min-h-[120px]"
                      />
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        className="flex-1 py-2 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                        onClick={attachEditLessonExplanation}
                      >
                        ✅ Attach to Lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lesson Header */}
        <div className="bg-white bg-opacity-95  rounded-2xl p-6 mb-6 shadow-xl text-center">
  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
  {editableData.title}
  </h1>

     {/* Form Row */}
   <div className="grid grid-cols-5 gap-4 items-end mt-6">
     
     {/* Title Input */}
     <div className="space-y-2">
       <label className="text-sm font-medium text-gray-700">Title</label>
       <input
         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         value={editableData.title}
         onChange={e => setEditableData(f => ({ ...f, title: e.target.value }))}
         placeholder="Enter module title"
       />
     </div>

     {/* Type Dropdown */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Type</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={editableData.type}
        onChange={e => setEditableData(f => ({ ...f, type: e.target.value }))}
      >
        {Object.entries(MODULE_TYPE_OPTIONS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>

    {/* Duration Input */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Duration</label>
      <input
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={editableData.duration}
        onChange={e => setEditableData(f => ({ ...f, duration: e.target.value }))}
        placeholder="e.g. 60 min"
      />
    </div>

    {/* QAQF Level Dropdown */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 ">QAQF Level</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={editableData.level}
        onChange={e => setEditableData(f => ({ ...f, level: e.target.value }))}
      >
        {Object.values(QAQF_LEVELS).map(qaqfLevel => (
          <option key={qaqfLevel} value={qaqfLevel}>
            {qaqfLevel}
          </option>
        ))}
      </select>
    </div>

    {/* Save Button */}
    <div className="flex justify-center">
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        onClick={handleSaveChanges}
        disabled={saveLoading}
      >
        {saveLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Saving...
          </div>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  </div>
</div>


        {/* Lesson Content */}
        <div className="bg-white bg-opacity-98 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2"></div>
          
          {/* Editor Status Indicator */}
          {!editLessonIsEditorReady && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-yellow-700 text-sm">Initializing editor...</span>
              </div>
            </div>
          )}
          
          <TiptapEditor
            key={`edit-lesson-editor-${item.id}-${isEditDialogOpen}`}
            content={editorContent || editableData.description || '<p>Enter your data</p>'}
            onContentChange={(content) => {
              // Only update if content has actually changed to avoid unnecessary re-renders
              if (content !== editorContent) {
                setEditorContent(content);
                setEditableData(prev => ({ ...prev, description: content }));
              }
            }}
            onTextSelection={handleEditLessonTextSelection}
            onReady={() => {
              console.log('🎉 Edit Lesson TiptapEditor is ready');
              setEditLessonIsEditorReady(true);
            }}
            className="min-h-[400px]"
            editorRef={editLessonTiptapEditorRef}
          />
        </div>

      </div>
      
     
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
      `}</style>
    </div>
          <DialogFooter className="p-6 flex justify-end gap-2">
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resize handle visually on the border, not inside the card */}
      <div
        className="absolute left-0 bottom-0 w-full h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-ns-resize z-20"
        onMouseDown={e => {
          e.preventDefault();
          isResizing.current = true;
        }}
      >
        <div className="w-8 h-1 rounded bg-gray-400" />
      </div>
    </div>
  );
};

export default ProcessingCenterItem;
