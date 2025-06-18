import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

export interface GenerateContentRequest {
  contentType: string;
  qaqfLevel: number;
  subject: string;
  characteristics: string[];
  additionalInstructions?: string;
  sourceType?: "internal" | "uploaded";
  sourceContent?: string;
}

export interface GenerateContentResponse {
  title: string;
  content: string;
  moduleCode: string;
}

export interface GenerateVideoRequest {
  title: string;
  qaqfLevel: number;
  subject: string;
  characteristics: string[];
  animationStyle: string;
  duration: string;
  additionalInstructions?: string;
}

export interface GenerateVideoResponse {
  url: string;
  thumbnailUrl: string;
}

export interface VerificationResponse {
  score: number;
  feedback: string;
  characteristics: Record<string, number>;
}

export interface BritishStandardsResponse {
  compliant: boolean;
  issues: string[];
  suggestions: string[];
}

export interface UploadSourceResponse {
  message: string;
  sourceId: string;
  sourceType: string;
}

// Generate academic content
export async function generateAcademicContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
  try {
    const response = await apiRequest("POST", "/api/generate/content", request);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate content');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating academic content:", error);
    throw error;
  }
}

// Generate video content
export async function generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse> {
  try {
    const response = await apiRequest("POST", "/api/generate/video", request);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate video');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

// Verify content against QAQF framework
export async function verifyContent(content: string, qaqfLevel: number): Promise<VerificationResponse> {
  try {
    const response = await apiRequest("POST", "/api/verify/content", {
      content,
      qaqfLevel
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify content');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error verifying content:", error);
    throw error;
  }
}

// Check content against British standards
export async function checkBritishStandards(content: string): Promise<BritishStandardsResponse> {
  try {
    const response = await apiRequest("POST", "/api/check/british-standards", {
      content
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check British standards');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking British standards:", error);
    throw error;
  }
}

// Upload source content (PDF, text, audio transcript)
export async function uploadSource(file: File): Promise<UploadSourceResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type);
    
    const response = await fetch('/api/upload/source', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload source');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error uploading source:", error);
    throw error;
  }
}
