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
  source_type: z.enum(['manual', 'pdf', 'website', 'scanned_doc']).optional(),
  source_content: z.string().optional(),
  website_url: z.string().url().optional(),
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

const UnifiedContentGenerator: React.FC = () => {
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('processing');
  const [selectedType, setSelectedType] = useState<'content' | 'course'>('content');
  const [sourceType, setSourceType] = useState<'manual' | 'pdf' | 'website' | 'scanned_doc'>('manual');
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
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  

  // Fetch QAQF data dynamically
  const { isLoading: levelsLoading } = useQuery<QAQFLevel[]>({
    queryKey: ['/api/qaqf/levels'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: qaqfCharacteristics, isLoading: characteristicsLoading } = useQuery<QAQFCharacteristic[]>({
    queryKey: ['/api/qaqf/characteristics'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: materials = [], isLoading: materialsLoading } = useQuery<StudyMaterial[]>({
    queryKey: ['http://38.29.145.85:8000/api/study-materials'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://38.29.145.85:8000/api/study-materials', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error('Failed to fetch study materials');
      return response.json();
    },
  });

  // 1. Console log for debugging
  console.log('studyMaterials:', materials);

  // 2. Filter for PDFs (covering both filename and fileName)
  



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
      website_url: '',
      uploaded_files: []
    }
  });

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('generatedItems');
    if (saved) {
      setGeneratedItems(JSON.parse(saved));
    }
    // No dummy data - start with empty array
  }, []);

  useEffect(() => {
    // Save to localStorage whenever generatedItems changes
    localStorage.setItem('generatedItems', JSON.stringify(generatedItems));
  }, [generatedItems]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
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
      const res = await fetch(`/api/lessons?courseid=${encodeURIComponent(selectedCourse)}`);
      if (!res.ok) throw new Error('Failed to fetch lessons');
      const data = await res.json();
      setCourseLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      setCourseLessons([]);
    }
  };

  useEffect(() => {
    console.log("selectedCourse changed to:", selectedCourse);
    fetchLessons();
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

  const handleWebsiteExtraction = async (url: string) => {
    if (!url) return;

    setIsProcessingFiles(true);

    try {
      const response = await fetch('/api/extract-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Failed to extract website content');

      const result = await response.json();
      setExtractedContent(result.extracted_text);
      form.setValue('source_content', result.extracted_text);

      toast({ title: "Website content extracted successfully" });
    } catch (error) {
      toast({ title: "Failed to extract website content", variant: "destructive" });
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
      id: `lesson-${Date.now()}`,
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
      const endpoint = data.generation_type === 'content' ? 'http://38.29.145.85:8000/api/ai/generate-content' : 'http://38.29.145.85:8000/api/ai/generate-content';
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
        id: Date.now().toString(),
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
          original_response: data
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

  



  


  if (levelsLoading || characteristicsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading QAQF Framework...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Unified Content & Course Generator</h1>
          <p className="text-muted-foreground">Create content and courses with integrated QAQF compliance</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
          <TabsTrigger value="library" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Content Library</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Type</CardTitle>
              <CardDescription>Choose what you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${selectedType === 'content' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    setSelectedType('content');
                    form.setValue('generation_type', 'content');
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Content Generation</h3>
                    <p className="text-sm text-muted-foreground">
                      Create academic papers, assessments, lectures, and study materials
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${selectedType === 'course' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    setSelectedType('course');
                    form.setValue('generation_type', 'course');
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Course Generation</h3>
                    <p className="text-sm text-muted-foreground">
                      Design complete courses with modules, lessons, and assessments
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={form.handleSubmit((data) => {
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
                <div className="space-y-2">
                  <Label htmlFor="course_select">Select a course</Label>
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                  >
                    <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <div className="px-3 py-2 text-neutral-400 text-sm">No courses yet</div>
                      ) : (
                        courses.map((course, idx) => (
                          <SelectItem key={idx} value={String(course.id)}>{course.title}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

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
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
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

                    <div className="space-y-2">
                      <Label htmlFor="module_code">Module Code (Optional)</Label>
                      <Input
                        id="module_code"
                        {...form.register('module_code')}
                        placeholder="DS-101"
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
                  <div className="mt-2">
                    <strong>Uploaded PDFs:</strong>
                    <ul className="space-y-2 mt-2">
                      {materialsLoading && <li className="text-sm text-gray-400">Loading PDFs...</li>}
                      {!materialsLoading && materials.length === 0 && (
                        <li className="text-sm text-gray-400">No PDFs found.</li>
                      )}
                      {materials.map((pdf) => (
                        <li
                          key={pdf.id}
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.setData('application/pdf-id', String(pdf.id ?? ''));
                            e.dataTransfer.setData('application/pdf-name', String(pdf.file_name ?? ''));
                          }}
                          className="flex items-center gap-2 cursor-move hover:bg-gray-50 p-2 rounded border"
                          style={{
                            border: selectedPDFs.includes(pdf.id) ? '2px solid #22c55e' : '1px solid #e5e7eb',
                            borderRadius: 6,
                            background: selectedPDFs.includes(pdf.id) ? '#f0fdf4' : undefined,
                          }}
                        >
                          {/* Checkbox selector */}
                          <input
                            type="checkbox"
                            checked={selectedPDFs.includes(pdf.id)}
                            onChange={e => {
                              const newSelectedPDFs = e.target.checked
                                ? [...selectedPDFs, pdf.id]
                                : selectedPDFs.filter(id => id !== pdf.id);
                              setSelectedPDFs(newSelectedPDFs);
                              
                              // Console logging for PDF selection
                              const selectedPDFInfo = materials
                                .filter(pdfItem => newSelectedPDFs.includes(pdfItem.id))
                                .map(pdfItem => ({
                                  id: pdfItem.id,
                                  title: pdfItem.title || pdfItem.file_name,
                                  file_name: pdfItem.file_name
                                }));
                              console.log("PDF Selection Changed:", selectedPDFInfo);
                              console.log("Selected PDF IDs:", newSelectedPDFs);
                              console.log("Selected PDF Names:", selectedPDFInfo.map(p => p.title));
                            }}
                            className="mr-2"
                            style={{ width: 18, height: 18 }}
                          />
                          {/* Tick icon if selected */}
                          {selectedPDFs.includes(pdf.id) && (
                            <span className="text-green-600 mr-1">
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                <path stroke="#22c55e" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                          {/* PDF link */}
                          <a
                            href={`/uploads/documents/${pdf.file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-blue-600 flex-1"
                          >
                            {pdf.title ? pdf.title : pdf.file_name}
                          </a>
                        </li>
                      ))}
                    </ul>
                    {selectedPDFs.length > 0 && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-700">
                          <strong>{selectedPDFs.length}</strong> PDF{selectedPDFs.length > 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

                  <Card
                    className={`cursor-pointer transition-all ${sourceType === 'website' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSourceType('website')}
                  >
                    <CardContent className="p-4 text-center">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Website URL</p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${sourceType === 'scanned_doc' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSourceType('scanned_doc')}
                  >
                    <CardContent className="p-4 text-center">
                      <Scan className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Scanned Docs</p>
                    </CardContent>
                  </Card>
                </div>

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

                {sourceType === 'pdf' && (
                  <div className="space-y-4">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                      onDrop={handlePDFDrop}
                      onDragOver={e => e.preventDefault()}
                    >
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.epub"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="pdf-upload"
                        disabled={isProcessingFiles}
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-900">Upload PDFs or Documents</p>
                        <p className="text-sm text-gray-500">
                          Supports PDF, DOC, DOCX, TXT, EPUB files. Multiple files allowed.
                        </p>
                        <div className="mt-2">
                          <strong>Uploaded PDFs:</strong>
                          {/* <ul>
                            {materialsLoading && <li className="text-sm text-gray-400">Loading PDFs...</li>}
                            {!materialsLoading && materials.length === 0 && (
                              <li className="text-sm text-gray-400">No PDFs found.</li>
                            )}
                            {materials.map((pdf) => (
                              <li
                                key={pdf.id}
                                draggable
                                onDragStart={e => {
                                  e.dataTransfer.setData('application/pdf-id', String(pdf.id ?? ''));
                                  e.dataTransfer.setData('application/pdf-name', String(pdf.file_name ?? ''));
                                }}
                                className="cursor-move hover:underline text-blue-600"
                              >
                                <a
                                  href={`/uploads/documents/${pdf.file_name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {pdf.title ? pdf.title : pdf.file_name}
                                </a>
                              </li>
                            ))}
                          </ul> */}
                          <p className="text-xs text-gray-500 mt-2">
                            Drag a PDF from the list above and drop it here to select it for content generation.
                          </p>
                        </div>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Files:</Label>
                        <div className="space-y-1">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <FileText className="h-4 w-4" />
                              <span>{file.name}</span>
                              <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isProcessingFiles && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing files...</span>
                      </div>
                    )}

                    {extractedContent && (
                      <div className="space-y-2">
                        <Label>Extracted Content:</Label>
                        <Textarea
                          value={extractedContent}
                          onChange={(e) => {
                            setExtractedContent(e.target.value);
                            form.setValue('source_content', e.target.value);
                          }}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                {sourceType === 'website' && (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Label htmlFor="website_url">Website URL</Label>
                        <Input
                          id="website_url"
                          {...form.register('website_url')}
                          placeholder="https://example.com/article"
                          type="url"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={() => {
                            const url = form.watch('website_url');
                            if (url) handleWebsiteExtraction(url);
                          }}
                          disabled={isProcessingFiles || !form.watch('website_url')}
                          className="flex items-center space-x-2"
                        >
                          {isProcessingFiles ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Link className="h-4 w-4" />
                          )}
                          <span>Extract</span>
                        </Button>
                      </div>
                    </div>

                    {extractedContent && (
                      <div className="space-y-2">
                        <Label>Extracted Website Content:</Label>
                        <Textarea
                          value={extractedContent}
                          onChange={(e) => {
                            setExtractedContent(e.target.value);
                            form.setValue('source_content', e.target.value);
                          }}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                {sourceType === 'scanned_doc' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="scan-upload"
                        disabled={isProcessingFiles}
                      />
                      <label htmlFor="scan-upload" className="cursor-pointer">
                        <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-900">Upload Scanned Documents</p>
                        <p className="text-sm text-gray-500">
                          Supports JPG, PNG, GIF, BMP, TIFF. OCR will extract text automatically.
                        </p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Images:</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-24 object-cover rounded border"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                                {file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isProcessingFiles && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing OCR...</span>
                      </div>
                    )}

                    {extractedContent && (
                      <div className="space-y-2">
                        <Label>OCR Extracted Text:</Label>
                        <Textarea
                          value={extractedContent}
                          onChange={(e) => {
                            setExtractedContent(e.target.value);
                            form.setValue('source_content', e.target.value);
                          }}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}
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
                  const formData = form.getValues();
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
              {generatedItems.length === 0 && courseLessons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No generated content to review yet</p>
                  <p className="text-sm">Generate some content first to see it here for review and approval.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filter and Sort Controls */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-4 p-2 sm:p-4 bg-gray-50 rounded-lg">
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
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="filter-course" className="font-medium">Select a course:</Label>
                      <Select value={selectedCourse} onValueChange={(value) => {
                        setSelectedCourse(value);
                        console.log("Raw selected value:", value);
                        console.log("Available courses:", courses);
                        
                        // Try different ways to find the course
                        const selectedCourseInfo = courses.find(course => {
                          const courseId = String(course.id);
                          const selectedValue = String(value);
                          return courseId === selectedValue;
                        });
                        
                        console.log("Course selected:", selectedCourseInfo);
                        console.log("Selected Course ID:", value);
                        console.log("Selected Course Name:", selectedCourseInfo?.title);
                        console.log("Selected Course Full Object:", selectedCourseInfo);
                      }}>
                        <SelectTrigger className="w-40 focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course.id} value={String(course.id)}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                 
                  {selectedCourse && generatedItems.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Recently Generated Content ({generatedItems.length})
                      </h3>
                      {generatedItems
                        .filter(item => {
                          // Apply status filter
                          if (filterStatus !== 'all') {
                            return item.status === filterStatus;
                          }
                          // Apply type filter
                          if (filterType !== 'all') {
                            return item.type === filterType;
                          }
                          return true;
                        })
                        .map((item) => (
                        <ProcessingCenterItem
                          key={item.id}
                          item={{
                            id: item.id,
                            title: item.title,
                            type: item.type,
                            status: (['verified', 'unverified', 'rejected', 'pending'].includes(item.status) ? item.status : 'pending') as 'verified' | 'unverified' | 'rejected' | 'pending',
                            createdAt: item.createdAt,
                            createdBy: item.createdBy,
                            description: item.description,
                            qaqfLevel: item.qaqfLevel,
                            qaqfComplianceScore: item.qaqfComplianceScore,
                            content: item.content,
                            metadata: item.metadata,
                          }}
                          onAction={async (action, itemId) => {
                            if (action === 'deleted') {
                              setGeneratedItems(prev => prev.filter(item => item.id !== itemId));
                            } else if (action === 'status_changed') {
                              // Refresh the data or update the item status
                              setGeneratedItems(prev => [...prev]);
                            } else if (action === 'updated') {
                              // Refresh the data when an item is updated
                              setGeneratedItems(prev => [...prev]);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Course Lessons Section */}
                  {selectedCourse && courseLessons.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Course Lessons ({courseLessons.filter(lesson => 
                          filterStatus === 'all' ? true : lesson.status === filterStatus
                        ).length})
                      </h3>
                      {courseLessons
                        .filter(lesson => {
                          // Apply status filter
                          if (filterStatus !== 'all') {
                            return lesson.status === filterStatus;
                          }
                          // Apply type filter
                          if (filterType !== 'all') {
                            return lesson.type === filterType;
                          }
                          return true;
                        })
                        .map((lesson) => (
                        <ProcessingCenterItem
                          key={lesson.id}
                          item={{
                            id: lesson.id,
                            title: lesson.title,
                            type: lesson.type || 'lesson',
                            status: lesson.status || 'pending',
                            createdAt: lesson.createddate || '',
                            createdBy: lesson.userid ? `User ${lesson.userid}` : 'User',
                            description: lesson.description || '',
                            qaqfLevel: lesson.level || undefined,
                            progress: undefined,
                            estimatedTime: undefined,
                            content: JSON.stringify(lesson, null, 2), // for Content Preview
                            metadata: lesson,
                          }}
                          onAction={async (action, itemId) => {
                            if (action === 'deleted') {
                              setGeneratedItems(prev => prev.filter(item => item.id !== itemId));
                            } else if (action === 'status_changed') {
                              // Refresh the data or update the item status
                              setGeneratedItems(prev => [...prev]);
                            } else if (action === 'updated') {
                              // Refresh the lessons data when an item is updated
                              await fetchLessons();
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Show message when no course is selected */}
                  {!selectedCourse && generatedItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Please select a course</p>
                      <p className="text-sm">Select a course from the dropdown above to view its lessons.</p>
                    </div>
                  )}

                  {/* Show message when course is selected but no lessons found */}
                  {selectedCourse && courseLessons.filter(lesson => 
                    filterStatus === 'all' ? true : lesson.status === filterStatus
                  ).length === 0 && generatedItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No lessons found</p>
                      <p className="text-sm">
                        {filterStatus !== 'all' 
                          ? `No lessons with status "${filterStatus}" found for this course.` 
                          : 'No lessons found for this course.'}
                      </p>
                    </div>
                  )}

                  {/* Summary Stats */}
                  {(getFilteredAndSortedItems().length > 0 || courseLessons.length > 0) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2 sm:p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {getFilteredAndSortedItems().length + courseLessons.length}
                        </p>
                        <p className="text-sm text-gray-600">Total Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {getFilteredAndSortedItems().filter(i => i.status === 'processing').length}
                        </p>
                        <p className="text-sm text-gray-600">Processing</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {getFilteredAndSortedItems().filter(i => i.status === 'completed').length}
                        </p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">
                          {Math.round(getFilteredAndSortedItems().reduce((acc, item) => acc + (item.qaqfComplianceScore ?? 0), 0) / Math.max(getFilteredAndSortedItems().length, 1))}%
                        </p>
                        <p className="text-sm text-gray-600">Avg. Compliance</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Module Library</span>
              </CardTitle>
              <CardDescription>Access your approved and completed content</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Get verified items from generated items
                const verifiedGeneratedItems = generatedItems.filter(item => 
                  item.status === 'verified' || item.verificationStatus === 'verified'
                );
                
                // Get verified items from course lessons
                const verifiedCourseLessons = courseLessons.filter(lesson => 
                  lesson.status === 'verified' || lesson.verificationStatus === 'verified'
                );
                
                // Combine all verified items
                const allVerifiedItems = [
                  ...verifiedGeneratedItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    status: ((item.status === 'verified' || item.verificationStatus === 'verified') ? 'verified' : 'pending') as 'verified' | 'pending',
                    verificationStatus: (item.verificationStatus || (item.status === 'verified' ? 'verified' : 'pending')) as 'verified' | 'pending',
                    createdAt: item.createdAt,
                    createdBy: item.createdBy,
                    description: item.description,
                    qaqfLevel: item.qaqfLevel,
                    progress: item.progress,
                    estimatedTime: item.estimatedTime,
                    content: item.content,
                    metadata: item.metadata,
                  })),
                  ...verifiedCourseLessons.map(lesson => ({
                    id: lesson.id,
                    title: lesson.title,
                    type: lesson.type || '',
                    status: ((lesson.status === 'verified' || lesson.verificationStatus === 'verified') ? 'verified' : 'pending') as 'verified' | 'pending',
                    verificationStatus: (lesson.verificationStatus || (lesson.status === 'verified' ? 'verified' : 'pending')) as 'verified' | 'pending',
                    createdAt: lesson.createddate || '',
                    createdBy: lesson.userid ? `User ${lesson.userid}` : 'User',
                    description: lesson.description || '',
                    qaqfLevel: lesson.level || undefined,
                    progress: undefined,
                    estimatedTime: undefined,
                    content: JSON.stringify(lesson, null, 2),
                    metadata: lesson,
                  }))
                ];

                if (allVerifiedItems.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium text-muted-foreground">No verified content yet</p>
                      <p className="text-sm text-muted-foreground">
                        Verify items in the Processing Center to see them here in your Module Library.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Verified Items ({allVerifiedItems.length})</span>
                      </div>
                      
                    </div>
                    
                    <div className="space-y-4">
                      {allVerifiedItems.map((item) => (
                        <ProcessingCenterItem
                          key={item.id}
                          item={item}
                          onAction={async (action, itemId) => {
                            if (action === 'deleted') {
                              // Remove from both lists
                              setGeneratedItems(prev => prev.filter(item => item.id !== itemId));
                              setCourseLessons(prev => prev.filter(lesson => lesson.id !== itemId));
                            } else if (action === 'status_changed') {
                              // Refresh the data
                              setGeneratedItems(prev => [...prev]);
                              await fetchLessons();
                            } else if (action === 'updated') {
                              // Refresh both lists
                              setGeneratedItems(prev => [...prev]);
                              await fetchLessons();
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
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