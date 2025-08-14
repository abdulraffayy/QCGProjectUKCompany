import React, { useEffect, useState } from 'react';
import { CourseData, LearningObjective, GeneratedCourse } from '../../types/courseTypes';
import { Button } from '../ui/button';
import { BookOpen } from 'lucide-react';
import { generateCourseContent } from '../../lib/api';

interface ReviewStepProps {
  courseData: CourseData;
  onGenerate?: () => void;
  isGenerating?: boolean;
  onGenerated?: (course: GeneratedCourse) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  courseData,
  onGenerate,
  isGenerating = false,
  onGenerated
}) => {
  const { basicInfo, learningObjectives } = courseData;
  const [localGenerating, setLocalGenerating] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);

  // Function that calls API and maps response
  const generateFromApi = async () => {
    if (!basicInfo || !learningObjectives) return;
    setLocalGenerating(true);
    try {
      const token = localStorage.getItem('token');
      
      // Extract duration weeks from the duration string (e.g., "8 weeks" -> 8)
      const durationWeeks = parseInt(learningObjectives.duration.match(/\d+/)?.[0] || '0');
      
      // Prepare the API request data with actual input values
      const apiRequestData = {
        generation_type: 'course' as const,
        title: basicInfo.title,
        subject_area: basicInfo.title,
        target_audience: basicInfo.targetAudience,
        learning_objectives: (learningObjectives.objectives || []).map(o => o.text).join('\n'),
        duration_weeks: durationWeeks,
        modules_count: 4, // Default to 4 modules as shown in the generated course
        delivery_mode: 'online',
        qaqf_level: basicInfo.difficultyLevel,
      };
      
      // Log the data being sent to API (for debugging)
      console.log('🚀 Sending data to API:', apiRequestData);
      
      // Using the new API service function with actual data from inputs
      const json = await generateCourseContent(apiRequestData, token || undefined);
      
      // Log the API response (for debugging)
      console.log('📥 API Response received:', json);

      // Extract only essential data from API response
      const description: string = json?.generated_content || basicInfo.description || '';

      const mapped: GeneratedCourse = {
        id: 'api',
        title: basicInfo.title || 'Generated Course',
        description,
        courseType: courseData.courseType,
        modules: [
          { id: 'm1', title: 'Introduction and Overview', description: 'Introduction and course overview', duration: '30 minutes' },
          { id: 'm2', title: 'Core Concepts', description: 'Deep dive into concepts and theories', duration: '60 minutes' },
          { id: 'm3', title: 'Practical Applications', description: 'Hands-on application of learned concepts', duration: '45 minutes' },
          { id: 'm4', title: 'Assessment and Review', description: 'Evaluation of outcomes and course review', duration: '30 minutes' },
        ],
        totalDuration: '2h 45m',
        createdAt: new Date(),
      };

      onGenerated?.(mapped);
      // Keep backward compatibility if parent provided old prop
      if (onGenerate && !onGenerated) onGenerate();
    } catch (e) {
      // If API fails, still notify parent using onGenerate fallback
      if (onGenerate) onGenerate();
    } finally {
      setLocalGenerating(false);
      setShouldGenerate(false);
    }
  };

  // Trigger function from effect (as requested: inside useEffect and inside a function)
  useEffect(() => {
    if (shouldGenerate) {
      void generateFromApi();
    }
  }, [shouldGenerate]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Review & Generate
        </h2>
        <p className="text-gray-600">
          Review your course details and generate the content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Overview */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Course Overview
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Title:</span>
                <p className="text-gray-900">{basicInfo.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Audience:</span>
                <p className="text-gray-900">{basicInfo.targetAudience}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Level:</span>
                <p className="text-gray-900">{basicInfo.difficultyLevel}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <p className="text-gray-900">{learningObjectives.duration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Learning Objectives
            </h3>
            <ul className="space-y-3">
              {(learningObjectives.objectives || []).map((objective: LearningObjective, index: number) => (
                <li key={objective.id} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {objective.text}
                  </p>
                </li>
              ))}

{learningObjectives.selectedCollectionName && (
            <div className="text-sm text-gray-800">
              <strong>Collection:</strong> {learningObjectives.selectedCollectionName}
            </div>
          )}
            </ul>
          </div>
        </div>
      </div>

      {/* Selected Sources - Simplified */}
      {(learningObjectives.selectedPdfNames?.length || learningObjectives.selectedCollectionName) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Sources</h3>
          <div className="space-y-2">
            {learningObjectives.selectedPdfNames?.length ? (
              <div className="text-sm text-gray-700">
                <span className="font-medium">PDF:</span> {learningObjectives.selectedPdfTitle || learningObjectives.selectedPdfNames[0]}
              </div>
            ) : null}
            {learningObjectives.selectedCollectionName && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Collection:</span> {learningObjectives.selectedCollectionName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Description */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Course Description
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {basicInfo.description}
        </p>
      </div>

      {/* Debug Section - Shows what data will be sent to API */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">🔍 Data that will be sent to API:</h4>
        <div className="text-xs text-blue-800 space-y-1">
          <div><strong>Title:</strong> {basicInfo.title}</div>
          <div><strong>Audience:</strong> {basicInfo.targetAudience}</div>
          <div><strong>Level:</strong> {basicInfo.difficultyLevel}</div>
          <div><strong>Duration:</strong> {learningObjectives.duration} ({parseInt(learningObjectives.duration.match(/\d+/)?.[0] || '0')} weeks)</div>
          <div><strong>Objectives:</strong> {(learningObjectives.objectives || []).map(o => o.text).join(', ')}</div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={() => setShouldGenerate(true)}
          disabled={isGenerating || localGenerating}
          size="lg"
          className="min-w-48"
        >
          {isGenerating || localGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating Course...
            </>
          ) : (
            <>
              <BookOpen className="h-5 w-5 mr-2" />
              Generate Course
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

