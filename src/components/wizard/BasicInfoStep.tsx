import React, { useState, useEffect } from 'react';
import { BasicInfo } from '../../types/courseTypes';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getDifficultyOptions } from '../../types/courseTypes';

interface BasicInfoStepProps {
  data: BasicInfo | undefined;
  onUpdate: (data: BasicInfo) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onUpdate
}) => {
  const [formData, setFormData] = useState<BasicInfo>({
    title: data?.title || '',
    description: data?.description || '',
    targetAudience: data?.targetAudience || '',
    difficultyLevel: data?.difficultyLevel || 'Beginner'
  });

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const handleChange = (field: keyof BasicInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 w-full h-full">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600">
          Let's start with the fundamental details of your academic lecture
        </p>
      </div>

      <div className="space-y-6">
      <div className="space-y-2">
  <Label htmlFor="title">Course Title</Label>
  <Input
    id="title"
    placeholder="Enter a descriptive title for your course"
    value={formData.title}
    onChange={(e) => handleChange("title", e.target.value)}
    required
    className="w-full"
  />
</div>

        <div>
        <Label htmlFor="description">Course Description</Label>
        <Textarea
         className='w-full border-gray-200 focus:ring-0 focus:ring-offset-0'
          id="description"
          placeholder="Provide a brief overview of what this course covers"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
        />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              placeholder="Who is this course for?"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="w-full">
            <Label>Difficulty Level</Label>
            <Select
              value={formData.difficultyLevel}
              onValueChange={(value) => handleChange('difficultyLevel', value as BasicInfo['difficultyLevel'])}
              
            >
              <SelectTrigger className='w-full focus:ring-0 focus:ring-offset-0'>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {getDifficultyOptions().map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

