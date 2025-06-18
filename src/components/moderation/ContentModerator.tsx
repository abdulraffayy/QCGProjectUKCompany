import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare } from 'lucide-react';

interface Content {
  id: number;
  title: string;
  description: string;
  type: string;
  qaqf_level: number;
  verification_status: string;
  content: string;
  created_at: string;
}

interface ContentModeratorProps {
  contents?: Content[];
  onApprove?: (id: number) => void;
  onReject?: (id: number, reason: string) => void;
  onRequestChanges?: (id: number, feedback: string) => void;
}

const ContentModerator: React.FC<ContentModeratorProps> = ({
  contents = [],
  onApprove,
  onReject,
  onRequestChanges
}) => {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleApprove = (content: Content) => {
    if (onApprove) {
      onApprove(content.id);
    }
  };

  const handleReject = (content: Content) => {
    if (onReject && rejectionReason.trim()) {
      onReject(content.id, rejectionReason);
      setRejectionReason('');
    }
  };

  const handleRequestChanges = (content: Content) => {
    if (onRequestChanges && feedback.trim()) {
      onRequestChanges(content.id, feedback);
      setFeedback('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle>Content Queue</CardTitle>
            <CardDescription>
              Review and moderate submitted content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedContent?.id === content.id 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedContent(content)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{content.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {content.description.length > 60 
                          ? `${content.description.substring(0, 60)}...`
                          : content.description
                        }
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Level {content.qaqf_level}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(content.verification_status)}`}>
                          {getStatusIcon(content.verification_status)}
                          <span className="ml-1">{content.verification_status}</span>
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContent(content);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {contents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                  <p>No content pending review</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Review Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Content Review</CardTitle>
            <CardDescription>
              {selectedContent ? 'Review selected content' : 'Select content to review'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedContent ? (
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{selectedContent.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedContent.description}
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {selectedContent.content}
                      </pre>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span>Type: {selectedContent.type}</span>
                      <span>Level: {selectedContent.qaqf_level}</span>
                      <span>Status: {selectedContent.verification_status}</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4">
                  <div className="space-y-4">
                    {selectedContent.verification_status === 'pending' && (
                      <>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleApprove(selectedContent)}
                            className="flex-1"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Request Changes (Optional)
                          </label>
                          <Textarea
                            placeholder="Provide feedback for improvements..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="mb-2"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => handleRequestChanges(selectedContent)}
                            disabled={!feedback.trim()}
                            className="w-full"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Request Changes
                          </Button>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Reject Content
                          </label>
                          <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="mb-2"
                          />
                          <Button 
                            variant="destructive" 
                            onClick={() => handleReject(selectedContent)}
                            disabled={!rejectionReason.trim()}
                            className="w-full"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {selectedContent.verification_status !== 'pending' && (
                      <div className="text-center py-4 text-muted-foreground">
                        Content has already been {selectedContent.verification_status}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="mx-auto h-8 w-8 mb-2" />
                <p>Select content from the queue to begin review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentModerator;