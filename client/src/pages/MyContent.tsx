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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">All Modules</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules" className="space-y-4">
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

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.filter(content => content.type === 'academic_paper' || content.type === 'lecture').map((content: Content) => (
              <Card key={content.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">QAQF Level {content.qaqfLevel}</span>
                    <span className="material-icons text-sm text-blue-600">article</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.filter(content => content.type === 'assessment').map((content: Content) => (
              <Card key={content.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">QAQF Level {content.qaqfLevel}</span>
                    <span className="material-icons text-sm text-green-600">quiz</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.filter(content => content.type === 'video').map((content: Content) => (
              <Card key={content.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">QAQF Level {content.qaqfLevel}</span>
                    <span className="material-icons text-sm text-red-600">play_circle</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyContentPage;