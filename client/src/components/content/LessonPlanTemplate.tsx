import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Users, 
  CheckCircle, 
  Plus, 
  Minus,
  FileText,
  Save,
  Download,
  Eye
} from 'lucide-react';

interface LessonPlanData {
  title: string;
  subject: string;
  duration: string;
  qaqf_level: number;
  learning_objectives: string[];
  materials: string[];
  activities: {
    name: string;
    duration: string;
    description: string;
    type: 'introduction' | 'main' | 'assessment' | 'conclusion';
  }[];
  assessment_methods: string[];
  homework: string;
  notes: string;
}

interface LessonPlanTemplateProps {
  generatedContent?: any;
  onSave: (lessonPlan: LessonPlanData) => void;
  onClose: () => void;
}

const LessonPlanTemplate: React.FC<LessonPlanTemplateProps> = ({ 
  generatedContent, 
  onSave, 
  onClose 
}) => {
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData>({
    title: generatedContent?.title || '',
    subject: generatedContent?.subject || '',
    duration: '60 minutes',
    qaqf_level: generatedContent?.qaqf_level || 5,
    learning_objectives: generatedContent?.learning_objectives || [''],
    materials: ['Textbook', 'Whiteboard', 'Projector'],
    activities: [
      {
        name: 'Introduction',
        duration: '10 minutes',
        description: 'Welcome students and introduce the topic',
        type: 'introduction'
      },
      {
        name: 'Main Content',
        duration: '35 minutes', 
        description: generatedContent?.content || 'Main lesson content',
        type: 'main'
      },
      {
        name: 'Assessment',
        duration: '10 minutes',
        description: 'Quick assessment to check understanding',
        type: 'assessment'
      },
      {
        name: 'Conclusion',
        duration: '5 minutes',
        description: 'Summarize key points and assign homework',
        type: 'conclusion'
      }
    ],
    assessment_methods: ['Oral Questions', 'Quick Quiz'],
    homework: 'Read chapter 3 and complete exercises 1-5',
    notes: ''
  });

  const addObjective = () => {
    setLessonPlan(prev => ({
      ...prev,
      learning_objectives: [...prev.learning_objectives, '']
    }));
  };

  const removeObjective = (index: number) => {
    setLessonPlan(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setLessonPlan(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.map((obj, i) => 
        i === index ? value : obj
      )
    }));
  };

  const addMaterial = () => {
    setLessonPlan(prev => ({
      ...prev,
      materials: [...prev.materials, '']
    }));
  };

  const removeMaterial = (index: number) => {
    setLessonPlan(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const updateMaterial = (index: number, value: string) => {
    setLessonPlan(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? value : material
      )
    }));
  };

  const updateActivity = (index: number, field: string, value: string) => {
    setLessonPlan(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'introduction': return <Users className="h-4 w-4" />;
      case 'main': return <BookOpen className="h-4 w-4" />;
      case 'assessment': return <CheckCircle className="h-4 w-4" />;
      case 'conclusion': return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleSave = async () => {
    try {
      // Save to database via API
      const response = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: lessonPlan.title,
          subject: lessonPlan.subject,
          duration: lessonPlan.duration,
          qaqfLevel: lessonPlan.qaqf_level,
          learningObjectives: lessonPlan.learning_objectives,
          materials: lessonPlan.materials,
          activities: lessonPlan.activities,
          assessmentMethods: lessonPlan.assessment_methods,
          homework: lessonPlan.homework,
          notes: lessonPlan.notes,
        }),
      });

      if (response.ok) {
        const savedLessonPlan = await response.json();
        console.log('Lesson plan saved:', savedLessonPlan);
        onSave(lessonPlan);
      } else {
        console.error('Failed to save lesson plan');
      }
    } catch (error) {
      console.error('Error saving lesson plan:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Lesson Plan Template</span>
          </CardTitle>
          <CardDescription>
            Create a structured lesson plan from your generated content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                value={lessonPlan.title}
                onChange={(e) => setLessonPlan(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter lesson title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={lessonPlan.subject}
                onChange={(e) => setLessonPlan(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select 
                value={lessonPlan.duration} 
                onValueChange={(value) => setLessonPlan(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="45 minutes">45 minutes</SelectItem>
                  <SelectItem value="60 minutes">60 minutes</SelectItem>
                  <SelectItem value="90 minutes">90 minutes</SelectItem>
                  <SelectItem value="120 minutes">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qaqf_level">QAQF Level</Label>
              <Select 
                value={lessonPlan.qaqf_level.toString()} 
                onValueChange={(value) => setLessonPlan(prev => ({ ...prev, qaqf_level: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          <Separator />

          {/* Learning Objectives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Learning Objectives</Label>
              <Button onClick={addObjective} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Objective
              </Button>
            </div>
            <div className="space-y-2">
              {lessonPlan.learning_objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder={`Learning objective ${index + 1}`}
                  />
                  {lessonPlan.learning_objectives.length > 1 && (
                    <Button
                      onClick={() => removeObjective(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Materials */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Required Materials</Label>
              <Button onClick={addMaterial} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Material
              </Button>
            </div>
            <div className="space-y-2">
              {lessonPlan.materials.map((material, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={material}
                    onChange={(e) => updateMaterial(index, e.target.value)}
                    placeholder={`Material ${index + 1}`}
                  />
                  {lessonPlan.materials.length > 1 && (
                    <Button
                      onClick={() => removeMaterial(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Activities Timeline */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Lesson Activities</Label>
            <div className="space-y-4">
              {lessonPlan.activities.map((activity, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Activity Name</Label>
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(activity.type)}
                          <Input
                            value={activity.name}
                            onChange={(e) => updateActivity(index, 'name', e.target.value)}
                            placeholder="Activity name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <Input
                            value={activity.duration}
                            onChange={(e) => updateActivity(index, 'duration', e.target.value)}
                            placeholder="10 minutes"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select 
                          value={activity.type} 
                          onValueChange={(value) => updateActivity(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="introduction">Introduction</SelectItem>
                            <SelectItem value="main">Main Content</SelectItem>
                            <SelectItem value="assessment">Assessment</SelectItem>
                            <SelectItem value="conclusion">Conclusion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={activity.description}
                          onChange={(e) => updateActivity(index, 'description', e.target.value)}
                          placeholder="Describe what happens during this activity"
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Assessment and Homework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assessment">Assessment Methods</Label>
              <Textarea
                id="assessment"
                value={lessonPlan.assessment_methods.join(', ')}
                onChange={(e) => setLessonPlan(prev => ({ 
                  ...prev, 
                  assessment_methods: e.target.value.split(', ').filter(m => m.trim())
                }))}
                placeholder="List assessment methods"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homework">Homework Assignment</Label>
              <Textarea
                id="homework"
                value={lessonPlan.homework}
                onChange={(e) => setLessonPlan(prev => ({ ...prev, homework: e.target.value }))}
                placeholder="Describe homework assignment"
                rows={3}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={lessonPlan.notes}
              onChange={(e) => setLessonPlan(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes or considerations"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save Lesson Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonPlanTemplate;