// import React, { useState } from 'react';
// import { ArrowLeft, ArrowRight } from 'lucide-react';
// import { CourseType, GeneratedCourse } from '../types/courseTypes';
// import { useCourseWizard } from '../components/hooks/useCourseWizard';
// import { generateCourse } from '../types/courseGenerator';
// import { Button } from '../components/ui/button';
// import { Progress } from '../components/ui/progress';
// import { BasicInfoStep } from '../components/wizard/BasicInfoStep';
// import { LearningObjectivesStep } from '../components/wizard/LearningObjectivesStep';
// import { SpecializedContentStep } from '../components/wizard/SpecializedContentStep';
// import { ReviewStep } from '../components/wizard/ReviewStep';
// import { GeneratedCourseComponent } from '../pages/GeneratedCourse';

// interface WizardPageProps {
//   courseType: CourseType;
//   onBackToSelection: () => void;
//   onCreateAnother: () => void;
// }

// export const WizardPage: React.FC<WizardPageProps> = ({
//   courseType,
//   onBackToSelection,
//   onCreateAnother
// }) => {
//   const {
//     currentStep,
//     courseData,
//     steps,
//     updateBasicInfo,
//     updateLearningObjectives,
//     updateSpecializedContent,
//     nextStep,
//     previousStep,
//     canProceedToNext
//   } = useCourseWizard();

//   const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
//   const [isGenerating, setIsGenerating] = useState(false);

//   const currentStepData = steps.find(step => step.id === currentStep);

//   const handleGenerate = async () => {
//     if (!courseData.basicInfo || !courseData.learningObjectives || !courseData.specializedContent) {
//       return;
//     }

//     setIsGenerating(true);
    
//     // Simulate generation delay
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     const fullCourseData = {
//       courseType: courseType.id,
//       basicInfo: courseData.basicInfo,
//       learningObjectives: courseData.learningObjectives,
//       specializedContent: courseData.specializedContent
//     };

//     const generated = generateCourse(fullCourseData);
//     setGeneratedCourse(generated);
//     setIsGenerating(false);
//   };

//   const handleExportPDF = () => {
//     // In a real implementation, this would generate and download a PDF
//     alert('PDF export functionality would be implemented here');
//   };

//   const handlePreviewHTML = () => {
//     // In a real implementation, this would open an HTML preview
//     alert('HTML preview functionality would be implemented here');
//   };

//   if (generatedCourse) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="mb-8">
//             <Button
//               variant="ghost"
//               onClick={onBackToSelection}
//               className="text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Selection
//             </Button>
//           </div>
          
//           <GeneratedCourseComponent
//             course={generatedCourse}
//             onCreateAnother={onCreateAnother}
//             onExportPDF={handleExportPDF}
//             onPreviewHTML={handlePreviewHTML}
//           />
//         </div>
//       </div>
//     );
//   }

//   const renderCurrentStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <BasicInfoStep
//             data={courseData.basicInfo}
//             onUpdate={updateBasicInfo}
//           />
//         );
//       case 2:
//         return (
//           <LearningObjectivesStep
//             data={courseData.learningObjectives}
//             courseType={courseType.id}
//             onUpdate={updateLearningObjectives}
//           />
//         );
//       case 3:
//         return (
//           <SpecializedContentStep
//             data={courseData.specializedContent}
//             courseType={courseType.id}
//             onUpdate={updateSpecializedContent}
//           />
//         );
//       case 4:
//         return (
//           <ReviewStep
//             courseData={{
//               courseType: courseType.id,
//               basicInfo: courseData.basicInfo!,
//               learningObjectives: courseData.learningObjectives!,
//               specializedContent: courseData.specializedContent!
//             }}
//             onGenerate={handleGenerate}
//             isGenerating={isGenerating}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-4xl mx-auto px-4 py-6">
//           <div className="flex items-center justify-between mb-6">
//             <Button
//               variant="ghost"
//               onClick={onBackToSelection}
//               className="text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Selection
//             </Button>
            
//             <div className="flex items-center space-x-3">
//               <div className={`p-2 rounded-lg bg-${courseType.color}-100`}>
//                 <div className={`w-6 h-6 text-${courseType.color}-600`}>
//                   {/* Icon would be rendered here */}
//                 </div>
//               </div>
//               <span className="font-medium text-gray-900">
//                 {courseType.title}
//               </span>
//             </div>
//           </div>

//           <Progress value={currentStepData?.progress || 0} />
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
//           {renderCurrentStep()}
//         </div>

//         {/* Navigation */}
//         {currentStep < 4 && (
//           <div className="flex justify-between mt-8">
//             <Button
//               variant="outline"
//               onClick={previousStep}
//               disabled={currentStep === 1}
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Previous
//             </Button>
            
//             <Button
//               onClick={nextStep}
//               disabled={!canProceedToNext()}
//             >
//               Next
//               <ArrowRight className="h-4 w-4 ml-2" />
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


import React, {useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CourseType, GeneratedCourse } from '../types/courseTypes';
import { useCourseWizard } from '../components/hooks/useCourseWizard';
import { generateCourse } from '../types/courseGenerator';
import { Button } from '../components/ui/button';
 import { Progress } from '../components/ui/progress';
import { BasicInfoStep } from '../components/wizard/BasicInfoStep';
import { LearningObjectivesStep } from '../components/wizard/LearningObjectivesStep';
import { SpecializedContentStep } from '../components/wizard/SpecializedContentStep';
import { ReviewStep } from '../components/wizard/ReviewStep';
import { GeneratedCourseComponent } from '../pages/GeneratedCourse';

interface WizardPageProps {
  courseType: CourseType;
  onBackToSelection: () => void;
  onCreateAnother: () => void;
}

export const WizardPage: React.FC<WizardPageProps> = ({
  courseType,
  onBackToSelection,
  onCreateAnother
}) => {
  const {
    currentStep,
    courseData,
    steps,
    updateBasicInfo,
    updateLearningObjectives,
    updateSpecializedContent,
    nextStep,
    previousStep,
    canProceedToNext
  } = useCourseWizard();

  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStepData = steps.find(step => step.id === currentStep);

  // Call backend API to generate content and map to UI
  const handleGenerate = async () => {
    if (!courseData.basicInfo || !courseData.learningObjectives) return;
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://38.29.145.85:8000/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          generation_type: 'course',
          title: courseData.basicInfo.title,
          subject_area: courseData.basicInfo.title,
          target_audience: courseData.basicInfo.targetAudience,
          learning_objectives: courseData.learningObjectives.objectives.map(o => o.text).join('\n'),
          duration_weeks: 0,
          modules_count: 0,
          delivery_mode: 'online',
          qaqf_level: courseData.basicInfo.difficultyLevel,
        }),
      });
      const json = await res.json();

      // Map API response to GeneratedCourse shape expected by GeneratedCourseComponent
      // Fallback to local generator if API did not provide expected format
      let mapped: GeneratedCourse | null = null;
      if (json && json.generated_content) {
        const description = json.generated_content.substring(0, 400);
        mapped = {
          id: 'api',
          title: courseData.basicInfo.title || 'Generated Course',
          description,
          courseType: courseType.id,
          modules: [
            { id: 'm1', title: 'Introduction and Overview', description: 'Introduction and course overview', duration: '30 minutes' },
            { id: 'm2', title: 'Core Concepts', description: 'Deep dive into concepts and theories', duration: '60 minutes' },
            { id: 'm3', title: 'Practical Applications', description: 'Hands-on application of learned concepts', duration: '45 minutes' },
            { id: 'm4', title: 'Assessment and Review', description: 'Evaluation of outcomes and course review', duration: '30 minutes' },
          ],
          totalDuration: '2h 45m',
        } as any;
      }

      if (!mapped) {
        const fallback = generateCourse({
          courseType: courseType.id,
          basicInfo: courseData.basicInfo,
          learningObjectives: courseData.learningObjectives,
          specializedContent: courseData.specializedContent,
        } as any);
        setGeneratedCourse(fallback as any);
      } else {
        setGeneratedCourse(mapped as any);
      }
    } catch (e) {
      const fallback = generateCourse({
        courseType: courseType.id,
        basicInfo: courseData.basicInfo as any,
        learningObjectives: courseData.learningObjectives as any,
        specializedContent: courseData.specializedContent as any,
      } as any);
      setGeneratedCourse(fallback as any);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    // In a real implementation, this would generate and download a PDF
    alert('PDF export functionality would be implemented here');
  };

  const handlePreviewHTML = () => {
    // In a real implementation, this would open an HTML preview
    alert('HTML preview functionality would be implemented here');
  };

  if (generatedCourse) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={onBackToSelection}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
          </div>
          
          <GeneratedCourseComponent
            course={generatedCourse}
            onCreateAnother={onCreateAnother}
            onExportPDF={handleExportPDF}
            onPreviewHTML={handlePreviewHTML}
          />
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={courseData.basicInfo}
            onUpdate={updateBasicInfo}
          />
        );
      case 2:
        return (
          <LearningObjectivesStep
            data={courseData.learningObjectives}
            courseType={courseType.id}
            onUpdate={updateLearningObjectives}
          />
        );
      case 3:
        return (
          <SpecializedContentStep
            data={courseData.specializedContent}
            courseType={courseType.id}
            onUpdate={updateSpecializedContent}
          />
        );
      case 4:
        return (
          <ReviewStep
            courseData={{
              courseType: courseType.id,
              basicInfo: courseData.basicInfo!,
              learningObjectives: courseData.learningObjectives!,
              specializedContent: courseData.specializedContent!
            }}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onGenerated={(course) => {
              // When child maps API response, show the GeneratedCourse page
              setGeneratedCourse(course);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[100%] w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b w-full border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBackToSelection}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${courseType.color}-100`}>
                <div className={`w-6 h-6 text-${courseType.color}-600`}>
                  {/* Icon would be rendered here */}
                </div>
              </div>
              <span className="font-medium text-gray-900">
                {courseType.title}
              </span>
            </div>
          </div>
            <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
              <div>{`Step ${currentStep} of 4`}</div>
              <div>{`${currentStepData?.progress || 0}% Complete`}</div>
            </div>
            <Progress value={currentStepData?.progress || 0} />
        </div>
      </div>

      {/* Content */}
      <div className="w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={!canProceedToNext()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

