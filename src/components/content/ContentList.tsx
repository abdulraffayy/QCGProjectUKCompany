import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getColorByLevel } from "../lib/qaqf";
import { saveContentAsPDF } from "../lib/pdfGenerator";
import { Content } from "@shared/schema";
import { useToast } from "../hooks/use-toast";

interface ContentListProps {
  contents: Content[];
  isLoading: boolean;
  showFilters?: boolean;
  title?: string;
}

const ContentList: React.FC<ContentListProps> = ({ 
  contents, 
  isLoading, 
  showFilters = true,
  title = "My Content"
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      case "in_review":
        return "info";
      default:
        return "secondary";
    }
  };

  const getContentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "academic_paper":
        return "primary";
      case "assessment":
        return "secondary";
      case "video":
        return "accent";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredContents = contents.filter(content => 
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.moduleCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewContent = (content: Content) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const handleDeleteContent = (contentId: number) => {
    toast({
      title: "Content Deleted",
      description: "The content has been deleted successfully.",
    });
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          {showFilters && (
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <span className="material-icons text-sm mr-1">filter_list</span>
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>All Content</DropdownMenuItem>
                  <DropdownMenuItem>Academic Papers</DropdownMenuItem>
                  <DropdownMenuItem>Video Content</DropdownMenuItem>
                  <DropdownMenuItem>Assessments</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <span className="material-icons text-sm mr-1">sort</span>
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Newest First</DropdownMenuItem>
                  <DropdownMenuItem>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem>QAQF Level (High to Low)</DropdownMenuItem>
                  <DropdownMenuItem>QAQF Level (Low to High)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3 text-left">Title</TableHead>
                <TableHead className="px-6 py-3 text-left">Type</TableHead>
                <TableHead className="px-6 py-3 text-left">QAQF Level</TableHead>
                <TableHead className="px-6 py-3 text-left">Status</TableHead>
                <TableHead className="px-6 py-3 text-left">Created</TableHead>
                <TableHead className="px-6 py-3 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">Loading...</TableCell>
                </TableRow>
              ) : filteredContents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">No content available</TableCell>
                </TableRow>
              ) : (
                filteredContents.map((content) => (
                  <TableRow key={content.id} className="hover:bg-neutral-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-800">{content.title}</div>
                      <div className="text-neutral-500 text-xs">Module: {content.moduleCode}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getContentTypeBadgeVariant(content.type) as any}>
                        {content.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-${getColorByLevel(content.qaqfLevel)} font-medium`}>
                        Level {content.qaqfLevel}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getBadgeVariant(content.verificationStatus) as any}>
                        {content.verificationStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-neutral-500">
                      {formatDate(content.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-primary mr-2"
                          onClick={() => handleViewContent(content)}
                        >
                          <span className="material-icons text-sm">visibility</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-primary mr-2"
                          onClick={() => handleExportToPDF(content)}
                          title="Export to PDF"
                        >
                          <span className="material-icons text-sm">picture_as_pdf</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-neutral-500 mr-2">
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-neutral-500">
                              <span className="material-icons text-sm">more_vert</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewContent(content)}>
                              <span className="material-icons text-sm mr-2">visibility</span>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportToPDF(content)}>
                            <span className="material-icons text-sm mr-2">picture_as_pdf</span>
                            Export to PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <span className="material-icons text-sm mr-2">share</span>
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteContent(content.id)}>
                            <span className="material-icons text-sm mr-2">delete</span>
                            Delete
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Content View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
            <DialogDescription>
              Module: {selectedContent?.moduleCode} | QAQF Level {selectedContent?.qaqfLevel}
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-md p-4 bg-neutral-50">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {selectedContent?.content}
            </pre>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">QAQF Characteristics</h4>
            <div className="flex flex-wrap gap-2">
              {selectedContent?.characteristics ? (
                Object.keys(selectedContent.characteristics).map((key, index) => (
                  <Badge key={index} variant="outline" className="bg-primary bg-opacity-10 text-primary">
                    {key}
                  </Badge>
                ))
              ) : (
                <span className="text-neutral-500">No characteristics available</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            <Button>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ContentList;
