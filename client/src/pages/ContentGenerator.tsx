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
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="create" className="flex items-center">
            <span className="material-icons text-sm mr-2">create</span>
            Create New Course
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <span className="material-icons text-sm mr-2">menu_book</span>
            Course Content
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <ContentGenerator />
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