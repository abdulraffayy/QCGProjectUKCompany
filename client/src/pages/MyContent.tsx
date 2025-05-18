import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ContentList from "@/components/content/ContentList";
import { Link } from "wouter";

const MyContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Get content query
  const { data: contents, isLoading: isLoadingContents } = useQuery({
    queryKey: ['/api/content'],
  });

  // Get videos query
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['/api/videos'],
  });

  // Filter content based on active tab
  const getFilteredContent = () => {
    if (!contents) return [];
    
    switch (activeTab) {
      case "academic":
        return contents.filter((content: any) => content.type === "academic_paper");
      case "assessment":
        return contents.filter((content: any) => content.type === "assessment");
      case "video":
        return contents.filter((content: any) => content.type === "video");
      case "verified":
        return contents.filter((content: any) => content.verificationStatus === "verified");
      case "pending":
        return contents.filter((content: any) => content.verificationStatus === "pending");
      default:
        return contents;
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">My Content</h2>
            <p className="text-neutral-600 mt-1">Manage and organize all your QAQF-aligned academic content</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <Link href="/content-generator">
              <Button variant="outline" className="flex items-center">
                <span className="material-icons mr-2 text-sm">description</span>
                New Academic Content
              </Button>
            </Link>
            <Link href="/video-generator">
              <Button className="flex items-center">
                <span className="material-icons mr-2 text-sm">movie</span>
                New Video
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="academic">Academic Papers</TabsTrigger>
          <TabsTrigger value="assessment">Assessments</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <ContentList 
        contents={getFilteredContent()}
        isLoading={isLoadingContents}
        title={`My ${activeTab !== 'all' ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : ''} Content`}
      />
    </>
  );
};

export default MyContentPage;
