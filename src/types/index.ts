// ========================================
// CENTRALIZED TYPES FOR QAQC PLATFORM
// ========================================

// ========================================
// MODULE/LESSON TYPES
// ========================================

export interface Module {
  id: number;
  title: string;
  type: ModuleType;
  duration: string;
  qaqfLevel: number;
  level: number;
  description: string;
  script?: string;
  courseid: string;
  userid: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export type ModuleType = 
  | "traditional_lecture"
  | "interactive_lecture"
  | "demonstration_lecture"
  | "problem_based_lecture"
  | "storytelling_lecture"
  | "flipped_lecture"
  | "guest_lecture"
  | "lecture" 
  | "practical" 
  | "academic_seminars"
  | "professional_seminars"
  | "webinars"
  | "intake_activities"
  | "organizational_activities"
  | "demonstrative_activities"
  | "collaborative_activities"
  | "interactive_activities"
  | "problem_solving_activities"
  | "seminar" 
  | "activity" 
  | "case_study" 
  | "quiz" 
  | "exam" 
  | "assignment";

// Module type options with display names
export const MODULE_TYPE_OPTIONS: { [key in ModuleType]: string } = {
    traditional_lecture: "Traditional Lecture",
    interactive_lecture: "Interactive Lecture",
    demonstration_lecture: "Demonstration Lecture",
    problem_based_lecture: "Problem-Based Lecture",
    storytelling_lecture: "Storytelling Lecture",
    flipped_lecture: "Flipped Lecture",
    guest_lecture: "Guest Lecture",
    lecture: "Lecture",
    practical: "Practical",
    academic_seminars: "Academic Seminars",
    professional_seminars: "Professional Seminars",
    webinars: "Webinars",
    intake_activities: "Intake Activities",
    organizational_activities: "Organizational Activities",
    demonstrative_activities: "Demonstrative Activities",
    collaborative_activities: "Collaborative Activities",
    interactive_activities: "Interactive Activities",
    problem_solving_activities: "Problem-Solving Activities",
    seminar: "Seminar",
    activity: "Activity",
    case_study: "Case Study",
    quiz: "Quiz",
    exam: "Exam",
    assignment: "Assignment",
    
  };
  

// ========================================
// QAQF TYPES
// ========================================

export enum QAQF_LEVELS {
  Awareness = "Qaqf level 1 – Awareness",
  Application = "Qaqf Level 2 – Application",
  Competence = "Qaqf Level 3 – Competence",
  FunctionalIndependence = "Qaqf Level 4 – Functional Independence",
  AdaptivePerformance = "Qaqf Level 5 – Adaptive Performance",
  ProficientPractitioner = "Qaqf Level 6 – Proficient Practitioner",
  SpecialistExpertise = "Qaqf Level 7 – Specialist Expertise",
  StrategicLeadership = "Qaqf Level 8 – Strategic Leadership",
  MasteryInnovation = "Qaqf Level 9 – Mastery / Innovation"
}
  

// ========================================
// BASIC ENTITY TYPES
// ========================================

export interface SimpleCourse {
  id: string;
  title: string;
}

export interface SimpleWeek {
  id: number;
  title: string;
}

export interface SimpleLesson {
  id: number;
  title: string;
}

// ========================================
// COURSE TYPES
// ========================================

export interface Course {
  id: string;
  title: string;
  description: string;
  userid: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// ========================================
// WEEK TYPES
// ========================================

export interface Week {
  id: number;
  title: string;
  courseid: string;
  orderno?: number;
  created_at?: string;
  updated_at?: string;
}

// ========================================
// USER & AUTH TYPES
// ========================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'moderator' | 'verification' | 'moderation' | 'quality_assurance' | 'user';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ========================================
// FORM TYPES
// ========================================

export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface DialogState {
  isOpen: boolean;
  data?: any;
}
