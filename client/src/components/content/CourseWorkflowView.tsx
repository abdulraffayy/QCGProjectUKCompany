import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Content } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface CourseWorkflowViewProps {
  contentId?: number;
  showLatest?: boolean;
  limit?: number;
  showCreateNew?: boolean;
  showWorkflowButtons?: boolean;
}

const CourseWorkflowView: React.FC<CourseWorkflowViewProps> = ({
  contentId,
  showLatest = true,
  limit = 3,
  showCreateNew = false,
  showWorkflowButtons = true
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("content");
  const [selectedContentId, setSelectedContentId] = useState<number | undefined>(contentId);

  // Fetch specific content by ID if provided
  const { data: specificContent, isLoading: isLoadingSpecific } = useQuery({
    queryKey: contentId ? [`/api/content/${contentId}`] : [],
    queryFn: async () => {
      if (contentId) {
        const response = await fetch(`/api/content/${contentId}`);
        if (!response.ok) throw new Error('Failed to fetch content');
        return response.json();
      }
      return null;
    },
    enabled: !!contentId
  });

  // Fetch all content for latest display
  const { data: allContents = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/content'],
    queryFn: async () => {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    },
    enabled: showLatest && !contentId
  });

  // Determine what content to display
  let contents: Content[] = [];
  let isLoading = isLoadingSpecific || isLoadingAll;
  
  if (contentId && specificContent) {
    // If we have a specific content ID and data, use that
    contents = [specificContent];
  } else if (showLatest && Array.isArray(allContents)) {
    // Otherwise use latest content sorted by date
    contents = [...allContents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Set the selected content ID when content changes
  useEffect(() => {
    if (contents.length > 0 && !selectedContentId) {
      setSelectedContentId(contents[0].id);
    }
  }, [contents, selectedContentId]);

  // Get the selected content
  const selectedContent = contents.find(content => content.id === selectedContentId);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getQaqfLevelColor = (level: number) => {
    if (level <= 3) return "bg-blue-100 text-blue-800";
    if (level <= 6) return "bg-purple-100 text-purple-800";
    return "bg-violet-100 text-violet-800";
  };

  // Handle workflow actions
  const handleVerify = async () => {
    if (!selectedContent) return;
    
    toast({
      title: "Verification Started",
      description: `Started verification process for "${selectedContent.title}"`,
    });
    
    // Simulate verification process
    setTimeout(() => {
      toast({
        title: "Verification Complete",
        description: `${selectedContent.title} has been successfully verified.`,
      });
    }, 2000);
  };

  const handleExport = () => {
    if (!selectedContent) return;
    
    toast({
      title: "Export Started",
      description: `Exporting "${selectedContent.title}" to PDF...`,
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${selectedContent.title} has been successfully exported.`,
      });
    }, 1500);
  };

  const handleShare = () => {
    if (!selectedContent) return;
    
    // Copy a shareable link to clipboard
    const shareableLink = `${window.location.origin}/content/${selectedContent.id}`;
    navigator.clipboard.writeText(shareableLink);
    
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No courses found</h3>
            <p className="text-neutral-500 mb-4">There are no courses available to display.</p>
            {showCreateNew && (
              <Button>
                <span className="material-icons mr-2 text-sm">add</span>
                Create New Course
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      {contents.length > 1 && (
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Course Title</CardTitle>
            <div className="flex flex-wrap gap-2">
              {contents.map((content) => (
                <Button
                  key={content.id}
                  variant={content.id === selectedContentId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedContentId(content.id)}
                  className="text-xs"
                >
                  {content.title.length > 20 ? `${content.title.substring(0, 20)}...` : content.title}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="pt-6">
        {selectedContent ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-2">{selectedContent.title}</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getQaqfLevelColor(selectedContent.qaqfLevel)}>
                  QAQF Level {selectedContent.qaqfLevel}
                </Badge>
                <Badge className={getVerificationStatusColor(selectedContent.verificationStatus)}>
                  {selectedContent.verificationStatus.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  Module: {selectedContent.moduleCode || 'N/A'}
                </Badge>
                <Badge variant="outline" className="bg-neutral-100">
                  Created: {formatDate(selectedContent.createdAt)}
                </Badge>
              </div>
              <p className="text-neutral-600">{selectedContent.description}</p>
            </div>
          
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="content">
                  <span className="material-icons text-sm mr-1">description</span>
                  Content
                </TabsTrigger>
                <TabsTrigger value="characteristics">
                  <span className="material-icons text-sm mr-1">category</span>
                  Characteristics
                </TabsTrigger>
                <TabsTrigger value="module">
                  <span className="material-icons text-sm mr-1">menu_book</span>
                  Module
                </TabsTrigger>
                <TabsTrigger value="metadata">
                  <span className="material-icons text-sm mr-1">info</span>
                  Metadata
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="mt-4">
                <div className="border rounded-md p-4 bg-white overflow-auto max-h-[400px]">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selectedContent.content}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="characteristics" className="mt-4">
                <div className="border rounded-md p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedContent.characteristics ? (
                      Object.entries(selectedContent.characteristics as Record<string, any>).map(([key, value], index) => (
                        <div key={index} className="border rounded-md p-3 bg-neutral-50">
                          <h4 className="font-medium text-sm mb-1">{key}</h4>
                          <p className="text-xs text-neutral-600">
                            {typeof value === 'object' 
                              ? JSON.stringify(value) 
                              : String(value)
                            }
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-4 text-neutral-500">
                        No QAQF characteristics available for this content.
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              

              <TabsContent value="module" className="mt-4">
                <div className="border rounded-md p-4 bg-white">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Module Layout</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Generate lesson plans and content modules based on this course. Select a template to blend with this course content.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all">
                        <div className="flex items-center mb-2">
                          <span className="material-icons text-primary mr-2">school</span>
                          <h4 className="font-medium">Lesson Plan</h4>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">
                          Create a structured lesson plan with objectives, activities, and assessments aligned with the course content.
                        </p>
                        <Button size="sm" className="w-full">Generate Lesson Plan</Button>
                      </div>
                      
                      <div className="border rounded-md p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all">
                        <div className="flex items-center mb-2">
                          <span className="material-icons text-primary mr-2">menu_book</span>
                          <h4 className="font-medium">Study Materials</h4>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">
                          Generate supplementary study materials based on this course content including handouts and reading guides.
                        </p>
                        <Button size="sm" className="w-full">Create Study Materials</Button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">Apply Templates</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Enhance this course content by applying one of these templates to create additional modules.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        {
                          name: "Assessment Module",
                          icon: "quiz",
                          description: "Add comprehensive assessments aligned with this course"
                        },
                        {
                          name: "Interactive Activities",
                          icon: "extension",
                          description: "Generate hands-on activities for practical learning"
                        },
                        {
                          name: "Discussion Topics",
                          icon: "forum",
                          description: "Create thought-provoking discussion prompts and guides"
                        }
                      ].map((template, index) => (
                        <div key={index} className="border rounded-md p-3 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                          <div className="flex items-center mb-2">
                            <span className="material-icons text-primary mr-2">{template.icon}</span>
                            <h4 className="font-medium text-sm">{template.name}</h4>
                          </div>
                          <p className="text-xs text-neutral-600 mb-3">
                            {template.description}
                          </p>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            Apply Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="metadata" className="mt-4">
                <div className="border rounded-md p-4 bg-white">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500">QAQF Level</dt>
                      <dd className="text-sm text-neutral-900 col-span-2">{selectedContent.qaqfLevel}</dd>
                    </div>
                    <div className="py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500">Module Code</dt>
                      <dd className="text-sm text-neutral-900 col-span-2">{selectedContent.moduleCode || 'N/A'}</dd>
                    </div>
                    <div className="py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500">Content Type</dt>
                      <dd className="text-sm text-neutral-900 col-span-2">{selectedContent.type.replace('_', ' ')}</dd>
                    </div>
                    <div className="py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500">Verification Status</dt>
                      <dd className="text-sm text-neutral-900 col-span-2">{selectedContent.verificationStatus.replace('_', ' ')}</dd>
                    </div>
                    <div className="py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500">Created By</dt>
                      <dd className="text-sm text-neutral-900 col-span-2">User ID: {selectedContent.createdByUserId}</dd>
                    </div>
                    <div className="py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500">Created At</dt>
                      <dd className="text-sm text-neutral-900 col-span-2">{formatDate(selectedContent.createdAt)}</dd>
                    </div>
                    <div className="py-2 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-neutral-500">Updated At</dt>
                      <dd className="text-sm text-neutral-900 col-span-2">{formatDate(selectedContent.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No course selected</h3>
            <p className="text-neutral-500">Please select a course to view its details.</p>
          </div>
        )}
      </CardContent>
      
      {showWorkflowButtons && selectedContent && (
        <CardFooter className="bg-neutral-50 border-t flex flex-wrap gap-2">
          <div className="flex-grow"></div>
          <Button className="flex items-center">
            <span className="material-icons text-sm mr-1">edit</span>
            Edit Course
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CourseWorkflowView;