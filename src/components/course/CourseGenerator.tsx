import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Loader2, BookOpen, Clock, Users, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Validation schema for course generation
const courseSchema = z.object({
  course_title: z.string().min(3, 'Course title must be at least 3 characters').max(200),
  target_audience: z.string().min(3, 'Target audience must be at least 3 characters').max(100),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  learning_objectives: z.string().min(10, 'Please provide detailed learning objectives'),
  duration_weeks: z.number().min(1).max(52),
  modules_count: z.number().min(3).max(20)
});

type CourseFormData = z.infer<typeof courseSchema>;

interface LessonContent {
  title: string;
  description: string;
  duration_minutes: number;
  learning_outcomes: string[];
  key_concepts: string[];
}

interface ModuleContent {
  module_number: number;
  title: string;
  description: string;
  duration_weeks: number;
  lessons: LessonContent[];
  assessment_type: string;
}

interface CourseResponse {
  course_title: string;
  description: string;
  target_audience: string;
  difficulty_level: string;
  total_duration_weeks: number;
  total_lessons: number;
  learning_objectives: string[];
  prerequisites: string[];
  modules: ModuleContent[];
  assessment_strategy: string;
  resources: string[];
}

export default function CourseGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<CourseResponse | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_title: '',
      target_audience: '',
      difficulty_level: 'intermediate',
      learning_objectives: '',
      duration_weeks: 8,
      modules_count: 6
    }
  });

  // Check Ollama status on component mount
  React.useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('/api/generate/course/status');
      const data = await response.json();
      setOllamaStatus(data.status === 'available' ? 'available' : 'unavailable');
    } catch (error) {
      setOllamaStatus('unavailable');
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsGenerating(true);
    
    try {
      // Convert learning objectives string to array
      const objectives = data.learning_objectives
        .split('\n')
        .map(obj => obj.trim())
        .filter(obj => obj.length > 0);

      const courseRequest = {
        ...data,
        learning_objectives: objectives
      };

      const response = await fetch('/api/generate/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to generate course');
      }

      const course = await response.json();
      setGeneratedCourse(course);
      
      toast({
        title: "Course Generated Successfully!",
        description: `Created "${course.course_title}" with ${course.total_lessons} lessons across ${course.modules.length} modules.`,
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate course content. Please check your input and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Generator</h1>
          <p className="text-muted-foreground">
            Create comprehensive course structures using AI-powered content generation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {ollamaStatus === 'available' && (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ollama Connected
            </Badge>
          )}
          {ollamaStatus === 'unavailable' && (
            <Badge variant="outline" className="text-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Using Fallback Mode
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Course</CardTitle>
            <CardDescription>
              Provide course details to generate a comprehensive curriculum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Course Title</label>
                <Input
                  {...form.register('course_title')}
                  placeholder="e.g., Introduction to Web Development"
                  className="mt-1"
                />
                {form.formState.errors.course_title && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.course_title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <Input
                  {...form.register('target_audience')}
                  placeholder="e.g., Beginners with no programming experience"
                  className="mt-1"
                />
                {form.formState.errors.target_audience && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.target_audience.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select 
                  value={form.watch('difficulty_level')} 
                  onValueChange={(value) => form.setValue('difficulty_level', value as 'beginner' | 'intermediate' | 'advanced')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration (weeks)</label>
                  <Input
                    type="number"
                    {...form.register('duration_weeks', { valueAsNumber: true })}
                    min={1}
                    max={52}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Number of Modules</label>
                  <Input
                    type="number"
                    {...form.register('modules_count', { valueAsNumber: true })}
                    min={3}
                    max={20}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Learning Objectives</label>
                <Textarea
                  {...form.register('learning_objectives')}
                  placeholder="Enter each learning objective on a new line:&#10;- Build responsive websites&#10;- Understand web development best practices&#10;- Deploy websites to production"
                  rows={4}
                  className="mt-1"
                />
                {form.formState.errors.learning_objectives && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.learning_objectives.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isGenerating} 
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Course...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Generate Course
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Course Display */}
        {generatedCourse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {generatedCourse.course_title}
                <Badge className={getDifficultyColor(generatedCourse.difficulty_level)}>
                  {generatedCourse.difficulty_level}
                </Badge>
              </CardTitle>
              <CardDescription>
                {generatedCourse.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{generatedCourse.total_duration_weeks} weeks</p>
                </div>
                <div className="text-center">
                  <BookOpen className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{generatedCourse.total_lessons} lessons</p>
                </div>
                <div className="text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{generatedCourse.modules.length} modules</p>
                </div>
              </div>

              <Separator />

              {/* Learning Objectives */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Learning Objectives
                </h4>
                <ul className="text-sm space-y-1">
                  {generatedCourse.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Course Modules */}
              <div>
                <h4 className="font-medium mb-3">Course Modules</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedCourse.modules.map((module, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">
                          Module {module.module_number}: {module.title}
                        </h5>
                        <Badge variant="outline" className="text-xs">
                          {module.lessons.length} lessons
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {module.description}
                      </p>
                      <div className="space-y-1">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="flex items-center text-xs">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span>{lesson.title}</span>
                            <span className="ml-auto text-muted-foreground">
                              {lesson.duration_minutes}min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Strategy */}
              {generatedCourse.assessment_strategy && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Assessment Strategy</h4>
                    <p className="text-sm text-muted-foreground">
                      {generatedCourse.assessment_strategy}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}