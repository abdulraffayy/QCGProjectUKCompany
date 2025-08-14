import React from 'react';
import { Download, Eye, RotateCcw, Clock } from 'lucide-react';
import { GeneratedCourse } from '../types/courseTypes';
import { Button } from '../components/ui/button';
import { courseTypes } from '../types/courseTypes';

// Basic cleanup to render API markdown-like content as plain text paragraphs
const stripBasicMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/__(.*?)__/g, '$1') // bold/underline
    .replace(/^#+\s*(.*)$/gm, '$1') // headings
    .replace(/`{1,3}([^`]*?)`{1,3}/g, '$1') // inline code
    .replace(/\*\s+/g, '') // bullets
    .replace(/^-\s+/gm, '') // dashes
    .replace(/\r?\n{2,}/g, '\n'); // condense blank lines
};

interface GeneratedCourseProps {
  course: GeneratedCourse;
  onCreateAnother: () => void;
  onExportPDF: () => void;
  onPreviewHTML: () => void;
}

export const GeneratedCourseComponent: React.FC<GeneratedCourseProps> = ({
  course,
  onCreateAnother,
  onExportPDF,
  onPreviewHTML
}) => {
  const courseType = courseTypes.find(type => type.id === course.courseType);
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Course Generated Successfully!
          </h1>
          <p className="text-gray-600 mt-2">
            Your course has been generated and is ready for export
          </p>
        </div>
        {courseType && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            {courseType.title}
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {course.title}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {stripBasicMarkdown(course.description as any)}
            </p>
          </div>
          {/* Course Modules - Matching Image Design */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Modules
            </h3>
            <div className="space-y-4">
              {course.modules.map((module: any, index: number) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                                          <div>
                        <h4 className="font-semibold text-gray-900">
                          {module.title}
                        </h4>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {module.duration}
                    </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Duration */}
          <div className="mt-6">
            <div className="font-semibold text-gray-900">
              Total Course Duration
            </div>
            <div className="font-semibold text-gray-900 mt-1">
              {course.totalDuration}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onExportPDF}
          className="flex-1 sm:flex-none min-w-48"
        >
          <Download className="h-4 w-4 mr-2" />
          Export as PDF
        </Button>
        <Button
          onClick={onPreviewHTML}
          variant="outline"
          className="flex-1 sm:flex-none min-w-48"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview HTML
        </Button>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onCreateAnother}
          variant="ghost"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Create Another Course
        </Button>
      </div>
    </div>
  );
};

