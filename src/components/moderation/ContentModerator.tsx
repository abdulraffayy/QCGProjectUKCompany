import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Content, VerificationStatus } from "@shared/schema";
import { getColorByLevel } from "@/lib/qaqf";

interface ContentModeratorProps {
  contents: Content[];
  isLoading: boolean;
}

const ContentModerator: React.FC<ContentModeratorProps> = ({ contents, isLoading }) => {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isModerateDialogOpen, setIsModerateDialogOpen] = useState(false);
  const [moderationNotes, setModerationNotes] = useState("");
  const [britishStandardsChecked, setBritishStandardsChecked] = useState(true);
  const [qaqfAlignmentChecked, setQaqfAlignmentChecked] = useState(true);
  const [academicQualityChecked, setAcademicQualityChecked] = useState(true);
  const [contentEthicsChecked, setContentEthicsChecked] = useState(true);
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
      year: 'numeric' 
    });
  };

  const handleModerate = (content: Content) => {
    setSelectedContent(content);
    setModerationNotes("");
    setBritishStandardsChecked(true);
    setQaqfAlignmentChecked(true);
    setAcademicQualityChecked(true);
    setContentEthicsChecked(true);
    setIsModerateDialogOpen(true);
  };

  const handleSubmitModeration = async () => {
    if (!selectedContent) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate moderation submission
      setTimeout(() => {
        setIsSubmitting(false);
        setIsModerateDialogOpen(false);
        
        // Check if all standards are met
        const allStandardsMet = britishStandardsChecked && qaqfAlignmentChecked && 
                               academicQualityChecked && contentEthicsChecked;
        
        toast({
          title: allStandardsMet ? "Content Approved" : "Content Requires Revision",
          description: allStandardsMet 
            ? "The content has been moderated and approved successfully." 
            : "The content has been flagged for revision.",
          variant: allStandardsMet ? "default" : "warning",
        });
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Moderation Failed",
        description: "Failed to submit moderation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewContent = (content: Content) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const filteredContents = contents.filter(content => {
    if (activeTab === "pending") return content.verificationStatus === VerificationStatus.PENDING;
    if (activeTab === "verified") return content.verificationStatus === VerificationStatus.VERIFIED;
    if (activeTab === "in_review") return content.verificationStatus === VerificationStatus.IN_REVIEW;
    return true;
  });

  // Calculate the British Standards compliance score (mock calculation for demo)
  const calculateBritishStandardsScore = (content: Content | null) => {
    if (!content) return 0;
    // This would be a real calculation in a production environment
    // For demo, we'll use a simple algorithm based on QAQF level
    return Math.min(95, 65 + content.qaqfLevel * 3);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending Moderation
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
              Moderated
              <Badge variant="success" className="ml-2">
                {contents.filter(c => c.verificationStatus === VerificationStatus.VERIFIED).length}
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
                    <TableHead className="px-6 py-3 text-left">Status</TableHead>
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
                      <TableCell colSpan={6} className="text-center py-6">No content requiring moderation</TableCell>
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
                          <Badge variant={
                            content.verificationStatus === "verified" ? "success" :
                            content.verificationStatus === "pending" ? "warning" :
                            content.verificationStatus === "in_review" ? "info" : "secondary"
                          }>
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
                              variant="default"
                              size="sm"
                              onClick={() => handleModerate(content)}
                            >
                              <span className="material-icons text-sm mr-1">gavel</span>
                              Moderate
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
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
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
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              <Button onClick={() => { 
                setIsViewDialogOpen(false);
                handleModerate(selectedContent);
              }}>
                Moderate Content
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Moderation Dialog */}
      <Dialog open={isModerateDialogOpen} onOpenChange={setIsModerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Moderate Content</DialogTitle>
            <DialogDescription>
              Review this content against British standards and QAQF framework criteria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">British Standards Compliance</h4>
              <div className="flex items-center mb-2">
                <Progress value={calculateBritishStandardsScore(selectedContent)} className="flex-1 mr-2" />
                <span className="text-sm font-medium">{calculateBritishStandardsScore(selectedContent)}%</span>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="compliance-checklist">
                <AccordionTrigger>Standards Compliance Checklist</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="british-standards" className="flex items-center">
                        <span className="material-icons text-sm mr-2">check_circle</span>
                        British Educational Standards
                      </Label>
                      <Switch 
                        id="british-standards" 
                        checked={britishStandardsChecked} 
                        onCheckedChange={setBritishStandardsChecked}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="qaqf-alignment" className="flex items-center">
                        <span className="material-icons text-sm mr-2">check_circle</span>
                        QAQF Framework Alignment
                      </Label>
                      <Switch 
                        id="qaqf-alignment" 
                        checked={qaqfAlignmentChecked} 
                        onCheckedChange={setQaqfAlignmentChecked}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="academic-quality" className="flex items-center">
                        <span className="material-icons text-sm mr-2">check_circle</span>
                        Academic Quality and Rigor
                      </Label>
                      <Switch 
                        id="academic-quality" 
                        checked={academicQualityChecked} 
                        onCheckedChange={setAcademicQualityChecked}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content-ethics" className="flex items-center">
                        <span className="material-icons text-sm mr-2">check_circle</span>
                        Content Ethics and Inclusivity
                      </Label>
                      <Switch 
                        id="content-ethics" 
                        checked={contentEthicsChecked} 
                        onCheckedChange={setContentEthicsChecked}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div>
              <Label htmlFor="moderation-notes">Moderation Notes</Label>
              <Textarea 
                id="moderation-notes" 
                placeholder="Add notes about this content's compliance with standards..."
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                className="h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModerateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitModeration}
              disabled={isSubmitting}
              variant={
                britishStandardsChecked && qaqfAlignmentChecked && 
                academicQualityChecked && contentEthicsChecked ? "default" : "secondary"
              }
            >
              {isSubmitting ? 'Submitting...' : 'Submit Moderation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ContentModerator;
