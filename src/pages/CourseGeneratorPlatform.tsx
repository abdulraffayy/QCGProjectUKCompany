import { } from 'react';
import { Sparkles, Target, Palette, FileText } from 'lucide-react';
import { CourseType, courseTypes } from '../types/courseTypes';
import { CourseTypeCard } from '../pages/CourseTypeCard';
import { useLocation } from 'wouter';
const CourseGeneratorPlatform = () => {
  const [, setLocation] = useLocation();
  const handleSelectCourseType = (courseType: CourseType) => {
    setLocation(`/course-generator/wizard/${courseType.id}`);
  };


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Course Generator Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create professional, engaging courses with AI-powered templates tailored to your specific needs
          </p>
        </div>
      </div>

      {(
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Course Type
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the format that best matches your educational goals and audience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseTypes.map((courseType) => (
              <CourseTypeCard
                key={courseType.id}
                courseType={courseType}
                onSelect={handleSelectCourseType}
                isExpanded={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Professional Templates
              </h3>
              <p className="text-gray-600">
                AI-powered templates based on educational best practices and industry standards
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Palette className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Customizable Content
              </h3>
              <p className="text-gray-600">
                Tailor every aspect to your specific audience, objectives, and requirements
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-600">
                Export to PDF, HTML, presentation slides, and more for maximum flexibility
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Sparkles className="h-4 w-4" />
            <span>Made with Manus</span>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default CourseGeneratorPlatform
