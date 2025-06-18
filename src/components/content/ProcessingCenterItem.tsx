import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { MoreHorizontal, Eye, Download, Share, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface ProcessingCenterItemProps {
  item: {
    id: string;
    type: 'content' | 'course';
    title: string;
    description: string;
    qaqf_level: number;
    qaqf_compliance_score: number;
    content: any;
    created_at: string;
    status: 'draft' | 'reviewed' | 'approved';
  };
  onApprove?: (id: string) => void;
  onSaveToLibrary?: (item: any) => void;
  onCreateLessonPlan?: (item: any) => void;
}

const ProcessingCenterItem: React.FC<ProcessingCenterItemProps> = ({
  item,
  onApprove,
  onSaveToLibrary,
  onCreateLessonPlan
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {item.type === 'content' ? 'Content' : 'Course'}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {item.description}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span>QAQF Level {item.qaqf_level}</span>
            <Badge className={getStatusColor(item.status)}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>
          <span className="text-muted-foreground">
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>QAQF Compliance</span>
            <span className={getComplianceColor(item.qaqf_compliance_score)}>
              {item.qaqf_compliance_score}%
            </span>
          </div>
          <Progress value={item.qaqf_compliance_score} className="h-2" />
        </div>
        
        <div className="flex gap-2 pt-2">
          {item.status === 'draft' && onApprove && (
            <Button 
              size="sm" 
              onClick={() => onApprove(item.id)}
              className="flex-1"
            >
              Approve
            </Button>
          )}
          
          {onSaveToLibrary && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onSaveToLibrary(item)}
              className="flex-1"
            >
              Save to Library
            </Button>
          )}
          
          {item.type === 'content' && onCreateLessonPlan && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onCreateLessonPlan(item)}
              className="flex-1"
            >
              Create Lesson Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingCenterItem;