import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ContentList from "@/components/content/ContentList";
import { Link } from "wouter";
import { getColorByLevel } from "@/lib/qaqf";
import { saveContentAsPDF } from "@/lib/pdfGenerator";
import { Content } from "@shared/schema";

const MyContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  // Get content query
  const { data: contents = [], isLoading: isLoadingContents } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });

  // Get videos query
  const { data: videos = [], isLoading: isLoadingVideos } = useQuery<any[]>({
    queryKey: ['/api/videos'],
  });

  // Filter content based on active tab
  const getFilteredContent = () => {
    if (!contents) return [];
    
    let filtered = [...contents];
    
    // Apply tab filters
    switch (activeTab) {
      case "academic":
        filtered = filtered.filter((content: any) => content.type === "academic_paper");
        break;
      case "assessment":
        filtered = filtered.filter((content: any) => content.type === "assessment");
        break;
      case "video":
        filtered = filtered.filter((content: any) => content.type === "video");
        break;
      case "verified":
        filtered = filtered.filter((content: any) => content.verificationStatus === "verified");
        break;
      case "pending":
        filtered = filtered.filter((content: any) => content.verificationStatus === "pending");
        break;
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((content: any) => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (content.moduleCode && content.moduleCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "qaqf-high-low":
        filtered.sort((a: any, b: any) => b.qaqfLevel - a.qaqfLevel);
        break;
      case "qaqf-low-high":
        filtered.sort((a: any, b: any) => a.qaqfLevel - b.qaqfLevel);
        break;
      case "title":
        filtered.sort((a: any, b: any) => a.title.localeCompare(b.title));
        break;
    }
    
    return filtered;
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "verified": return "success";
      case "pending": return "warning";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const getContentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "academic_paper": return "primary";
      case "assessment": return "secondary";
      case "video": return "accent";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleViewContent = (content: Content) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };
  
  const handleExportToPDF = (content: Content) => {
    try {
      saveContentAsPDF(content);
      toast({
        title: "PDF Export Successful",
        description: `${content.title} has been exported as a PDF file.`,
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "PDF Export Failed",
        description: "There was a problem exporting your content to PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const contentCount = getFilteredContent().length;
  const pendingCount = contents.filter((c: any) => c.verificationStatus === "pending").length;
  const verifiedCount = contents.filter((c: any) => c.verificationStatus === "verified").length;

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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Content</p>
                <h3 className="text-3xl font-bold">{contents.length}</h3>
              </div>
              <div className="h-12 w-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="material-icons text-primary">article</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Verified Content</p>
                <h3 className="text-3xl font-bold">{verifiedCount}</h3>
              </div>
              <div className="h-12 w-12 bg-green-500 bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="material-icons text-green-500">verified</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Verification</p>
                <h3 className="text-3xl font-bold">{pendingCount}</h3>
              </div>
              <div className="h-12 w-12 bg-amber-500 bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="material-icons text-amber-500">pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Content Library</CardTitle>
            
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm">
                  search
                </span>
                <Input 
                  type="text" 
                  placeholder="Search content..." 
                  className="pl-10 min-w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <span className="material-icons text-sm mr-1">sort</span>
                      Sort By
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      {sortBy === "newest" && "✓ "}Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                      {sortBy === "oldest" && "✓ "}Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("title")}>
                      {sortBy === "title" && "✓ "}Title (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("qaqf-high-low")}>
                      {sortBy === "qaqf-high-low" && "✓ "}QAQF Level (High to Low)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("qaqf-low-high")}>
                      {sortBy === "qaqf-low-high" && "✓ "}QAQF Level (Low to High)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex border rounded-md overflow-hidden">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "ghost"} 
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <span className="material-icons text-sm">grid_view</span>
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "default" : "ghost"} 
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("list")}
                  >
                    <span className="material-icons text-sm">view_list</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="academic">Academic Papers</TabsTrigger>
              <TabsTrigger value="assessment">Assessments</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="pt-4">
          {isLoadingContents ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : getFilteredContent().length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-4xl text-neutral-300">inbox</span>
              <h3 className="mt-2 text-neutral-600 font-medium">No content found</h3>
              <p className="text-neutral-500 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredContent().map((content: any) => (
                <Card key={content.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewContent(content)}>
                  <div className="h-2 bg-primary" style={{ backgroundColor: getColorByLevel(content.qaqfLevel) }}></div>
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <Badge variant={getContentTypeBadgeVariant(content.type) as any} className="text-xs">
                        {content.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getBadgeVariant(content.verificationStatus) as any} className="text-xs">
                        {content.verificationStatus}
                      </Badge>
                    </div>
                    <h3 className="font-semibold truncate">{content.title}</h3>
                    <p className="text-sm text-neutral-500 mb-2 truncate">{content.moduleCode || 'No module code'}</p>
                    <p className="text-xs text-neutral-400">QAQF Level {content.qaqfLevel}</p>
                    <div className="flex items-center mt-3 text-xs text-neutral-500">
                      <span className="material-icons text-xs mr-1">calendar_today</span>
                      {formatDate(content.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ContentList 
              contents={getFilteredContent()}
              isLoading={isLoadingContents}
              showFilters={false}
              title=""
            />
          )}
        </CardContent>
      </Card>
      
      {/* Content View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedContent?.title}</DialogTitle>
            <DialogDescription className="flex items-center">
              <span className="mr-2">Module: {selectedContent?.moduleCode || 'N/A'}</span>
              <Badge variant="outline" className="mr-2">QAQF Level {selectedContent?.qaqfLevel}</Badge>
              <Badge variant={getBadgeVariant(selectedContent?.verificationStatus || '') as any}>
                {selectedContent?.verificationStatus}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-md p-4 bg-neutral-50 mt-4">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {selectedContent?.content}
            </pre>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">QAQF Characteristics</h4>
            <div className="flex flex-wrap gap-2">
              {selectedContent?.characteristics ? (
                Array.isArray(selectedContent.characteristics) 
                  ? selectedContent.characteristics.map((id: number) => (
                      <Badge key={id} variant="outline" className="bg-primary bg-opacity-10 text-primary">
                        Characteristic {id}
                      </Badge>
                    ))
                  : Object.keys(selectedContent.characteristics).map((key, index) => (
                      <Badge key={index} variant="outline" className="bg-primary bg-opacity-10 text-primary">
                        {key}
                      </Badge>
                    ))
              ) : (
                <span className="text-neutral-500">No characteristics available</span>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            <Button className="flex items-center">
              <span className="material-icons text-sm mr-1">download</span>
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyContentPage;
