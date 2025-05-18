import React, { useState } from 'react';
import ContentGenerator from '@/components/content/ContentGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BatchProcessingPanel from '@/components/content/BatchProcessingPanel';
import CourseWorkflowView from '@/components/content/CourseWorkflowView';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const ContentGeneratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Course Generator</h2>
          <p className="text-neutral-600 mt-1">Create academic course content aligned with QAQF framework</p>
        </div>
      </div>

      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="create" className="flex items-center">
            <span className="material-icons text-sm mr-2">create</span>
            Create New Course
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center">
            <span className="material-icons text-sm mr-2">assignment</span>
            Batch Processing
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
        
        <TabsContent value="batch">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Batch Course Processing</h3>
            <p className="text-neutral-600 mb-6">Upload multiple course specifications to generate courses in batch</p>
            <BatchProcessingPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Course Templates</h3>
            <p className="text-neutral-600 mb-6">Start with pre-defined templates to create courses more efficiently</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Foundation Module", "Advanced Topic", "Assessment Pack", "Learning Journey", "Workshop Materials", "Extension Activities"].map((template) => (
                <div key={template} className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{template}</h4>
                    <span className="material-icons text-primary text-sm">content_copy</span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">QAQF optimized template for {template.toLowerCase()} creation.</p>
                  <Button variant="outline" size="sm" className="w-full">Use Template</Button>
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