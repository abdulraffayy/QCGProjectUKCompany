/**
 * QAQF (Quality Assurance and Qualifications Framework) Library
 * Provides utilities and constants for academic content quality assessment
 */

// QAQF Levels (1-9)
export const QAQFLevels = [
  { level: 1, name: "Basic Skills", description: "Foundation level skills and knowledge" },
  { level: 2, name: "Essential Skills", description: "Core competencies and basic understanding" },
  { level: 3, name: "Intermediate Skills", description: "Applied knowledge with some complexity" },
  { level: 4, name: "Professional Entry", description: "Skilled professional entry level" },
  { level: 5, name: "Professional", description: "Advanced professional competence" },
  { level: 6, name: "Specialist", description: "Specialized expertise and leadership" },
  { level: 7, name: "Advanced Professional", description: "Expert level with strategic thinking" },
  { level: 8, name: "Expert", description: "Mastery level with innovation capability" },
  { level: 9, name: "Authority", description: "Authoritative expertise and thought leadership" }
];

// QAQF Level Categories
export const QAQFLevelCategories = {
  basic: { levels: [1, 2, 3], name: "Basic", color: "blue" },
  intermediate: { levels: [4, 5, 6], name: "Intermediate", color: "yellow" },
  advanced: { levels: [7, 8, 9], name: "Advanced", color: "red" }
};

// QAQF Characteristics (10 key characteristics)
export const QAQFCharacteristics = [
  { id: 1, name: "Clarity", description: "Clear and understandable presentation", category: "Communication" },
  { id: 2, name: "Completeness", description: "Comprehensive coverage of topics", category: "Content" },
  { id: 3, name: "Accuracy", description: "Factual correctness and precision", category: "Quality" },
  { id: 4, name: "Coherence", description: "Logical structure and flow", category: "Organization" },
  { id: 5, name: "Relevance", description: "Applicable to learning objectives", category: "Alignment" },
  { id: 6, name: "Currency", description: "Up-to-date and current information", category: "Timeliness" },
  { id: 7, name: "Accessibility", description: "Inclusive and accessible design", category: "Usability" },
  { id: 8, name: "Engagement", description: "Interactive and engaging content", category: "Pedagogy" },
  { id: 9, name: "Assessment", description: "Effective evaluation methods", category: "Evaluation" },
  { id: 10, name: "Authenticity", description: "Real-world application and context", category: "Application" }
];

// Get color by QAQF level
export const getColorByLevel = (level: number): string => {
  if (level >= 1 && level <= 3) return "blue";
  if (level >= 4 && level <= 6) return "yellow";
  if (level >= 7 && level <= 9) return "red";
  return "gray";
};

// Get characteristics by category
export const getCharacteristicsByCategory = (category: string) => {
  return QAQFCharacteristics.filter(char => char.category === category);
};

// Calculate QAQF compliance score
export const calculateQAQFCompliance = (content: any): number => {
  if (!content) return 0;
  
  let score = 0;
  const maxScore = 100;
  
  // Basic content checks (40 points)
  if (content.title && content.title.length >= 10) score += 10;
  if (content.description && content.description.length >= 50) score += 10;
  if (content.content && content.content.length >= 200) score += 10;
  if (content.qaqf_level && content.qaqf_level >= 1 && content.qaqf_level <= 9) score += 10;
  
  // Characteristics checks (60 points)
  if (content.characteristics && Array.isArray(content.characteristics)) {
    const charScore = Math.min(60, content.characteristics.length * 6);
    score += charScore;
  }
  
  return Math.min(maxScore, score);
};

// British Standards compliance checker
export const checkBritishStandardsCompliance = (content: any) => {
  const checks = {
    accessibility: content.accessibility_features?.length > 0,
    language_standards: content.language_level && content.language_level.includes('UK'),
    curriculum_alignment: content.curriculum_alignment?.length > 0,
    assessment_criteria: content.assessment_criteria?.length > 0,
    quality_assurance: content.verification_status === 'verified'
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  return {
    score: (passedChecks / totalChecks) * 100,
    checks,
    compliant: passedChecks >= Math.ceil(totalChecks * 0.8)
  };
};

// Content type definitions
export const ContentTypes = {
  ACADEMIC_PAPER: "academic_paper",
  ASSESSMENT: "assessment",
  VIDEO: "video",
  LECTURE: "lecture",
  COURSE: "course"
};

// Verification status types
export const VerificationStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  IN_REVIEW: "in_review"
};

// Calculate characteristics distribution for analytics
export const calculateCharacteristicsDistribution = (contents: any[]) => {
  if (!contents || contents.length === 0) return [];
  
  const distribution: Record<string, number> = {};
  
  contents.forEach(content => {
    if (content.characteristics && Array.isArray(content.characteristics)) {
      content.characteristics.forEach((char: string) => {
        distribution[char] = (distribution[char] || 0) + 1;
      });
    }
  });
  
  return Object.entries(distribution).map(([name, count]) => ({
    name,
    count,
    percentage: (count / contents.length) * 100
  }));
};

// Generate QAQF report
export const generateQAQFReport = (content: any) => {
  const compliance = calculateQAQFCompliance(content);
  const britishStandards = checkBritishStandardsCompliance(content);
  
  return {
    overall_score: Math.round((compliance + britishStandards.score) / 2),
    qaqf_compliance: compliance,
    british_standards: britishStandards,
    level_category: QAQFLevelCategories.basic.levels.includes(content.qaqf_level) ? 'basic' :
                    QAQFLevelCategories.intermediate.levels.includes(content.qaqf_level) ? 'intermediate' : 'advanced',
    recommendations: generateRecommendations(content, compliance, britishStandards.score)
  };
};

// Generate improvement recommendations
const generateRecommendations = (content: any, qaqfScore: number, standardsScore: number): string[] => {
  const recommendations = [];
  
  if (qaqfScore < 60) {
    recommendations.push("Improve content depth and detail");
    recommendations.push("Add more comprehensive descriptions");
  }
  
  if (standardsScore < 70) {
    recommendations.push("Enhance accessibility features");
    recommendations.push("Align with UK curriculum standards");
  }
  
  if (!content.characteristics || content.characteristics.length < 5) {
    recommendations.push("Include more QAQF characteristics");
  }
  
  if (!content.assessment_criteria || content.assessment_criteria.length < 3) {
    recommendations.push("Define clear assessment criteria");
  }
  
  return recommendations;
};