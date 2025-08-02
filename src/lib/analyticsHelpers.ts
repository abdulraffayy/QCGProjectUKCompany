import { Content } from 'shared/schema.ts';

/**
 * Calculates the distribution of QAQF characteristics across all content
 * @param contents Array of content objects
 * @returns Distribution of QAQF characteristics as a map of characteristic IDs to counts
 */
export function calculateCharacteristicsDistribution(contents: Content[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  contents.forEach(content => {
    // Handle characteristics which can be either an array of IDs or an object
    const characteristics = Array.isArray(content.characteristics) 
      ? content.characteristics 
      : typeof content.characteristics === 'object' && content.characteristics !== null
        ? Object.keys(content.characteristics).map(key => parseInt(key))
        : [];
    
    characteristics.forEach(charId => {
      if (typeof charId === 'number') {
        distribution[charId] = (distribution[charId] || 0) + 1;
      }
    });
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
  
  contents.forEach(content => {
    if (typeof content.qaqf_level === 'number') {
      distribution[content.qaqf_level] = (distribution[content.qaqf_level] || 0) + 1;
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
    verified: 0,
    pending: 0,
    rejected: 0
  };
  
  contents.forEach(content => {
    if (content.verification_status && typeof content.verification_status === 'string') {
      distribution[content.verification_status] = (distribution[content.verification_status] || 0) + 1;
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
  const distribution: Record<string, number> = {};
  
  contents.forEach(content => {
    if (content.type && typeof content.type === 'string') {
      distribution[content.type] = (distribution[content.type] || 0) + 1;
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
  const monthsMap: Record<string, number> = {};
  
  // Sort contents by creation date
  const sortedContents = [...contents].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Group by month
  sortedContents.forEach(content => {
    const date = new Date(content.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthsMap[monthKey] = (monthsMap[monthKey] || 0) + 1;
  });
  
  // Convert to array format
  const result = Object.entries(monthsMap).map(([month, count]) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    return {
      month: `${monthName} ${year}`,
      count
    };
  });
  
  return result;
}

/**
 * Calculate average QAQF level across all content
 * @param contents Array of content objects
 * @returns Average QAQF level
 */
export function calculateAverageQAQFLevel(contents: Content[]): number {
  if (contents.length === 0) return 0;
  
  const sum = contents.reduce((acc, content) => {
    return acc + (typeof content.qaqf_level === 'number' ? content.qaqf_level : 0);
  }, 0);
  
  return Number((sum / contents.length).toFixed(1));
}

/**
 * Calculate completeness of QAQF framework coverage
 * @param contents Array of content objects
 * @returns Percentage of QAQF characteristics covered
 */
export function calculateQAQFCoverage(contents: Content[]): number {
  // Total number of QAQF characteristics (from 1 to 10)
  const totalCharacteristics = 10;
  
  // Get all unique characteristic IDs used across all content
  const usedCharacteristics = new Set<number>();
  
  contents.forEach(content => {
    const characteristics = Array.isArray(content.characteristics) 
      ? content.characteristics 
      : typeof content.characteristics === 'object' && content.characteristics !== null
        ? Object.keys(content.characteristics).map(key => parseInt(key))
        : [];
    
    characteristics.forEach(charId => {
      if (typeof charId === 'number') {
        usedCharacteristics.add(charId);
      }
    });
  });
  
  // Calculate coverage percentage
  return Math.round((usedCharacteristics.size / totalCharacteristics) * 100);
}

/**
 * Calculate success rate of content verification
 * @param contents Array of content objects
 * @returns Percentage of verified content
 */
export function calculateVerificationSuccessRate(contents: Content[]): number {
  if (contents.length === 0) return 0;
  
  const verifiedCount = contents.filter(
    content => content.verification_status === 'verified'
  ).length;
  
  return Math.round((verifiedCount / contents.length) * 100);
}

/**
 * Get top used QAQF characteristics
 * @param contents Array of content objects
 * @param limit Number of top characteristics to return
 * @returns Array of top characteristics with counts
 */
export function getTopCharacteristics(
  contents: Content[],
  limit: number = 3
): { id: number; count: number }[] {
  const distribution = calculateCharacteristicsDistribution(contents);
  
  return Object.entries(distribution)
    .map(([id, count]) => ({ id: parseInt(id), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get most popular content types
 * @param contents Array of content objects
 * @param limit Number of top content types to return
 * @returns Array of top content types with counts
 */
export function getTopContentTypes(
  contents: Content[],
  limit: number = 3
): { type: string; count: number }[] {
  const distribution = calculateContentTypeDistribution(contents);
  
  return Object.entries(distribution)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}