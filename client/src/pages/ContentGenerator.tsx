import React, { useState } from 'react';
import ContentGenerator from '@/components/content/ContentGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseWorkflowView from '@/components/content/CourseWorkflowView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ContentGeneratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  
  // Event listener to switch tabs when content is created
  React.useEffect(() => {
    const handleSwitchTab = () => {
      setActiveTab("recent");
    };
    
    window.addEventListener("switchToContentTab", handleSwitchTab);
    
    return () => {
      window.removeEventListener("switchToContentTab", handleSwitchTab);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Course Generator</h2>
          <p className="text-neutral-600 mt-1">Create academic course content aligned with QAQF framework</p>
        </div>
      </div>

      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 text-xs md:text-sm">
          <TabsTrigger value="create" className="flex items-center">
            <span className="material-icons text-sm mr-2">create</span>
            Create New Course
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <span className="material-icons text-sm mr-2">auto_stories</span>
            Course Content
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center">
            <span className="material-icons text-sm mr-2">check_circle</span>
            Course Content Approval
          </TabsTrigger>
          <TabsTrigger value="module" className="flex items-center">
            <span className="material-icons text-sm mr-2">menu_book</span>
            Module
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <ContentGenerator />
        </TabsContent>

        <TabsContent value="recent">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Module/Course Library</h3>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                      <span className="material-icons text-sm">search</span>
                    </span>
                    <input 
                      type="text" 
                      placeholder="Search content by title, module code, or keywords" 
                      className="w-full border rounded-md pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" 
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="lecture">Lectures</SelectItem>
                      <SelectItem value="tutorial">Tutorials</SelectItem>
                      <SelectItem value="seminar">Seminars</SelectItem>
                      <SelectItem value="practical">Practicals</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all_levels">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="QAQF Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_levels">All Levels</SelectItem>
                      <SelectItem value="basic">Basic (1-3)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (4-6)</SelectItem>
                      <SelectItem value="advanced">Advanced (7-9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Tabs defaultValue="content" className="mb-6">
                <TabsList>
                  <TabsTrigger value="content">Module List</TabsTrigger>
                  <TabsTrigger value="verify">Module Approval</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="pt-4">
                  <div className="overflow-auto">
                    <CourseWorkflowView showWorkflowButtons={false} limit={10} />
                  </div>
                </TabsContent>
                
                <TabsContent value="verify" className="pt-4">
                  <div className="space-y-6">
                    <div className="border rounded-md p-4 bg-neutral-50 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-icons text-blue-500">info</span>
                        <p className="text-sm font-medium">Module approval ensures academic quality and standards</p>
                      </div>
                      <p className="text-sm text-neutral-600">
                        The approval process analyzes modules to ensure they meet QAQF framework standards and aligns with 
                        educational best practices. Select a module from below to verify against these standards.
                      </p>
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
                        <span className="material-icons text-amber-600 text-sm mt-0.5">priority_high</span>
                        <p className="text-sm text-amber-800">
                          <strong>Important:</strong> Modules must be approved before they can be sent to Content Approval. 
                          Use the "Approve Module" button first, then "Send to Content Approval" to submit the module for final review.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Select Module to Approve</h4>
                      <div className="space-y-4">
                        {[
                          {
                            id: 2,
                            title: "Nursing in work place (QAQF Level 2)",
                            qaqfLevel: 2,
                            type: "academic_paper",
                            dateCreated: "May 18, 2025",
                            status: "pending"
                          }
                        ].map((content) => (
                          <div key={content.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                              <div>
                                <h5 className="font-medium">{content.title}</h5>
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                  <span>Type: {content.type.replace('_', ' ')}</span>
                                  <span>•</span>
                                  <span>Created: {content.dateCreated}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={content.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                                content.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                                "bg-violet-100 text-violet-800"}>
                                  QAQF {content.qaqfLevel}
                                </Badge>
                                <Badge className="bg-amber-100 text-amber-800">
                                  Pending Approval
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm">
                                <span className="material-icons text-sm mr-1">visibility</span>
                                View Module
                              </Button>
                              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                                <span className="material-icons text-sm mr-1">verified</span>
                                Approve Module
                              </Button>
                              <Button variant="outline" size="sm" className="bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800">
                                <span className="material-icons text-sm mr-1">send</span>
                                Send to Content Approval
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    

                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="verify">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Content Verification</h3>
              <p className="text-neutral-600 mb-4">
                Verify course content against QAQF standards and British educational guidelines before approval.
              </p>
              
              <div className="border rounded-md p-4 bg-neutral-50 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons text-blue-500">info</span>
                  <p className="text-sm font-medium">Content verification ensures academic quality and standards</p>
                </div>
                <p className="text-sm text-neutral-600">
                  The verification process analyzes content to ensure it meets QAQF framework standards and aligns with 
                  educational best practices. Select content from below to verify against these standards.
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-3">Select Content to Verify</h4>
                <div className="space-y-4">
                  {[
                    {
                      id: 2,
                      title: "Nursing in work place (QAQF Level 2)",
                      qaqfLevel: 2,
                      type: "academic_paper",
                      dateCreated: "May 18, 2025",
                      status: "pending"
                    }
                  ].map((content) => (
                    <div key={content.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                        <div>
                          <h5 className="font-medium">{content.title}</h5>
                          <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <span>Type: {content.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>Created: {content.dateCreated}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={content.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                          content.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                          "bg-violet-100 text-violet-800"}>
                            QAQF {content.qaqfLevel}
                          </Badge>
                          <Badge className="bg-amber-100 text-amber-800">
                            Pending Verification
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <span className="material-icons text-sm mr-1">visibility</span>
                          View Content
                        </Button>
                        <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                          <span className="material-icons text-sm mr-1">verified</span>
                          Verify Content
                        </Button>
                        <Button variant="outline" size="sm" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
                          <span className="material-icons text-sm mr-1">gavel</span>
                          British Standards Check
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-3">QAQF Verification Report</h4>
                <div className="border rounded-md p-4 bg-neutral-50">
                  <p className="text-neutral-500 text-sm italic mb-4">Select a course and click "Verify Content" to generate a QAQF verification report.</p>
                  
                  <div className="space-y-4 hidden">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">Verification Summary</h5>
                      <Badge className="bg-green-100 text-green-800">PASS</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-green-600 text-sm">check_circle</span>
                        <p className="text-sm">Content aligns with QAQF Level 2 expectations</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-green-600 text-sm">check_circle</span>
                        <p className="text-sm">All required characteristics present</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-amber-600 text-sm">info</span>
                        <p className="text-sm">Consider adding examples to enhance practical application</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">British Standards Check</h4>
                <div className="border rounded-md p-4 bg-neutral-50">
                  <p className="text-neutral-500 text-sm italic mb-4">Select a course and click "British Standards Check" to verify compliance with UK educational standards.</p>
                  
                  <div className="space-y-4 hidden">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">British Standards Compliance</h5>
                      <Badge className="bg-green-100 text-green-800">COMPLIANT</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-green-600 text-sm">check_circle</span>
                        <p className="text-sm">Terminology follows British educational conventions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-green-600 text-sm">check_circle</span>
                        <p className="text-sm">Content matches UK curriculum standards</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-amber-600 text-sm">info</span>
                        <p className="text-sm">Consider updating references to include more UK-based sources</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approval">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Content Approval</h3>
              <p className="text-neutral-600 mb-4">
                Review and approve course content before it can be used for module generation. Approved content meets quality standards.
              </p>
              
              <div className="border rounded-md p-4 bg-neutral-50 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons text-amber-500">info</span>
                  <p className="text-sm font-medium">Content must be approved before it can be used in modules</p>
                </div>
                <p className="text-sm text-neutral-600">
                  The approval process ensures that all content meets QAQF standards and is suitable for use in educational modules. 
                  Select content from the list below to review and approve.
                </p>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Content Pending Approval</h4>
                <Badge className="bg-amber-100 text-amber-800">2 items pending</Badge>
              </div>
              
              <div className="space-y-4 mb-8">
                {[
                  {
                    id: 1,
                    title: "Nursing in workplace (QAQF Level 5)",
                    qaqfLevel: 5,
                    type: "lecture",
                    dateCreated: "May 15, 2025",
                    status: "pending"
                  },
                  {
                    id: 2,
                    title: "Advanced Clinical Practice",
                    qaqfLevel: 7,
                    type: "tutorial",
                    dateCreated: "May 16, 2025",
                    status: "pending"
                  }
                ].map((content) => (
                  <div key={content.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div>
                        <h5 className="font-medium">{content.title}</h5>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <span>Type: {content.type}</span>
                          <span>•</span>
                          <span>Created: {content.dateCreated}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={content.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                         content.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                         "bg-violet-100 text-violet-800"}>
                          QAQF {content.qaqfLevel}
                        </Badge>
                        <Badge className="bg-amber-100 text-amber-800">
                          Pending
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <span className="material-icons text-sm mr-1">visibility</span>
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
                        <span className="material-icons text-sm mr-1">check_circle</span>
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800">
                        <span className="material-icons text-sm mr-1">cancel</span>
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <span className="material-icons text-sm mr-1">edit_note</span>
                        Add Comments
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Approved Content</h4>
                <Badge className="bg-green-100 text-green-800">3 items approved</Badge>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    id: 3,
                    title: "Healthcare Ethics Introduction",
                    qaqfLevel: 3,
                    type: "lecture",
                    dateCreated: "May 10, 2025",
                    dateApproved: "May 12, 2025",
                    status: "approved",
                    approvedBy: "Dr. Sarah Johnson"
                  },
                  {
                    id: 4,
                    title: "Patient Assessment Techniques",
                    qaqfLevel: 4,
                    type: "practical",
                    dateCreated: "May 8, 2025",
                    dateApproved: "May 11, 2025",
                    status: "approved",
                    approvedBy: "Dr. Michael Chen"
                  },
                  {
                    id: 5,
                    title: "Research Methods in Nursing",
                    qaqfLevel: 6,
                    type: "seminar",
                    dateCreated: "May 5, 2025",
                    dateApproved: "May 7, 2025",
                    status: "approved",
                    approvedBy: "Prof. Emma Williams"
                  }
                ].map((content) => (
                  <div key={content.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div>
                        <h5 className="font-medium">{content.title}</h5>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <span>Type: {content.type}</span>
                          <span>•</span>
                          <span>Approved: {content.dateApproved}</span>
                          <span>•</span>
                          <span>By: {content.approvedBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={content.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                          content.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                          "bg-violet-100 text-violet-800"}>
                          QAQF {content.qaqfLevel}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          Approved
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <span className="material-icons text-sm mr-1">visibility</span>
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <span className="material-icons text-sm mr-1">menu_book</span>
                        Create Module
                      </Button>
                      <Button variant="outline" size="sm" className="text-amber-700 bg-amber-50 hover:bg-amber-100">
                        <span className="material-icons text-sm mr-1">history</span>
                        Revoke Approval
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="module">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Module Generator</h3>
              <p className="text-neutral-600 mb-4">
                Generate lesson plans and content modules based on your courses. Select a template to blend with your course content.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all relative">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-100 text-blue-800">Auto-Generated</Badge>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-primary mr-2">school</span>
                    <h4 className="font-medium">Lesson Plan Generator</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    Create a structured lesson plan with objectives, activities, and assessments aligned with your course content.
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Learning objectives based on QAQF level
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Structured timeline with activities
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Assessment strategies and resources
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 italic mb-2">
                    Lesson plans are automatically created and sent to the Lesson Plan page
                  </div>
                  <Button size="sm" className="w-full" onClick={() => window.location.href = '/lesson-plan'}>
                    <span className="material-icons text-sm mr-2">launch</span>
                    View in Lesson Plan
                  </Button>
                </div>
                
                <div className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all relative">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-100 text-blue-800">Auto-Generated</Badge>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-primary mr-2">menu_book</span>
                    <h4 className="font-medium">Study Materials Generator</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    Generate supplementary study materials based on course content including handouts, reading guides, and activities.
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Guided reading materials with annotations
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Practice activities with solutions
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Visual aids and concept maps
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 italic mb-2">
                    Study materials are automatically created and sent to the Study Material page
                  </div>
                  <Button size="sm" className="w-full" onClick={() => window.location.href = '/study-material'}>
                    <span className="material-icons text-sm mr-2">launch</span>
                    View in Study Material
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-3 mt-8">Module Details</h3>
              <div className="border rounded-lg p-6 bg-white mb-8">
                <div className="mb-4">
                  <h4 className="text-lg font-medium mb-2">Module Details</h4>
                  <p className="text-sm text-neutral-600 mb-4">
                    This section displays information about the course module structure and organization.
                  </p>
                  
                  <div className="border rounded-md p-4 bg-neutral-50 mb-6">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-primary mr-2">school</span>
                      <h4 className="font-medium">Educational Context</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h5 className="text-sm font-medium text-neutral-700 mb-1">Target Audience</h5>
                        <p className="text-sm text-neutral-600">
                          Higher education students, professional development
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-neutral-700 mb-1">Prerequisites</h5>
                        <p className="text-sm text-neutral-600">
                          Basic understanding of educational frameworks
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-neutral-50 mb-6">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-primary mr-2">menu_book</span>
                      <h4 className="font-medium">Content Structure</h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2 pl-2">
                      <li>Introduction to QAQF concepts and application</li>
                      <li>Core principles and characteristics exploration</li>
                      <li>Practical implementation strategies</li>
                      <li>Assessment and evaluation methods</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <span className="material-icons text-sm mr-1">school</span>
                      View Lesson Plan
                    </Button>
                    <Button size="sm">
                      <span className="material-icons text-sm mr-1">edit</span>
                      Edit Module
                    </Button>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-3 mt-8">Template Modules</h3>
              <p className="text-neutral-600 mb-4">
                Apply specialized templates to create additional modules for your courses.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "Nursing Template",
                    level: 5,
                    description: "Healthcare curriculum template with clinical focus",
                    tags: ["Healthcare", "Clinical", "Nursing"]
                  },
                  {
                    name: "Business Ethics",
                    level: 6,
                    description: "Designed for business management and ethics courses",
                    tags: ["Business", "Ethics", "Management"]
                  },
                  {
                    name: "Research Methods",
                    level: 8,
                    description: "Advanced academic research and methodology framework",
                    tags: ["Research", "Academic", "Methodology"]
                  },
                  {
                    name: "Computing Foundations",
                    level: 4,
                    description: "Computer science and programming fundamentals",
                    tags: ["Computing", "Programming", "Technology"]
                  },
                  {
                    name: "Creative Arts",
                    level: 3,
                    description: "Visual and performing arts curriculum framework",
                    tags: ["Arts", "Creative", "Design"]
                  },
                  {
                    name: "Engineering Principles",
                    level: 7,
                    description: "Advanced engineering concepts and applications",
                    tags: ["Engineering", "Technical", "Design"]
                  }
                ].map((template, index) => (
                  <div 
                    key={index} 
                    className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => {
                      setPreviewTemplate(template);
                      setShowPreview(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge className={
                        template.level <= 3 
                          ? "bg-blue-100 text-blue-800" 
                          : template.level <= 6 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-violet-100 text-violet-800"
                      }>
                        QAQF {template.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-neutral-100 px-2 py-1 rounded-full text-neutral-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <span className="material-icons text-sm mr-1">visibility</span>
                      Preview
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template preview dialog */}
      {showPreview && previewTemplate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{previewTemplate.name}</span>
                <Badge className={
                  previewTemplate.level <= 3 
                    ? "bg-blue-100 text-blue-800" 
                    : previewTemplate.level <= 6 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-violet-100 text-violet-800"
                }>
                  QAQF Level {previewTemplate.level}
                </Badge>
              </DialogTitle>
              <DialogDescription>{previewTemplate.description}</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-primary text-sm">school</span>
                  <div>
                    <p className="font-medium">Learning Approach</p>
                    <p className="text-neutral-600">Primary teaching methodology</p>
                  </div>
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-primary text-sm">schedule</span>
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-neutral-600">Recommended teaching hours</p>
                  </div>
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-primary text-sm">auto_stories</span>
                  <div>
                    <p className="font-medium">Teaching Resources</p>
                    <p className="text-neutral-600">Suggested materials and resources for delivery</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview of content generated from template */}
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Content Preview</h4>
              <Tabs defaultValue="content">
                <TabsList className="mb-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="learning">Learning Objectives</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="bg-white p-3 border rounded-md">
                  <h5 className="text-sm font-semibold mb-2">{previewTemplate.name}: Introduction</h5>
                  <div className="text-sm text-neutral-700 space-y-2">
                    <p>This module introduces students to the core concepts of {previewTemplate.name.toLowerCase()} at QAQF Level {previewTemplate.level}. The content is structured to provide a comprehensive understanding of the subject matter while adhering to academic standards.</p>
                    <p>The content follows a logical progression, starting with foundational concepts and building toward more complex applications. Each section includes relevant examples and case studies to illustrate key points.</p>
                    {previewTemplate.level > 5 && (
                      <p>Advanced theoretical frameworks are integrated throughout, with emphasis on critical analysis and evaluation of competing perspectives. Students will engage with current research and develop sophisticated understanding of the field.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="learning" className="bg-white p-3 border rounded-md">
                  <h5 className="text-sm font-semibold mb-2">Learning Objectives</h5>
                  <ul className="text-sm text-neutral-700 space-y-1 list-disc pl-5">
                    <li>Understand the core principles and concepts of {previewTemplate.name.toLowerCase()}</li>
                    <li>Analyze and interpret key frameworks within the subject area</li>
                    {previewTemplate.level <= 3 ? (
                      <>
                        <li>Identify and describe foundational elements of the discipline</li>
                        <li>Apply basic concepts to simple scenarios</li>
                      </>
                    ) : previewTemplate.level <= 6 ? (
                      <>
                        <li>Apply theoretical knowledge to practical scenarios</li>
                        <li>Develop critical thinking skills through analytical exercises</li>
                        <li>Synthesize information from multiple sources</li>
                      </>
                    ) : (
                      <>
                        <li>Evaluate competing theoretical frameworks and methodologies</li>
                        <li>Create innovative solutions to complex problems</li>
                        <li>Develop advanced research skills and methodological approaches</li>
                        <li>Critically engage with cutting-edge developments in the field</li>
                      </>
                    )}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button>
                Use Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentGeneratorPage;