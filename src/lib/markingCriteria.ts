// Marking Criteria and Rubric Templates for QAQF Assessment

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  score: number;
  color: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  icon?: string;
  levels: RubricLevel[];
}

export interface Rubric {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriterion[];
}

// Default QAQF Rubric Template
export const DefaultRubricTemplate: Rubric = {
  id: 'qaqf-default',
  name: 'QAQF Standard Assessment Rubric',
  description: 'Standard rubric for assessing content alignment with QAQF framework characteristics',
  criteria: [
    {
      id: 'clarity',
      name: 'Clarity and Communication',
      description: 'How clearly the content communicates concepts and ideas',
      weight: 20,
      icon: 'visibility',
      levels: [
        { id: 'clarity-1', name: 'Needs Work', description: 'Unclear or confusing', score: 1, color: 'red' },
        { id: 'clarity-2', name: 'Developing', description: 'Somewhat clear with minor issues', score: 2, color: 'orange' },
        { id: 'clarity-3', name: 'Proficient', description: 'Clear and well-communicated', score: 3, color: 'yellow' },
        { id: 'clarity-4', name: 'Excellent', description: 'Exceptionally clear and engaging', score: 4, color: 'green' }
      ]
    },
    {
      id: 'accuracy',
      name: 'Accuracy and Correctness',
      description: 'Factual accuracy and correctness of information',
      weight: 25,
      icon: 'check_circle',
      levels: [
        { id: 'accuracy-1', name: 'Needs Work', description: 'Multiple errors present', score: 1, color: 'red' },
        { id: 'accuracy-2', name: 'Developing', description: 'Few minor errors', score: 2, color: 'orange' },
        { id: 'accuracy-3', name: 'Proficient', description: 'Accurate with no significant errors', score: 3, color: 'yellow' },
        { id: 'accuracy-4', name: 'Excellent', description: 'Completely accurate and precise', score: 4, color: 'green' }
      ]
    },
    {
      id: 'completeness',
      name: 'Completeness and Coverage',
      description: 'How thoroughly the content covers required topics',
      weight: 20,
      icon: 'assignment',
      levels: [
        { id: 'completeness-1', name: 'Needs Work', description: 'Major gaps in coverage', score: 1, color: 'red' },
        { id: 'completeness-2', name: 'Developing', description: 'Some gaps present', score: 2, color: 'orange' },
        { id: 'completeness-3', name: 'Proficient', description: 'Comprehensive coverage', score: 3, color: 'yellow' },
        { id: 'completeness-4', name: 'Excellent', description: 'Thorough and extensive coverage', score: 4, color: 'green' }
      ]
    },
    {
      id: 'alignment',
      name: 'QAQF Alignment',
      description: 'Alignment with QAQF level requirements and characteristics',
      weight: 35,
      icon: 'target',
      levels: [
        { id: 'alignment-1', name: 'Needs Work', description: 'Poor alignment with QAQF standards', score: 1, color: 'red' },
        { id: 'alignment-2', name: 'Developing', description: 'Partial alignment achieved', score: 2, color: 'orange' },
        { id: 'alignment-3', name: 'Proficient', description: 'Good alignment with standards', score: 3, color: 'yellow' },
        { id: 'alignment-4', name: 'Excellent', description: 'Perfect alignment with QAQF framework', score: 4, color: 'green' }
      ]
    }
  ]
};

// Marketing-Specific Rubric Template
export const MarketingRubricTemplate: Rubric = {
  id: 'marketing-rubric',
  name: 'Marketing Assessment Rubric',
  description: 'Specialized rubric for marketing content and strategy assessment',
  criteria: [
    {
      id: 'market-analysis',
      name: 'Market Analysis',
      description: 'Quality of market research and analysis',
      weight: 25,
      icon: 'analytics',
      levels: [
        { id: 'market-1', name: 'Basic', description: 'Limited market understanding', score: 1, color: 'red' },
        { id: 'market-2', name: 'Developing', description: 'Some market insights present', score: 2, color: 'orange' },
        { id: 'market-3', name: 'Proficient', description: 'Good market analysis', score: 3, color: 'yellow' },
        { id: 'market-4', name: 'Expert', description: 'Comprehensive market insights', score: 4, color: 'green' }
      ]
    },
    {
      id: 'strategy',
      name: 'Strategic Thinking',
      description: 'Strategic approach and planning quality',
      weight: 30,
      icon: 'strategy',
      levels: [
        { id: 'strategy-1', name: 'Basic', description: 'Limited strategic thinking', score: 1, color: 'red' },
        { id: 'strategy-2', name: 'Developing', description: 'Some strategic elements', score: 2, color: 'orange' },
        { id: 'strategy-3', name: 'Proficient', description: 'Well-developed strategy', score: 3, color: 'yellow' },
        { id: 'strategy-4', name: 'Expert', description: 'Sophisticated strategic approach', score: 4, color: 'green' }
      ]
    },
    {
      id: 'creativity',
      name: 'Creativity and Innovation',
      description: 'Creative and innovative approaches',
      weight: 20,
      icon: 'lightbulb',
      levels: [
        { id: 'creativity-1', name: 'Basic', description: 'Conventional approaches', score: 1, color: 'red' },
        { id: 'creativity-2', name: 'Developing', description: 'Some creative elements', score: 2, color: 'orange' },
        { id: 'creativity-3', name: 'Proficient', description: 'Creative and engaging', score: 3, color: 'yellow' },
        { id: 'creativity-4', name: 'Expert', description: 'Highly innovative and original', score: 4, color: 'green' }
      ]
    },
    {
      id: 'implementation',
      name: 'Implementation Feasibility',
      description: 'Practicality and feasibility of proposed solutions',
      weight: 25,
      icon: 'build',
      levels: [
        { id: 'implementation-1', name: 'Basic', description: 'Impractical or vague', score: 1, color: 'red' },
        { id: 'implementation-2', name: 'Developing', description: 'Somewhat feasible', score: 2, color: 'orange' },
        { id: 'implementation-3', name: 'Proficient', description: 'Practical and actionable', score: 3, color: 'yellow' },
        { id: 'implementation-4', name: 'Expert', description: 'Highly practical with clear execution plan', score: 4, color: 'green' }
      ]
    }
  ]
};

// Innovative Assessment Methods
export interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  metrics?: Array<{ name: string; description: string }>;
  simulationTypes?: Array<{ name: string; description: string }>;
  components?: Array<{ name: string; description: string }>;
  journeyStages?: Array<{ name: string; description: string }>;
  adaptiveElements?: Array<{ name: string; description: string }>;
}

export const InnovativeAssessmentMethods: AssessmentMethod[] = [
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis Assessment',
    description: 'Evaluate students\' ability to analyze competitors and market positioning',
    icon: 'compare_arrows',
    metrics: [
      { name: 'Market Share Analysis', description: 'Ability to assess and interpret market share data' },
      { name: 'Competitive Positioning', description: 'Understanding of competitive landscape' },
      { name: 'SWOT Analysis', description: 'Quality of strengths, weaknesses, opportunities, threats analysis' },
      { name: 'Strategic Recommendations', description: 'Practical and actionable strategic insights' }
    ]
  },
  {
    id: 'scenario-simulation',
    name: 'Scenario-Based Simulation',
    description: 'Real-world scenario simulations for practical skill assessment',
    icon: 'psychology',
    simulationTypes: [
      { name: 'Crisis Management', description: 'Handle marketing crises and reputation management' },
      { name: 'Product Launch', description: 'Plan and execute new product introduction strategies' },
      { name: 'Budget Allocation', description: 'Optimize marketing budget across channels and campaigns' },
      { name: 'Customer Retention', description: 'Develop strategies to improve customer loyalty and retention' }
    ]
  },
  {
    id: 'data-visualization',
    name: 'Data Storytelling Assessment',
    description: 'Evaluate ability to interpret and present marketing data effectively',
    icon: 'bar_chart',
    components: [
      { name: 'Data Interpretation', description: 'Accuracy in reading and understanding marketing metrics' },
      { name: 'Visual Design', description: 'Effectiveness of charts, graphs, and visual presentations' },
      { name: 'Narrative Structure', description: 'Clarity and persuasiveness of data-driven stories' },
      { name: 'Actionable Insights', description: 'Quality of recommendations based on data analysis' }
    ]
  },
  {
    id: 'consumer-journey',
    name: 'Consumer Journey Mapping',
    description: 'Assessment of understanding customer experience and touchpoint optimization',
    icon: 'route',
    journeyStages: [
      { name: 'Awareness', description: 'Understanding how customers first learn about products/services' },
      { name: 'Consideration', description: 'Analysis of evaluation and comparison processes' },
      { name: 'Purchase', description: 'Optimization of conversion and purchase experience' },
      { name: 'Retention', description: 'Post-purchase experience and loyalty building' },
      { name: 'Advocacy', description: 'Turning customers into brand advocates and referral sources' }
    ]
  },
  {
    id: 'adaptive-assessment',
    name: 'Adaptive Learning Assessment',
    description: 'Personalized assessment that adapts to student performance and learning pace',
    icon: 'tune',
    adaptiveElements: [
      { name: 'Difficulty Adjustment', description: 'Questions adapt based on previous responses' },
      { name: 'Learning Path Customization', description: 'Personalized learning recommendations' },
      { name: 'Real-time Feedback', description: 'Immediate feedback and guidance during assessment' },
      { name: 'Competency Mapping', description: 'Track progress across multiple skill areas' }
    ]
  }
];

// Utility Functions
export function getRubricByContentType(contentType: string, subject: string): Rubric {
  if (subject.toLowerCase().includes('marketing') || contentType.includes('marketing')) {
    return MarketingRubricTemplate;
  }
  return DefaultRubricTemplate;
}

export function getInnovativeAssessmentMethod(methodId: string): AssessmentMethod | undefined {
  return InnovativeAssessmentMethods.find(method => method.id === methodId);
}

export function calculateRubricScore(rubric: Rubric, ratings: Record<string, number>) {
  let totalScore = 0;
  let totalWeight = 0;

  rubric.criteria.forEach(criterion => {
    const rating = ratings[criterion.id];
    if (rating && rating > 0) {
      const maxScore = criterion.levels.length;
      const normalizedScore = (rating / maxScore) * 100;
      totalScore += normalizedScore * (criterion.weight / 100);
      totalWeight += criterion.weight;
    }
  });

  return {
    totalScore: Math.round(totalScore),
    maxPossibleScore: 100,
    weightedScore: totalWeight > 0 ? Math.round(totalScore * 100 / totalWeight) : 0,
    completionPercentage: Math.round((totalWeight / 100) * 100)
  };
}

// Assessment Response Templates
export const AssessmentResponseTemplates = {
  rubricFeedback: (criterionName: string, levelName: string, score: number, maxScore: number, feedback: string) => ({
    criterionName,
    levelAchieved: levelName,
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback
  }),

  overallFeedback: (totalScore: number, maxScore: number, strengths: string[], improvements: string[]) => ({
    overallScore: totalScore,
    maxPossibleScore: maxScore,
    percentage: Math.round((totalScore / maxScore) * 100),
    gradeLevel: totalScore >= 90 ? 'Excellent' : totalScore >= 75 ? 'Proficient' : totalScore >= 60 ? 'Developing' : 'Needs Work',
    strengths,
    areasForImprovement: improvements,
    recommendations: improvements.length > 0 
      ? `Focus on improving: ${improvements.join(', ')}` 
      : 'Continue maintaining high standards across all criteria'
  }),

  detailedFeedback: (assessment: any) => ({
    summary: `Assessment completed with ${assessment.criteriaFeedback?.length || 0} criteria evaluated`,
    timestamp: new Date().toISOString(),
    nextSteps: [
      'Review feedback for each criterion',
      'Focus on areas marked for improvement',
      'Consider peer review for additional perspectives',
      'Plan follow-up assessments to track progress'
    ]
  })
};