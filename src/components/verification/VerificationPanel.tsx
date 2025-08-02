import { useState } from 'react';
import { Card, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Content } from "shared/schema";

interface VerificationPanelProps {
  pendingContents?: Content[];
  isLoading?: boolean;
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({ 
  pendingContents = [],
  isLoading = false
}) => {
  const { toast } = useToast();
  const [verifyingContentId, setVerifyingContentId] = useState<number | null>(null);

  const handleReview = (contentId: number) => {
    setVerifyingContentId(contentId);
    
    // Simulating verification process
    setTimeout(() => {
      setVerifyingContentId(null);
      toast({
        title: "Content Reviewed",
        description: "The content has been reviewed and marked as verified.",
      });
    }, 1500);
  };

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <CardTitle className="text-lg font-bold mb-4">Verification & Moderation</CardTitle>
        <p className="text-neutral-600 text-sm mb-6">Verify and moderate content against British Standards and QAQF criteria</p>
        
        <div className="bg-neutral-100 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-neutral-800">Pending Verifications</h4>
            {pendingContents.length > 0 && (
              <Badge variant="secondary" className="text-sm font-medium">
                {pendingContents.filter(c => c.verification_status === "pending").length} pending
              </Badge>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">Loading pending content...</div>
          ) : pendingContents.length === 0 ? (
            <div className="text-center py-4 text-neutral-500">No pending content to verify</div>
          ) : (
            <div className="space-y-3">
              {pendingContents.slice(0, 3).map((content) => (
                <div key={content.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="material-icons text-warning mr-2 text-sm">schedule</span>
                    <span>{content.title}</span>
                  </div>
                  <Button 
                    variant="link" 
                    className="text-primary"
                    onClick={() => handleReview(content.id)}
                    disabled={verifyingContentId === content.id}
                  >
                    {verifyingContentId === content.id ? 'Reviewing...' : 'Review'}
                  </Button>
                </div>
              ))}
              
              {pendingContents.length > 3 && (
                <Button variant="link" className="text-primary text-sm w-full">
                  View all {pendingContents.length} pending items
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Assessment Standards</label>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-primary bg-opacity-10 text-primary text-xs">
              British Standards
            </Badge>
            <Badge variant="secondary" className="bg-primary bg-opacity-10 text-primary text-xs">
              Quality Assurance
            </Badge>
            <Badge variant="secondary" className="bg-primary bg-opacity-10 text-primary text-xs">
              QAQF Aligned
            </Badge>
          </div>
        </div>
        
        <Button variant="secondary" className="w-full">
          <span className="material-icons mr-2">verified</span>
          Verify & Moderate Content
        </Button>
      </div>
      
      {/* Featured verification image */}
      <div className="h-48 bg-neutral-100 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400" 
          alt="Content moderation and quality assurance process" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h4 className="font-bold text-lg">Quality Verification</h4>
          <p className="text-sm">Ensuring Educational Excellence</p>
        </div>
      </div>
    </Card>
  );
};

export default VerificationPanel;
