import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation,} from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Loader2, BookOpen, FileText, CheckCircle,
  GraduationCap, Settings, Lightbulb, Award, Plus, History,
  Upload, Link, FileImage, Globe, Scan, 
} from 'lucide-react';
import ProcessingCenterItem from '../components/content/ProcessingCenterItem';
import LessonPlanTemplate from '../components/content/LessonPlanTemplate';
import { useToast } from '../hooks/use-toast';
import { StudyMaterial } from '../../shared/schema'; // adjust path
import { QAQF_LEVELS } from '../types';

// Unified validation schema for both content types
const unifiedGenerationSchema = z.object({
  generation_type: z.enum(['content', 'course']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  subject_area: z.string().min(3, 'Subject area is required'),
  qaqf_level: z.number().min(1).max(9).optional(),
  target_audience: z.string().min(3, 'Target audience is required'),
  learning_objectives: z.string().min(10, 'Please provide detailed learning objectives'),

  // Content-specific fields
  content_type: z.enum(['academic_paper', 'assessment', 'lecture', 'study_guide']).optional(),
  module_code: z.string().optional(),

  // Course-specific fields
  duration_weeks: z.number().min(1).max(52).optional(),
  modules_count: z.number().min(3).max(20).optional(),
  delivery_mode: z.enum(['online', 'blended', 'face-to-face']).optional(),

  // Shared fields
  selected_characteristics: z.array(z.number()).min(1, 'Select at least one QAQF characteristic'),
  assessment_methods: z.array(z.string()).min(1, 'Select at least one assessment method'),
  prerequisites: z.string().optional(),
  additional_requirements: z.string().optional(),

  // Source content fields
  source_type: z.enum(['manual', 'pdf']).optional(),
  source_content: z.string().optional(),
  uploaded_files: z.array(z.string()).optional()
});

type UnifiedGenerationData = z.infer<typeof unifiedGenerationSchema>;

interface QAQFLevel {
  id: number;
  level: number;
  name: string;
  description: string;
}

interface QAQFCharacteristic {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface GeneratedItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  qaqfLevel?: number;
  qaqfComplianceScore?: number;
  content?: string;
  createdAt: string;
  createdBy: string;
  status: string;
  verificationStatus?: 'verified' | 'unverified' | 'rejected' | 'pending';
  progress?: number;
  estimatedTime?: string;
  metadata?: any;
}

interface UnifiedContentGeneratorProps {
  courseId?: string; // Add prop for course ID from parent
}

const UnifiedContentGenerator: React.FC<UnifiedContentGeneratorProps> = ({ courseId }) => {
  // Helper function to generate smaller IDs
  const generateSmallId = (): string => {
    // Generate a random 1-3 digit number (1-999)
    return Math.floor(1 + Math.random() * 999).toString();
  };

  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('processing');
  const [selectedType, setSelectedType] = useState<'content' | 'course'>('content');
  const [sourceType, setSourceType] = useState<'manual' | 'pdf'>('manual');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy] = useState<string>('newest');
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [selectedContentForLesson, setSelectedContentForLesson] = useState<GeneratedItem | null>(null);
  const { toast } = useToast();
  const [selectedPDFs, setSelectedPDFs] = useState<number[]>([]);
  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '');
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [collections, setCollections] = useState<{ id: number, name: string, description: string }[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [collectionPDFs, setCollectionPDFs] = useState<StudyMaterial[]>([]);
  

  // Fetch QAQF data dynamically
  const { isLoading: levelsLoading } = useQuery<QAQFLevel[]>({
    queryKey: ['/api/qaqf/levels'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: qaqfCharacteristics, isLoading: characteristicsLoading } = useQuery<QAQFCharacteristic[]>({
    queryKey: ['/api/qaqf/characteristics'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: materials = [], isLoading: materialsLoading, error: materialsError } = useQuery<StudyMaterial[]>({
    queryKey: ['study-materials'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://69.197.176.134:8000/api/study-materials', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error('Failed to fetch study materials');
      return response.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch collections
  const { data: collectionsData = [], isLoading: collectionsLoading, error: collectionsError } = useQuery<{ id: number, name: string, description: string }[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://69.197.176.134:8000/api/collection-study-materials', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Update collections state when data changes
  useEffect(() => {
    setCollections(collectionsData);
  }, [collectionsData]);

  // Filter PDFs by selected collection
  useEffect(() => {
    if (selectedCollectionId && materials.length > 0) {
      const filteredPDFs = materials.filter(material => {
        // Check if material has collection information
        const materialAny = material as any;
        return materialAny.collectionid?.toString() === selectedCollectionId || 
               materialAny.collection_id?.toString() === selectedCollectionId ||
               materialAny.collection?.toString() === selectedCollectionId;
      });
      setCollectionPDFs(filteredPDFs);
    } else {
      setCollectionPDFs([]);
    }
  }, [selectedCollectionId, materials]);

  // Debug logging
  useEffect(() => {
  console.log('studyMaterials:', materials);
    console.log('collections:', collections);
    console.log('selectedCollectionId:', selectedCollectionId);
    console.log('collectionPDFs:', collectionPDFs);
  }, [materials, collections, selectedCollectionId, collectionPDFs]);
  



  const form = useForm<UnifiedGenerationData>({
    resolver: zodResolver(unifiedGenerationSchema),
    defaultValues: {
      generation_type: 'content',
      title: '',
      subject_area: '',
      qaqf_level: undefined,
      target_audience: '',
      learning_objectives: '',
      content_type: 'academic_paper',
      module_code: '',
      duration_weeks: 12,
      modules_count: 6,
      delivery_mode: 'blended',
      selected_characteristics: [],
      assessment_methods: [],
      prerequisites: '',
      additional_requirements: '',
      source_content: '',
      source_type: 'manual',
      uploaded_files: []
    }
  });

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem('generatedItems');
      console.log('🔍 Loading data - localStorage value:', saved);
      if (saved) {
        const parsedItems = JSON.parse(saved);
        console.log('🔍 Parsed items:', parsedItems);
        if (Array.isArray(parsedItems)) {
          console.log('🔍 Setting generatedItems:', parsedItems);
          setGeneratedItems(parsedItems);
        } else {
          console.log('🔍 Parsed data is not an array');
          setGeneratedItems([]);
        }
      } else {
        console.log('🔍 No data in localStorage');
        setGeneratedItems([]);
      }
    } catch (error) {
      console.error('🔍 Error loading data:', error);
      setGeneratedItems([]);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever generatedItems changes
    localStorage.setItem('generatedItems', JSON.stringify(generatedItems));
    console.log('🔍 Saved to localStorage:', generatedItems);
  }, [generatedItems]);

  useEffect(() => {
    const fetchCourses = async () => {
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
        const coursesData = Array.isArray(data) ? data : [];
        setCourses(coursesData);
        console.log("Courses loaded:", coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
        // Optionally show a toast
      }
    };
    fetchCourses();
  }, []);

  const fetchLessons = async () => {
    if (!selectedCourse) {
      setCourseLessons([]);
      return;
    }
    try {
      const res = await fetch(`http://69.197.176.134:5000/api/lessons?courseid=${encodeURIComponent(selectedCourse)}`);
      if (!res.ok) throw new Error('Failed to fetch lessons');
      const data = await res.json();
      setCourseLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      setCourseLessons([]);
    }
  };

  // Update selectedCourse when courseId prop changes
  useEffect(() => {
    if (courseId && courseId !== selectedCourse) {
      setSelectedCourse(courseId);
    }
  }, [courseId, selectedCourse]);

  useEffect(() => {
    console.log("selectedCourse changed to:", selectedCourse);
    fetchLessons();
  }, [selectedCourse]);

  // Add a mechanism to refresh data periodically to catch status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedCourse) {
        fetchLessons();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedCourse]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    const fileArray = Array.from(files);
    setUploadedFiles(fileArray);

    try {
      const formData = new FormData();
      fileArray.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      formData.append('source_type', sourceType);

      const response = await fetch('/api/extract-content', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process files');

      const result = await response.json();
      setExtractedContent(result.extracted_text);
      form.setValue('source_content', result.extracted_text);

      toast({ title: `Successfully processed ${fileArray.length} file(s)` });
    } catch (error) {
      toast({ title: "Failed to process files", variant: "destructive" });
    } finally {
      setIsProcessingFiles(false);
    }
  };



  // Handler for drop event
  const handlePDFDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pdfId = e.dataTransfer.getData('application/pdf-id');
    const pdfName = e.dataTransfer.getData('application/pdf-name');
    if (pdfId) {
      // Optionally: fetch the PDF content from your API if you want to extract text
      // For now, just set the name as extracted content
      setExtractedContent(`PDF selected: ${pdfName}`);
      form.setValue('source_content', `PDF selected: ${pdfName}`);
      toast({ title: `PDF "${pdfName}" selected for content generation.` });
    }
  };

  // Filter and sort generated items
  const getFilteredAndSortedItems = () => {
    let filtered = generatedItems;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'compliance':
          return (b.qaqfComplianceScore ?? 0) - (a.qaqfComplianceScore ?? 0);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  };

  // Handle lesson plan creation
 

  const handleSaveLessonPlan = (lessonPlanData: any) => {
    const lessonPlanItem: GeneratedItem = {
      id: `lesson-${generateSmallId()}`,
      type: 'content',
      title: `Lesson Plan: ${lessonPlanData.title}`,
      description: `${lessonPlanData.duration} lesson for ${lessonPlanData.subject}`,
      qaqfLevel: lessonPlanData.qaqf_level,
      qaqfComplianceScore: 90,
      content: typeof lessonPlanData === 'string' ? lessonPlanData : JSON.stringify(lessonPlanData),
      createdAt: new Date().toISOString(),
      createdBy: 'User',
      status: 'completed',
    };
    setGeneratedItems(prev => [lessonPlanItem, ...prev]);
    setShowLessonPlan(false);
    setSelectedContentForLesson(null);
    toast({
      title: 'Lesson plan created successfully!',
      description: 'Your lesson plan is now available in the Processing Center.'
    });
  };

  const generationMutation = useMutation({
    mutationFn: async (data: UnifiedGenerationData) => {
      const endpoint = data.generation_type === 'content' ? 'http://69.197.176.134:8000/api/ai/generate-content' : 'http://69.197.176.134:8000/api/ai/generate-content';
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Get selected PDF information
      const selectedPDFInfo = materials
        .filter(pdf => selectedPDFs.includes(pdf.id))
        .map(pdf => ({
          id: pdf.id,
          title: pdf.title || pdf.file_name,
          file_name: pdf.file_name
        }));

      const requestData = {
        ...data,
        qaqf_characteristics: qaqfCharacteristics?.filter(c =>
          data.selected_characteristics.includes(c.id)
        ).map(c => c.name) || [],
        selected_pdfs: selectedPDFInfo,
        
        selected_course_id: selectedCourse,
        
      };

      console.log("API Request Data:", requestData);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      });
      if (!response.ok) throw new Error(`Failed to generate ${data.generation_type}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("API Response Data:", data);
      
      const newItem: GeneratedItem = {
        id: generateSmallId(),
        type: variables.generation_type,
        title: variables.title,
        description: data.description || data.generated_content?.substring(0, 100) || 'Generated content',
        qaqfLevel: variables.qaqf_level || 1,
        qaqfComplianceScore: data.qaqf_compliance_score || data.compliance_score || 85,
        content: typeof data === 'string'
          ? data
          : (data.generated_content || data.content || data.lesson_content || JSON.stringify(data)),
        createdAt: new Date().toISOString(),
        createdBy: 'User',
        status: 'completed',
        metadata: {
          ...data,
          original_response: data,
          courseid: selectedCourse, // Store the selected course ID in metadata
          selected_course_id: selectedCourse
        }
      };
      
      console.log("Created new item:", newItem);
      setGeneratedItems(prev => [newItem, ...prev]);
      setActiveTab('processing');
      toast({ 
        title: `${variables.generation_type === 'content' ? 'Content' : 'Course'} generated successfully!`,
        description: `Added to processing center for review.`
      });
    },
    onError: (_, variables) => {
      toast({
        title: `Failed to generate ${variables.generation_type}`,
        variant: "destructive"
      });
    },
  });

  const onSubmit = (data: UnifiedGenerationData) => {
    // Get selected course information
    const selectedCourseInfo = courses.find(course => String(course.id) === selectedCourse);
    setIsGenerating(true);
    console.log("Submit button clicked");
    console.log("Selected Course Name:", selectedCourseInfo?.title);
    
    // Validate that a course is selected
    if (!selectedCourse) {
      toast({
        title: "No course selected",
        description: "Please select a course before generating content.",
        variant: "destructive"
      });
      setIsGenerating(false);
      return;
    }
    
    // Validate that PDFs are selected if source type is PDF
    if (data.source_type === 'pdf' && selectedPDFs.length === 0) {
      toast({
        title: "No PDFs selected",
        description: "Please select at least one PDF from the collection.",
        variant: "destructive"
      });
      setIsGenerating(false);
      return;
    }
    
    generationMutation.mutate(data);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const contentTypes = [
    { value: 'academic_paper', label: 'Academic Paper' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'lecture', label: 'Lecture Notes' },
    { value: 'study_guide', label: 'Study Guide' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'exam', label: 'Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'practical', label: 'Practical' },
  ];

  const assessmentMethods = [
    'Written Examinations',
    'Practical Assessments',
    'Portfolio Development',
    'Project-Based Assessment',
    'Peer Assessment',
    'Self-Assessment',
    'Case Study Analysis',
    'Presentation & Viva',
    'Laboratory Reports',
    'Research Projects'
  ];

  



  


  if (levelsLoading || characteristicsLoading || materialsLoading || collectionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  // Show error states
  if (materialsError || collectionsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading data</p>
          <p className="text-sm text-gray-600">
            {materialsError && `Materials: ${materialsError.message}`}
            {collectionsError && `Collections: ${collectionsError.message}`}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-6">
     <div className="flex items-center justify-between mb-6">
  {/* Left side (icon + title + description) */}
  <div className="flex items-center space-x-3">
    <GraduationCap className="h-8 w-8 text-primary" />
    <div>
      <h1 className="text-3xl font-bold">
        Content Generator
      </h1>
      <p className="text-muted-foreground">
        Create content and courses with integrated QAQF compliance
      </p>
    </div>
  </div>

  {/* Right side (filters in one line) */}
  <div className="flex flex-wrap items-center gap-4 p-2 sm:p-4 bg-gray-50 rounded-lg">
    {/* Filter by Status */}
    <div className="flex items-center space-x-2">
      <Label htmlFor="filter-status">Filter by Status:</Label>
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-32 focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="unverified">Unverified</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Filter by Type */}
    <div className="flex items-center space-x-2">
      <Label htmlFor="filter-type">Filter by Type:</Label>
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="content">Content</SelectItem>
          <SelectItem value="course">Course</SelectItem>
          <SelectItem value="lesson">Lesson</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Select a Course */}
    <div className="flex items-center space-x-2">
      <Label htmlFor="filter-course" className="font-medium">
        Select a course:
      </Label>
      <Select
        value={selectedCourse}
        onValueChange={(value) => {
          setSelectedCourse(value);
          const selectedCourseInfo = courses.find(
            (course) => String(course.id) === String(value)
          );
          console.log("Course selected:", selectedCourseInfo);
        }}
      >
        <SelectTrigger className="w-40 focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="Select a course" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.id} value={String(course.id)}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
</div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2">
          <TabsTrigger value="generator" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Generator</span>
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Processing Center</span>
            {generatedItems.length > 0 && (
              <Badge variant="secondary" className="ml-1">{generatedItems.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            
          </Card>

          <form onSubmit={form.handleSubmit((data: UnifiedGenerationData) => {
            console.log("Submit button clicked");
            console.log("Current form data:", data);
            onSubmit(data);
          })} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder={selectedType === 'content' ? 'Advanced Data Analysis Techniques' : 'Complete Data Science Course'}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>
                {/* Select a course dropdown from LessonPlan.tsx */}
                {/* Course selection removed - using courseId from parent */}
                {selectedCourse ? (
                  <div className="space-y-2">
                    <Label>Selected Course</Label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm font-medium">
                        {courses.find(course => String(course.id) === selectedCourse)?.title || `Course ID: ${selectedCourse}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Selected Course</Label>
                    <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                      <p className="text-sm text-yellow-700">
                        No course selected. Please select a course from the filter above or navigate from a course page.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="subject_area">Subject Area</Label>
                  <Input
                    id="subject_area"
                    {...form.register('subject_area')}
                    placeholder="Data Science, Business Analytics"
                  />
                </div>

                <div className="space-y-2">
                  <Label>QAQF Level</Label>
                  <Select onValueChange={(value) => form.setValue('qaqf_level', parseInt(value))} defaultValue={form.watch('qaqf_level')?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select QAQF level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(QAQF_LEVELS).map(([key, value]) => (
                        <SelectItem key={key} value={(Object.keys(QAQF_LEVELS).indexOf(key) + 1).toString()}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Input
                    id="target_audience"
                    {...form.register('target_audience')}
                    placeholder="Graduate students, professionals"
                  />
                </div>

                {selectedType === 'content' && (
                  <>
                    <div className="space-y-2">
                      <Label>Content Type</Label>
                      <Controller
                        name="content_type"
                        control={form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                            <SelectContent>
                              {contentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="module_code">Module Code (Optional)</Label>
                      <Input
                        id="module_code"
                        {...form.register('module_code')}
                        placeholder="DS-101"
                        className="w-full"
                      />
                    </div>

                  </>
                )}

                {selectedType === 'course' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="duration_weeks">Duration (Weeks)</Label>
                      <Input
                        id="duration_weeks"
                        type="number"
                        min="1"
                        max="52"
                        {...form.register('duration_weeks', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modules_count">Number of Modules</Label>
                      <Input
                        id="modules_count"
                        type="number"
                        min="3"
                        max="20"
                        {...form.register('modules_count', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Delivery Mode</Label>
                      <Controller
                        name="delivery_mode"
                        control={form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select delivery mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="blended">Blended Learning</SelectItem>
                              <SelectItem value="face-to-face">Face-to-Face</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="learning_objectives">Learning Objectives</Label>
                  <Textarea
                    id="learning_objectives"
                    {...form.register('learning_objectives')}
                    placeholder="Describe the key learning objectives..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Source Content Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Source Content</span>
                </CardTitle>
                <CardDescription>
                  Choose how to provide source material for content generation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Material Collection and PDF dropdown - always visible at top */}
                    <div>
                      <Label htmlFor="collection">Material Collection *</Label>
                      <Select 
                        name="collection" 
                    value={selectedPDFs.length > 0 ? selectedPDFs[0].toString() : selectedCollectionId} 
                        onValueChange={(value) => {
                      // Check if the value is a PDF ID (from collectionPDFs) or a collection ID
                      const isPdfId = collectionPDFs.some(pdf => pdf.id.toString() === value);
                      
                      if (isPdfId) {
                        // Value is a PDF ID
                        const pdfId = parseInt(value);
                        setSelectedPDFs([pdfId]);
                        // Keep the current collection selected
                      } else {
                        // Value is a collection ID
                          setSelectedCollectionId(value);
                          setSelectedPDFs([]); // Reset selected PDFs when collection changes
                          console.log('Selected Collection ID:', value);
                      }
                        }}
                        required
                      >
                        <SelectTrigger>
                      <SelectValue placeholder="Select a collection or PDF (required)" />
                        </SelectTrigger>
                        <SelectContent>
                          {collectionsLoading ? (
                            <div className="px-3 py-2 text-neutral-400 text-sm">Loading collections...</div>
                          ) : collections.length === 0 ? (
                            <div className="px-3 py-2 text-neutral-400 text-sm">No collections found</div>
                          ) : (
                        <>
                          {/* Collections with their PDFs immediately below */}
                          {collections.map((collection) => {
                            const isSelectedCollection = collection.id.toString() === selectedCollectionId;
                            const collectionPdfs = materials.filter(material => {
                              const materialAny = material as any;
                              return materialAny.collectionid?.toString() === collection.id.toString() || 
                                     materialAny.collection_id?.toString() === collection.id.toString() ||
                                     materialAny.collection?.toString() === collection.id.toString();
                            });
                            
                            return (
                              <div key={`collection-${collection.id}`}>
                                <SelectItem value={collection.id.toString()}>
                                  📁 {collection.name}
                              </SelectItem>
                                
                                {/* Show PDFs immediately under the selected collection */}
                                {isSelectedCollection && collectionPdfs.length > 0 && (
                                  <>
                                    {collectionPdfs.map((pdf) => (
                                      <SelectItem 
                                        key={`pdf-${pdf.id}`} 
                                        value={pdf.id.toString()}
                                        className="ml-4"
                                      >
                                        📄 {pdf.title || pdf.file_name || `PDF ${pdf.id}`}
                                </SelectItem>
                                    ))}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </>
                            )}
                          </SelectContent>
                        </Select>
                        
                        {selectedPDFs.length > 0 && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm text-green-700 mb-2">
                        <strong>1</strong> PDF selected:
                            </p>
                            <div className="space-y-1">
                              {selectedPDFs.map((pdfId) => {
                                const pdf = collectionPDFs.find(p => p.id === pdfId);
                                return pdf ? (
                                  <div key={pdfId} className="flex items-center justify-between text-sm">
                              <span>{pdf.title || pdf.file_name || `PDF ${pdf.id}`}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-red-600"
                                onClick={() => setSelectedPDFs([])}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                {/* Source type selection - Manual Input and PDF/Books on same line */}
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all ${sourceType === 'manual' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSourceType('manual')}
                  >
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Manual Input</p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${sourceType === 'pdf' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSourceType('pdf')}
                  >
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">PDF/Books</p>
                    </CardContent>
                  </Card>
                  </div>



                {/* Manual input textarea - only show when manual source type is selected */}
                {sourceType === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="source_content">Source Content (Optional)</Label>
                    <Textarea
                      id="source_content"
                      {...form.register('source_content')}
                      placeholder="Paste or type your source content here..."
                      rows={6}
                      value={extractedContent || form.watch('source_content')}
                      onChange={(e) => {
                        setExtractedContent(e.target.value);
                        form.setValue('source_content', e.target.value);
                      }}
                    />
                  </div>
                )}




              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>QAQF Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>QAQF Characteristics (Select applicable characteristics)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {qaqfCharacteristics?.map((characteristic) => (
                      <div key={characteristic.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start space-x-2">
                          <Controller
                            name="selected_characteristics"
                            control={form.control}
                            render={({ field }) => (
                              <Checkbox
                                id={`char-${characteristic.id}`}
                                checked={field.value?.includes(characteristic.id)}
                                onCheckedChange={(checked) => {
                                  const updated = checked
                                    ? [...(field.value || []), characteristic.id]
                                    : (field.value || []).filter((id) => id !== characteristic.id);
                                  field.onChange(updated);
                                }}
                              />
                            )}
                          />
                          <div className="flex-1 space-y-1">
                            <Label htmlFor={`char-${characteristic.id}`} className="font-medium cursor-pointer">
                              {characteristic.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">{characteristic.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {characteristic.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Assessment Methods</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {assessmentMethods.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Controller
                          name="assessment_methods"
                          control={form.control}
                          render={({ field }) => (
                            <Checkbox
                              id={method}
                              checked={field.value?.includes(method)}
                              onCheckedChange={(checked) => {
                                const updated = checked
                                  ? [...(field.value || []), method]
                                  : (field.value || []).filter((m) => m !== method);
                                field.onChange(updated);
                              }}
                            />
                          )}
                        />
                        <Label htmlFor={method} className="text-sm font-normal cursor-pointer">
                          {method}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={isGenerating || generationMutation.isPending}
                className="flex items-center space-x-2"
                onClick={() => {
                  const formData = form.getValues() as UnifiedGenerationData;
                  console.log("Submit button clicked");
                  console.log("Current form data:", formData);
                  onSubmit(formData);
                }}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
                <span>
                  {isGenerating ? 'Generating...' : `Generate ${selectedType === 'content' ? 'Content' : 'Course'}`}
                </span>
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Processing Center</span>
              </CardTitle>
              <CardDescription>
                Review, edit, and approve all generated content with comprehensive workflow management
              </CardDescription>
            </CardHeader>
            <CardContent className=''>
              {/* Quick Debug */}
              {/* <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                Items: {generatedItems.length} | localStorage: {localStorage.getItem('generatedItems') ? 'Has Data' : 'Empty'}
                <button 
                  onClick={() => {
                    const testItem = {
                      id: 'demo-1',
                      type: 'content',
                      title: 'Demo Content',
                      description: 'This is demo content',
                      qaqfLevel: 5,
                      qaqfComplianceScore: 85,
                      content: 'Demo content body',
                      createdAt: new Date().toISOString(),
                      createdBy: 'Demo User',
                      status: 'completed'
                    };
                    setGeneratedItems([testItem]);
                    localStorage.setItem('generatedItems', JSON.stringify([testItem]));
                  }}
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Add Demo
                </button>
              </div> */}
              
              <div className="space-y-6">
                {/* Filter and Sort Controls - Always visible */}
               
                {/* Content Display */}
                {!selectedCourse ? (
                  // Show message when no course is selected
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No course selected</p>
                    <p className="text-sm">Please select a course to view its content and lessons.</p>
                  </div>
                ) : (
                  // Show course lessons and generated content when a course is selected
                  (() => {
                    // Get existing lessons for this course
                    const existingLessons = courseLessons.filter(lesson => {
                      // Apply status filter
                      if (filterStatus !== 'all') {
                        return lesson.status === filterStatus;
                      }
                      // Apply type filter
                      if (filterType !== 'all') {
                        return lesson.type === filterType;
                      }
                      return true;
                    });

                    // Get generated content for this specific course
                    const generatedContentForCourse = getFilteredAndSortedItems().filter(item => {
                      const itemCourseId = item.metadata?.courseid || item.metadata?.selected_course_id;
                      return itemCourseId === selectedCourse;
                    });

                    // Combine lessons and generated content
                    const allItems = [...existingLessons, ...generatedContentForCourse];

                    if (allItems.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No content found for this course</p>
                          <p className="text-sm">No lessons or generated content available for the selected course.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {allItems.map((item) => {
                          // Check if this is a lesson (from courseLessons) or generated content
                          const isLesson = courseLessons.some(lesson => lesson.id === item.id);
                          
                          if (isLesson) {
                            // Render existing lesson
                            return (
                              <ProcessingCenterItem
                                key={item.id}
                                item={{
                                  id: item.id,
                                  title: item.title,
                                  type: item.type || 'lesson',
                                  status: item.status || 'pending',
                                  verificationStatus: item.verification_status || item.status || 'pending',
                                  moderationStatus: item.moderation_status || 'pending',
                                  createdAt: item.createddate || '',
                                  createdBy: item.userid ? `User ${item.userid}` : 'User',
                                  description: item.description || item.content || (item.metadata && item.metadata.description) || '',
                                  qaqfLevel: item.level || undefined,
                                  progress: undefined,
                                  estimatedTime: undefined,
                                  content: JSON.stringify(item, null, 2), // for Content Preview
                                  metadata: item,
                                }}
                                selectedCourseId={selectedCourse}
                                onAction={async (action, itemId) => {
                                  if (action === 'deleted') {
                                    setGeneratedItems(prev => prev.filter(item => item.id !== itemId));
                                  } else if (action === 'status_changed') {
                                    // Refresh the data or update the item status
                                    setGeneratedItems(prev => [...prev]);
                                  } else if (action === 'updated') {
                                    // Refresh the lessons data when an item is updated
                                    await fetchLessons();
                                  } else if (action === 'refresh') {
                                    // Refresh the lessons data when status is updated
                                    await fetchLessons();
                                  }
                                }}
                              />
                            );
                          } else {
                            // Render generated content
                            return (
                              <ProcessingCenterItem
                                key={item.id}
                                item={{
                                  id: item.id,
                                  title: item.title,
                                  type: item.type,
                                  status: (['verified', 'unverified', 'rejected', 'pending'].includes(item.status) ? item.status : 'pending') as 'verified' | 'unverified' | 'rejected' | 'pending',
                                  verificationStatus: item.verificationStatus || item.status || 'pending',
                                  moderationStatus: item.moderationStatus || 'pending',
                                  createdAt: item.createdAt,
                                  createdBy: item.createdBy,
                                  description: item.description,
                                  qaqfLevel: item.qaqfLevel,
                                  qaqfComplianceScore: item.qaqfComplianceScore,
                                  content: item.content,
                                  metadata: item.metadata,
                                }}
                                selectedCourseId={selectedCourse}
                                onAction={async (action, itemId, newDescription) => {
                                  if (action === 'deleted') {
                                    setGeneratedItems(prev => prev.filter(item => item.id !== itemId));
                                  } else if (action === 'status_changed') {
                                    setGeneratedItems(prev => [...prev]);
                                  } else if (action === 'updated') {
                                    setGeneratedItems(prev => prev.map(item =>
                                      item.id === itemId
                                        ? { ...item, description: newDescription }
                                        : item
                                    ));
                                    if (selectedCourse) {
                                      fetchLessons();
                                    }
                                    toast({
                                      title: "Content updated successfully!",
                                      description: "Your changes have been saved."
                                    });
                                  } else if (action === 'refresh') {
                                    // Refresh the lessons data when status is updated
                                    await fetchLessons();
                                  }
                                }}
                              />
                            );
                          }
                        })}
                      </div>
                    );
                  })()
                )}

                {/* Summary Stats */}
                {selectedCourse && (() => {
                  // Get existing lessons for this course
                  const existingLessons = courseLessons.filter(lesson => {
                    // Apply status filter
                    if (filterStatus !== 'all') {
                      return lesson.status === filterStatus;
                    }
                    // Apply type filter
                    if (filterType !== 'all') {
                      return lesson.type === filterType;
                    }
                    return true;
                  });

                  // Get generated content for this specific course
                  const generatedContentForCourse = getFilteredAndSortedItems().filter(item => {
                    const itemCourseId = item.metadata?.courseid || item.metadata?.selected_course_id;
                    return itemCourseId === selectedCourse;
                  });

                  // Combine lessons and generated content
                  const allItems = [...existingLessons, ...generatedContentForCourse];

                  return allItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2 sm:p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {allItems.length}
                        </p>
                        <p className="text-sm text-gray-600">Total Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {allItems.filter(i => i.status === 'processing').length}
                        </p>
                        <p className="text-sm text-gray-600">Processing</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {allItems.filter(i => i.status === 'completed').length}
                        </p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">
                          {Math.round(allItems.reduce((acc, item) => acc + (item.qaqfComplianceScore ?? 0), 0) / Math.max(allItems.length, 1))}%
                        </p>
                        <p className="text-sm text-gray-600">Avg. Compliance</p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Lesson Plan Template Modal */}
      {showLessonPlan && selectedContentForLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-2xl md:max-w-4xl xl:max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* TODO: Replace 'lessonPlan' with the correct prop name if different */}
            <LessonPlanTemplate
              baseContent={selectedContentForLesson}
              onSave={handleSaveLessonPlan}
              onCancel={() => {
                setShowLessonPlan(false);
                setSelectedContentForLesson(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedContentGenerator;