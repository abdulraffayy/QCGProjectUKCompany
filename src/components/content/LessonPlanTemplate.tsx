import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { X, Plus } from 'lucide-react';

const lessonPlanSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(2, 'Subject is required'),
  qaqf_level: z.number().min(1).max(9),
  duration: z.string().min(1, 'Duration is required'),
  learning_objectives: z.string().min(10, 'Learning objectives are required'),
  prerequisites: z.string().optional(),
  activities: z.array(z.object({
    name: z.string(),
    duration: z.string(),
    description: z.string()
  })).min(1, 'At least one activity is required'),
  assessment_methods: z.array(z.string()).min(1, 'At least one assessment method is required'),
  resources: z.array(z.string()).optional()
});

type LessonPlanData = z.infer<typeof lessonPlanSchema>;

interface LessonPlanTemplateProps {
  baseContent?: any;
  onSave: (lessonPlan: LessonPlanData) => void;
  onCancel: () => void;
}

const LessonPlanTemplate: React.FC<LessonPlanTemplateProps> = ({
  baseContent,
  onSave,
  onCancel
}) => {
  const [activities, setActivities] = useState([
    { name: 'Introduction', duration: '10 minutes', description: 'Welcome and overview' }
  ]);
  const [resources, setResources] = useState(['']);

  const form = useForm<LessonPlanData>({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues: {
      title: baseContent ? `Lesson: ${baseContent.title}` : '',
      subject: '',
      qaqf_level: baseContent?.qaqf_level || 1,
      duration: '60 minutes',
      learning_objectives: '',
      prerequisites: '',
      activities: activities,
      assessment_methods: [],
      resources: resources.filter(r => r.length > 0)
    }
  });

  const addActivity = () => {
    setActivities([...activities, { name: '', duration: '', description: '' }]);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, field: string, value: string) => {
    const updated = activities.map((activity, i) => 
      i === index ? { ...activity, [field]: value } : activity
    );
    setActivities(updated);
    form.setValue('activities', updated);
  };

  const addResource = () => {
    setResources([...resources, '']);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, value: string) => {
    const updated = resources.map((resource, i) => i === index ? value : resource);
    setResources(updated);
    form.setValue('resources', updated.filter(r => r.length > 0));
  };

  const onSubmit = (data: LessonPlanData) => {
    onSave({
      ...data,
      activities: activities,
      resources: resources.filter(r => r.length > 0)
    });
  };

  const assessmentMethods = [
    'Formative Assessment',
    'Summative Assessment',
    'Peer Assessment',
    'Self-Assessment',
    'Portfolio Assessment',
    'Project-Based Assessment',
    'Presentation',
    'Written Test',
    'Practical Demonstration'
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create Lesson Plan</CardTitle>
            <CardDescription>
              Design a comprehensive lesson plan aligned with QAQF standards
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Lesson Title</Label>
              <Input 
                id="title"
                {...form.register('title')}
                placeholder="Enter lesson title"
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject"
                {...form.register('subject')}
                placeholder="Enter subject area"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qaqf_level">QAQF Level</Label>
              <Select 
                value={form.watch('qaqf_level').toString()} 
                onValueChange={(value) => form.setValue('qaqf_level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select QAQF level" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9].map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input 
                id="duration"
                {...form.register('duration')}
                placeholder="e.g., 60 minutes, 2 hours"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="learning_objectives">Learning Objectives</Label>
            <Textarea 
              id="learning_objectives"
              {...form.register('learning_objectives')}
              placeholder="What will students learn and be able to do?"
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <Label htmlFor="prerequisites">Prerequisites (Optional)</Label>
            <Textarea 
              id="prerequisites"
              {...form.register('prerequisites')}
              placeholder="What should students know before this lesson?"
              className="min-h-[60px]"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Learning Activities</Label>
              <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                <Plus className="h-4 w-4 mr-1" />
                Add Activity
              </Button>
            </div>
            
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Activity {index + 1}</span>
                    {activities.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeActivity(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <Input 
                      placeholder="Activity name"
                      value={activity.name}
                      onChange={(e) => updateActivity(index, 'name', e.target.value)}
                    />
                    <Input 
                      placeholder="Duration"
                      value={activity.duration}
                      onChange={(e) => updateActivity(index, 'duration', e.target.value)}
                    />
                  </div>
                  
                  <Textarea 
                    placeholder="Activity description"
                    value={activity.description}
                    onChange={(e) => updateActivity(index, 'description', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Assessment Methods</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {assessmentMethods.map((method) => (
                <label key={method} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={method}
                    {...form.register('assessment_methods')}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{method}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Resources (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addResource}>
                <Plus className="h-4 w-4 mr-1" />
                Add Resource
              </Button>
            </div>
            
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    placeholder="Resource name or description"
                    value={resource}
                    onChange={(e) => updateResource(index, e.target.value)}
                  />
                  {resources.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeResource(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Save Lesson Plan
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonPlanTemplate;