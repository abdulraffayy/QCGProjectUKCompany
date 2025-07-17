import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Play, 
  Pause, 
  FileText, 
  Video, 
  BookOpen, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Edit,
  Eye,
  Download,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ProcessingCenterItemProps {
  item: {
    id: string;
    title: string;
    type: string;
    status: 'processing' | 'draft' | 'failed' | 'pending' | 'completed';
    progress?: number;
    createdAt: string;
    createdBy: string;
    description?: string;
    qaqfLevel?: number;
    estimatedTime?: string;
    content?: string;
    metadata?: any;
  };
  onAction?: (action: string, itemId: string) => void;
}

const ProcessingCenterItem: React.FC<ProcessingCenterItemProps> = ({
  item,
  onAction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'draft':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return '';
      case 'completed':
        return 'bg-gray-100 text-gray-800'; // changed from green to gray
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action, item.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="transition-all hover:shadow-md ">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center gap-2">
              {getTypeIcon(item.type)}
              {getStatusIcon(item.status)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate ">{item.title}</CardTitle>
              <CardDescription className="mt-1">
                {item.description && (
                  <span className="block mb-1">{item.description}</span>
                )}
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </span>
                  {item.qaqfLevel && (
                    <span>Level {item.qaqfLevel}</span>
                  )}
                </div>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(item.status)}>
              {item.status !== 'completed' ? item.status : ''}
            </Badge>
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                if (value === 'delete') {
                  if (onAction) onAction('delete', item.id);
                  setFilterStatus('all');
                } else {
                  setFilterStatus(value);
                }
              }}
            >
              <SelectTrigger className="w-32 border border-neutral-300 focus:ring-0 focus:border-neutral-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1"
              onClick={() => onAction && onAction('close', item.id)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {item.status === 'processing' && item.progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Processing...</span>
              <span>{Math.round(item.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            {item.estimatedTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Estimated time remaining: {item.estimatedTime}
              </p>
            )}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 border-t">
          <div className="space-y-4">
            {item.content && (
              <div>
                <h4 className="font-medium mb-2">Content Preview</h4>
                <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {item.content.length > 500 
                      ? `${item.content.substring(0, 500)}...`
                      : item.content
                    }
                  </pre>
                </div>
              </div>
            )}

            {item.metadata && (
              <div>
                <h4 className="font-medium mb-2">Metadata</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {item.status === 'completed' && (
                <>
                 
                
                </>
              )}

              {item.status === 'processing' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAction('cancel')}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}

              {item.status === 'failed' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAction('retry')}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAction('details')}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Error Details
                  </Button>
                </>
              )}

              {item.status === 'pending' && (
                <Button 
                  size="sm" 
                  onClick={() => handleAction('start')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Processing
                </Button>
              )}
            </div>

           
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProcessingCenterItem;