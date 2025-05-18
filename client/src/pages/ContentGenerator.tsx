import React, { useState } from 'react';
import ContentGenerator from '@/components/content/ContentGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BatchProcessingPanel from '@/components/content/BatchProcessingPanel';
import CourseWorkflowView from '@/components/content/CourseWorkflowView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const ContentGeneratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");
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
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="create" className="flex items-center">
            <span className="material-icons text-sm mr-2">create</span>
            Create New Course
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <span className="material-icons text-sm mr-2">template_frame</span>
            Course Templates
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <span className="material-icons text-sm mr-2">menu_book</span>
            Course Content
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <ContentGenerator />
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Course Templates</h3>
            <p className="text-neutral-600 mb-6">Start with pre-defined templates to create courses more efficiently</p>
            
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
                    <Button variant="outline" size="sm" className="w-full">
                      <span className="material-icons text-sm mr-1">visibility</span>
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: `Template Selected: ${template.name}`,
                          description: `Starting with QAQF Level ${template.qaqfLevel} template`,
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
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="space-y-6">
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
    </div>
  );
};

export default ContentGeneratorPage;