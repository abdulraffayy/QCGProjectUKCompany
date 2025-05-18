// QAQF Framework Levels
export const QAQFLevels = [
  {
    id: 1,
    level: 1,
    name: "Basic",
    description: "Basic implementation of nine characteristics within learning and education environment."
  },
  {
    id: 2,
    level: 2,
    name: "Rudimentary",
    description: "Rudimentary implementation of nine characteristics within learning and education environment."
  },
  {
    id: 3,
    level: 3,
    name: "Crucial",
    description: "Crucial implementation of nine characteristics within learning and education environment."
  },
  {
    id: 4,
    level: 4,
    name: "Key",
    description: "Key implementation of nine characteristics within learning and education environment."
  },
  {
    id: 5,
    level: 5,
    name: "Substantial",
    description: "Substantial implementation of nine characteristics within learning and education environment."
  },
  {
    id: 6,
    level: 6,
    name: "Critical",
    description: "Critical implementation of nine characteristics within learning and education environment."
  },
  {
    id: 7,
    level: 7,
    name: "Leading",
    description: "Leading implementation of nine characteristics within learning and education environment."
  },
  {
    id: 8,
    level: 8,
    name: "Specialist",
    description: "Specialist implementation of nine characteristics within learning and education environment."
  },
  {
    id: 9,
    level: 9,
    name: "21st Century Innovative",
    description: "21st century innovative implementation of nine characteristics within learning and education environment."
  }
];

// QAQF Characteristics
export const QAQFCharacteristics = [
  {
    id: 1,
    name: "Knowledge and understanding",
    description: "Descriptive, simple, facts, ideas, concepts, subject, discipline, defining understanding",
    category: "foundation",
    icon: "school"
  },
  {
    id: 2,
    name: "Applied knowledge",
    description: "Application of: theories, facts, ideas, concepts",
    category: "foundation",
    icon: "psychology"
  },
  {
    id: 3,
    name: "Cognitive skills",
    description: "Critical, analytical, research",
    category: "foundation",
    icon: "tips_and_updates"
  },
  {
    id: 4,
    name: "Communication",
    description: "English level, use of command of communication",
    category: "intermediate",
    icon: "chat"
  },
  {
    id: 5,
    name: "Autonomy, accountability & working with others",
    description: "Team work, group work, autonomy, independent thinking, accountability of thoughts",
    category: "intermediate",
    icon: "groups"
  },
  {
    id: 6,
    name: "Digitalisation & AI",
    description: "Application of digital knowledge, use of artificial intelligence, application of advanced IT, implementation of Robotic thinking",
    category: "intermediate",
    icon: "computer"
  },
  {
    id: 7,
    name: "Sustainability & ecological",
    description: "Show sustainability, resilient and ecological thinking",
    category: "advanced",
    icon: "eco"
  },
  {
    id: 8,
    name: "Reflective & creative",
    description: "Level of reflection, creativity and innovative input",
    category: "advanced",
    icon: "auto_awesome"
  },
  {
    id: 9,
    name: "Futuristic/Genius Skills",
    description: "Think outside the box, show different thinking on outcomes",
    category: "advanced",
    icon: "lightbulb"
  }
];

// QAQF Level Categories
export const QAQFLevelCategories = [
  {
    levels: [1, 2, 3],
    name: "Foundation",
    description: "Knowledge, Understanding & Cognitive Skills",
    color: "primary",
    characteristics: [1, 2, 3]
  },
  {
    levels: [4, 5, 6],
    name: "Intermediate",
    description: "Communication, Accountability & Digitalisation",
    color: "secondary",
    characteristics: [4, 5, 6]
  },
  {
    levels: [7, 8, 9],
    name: "Advanced",
    description: "Sustainability, Innovation & Futuristic Skills",
    color: "accent",
    characteristics: [7, 8, 9]
  }
];

// Content Types
export const ContentTypes = [
  {
    id: "academic_paper",
    name: "Academic Paper",
    description: "Scholarly article on a specific subject",
    icon: "description"
  },
  {
    id: "assessment",
    name: "Assessment",
    description: "Evaluation tools for academic measurement",
    icon: "assignment"
  },
  {
    id: "video",
    name: "Video Content",
    description: "Educational videos with animation features",
    icon: "movie"
  },
  {
    id: "lecture",
    name: "Lecture",
    description: "Educational presentation materials",
    icon: "co_present"
  },
  {
    id: "course",
    name: "Course",
    description: "Full academic course materials",
    icon: "menu_book"
  }
];

// Video Animation Styles
export const AnimationStyles = [
  "2D Animation",
  "3D Animation",
  "Motion Graphics",
  "Whiteboard Animation",
  "Holographic (Coming Soon)"
];

// Video Duration Options
export const DurationOptions = [
  "Short (2-5 minutes)",
  "Medium (5-10 minutes)",
  "Long (10-15 minutes)",
  "Custom Duration"
];

// Verification Statuses
export const VerificationStatuses = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  IN_REVIEW: "in_review"
};

// Get color based on QAQF level
export function getColorByLevel(level: number): string {
  if (level >= 1 && level <= 3) return "primary";
  if (level >= 4 && level <= 6) return "secondary";
  if (level >= 7 && level <= 9) return "accent";
  return "neutral";
}

// Get characteristics by category
export function getCharacteristicsByCategory(category: string): typeof QAQFCharacteristics[0][] {
  return QAQFCharacteristics.filter(char => char.category === category);
}

// Get level name by level number
export function getLevelName(level: number): string {
  const qaqfLevel = QAQFLevels.find(l => l.level === level);
  return qaqfLevel ? `Level ${level} - ${qaqfLevel.name}` : `Level ${level}`;
}
