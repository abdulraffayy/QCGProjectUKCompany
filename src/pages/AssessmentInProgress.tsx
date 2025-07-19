import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from '../components/ui/separator';
import { Label } from '../components/ui/label';
import MarkingCriteria from '../components/assessment/MarkingCriteria';
import MarkingCriteriaModule from '../components/assessment/MarkingCriteriaModule';

const AssessmentInProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assessments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseAssessments, setCourseAssessments] = useState<any[]>([]);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch assessments for selected course
  const fetchCourseAssessments = async () => {
    if (!selectedCourse) {
      setCourseAssessments([]);
      return;
    }
    try {
      const res = await fetch(`/api/lessons?courseid=${encodeURIComponent(selectedCourse)}`);
      if (!res.ok) throw new Error('Failed to fetch course assessments');
      const data = await res.json();
      setCourseAssessments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch course assessments:', err);
      setCourseAssessments([]);
    }
  };

  useEffect(() => {
    fetchCourseAssessments();
  }, [selectedCourse]);

  // Sample assessment data (fallback when no course is selected)
  const sampleAssessments = [
    {
      id: 1,
      title: "Healthcare Ethics Quiz",
      type: "quiz",
      qaqfLevel: 3,
      progress: 80,
      deadline: "June 10, 2025",
      questionsCount: 15,
      status: "in_review"
    },
    {
      id: 2,
      title: "Patient Care Assessment",
      type: "practical",
      qaqfLevel: 4,
      progress: 65,
      deadline: "June 15, 2025",
      questionsCount: 8,
      status: "draft"
    },
    {
      id: 3,
      title: "Research Methods Final Exam",
      type: "exam",
      qaqfLevel: 6,
      progress: 45,
      deadline: "June 20, 2025",
      questionsCount: 30,
      status: "draft"
    },
    {
      id: 4,
      title: "Clinical Case Analysis",
      type: "assignment",
      qaqfLevel: 5,
      progress: 90,
      deadline: "June 8, 2025",
      questionsCount: 5,
      status: "pending_approval"
    }
  ];

  // Filter and get assessments to display
  const getFilteredAssessments = () => {
    let assessments = selectedCourse ? courseAssessments : sampleAssessments;

    // Apply search filter
    if (searchTerm) {
      assessments = assessments.filter(assessment => 
        assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType && filterType !== 'all') {
      assessments = assessments.filter(assessment => assessment.type === filterType);
    }

    // Apply level filter
    if (filterLevel && filterLevel !== 'all') {
      assessments = assessments.filter(assessment => {
        const level = assessment.qaqfLevel || assessment.level;
        switch (filterLevel) {
          case '1-3':
            return level >= 1 && level <= 3;
          case '4-6':
            return level >= 4 && level <= 6;
          case '7-9':
            return level >= 7 && level <= 9;
          default:
            return true;
        }
      });
    }

    return assessments;
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">Assessment in Progress</h1>
        <p className="text-neutral-600">Create, manage, and track assessments throughout the development process</p>
      </div>

      <Tabs defaultValue="assessments" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 text-xs md:text-sm">
          <TabsTrigger value="assessments" className="flex items-center">
            <span className="material-icons text-sm mr-2">quiz</span>
            Assessments
          </TabsTrigger>
          <TabsTrigger value="marking-criteria" className="flex items-center">
            <span className="material-icons text-sm mr-2">checklist</span>
            Marking Criteria
          </TabsTrigger>
          <TabsTrigger value="quality-assurance" className="flex items-center">
            <span className="material-icons text-sm mr-2">verified</span>
            Quality Assurance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessments">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <span className="material-icons text-sm">search</span>
                  </span>
                  <Input 
                    type="text" 
                    placeholder="Search assessments" 
                    className="pl-10 w-full md:w-80" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>  
                <div className="flex flex-wrap gap-3"> 
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assessment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="QAQF Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="1-3">Basic (1-3)</SelectItem>
                      <SelectItem value="4-6">Intermediate (4-6)</SelectItem>
                      <SelectItem value="7-9">Advanced (7-9)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="default">
                    <span className="material-icons text-sm mr-2">filter_list</span>
                    More Filters
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {selectedCourse ? 'Course Assessments' : 'In-Progress Assessments'}
                  {getFilteredAssessments().length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({getFilteredAssessments().length} items)
                    </span>
                  )}
                </h3>
                <Button>
                  <span className="material-icons text-sm mr-2">add</span>
                  Add Assessment
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredAssessments().length > 0 ? (
                  getFilteredAssessments().map((assessment) => (
                    <Card key={assessment.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{assessment.title}</CardTitle>
                          <Badge 
                            className={
                              assessment.status === 'draft' ? "bg-amber-100 text-amber-800" : 
                              assessment.status === 'in_review' ? "bg-blue-100 text-blue-800" : 
                              "bg-purple-100 text-purple-800"
                            }
                          >
                            {assessment.status === 'draft' ? "Draft" : 
                             assessment.status === 'in_review' ? "In Review" : 
                             "Pending Approval"}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <span className="capitalize">{assessment.type}</span>
                          <span className="text-xs">•</span>
                          <span>{assessment.questionsCount || 'N/A'} questions</span>
                          <span className="text-xs">•</span>
                          <Badge className={(assessment.qaqfLevel || assessment.level) <= 3 ? "bg-blue-100 text-blue-800" : 
                                          (assessment.qaqfLevel || assessment.level) <= 6 ? "bg-purple-100 text-purple-800" : 
                                          "bg-violet-100 text-violet-800"}>
                            QAQF {assessment.qaqfLevel || assessment.level || 'N/A'}
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Progress:</span>
                            <span className="font-medium">{assessment.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                (assessment.progress || 0) < 40 ? "bg-amber-500" : 
                                (assessment.progress || 0) < 80 ? "bg-blue-500" : 
                                "bg-green-500"
                              }`} 
                              style={{ width: `${assessment.progress || 0}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-neutral-600 mt-2">
                            {assessment.deadline ? `Deadline: ${assessment.deadline}` : 'No deadline set'}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button variant="outline" size="sm">
                          <span className="material-icons text-sm mr-1">edit</span>
                          Continue
                        </Button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="material-icons text-sm">preview</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                            <span className="material-icons text-sm">delete</span>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <span className="material-icons text-4xl">quiz</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {selectedCourse ? 'No assessments found for this course' : 'No assessments found'}
                    </h3>
                    <p className="text-gray-500">
                      {selectedCourse 
                        ? 'This course doesn\'t have any assessments yet.' 
                        : 'Create your first assessment to get started.'}
                    </p>
                  </div>
                )}
              </div>
              
              <Separator className="my-8" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Assessment Templates</h3>
                <Button variant="outline">
                  <span className="material-icons text-sm mr-2">add</span>
                  Create Template
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 1,
                    name: "Multiple Choice Quiz",
                    icon: "quiz",
                    description: "Standard multiple choice format with 10-15 questions",
                    usageCount: 12
                  },
                  {
                    id: 2,
                    name: "Clinical Case Analysis",
                    icon: "medical_information",
                    description: "Patient case study with analysis questions and rubric",
                    usageCount: 8
                  },
                  {
                    id: 3,
                    name: "Research Critique",
                    icon: "grading",
                    description: "Framework for evaluating research papers with guidelines",
                    usageCount: 6
                  }
                ].map((template) => (
                  <div key={template.id} className="border rounded-md p-4 hover:border-primary hover:shadow-sm transition-all">
                    <div className="flex items-center mb-2">
                      <span className={`material-icons text-primary mr-2`}>{template.icon}</span>
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-neutral-700 mb-4">
                      <span>Used {template.usageCount} times</span>
                    </div>
                    <Button size="sm" className="w-full">Use Template</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="marking-criteria">
          <MarkingCriteria />
        </TabsContent>
        
        <TabsContent value="quality-assurance">
          <MarkingCriteriaModule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentInProgressPage;