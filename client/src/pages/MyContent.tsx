import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Content } from '@shared/schema';

const MyContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("modules");
  
  // Fetch content data
  const { data: contents = [], isLoading } = useQuery({
    queryKey: ['/api/content'],
    queryFn: async () => {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    }
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Module Library</h1>
          <p className="text-neutral-600">View and manage your QAQF modules here.</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <span className="material-icons mr-2 text-sm">add</span>
          Create New Module
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-1/3 mb-6">
          <TabsTrigger value="modules">
            <span className="material-icons text-sm mr-1">library_books</span>
            All Modules
          </TabsTrigger>
          <TabsTrigger value="module_details">
            <span className="material-icons text-sm mr-1">menu_book</span>
            Module Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-10 border rounded-md">
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No modules found</h3>
              <p className="text-neutral-500 mb-4">There are no modules available to display.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map((content: Content) => (
                <Card key={content.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                    <div className="flex items-center text-xs text-neutral-500 mb-3">
                      <span className="material-icons text-xs mr-1">school</span>
                      <span>QAQF Level {content.qaqfLevel}</span>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="mr-2">View</Button>
                      <Button size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="module_details">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Module Details</h3>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyContentPage;