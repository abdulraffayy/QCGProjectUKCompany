export interface CourseType {
  id: 'academic' | 'corporate' | 'storytelling';
  title: string;
  description: string;
  icon: 'BookOpen' | 'Briefcase' | 'Sparkles';
  features: string[];
  audience: string;
  duration: string;
  focus: string;
  color: 'blue' | 'green' | 'purple';
}

// Course generator shared types
export interface BasicInfo {
  title: string;
  description: string;
  targetAudience: string;
  qaqfLevel?: string;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface LearningObjectives {
  objectives: LearningObjective[];
  duration: string; 
  // Optional metadata from selection flows
  selectedPdfIds?: number[];
  selectedPdfNames?: string[];
  selectedPdfTitle?: string;
  selectedPdfFileName?: string;
  selectedPdfContent?: string;
  selectedCollectionId?: number;
  selectedCollectionName?: string;
}

export interface SpecializedContent {
  context?: string;
  industry?: string;
  compliance?: string;
  notes?: string;
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  progress: number; // 0-100
  isComplete: boolean;
}

export interface CourseData {
  courseType: CourseType['id'];
  basicInfo: BasicInfo;
  learningObjectives: LearningObjectives;
  specializedContent?: SpecializedContent;
}

export interface GeneratedModule {
  id: string;
  title: string;
  duration: string; // '30 minutes' etc
  description?: string;
  content?: string[];
  activities?: string[];
  assessments?: string[];
}

export interface GeneratedCourse {
  id: string;
  title: string;
  description: string;
  courseType: CourseType['id'];
  modules: GeneratedModule[];
  totalDuration: string;
  createdAt: Date;
  subject_area?: string;
  duration_weeks?: number;
}

// Small helper type used in forms/steps
export interface LearningObjective {
  id: string;
  text: string;
}

export const courseTypes: CourseType[] = [
  {
    id: 'academic',
    title: 'Academic Lecture',
    description: 'Traditional educational content with structured learning objectives, modules, and assessments',
    icon: 'BookOpen',
    features: [
      'Learning Objectives',
      'Structured Modules',
      'Assessment Methods',
      'Academic Standards'
    ],
    audience: 'Students & Educators',
    duration: '4-16 weeks',
    focus: 'Knowledge Transfer',
    color: 'blue'
  },
  {
    id: 'corporate',
    title: 'Corporate Training',
    description: 'Business-focused training materials with practical applications, case studies, and ROI metrics',
    icon: 'Briefcase',
    features: [
      'Business Objectives',
      'ROI Tracking',
      'Case Studies',
      'Performance Metrics'
    ],
    audience: 'Professionals & Teams',
    duration: '1-5 days',
    focus: 'Skill Development',
    color: 'green'
  },
  {
    id: 'storytelling',
    title: 'Storytelling Lecture',
    description: 'Narrative-driven educational content using storytelling techniques for engaging learning',
    icon: 'Sparkles',
    features: [
      'Character Development',
      'Story Arc',
      'Emotional Engagement',
      'Interactive Elements'
    ],
    audience: 'All Ages',
    duration: '1-8 sessions',
    focus: 'Engagement & Memory',
    color: 'purple'
  }
];

export const getDurationOptions = (courseType: CourseType['id']) => {
  switch (courseType) {
    case 'academic':
      return [
        { value: '4 weeks', label: '4 weeks' },
        { value: '8 weeks', label: '8 weeks' },
        { value: '12 weeks', label: '12 weeks' },
        { value: '16 weeks', label: '16 weeks' }
      ];
    case 'corporate':
      return [
        { value: '1-5 days', label: '1-5 days' }
      ];
    case 'storytelling':
      return [
        { value: '1-8 sessions', label: '1-8 sessions' }
      ];
    default:
      return [];
  }
};

export const getDifficultyOptions = () => [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' }
];

