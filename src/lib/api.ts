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
  courseid?: number;
  content_type?: string;
  qaqf_level?: string;
  status?: string;
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
  
  const response = await fetch('http://69.197.176.134:5000/api/ai/generate-content', {
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
  // Persist generated content and course ID so the editor can load it later
  try {
    if (result?.generated_content) {
      console.log('Saving generated content to localStorage:', result.generated_content);
      localStorage.setItem('latest_generated_course_content', result.generated_content);
    }
    if (result?.courseid) {
      console.log('Saving course ID to localStorage:', result.courseid);
      localStorage.setItem('latest_generated_course_id', result.courseid.toString());
    }
    // Save complete response for later use
    localStorage.setItem('latest_course_generation_response', JSON.stringify(result));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
  return result;
};
