import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Target, 
  FileText, 
  CheckCircle,
  Edit,
  Save,
  Download,
} from 'lucide-react';

interface LessonPlanSection {
  id: string;
  title: string;
  content: string;
  duration?: number;
  editable: boolean;
}

interface LessonPlanTemplateProps {
  lessonPlan: {
    id?: string;
    title: string;
    subject: string;
    qaqfLevel: number;
    duration: number;
    objectives: string[];
    sections: LessonPlanSection[];
    resources: string[];
    assessment: string;
    metadata?: any;
  };
  onSave?: (lessonPlan: any) => void;
  onClose?: () => void;
}

const LessonPlanTemplate: React.FC<LessonPlanTemplateProps> = ({
  lessonPlan: initialLessonPlan,
  onSave,
  onClose
}) => {
  const [lessonPlan, setLessonPlan] = useState(initialLessonPlan);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');


  const updateSection = (sectionId: string, field: string, value: any) => {
    setLessonPlan(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, [field]: value }
          : section
      )
    }));
  };

  const updateLessonPlan = (field: string, value: any) => {
    setLessonPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addObjective = () => {
    const newObjective = 'Students will be able to...';
    setLessonPlan(prev => ({
      ...prev,
      objectives: [...prev.objectives, newObjective]
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setLessonPlan(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setLessonPlan(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addResource = () => {
    const newResource = 'New resource';
    setLessonPlan(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
  };

  const updateResource = (index: number, value: string) => {
    setLessonPlan(prev => ({
      ...prev,
      resources: prev.resources.map((res, i) => i === index ? value : res)
    }));
  };

  const removeResource = (index: number) => {
    setLessonPlan(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const getTotalDuration = () => {
    return lessonPlan.sections.reduce((total, section) => total + (section.duration || 0), 0);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(lessonPlan);
    }
    setIsEditing(false);
  };

  const exportLessonPlan = () => {
    const dataStr = JSON.stringify(lessonPlan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${lessonPlan.title.replace(/\s+/g, '_')}_lesson_plan.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">
                  {isEditing ? (
                    <input
                      type="text"
                      value={lessonPlan.title}
                      onChange={(e) => updateLessonPlan('title', e.target.value)}
                      className="text-xl font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    lessonPlan.title
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span>Subject: {lessonPlan.subject}</span>
                  <Badge variant="outline">QAQF Level {lessonPlan.qaqfLevel}</Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTotalDuration()} minutes
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button onClick={exportLessonPlan} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  {onClose && (
                    <Button onClick={onClose} variant="outline" size="sm">
                      Close
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">Lesson Sections</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lessonPlan.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          value={objective}
                          onChange={(e) => updateObjective(index, e.target.value)}
                          className="flex-1"
                          rows={1}
                        />
                        <Button
                          onClick={() => removeObjective(index)}
                          variant="outline"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <span className="flex-1">{objective}</span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button onClick={addObjective} variant="outline" size="sm">
                    Add Objective
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          {lessonPlan.sections.map((section, index) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                        className="font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      section.title
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={section.duration || 0}
                        onChange={(e) => updateSection(section.id, 'duration', parseInt(e.target.value) || 0)}
                        className="w-16 text-center border rounded px-2 py-1"
                        min="0"
                      />
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {section.duration || 0} min
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    placeholder="Describe the activities and content for this section..."
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Required Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lessonPlan.resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                    {isEditing ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={resource}
                          onChange={(e) => updateResource(index, e.target.value)}
                          className="flex-1 border rounded px-3 py-1"
                        />
                        <Button
                          onClick={() => removeResource(index)}
                          variant="outline"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <span className="flex-1">{resource}</span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button onClick={addResource} variant="outline" size="sm">
                    Add Resource
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assessment Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={lessonPlan.assessment}
                  onChange={(e) => updateLessonPlan('assessment', e.target.value)}
                  placeholder="Describe how student learning will be assessed..."
                  rows={6}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{lessonPlan.assessment}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LessonPlanTemplate;