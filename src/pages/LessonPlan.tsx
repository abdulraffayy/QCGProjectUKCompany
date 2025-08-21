import { ReactElement } from 'react';

// TypeScript interfaces
interface ExplanationAttachment {
  id: number;
  content: string;
  explanationType: string;
  isCollapsed: boolean;
  position: number; // Track position in content
  selectedText?: string; // Store the selected text for reference
}
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import React, { useState, useEffect, useRef } from 'react';
// import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
// import { Badge } from '../components/ui/badge';
// import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import JoditEditor from 'jodit-react';
import TiptapEditor from '../components/TiptapEditor';

// Import centralized types
import { 
  QAQF_LEVELS, 
  MODULE_TYPE_OPTIONS,
 
} from '../types';

// Wrapper component for Rafay to use in dialog


// QAQF_LEVELS is now imported from centralized types

export interface SimpleCourse {
  id: string;
  title: string;
}
export interface SimpleWeek {
  id: number;
  title: string;
}
export interface SimpleLesson {
  id: number;
  title: string;
}

const LessonPlanPage: React.FC = () => {
 





  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const [modules, setModules] = useState<any[]>([]);





  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogValue, setEditDialogValue] = useState("");

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [editModuleDialogOpen, setEditModuleDialogOpen] = useState(false);
  const [editModuleDialogWeekId, setEditModuleDialogWeekId] = useState<number | null>(null);
  const [editModuleDialogModuleId, setEditModuleDialogModuleId] = useState<number | null>(null);
  const [editModuleDialogTitle, setEditModuleDialogTitle] = useState("");
  const [editModuleDialogScript, setEditModuleDialogScript] = useState("");
  const [editModuleDialogCourseId, setEditModuleDialogCourseId] = useState("");
  const [editModuleDialogUserId, setEditModuleDialogUserId] = useState("");
  const [editModuleDialogType, setEditModuleDialogType] = useState("lecture");
  const [editModuleDialogDuration, setEditModuleDialogDuration] = useState("");
  const [editModuleDialogQAQF, setEditModuleDialogQAQF] = useState(1);
  const [editModuleDialogDescription, setEditModuleDialogDescription] = useState("");
  const [refreshModules, setRefreshModules] = useState<number>(0);
 
 

  // Add Module Dialog state
  const [addModuleDialogOpen, setAddModuleDialogOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleType, setNewModuleType] = useState("lecture");
  const [newModuleDuration, setNewModuleDuration] = useState("");
  const [newModuleQAQF, setNewModuleQAQF] = useState<string>("1");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [newModuleUserId, setNewModuleUserId] = useState("");
  const [newModuleCourseId, setNewModuleCourseId] = useState("");

  // Add Course Dialog state
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    userid: "",
    description: "",
    status: "",
  });



  const [addWeeksDialogOpen, setAddWeeksDialogOpen] = useState(false);
  const [addWeeksForm, setAddWeeksForm] = useState({ courseid: '', title: '' });
  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState(false);
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<{ weekId: number, moduleId: number } | null>(null);
  const [rightSideEditDialogOpen, setRightSideEditDialogOpen] = useState(false);
  const [rightSideEditModule, setRightSideEditModule] = useState<any>(null);
  const [rightSideEditForm, setRightSideEditForm] = useState({
    title: "",
    type: "lecture",
    duration: "",
    qaqfLevel: "",
    script: "",
    courseid: "",
    userid: "",
    level: "",
    description: "", 
  });

  const [rightSideDeleteDialogOpen, setRightSideDeleteDialogOpen] = useState(false);
  const [rightSideDeleteModule, setRightSideDeleteModule] = useState<any>(null);

  // Lesson content state for Tiptap editor
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);

  // AI Explanation state for Edit Module dialog
  const [editModuleSelectedText, setEditModuleSelectedText] = useState<string>('');
  const [editModuleIsPopupOpen, setEditModuleIsPopupOpen] = useState<boolean>(false);
  const [editModuleIsLoading, setEditModuleIsLoading] = useState<boolean>(false);
  const [editModuleCurrentExplanationType, setEditModuleCurrentExplanationType] = useState<string>('explain');
  const [editModuleAiResponse, setEditModuleAiResponse] = useState<string>('');
  const [editModuleShowTooltip, setEditModuleShowTooltip] = useState<boolean>(false);
  const [editModuleTooltipPosition, setEditModuleTooltipPosition] = useState({ x: 0, y: 0 });
  const [editModuleAiQuery, setEditModuleAiQuery] = useState<string>('');
  const [editModuleAiReference, setEditModuleAiReference] = useState<string>('');
  const [editModuleIsAIGenerating, setEditModuleIsAIGenerating] = useState<boolean>(false);
  const [editModuleResponseHistory, setEditModuleResponseHistory] = useState<Array<{type: string, content: string, timestamp: number}>>([]);
  const [editModuleSelectedLinePosition, setEditModuleSelectedLinePosition] = useState<number>(-1);
  const [editModuleIsEditorReady, setEditModuleIsEditorReady] = useState<boolean>(false);

  // Refs for Edit Module dialog
  const editModuleTiptapEditorRef = useRef<any>(null);
  const editModuleSelectedTextEditorRef = useRef<any>(null);
  const editModuleAiResponseEditorRef = useRef<any>(null);
  const editModuleTooltipRef = useRef<HTMLDivElement>(null);

  // Prefill the edit dialog's contentEditable with current description and keep it synced
  useEffect(() => {
    if (rightSideEditDialogOpen) {
      // This is handled differently with Tiptap editor
      console.log('Edit dialog opened with description:', rightSideEditForm.description);
    }
  }, [rightSideEditDialogOpen, rightSideEditForm.description]);

  // const handleBeforeInput = (e: React.FormEvent<HTMLDivElement> & InputEvent) => {
  //   e.preventDefault(); // browser ki apni formatting rok do
  
  //   const newText = e.data ?? ""; // jo user ne type kiya
  //   const selection = window.getSelection();
  //   if (!selection || !selection.rangeCount) return;
  
  //   const range = selection.getRangeAt(0);
  //   range.deleteContents();
  //   range.insertNode(document.createTextNode(newText));
  
  //   // state update
  //   const plainText = e.currentTarget.innerText;
  //   setRightSideEditForm(prev => ({
  //     ...prev,
  //     description: plainText,
  //   }));
  // };
  
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
    
    // Refs
      // Tiptap editor ref for inserting AI explanations
  const tiptapEditorRef = useRef<any>(null);
  const selectedTextEditorRef = useRef<any>(null);
  const aiResponseEditorRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Debug effect to check editor initialization
  useEffect(() => {
    const checkEditor = () => {
      console.log('🔍 Checking Tiptap editor status...');
      console.log('Editor ref:', tiptapEditorRef.current);
      if (tiptapEditorRef.current) {
        console.log('Editor ready:', tiptapEditorRef.current.isReady());
        console.log('Editor methods:', Object.keys(tiptapEditorRef.current));
      }
    };

    // Check after a short delay to allow editor to initialize
    const timer = setTimeout(checkEditor, 1000);
    return () => clearTimeout(timer);
  }, []);
  






  // Attach explanation for Add Lesson dialog
     const attachExplanationForAddLesson = () => {
      
      console.log('🔍 attachExplanationForAddLesson called');
      console.log('Selected text:', selectedText);
      console.log('AI Response:', aiResponse);
      console.log('Editor ref:', tiptapEditorRef.current);
      console.log('Is editor ready state:', isEditorReady);
      console.log('Selected line position:', selectedLinePosition);
      
      // Check if editor ref exists
      if (!tiptapEditorRef.current) {
        console.error('❌ Editor ref is null');
        toast.error('Editor not initialized. Please try again.');
        return;
      }

      // Check if editor is ready (both state and method)
      if (!isEditorReady || !tiptapEditorRef.current.isReady()) {
        console.error('❌ Editor not ready, attempting retry...');
        console.log('isEditorReady:', isEditorReady);
        console.log('editor.isReady():', tiptapEditorRef.current.isReady());
        
        // Try to wait a bit and retry
        setTimeout(() => {
          if (tiptapEditorRef.current && tiptapEditorRef.current.isReady() && isEditorReady) {
            console.log('✅ Editor is now ready, retrying...');
            attachExplanationForAddLesson();
          } else {
            console.error('❌ Editor still not ready after retry');
            toast.error('Editor not ready. Please try again.');
          }
        }, 500);
        return;
      }

      // Create formatted AI explanation content
      const formattedExplanation = `
<div class="my-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-md">
  <div class="font-bold text-gray-800 flex items-center mb-2">
    🤖 AI Explanation
  </div>
  <div class="mt-3 text-gray-700">
    ${aiResponse}
  </div>
</div>
      `;

      console.log('Formatted explanation:', formattedExplanation);

      try {
        // Always insert at the end of the editor content
        const contentLength = tiptapEditorRef.current.getEditor().state.doc.content.size;
        const insertPosition = contentLength;
        
        console.log('Inserting at end of editor, position:', insertPosition);
        
        // Insert content at the end
        const result = tiptapEditorRef.current.insertContent(formattedExplanation, insertPosition);
        
        console.log('✅ AI response inserted successfully at the end');
        console.log('Insert result:', result);
        
        // Also update the lessonContent state to ensure it's in sync
        const updatedContent = tiptapEditorRef.current.getContent();
        setLessonContent(updatedContent);
        
        // Show success message
        toast.success(`AI explanation attached successfully at the bottom!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        closePopup();
      } catch (error) {
        console.error('❌ Error inserting content:', error);
        
        // Fallback: try to update the state directly by appending to the end
        try {
          const currentContent = lessonContent || '';
          const updatedContent = currentContent + formattedExplanation;
          setLessonContent(updatedContent);
          
          console.log('✅ Fallback: Updated lesson content state (appended to end)');
          toast.success(`AI explanation attached at the bottom (fallback method)!`, {
            position: "top-right",
            autoClose: 3000,
          });
          
          closePopup();
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          toast.error('Failed to insert AI explanation. Please try again.');
        }
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
  
   // Find the line number of selected text - simplified for Tiptap

  
  
    // Handle text selection
    const handleTextSelection = (selectedText: string, selectionPosition?: {from: number, to: number}) => {
      if (selectedText && selectedText.trim() !== '') {
        const text = selectedText.trim();
        setSelectedText(text);
        
        // Store selection position for later use
        if (selectionPosition) {
          setSelectedLinePosition(selectionPosition.from);
        }
        
        console.log('Selected text:', text);
        console.log('Selection position:', selectionPosition);
        
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
      
      // Clear selection - Tiptap handles this automatically
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
           // ✅ Add new response to history
           const newResponse = {
             type: currentExplanationType,
             content: data.generated_content,
             timestamp: Date.now()
           };
           
           setResponseHistory(prev => [...prev, newResponse]);
           
           // Update the main AI response to show all responses (newest first)
           const allResponses = [...responseHistory, newResponse];
           const formattedResponses = allResponses.reverse().map((resp,) => {
             return resp.content;
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
  
    // Handle text selection for Edit Module dialog
    const handleEditModuleTextSelection = (selectedText: string, selectionPosition?: {from: number, to: number}) => {
      if (selectedText && selectedText.trim() !== '') {
        const text = selectedText.trim();
        setEditModuleSelectedText(text);
        
        // Store selection position for later use
        if (selectionPosition) {
          setEditModuleSelectedLinePosition(selectionPosition.from);
        }
        
        console.log('Edit Module - Selected text:', text);
        console.log('Edit Module - Selection position:', selectionPosition);
        
        // Show popup after delay
        setTimeout(() => {
          setEditModuleIsPopupOpen(true);
          setEditModuleShowTooltip(false);
        }, 300);
      }
    };

    // Close popup for Edit Module dialog
    const closeEditModulePopup = () => {
      setEditModuleIsPopupOpen(false);
      setEditModuleAiResponse('');
      setEditModuleAiQuery('');
      setEditModuleAiReference('');
      setEditModuleSelectedLinePosition(-1);
      setEditModuleResponseHistory([]);
      setEditModuleIsEditorReady(false);
      
      // Clear selection
      window.getSelection()?.removeAllRanges();
    };

    // Send AI explanation request for Edit Module dialog
    const sendEditModuleExplanationRequest = async () => {
      setEditModuleIsLoading(true);
      setEditModuleIsAIGenerating(true);
      
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
  
        const generation_type = generationTypeMap[editModuleCurrentExplanationType] || 'explanation';
        const material = editModuleAiReference || editModuleSelectedText;
        const qaqf_level = "1"; // Default QAQF level
        const subject = editModuleSelectedText;
        const userquery = editModuleAiQuery || `Please ${editModuleCurrentExplanationType} this text: ${editModuleSelectedText}`;
  
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
            type: editModuleCurrentExplanationType,
            content: data.generated_content,
            timestamp: Date.now()
          };
          
          setEditModuleResponseHistory(prev => [...prev, newResponse]);
          
          // Update the main AI response to show all responses (newest first)
          const allResponses = [...editModuleResponseHistory, newResponse];
          const formattedResponses = allResponses.reverse().map((resp,) => {
            return resp.content;
          }).join('\n\n');
          
          setEditModuleAiResponse(formattedResponses);
        } else {
          setEditModuleAiResponse('No content generated. Please try again.');
        }
      } catch (error) {
        console.error('AI Generate error:', error);
        setEditModuleAiResponse('AI generation failed. Please check your connection and try again.');
      } finally {
        setEditModuleIsLoading(false);
        setEditModuleIsAIGenerating(false);
      }
    };

    // Attach explanation for Edit Module dialog
    const attachEditModuleExplanation = () => {
      console.log('Edit Module - Selected text:', editModuleSelectedText);
      console.log('Edit Module - AI Response:', editModuleAiResponse);
      console.log('Edit Module - Editor ref:', editModuleTiptapEditorRef.current);
      console.log('Edit Module - Selected line position:', editModuleSelectedLinePosition);
      
      // Check if editor is ready
      if (!editModuleTiptapEditorRef.current || !editModuleTiptapEditorRef.current.isReady() || !editModuleIsEditorReady) {
        console.error('❌ Edit Module Editor not ready');
        console.log('editModuleIsEditorReady:', editModuleIsEditorReady);
        console.log('editor.isReady():', editModuleTiptapEditorRef.current?.isReady());
        toast.error('Editor not ready. Please try again.');
        return;
      }

      // Create formatted AI explanation content
      const formattedExplanation = `
<div class="my-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-md">
  <div class="font-bold text-gray-800 flex items-center mb-2">
    🤖 AI Explanation
  </div>
  <div class="mt-3 text-gray-700">
    ${editModuleAiResponse}
  </div>
</div>
      `;

      console.log('Edit Module - Formatted explanation:', formattedExplanation);

      try {
        // Always insert at the end of the editor content
        const contentLength = editModuleTiptapEditorRef.current.getEditor().state.doc.content.size;
        const insertPosition = contentLength;
        
        console.log('Edit Module - Inserting at end of editor, position:', insertPosition);
        
        // Insert content at the end
        const result = editModuleTiptapEditorRef.current.insertContent(formattedExplanation, insertPosition);
        
        console.log('✅ Edit Module - AI response inserted successfully at the end');
        console.log('Edit Module - Insert result:', result);
        
        // Update the edit form state
        const newContent = editModuleTiptapEditorRef.current.getContent();
        setRightSideEditForm(prev => ({ ...prev, description: newContent }));
        console.log('✅ Edit Module - Form updated');
        
        // Show success message
        toast.success(`AI explanation attached successfully at the bottom!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        closeEditModulePopup();
      } catch (error) {
        console.error('❌ Edit Module - Error inserting content:', error);
        
        // Fallback: try to update the state directly by appending to the end
        try {
          const currentContent = rightSideEditForm.description || '';
          const updatedContent = currentContent + formattedExplanation;
          setRightSideEditForm(prev => ({ ...prev, description: updatedContent }));
          
          console.log('✅ Edit Module - Fallback: Updated form state (appended to end)');
          toast.success(`AI explanation attached at the bottom (fallback method)!`, {
            position: "top-right",
            autoClose: 3000,
          });
          
          closeEditModulePopup();
        } catch (fallbackError) {
          console.error('❌ Edit Module - Fallback also failed:', fallbackError);
          toast.error('Failed to insert AI explanation. Please try again.');
        }
      }
    };

    // Attach explanation to lesson at the selected line position
    const attachExplanation = () => {
     
      console.log('Selected text:', selectedText);
      console.log('AI Response:', aiResponse);
      console.log('Editor ref:', tiptapEditorRef.current);
      
      // Check if editor is ready
      if (!tiptapEditorRef.current || !tiptapEditorRef.current.isReady()) {
        console.error('❌ Editor not ready');
        toast.error('Editor not ready. Please try again.');
        return;
      }

      // Create formatted AI explanation content
      const formattedExplanation = `
<div class="my-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-md">
  <div class="font-bold text-gray-800 flex items-center mb-2">
   
  </div>
  <div class="mt-3 text-gray-700">
    ${aiResponse}
  </div>
</div>
      `;

      console.log('Formatted explanation:', formattedExplanation);

      try {
        // Insert the explanation into the Tiptap editor
        tiptapEditorRef.current.insertContent(formattedExplanation);
        console.log('✅ Content inserted successfully');
        
        // Update both the lesson content state and the edit form state
        const newContent = tiptapEditorRef.current.getContent();
        setLessonContent(newContent);
        setRightSideEditForm(prev => ({ ...prev, description: newContent }));
        console.log('✅ Lesson content and edit form updated');
        
        // Show success message
        toast.success(`AI explanation attached to "${selectedText.substring(0, 30)}${selectedText.length > 30 ? '...' : ''}"`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        closePopup();
      } catch (error) {
        console.error('❌ Error inserting content:', error);
        toast.error('Failed to insert AI explanation. Please try again.');
      }
    };
  
    // Toggle explanation visibility
    const toggleExplanation = (id: number) => {
      setExplanations(explanations.map(exp => 
        exp.id === id ? { ...exp, isCollapsed: !exp.isCollapsed } : exp
      ));
    };
  
    // Remove explanation
    const removeExplanation = (id: number) => {
      setExplanations(explanations.filter(exp => exp.id !== id));
    };
  
    // Render lesson content with explanations inserted at their positions
    const renderLessonContentWithExplanations = () => {
      // Create dynamic content from form data
      const dynamicContent = `
      ASK HERE
      `;
      
      const lines = dynamicContent.split('\n');
      const sortedExplanations = [...explanations].sort((a, b) => a.position - b.position);
      
      console.log('Rendering lesson content with explanations:', sortedExplanations);
      console.log('Total explanations:', explanations.length);
      console.log('Line positions of explanations:', sortedExplanations.map(exp => exp.position));
      console.log('Total lines in content:', lines.length);
      
      let result: ReactElement[] = [];
      let explanationIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        // Add the current line
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




 // ✅ Remove old `lessonContent`
// const lessonContent = ` ... big dummy string ... `;

// This function is no longer needed with Tiptap editor
  
    // Lesson content is now managed by the lessonContent state variable

  
  const fetchCoursesFromAPI = async (userid?: string) => {
    try {
      let url = '/api/courses';
      if (userid) {
        url += `?userid=${encodeURIComponent(userid)}`;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch courses');
      }
      
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      if (err instanceof Error && err.message.includes('Token')) {
        toast.error("Authentication required. Please login again.");
      }
    }
  };


  const fetchModulesFromAPI = async (courseId?: string) => {
    try {
      let url = '/api/lessons';
      if (courseId) {
        url += `?courseid=${encodeURIComponent(courseId)}`;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch lessons');
      }
      
      const data = await res.json();
      console.log('API returned modules data:', data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First module data structure:', data[0]);
      }
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching modules:', err);
      if (err instanceof Error && err.message.includes('Token')) {
        toast.error("Authentication required. Please login again.");
      }
    }
  };

 
  const handleAddWeekApi = async () => {
    try {
      if (!selectedCourse) {
        toast.error("Please select a course first");
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      const res = await fetch('/api/weeks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: addWeeksForm.title,
          courseid: selectedCourse,
          userid: userId,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add week');
      }

      await res.json();

      toast.success("Week added successfully!");

      // Close the dialog and reset form
      setAddDialogOpen(false);
      setAddWeeksForm({ courseid: "", title: "" });

      // Add a small delay to ensure the API has processed the new week
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now fetch weeks for the selected course and update state
      await fetchWeeksFromAPI();

      // Force a re-render by updating the refreshWeeks state
    } catch (err) {
      console.error('Error adding week:', err);
      toast.error(err instanceof Error ? err.message : "Could not add week. Please try again.");
    }
  };





  // Fetch courses on mount
  useEffect(() => {
    fetchCoursesFromAPI();
  }, []);

  // Fetch modules for the selected course
  useEffect(() => {
    if (selectedCourse) {
      fetchModulesFromAPI(selectedCourse);
    } else {
      setModules([]);
    }
  }, [selectedCourse]);

  // Refresh modules when refreshModules state changes
  useEffect(() => {
    if (selectedCourse && refreshModules > 0) {
      fetchModulesFromAPI(selectedCourse);
    }
  }, [refreshModules, selectedCourse]);

  // Remove localStorage logic for modules and weeks since assignments are now backend-driven






  const handleDialogSave = async () => {
    if (!editDialogValue.trim()) {
      toast.error("Please enter a week title");
      return;
    }

    try {
      // Use the editWeekData that was set when the dialog was opened
      if (!editWeekData) {
        toast.error("Week data not found");
        return;
      }

      const res = await fetch(`/api/weeks/${editWeekData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseid: editWeekData.courseid,
          title: editDialogValue,
        }),
      });

      if (!res.ok) throw new Error('Failed to update week');

      toast.success("Week updated successfully!");
      setEditDialogOpen(false);
      setEditDialogValue("");
      setEditWeekData(null);
      await fetchWeeksFromAPI(); // Refresh weeks from API
    } catch (err) {
      toast.error("Could not update week. Please try again.");
    }
  };












  const handleEditModuleDialogSave = async () => {
    if (editModuleDialogWeekId !== null && editModuleDialogModuleId !== null) {

      
      // Call the API to update the module in the backend
      await handleEditModuleApi(editModuleDialogModuleId);
    }
    setEditModuleDialogOpen(false);
    setEditModuleDialogWeekId(null);
    setEditModuleDialogModuleId(null);
    setEditModuleDialogTitle("");
    setEditModuleDialogScript("");
    setEditModuleDialogCourseId("");
    setEditModuleDialogUserId("");
    setEditModuleDialogType("lecture");
    setEditModuleDialogDuration("");
    setEditModuleDialogQAQF(1);
  };

  // Intra-week drag handlers - REMOVED since we only allow left-to-right dragging

  const handleAddModule = async (newModule: any) => {
    // Use the lesson content from the Tiptap editor state
    const lessonContentText = lessonContent;

    // Keep form description as-is; put editor text into the script field
    const moduleWithCourseId = {
      ...newModule,
      description: lessonContentText,
      courseid: selectedCourse,
      level: newModule.qaqfLevel, // Send as 'level' to match backend field name
      userid: newModuleUserId, // Add the user ID
    };
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moduleWithCourseId),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add module');
      }
      // Get the created module from the response (if your API returns it)
      const createdModule = await res.json();
      // Add the new module to the modules list (left side)
      setModules(prevModules => [
        ...prevModules,
        { ...createdModule, id: createdModule.id || Date.now(), courseid: selectedCourse }
      ]);
      fetchModulesFromAPI(selectedCourse)
      toast.success('Module added successfully!');
    } catch (err) {
      toast.error('Could not add module. Please try again.');
    }
    // Close the dialog and reset form
    setAddModuleDialogOpen(false);
    resetAddModuleForm();
  };

  const handleEditModuleApi = async (id: number) => {
    const updatedModule = {
      title: editModuleDialogTitle,
      script: editModuleDialogScript,
      description: editModuleDialogDescription, // Preserve HTML content instead of stripping it
      courseid: editModuleDialogCourseId,
      userid: editModuleDialogUserId,
      type: editModuleDialogType,
      duration: editModuleDialogDuration,
      level: editModuleDialogQAQF, // Send as 'level' to match backend field name
    };
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedModule),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update module');
      }

      // Fetch the updated module from the server to get the correct data structure
      const updatedModuleRes = await fetch(`/api/lessons/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (updatedModuleRes.ok) {
        const serverUpdatedModule = await updatedModuleRes.json();
        console.log('Server returned updated module:', serverUpdatedModule);
        
        // Update the modules state with server data
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === id 
              ? { ...module, ...serverUpdatedModule }
              : module
          )
        );
        

      } else {
        // Fallback: update with payload if server fetch fails
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === id 
              ? { ...module, ...updatedModule }
              : module
          )
        );
        

      }
      
      // Force a re-render to ensure UI updates
      setRefreshModules(prev => prev + 1);
      
      toast.success("Module updated successfully!");
    } catch (err) {
      toast.error("Could not update module. Please try again.");
    }
  };

  // Add function to delete module from backend
  const handleDeleteModuleApi = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return false;
      }
      
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete module');
      }
      
      toast.success('Module deleted successfully!');
      return true;
    } catch (err) {
      console.error('Error deleting module:', err);
      toast.error(err instanceof Error ? err.message : 'Could not delete module. Please try again.');
      return false;
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user.userid;





  useEffect(() => {
    if (addCourseDialogOpen && userId) {
      setCourseForm(f => ({ ...f, userid: userId }));
    }
  }, [addCourseDialogOpen, userId]);

  useEffect(() => {
    if (addModuleDialogOpen && userId) {
      setNewModuleUserId(userId);
      setNewModuleCourseId(selectedCourse)
    }
  }, [addModuleDialogOpen, userId]);






  useEffect(() => {
    if (addWeeksDialogOpen && userId) {
      setAddWeeksForm(f => ({ ...f, userid: userId }));
    }
  }, [addWeeksDialogOpen, userId]);

  const distributeModulesToWeeks = () => {
    // Create 12 weeks if not already present
    const weeksCopy = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `Week ${i + 1}`,
      modules: [] as any[],
      isEditing: false,
    }));

    // Distribute modules into weeks (max 4 per week)
    let moduleIndex = 0;
    for (let w = 0; w < 12; w++) {
      weeksCopy[w].modules = modules.slice(moduleIndex, moduleIndex + 4);
      moduleIndex += 4;
    }


    // Optionally clear modules list if you want
    // setModules([]);
    // Optionally persist to localStorage
    localStorage.setItem("weeks", JSON.stringify(weeksCopy));
  };

  const [weeksFromApi, setWeeksFromApi] = useState<any[]>([]);

  const fetchWeeksFromAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const res = await fetch('/api/weeks', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch weeks');
      }
      
      const data = await res.json();
      setWeeksFromApi(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching weeks:', err);
      if (err instanceof Error && err.message.includes('Token')) {
        toast.error("Authentication required. Please login again.");
      }
      setWeeksFromApi([]);
    }
  };

  // Call this in useEffect to load on mount
  useEffect(() => {
    if (selectedCourse) {
      fetchWeeksFromAPI();
    } else {
      setWeeksFromApi([]); // Clear weeks when no course is selected
    }

  }, [selectedCourse]);




















  // Helper: Get unassigned modules (not in any week, only for selected course)
  const getUnassignedModules = () => {
    // Show all modules for the selected course on the left side (keep them visible even if assigned)
    return modules.filter(
      (m) => m.courseid === selectedCourse
    );
  };









  // Function to handle edit module on right side
  const handleEditRightSideModule = (module: any) => {
    setRightSideEditModule(module);
    setRightSideEditForm({
      title: module.title || "",
      type: module.type || "lecture",
      duration: module.duration || "",
      qaqfLevel: module.qaqfLevel || module.level || 1,
      script: module.script || "",
      courseid: module.courseid || "",
      userid: module.userid || "",
      level: module.level || module.qaqfLevel || "",
      description: module.description || "", // <-- YEH LINE ZARUR ADD KAREN
    });
    setRightSideEditDialogOpen(true);
  };

  // Function to handle delete module on right side
  const handleDeleteRightSideModule = (module: any) => {
    setRightSideDeleteModule(module);
    setRightSideDeleteDialogOpen(true);
  };



  // Function to save right side module edit
  const handleSaveRightSideModuleEdit = async () => {
    if (!rightSideEditModule) return;

    try {
      // Debug: Log what we're about to save
      console.log("Saving module with description:", {
        newModuleDescription: newModuleDescription,
        rightSideEditFormDescription: rightSideEditForm.description,
        finalDescription: newModuleDescription || rightSideEditForm.description
      });

      // Build payload with all required fields, including description and level
      const payload = {
        title: rightSideEditForm.title,
        type: rightSideEditForm.type,
        duration: rightSideEditForm.duration,
        qaqfLevel: rightSideEditForm.qaqfLevel,
        level: rightSideEditForm.qaqfLevel, // Send qaqfLevel as level to match backend
        description: newModuleDescription || rightSideEditForm.description, // Preserve HTML formatting
        courseid: rightSideEditForm.courseid,
        userid: rightSideEditForm.userid,
        // script: rightSideEditForm.script, // Do NOT include script
      };

      const res = await fetch(`/api/lessons/${rightSideEditModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // send only the correct fields
      });

      if (!res.ok) throw new Error('Failed to update module');

      // Fetch the updated module from the server to get the correct data structure
      const updatedModuleRes = await fetch(`/api/lessons/${rightSideEditModule.id}`);
      if (updatedModuleRes.ok) {
        const updatedModule = await updatedModuleRes.json();
        console.log('Server returned updated module:', updatedModule);
        

        // Also update the main modules state with server data
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === rightSideEditModule.id 
              ? { ...module, ...updatedModule }
              : module
          )
        );
      } else {

        setModules(prevModules => 
          prevModules.map(module => 
            module.id === rightSideEditModule.id 
              ? { ...module, ...payload }
              : module
          )
        );
      }

      // Force a re-render to ensure UI updates
      setRefreshModules(prev => prev + 1);
      
      toast.success("Module updated successfully!");
      setRightSideEditDialogOpen(false);
      setRightSideEditModule(null);
    } catch (err) {
      toast.error("Could not update module");
    }
  };

  // Function to delete right side module
  const handleDeleteRightSideModuleConfirm = async () => {
    if (!rightSideDeleteModule) return;

    try {
      const success = await handleDeleteModuleApi(rightSideDeleteModule.id);
      if (success) {


        // Also remove from the modules list (left side) if it exists there
        setModules(prevModules =>
          prevModules.filter(module => module.id !== rightSideDeleteModule.id)
        );

        toast.success("Module deleted!");
        setRightSideDeleteDialogOpen(false);
        setRightSideDeleteModule(null);
      }
    } catch (err) {
      toast.error("Could not delete module");
    }
  };

  // State for editing a week
  const [editWeekDialogOpen, setEditWeekDialogOpen] = useState(false);
  const [editWeekData, setEditWeekData] = useState<any>(null);
  const [deleteWeekDialogOpen, setDeleteWeekDialogOpen] = useState(false);
  const [deleteWeekData, setDeleteWeekData] = useState<any>(null);

  const handleEditWeekSave = async () => {
    if (!editWeekData) return;

    try {
      const res = await fetch(`/api/weeks/${editWeekData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseid: editWeekData.courseid,
          title: editWeekData.title,
          // add other fields as needed
        }),
      });

      if (!res.ok) throw new Error('Failed to update week');

      toast.success("Week updated!");
      setEditWeekDialogOpen(false);
      setEditWeekData(null);
      await fetchWeeksFromAPI(); // Refresh weeks from API for selected course
    } catch (err) {
      toast.error("Could not update week");
    }
  };

  const deleteWeekById = async (id: number) => {
    const res = await fetch(`/api/weeks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete week');
    await fetchWeeksFromAPI(); // Refresh weeks for selected course
  };



  const weeksToShow = selectedCourse
    ? [...weeksFromApi]
      .filter(week => week.courseid === selectedCourse)
      .sort((a, b) => {
        // Sort by creation date, with newest at the end
        const aDate = a.createddate ? new Date(a.createddate).getTime() : (a.id || 0);
        const bDate = b.createddate ? new Date(b.createddate).getTime() : (b.id || 0);
        return aDate - bDate; // Oldest first, newest last
      })
    : []; // Show no weeks when no course is selected


  // Add state for view module dialog
  const [selectedModuleForView, setSelectedModuleForView] = useState<any>(null);



  const moduleDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedModuleForView) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        moduleDetailsRef.current &&
        !moduleDetailsRef.current.contains(event.target as Node)
      ) {
        setSelectedModuleForView(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedModuleForView]);

  // In LessonPlanPage component, add this state:
  const [openModuleId] = useState<string | number | null>(null);



  const assignModuleToWeek = async (module: any, week: any) => {

    // Get next order number from backend
    let nextOrderNo = 1;
    try {
      const res = await fetch(`/api/weeklessons/week/${week.id}`);
      if (res.ok) {
        const data = await res.json();
        // Filter for this specific week
        const weekModules = data.filter((item: any) => item.weekid === week.id);

        // Find the highest orderno for this week
        if (weekModules.length > 0) {
          const orderNumbers = weekModules.map((item: any) => {
            return parseInt(item.orderno) || 0;
          });
          const maxOrderNo = Math.max(...orderNumbers);
          nextOrderNo = maxOrderNo + 1;
        } else {
          nextOrderNo = 1;
        }
      } else {
      }
    } catch (err) {
    }

    const payload = {
      courseid: module.courseid,
      lessonid: module.id,
      weekid: week.id,
      userid: module.userid,
      orderno: nextOrderNo,
      status: 'active',
    };
    try {
      const res = await fetch('/api/weeklessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to assign module to week: ${res.statusText}`);
      }
      
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API error:', err);
      throw err;
    }
  };



  useEffect(() => {
    if (editModuleDialogOpen && editModuleDialogDescription) {
      // Preserve HTML content for rich text editor
      // Don't strip HTML tags as we want to preserve formatting
    }
  }, [editModuleDialogOpen]);













  // Add state for weekLessons (used for storing lessons for each week)
  const [weekLessons, setWeekLessons] = useState<{ [weekId: number]: any[] }>({});
  
  // Debug useEffect to log weekLessons changes
  useEffect(() => {
    console.log('weekLessons state changed:', weekLessons);
  }, [weekLessons]);

  // Helper function to fetch all data for selected course
  const fetchCourseData = async (courseId: string, skipWeekLessons = false) => {
    if (!courseId) {
      setModules([]);
      setWeeksFromApi([]);
      setWeekLessons({});
      return;
    }
    try {
      // 1. Fetch lessons (modules)
      const lessonsRes = await fetch(`/api/lessons?courseid=${encodeURIComponent(courseId)}`);
      const lessonsData = await lessonsRes.json();
      setModules(Array.isArray(lessonsData) ? lessonsData : []);

      // 2. Fetch weeks
      const weeksRes = await fetch(`/api/weeks?courseid=${encodeURIComponent(courseId)}`);
      const weeksData = await weeksRes.json();
      const weeksArr = Array.isArray(weeksData) ? weeksData : [];
      setWeeksFromApi(weeksArr);

      // 3. For each week, fetch its lessons (only if not skipped)
      if (!skipWeekLessons) {
        const weekLessonsObj: { [weekId: number]: any[] } = {};
        await Promise.all(
          weeksArr.map(async (week: any) => {
            const weekId = week.id || week.weekid;
            try {
              const wlRes = await fetch(`/api/weeklessons/week/${weekId}`);
              const wlData = await wlRes.json();
              weekLessonsObj[weekId] = Array.isArray(wlData) ? wlData : [];
            } catch {
              weekLessonsObj[weekId] = [];
            }
          })
        );
        setWeekLessons(weekLessonsObj);
      }
    } catch (err) {
      setModules([]);
      setWeeksFromApi([]);
      setWeekLessons({});
    }
  };

  // Fetch all data when selectedCourse changes
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseData(selectedCourse);
    } else {
      setModules([]);
      setWeeksFromApi([]);
      setWeekLessons({});
    }

  }, [selectedCourse]);



  // Add this function inside LessonPlanPage component:
  const handleDeleteLessonFromWeek = async (weekId: number, weekLessonId: number) => {
    try {
      const res = await fetch(`/api/weeklessons/${weekLessonId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete lesson from week');
      toast.success('Lesson removed from week!');
      // Refresh weekLessons for this week
      const wlRes = await fetch(`/api/weeklessons/week/${weekId}`);
      const wlData = await wlRes.json();
      setWeekLessons(prev => ({ ...prev, [weekId]: Array.isArray(wlData) ? wlData : [] }));
    } catch (err) {
      toast.error('Could not remove lesson from week');
    }
  };

  // 1. Add state for delete dialog for week lesson
  const [deleteWeekLessonDialogOpen, setDeleteWeekLessonDialogOpen] = useState(false);
  const [deleteWeekLessonData, setDeleteWeekLessonData] = useState<{ weekId: number, weekLessonId: number } | null>(null);



 

  // Add state for AI reference for Add Lesson dialog
  const [newModuleAiReference, setNewModuleAiReference] = useState("");


  // Reset form function for Add Lesson dialog
  const resetAddModuleForm = () => {
    setNewModuleTitle("");
    setNewModuleType("lecture");
    setNewModuleDuration("");
    setNewModuleQAQF("1");
    setNewModuleDescription("");
    setNewModuleUserId("");
    setNewModuleCourseId("");
    setNewModuleAiReference("");
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (addModuleDialogOpen) {
      resetAddModuleForm();
    }
  }, [addModuleDialogOpen]);

  // Add AI Generate handler for Add Lesson dialog

  

  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Weekly Lesson Planning</h3>
          <p className="text-neutral-600 mb-4">
            Create and manage weekly lesson plans for your course content. Organize your approved content into a structured schedule for up to 12 weeks.
          </p>
          <div className="border rounded-md p-4 bg-neutral-50 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-amber-500">info</span>
              <p className="text-sm font-medium">Only approved course content can be added to weekly lesson plans</p>
            </div>
            <p className="text-sm text-neutral-600">
              Select modules from your library and assign them to weeks using the add/edit features below. Drag-and-drop is disabled.
            </p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Select Course to Plan</h4>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCourse}
                onValueChange={(courseId) => setSelectedCourse(courseId)}
              >
                <SelectTrigger className="w-[250px]  focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 ? (
                    <div className="px-3 py-2 text-neutral-400 text-sm">No courses yet</div>
                  ) : (
                    courses.map((course, idx) => (
                      <SelectItem key={idx} value={course.id}>{course.title}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCourseDialogOpen(true)}
              >
                Add Course
              </Button> */}
            </div>
          </div>
          {/* Only show headings if no course is selected */}
          {!selectedCourse ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Modules Heading Only */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Available Approved Content</h5>
                </div>
              </div>
              {/* Right: Weeks Heading Only */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Weekly Schedule</h5>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-md p-4 bg-white mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Modules (no drag) */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Available Approved Content</h5>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setAddModuleDialogOpen(true)}
                      >
                        <span className="material-icons text-base">add</span>
                        Add
                      </Button>
                    </div>
                  </div>


                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {getUnassignedModules().map((content) => (
                      <div key={content.id} className="border rounded-md p-3 bg-neutral-50 hover:shadow-sm transition-all cursor-move" draggable onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData('moduleId', content.id);
                      }}>
                        <div className="flex justify-between mb-1 items-center">
                          <h6 className="font-medium flex items-center gap-1">
                            {content.title}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={e => {
                                e.stopPropagation();
                                handleEditRightSideModule(content);
                              }}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1 text-red-600 hover:text-red-700"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteRightSideModule(content);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </h6>
                          <span className="flex gap-1 items-center">
                            {(content.qaqfLevel || content.level || content.qaqf_level) && (
                              <span className={
                                (content.qaqfLevel || content.level || content.qaqf_level) <= 3 ? "bg-blue-100 text-blue-800 px-2 py-1 rounded" :
                                  (content.qaqfLevel || content.level || content.qaqf_level) <= 6 ? "bg-purple-100 text-purple-800 px-2 py-1 rounded" :
                                    "bg-violet-100 text-violet-800 px-2 py-1 rounded"
                              }>
                                QAQF {content.qaqfLevel || content.level || content.qaqf_level}: {QAQF_LEVELS[(content.qaqfLevel || content.level || content.qaqf_level) as keyof typeof QAQF_LEVELS]}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs ">
                          <span>{content.type}</span>
                          <span>{content.duration}</span>
                        </div>
                        {/* Slide-down details */}
                        {openModuleId === content.id && (
                          <div className="mt-3 bg-neutral-50 border rounded shadow p-4 animate-slideDown relative">
                            <div className="flex flex-col items-start mb-2">
                              <div><b>Title:</b> {content.title}</div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div><b>Type:</b> {content.type}</div>
                              <div><b>Duration:</b> {content.duration}</div>
                              <div>
                                <b>QAQF Level:</b>{" "}
                                {(() => {
                                  const qaqfLevel = content.qaqfLevel || content.level || content.qaqf_level;
                                  if (qaqfLevel && QAQF_LEVELS[qaqfLevel as keyof typeof QAQF_LEVELS]) {
                                    return `QAQF ${qaqfLevel}`;
                                  } else {
                                    return ` ${content.level}`;
                                  }
                                })()}
                              </div>
                              <div><b>User ID:</b> {content.userid}</div>
                              <div><b>Course ID:</b> {content.courseid}</div>
                              <div>
                            <b>Description:</b>
                            <div 
                              className="mt-2 p-3 bg-white border rounded-md prose prose-sm max-w-none"
                              style={{
                                lineHeight: '1.6',
                                fontSize: '14px'
                              }}
                              dangerouslySetInnerHTML={{ 
                                __html: content.description || (content.metadata && content.metadata.description) || "" 
                              }}
                            />
                          </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <style>{`
                      @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px);}
                        to { opacity: 1; transform: translateY(0);}
                      }
                      .animate-slideDown {
                        animation: slideDown 0.2s ease;
                      }
                    `}</style>
                  </div>
                </div>
                {/* Right: Weeks (no drop) */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Weekly Schedule</h5>
                    <div className="flex gap-2">
                      <span className="text-sm text-neutral-500">
                        {selectedCourse ? `${weeksFromApi.length} weeks for this course` : 'No course selected'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddDialogOpen(true)}
                        disabled={!selectedCourse}
                      >
                        <span className="material-icons text-sm mr-1">add</span>
                        Add Week
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {weeksToShow.map((week: any) => (
                      <div key={week.id} className="border rounded-md overflow-hidden bg-white">
                        <div className="bg-neutral-100 p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h6 className="font-medium text-sm">{week.title}</h6>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                setEditDialogOpen(true);
                                setEditDialogValue(week.title);
                                setEditWeekData({ ...week });
                              }}
                            >
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-red-600"
                              onClick={() => {
                                setDeleteWeekDialogOpen(true);
                                setDeleteWeekData({ ...week });
                              }}
                            >
                              <span className="material-icons text-sm">delete</span>
                            </Button>
                          </div>
                        </div>
                        <div
                          className="p-3 space-y-2 min-h-[60px]"
                          onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();
                            const moduleId = e.dataTransfer.getData('moduleId');
                            const module = modules.find(m => m.id.toString() === moduleId);
                            if (module) {
                              try {
                                
                                const result = await assignModuleToWeek(module, week);
                                if (result) {
                                
                                  setWeekLessons(prev => ({
                                    ...prev,
                                    [week.id]: [...(prev[week.id] || []), {
                                      id: result.id, 
                                      lessonid: module.id,
                                      title: module.title,
                                      weekid: week.id,
                                      orderno: result.orderno
                                    }]
                                  }));
                                  
                                  
                                  
                                  toast.success(`${module.title} added to ${week.title}`);
                                }
                              } catch (error) {
                                console.error('Error assigning module to week:', error);
                                toast.error("Failed to assign module to week");
                              }
                            }
                          }}
                        >
                          <h1>Drag and Drop Modules Here</h1>
                          {Array.isArray(weekLessons[week.id]) && weekLessons[week.id].length > 0 ? (
                            <DndContext
                              collisionDetection={closestCenter}
                              onDragEnd={async (event) => {
                                const { active, over } = event;
                                if (!active || !over || active.id === over.id) return;
                                
                                const oldIndex = weekLessons[week.id].findIndex((l: any) => l.id === active.id);
                                const newIndex = weekLessons[week.id].findIndex((l: any) => l.id === over.id);
                                if (oldIndex === -1 || newIndex === -1) return;
                          
                                const newLessons = arrayMove(weekLessons[week.id], oldIndex, newIndex);
                                setWeekLessons((prev) => ({ ...prev, [week.id]: newLessons }));
                                const orderPayload = newLessons.map((l: any, idx: number) => ({
                                  id: l.id, 
                                  orderno: idx + 1,
                                }));
                                
                                const validOrderPayload = orderPayload.filter(item => item.id !== undefined && item.orderno !== undefined);
                                await fetch('/api/weeklessonsorders', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(validOrderPayload), 
                                });
                                toast.success('Order updated!');
                              }}
                            >
                              <SortableContext
                                items={weekLessons[week.id].map((l: any) => l.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <ul className="space-y-2">
                                  {weekLessons[week.id].map((lesson: any) => {
                                    const lessonId = lesson.lessonid || lesson.id;
                                    const weekLessonId = lesson.id;
                                    const found = modules.find(m => m.id === lessonId);
                                    return (
                                      <SortableLesson key={weekLessonId} lesson={lesson}>
                                        {({ attributes, listeners }) => (
                                          <div className="border rounded p-2 bg-blue-50 flex items-center justify-between">
                                            <span>{lesson.title || (found ? found.title : "No Title")}</span>
                                            <span>
                                              {/* Drag handle */}
                                              <span {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: 8 }}>☰</span>
                                              {/* Delete button */}
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-800"
                                                onClick={e => {
                                                  e.stopPropagation();
                                                  console.log('Deleting lesson', weekLessonId);
                                                  setDeleteWeekLessonDialogOpen(true);
                                                  setDeleteWeekLessonData({ weekId: week.id, weekLessonId });
                                                }}
                                                title="Delete from week"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </span>
                                          </div>
                                        )}
                                      </SortableLesson>
                                    );
                                  })}
                                </ul>
                              </SortableContext>
                            </DndContext>
                          ) : (
                            <div className="text-neutral-400 italic">No modules assigned to this week.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Saved Lesson Plans</h4>
            {/* <Badge>{lessonPlans.length} plans</Badge> */}
          </div>
          {/* This section has been removed as per instructions */}
          {/* {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading lesson plans...</p>
            </div>
          ) : lessonPlans.length === 0 ? (
            <div className="border rounded-md p-8 bg-gray-50 text-center">
              <p className="text-gray-500 mb-2">No lesson plans found.</p>
              <p className="text-sm text-gray-400">
                Create lesson plans in the AI Content Studio Processing Center to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonPlans
                .filter(plan => selectedCourse === "" || plan.courseid === selectedCourse)
                .map((plan) => (
                  <div key={plan.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div>
                        <h5 className="font-medium">{plan.title}</h5>
                        <div className="text-sm text-neutral-500">
                          {plan.courseid ?? ""} • QAQF Level {plan.qaqf_level} • Duration: {plan.duration} • {Array.isArray(plan.activities) ? plan.activities.length : 0} activities
                        </div>
                      </div>
                      <div className="text-sm text-neutral-500">
                        Last updated: {new Date(plan.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Learning Objectives:</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(plan.learningObjectives) && plan.learningObjectives.slice(0, 2).map((objective: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {objective.length > 30 ? `${objective.substring(0, 30)}...` : objective}
                          </Badge>
                        ))}
                        {Array.isArray(plan.learningObjectives) && plan.learningObjectives.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{plan.learningObjectives.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setDeleteTargetId(plan.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1 bg-red-500" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )} */}
        </div>
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Week Title</DialogTitle>
          </DialogHeader>
          <input
            className="border rounded px-2 py-1 w-full mt-2"
            value={editDialogValue}
            onChange={e => setEditDialogValue(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="fixed left-1/2 bottom-8 top-auto -translate-x-1/2 w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Add Week</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
           
            <input
              className="border rounded px-2 py-1 w-full"
              value={addWeeksForm.title}
              onChange={e => setAddWeeksForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Week Title"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleAddWeekApi}>Add Week</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editModuleDialogOpen} onOpenChange={setEditModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
         
            <input
              className="border rounded px-2 py-1 w-full"
              value={newModuleCourseId}
              onChange={e => setNewModuleCourseId(e.target.value)}
              placeholder="Course ID"
              autoFocus
            />
          
            <select
              className="border rounded px-2 py-1 w-full"
              value={editModuleDialogType || "lecture"}
              onChange={e => setEditModuleDialogType(e.target.value)}
            >
              <option value="lecture">Lecture</option>
              <option value="practical">Practical</option>
              <option value="seminar">Seminar</option>
              <option value="activity">Activity</option>
              <option value="case_study">Case Study</option>
            </select>
           
            <input
              className="border rounded px-2 py-1 w-full"
              value={editModuleDialogTitle}
              onChange={e => setEditModuleDialogTitle(e.target.value)}
              placeholder="Title"
            />
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                value={editModuleDialogDuration || ""}
                onChange={e => setEditModuleDialogDuration(e.target.value)}
                placeholder="Duration (e.g. 60 min)"
              />
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={editModuleDialogQAQF || 1}
                  onChange={e => setEditModuleDialogQAQF(Number(e.target.value))}
                >
                  {Object.entries(QAQF_LEVELS).map(([qaqfLabel, qaqfName]) => {
                    const number = parseInt(qaqfLabel.replace("QAQF ", ""), 10);
                    return (
                      <option key={qaqfLabel} value={number}>
                        {qaqfLabel} - {qaqfName}
                      </option>
                    );
                  })}
                </select>
            </div>

            <textarea
              className="border rounded px-2 py-1 w-full"
              value={editModuleDialogScript}
              onChange={e => setEditModuleDialogScript(e.target.value)}
              placeholder="Desciption"
              rows={3}
            />
            <div className="overflow-auto" style={{ maxHeight: 250 }}>
              <JoditEditor
                value={editModuleDialogDescription}
                config={{ readonly: false, height: 250, width: '100%' }}
                tabIndex={1}
                onBlur={newContent => setEditModuleDialogDescription(newContent)}
                onChange={() => { }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditModuleDialogSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <Dialog open={addModuleDialogOpen} onOpenChange={setAddModuleDialogOpen}>
        <DialogContent className="max-w-full w-full h-full">
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] bg-white p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="max-w-6xl mx-auto">
       

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
                <div className="mt-2">
                  <TiptapEditor
                    ref={selectedTextEditorRef}
                    content={selectedText}
                    onContentChange={(newContent) => setSelectedText(newContent)}
                    className="bg-white border border-gray-200 rounded-lg min-h-[100px]"
                  />
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
                                           <div className="flex justify-end mb-3">
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
                      </div>
                                          <div 
                         className="text-gray-700 max-h-60 overflow-y-auto"
                         dangerouslySetInnerHTML={{ __html: parseMarkdown(aiResponse) }}
                       ></div>
                     
                     <div className="mt-4 flex gap-2">
                       <button
                         className="flex-1 py-2 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                         onClick={attachExplanationForAddLesson}
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
  {newModuleTitle}
  </h1>

     {/* Form Row */}
   <div className="grid grid-cols-5 gap-4 items-end mt-6">
     
     {/* Title Input */}
     <div className="space-y-2">
       <label className="text-sm font-medium text-gray-700">Title</label>
       <input
         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         value={newModuleTitle}
         onChange={e => setNewModuleTitle(e.target.value)}
         placeholder="Enter module title"
       />
     </div>

     {/* Type Dropdown */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Type</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={newModuleType}
        onChange={e => setNewModuleType(e.target.value)}
      >
        <option value="">Select a Type</option>
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
        value={newModuleDuration}
        onChange={e => setNewModuleDuration(e.target.value)}
        placeholder="e.g. 60 min"
      />
    </div>

    {/* QAQF Level Dropdown */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 ">QAQF Level</label>
      <select
        className="w-60 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={newModuleQAQF}
        onChange={e => setNewModuleQAQF(e.target.value)}
      >
        <option value="">Select a QAQF Level</option>
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
        className="w-20 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        onClick={() => handleAddModule({
          title: newModuleTitle,
          type: newModuleType,
          qaqfLevel: newModuleQAQF,
          duration: newModuleDuration,
          description: newModuleDescription,
          courseid: selectedCourse,
        })}
      >
        Add 
      </Button>
    </div>
  </div>
</div>


        {/* Lesson Content */}
        <div className="bg-white bg-opacity-98 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2"></div>
          
          {/* Editor Status Indicator */}
          {!isEditorReady && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-yellow-700 text-sm">Initializing editor...</span>
              </div>
            </div>
          )}
          
          <TiptapEditor
            content={lessonContent || ''}
            onContentChange={setLessonContent}
            onTextSelection={handleTextSelection}
            onReady={() => {
              console.log('🎉 TiptapEditor is ready in LessonPlan');
              setIsEditorReady(true);
            }}
            className="min-h-[400px]"
            editorRef={tiptapEditorRef}
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
          <DialogFooter>
            <DialogClose asChild>
              
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>





   
      <Dialog open={addCourseDialogOpen} onOpenChange={setAddCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              className="border rounded px-2 py-1 w-full"
              value={courseForm.title}
              onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title"
              autoFocus
            />
       
            <input
              className="border rounded px-2 py-1 w-full"
              value={courseForm.description}
              onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description"
            />
            <select
              className="border rounded px-2 py-1 w-full"
              value={courseForm.status}
              onChange={e => setCourseForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Not Active">Not Active</option>
            </select>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                if (!token) {
                  toast.error("Authentication required. Please login again.");
                  return;
                }
                
                const res = await fetch('/api/courses', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(courseForm),
                });
                
                if (!res.ok) {
                  const errorData = await res.json();
                  throw new Error(errorData.message || 'Failed to add course');
                }
                
                await fetchCoursesFromAPI();
                setSelectedCourse(courseForm.title);
                toast.success("Course added!");
                setAddCourseDialogOpen(false);
                setCourseForm({ title: "", userid: "", description: "", status: "" });
              } catch (err) {
                console.error('Error adding course:', err);
                toast.error(err instanceof Error ? err.message : "Could not add course");
              }
            }}>Add</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

   
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Week</DialogTitle>
          </DialogHeader>
          {!selectedCourse ? (
            <div className="py-4 text-center text-neutral-500">
              Please select a course first before adding a week.
            </div>
          ) : (
            <div className="space-y-3">
             
              <input
                className="border rounded px-2 py-1 w-full"
                value={addWeeksForm.title}
                onChange={e => setAddWeeksForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Title"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleAddWeekApi}
              disabled={!selectedCourse}
            >
              Add
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    
      <Dialog open={addWeeksDialogOpen} onOpenChange={setAddWeeksDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Weeks</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">

            <input
              className="border rounded px-2 py-1 w-full"
              value={addWeeksForm.title}
              onChange={e => setAddWeeksForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              distributeModulesToWeeks();
              setAddWeeksDialogOpen(false);
            }}>Add Weeks</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson Plan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this? ID: {deleteTargetId}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTargetId(null);
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTargetId(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
      <Dialog open={deleteModuleDialogOpen} onOpenChange={setDeleteModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this? (ID: {deleteModuleTarget?.moduleId})
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteModuleTarget) {
                  const success = await handleDeleteModuleApi(deleteModuleTarget.moduleId);
                  if (success) {
                    // Refresh modules from API instead of manually updating state
                    await fetchModulesFromAPI(selectedCourse);
                  }
                  setDeleteModuleDialogOpen(false);
                  setDeleteModuleTarget(null);
                }
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModuleDialogOpen(false);
                setDeleteModuleTarget(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rightSideEditDialogOpen} onOpenChange={setRightSideEditDialogOpen}>
        <DialogContent className="max-w-full w-full h-full bg-white">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] bg-white p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="max-w-6xl mx-auto">
       
        {/* Edit Module Selection Tooltip */}
        {editModuleShowTooltip && (
          <div 
            ref={editModuleTooltipRef}
            className="fixed bg-gray-900 text-white py-2 px-3 rounded-lg text-sm z-50 transition-opacity"
            style={{ 
              left: `${editModuleTooltipPosition.x}px`, 
              top: `${editModuleTooltipPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            Click to explain this text
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-5 border-r-5 border-t-5 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Edit Module Overlay */}
        {editModuleIsPopupOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={closeEditModulePopup}
          ></div>
        )}

        {/* Edit Module Popup */}
        {editModuleIsPopupOpen && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-popupIn">
            {/* Header - Fixed */}
            <div className="border-b border-gray-200 p-5 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-gray-800">🧠 AI Explanation</h3>
              <button 
                className="text-gray-500 hover:text-red-500 text-2xl transition-colors"
                onClick={closeEditModulePopup}
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
                    ref={editModuleSelectedTextEditorRef}
                    content={editModuleSelectedText}
                    onContentChange={(newContent) => setEditModuleSelectedText(newContent)}
                    className="bg-white border border-gray-200 rounded-lg min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="p-5 flex flex-wrap gap-2">
                {['explain', 'summary', 'detailed', 'examples'].map((type) => (
                  <button
                    key={type}
                    className={`px-4 py-2 rounded-full border-2 transition-all ${
                      editModuleCurrentExplanationType === type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 transform -translate-y-0.5'
                        : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setEditModuleCurrentExplanationType(type)}
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
                  onClick={sendEditModuleExplanationRequest}
                  disabled={editModuleIsLoading || editModuleIsAIGenerating}
                >
                  {editModuleIsLoading || editModuleIsAIGenerating ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editModuleIsAIGenerating ? 'Get AI Explanation...' : 'Get AI Explanation...'}
                    </div>
                  ) : (
                    <>
                      🚀 Get AI Explanation
                    </>
                  )}
                </button>
                
                {editModuleAiResponse && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-green-200">
                    <div className="flex justify-end mb-3">
                      <button
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-300 hover:bg-red-50 transition-colors"
                        onClick={() => {
                          setEditModuleAiResponse('');
                          setEditModuleResponseHistory([]);
                        }}
                        title="Clear all responses"
                      >
                        🗑️ Clear
                      </button>
                    </div>
                    <div className="text-gray-700 max-h-60 overflow-y-auto">
                      <TiptapEditor
                        ref={editModuleAiResponseEditorRef}
                        content={editModuleAiResponse}
                        onContentChange={(newContent) => setEditModuleAiResponse(newContent)}
                        className="bg-white border border-gray-200 rounded-lg min-h-[120px]"
                      />
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        className="flex-1 py-2 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                        onClick={attachEditModuleExplanation}
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
  {rightSideEditForm.title}
  </h1>

     {/* Form Row */}
   <div className="grid grid-cols-5 gap-4 items-end mt-6">
     
     {/* Title Input */}
     <div className="space-y-2">
       <label className="text-sm font-medium text-gray-700">Title</label>
       <input
         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         value={rightSideEditForm.title}
         onChange={e => setRightSideEditForm(f => ({ ...f, title: e.target.value }))}
         placeholder="Enter module title"
       />
     </div>

     {/* Type Dropdown */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Type</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={rightSideEditForm.type}
        onChange={e => setRightSideEditForm(f => ({ ...f, type: e.target.value }))}
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
        value={rightSideEditForm.duration}
        onChange={e => setRightSideEditForm(f => ({ ...f, duration: e.target.value }))}
        placeholder="e.g. 60 min"
      />
    </div>

    {/* QAQF Level Dropdown */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 ">QAQF Level</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={rightSideEditForm.qaqfLevel}
        onChange={e => setRightSideEditForm(f => ({ ...f, qaqfLevel: e.target.value }))}
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
        onClick={handleSaveRightSideModuleEdit}
      >
        Save Changes
      </Button>
    </div>
  </div>
</div>


        {/* Lesson Content */}
        <div className="bg-white bg-opacity-98 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2"></div>
          
          {/* Editor Status Indicator */}
          {!editModuleIsEditorReady && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-yellow-700 text-sm">Initializing editor...</span>
              </div>
            </div>
          )}
          
          <TiptapEditor
            content={rightSideEditForm.description || ''}
            onContentChange={(content) => setRightSideEditForm(prev => ({ ...prev, description: content }))}
            className="min-h-[200px]"
            onTextSelection={handleEditModuleTextSelection}
            onReady={() => {
              console.log('🎉 Edit Module TiptapEditor is ready');
              setEditModuleIsEditorReady(true);
            }}
            editorRef={editModuleTiptapEditorRef}
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
          <DialogFooter>
            
            <DialogClose asChild>
              
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  
      <Dialog open={rightSideDeleteDialogOpen} onOpenChange={setRightSideDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete "{rightSideDeleteModule?.title}"?
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={handleDeleteRightSideModuleConfirm}
            >
              Yes, Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRightSideDeleteDialogOpen(false);
                setRightSideDeleteModule(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={editWeekDialogOpen} onOpenChange={setEditWeekDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Week</DialogTitle>
          </DialogHeader>
          {editWeekData && (
            <div className="space-y-3">
              <input
                className="border rounded px-2 py-1 w-full"
                value={editWeekData.courseid || ''}
                onChange={e => setEditWeekData((prev: any) => ({ ...prev, courseid: e.target.value }))}
                placeholder="Course ID"
              />
              <input
                className="border rounded px-2 py-1 w-full"
                value={editWeekData.title || ''}
                onChange={e => setEditWeekData((prev: any) => ({ ...prev, title: e.target.value }))}
                placeholder="Title"
              />

            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleEditWeekSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteWeekDialogOpen} onOpenChange={setDeleteWeekDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Week</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this week? ID: {deleteWeekData?.id}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteWeekData?.id) {
                  try {
                    await deleteWeekById(deleteWeekData.id);
                    toast.success("Week deleted successfully!");
                    setDeleteWeekDialogOpen(false);
                    setDeleteWeekData(null);
                  } catch (err) {
                    toast.error("Failed to delete week. Please try again.");
                  }
                }
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteWeekDialogOpen(false);
                setDeleteWeekData(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
      <Dialog open={deleteWeekLessonDialogOpen} onOpenChange={setDeleteWeekLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson from Week</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this? ID: {deleteWeekLessonData?.weekLessonId}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteWeekLessonData) {
                  await handleDeleteLessonFromWeek(deleteWeekLessonData.weekId, deleteWeekLessonData.weekLessonId);
                  setDeleteWeekLessonDialogOpen(false);
                  setDeleteWeekLessonData(null);
                }
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteWeekLessonDialogOpen(false);
                setDeleteWeekLessonData(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Module Dialog */}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background: #d1d5db;
        }
        
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default LessonPlanPage;











function SortableLesson({
  lesson,
  children,
}: {
  lesson: any;
  children: (args: { attributes: any; listeners: any }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: '#e9f1ff',
        marginBottom: 8,
      }}
    >
      {children({ attributes, listeners })}
    </li>
  );
}