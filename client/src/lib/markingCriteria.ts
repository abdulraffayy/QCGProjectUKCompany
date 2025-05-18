// Marking Criteria Framework
import { QAQFLevels, QAQFCharacteristics } from './qaqf';

// Rubric Score Definitions
export const RubricScores = [
  {
    id: 1,
    score: 'Exceptional',
    description: 'Exceeds all expectations and demonstrates exceptional mastery.',
    percentageRange: '90-100%',
    gradeEquivalent: 'A+',
    color: 'green'
  },
  {
    id: 2,
    score: 'Excellent',
    description: 'Meets all expectations with high-quality work and demonstrates significant understanding.',
    percentageRange: '80-89%',
    gradeEquivalent: 'A',
    color: 'emerald'
  },
  {
    id: 3,
    score: 'Very Good',
    description: 'Meets most expectations with good quality work and demonstrates solid understanding.',
    percentageRange: '70-79%',
    gradeEquivalent: 'B',
    color: 'teal'
  },
  {
    id: 4,
    score: 'Good',
    description: 'Meets basic expectations with satisfactory work and demonstrates adequate understanding.',
    percentageRange: '60-69%',
    gradeEquivalent: 'C',
    color: 'cyan'
  },
  {
    id: 5,
    score: 'Satisfactory',
    description: 'Meets some expectations with acceptable work and demonstrates basic understanding.',
    percentageRange: '50-59%',
    gradeEquivalent: 'D',
    color: 'yellow'
  },
  {
    id: 6,
    score: 'Needs Improvement',
    description: 'Falls below expectations with minimal work and demonstrates limited understanding.',
    percentageRange: '40-49%',
    gradeEquivalent: 'E',
    color: 'orange'
  },
  {
    id: 7,
    score: 'Unsatisfactory',
    description: 'Does not meet expectations with inadequate work and demonstrates insufficient understanding.',
    percentageRange: '0-39%',
    gradeEquivalent: 'F',
    color: 'red'
  }
];

// Default Rubric Template
export const DefaultRubricTemplate = {
  id: 'default-rubric',
  name: 'QAQF Standard Rubric',
  description: 'Standard assessment rubric based on QAQF characteristics',
  criteria: QAQFCharacteristics.map(characteristic => ({
    id: `criterion-${characteristic.id}`,
    name: characteristic.name,
    description: characteristic.description,
    category: characteristic.category,
    icon: characteristic.icon,
    weight: 100 / QAQFCharacteristics.length, // Equal weight distribution
    levels: RubricScores.map(score => ({
      id: `${characteristic.id}-level-${score.id}`,
      name: score.score,
      description: `${score.description} for ${characteristic.name}`,
      points: 8 - score.id, // Reverse score (7 to 1)
      color: score.color
    }))
  }))
};

// Marketing-specific Rubric Template
export const MarketingRubricTemplate = {
  id: 'marketing-rubric',
  name: 'Marketing Assessment Rubric',
  description: 'Specialized rubric for marketing content and strategies',
  criteria: [
    {
      id: 'market-analysis',
      name: 'Market Analysis',
      description: 'Depth and quality of market research and target audience analysis',
      category: 'research',
      icon: 'search',
      weight: 15,
      levels: RubricScores.map(score => ({
        id: `market-analysis-level-${score.id}`,
        name: score.score,
        description: `${score.description} in terms of market research depth, audience insights, and competitive analysis.`,
        points: 8 - score.id,
        color: score.color
      }))
    },
    {
      id: 'strategic-planning',
      name: 'Strategic Planning',
      description: 'Quality of strategic planning, goal setting, and alignment with business objectives',
      category: 'strategy',
      icon: 'route',
      weight: 15,
      levels: RubricScores.map(score => ({
        id: `strategic-planning-level-${score.id}`,
        name: score.score,
        description: `${score.description} in developing clear, measurable marketing goals and strategies aligned with business objectives.`,
        points: 8 - score.id,
        color: score.color
      }))
    },
    {
      id: 'creative-execution',
      name: 'Creative Execution',
      description: 'Creativity, innovation, and quality of content and campaign materials',
      category: 'creativity',
      icon: 'palette',
      weight: 20,
      levels: RubricScores.map(score => ({
        id: `creative-execution-level-${score.id}`,
        name: score.score,
        description: `${score.description} in developing creative, engaging, and original marketing content and materials.`,
        points: 8 - score.id,
        color: score.color
      }))
    },
    {
      id: 'digital-integration',
      name: 'Digital Integration',
      description: 'Effective use of digital marketing channels, tools, and technologies',
      category: 'digital',
      icon: 'devices',
      weight: 15,
      levels: RubricScores.map(score => ({
        id: `digital-integration-level-${score.id}`,
        name: score.score,
        description: `${score.description} in leveraging digital platforms, tools, and data-driven approaches.`,
        points: 8 - score.id,
        color: score.color
      }))
    },
    {
      id: 'brand-consistency',
      name: 'Brand Consistency',
      description: 'Consistency of brand messaging, identity, and values across marketing materials',
      category: 'branding',
      icon: 'verified',
      weight: 10,
      levels: RubricScores.map(score => ({
        id: `brand-consistency-level-${score.id}`,
        name: score.score,
        description: `${score.description} in maintaining consistent brand voice, visual identity, and messaging.`,
        points: 8 - score.id,
        color: score.color
      }))
    },
    {
      id: 'roi-metrics',
      name: 'ROI & Metrics',
      description: 'Effective measurement, analysis, and reporting of marketing performance and ROI',
      category: 'analytics',
      icon: 'trending_up',
      weight: 15,
      levels: RubricScores.map(score => ({
        id: `roi-metrics-level-${score.id}`,
        name: score.score,
        description: `${score.description} in defining KPIs, tracking metrics, and demonstrating ROI.`,
        points: 8 - score.id,
        color: score.color
      }))
    },
    {
      id: 'innovation-approach',
      name: 'Innovation Approach',
      description: 'Implementation of innovative marketing techniques, emerging trends, and technologies',
      category: 'innovation',
      icon: 'auto_awesome',
      weight: 10,
      levels: RubricScores.map(score => ({
        id: `innovation-approach-level-${score.id}`,
        name: score.score,
        description: `${score.description} in incorporating innovative approaches, emerging trends, and technologies.`,
        points: 8 - score.id,
        color: score.color
      }))
    }
  ]
};

// Innovative Assessment Methodologies
export const InnovativeAssessmentMethods = [
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Evaluate marketing strategies against competitors using prescribed metrics',
    category: 'comparative',
    icon: 'leaderboard',
    metrics: [
      { name: 'Market Position', description: 'Relative market position compared to competitors' },
      { name: 'Brand Strength', description: 'Brand recognition and loyalty relative to market' },
      { name: 'Campaign Effectiveness', description: 'Effectiveness of campaigns compared to competitors' },
      { name: 'Innovation Index', description: 'Level of innovation relative to industry standards' },
      { name: 'Digital Presence', description: 'Strength of digital footprint compared to competitors' }
    ]
  },
  {
    id: 'scenario-simulation',
    name: 'Market Scenario Simulation',
    description: 'Interactive simulation of market conditions and strategy implementation',
    category: 'interactive',
    icon: 'imagesearch_roller',
    simulationTypes: [
      { name: 'Market Disruption', description: 'Response to unexpected market changes' },
      { name: 'Competitive Challenge', description: 'Response to competitor actions' },
      { name: 'Budget Constraint', description: 'Optimization within limited resources' },
      { name: 'Channel Shift', description: 'Adaptation to changing channel dynamics' },
      { name: 'Crisis Management', description: 'Response to brand or market crisis' }
    ]
  },
  {
    id: 'data-visualization',
    name: 'Data Storytelling Assessment',
    description: 'Evaluation of ability to transform marketing data into compelling narratives',
    category: 'analytical',
    icon: 'insights',
    components: [
      { name: 'Data Selection', description: 'Relevance and quality of data selected' },
      { name: 'Visualization Design', description: 'Clarity and effectiveness of visualizations' },
      { name: 'Narrative Structure', description: 'Coherence and persuasiveness of data story' },
      { name: 'Insight Extraction', description: 'Depth and value of insights derived' },
      { name: 'Action Recommendations', description: 'Quality of data-driven recommendations' }
    ]
  },
  {
    id: 'consumer-journey',
    name: 'Consumer Journey Mapping',
    description: 'Assessment of understanding and optimization of the consumer experience',
    category: 'experiential',
    icon: 'timeline',
    journeyStages: [
      { name: 'Awareness', description: 'Strategies for building initial awareness' },
      { name: 'Consideration', description: 'Approaches to influence consideration phase' },
      { name: 'Conversion', description: 'Techniques to drive conversion actions' },
      { name: 'Retention', description: 'Programs to enhance customer loyalty' },
      { name: 'Advocacy', description: 'Methods to encourage brand advocacy' }
    ]
  },
  {
    id: 'adaptive-assessment',
    name: 'Adaptive Marketing Assessment',
    description: 'Dynamic assessment that adapts difficulty based on performance',
    category: 'personalized',
    icon: 'alt_route',
    adaptiveElements: [
      { name: 'Knowledge Pathways', description: 'Branching scenarios based on responses' },
      { name: 'Difficulty Scaling', description: 'Progressive challenge based on performance' },
      { name: 'Strength Analysis', description: 'Identification of strengths and focus areas' },
      { name: 'Personalized Feedback', description: 'Tailored guidance based on response patterns' },
      { name: 'Skill Gap Identification', description: 'Targeted skill development recommendations' }
    ]
  }
];

// Assessment Response Templates
export const AssessmentResponseTemplates = {
  rubricFeedback: (criterionName: string, scoreName: string, score: number, maxScore: number, feedback: string) => {
    return {
      criterionName,
      scoreName,
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      feedback
    };
  },
  
  overallFeedback: (totalScore: number, maxPossibleScore: number, strengths: string[], areasForImprovement: string[]) => {
    const percentage = Math.round((totalScore / maxPossibleScore) * 100);
    let gradeLetter = '';
    
    if (percentage >= 90) gradeLetter = 'A+';
    else if (percentage >= 80) gradeLetter = 'A';
    else if (percentage >= 70) gradeLetter = 'B';
    else if (percentage >= 60) gradeLetter = 'C';
    else if (percentage >= 50) gradeLetter = 'D';
    else if (percentage >= 40) gradeLetter = 'E';
    else gradeLetter = 'F';
    
    return {
      totalScore,
      maxPossibleScore,
      percentage,
      gradeLetter,
      strengths,
      areasForImprovement
    };
  }
};

// Helper function to get appropriate rubric based on content type and subject
export function getRubricByContentType(contentType: string, subject?: string): typeof DefaultRubricTemplate {
  // For marketing-related content
  if (subject?.toLowerCase().includes('marketing') || 
      subject?.toLowerCase().includes('brand') || 
      subject?.toLowerCase().includes('advertising')) {
    return MarketingRubricTemplate;
  }
  
  // Default rubric for all other content
  return DefaultRubricTemplate;
}

// Helper function to get innovative assessment method based on content requirements
export function getInnovativeAssessmentMethod(contentType: string, subject?: string): typeof InnovativeAssessmentMethods[0] | undefined {
  if (subject?.toLowerCase().includes('market analysis') || subject?.toLowerCase().includes('competitor')) {
    return InnovativeAssessmentMethods.find(method => method.id === 'competitive-analysis');
  }
  
  if (subject?.toLowerCase().includes('scenario') || subject?.toLowerCase().includes('simulation')) {
    return InnovativeAssessmentMethods.find(method => method.id === 'scenario-simulation');
  }
  
  if (subject?.toLowerCase().includes('data') || subject?.toLowerCase().includes('analytics')) {
    return InnovativeAssessmentMethods.find(method => method.id === 'data-visualization');
  }
  
  if (subject?.toLowerCase().includes('customer') || subject?.toLowerCase().includes('journey')) {
    return InnovativeAssessmentMethods.find(method => method.id === 'consumer-journey');
  }
  
  if (subject?.toLowerCase().includes('adaptive') || subject?.toLowerCase().includes('personalized')) {
    return InnovativeAssessmentMethods.find(method => method.id === 'adaptive-assessment');
  }
  
  // Return a random innovative method as default
  const randomIndex = Math.floor(Math.random() * InnovativeAssessmentMethods.length);
  return InnovativeAssessmentMethods[randomIndex];
}

// Calculate rubric score based on criteria and ratings
export function calculateRubricScore(rubric: typeof DefaultRubricTemplate, ratings: Record<string, number>): {
  criteriaScores: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
    maxScore: number;
    weightedScore: number;
    percentage: number;
  }>;
  totalScore: number;
  totalWeightedScore: number;
  maxPossibleScore: number;
  maxPossibleWeightedScore: number;
  overallPercentage: number;
} {
  const criteriaScores = rubric.criteria.map(criterion => {
    const criterionId = criterion.id;
    const rating = ratings[criterionId] || 0;
    const maxScore = criterion.levels.length;
    const weightedScore = (rating / maxScore) * criterion.weight;
    
    return {
      criterionId,
      criterionName: criterion.name,
      score: rating,
      maxScore,
      weightedScore,
      percentage: Math.round((rating / maxScore) * 100)
    };
  });
  
  const totalScore = criteriaScores.reduce((sum, item) => sum + item.score, 0);
  const totalWeightedScore = criteriaScores.reduce((sum, item) => sum + item.weightedScore, 0);
  const maxPossibleScore = rubric.criteria.length * criteriaScores[0].maxScore;
  const maxPossibleWeightedScore = 100; // Since weights should add up to 100
  const overallPercentage = Math.round((totalWeightedScore / maxPossibleWeightedScore) * 100);
  
  return {
    criteriaScores,
    totalScore,
    totalWeightedScore,
    maxPossibleScore,
    maxPossibleWeightedScore,
    overallPercentage
  };
}