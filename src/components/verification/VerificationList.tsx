import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { getColorByLevel, QAQFCharacteristics } from "../lib/qaqf";
import { Content, VerificationStatus } from "@shared/schema";

interface VerificationListProps {
  contents: Content[];
  isLoading: boolean;
}

const VerificationList: React.FC<VerificationListProps> = ({ contents, isLoading }) => {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState("");
  const [verificationDecision, setVerificationDecision] = useState<"verified" | "rejected" | "in_review">("verified");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

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
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerify = (content: Content) => {
    setSelectedContent(content);
    setVerificationFeedback("");
    setVerificationDecision("verified");
    setIsVerifyDialogOpen(true);
  };

  const handleSubmitVerification = async () => {
    if (!selectedContent) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API to update the verification status
      // For demonstration purposes, we'll simulate a delay
      setTimeout(() => {
        setIsSubmitting(false);
        setIsVerifyDialogOpen(false);
        
        toast({
          title: `Content ${verificationDecision.charAt(0).toUpperCase() + verificationDecision.slice(1)}`,
          description: "The verification status has been updated successfully.",
        });
        
        // Invalidate queries to refresh content
        queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Verification Failed",
        description: "Failed to update verification status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredContents = contents.filter(content => {
    if (activeTab === "pending") return content.verificationStatus === VerificationStatus.PENDING;
    if (activeTab === "verified") return content.verificationStatus === VerificationStatus.VERIFIED;
    if (activeTab === "rejected") return content.verificationStatus === VerificationStatus.REJECTED;
    if (activeTab === "in_review") return content.verificationStatus === VerificationStatus.IN_REVIEW;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending 
              <Badge variant="warning" className="ml-2">
                {contents.filter(c => c.verificationStatus === VerificationStatus.PENDING).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in_review">
              In Review
              <Badge variant="info" className="ml-2">
                {contents.filter(c => c.verificationStatus === VerificationStatus.IN_REVIEW).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified
              <Badge variant="success" className="ml-2">
                {contents.filter(c => c.verificationStatus === VerificationStatus.VERIFIED).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <Badge variant="destructive" className="ml-2">
                {contents.filter(c => c.verificationStatus === VerificationStatus.REJECTED).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left">Title</TableHead>
                    <TableHead className="px-6 py-3 text-left">Type</TableHead>
                    <TableHead className="px-6 py-3 text-left">QAQF Level</TableHead>
                    <TableHead className="px-6 py-3 text-left">Author</TableHead>
                    <TableHead className="px-6 py-3 text-left">Submitted</TableHead>
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
                      <TableCell colSpan={6} className="text-center py-6">No {activeTab} content available</TableCell>
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
                          User ID: {content.createdByUserId}
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
                              onClick={() => setSelectedContent(content)}
                            >
                              <span className="material-icons text-sm">visibility</span>
                            </Button>
                            <Button 
                              variant={content.verificationStatus === VerificationStatus.PENDING ? "default" : "outline"} 
                              size="sm"
                              onClick={() => handleVerify(content)}
                              disabled={content.verificationStatus === VerificationStatus.VERIFIED}
                            >
                              <span className="material-icons text-sm mr-1">verified</span>
                              {content.verificationStatus === VerificationStatus.PENDING ? "Verify" : "Review"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Content View Dialog */}
      {selectedContent && (
        <Dialog open={!!selectedContent && !isVerifyDialogOpen} onOpenChange={(open) => !open && setSelectedContent(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedContent.title}</DialogTitle>
              <DialogDescription>
                Module: {selectedContent.moduleCode} | QAQF Level {selectedContent.qaqfLevel}
              </DialogDescription>
            </DialogHeader>

            <div className="border rounded-md p-4 bg-neutral-50">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {selectedContent.content}
              </pre>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">QAQF Characteristics</h4>
              <div className="flex flex-wrap gap-2 mb-4">
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

              <h4 className="text-sm font-semibold mb-2">QAQF Assessment</h4>
              <div className="space-y-2">
                {QAQFCharacteristics.map((characteristic) => (
                  <div key={characteristic.id} className="flex items-center justify-between text-sm">
                    <span>{characteristic.name}</span>
                    <Progress value={Math.floor(Math.random() * 100)} className="w-1/2 h-2" />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedContent(null)}>Close</Button>
              <Button onClick={() => { setIsVerifyDialogOpen(true); }}>Verify Content</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Content</DialogTitle>
            <DialogDescription>
              Review and verify this content against QAQF standards and British educational requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Verification Decision</h4>
              <RadioGroup 
                value={verificationDecision} 
                onValueChange={(value) => setVerificationDecision(value as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="verified" id="verified" />
                  <Label htmlFor="verified" className="text-success">Verified - Content meets all standards</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="in_review" id="in_review" />
                  <Label htmlFor="in_review" className="text-info">In Review - Needs additional review</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="rejected" />
                  <Label htmlFor="rejected" className="text-destructive">Rejected - Does not meet standards</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="feedback">Verification Feedback</Label>
              <Textarea 
                id="feedback" 
                placeholder="Provide feedback about this content..."
                value={verificationFeedback}
                onChange={(e) => setVerificationFeedback(e.target.value)}
                className="h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsVerifyDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitVerification}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VerificationList;
