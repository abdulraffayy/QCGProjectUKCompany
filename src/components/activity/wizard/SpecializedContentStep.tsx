import React, { useState, useEffect } from 'react';
import { CourseType, SpecializedContent } from '@/types/courseTypes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SpecializedContentStepProps {
  data: SpecializedContent | undefined;
  courseType: CourseType['id'];
  onUpdate: (data: SpecializedContent) => void;
}

export const SpecializedContentStep: React.FC<SpecializedContentStepProps> = ({
  data,
  courseType,
  onUpdate
}) => {
  const [formData, setFormData] = useState<SpecializedContent>(
    data || getDefaultData(courseType)
  );

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderAcademicFields = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Academic Details
          </h2>
          <p className="text-gray-600">
            Specify the academic context and requirements
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Context
          </label>
          <Input
            placeholder="What is the academic context for this course?"
            value={formData.context || ''}
            onChange={(e) => handleChange('context', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <Input
            placeholder="What industry or field does this relate to?"
            value={formData.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
          />
        </div>
      </div>
    );
  };

  const renderCorporateFields = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Corporate Training Details
          </h2>
          <p className="text-gray-600">
            Specify the business context and training requirements
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <Input
            placeholder="What industry is this training for?"
            value={formData.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compliance Requirements
          </label>
          <Textarea
            placeholder="What compliance requirements need to be met?"
            value={formData.compliance || ''}
            onChange={(e) => handleChange('compliance', e.target.value)}
          />
        </div>
      </div>
    );
  };

  const renderStorytellingFields = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Storytelling Details
          </h2>
          <p className="text-gray-600">
            Define the narrative elements and educational integration
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Context
          </label>
          <Input
            placeholder="What is the storytelling context?"
            value={formData.context || ''}
            onChange={(e) => handleChange('context', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <Textarea
            placeholder="Additional notes about the storytelling approach"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>
      </div>
    );
  };

  switch (courseType) {
    case 'academic':
      return renderAcademicFields();
    case 'corporate':
      return renderCorporateFields();
    case 'storytelling':
      return renderStorytellingFields();
    default:
      return null;
  }
};

function getDefaultData(courseType: CourseType['id']): SpecializedContent {
  switch (courseType) {
    case 'academic':
      return { context: '', industry: '' };
    case 'corporate':
      return { industry: '', compliance: '' };
    case 'storytelling':
      return { context: '', notes: '' };
    default:
      return { context: '', industry: '' };
  }
}

