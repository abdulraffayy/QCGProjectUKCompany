import { useState, useCallback } from 'react';
import { CourseType, CourseData, BasicInfo, LearningObjectives, SpecializedContent, WizardStep } from '../../types/courseTypes';

export const useCourseWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType | null>(null);
  const [courseData, setCourseData] = useState<Partial<CourseData>>({});

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Basic Information',
      description: "Let's start with the fundamental details of your course",
      progress: 25,
      isComplete: !!courseData.basicInfo
    },
    {
      id: 2,
      title: 'Learning Objectives',
      description: 'Define what participants will achieve by completing this course',
      progress: 50,
      isComplete: !!courseData.learningObjectives
    },
    {
      id: 3,
      title: 'Specialized Content',
      description: 'Specify the specialized context and requirements',
      progress: 75,
      isComplete: !!courseData.specializedContent
    },
    {
      id: 4,
      title: 'Review & Generate',
      description: 'Review your course details and generate the content',
      progress: 100,
      isComplete: false
    }
  ];

  const updateBasicInfo = useCallback((basicInfo: BasicInfo) => {
    setCourseData(prev => ({ ...prev, basicInfo }));
  }, []);

  const updateLearningObjectives = useCallback((learningObjectives: LearningObjectives) => {
    setCourseData(prev => ({ ...prev, learningObjectives }));
  }, []);

  const updateSpecializedContent = useCallback((specializedContent: SpecializedContent) => {
    setCourseData(prev => ({ ...prev, specializedContent }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, 4)));
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setSelectedCourseType(null);
    setCourseData({});
  }, []);

  const selectCourseType = useCallback((courseType: CourseType) => {
    setSelectedCourseType(courseType);
    setCourseData(prev => ({ ...prev, courseType: courseType.id }));
    setCurrentStep(1);
  }, []);

  const canProceedToNext = useCallback(() => {
    console.log('currentStep', currentStep);
    console.log('courseData', courseData);
    switch (currentStep) {
      case 1:
        return !!(courseData.basicInfo?.title && courseData.basicInfo?.description && 
                 courseData.basicInfo?.targetAudience && courseData.basicInfo?.qaqfLevel);
      case 2:
        return !!(courseData.learningObjectives?.objectives?.length && 
                 courseData.learningObjectives?.duration);
      case 3:
        return !!courseData.specializedContent;
      default:
        return false;
    }
  }, [currentStep, courseData]);

  return {
    currentStep,
    selectedCourseType,
    courseData,
    steps,
    updateBasicInfo,
    updateLearningObjectives,
    updateSpecializedContent,
    nextStep,
    previousStep,
    goToStep,
    resetWizard,
    selectCourseType,
    canProceedToNext
  };
};

