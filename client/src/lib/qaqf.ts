// QAQF Framework Constants and Utilities
// This file contains the definitions and utilities for working with the QAQF framework

// QAQF Levels as defined in the QAQF Framework
export const QAQFLevels = [
  { id: 1, name: "Level 1", description: "Initial QAQF level - Focus on basic academic structure" },
  { id: 2, name: "Level 2", description: "Elementary organization of academic content" },
  { id: 3, name: "Level 3", description: "Systematic approach to academic content structure" },
  { id: 4, name: "Level 4", description: "Managed academic content with consistent quality" },
  { id: 5, name: "Level 5", description: "Advanced framework integration with optimized structures" },
  { id: 6, name: "Level 6", description: "Comprehensive approach with interconnected components" },
  { id: 7, name: "Level 7", description: "Integrated assessment strategies and adaptive content" },
  { id: 8, name: "Level 8", description: "Innovative content with dynamic learning pathways" },
  { id: 9, name: "Level 9", description: "Expert level with advanced pedagogical integration" }
];

// QAQF Characteristics as defined in the QAQF Framework
export const QAQFCharacteristics = [
  { id: 1, name: "Clarity", description: "Clear, concise and unambiguous content presentation" },
  { id: 2, name: "Completeness", description: "Comprehensive coverage of subject matter" },
  { id: 3, name: "Accuracy", description: "Factually correct information aligned with current knowledge" },
  { id: 4, name: "Coherence", description: "Logical flow and structure of academic content" },
  { id: 5, name: "Relevance", description: "Pertinence to learning objectives and real-world contexts" },
  { id: 6, name: "Engagement", description: "Interactive and motivating learning experience" },
  { id: 7, name: "Critical Thinking", description: "Stimulation of higher-order thinking skills" },
  { id: 8, name: "Accessibility", description: "Inclusive design for diverse learners" },
  { id: 9, name: "Assessment Integration", description: "Embedded evaluation mechanisms" },
  { id: 10, name: "Adaptability", description: "Flexibility to accommodate different learning styles" }
];

// Map QAQF level to required characteristics
export const QAQFLevelRequirements: Record<number, number[]> = {
  1: [1, 3], // Level 1 requires Clarity and Accuracy
  2: [1, 2, 3], // Level 2 requires Clarity, Completeness, and Accuracy
  3: [1, 2, 3, 4], // Level 3 adds Coherence
  4: [1, 2, 3, 4, 5], // Level 4 adds Relevance
  5: [1, 2, 3, 4, 5, 8], // Level 5 adds Accessibility
  6: [1, 2, 3, 4, 5, 6, 8], // Level 6 adds Engagement
  7: [1, 2, 3, 4, 5, 6, 7, 8, 9], // Level 7 adds Critical Thinking and Assessment Integration
  8: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Level 8 adds Adaptability
  9: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // Level 9 requires all characteristics with highest quality
};

// Validate if content meets QAQF level requirements
export function validateQAQFCompliance(
  contentCharacteristics: number[],
  qaqfLevel: number
): { isValid: boolean; missingCharacteristics: number[] } {
  const requiredCharacteristics = QAQFLevelRequirements[qaqfLevel] || [];
  
  // Check which required characteristics are missing
  const missingCharacteristics = requiredCharacteristics.filter(
    charId => !contentCharacteristics.includes(charId)
  );
  
  return {
    isValid: missingCharacteristics.length === 0,
    missingCharacteristics
  };
}

// Get characteristic name by ID
export function getCharacteristicById(id: number): string {
  const characteristic = QAQFCharacteristics.find(char => char.id === id);
  return characteristic ? characteristic.name : `Unknown Characteristic (${id})`;
}

// Get level name by ID
export function getLevelById(id: number): string {
  const level = QAQFLevels.find(level => level.id === id);
  return level ? level.name : `Unknown Level (${id})`;
}

// Get recommended content types based on QAQF level
export function getRecommendedContentTypes(qaqfLevel: number): string[] {
  if (qaqfLevel <= 3) {
    return ["lecture", "reading_material", "basic_quiz"];
  } else if (qaqfLevel <= 6) {
    return ["lecture", "reading_material", "advanced_quiz", "case_study", "group_activity"];
  } else {
    return ["lecture", "reading_material", "advanced_quiz", "case_study", "group_activity", "research_project", "simulation"];
  }
}

// Get QAQF level difficulty description
export function getQAQFLevelDifficulty(qaqfLevel: number): string {
  if (qaqfLevel <= 3) {
    return "Basic";
  } else if (qaqfLevel <= 6) {
    return "Intermediate";
  } else {
    return "Advanced";
  }
}

// Get color associated with a QAQF level for visual representation
export function getColorByLevel(qaqfLevel: number): string {
  // Color scheme from basic (blue) to advanced (purple)
  if (qaqfLevel <= 3) {
    return "#3b82f6"; // Blue for basic levels
  } else if (qaqfLevel <= 6) {
    return "#8b5cf6"; // Purple for intermediate levels
  } else {
    return "#7c3aed"; // Violet for advanced levels
  }
}

// Check if the content meets British standards compliance
export function checkBritishStandardsCompliance(content: string): { 
  compliant: boolean;
  issues: string[];
} {
  // This is a placeholder for actual British standards compliance checking
  // In a real implementation, this would integrate with specific British educational standards
  const issues: string[] = [];
  
  // Simple placeholder checks (would be more sophisticated in real implementation)
  if (!content.includes("learning outcomes") && !content.includes("Learning outcomes")) {
    issues.push("Missing clearly defined learning outcomes");
  }
  
  if (!content.includes("assessment") && !content.includes("Assessment")) {
    issues.push("Missing assessment strategy or criteria");
  }
  
  // Simple British spelling check (very basic demonstration)
  if (content.includes("color") && !content.includes("colour")) {
    issues.push("Non-British spelling detected: 'color' instead of 'colour'");
  }
  
  if (content.includes("center") && !content.includes("centre")) {
    issues.push("Non-British spelling detected: 'center' instead of 'centre'");
  }
  
  return {
    compliant: issues.length === 0,
    issues
  };
}