import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { LessonPlan } from '@shared/schema';
import { Clock, Users, Edit, Download, Eye, Trash2 } from 'lucide-react';

const LessonPlanPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const { toast } = useToast();
  
  // Fetch saved lesson plans from the database
  const { data: lessonPlans = [], isLoading, refetch } = useQuery<LessonPlan[]>({
    queryKey: ['/api/lesson-plans'],
  });

  const handleDeleteLessonPlan = async (id: number) => {
    try {
      const response = await fetch(`/api/lesson-plans/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Lesson plan deleted successfully",
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete lesson plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the lesson plan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">Lesson Plan</h1>
        <p className="text-neutral-600">Organize and manage weekly lesson plans for your courses</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Weekly Lesson Planning</h3>
          <p className="text-neutral-600 mb-4">
            Create and manage weekly lesson plans for your course content. Organize your approved content into a structured schedule for up to 12 weeks.
          </p>
          
          <div className="border rounded-md p-4 bg-neutral-50 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-amber-500">info</span>
              <p className="text-sm font-medium">Only approved course content can be added to weekly lesson plans</p>
            </div>
            <p className="text-sm text-neutral-600">
              Drag and drop approved content from your library onto the week slots. Each lesson plan will include content, activities, 
              and assessments aligned with QAQF framework.
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Select Course to Plan</h4>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nursing">Nursing in workplace (QAQF Level 5)</SelectItem>
                <SelectItem value="healthcare">Healthcare Ethics Introduction</SelectItem>
                <SelectItem value="patient">Patient Assessment Techniques</SelectItem>
                <SelectItem value="research">Research Methods in Nursing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md p-4 bg-white mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h5 className="font-medium mb-4">Available Approved Content</h5>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {[
                    {
                      id: 1,
                      title: "Healthcare Ethics Introduction",
                      type: "lecture",
                      qaqfLevel: 3,
                      duration: "45 min"
                    },
                    {
                      id: 2,
                      title: "Patient Assessment Practical",
                      type: "practical",
                      qaqfLevel: 4,
                      duration: "90 min"
                    },
                    {
                      id: 3,
                      title: "Research Methods Workshop",
                      type: "seminar",
                      qaqfLevel: 6,
                      duration: "120 min"
                    },
                    {
                      id: 4,
                      title: "Communication Skills Exercise",
                      type: "activity",
                      qaqfLevel: 4,
                      duration: "60 min"
                    },
                    {
                      id: 5,
                      title: "Case Study: Patient Ethics",
                      type: "case_study",
                      qaqfLevel: 5,
                      duration: "75 min"
                    }
                  ].map((content) => (
                    <div key={content.id} className="border rounded-md p-3 bg-neutral-50 hover:shadow-sm cursor-move transition-all">
                      <div className="flex justify-between mb-1">
                        <h6 className="font-medium text-sm">{content.title}</h6>
                        <Badge className={content.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                        content.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                        "bg-violet-100 text-violet-800"}>
                          QAQF {content.qaqfLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{content.type}</span>
                        <span>{content.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Weekly Schedule</h5>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <span className="material-icons text-sm mr-1">save</span>
                      Save Plan
                    </Button>
                    <Button variant="outline" size="sm">
                      <span className="material-icons text-sm mr-1">download</span>
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                    <div key={week} className="border rounded-md overflow-hidden">
                      <div className="bg-neutral-100 p-3 flex justify-between items-center">
                        <h6 className="font-medium">Week {week}</h6>
                        <Button variant="ghost" size="sm">
                          <span className="material-icons text-sm">add</span>
                        </Button>
                      </div>
                      
                      {week === 1 ? (
                        <div className="p-3 space-y-2">
                          <div className="border rounded-md p-2 bg-blue-50 flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">Healthcare Ethics Introduction</div>
                              <div className="text-xs text-neutral-500">Lecture • 45 min</div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <span className="material-icons text-sm">close</span>
                            </Button>
                          </div>
                          
                          <div className="border rounded-md p-2 bg-blue-50 flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">Communication Skills Exercise</div>
                              <div className="text-xs text-neutral-500">Activity • 60 min</div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <span className="material-icons text-sm">close</span>
                            </Button>
                          </div>
                        </div>
                      ) : week === 2 ? (
                        <div className="p-3 space-y-2">
                          <div className="border rounded-md p-2 bg-blue-50 flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">Patient Assessment Practical</div>
                              <div className="text-xs text-neutral-500">Practical • 90 min</div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <span className="material-icons text-sm">close</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-neutral-500 border-t">
                          Drag content here or click the + button
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Saved Lesson Plans</h4>
            <Badge>{lessonPlans.length} plans</Badge>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading lesson plans...</p>
            </div>
          ) : lessonPlans.length === 0 ? (
            <div className="border rounded-md p-8 bg-gray-50 text-center">
              <p className="text-gray-500 mb-2">No lesson plans found.</p>
              <p className="text-sm text-gray-400">
                Create lesson plans in the AI Content Studio Processing Center to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonPlans
                .filter(plan => selectedCourse === "" || plan.subject === selectedCourse)
                .map((plan) => (
                <div key={plan.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div>
                      <h5 className="font-medium">{plan.title}</h5>
                      <div className="text-sm text-neutral-500">
                        {plan.subject} • QAQF Level {plan.qaqfLevel} • Duration: {plan.duration} • {Array.isArray(plan.activities) ? plan.activities.length : 0} activities
                      </div>
                    </div>
                    <div className="text-sm text-neutral-500">
                      Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Learning Objectives:</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(plan.learningObjectives) && plan.learningObjectives.slice(0, 2).map((objective: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {objective.length > 30 ? `${objective.substring(0, 30)}...` : objective}
                        </Badge>
                      ))}
                      {Array.isArray(plan.learningObjectives) && plan.learningObjectives.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.learningObjectives.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteLessonPlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanPage;