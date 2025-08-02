import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { getColorByLevel } from "../../lib/qaqf";
import { Content } from "shared/schema";

interface RecentContentProps {
  contents: Content[];
  isLoading: boolean;
}

const RecentContent: React.FC<RecentContentProps> = ({ contents, isLoading }) => {
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

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Recent Content</CardTitle>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="mr-2">
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
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">No content available</TableCell>
                </TableRow>
              ) : (
                contents.map((content) => (
                  <TableRow key={content.id} className="hover:bg-neutral-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-800">{content.title}</div>
                      <div className="text-neutral-500 text-xs">Module: {content.module_code}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getContentTypeBadgeVariant(content.type) as any}>
                        {content.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-${getColorByLevel(content.qaqf_level)} font-medium`}>
                        Level {content.qaqf_level}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getBadgeVariant(content.verification_status) as any}>
                       
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-neutral-500">
                      {formatDate(content.created_at)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="text-primary mr-2">
                          <span className="material-icons text-sm">visibility</span>
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Verify</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
    </Card>
  );
};

export default RecentContent;
