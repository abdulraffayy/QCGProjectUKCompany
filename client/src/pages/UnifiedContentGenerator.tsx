import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, BookOpen, FileText, Users, Target, CheckCircle, 
  GraduationCap, Settings, BarChart3, Lightbulb, Award, Plus, History,
  Upload, Link, FileImage, Globe, Scan
} from 'lucide-react';
import ProcessingCenterItem from '@/components/content/ProcessingCenterItem';
import { useToast } from '@/hooks/use-toast';

// Unified validation schema for both content types
const unifiedGenerationSchema = z.object({
  generation_type: z.enum(['content', 'course']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  subject_area: z.string().min(3, 'Subject area is required'),
  qaqf_level: z.number().min(1).max(9),
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
  type: 'content' | 'course';
  title: string;
  description: string;
  qaqf_level: number;
  qaqf_compliance_score: number;
  content: any;
  created_at: string;
  status: 'draft' | 'reviewed' | 'approved';
}

const UnifiedContentGenerator: React.FC = () => {
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedType, setSelectedType] = useState<'content' | 'course'>('content');
  const [sourceType, setSourceType] = useState<'manual' | 'pdf' | 'website' | 'scanned_doc'>('manual');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch QAQF data dynamically
  const { data: qaqfLevels, isLoading: levelsLoading } = useQuery<QAQFLevel[]>({
    queryKey: ['/api/qaqf/levels'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: qaqfCharacteristics, isLoading: characteristicsLoading } = useQuery<QAQFCharacteristic[]>({
    queryKey: ['/api/qaqf/characteristics'],
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm<UnifiedGenerationData>({
    resolver: zodResolver(unifiedGenerationSchema),
    defaultValues: {
      generation_type: 'content',
      title: '',
      subject_area: '',
      qaqf_level: 1,
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

  // File upload and processing functions
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
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'compliance':
          return b.qaqf_compliance_score - a.qaqf_compliance_score;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  };

  const generationMutation = useMutation({
    mutationFn: async (data: UnifiedGenerationData) => {
      const endpoint = data.generation_type === 'content' ? '/api/generate/content' : '/api/generate/course';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          qaqf_characteristics: qaqfCharacteristics?.filter(c => 
            data.selected_characteristics.includes(c.id)
          ).map(c => c.name) || []
        }),
      });
      if (!response.ok) throw new Error(`Failed to generate ${data.generation_type}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      const newItem: GeneratedItem = {
        id: Date.now().toString(),
        type: variables.generation_type,
        title: variables.title,
        description: data.description || 'Generated content',
        qaqf_level: variables.qaqf_level,
        qaqf_compliance_score: data.qaqf_compliance_score || 85,
        content: data,
        created_at: new Date().toISOString(),
        status: 'draft'
      };
      setGeneratedItems(prev => [newItem, ...prev]);
      setActiveTab('processing');
      toast({ title: `${variables.generation_type === 'content' ? 'Content' : 'Course'} generated successfully!` });
    },
    onError: (error, variables) => {
      toast({ 
        title: `Failed to generate ${variables.generation_type}`, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: UnifiedGenerationData) => {
    setIsGenerating(true);
    generationMutation.mutate(data);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const contentTypes = [
    { value: 'academic_paper', label: 'Academic Paper' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'lecture', label: 'Lecture Notes' },
    { value: 'study_guide', label: 'Study Guide' }
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

  const approveItem = (id: string) => {
    setGeneratedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'approved' } : item
      )
    );
    toast({ title: "Content approved and ready for deployment" });
  };

  const saveToLibrary = (item: GeneratedItem) => {
    // This would integrate with your content API
    toast({ title: `${item.type === 'content' ? 'Content' : 'Course'} saved to module library` });
  };

  if (levelsLoading || characteristicsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading QAQF Framework...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Unified Content & Course Generator</h1>
          <p className="text-muted-foreground">Create content and courses with integrated QAQF compliance</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Controller
                    name="qaqf_level"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select QAQF level" />
                        </SelectTrigger>
                        <SelectContent>
                          {qaqfLevels?.map((level) => (
                            <SelectItem key={level.id} value={level.level.toString()}>
                              Level {level.level} - {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
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
                  Choose how to provide source material for content generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                type="submit"
                disabled={isGenerating || generationMutation.isPending}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4" />
                    <span>Generate {selectedType === 'content' ? 'Content' : 'Course'}</span>
                  </>
                )}
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
            <CardContent>
              {generatedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No generated content to review yet</p>
                  <p className="text-sm">Generate some content first to see it here for review and approval.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filter and Sort Controls */}
                  <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="filter-status">Filter by Status:</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
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
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="sort-by">Sort by:</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="title">Title A-Z</SelectItem>
                          <SelectItem value="compliance">Compliance Score</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Content Items */}
                  <div className="space-y-4">
                    {getFilteredAndSortedItems().map((item) => (
                      <ProcessingCenterItem 
                        key={item.id} 
                        item={item} 
                        onUpdate={(updatedItem) => {
                          setGeneratedItems(prev => 
                            prev.map(i => i.id === updatedItem.id ? updatedItem : i)
                          );
                        }}
                        onDelete={(itemId) => {
                          setGeneratedItems(prev => prev.filter(i => i.id !== itemId));
                        }}
                      />
                    ))}
                  </div>

                  {/* Summary Stats */}
                  {getFilteredAndSortedItems().length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{getFilteredAndSortedItems().length}</p>
                        <p className="text-sm text-gray-600">Items Shown</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {getFilteredAndSortedItems().filter(i => i.status === 'approved').length}
                        </p>
                        <p className="text-sm text-gray-600">Approved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {getFilteredAndSortedItems().filter(i => i.status === 'reviewed').length}
                        </p>
                        <p className="text-sm text-gray-600">Under Review</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">
                          {Math.round(getFilteredAndSortedItems().reduce((acc, item) => acc + item.qaqf_compliance_score, 0) / getFilteredAndSortedItems().length)}%
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
              <CardTitle>Content Library</CardTitle>
              <CardDescription>Access your approved and saved content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Your content library will display approved content here. 
                  Save content from the Processing Center to build your library.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedContentGenerator;