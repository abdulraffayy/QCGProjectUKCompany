import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

export interface GenerateContentRequest {
  contentType: string;
  qaqfLevel: number;
  subject: string;
  characteristics: string[];
  additionalInstructions?: string;
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

// Generate academic content
export async function generateAcademicContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
  const response = await apiRequest("POST", "/api/generate/content", request);
  return await response.json();
}

// Generate video content (simplified mock for demonstration)
export async function generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse> {
  // In a real implementation, this would connect to video generation services 
  const response = await apiRequest("POST", "/api/generate/video", request);
  return await response.json();
}

// Verify content against QAQF framework
export async function verifyContent(content: string, qaqfLevel: number): Promise<{
  score: number;
  feedback: string;
  characteristics: Record<string, number>;
}> {
  const response = await apiRequest("POST", "/api/verify/content", {
    content,
    qaqfLevel
  });
  return await response.json();
}

// Check content against British standards
export async function checkBritishStandards(content: string): Promise<{
  compliant: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const response = await apiRequest("POST", "/api/check/british-standards", {
    content
  });
  return await response.json();
}
