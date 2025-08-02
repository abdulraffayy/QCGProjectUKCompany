import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation,} from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Loader2, BookOpen, Clock, Target, CheckCircle, 
  GraduationCap, Settings, FileText, BarChart3, Lightbulb, Award
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

// QAQF-integrated validation schema
const courseSchema = z.object({
  course_title: z.string().min(3, 'Course title must be at least 3 characters').max(200),
  subject_area: z.string().min(3, 'Subject area is required'),
  qaqf_level: z.number().min(1).max(9),
  target_audience: z.string().min(3, 'Target audience must be at least 3 characters'),
  learning_objectives: z.string().min(10, 'Please provide detailed learning objectives'),
  duration_weeks: z.number().min(1).max(52),
  modules_count: z.number().min(3).max(20),
  selected_characteristics: z.array(z.number()).min(1, 'Select at least one QAQF characteristic'),
  assessment_methods: z.array(z.string()).min(1, 'Select at least one assessment method'),
  delivery_mode: z.enum(['online', 'blended', 'face-to-face']),
  prerequisites: z.string().optional(),
  additional_requirements: z.string().optional()
});

type CourseFormData = z.infer<typeof courseSchema>;

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

interface GeneratedCourse {
  course_title: string;
  description: string;
  qaqf_compliance_score: number;
  modules: Array<{
    module_number: number;
    title: string;
    description: string;
    qaqf_characteristics: string[];
    learning_outcomes: string[];
    assessment_criteria: string[];
    duration_weeks: number;
    lessons: Array<{
      lesson_number: number;
      title: string;
      objectives: string[];
      content_outline: string[];
      assessment_activities: string[];
      duration_hours: number;
    }>;
  }>;
  assessment_framework: {
    formative_assessments: string[];
    summative_assessments: string[];
    grading_criteria: string[];
  };
  qaqf_alignment: {
    level_justification: string;
    characteristic_mapping: Record<string, string>;
    compliance_notes: string[];
  };
}

const DynamicCourseGenerator: React.FC = () => {
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const { toast } = useToast();

  // Fetch QAQF data dynamically
  const { data: qaqfLevels, isLoading: levelsLoading } = useQuery<QAQFLevel[]>({
    queryKey: ['/api/qaqf/levels'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: qaqfCharacteristics, isLoading: characteristicsLoading } = useQuery<QAQFCharacteristic[]>({
    queryKey: ['/api/qaqf/characteristics'],
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_title: '',
      subject_area: '',
      qaqf_level: 1,
      target_audience: '',
      learning_objectives: '',
      duration_weeks: 12,
      modules_count: 6,
      selected_characteristics: [],
      assessment_methods: [],
      delivery_mode: 'blended',
      prerequisites: '',
      additional_requirements: ''
    }
  });

  const courseGenerationMutation = useMutation({
    mutationFn: async (courseData: CourseFormData) => {
      const response = await fetch('/api/generate/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...courseData,
          qaqf_characteristics: qaqfCharacteristics?.filter(c => 
            courseData.selected_characteristics.includes(c.id)
          ).map(c => c.name) || []
        }),
      });
      if (!response.ok) throw new Error('Failed to generate course');
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCourse(data);
      setActiveTab('preview');
      toast({ title: "Course generated successfully with QAQF compliance!" });
    },
    onError: () => {
      toast({ title: "Failed to generate course", variant: "destructive" });
    },
  });

  const onSubmit = (data: CourseFormData) => {
    setIsGenerating(true);
    courseGenerationMutation.mutate(data);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const getQAQFLevelInfo = (level: number) => {
    const qaqfLevel = qaqfLevels?.find(l => l.level === level);
    return qaqfLevel || { name: `Level ${level}`, description: '' };
  };

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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">QAQF-Integrated Course Generator</h1>
          <p className="text-muted-foreground">Design courses with comprehensive QAQF framework compliance</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Course Setup</span>
          </TabsTrigger>
          <TabsTrigger value="qaqf" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>QAQF Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2" disabled={!generatedCourse}>
            <FileText className="h-4 w-4" />
            <span>Course Preview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Fundamentals</span>
                </CardTitle>
                <CardDescription>Define the core elements of your course</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="course_title">Course Title</Label>
                  <Input
                    id="course_title"
                    {...form.register('course_title')}
                    placeholder="Advanced Data Analysis Techniques"
                  />
                  {form.formState.errors.course_title && (
                    <p className="text-sm text-red-600">{form.formState.errors.course_title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject_area">Subject Area</Label>
                  <Input
                    id="subject_area"
                    {...form.register('subject_area')}
                    placeholder="Data Science, Business Analytics"
                  />
                  {form.formState.errors.subject_area && (
                    <p className="text-sm text-red-600">{form.formState.errors.subject_area.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Input
                    id="target_audience"
                    {...form.register('target_audience')}
                    placeholder="Graduate students, working professionals"
                  />
                  {form.formState.errors.target_audience && (
                    <p className="text-sm text-red-600">{form.formState.errors.target_audience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_mode">Delivery Mode</Label>
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

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="learning_objectives">Learning Objectives</Label>
                  <Textarea
                    id="learning_objectives"
                    {...form.register('learning_objectives')}
                    placeholder="Describe the key learning objectives and outcomes for this course..."
                    rows={4}
                  />
                  {form.formState.errors.learning_objectives && (
                    <p className="text-sm text-red-600">{form.formState.errors.learning_objectives.message}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites (Optional)</Label>
                  <Textarea
                    id="prerequisites"
                    {...form.register('prerequisites')}
                    placeholder="List any prerequisite knowledge or courses..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Assessment Configuration</span>
                </CardTitle>
                <CardDescription>Configure assessment methods and evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Assessment Methods (Select multiple)</Label>
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
                                const updatedMethods = checked
                                  ? [...(field.value || []), method]
                                  : (field.value || []).filter((m) => m !== method);
                                field.onChange(updatedMethods);
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
                  {form.formState.errors.assessment_methods && (
                    <p className="text-sm text-red-600">{form.formState.errors.assessment_methods.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('qaqf')}
                className="flex items-center space-x-2"
              >
                <span>Next: QAQF Configuration</span>
                <Target className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="qaqf" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>QAQF Framework Integration</span>
              </CardTitle>
              <CardDescription>
                Configure your course according to QAQF quality standards and characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
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
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {getQAQFLevelInfo(form.watch('qaqf_level')).description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>QAQF Characteristics (Select applicable characteristics)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
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
                                const updatedCharacteristics = checked
                                  ? [...(field.value || []), characteristic.id]
                                  : (field.value || []).filter((id) => id !== characteristic.id);
                                field.onChange(updatedCharacteristics);
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
                {form.formState.errors.selected_characteristics && (
                  <p className="text-sm text-red-600">{form.formState.errors.selected_characteristics.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_requirements">Additional QAQF Requirements</Label>
                <Textarea
                  id="additional_requirements"
                  {...form.register('additional_requirements')}
                  placeholder="Specify any additional quality requirements or compliance notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('setup')}
            >
              Back to Setup
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isGenerating || courseGenerationMutation.isPending}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Course...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4" />
                  <span>Generate QAQF Course</span>
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {generatedCourse && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{generatedCourse.course_title}</span>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>QAQF Score: {generatedCourse.qaqf_compliance_score}%</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>{generatedCourse.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">QAQF Compliance</h4>
                      <Progress value={generatedCourse.qaqf_compliance_score} className="w-full" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {generatedCourse.qaqf_alignment.level_justification}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">{generatedCourse.modules.length} Modules</p>
                      </div>
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">
                          {generatedCourse.modules.reduce((acc, m) => acc + m.duration_weeks, 0)} Weeks
                        </p>
                      </div>
                      <div className="text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">
                          {generatedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {generatedCourse.modules.map((module, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Module {module.module_number}: {module.title}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">QAQF Characteristics</h5>
                        <div className="flex flex-wrap gap-1">
                          {module.qaqf_characteristics.map((char, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Learning Outcomes</h5>
                        <ul className="text-sm space-y-1">
                          {module.learning_outcomes.slice(0, 3).map((outcome, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Lessons ({module.lessons.length})</h5>
                        <div className="space-y-2">
                          {module.lessons.slice(0, 2).map((lesson, idx) => (
                            <div key={idx} className="text-sm border rounded p-2">
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-muted-foreground">{lesson.duration_hours}h duration</p>
                            </div>
                          ))}
                          {module.lessons.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              +{module.lessons.length - 2} more lessons...
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Assessment Framework</CardTitle>
                  <CardDescription>QAQF-aligned assessment strategy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-2">Formative Assessments</h5>
                      <ul className="text-sm space-y-1">
                        {generatedCourse.assessment_framework.formative_assessments.map((assessment, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{assessment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Summative Assessments</h5>
                      <ul className="text-sm space-y-1">
                        {generatedCourse.assessment_framework.summative_assessments.map((assessment, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{assessment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">Export Course Plan</Button>
                <Button>Save to Module Library</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DynamicCourseGenerator;