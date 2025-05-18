import { QAQFCharacteristics, QAQFLevels } from './qaqf';
import { Content } from '@shared/schema';

/**
 * Calculates the distribution of QAQF characteristics across all content
 * @param contents Array of content objects
 * @returns Distribution of QAQF characteristics as a map of characteristic IDs to counts
 */
export function calculateCharacteristicsDistribution(contents: Content[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  // Initialize with zeros
  QAQFCharacteristics.forEach(char => {
    distribution[char.id] = 0;
  });
  
  // Count occurrences
  contents.forEach(content => {
    if (content.characteristics) {
      if (Array.isArray(content.characteristics)) {
        // If characteristics is an array of IDs
        content.characteristics.forEach((charId: number) => {
          if (distribution[charId] !== undefined) {
            distribution[charId]++;
          }
        });
      } else if (typeof content.characteristics === 'object') {
        // If characteristics is an object
        Object.keys(content.characteristics).forEach(key => {
          const charId = parseInt(key);
          if (!isNaN(charId) && distribution[charId] !== undefined) {
            distribution[charId]++;
          }
        });
      }
    }
  });
  
  return distribution;
}

/**
 * Calculates the distribution of QAQF levels across all content
 * @param contents Array of content objects
 * @returns Distribution of QAQF levels as a map of level numbers to counts
 */
export function calculateLevelDistribution(contents: Content[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  // Initialize with zeros
  QAQFLevels.forEach(level => {
    distribution[level.id] = 0;
  });
  
  // Count occurrences
  contents.forEach(content => {
    if (content.qaqfLevel && distribution[content.qaqfLevel] !== undefined) {
      distribution[content.qaqfLevel]++;
    }
  });
  
  return distribution;
}

/**
 * Calculates the verification status distribution across all content
 * @param contents Array of content objects
 * @returns Distribution of verification statuses as a map of status to counts
 */
export function calculateVerificationDistribution(contents: Content[]): Record<string, number> {
  const distribution: Record<string, number> = {
    'pending': 0,
    'verified': 0,
    'rejected': 0
  };
  
  contents.forEach(content => {
    if (content.verificationStatus && distribution[content.verificationStatus] !== undefined) {
      distribution[content.verificationStatus]++;
    }
  });
  
  return distribution;
}

/**
 * Calculates the content type distribution across all content
 * @param contents Array of content objects
 * @returns Distribution of content types as a map of type to counts
 */
export function calculateContentTypeDistribution(contents: Content[]): Record<string, number> {
  const distribution: Record<string, number> = {
    'academic_paper': 0,
    'assessment': 0,
    'video': 0
  };
  
  contents.forEach(content => {
    if (content.type && distribution[content.type] !== undefined) {
      distribution[content.type]++;
    }
  });
  
  return distribution;
}

/**
 * Analyzes the content creation over time
 * @param contents Array of content objects
 * @returns Array of counts by month
 */
export function analyzeContentOverTime(contents: Content[]): {month: string, count: number}[] {
  const monthCounts: Record<string, number> = {};
  
  contents.forEach(content => {
    if (content.createdAt) {
      const date = new Date(content.createdAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthCounts[monthYear]) {
        monthCounts[monthYear] = 0;
      }
      
      monthCounts[monthYear]++;
    }
  });
  
  // Convert to array and sort
  return Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}