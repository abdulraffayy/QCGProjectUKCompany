import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from '../components/ui/separator';
import { Label } from '../components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay } from '../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../components/ui/dialog';
import MarkingCriteria from '../components/assessment/MarkingCriteria';
import MarkingCriteriaModule from '../components/assessment/MarkingCriteriaModule';
import JoditEditor from 'jodit-react';

const AssessmentInProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assessments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseAssessments, setCourseAssessments] = useState<any[]>([]);
  
  // State for assessment components
  const [selectedContentType, setSelectedContentType] = useState<string>('assessment');
  const [selectedSubject, setSelectedSubject] = useState<string>('General');
  const [selectedQaqfLevel, setSelectedQaqfLevel] = useState<number>(3);

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null);

  // State for Add Lesson dialog
  const [addLessonDialogOpen, setAddLessonDialogOpen] = useState(false);
  const [newLessonForm, setNewLessonForm] = useState({
    title: "",
    type: "lecture",
    duration: "",
    qaqfLevel: 1,
    description: "",
    courseid: "",
    userid: "",
  });

  // State for Edit Lesson dialog
  const [editLessonDialogOpen, setEditLessonDialogOpen] = useState(false);
  const [editLessonForm, setEditLessonForm] = useState({
    id: null as number | null,
    title: "",
    type: "lecture",
    duration: "",
    qaqfLevel: 1,
    description: "",
    courseid: "",
    userid: "",
  });

  // State for Preview dialog
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewAssessment, setPreviewAssessment] = useState<any>(null);

  // State for AI Generate inputs
  const [aiQuery, setAiQuery] = useState("");
  const [aiReference, setAiReference] = useState("");
  const [isAIGenerating, setIsAIGenerating] = useState(false);

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

  // Delete assessment function
  const handleDeleteAssessment = async (assessmentId: number) => {
    try {
      const response = await fetch(`/api/lessons/${assessmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete assessment');
      
      // Refresh the assessments list
      await fetchCourseAssessments();
      
      // Close the dialog
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    } catch (error) {
      console.error('Error deleting assessment:', error);
      // You might want to show a toast notification here
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (assessment: any) => {
    setAssessmentToDelete(assessment);
    setDeleteDialogOpen(true);
  };

  // Handle adding new lesson
  const handleAddLesson = async () => {
    try {
      const payload = {
        ...newLessonForm,
        courseid: selectedCourse,
        userid: "1", // You might want to get this from user context
      };

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to add lesson');

      // Refresh the assessments list
      await fetchCourseAssessments();
      
      // Reset form and close dialog
      setNewLessonForm({
        title: "",
        type: "lecture",
        duration: "",
        qaqfLevel: 1,
        description: "",
        courseid: "",
        userid: "",
      });
      setAddLessonDialogOpen(false);
    } catch (error) {
      console.error('Error adding lesson:', error);
      // You might want to show a toast notification here
    }
  };

  // Handle editing lesson
  const handleEditLesson = async () => {
    if (!editLessonForm.id) return;
    
    try {
      const payload = {
        courseid: selectedCourse,
        title: editLessonForm.title,
        level: editLessonForm.qaqfLevel, // Convert qaqfLevel to level for API
        description: editLessonForm.description,
        userid: "1", // You might want to get this from user context
        duration: editLessonForm.duration,
        type: editLessonForm.type,
      };

      const response = await fetch(`/api/lessons/${editLessonForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update lesson');

      // Refresh the assessments list
      await fetchCourseAssessments();
      
      // Reset form and close dialog
      setEditLessonForm({
        id: null,
        title: "",
        type: "lecture",
        duration: "",
        qaqfLevel: 1,
        description: "",
        courseid: "",
        userid: "",
      });
      setEditLessonDialogOpen(false);
    } catch (error) {
      console.error('Error updating lesson:', error);
      // You might want to show a toast notification here
    }
  };

  // Open edit dialog
  const openEditDialog = (assessment: any) => {
    setEditLessonForm({
      id: assessment.id,
      title: assessment.title || "",
      type: assessment.type || "lecture",
      duration: assessment.duration || "",
      qaqfLevel: assessment.qaqfLevel || assessment.level || 1,
      description: assessment.description || "",
      courseid: assessment.courseid || "",
      userid: assessment.userid || "",
    });
    setEditLessonDialogOpen(true);
  };

  // Open preview dialog
  const openPreviewDialog = (assessment: any) => {
    setPreviewAssessment(assessment);
    setPreviewDialogOpen(true);
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
    },
    {
      id: 5,
      title: "Basic Anatomy Quiz",
      type: "quiz",
      qaqfLevel: 1,
      progress: 95,
      deadline: "June 5, 2025",
      questionsCount: 10,
      status: "in_review"
    },
    {
      id: 6,
      title: "Advanced Surgical Techniques",
      type: "practical",
      qaqfLevel: 8,
      progress: 30,
      deadline: "June 25, 2025",
      questionsCount: 12,
      status: "draft"
    },
    {
      id: 7,
      title: "Medical Research Thesis",
      type: "assignment",
      qaqfLevel: 9,
      progress: 20,
      deadline: "July 1, 2025",
      questionsCount: 1,
      status: "draft"
    },
    {
      id: 8,
      title: "Intermediate Pharmacology",
      type: "exam",
      qaqfLevel: 2,
      progress: 75,
      deadline: "June 12, 2025",
      questionsCount: 25,
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

  const handleAIGenerate = async () => {
    setIsAIGenerating(true);
    // Set loading message in editor
    setEditLessonForm(f => ({ ...f, description: "Generating content..." }));
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User token is missing!');
        return;
      }

      // You need to collect these values from your form or state
      const generation_type = editLessonForm.type || "quiz";
      const material = aiReference || ""; // or another field if you have it
      const qaqf_level = String(editLessonForm.qaqfLevel || "1");
      const subject = editLessonForm.title || ""; // or another field if you have it
      const userquery = aiQuery || "";

      const response = await fetch('/api/ai/assessment-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          generation_type,
          material,
          qaqf_level,
          subject,
          userquery,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');
      const data = await response.json();

      // The backend returns { generated_content: [ ... ], status: "success" }
      if (data.generated_content && data.generated_content.length > 0) {
        setEditLessonForm(f => ({ ...f, description: data.generated_content[0] }));
      } else {
        setEditLessonForm(f => ({ ...f, description: "No content generated." }));
      }
    } catch (error) {
      console.error('AI Generate error:', error);
      setEditLessonForm(f => ({ ...f, description: "AI generation failed." }));
    } finally {
      setIsAIGenerating(false);
    }
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
                    <SelectTrigger className="w-40 focus:ring-0 focus:ring-offset-0">
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
                    <SelectTrigger className="w-40 focus:ring-0 focus:ring-offset-0">
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
                    <SelectTrigger className="w-40 focus:ring-0 focus:ring-offset-0">
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
                {/* Removed Add Lesson Button */}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredAssessments().length > 0 ? (
                  getFilteredAssessments().map((assessment) => (
                    <Card key={assessment.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{assessment.title}</CardTitle>
                          {/* Place the course dropdown here */}
                          <Select
                
              >
                <SelectTrigger className="w-32 border border-neutral-300 focus:ring-0 focus:border-neutral-300">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
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
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(assessment)}>
                          <span className="material-icons text-sm mr-1">edit</span>
                          Continue
                        </Button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openPreviewDialog(assessment)}>
                            <span className="material-icons text-sm">preview</span>
                          </Button>
                          {/* Removed Delete Button */}
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
          <MarkingCriteria 
            contentType={selectedContentType}
            subject={selectedSubject}
            qaqfLevel={selectedQaqfLevel}
          />
        </TabsContent>
        
        <TabsContent value="quality-assurance">
          <MarkingCriteriaModule 
            contentType={selectedContentType}
            subject={selectedSubject}
            qaqfLevel={selectedQaqfLevel}
          />
        </TabsContent>
      </Tabs>

      {/* Removed Add Lesson Dialog */}

      {/* Edit Lesson Dialog */}
      <Dialog open={editLessonDialogOpen} onOpenChange={setEditLessonDialogOpen}>
        <DialogContent className="max-w-full w-full h-full">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Type input */}
            <select
              className="border rounded px-2 py-1 w-full h-10"
              value={editLessonForm.type}
              onChange={e => setEditLessonForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="practical">Practical</option>
              <option value="case_study">Case Study</option>
            </select>
            {/* Title input */}
            <input
              className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
              value={editLessonForm.title}
              onChange={e => setEditLessonForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title"
            />
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1 focus:outline-none focus:ring-0 focus:border-gray-300"
                value={editLessonForm.duration}
                onChange={e => setEditLessonForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="Duration (e.g. 60 min)"
              />
              <select
                className="border rounded px-2 py-1 flex-1 focus:outline-none focus:ring-0 focus:border-gray-300"
                value={editLessonForm.qaqfLevel}
                onChange={e => setEditLessonForm(f => ({ ...f, qaqfLevel: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                  <option key={lvl} value={lvl}>QAQF {lvl}</option>
                ))}
              </select>
            </div>
            {/* New AI Query and Reference Inputs */}
            <input
              className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
              placeholder="Ask your query"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-0 focus:border-gray-200"
              placeholder="AI reference study material"
              value={aiReference}
              onChange={e => setAiReference(e.target.value)}
            />
            <JoditEditor
              value={editLessonForm.description}
              config={{ readonly: false, height: 600, width: '100%' }}
              tabIndex={1}
              onBlur={newContent => setEditLessonForm(f => ({ ...f, description: newContent }))}
              onChange={() => { }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditLesson}>Save</Button>
            <Button variant="default" onClick={handleAIGenerate} disabled={isAIGenerating}>
              {isAIGenerating ? "Generating..." : "AI Generate"}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Preview</DialogTitle>
          </DialogHeader>
          {previewAssessment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{previewAssessment.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{previewAssessment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">QAQF Level:</span>
                      <span>Level {previewAssessment.qaqfLevel || previewAssessment.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span>{previewAssessment.progress || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge 
                        className={
                          previewAssessment.status === 'draft' ? "bg-amber-100 text-amber-800" : 
                          previewAssessment.status === 'in_review' ? "bg-blue-100 text-blue-800" : 
                          "bg-purple-100 text-purple-800"
                        }
                      >
                        {previewAssessment.status === 'draft' ? "Draft" : 
                         previewAssessment.status === 'in_review' ? "In Review" : 
                         "Pending Approval"}
                      </Badge>
                    </div>
                    {previewAssessment.deadline && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span>{previewAssessment.deadline}</span>
                      </div>
                    )}
                    {previewAssessment.questionsCount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions:</span>
                        <span>{previewAssessment.questionsCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Progress</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`h-2.5 rounded-full ${
                        (previewAssessment.progress || 0) < 40 ? "bg-amber-500" : 
                        (previewAssessment.progress || 0) < 80 ? "bg-blue-500" : 
                        "bg-green-500"
                      }`} 
                      style={{ width: `${previewAssessment.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {previewAssessment.progress || 0}% complete
                  </p>
                </div>
              </div>
              
              {previewAssessment.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: previewAssessment.description }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removed Delete Confirmation Dialog */}
    </div>
  );
};

export default AssessmentInProgressPage;