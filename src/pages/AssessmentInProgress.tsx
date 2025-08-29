import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../components/ui/dialog";
import MarkingCriteria from '../components/assessment/MarkingCriteria';
import MarkingCriteriaModule from '../components/assessment/MarkingCriteriaModule';
import { MODULE_TYPE_OPTIONS, ModuleType, QAQF_LEVELS } from '../types';
import { useRef } from 'react';
import TiptapEditor from '../components/TiptapEditor';
import { toast } from 'react-toastify';

// TypeScript interfaces
interface ExplanationAttachment {
  id: number;
  content: string;
  explanationType: string;
  isCollapsed: boolean;
  position: number; // Track position in content
  selectedText?: string; // Store the selected text for reference
}

const AssessmentInProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assessments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseAssessments, setCourseAssessments] = useState<any[]>([]);
  
  // State for assessment components
  const [selectedContentType] = useState<string>('assessment');
  const [selectedSubject] = useState<string>('General');
  const [selectedQaqfLevel] = useState<number>(3);

  // State for Edit Lesson dialog
  const [editLessonDialogOpen, setEditLessonDialogOpen] = useState(false);
  const [editLessonForm, setEditLessonForm] = useState({
    id: null as number | null,
    title: "",
    type: "lecture",
    duration: "",
    qaqfLevel: QAQF_LEVELS.Awareness,
    description: "",
    courseid: "",
    userid: "",
  });

  // State for Preview dialog
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewAssessment, setPreviewAssessment] = useState<any>(null);

  // State for AI Generate inputs
  const [aiQuery, setAiQuery] = useState("");
  const [aiReference, setAiReference] = useState("");
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Lesson content state for Tiptap editor
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);

  // State variables for AI explanation
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
  const [responseHistory, setResponseHistory] = useState<Array<{type: string, content: string, timestamp: number}>>([]);
  
  // Refs
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tiptapEditorRef = useRef<any>(null);
  const selectedTextEditorRef = useRef<any>(null);
  const aiResponseEditorRef = useRef<any>(null);

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
  const [editLessonIsEditorReady, setEditLessonIsEditorReady] = useState<boolean>(false);

  // Refs for Edit Lesson dialog
  const editLessonTiptapEditorRef = useRef<any>(null);
  const editLessonSelectedTextEditorRef = useRef<any>(null);
  const editLessonAiResponseEditorRef = useRef<any>(null);
  const editLessonTooltipRef = useRef<HTMLDivElement>(null);

  // Parse markdown content
  const parseMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

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

  // Handle text selection for Edit Lesson dialog
  const handleEditLessonTextSelection = (selectedText: string, selectionPosition?: {from: number, to: number}) => {
    if (selectedText && selectedText.trim() !== '') {
      const text = selectedText.trim();
      setEditLessonSelectedText(text);
      
      // Store selection position for later use
      if (selectionPosition) {
        setEditLessonSelectedLinePosition(selectionPosition.from);
      }
      
      console.log('Edit Lesson - Selected text:', text);
      console.log('Edit Lesson - Selection position:', selectionPosition);
      
      // Show tooltip with Ask Query button
      setTimeout(() => {
        setEditLessonShowTooltip(true);
        setEditLessonIsPopupOpen(false);
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

  // Close popup for Edit Lesson dialog
  const closeEditLessonPopup = () => {
    setEditLessonIsPopupOpen(false);
    setEditLessonAiResponse('');
    setEditLessonAiQuery('');
    setEditLessonAiReference('');
    setEditLessonSelectedLinePosition(-1);
    setEditLessonResponseHistory([]);
    setEditLessonIsEditorReady(false);
    
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

  // Send AI explanation request for Edit Lesson dialog
  const sendEditLessonExplanationRequest = async () => {
    setEditLessonIsLoading(true);
    setEditLessonIsAIGenerating(true);
    
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

      const generation_type = generationTypeMap[editLessonCurrentExplanationType] || 'explanation';
      const material = editLessonAiReference || editLessonSelectedText;
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
          qaqf_level: editLessonForm.qaqfLevel,
          subject,
          userquery,
          courseid: selectedCourse, // You can add course ID if needed
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
    
    // Check if editor is ready
    if (!editLessonTiptapEditorRef.current || !editLessonTiptapEditorRef.current.isReady() || !editLessonIsEditorReady) {
      console.error('❌ Edit Lesson Editor not ready');
      console.log('editLessonIsEditorReady:', editLessonIsEditorReady);
      console.log('editor.isReady():', editLessonTiptapEditorRef.current?.isReady());
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
    ${editLessonAiResponse}
  </div>
</div>
    `;

    console.log('Edit Lesson - Formatted explanation:', formattedExplanation);

    try {
      // Always insert at the end of the editor content
      const contentLength = editLessonTiptapEditorRef.current.getEditor().state.doc.content.size;
      const insertPosition = contentLength;
      
      console.log('Edit Lesson - Inserting at end of editor, position:', insertPosition);
      
      // Insert content at the end
      const result = editLessonTiptapEditorRef.current.insertContent(formattedExplanation, insertPosition);
      
      console.log('✅ Edit Lesson - AI response inserted successfully at the end');
      console.log('Edit Lesson - Insert result:', result);
      
      // Update the lesson content state
      const newContent = editLessonTiptapEditorRef.current.getContent();
      setLessonContent(newContent);
      console.log('✅ Edit Lesson - Content updated');
      
      // Show success message
      toast.success(`AI explanation attached successfully at the bottom!`, {
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
        const currentContent = lessonContent || '';
        const updatedContent = currentContent + formattedExplanation;
        setLessonContent(updatedContent);
        
        console.log('✅ Edit Lesson - Fallback: Updated lesson content state (appended to end)');
        toast.success(`AI explanation attached at the bottom (fallback method)!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        closeEditLessonPopup();
      } catch (fallbackError) {
        console.error('❌ Edit Lesson - Fallback also failed:', fallbackError);
        toast.error('Failed to insert AI explanation. Please try again.');
      }
    }
  };

  // Attach explanation to lesson at the selected line position
  const attachExplanation = () => {
    if (!selectedText) {
      alert('No text selected. Please select some text first.');
      return;
    }
    
    console.log('Selected text:', selectedText);
    console.log('AI Response:', aiResponse);
    console.log('Editor ref:', tiptapEditorRef.current);
    
    // Check if editor is ready
    if (!tiptapEditorRef.current) {
      console.error('❌ Editor ref is null');
      alert('Editor not ready. Please try again.');
      return;
    }

    // Check if editor is ready using the isReady method
    if (!tiptapEditorRef.current.isReady || !tiptapEditorRef.current.isReady()) {
      console.error('❌ Editor is not ready');
      alert('Editor is still initializing. Please wait a moment and try again.');
      return;
    }

    // Create formatted AI explanation content
    const formattedExplanation = `
<div class="my-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-md">
  <div class="font-bold text-gray-800 flex items-center mb-2">
    <span class="mr-2">💡</span>
    AI Explanation (${currentExplanationType})
  </div>
  <div class="mt-3 text-gray-700">
    ${aiResponse}
  </div>
</div>
    `;

    console.log('Formatted explanation:', formattedExplanation);

    try {
      // Get the editor instance
      const editor = tiptapEditorRef.current.getEditor ? tiptapEditorRef.current.getEditor() : tiptapEditorRef.current;
      
      if (!editor) {
        throw new Error('Editor instance not found');
      }

      // Try to insert content using the ref method first
      if (tiptapEditorRef.current.insertContent) {
        tiptapEditorRef.current.insertContent(formattedExplanation);
        console.log('✅ Content inserted using ref method');
      } else if (editor && editor.chain) {
        // Fallback: insert directly using editor instance
        editor.chain().focus().insertContent(formattedExplanation).run();
        console.log('✅ Content inserted using editor instance');
      } else {
        throw new Error('No valid insert method found');
      }
      
      // Update the lesson content state
      let newContent = '';
      if (tiptapEditorRef.current.getContent) {
        newContent = tiptapEditorRef.current.getContent();
      } else if (editor && editor.getHTML) {
        newContent = editor.getHTML();
      } else {
        newContent = lessonContent + formattedExplanation;
      }
      setLessonContent(newContent);
      console.log('✅ Lesson content updated');
      
      // Show success message
      console.log('🎉 Showing success toast...');
      toast.success("AI Explanation Generated Successfully! to your Edit Lesson.");
      console.log('✅ Toast called successfully');
      
      closePopup();
    } catch (error) {
      console.error('❌ Error inserting content:', error);
      alert('Failed to insert AI explanation. Please try again.');
    }
  };

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



  // Handle AI explanation request from TiptapEditor
  const handleAiExplanationRequest = (selectedText: string) => {
    setSelectedText(selectedText);
    setAiQuery(`Please explain this text: ${selectedText}`);
    setAiReference(selectedText);
    setCurrentExplanationType('explain');
    setIsPopupOpen(true);
    setAiResponse('');
    setResponseHistory([]);
  };

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
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
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch assessments for selected course
  const fetchCourseAssessments = async () => {
    if (!selectedCourse) {
      setCourseAssessments([]);
      return;
    }
    try {
      const res = await fetch(`/api/lessons?courseid=${encodeURIComponent(selectedCourse)}`);
      if (!res.ok) throw new Error('Failed to fetch course assessments');
      const data = await res.json();
      setCourseAssessments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch course assessments:', err);
      setCourseAssessments([]);
    }
  };







  // Handle editing lesson
  const handleEditLesson = async () => {
    if (!editLessonForm.id) return;
    
    setSaveLoading(true);
    try {
      const payload = {
        courseid: selectedCourse,
        title: editLessonForm.title,
        level: editLessonForm.qaqfLevel, // Convert qaqfLevel to level for API
        description: lessonContent, // Use the lesson content as description
        userid: "1", // You might want to get this from user context
        duration: editLessonForm.duration,
        type: editLessonForm.type,
      };

      const response = await fetch(`/api/lessons/${editLessonForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update lesson');

      // Refresh the assessments list
      await fetchCourseAssessments();
      
      // Reset form and close dialog
      setEditLessonForm({
        id: null,
        title: "",
        type: "lecture",
        duration: "",
        qaqfLevel: QAQF_LEVELS.Awareness,
        description: "",
        courseid: "",
        userid: "",
      });
      setEditLessonDialogOpen(false);
    } catch (error) {
      console.error('Error updating lesson:', error);
      // You might want to show a toast notification here
    } finally {
      setSaveLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (assessment: any) => {
    // Update lesson content with assessment description
    if (assessment.description) {
      setLessonContent(assessment.description);
    }
    
    setEditLessonForm({
      id: assessment.id,
      title: assessment.title || "",
      type: assessment.type || "lecture",
      duration: assessment.duration || "",
      qaqfLevel: assessment.qaqfLevel || assessment.level || QAQF_LEVELS.Awareness,
      description: assessment.description || "",
      courseid: assessment.courseid || "",
      userid: assessment.userid || "",
    });
    setEditLessonDialogOpen(true);
  };

  // Effect to ensure editor is ready when dialog opens
  useEffect(() => {
    if (editLessonDialogOpen) {
      // Give the editor time to initialize
      const timer = setTimeout(() => {
        console.log('🔍 Dialog opened, checking editor status...');
        console.log('Editor ref:', editLessonTiptapEditorRef.current);
        if (editLessonTiptapEditorRef.current) {
          console.log('Editor ready:', editLessonTiptapEditorRef.current.isReady());
          setEditLessonIsEditorReady(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editLessonDialogOpen]);

  // Open preview dialog
  const openPreviewDialog = (assessment: any) => {
    setPreviewAssessment(assessment);
    setPreviewDialogOpen(true);
  };

  useEffect(() => {
    fetchCourseAssessments();
  }, [selectedCourse]);



  // Filter and get assessments to display
  const getFilteredAssessments = () => {
    let assessments = courseAssessments;

    // Apply search filter
    if (searchTerm) {
      assessments = assessments.filter((assessment: any) => 
        assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType && filterType !== 'all') {
      assessments = assessments.filter((assessment: any) => assessment.type === filterType);
    }

    // Apply level filter
    if (filterLevel && filterLevel !== 'all') {
      assessments = assessments.filter((assessment: any) => {
        const level = assessment.qaqfLevel || assessment.level;
        switch (filterLevel) {
          case '1-3':
            return level >= 1 && level <= 3;
          case '4-6':
            return level >= 4 && level <= 6;
          case '7-9':
            return level >= 7 && level <= 9;
          default:
            return true;
        }
      });
    }

    return assessments;
  };

 

  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">Assessment in Progress</h1>
        <p className="text-neutral-600">Create, manage, and track assessments throughout the development process</p>
      </div>

      <Tabs defaultValue="assessments" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 text-xs md:text-sm">
          <TabsTrigger value="assessments" className="flex items-center">
            <span className="material-icons text-sm mr-2">quiz</span>
            Assessments
          </TabsTrigger>
          <TabsTrigger value="marking-criteria" className="flex items-center">
            <span className="material-icons text-sm mr-2">checklist</span>
            Marking Criteria
          </TabsTrigger>
          <TabsTrigger value="quality-assurance" className="flex items-center">
            <span className="material-icons text-sm mr-2">verified</span>
            Quality Assurance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessments">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <span className="material-icons text-sm">search</span>
                  </span>
                  <Input 
                    type="text" 
                    placeholder="Search assessments" 
                    className="pl-10 w-full md:w-80" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>  
                <div className="flex flex-wrap gap-3"> 
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-40 focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                
                   <select
              className="flex flex-col md:flex-row justify-between w-60 gap-4  focus:ring-0 focus:ring-offset-0 border border-neutral-300 rounded-md px-2 py-1"
              value={filterType}
              onChange={e => setFilterType(e.target.value as ModuleType)}
            >
              {Object.entries(MODULE_TYPE_OPTIONS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
                  
            
            <select
  className="flex flex-col md:flex-row justify-between gap-4 w-60 focusring-0 focus:ring-offset-0 border border-neutral-300 rounded-md px-2 py-1"
  value={filterLevel}
  onChange={e => setFilterLevel(e.target.value)}
>
  {Object.entries(QAQF_LEVELS).map(([key, value]) => (
    <option
      key={key}
      value={Object.keys(QAQF_LEVELS).indexOf(key) + 1}
    >
      {value}
    </option>
  ))}
</select>

          
                  
                  <Button variant="outline" size="default">
                    <span className="material-icons text-sm mr-2">filter_list</span>
                    More Filters
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {selectedCourse ? 'Course Assessments' : 'In-Progress Assessments'}
                  {getFilteredAssessments().length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({getFilteredAssessments().length} items)
                    </span>
                  )}
                </h3>
                {/* Removed Add Lesson Button */}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredAssessments().length > 0 ? (
                  getFilteredAssessments().map((assessment: any) => (
                    <Card key={assessment.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{assessment.title}</CardTitle>
                          {/* Place the course dropdown here */}
                          <Select
                
              >
                <SelectTrigger className="w-32 border border-neutral-300 focus:ring-0 focus:border-neutral-300">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <span className="capitalize">{assessment.type}</span>
                          <span className="text-xs">•</span>
                         
                          <span className="text-xs">•</span>
                                                     <Badge className={(assessment.level) <= 3 ? "bg-blue-100 text-blue-800 rounded-none hover:bg-blue-100" : 
                                           (assessment.level) <= 6 ? "bg-purple-100 text-purple-800 rounded-none hover:bg-purple-100" : 
                                           "bg-violet-100 text-violet-800 rounded-none hover:bg-violet-100"}>
                             QAQF {Object.values(QAQF_LEVELS)[(assessment.level) - 1] || `Level ${assessment.level}`}
                           </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Progress:</span>
                            <span className="font-medium">{assessment.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                (assessment.progress || 0) < 40 ? "bg-amber-500" : 
                                (assessment.progress || 0) < 80 ? "bg-blue-500" : 
                                "bg-green-500"
                              }`} 
                              style={{ width: `${assessment.progress || 0}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-neutral-600 mt-2">
                            {assessment.deadline ? `Deadline: ${assessment.deadline}` : 'No deadline set'}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(assessment)}>
                          <span className="material-icons text-sm mr-1">edit</span>
                          Continue
                        </Button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openPreviewDialog(assessment)}>
                            <span className="material-icons text-sm">preview</span>
                          </Button>
                          {/* Removed Delete Button */}
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <span className="material-icons text-4xl">quiz</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {selectedCourse ? 'No assessments found for this course' : 'No assessments found'}
                    </h3>
                    <p className="text-gray-500">
                      {selectedCourse 
                        ? 'This course doesn\'t have any assessments yet.' 
                        : 'Create your first assessment to get started.'}
                    </p>
                  </div>
                )}
              </div>
              
              <Separator className="my-8" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Assessment Templates</h3>
                <Button variant="outline">
                  <span className="material-icons text-sm mr-2">add</span>
                  Create Template
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 1,
                    name: "Multiple Choice Quiz",
                    icon: "quiz",
                    description: "Standard multiple choice format with 10-15 questions",
                    usageCount: 12
                  },
                  {
                    id: 2,
                    name: "Clinical Case Analysis",
                    icon: "medical_information",
                    description: "Patient case study with analysis questions and rubric",
                    usageCount: 8
                  },
                  {
                    id: 3,
                    name: "Research Critique",
                    icon: "grading",
                    description: "Framework for evaluating research papers with guidelines",
                    usageCount: 6
                  }
                ].map((template) => (
                  <div key={template.id} className="border rounded-md p-4 hover:border-primary hover:shadow-sm transition-all">
                    <div className="flex items-center mb-2">
                      <span className={`material-icons text-primary mr-2`}>{template.icon}</span>
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-neutral-700 mb-4">
                      <span>Used {template.usageCount} times</span>
                    </div>
                    <Button size="sm" className="w-full">Use Template</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="marking-criteria">
          <MarkingCriteria 
            contentType={selectedContentType}
            subject={selectedSubject}
            qaqfLevel={selectedQaqfLevel}
          />
        </TabsContent>
        
        <TabsContent value="quality-assurance">
          <MarkingCriteriaModule 
            contentType={selectedContentType}
            subject={selectedSubject}
            qaqfLevel={selectedQaqfLevel}
          />
        </TabsContent>
      </Tabs>

      {/* Removed Add Lesson Dialog */}

      {/* Edit Lesson Dialog */}
      <Dialog open={editLessonDialogOpen} onOpenChange={setEditLessonDialogOpen}>
        <DialogContent className="max-w-full w-full h-full bg-white">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] bg-white p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="max-w-6xl mx-auto">
       


        {/* Edit Lesson Overlay */}
        {editLessonIsPopupOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={closeEditLessonPopup}
          ></div>
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

                <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 ">QAQF Level</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={editLessonForm.qaqfLevel}
        onChange={e => setEditLessonForm(f => ({ ...f, qaqfLevel: e.target.value as QAQF_LEVELS }))}
      >
        {Object.values(QAQF_LEVELS).map(qaqfLevel => (
          <option key={qaqfLevel} value={qaqfLevel}>
            {qaqfLevel}
          </option>
        ))}
      </select>
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
  {editLessonForm.title}
  </h1>

     {/* Form Row */}
   <div className="grid grid-cols-5 gap-4 items-end mt-6">
     
     {/* Title Input */}
     <div className="space-y-2">
       <label className="text-sm font-medium text-gray-700">Title</label>
       <input
         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         value={editLessonForm.title}
         onChange={e => setEditLessonForm(f => ({ ...f, title: e.target.value }))}
         placeholder="Enter module title"
       />
     </div>

     {/* Type Dropdown */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Type</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={editLessonForm.type}
        onChange={e => setEditLessonForm(f => ({ ...f, type: e.target.value }))}
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
        value={editLessonForm.duration}
        onChange={e => setEditLessonForm(f => ({ ...f, duration: e.target.value }))}
        placeholder="e.g. 60 min"
      />
    </div>

    {/* QAQF Level Dropdown */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 ">QAQF Level</label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={editLessonForm.qaqfLevel}
        onChange={e => setEditLessonForm(f => ({ ...f, qaqfLevel: e.target.value as QAQF_LEVELS }))}
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
        onClick={handleEditLesson}
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
          
          <div className="relative">
            <TiptapEditor
              content={lessonContent || editLessonForm.description || ''}
              onContentChange={setLessonContent}
              onTextSelection={handleEditLessonTextSelection}
              onReady={() => {
                console.log('🎉 Edit Lesson TiptapEditor is ready');
                setEditLessonIsEditorReady(true);
              }}
              className="min-h-[400px]"
              editorRef={editLessonTiptapEditorRef}
            />
            
            {/* Ask Query Button - Right Side */}
            {editLessonShowTooltip && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
                  onClick={() => {
                    setEditLessonShowTooltip(false);
                    setTimeout(() => setEditLessonIsPopupOpen(true), 100);
                  }}
                >
                  Ask Query
                </button>
              </div>
            )}
          </div>
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

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Preview</DialogTitle>
          </DialogHeader>
          {previewAssessment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{previewAssessment.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{previewAssessment.type}</span>
                    </div>
                                          <div className="flex justify-between">
                        <span className="text-gray-600">QAQF Level:</span>
                        <span>{Object.values(QAQF_LEVELS)[(previewAssessment.qaqfLevel || previewAssessment.level) - 1] || `Level ${previewAssessment.qaqfLevel || previewAssessment.level}`}</span>
                      </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span>{previewAssessment.progress || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge 
                        className={
                          previewAssessment.status === 'draft' ? "bg-amber-100 text-amber-800" : 
                          previewAssessment.status === 'in_review' ? "bg-blue-100 text-blue-800" : 
                          "bg-purple-100 text-purple-800"
                        }
                      >
                        {previewAssessment.status === 'draft' ? "Draft" : 
                         previewAssessment.status === 'in_review' ? "In Review" : 
                         "Pending Approval"}
                      </Badge>
                    </div>
                    {previewAssessment.deadline && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span>{previewAssessment.deadline}</span>
                      </div>
                    )}
                    {previewAssessment.questionsCount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions:</span>
                        <span>{previewAssessment.questionsCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Progress</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`h-2.5 rounded-full ${
                        (previewAssessment.progress || 0) < 40 ? "bg-amber-500" : 
                        (previewAssessment.progress || 0) < 80 ? "bg-blue-500" : 
                        "bg-green-500"
                      }`} 
                      style={{ width: `${previewAssessment.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {previewAssessment.progress || 0}% complete
                  </p>
                </div>
              </div>
              
              {(previewAssessment.description || lessonContent) && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: lessonContent || previewAssessment.description }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removed Delete Confirmation Dialog */}
    </div>
  );
};

export default AssessmentInProgressPage;