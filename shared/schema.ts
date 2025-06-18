// Shared TypeScript schema definitions for the QAQF Educational Content Platform
// This file provides type definitions that match the Python backend models

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  reset_token?: string;
  reset_token_expires?: Date;
}

export interface QAQFLevel {
  id: number;
  level: number;
  name: string;
  description: string;
}

export interface QAQFCharacteristic {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface Content {
  id: number;
  title: string;
  description: string;
  type: 'academic_paper' | 'assessment' | 'video' | 'lecture' | 'course';
  qaqf_level: number;
  module_code?: string;
  created_by_user_id: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'in_review';
  verified_by_user_id?: number;
  content: string;
  characteristics: any;
  created_at: Date;
  updated_at: Date;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  qaqf_level: number;
  module_code?: string;
  created_by_user_id: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'in_review';
  verified_by_user_id?: number;
  animation_style: string;
  duration: string;
  characteristics: any;
  url?: string;
  thumbnail_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'link';
  qaqf_level: number;
  module_code?: string;
  created_by_user_id: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'in_review';
  verified_by_user_id?: number;
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  characteristics: any;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  created_by_user_id: number;
  is_public: boolean;
  material_ids: number[];
  created_at: Date;
  updated_at: Date;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  type: 'lesson_plan' | 'assessment' | 'course_outline';
  qaqf_level: number;
  content_structure: any;
  created_by_user_id: number;
  is_public: boolean;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Activity {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details?: any;
  created_at: Date;
}

export interface LessonPlan {
  id: number;
  title: string;
  description: string;
  qaqf_level: number;
  module_code?: string;
  created_by_user_id: number;
  content_structure: any;
  duration: string;
  objectives: string[];
  activities: any[];
  assessment_methods: string[];
  resources: string[];
  created_at: Date;
  updated_at: Date;
}

// Insert types for forms
export interface InsertUser {
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role?: 'user' | 'admin';
  avatar?: string;
  is_active?: boolean;
}

export interface InsertContent {
  title: string;
  description: string;
  type: 'academic_paper' | 'assessment' | 'video' | 'lecture' | 'course';
  qaqf_level: number;
  module_code?: string;
  created_by_user_id: number;
  content: string;
  characteristics: any;
}

export interface InsertStudyMaterial {
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'link';
  qaqf_level: number;
  module_code?: string;
  created_by_user_id: number;
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  characteristics: any;
  tags?: string[];
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}