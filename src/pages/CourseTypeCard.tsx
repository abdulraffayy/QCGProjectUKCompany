import React from 'react';
import { BookOpen, Briefcase, Sparkles, ArrowRight, Users, Clock, Target } from 'lucide-react';
import { CourseType } from '../types/courseTypes';
import { cn } from '../lib/utils';

interface CourseTypeCardProps {
  courseType: CourseType;
  onSelect: (courseType: CourseType) => void;
  isExpanded?: boolean;
}

const iconMap = {
  BookOpen,
  Briefcase,
  Sparkles
};

export const CourseTypeCard: React.FC<CourseTypeCardProps> = ({
  courseType,
  onSelect,
  isExpanded = false,
}) => {
  const Icon = iconMap[courseType.icon as keyof typeof iconMap];
  
  const colorClasses = {
    blue: {
      border: 'border-t-blue-500',
      icon: 'text-blue-600 bg-blue-50',
      button: 'text-blue-600 hover:text-blue-700'
    },
    green: {
      border: 'border-t-green-500',
      icon: 'text-green-600 bg-green-50',
      button: 'text-green-600 hover:text-green-700'
    },
    purple: {
      border: 'border-t-purple-500',
      icon: 'text-purple-600 bg-purple-50',
      button: 'text-purple-600 hover:text-purple-700'
    }
  };

  const colors = colorClasses[courseType.color];

  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border border-gray-200 border-t-4 p-6 hover:shadow-lg cursor-pointer group transition-all duration-300 ease-in-out',
        colors.border,
        isExpanded
          ? 'fixed inset-0 w-screen h-screen z-50 overflow-auto p-8'
          : 'transition-shadow'
      )}
      onClick={() => onSelect(courseType)}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          'flex-shrink-0 p-3 rounded-lg',
          colors.icon
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <button className={cn(
          'p-2 rounded-full transition-colors',
          colors.button
        )}>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {courseType.title}
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          {courseType.description}
        </p>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Key Features
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {courseType.features.map((feature, index) => (
            <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span className="font-medium">Audience:</span>
          <span className="ml-1">{courseType.audience}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span className="font-medium">Duration:</span>
          <span className="ml-1">{courseType.duration}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Target className="h-4 w-4 mr-2" />
          <span className="font-medium">Focus:</span>
          <span className="ml-1">{courseType.focus}</span>
        </div>
      </div>
    </div>
  );
};

