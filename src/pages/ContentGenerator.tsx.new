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
        
        <TabsContent value="approval">
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
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="module">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Module Management</h3>
              <p className="text-neutral-600 mb-6">
                Access and manage different aspects of your course modules. Each section manages a specific part of the module creation and development process.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Module Details Card */}
                <div className="border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="material-icons text-primary mr-2">info</span>
                      <h4 className="font-medium">Module Details</h4>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Generated</Badge>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-4">
                    View and manage details about module structure, educational context, and organization.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Educational contexts and prerequisites
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Module content structure
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Generated from Course Content Approval
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={() => window.location.href = '/my-content'}>
                    <span className="material-icons text-sm mr-2">visibility</span>
                    View Module Details
                  </Button>
                </div>
                
                {/* Module Generator Card */}
                <div className="border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all">
                  <div className="flex items-center mb-4">
                    <span className="material-icons text-primary mr-2">build</span>
                    <h4 className="font-medium">Module Generator</h4>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-4">
                    Generate lesson plans and study materials based on your courses and approved content.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Lesson plan generation
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Study materials creation
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Auto-integration with other pages
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="w-full" onClick={() => window.location.href = '/lesson-plan'}>
                      <span className="material-icons text-sm mr-2">school</span>
                      Lesson Plans
                    </Button>
                    <Button size="sm" className="w-full" onClick={() => window.location.href = '/study-material'}>
                      <span className="material-icons text-sm mr-2">menu_book</span>
                      Study Materials
                    </Button>
                  </div>
                </div>
                
                {/* Module Templates Card */}
                <div className="border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all">
                  <div className="flex items-center mb-4">
                    <span className="material-icons text-primary mr-2">dashboard</span>
                    <h4 className="font-medium">Module Templates</h4>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-4">
                    Apply specialized templates to create additional modules for your courses.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Nursing and healthcare templates
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Business and management templates
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <span className="material-icons text-green-600 text-sm mr-2">check_circle</span>
                      Educational and technological templates
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <span className="material-icons text-sm mr-2">view_module</span>
                        Browse Templates
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Module Templates</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <p className="text-neutral-600 mb-4">
                          Apply specialized templates to create additional modules for your courses.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all">
                            <h5 className="font-medium mb-2 flex items-center">
                              Nursing Template
                              <Badge className="bg-purple-100 text-purple-800 ml-2">QAQF 5</Badge>
                            </h5>
                            <p className="text-sm text-neutral-600 mb-3">
                              Healthcare curriculum template with clinical focus
                            </p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">Healthcare</span>
                              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">Clinical</span>
                              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">Nursing</span>
                            </div>
                            <Button size="sm" className="w-full">Use Template</Button>
                          </div>
                          
                          <div className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all">
                            <h5 className="font-medium mb-2 flex items-center">
                              Business Ethics
                              <Badge className="bg-purple-100 text-purple-800 ml-2">QAQF 6</Badge>
                            </h5>
                            <p className="text-sm text-neutral-600 mb-3">
                              Designed for business management and ethics courses
                            </p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">Business</span>
                              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">Ethics</span>
                              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">Management</span>
                            </div>
                            <Button size="sm" className="w-full">Use Template</Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Module Details Preview</h3>
                <div className="border rounded-lg p-6 bg-white mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">Module Details</h4>
                    <div className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 mr-2">Generated</Badge>
                      <span className="text-sm text-neutral-500">
                        from Course Content Approval
                      </span>
                    </div>
                  </div>
                  
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
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {showPreview && previewTemplate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
              <DialogDescription>
                QAQF Level {previewTemplate.level} template for {previewTemplate.description.toLowerCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {previewTemplate.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-neutral-50">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="border rounded-md p-4 bg-neutral-50 mb-4">
                <h4 className="font-medium mb-2">Template Structure</h4>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1 pl-2">
                  {previewTemplate.structure && previewTemplate.structure.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="border rounded-md p-4 bg-neutral-50 mb-4">
                <h4 className="font-medium mb-2">Learning Outcomes</h4>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1 pl-2">
                  {previewTemplate.outcomes && previewTemplate.outcomes.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button>
                  Use Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentGeneratorPage;