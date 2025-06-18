import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import MarkingCriteria from '@/components/assessment/MarkingCriteria';
import MarkingCriteriaModule from '@/components/assessment/MarkingCriteriaModule';

const AssessmentInProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assessments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

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
                <h3 className="text-lg font-semibold">In-Progress Assessments</h3>
                <Button>
                  <span className="material-icons text-sm mr-2">add</span>
                  New Assessment
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
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
                ].map((assessment) => (
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
                        <span>{assessment.questionsCount} questions</span>
                        <span className="text-xs">•</span>
                        <Badge className={assessment.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                        assessment.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                        "bg-violet-100 text-violet-800"}>
                          QAQF {assessment.qaqfLevel}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Progress:</span>
                          <span className="font-medium">{assessment.progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              assessment.progress < 40 ? "bg-amber-500" : 
                              assessment.progress < 80 ? "bg-blue-500" : 
                              "bg-green-500"
                            }`} 
                            style={{ width: `${assessment.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-neutral-600 mt-2">
                          Deadline: {assessment.deadline}
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
                ))}
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
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Marking Criteria Management</h3>
              <p className="text-neutral-600 mb-6">
                Define and manage marking criteria for your assessments aligned with QAQF framework.
              </p>
              
              <MarkingCriteria 
                contentType="Nursing Assessment"
                subject="Healthcare Ethics"
                qaqfLevel={4}
              />
              <Separator className="my-8" />
              <MarkingCriteriaModule 
                contentType="Clinical Module"
                subject="Patient Care Standards"
                qaqfLevel={5}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="quality-assurance">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Quality Assurance Process</h3>
              <p className="text-neutral-600 mb-6">
                Monitor and verify the quality of assessments against QAQF framework standards.
              </p>
              
              <div className="border rounded-md p-5 bg-white mb-6">
                <div className="flex items-start mb-4">
                  <span className="material-icons text-primary text-2xl mr-3">model_training</span>
                  <div>
                    <h4 className="font-medium text-lg mb-1">Automated QA Validation</h4>
                    <p className="text-neutral-600">
                      Automatically analyze assessments against QAQF standards, identifying areas for improvement and validating alignment.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">Assessments Queued for QA:</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm">5 Pending</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 1, name: "Healthcare Ethics Quiz", status: "queued", qaqfLevel: 3 },
                      { id: 2, name: "Patient Care Assessment", status: "in_progress", qaqfLevel: 4 },
                      { id: 3, name: "Research Methods Final", status: "failed", qaqfLevel: 6 }
                    ].map(assessment => (
                      <div key={assessment.id} className="border rounded p-3 bg-neutral-50">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-sm">{assessment.name}</span>
                          <Badge 
                            className={
                              assessment.status === 'queued' ? "bg-blue-100 text-blue-800" : 
                              assessment.status === 'in_progress' ? "bg-amber-100 text-amber-800" : 
                              assessment.status === 'failed' ? "bg-red-100 text-red-800" : 
                              "bg-green-100 text-green-800"
                            }
                          >
                            {assessment.status === 'queued' ? "Queued" : 
                             assessment.status === 'in_progress' ? "In Progress" : 
                             assessment.status === 'failed' ? "Failed" : 
                             "Passed"}
                          </Badge>
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center justify-between">
                          <span>QAQF Level {assessment.qaqfLevel}</span>
                          <Button variant="ghost" size="sm" className="h-6 p-0 px-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button>
                  <span className="material-icons text-sm mr-2">play_arrow</span>
                  Run QA Process
                </Button>
              </div>
              
              <div className="border rounded-md p-5 bg-white">
                <div className="flex items-start mb-4">
                  <span className="material-icons text-primary text-2xl mr-3">people</span>
                  <div>
                    <h4 className="font-medium text-lg mb-1">Peer Review Process</h4>
                    <p className="text-neutral-600">
                      Facilitate peer reviews of assessments, collecting feedback and promoting collaborative quality improvement.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Active Review Requests:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">2 Active</span>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { 
                        id: 1, 
                        assessment: "Clinical Case Analysis", 
                        requestedBy: "Dr. Sarah Johnson", 
                        deadline: "June 5, 2025",
                        reviewers: ["Prof. Thomas Lee", "Dr. Maria Garcia"],
                        completed: 1
                      },
                      { 
                        id: 2, 
                        assessment: "Nursing Competency Exam", 
                        requestedBy: "Prof. Robert Chen", 
                        deadline: "June 12, 2025",
                        reviewers: ["Dr. Sarah Johnson", "Dr. James Wilson", "Prof. Thomas Lee"],
                        completed: 2
                      }
                    ].map(review => (
                      <div key={review.id} className="border rounded-md p-4">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium">{review.assessment}</h5>
                          <Badge className="bg-blue-100 text-blue-800">
                            {review.completed}/{review.reviewers.length} Complete
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          <div className="text-sm">
                            <span className="text-neutral-600">Requested by:</span>{" "}
                            <span>{review.requestedBy}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-neutral-600">Deadline:</span>{" "}
                            <span>{review.deadline}</span>
                          </div>
                        </div>
                        <div className="text-sm mb-3">
                          <div className="text-neutral-600 mb-1">Reviewers:</div>
                          <div className="flex flex-wrap gap-1">
                            {review.reviewers.map((reviewer, index) => (
                              <Badge key={index} variant="outline" className="bg-neutral-50">
                                {reviewer}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button size="sm">Add Reviewer</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button>
                  <span className="material-icons text-sm mr-2">add_comment</span>
                  New Review Request
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentInProgressPage;