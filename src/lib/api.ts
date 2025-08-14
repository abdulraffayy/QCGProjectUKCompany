// API service functions for course generation

export interface CourseGenerationRequest {
  generation_type: 'course';
  title: string;
  subject_area: string;
  target_audience: string;
  learning_objectives: string;
  duration_weeks: number;
  modules_count: number;
  delivery_mode: string;
  qaqf_level: string;
}

export interface CourseGenerationResponse {
  generated_content: string;
  modules?: Array<{
    title?: string;
    name?: string;
    description?: string;
    duration?: string;
  }>;
  // Add other response fields as needed
}

export const generateCourseContent = async (
  requestData: CourseGenerationRequest,
  token?: string
): Promise<CourseGenerationResponse> => {
  console.log('🌐 Making API call to:', 'http://38.29.145.85:8000/api/ai/generate-content');
  console.log('📤 Request data:', requestData);
  
  const response = await fetch('http://38.29.145.85:8000/api/ai/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API call failed:', response.status, response.statusText, errorText);
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('✅ API call successful:', result);
  return result;
};
