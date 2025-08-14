import { CourseData, GeneratedCourse, GeneratedModule } from './courseTypes';

export const generateCourse = (courseData: CourseData): GeneratedCourse => {
  const { courseType, basicInfo,} = courseData;
  
  let modules: GeneratedModule[] = [];
  
  switch (courseType) {
    case 'academic':
      modules = generateAcademicModules(courseData);
      break;
    case 'corporate':
      modules = generateCorporateModules();
      break;
    case 'storytelling':
      modules = generateStorytellingModules(courseData);
      break;
  }

  const totalDuration = calculateTotalDuration(modules);

  return {
    id: generateId(),
    title: basicInfo.title,
    description: basicInfo.description,
    courseType,
    modules,
    totalDuration,
    createdAt: new Date()
  };
};

const generateAcademicModules = (courseData: CourseData): GeneratedModule[] => {
  const { basicInfo, learningObjectives } = courseData;
  const isLongCourse = learningObjectives.duration.includes('weeks');
  
  if (isLongCourse) {
    return [
      {
        id: 'module-1',
        title: 'Introduction and Overview',
        duration: '30 minutes',
        description: `Introduction to ${basicInfo.title.toLowerCase()} and course overview`,
        content: [
          'Course introduction and objectives',
          'Overview of key concepts',
          'Learning methodology',
          'Assessment criteria'
        ],
        activities: [
          'Welcome discussion',
          'Pre-assessment quiz',
          'Goal setting exercise'
        ]
      },
      {
        id: 'module-2',
        title: 'Core Concepts',
        duration: '60 minutes',
        description: 'Deep dive into fundamental concepts and theories',
        content: [
          'Theoretical foundations',
          'Key principles and frameworks',
          'Historical context',
          'Current applications'
        ],
        activities: [
          'Concept mapping',
          'Case study analysis',
          'Group discussions'
        ]
      },
      {
        id: 'module-3',
        title: 'Practical Applications',
        duration: '45 minutes',
        description: 'Hands-on application of learned concepts',
        content: [
          'Real-world examples',
          'Practical exercises',
          'Problem-solving techniques',
          'Best practices'
        ],
        activities: [
          'Hands-on exercises',
          'Project work',
          'Peer collaboration'
        ]
      },
      {
        id: 'module-4',
        title: 'Assessment and Review',
        duration: '30 minutes',
        description: 'Evaluation of learning outcomes and course review',
        content: [
          'Knowledge assessment',
          'Skill evaluation',
          'Course summary',
          'Next steps'
        ],
        assessments: [
          'Final examination',
          'Project presentation',
          'Peer evaluation'
        ]
      }
    ];
  } else {
    return [
      {
        id: 'module-1',
        title: 'Introduction and Core Concepts',
        duration: '45 minutes',
        description: `Introduction to ${basicInfo.title.toLowerCase()} and core concepts`
      },
      {
        id: 'module-2',
        title: 'Practical Application',
        duration: '60 minutes',
        description: 'Hands-on application and practice'
      },
      {
        id: 'module-3',
        title: 'Assessment and Wrap-up',
        duration: '30 minutes',
        description: 'Final assessment and course conclusion'
      }
    ];
  }
};

const generateCorporateModules = (): GeneratedModule[] => {
  return [
    {
      id: 'module-1',
      title: 'Business Context and Objectives',
      duration: '30 minutes',
      description: 'Understanding business goals and training objectives',
      content: [
        'Business case for training',
        'Performance objectives',
        'Success metrics',
        'ROI expectations'
      ]
    },
    {
      id: 'module-2',
      title: 'Core Skills Development',
      duration: '90 minutes',
      description: 'Developing essential skills and competencies',
      content: [
        'Skill assessment',
        'Core competencies',
        'Practical techniques',
        'Performance standards'
      ]
    },
    {
      id: 'module-3',
      title: 'Real-World Application',
      duration: '60 minutes',
      description: 'Applying skills in realistic business scenarios',
      content: [
        'Case studies',
        'Role-playing exercises',
        'Simulation activities',
        'Best practices'
      ]
    },
    {
      id: 'module-4',
      title: 'Implementation and Follow-up',
      duration: '45 minutes',
      description: 'Planning implementation and measuring success',
      content: [
        'Action planning',
        'Implementation strategies',
        'Performance tracking',
        'Continuous improvement'
      ]
    }
  ];
};

const generateStorytellingModules = (courseData: CourseData): GeneratedModule[] => {
  const {learningObjectives } = courseData;
  const sessionCount = parseInt(learningObjectives.duration.split('-')[1] || '4');
  
  const modules: GeneratedModule[] = [];
  
  for (let i = 1; i <= Math.min(sessionCount, 6); i++) {
    modules.push({
      id: `chapter-${i}`,
      title: `Chapter ${i}: Story Development`,
      duration: '45 minutes',
      description: `Story-based learning chapter ${i}`,
      content: [
        'Story narrative',
        'Character development',
        'Educational content integration',
        'Interactive elements'
      ],
      activities: [
        'Story discussion',
        'Character analysis',
        'Reflection questions',
        'Creative exercises'
      ]
    });
  }
  
  return modules;
};

const calculateTotalDuration = (modules: GeneratedModule[]): string => {
  const totalMinutes = modules.reduce((total, module) => {
    const minutes = parseInt(module.duration.split(' ')[0]);
    return total + minutes;
  }, 0);
  
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
  
  return `${totalMinutes}m`;
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

