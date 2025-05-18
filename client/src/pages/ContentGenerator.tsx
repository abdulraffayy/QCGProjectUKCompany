import React, { useState } from 'react';
import ContentGenerator from '@/components/content/ContentGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BatchProcessingPanel from '@/components/content/BatchProcessingPanel';
import CourseWorkflowView from '@/components/content/CourseWorkflowView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ContentGeneratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

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
                <div className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all">
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
                  <Button size="sm" className="w-full">Generate Lesson Plan</Button>
                </div>
                
                <div className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all">
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
                  <Button size="sm" className="w-full">Create Study Materials</Button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-3 mt-8">Template Modules</h3>
              <p className="text-neutral-600 mb-4">
                Apply specialized templates to create additional modules for your courses.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "Assessment Module",
                    icon: "quiz",
                    description: "Comprehensive assessment pack with various question types",
                    level: 4
                  },
                  {
                    name: "Interactive Activities",
                    icon: "extension",
                    description: "Engaging activities for hands-on application of concepts",
                    level: 5
                  },
                  {
                    name: "Discussion Guide",
                    icon: "forum",
                    description: "Thought-provoking discussion topics with facilitation guides",
                    level: 6
                  },
                  {
                    name: "Research Project",
                    icon: "lightbulb",
                    description: "Structured research project with methodology guide",
                    level: 7
                  },
                  {
                    name: "Case Studies",
                    icon: "psychology",
                    description: "Detailed case studies with analysis frameworks",
                    level: 5
                  },
                  {
                    name: "Revision Materials",
                    icon: "history_edu",
                    description: "Comprehensive revision materials and practice tests",
                    level: 3
                  }
                ].map((template, index) => (
                  <div key={index} className="border rounded-md p-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="material-icons text-primary mr-2">{template.icon}</span>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                      </div>
                      <Badge className={template.level <= 3 ? "bg-blue-100 text-blue-800" : 
                                        template.level <= 6 ? "bg-purple-100 text-purple-800" : 
                                        "bg-violet-100 text-violet-800"}>
                        QAQF {template.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600 mb-3">
                      {template.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Generate Module
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Recently Created Modules</h3>
              <p className="text-neutral-600 mb-4">
                View and manage your recently created modules.
              </p>
              
              <div className="text-center py-10 border rounded-md bg-neutral-50">
                <span className="material-icons text-4xl text-neutral-400 mb-2">folder_open</span>
                <h4 className="text-lg font-medium text-neutral-600 mb-1">No modules created yet</h4>
                <p className="text-sm text-neutral-500 mb-4">Generate your first module using the templates above</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="space-y-6">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Course Templates</h3>
              <p className="text-neutral-600 mb-4">
                Start with pre-defined templates to create robust course content. Select a template to use with your existing courses.
              </p>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Foundation Module",
                      description: "Basic introduction to core concepts and principles",
                      qaqfLevel: 2,
                      icon: "school"
                    },
                    {
                      name: "Advanced Topic",
                      description: "In-depth analysis of specialized concepts",
                      qaqfLevel: 7,
                      icon: "psychology"
                    },
                    {
                      name: "Assessment Pack",
                      description: "Comprehensive set of assessments and tests",
                      qaqfLevel: 4,
                      icon: "quiz"
                    },
                    {
                      name: "Learning Journey",
                      description: "Progressive learning path with staged outcomes",
                      qaqfLevel: 3,
                      icon: "timeline"
                    },
                    {
                      name: "Workshop Materials",
                      description: "Interactive materials for hands-on learning",
                      qaqfLevel: 5,
                      icon: "build"
                    },
                    {
                      name: "Extension Activities",
                      description: "Additional activities to deepen understanding",
                      qaqfLevel: 6,
                      icon: "extension"
                    }
                  ].map((template) => (
                    <div key={template.name} className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`material-icons text-primary`}>{template.icon}</span>
                          <h4 className="font-medium">{template.name}</h4>
                        </div>
                        <Badge className={template.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                          template.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                          "bg-violet-100 text-violet-800"}>
                          QAQF {template.qaqfLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600 mb-4">{template.description}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setPreviewTemplate(template);
                            setShowPreview(true);
                          }}
                        >
                          <span className="material-icons text-sm mr-1">visibility</span>
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            toast({
                              title: `Template Selected: ${template.name}`,
                              description: `Adding ${template.name} to your content library`,
                            });
                            setTimeout(() => {
                              setActiveTab("create");
                            }, 500);
                          }}
                        >
                          <span className="material-icons text-sm mr-1">add</span>
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Course Content Library</h3>
              <p className="text-neutral-600 mb-4">
                View and manage your course content. Select a course to view its details, verify, export, or edit.
              </p>
              <CourseWorkflowView 
                showLatest={true}
                limit={3}
                showWorkflowButtons={true}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[600px]">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="material-icons">{previewTemplate.icon}</span>
                  {previewTemplate.name} Template
                </DialogTitle>
                <DialogDescription>
                  Preview of the {previewTemplate.name} template for QAQF Level {previewTemplate.qaqfLevel}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Template Details</h3>
                  <Badge className={previewTemplate.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                  previewTemplate.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                  "bg-violet-100 text-violet-800"}>
                    QAQF Level {previewTemplate.qaqfLevel}
                  </Badge>
                </div>
                
                <div className="border rounded-md p-4 bg-neutral-50">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-neutral-700">{previewTemplate.description}</p>
                </div>
                
                <div className="border rounded-md p-4 bg-neutral-50">
                  <h4 className="font-medium mb-2">Template Structure</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-primary">check_circle</span>
                      <div>
                        <p className="font-medium">Learning Objectives</p>
                        <p className="text-neutral-600">Clear objectives aligned with QAQF Level {previewTemplate.qaqfLevel} requirements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-primary">check_circle</span>
                      <div>
                        <p className="font-medium">Content Framework</p>
                        <p className="text-neutral-600">Pre-structured content sections with appropriate complexity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-primary">check_circle</span>
                      <div>
                        <p className="font-medium">Assessment Types</p>
                        <p className="text-neutral-600">Integrated assessments matching the QAQF level</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-primary">check_circle</span>
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
                      <TabsTrigger value="assessment">Assessment</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="bg-white p-3 border rounded-md">
                      <h5 className="text-sm font-semibold mb-2">{previewTemplate.name}: Introduction</h5>
                      <div className="text-sm text-neutral-700 space-y-2">
                        <p>This module introduces students to the core concepts of {previewTemplate.name.toLowerCase()} at QAQF Level {previewTemplate.qaqfLevel}. The content is structured to provide a comprehensive understanding of the subject matter while adhering to academic standards.</p>
                        <p>The content follows a logical progression, starting with foundational concepts and building toward more complex applications. Each section includes relevant examples and case studies to illustrate key points.</p>
                        {previewTemplate.qaqfLevel > 5 && (
                          <p>Advanced theoretical frameworks are integrated throughout, with emphasis on critical analysis and evaluation of competing perspectives. Students will engage with current research and develop sophisticated understanding of the field.</p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="learning" className="bg-white p-3 border rounded-md">
                      <h5 className="text-sm font-semibold mb-2">Learning Objectives</h5>
                      <ul className="text-sm text-neutral-700 space-y-1 list-disc pl-5">
                        <li>Understand the core principles and concepts of {previewTemplate.name.toLowerCase()}</li>
                        <li>Analyze and interpret key frameworks within the subject area</li>
                        {previewTemplate.qaqfLevel <= 3 ? (
                          <>
                            <li>Identify and describe foundational elements of the discipline</li>
                            <li>Apply basic concepts to simple scenarios</li>
                          </>
                        ) : previewTemplate.qaqfLevel <= 6 ? (
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
                    
                    <TabsContent value="assessment" className="bg-white p-3 border rounded-md">
                      <h5 className="text-sm font-semibold mb-2">Assessment Structure</h5>
                      <div className="text-sm text-neutral-700 space-y-3">
                        {previewTemplate.qaqfLevel <= 3 ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">assignment</span>
                              <div>
                                <p className="font-medium">Multiple Choice Quiz (30%)</p>
                                <p className="text-xs text-neutral-500">Basic comprehension check of core concepts</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">description</span>
                              <div>
                                <p className="font-medium">Short Answer Questions (40%)</p>
                                <p className="text-xs text-neutral-500">Brief explanations of key principles</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">assignment_turned_in</span>
                              <div>
                                <p className="font-medium">Simple Application Exercise (30%)</p>
                                <p className="text-xs text-neutral-500">Apply concepts to straightforward scenarios</p>
                              </div>
                            </div>
                          </>
                        ) : previewTemplate.qaqfLevel <= 6 ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">description</span>
                              <div>
                                <p className="font-medium">Case Study Analysis (40%)</p>
                                <p className="text-xs text-neutral-500">In-depth analysis of real-world applications</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">assignment</span>
                              <div>
                                <p className="font-medium">Research Project (30%)</p>
                                <p className="text-xs text-neutral-500">Independent investigation of selected topics</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">groups</span>
                              <div>
                                <p className="font-medium">Group Presentation (30%)</p>
                                <p className="text-xs text-neutral-500">Collaborative analysis and presentation</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">psychology</span>
                              <div>
                                <p className="font-medium">Critical Analysis Paper (40%)</p>
                                <p className="text-xs text-neutral-500">Advanced theoretical evaluation</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">science</span>
                              <div>
                                <p className="font-medium">Research Project (40%)</p>
                                <p className="text-xs text-neutral-500">Original research with methodological rigor</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-primary text-sm">military_tech</span>
                              <div>
                                <p className="font-medium">Advanced Problem Solving (20%)</p>
                                <p className="text-xs text-neutral-500">Complex scenarios requiring innovative solutions</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowPreview(false);
                  toast({
                    title: `Template Selected: ${previewTemplate.name}`,
                    description: `Starting with QAQF Level ${previewTemplate.qaqfLevel} template`,
                  });
                  setTimeout(() => {
                    setActiveTab("create");
                  }, 500);
                }}>
                  Use This Template
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentGeneratorPage;