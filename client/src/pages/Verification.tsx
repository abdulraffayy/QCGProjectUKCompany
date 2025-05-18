import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Content } from '@shared/schema';
import { useToast } from "@/hooks/use-toast";
import EnhancedVerificationPanel from "@/components/verification/EnhancedVerificationPanel";
import BritishStandardsVerifier from "@/components/verification/BritishStandardsVerifier";

const VerificationPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get content data for verification
  const { data: contents = [], isLoading: isLoadingContents } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });
  
  // Filter contents by verification status "pending"
  const pendingContents = contents.filter(
    content => content.verificationStatus === 'pending'
  );
  
  // Filter contents based on search term
  const filteredContents = pendingContents.filter(content => 
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (content.description && content.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle verification completion
  const handleVerificationComplete = (status: string, feedback: string) => {
    if (!selectedContent) return;
    
    toast({
      title: "Verification Complete",
      description: `Content "${selectedContent.title}" has been marked as ${status}.`
    });
    
    // In a real implementation, you would update the content status in the database
    console.log(`Content ${selectedContent.id} verification status updated to ${status}`);
    console.log('Feedback:', feedback);
  };
  
  // Handle British standards compliance check completion
  const handleComplianceChecked = (isCompliant: boolean, issues: string[]) => {
    if (!selectedContent) return;
    
    toast({
      title: isCompliant ? "Standards Compliance Verified" : "Standards Compliance Issues Found",
      description: isCompliant 
        ? "The content meets British standards requirements."
        : `The content has ${issues.length} British standards compliance issues.`,
      variant: isCompliant ? "default" : "destructive"
    });
    
    // In a real implementation, you would update the content compliance status
    console.log(`Content ${selectedContent.id} compliance status: ${isCompliant ? 'compliant' : 'non-compliant'}`);
    console.log('Issues:', issues);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Content Verification</h2>
          <p className="text-neutral-600 mt-1">
            Verify content against QAQF and British standards
          </p>
        </div>
        
        <div className="flex items-center">
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Selection Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                Pending Content
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {isLoadingContents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredContents.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                  <span className="material-icons text-4xl text-neutral-300">inventory_2</span>
                  <p className="mt-2 text-neutral-500">No pending content available for verification</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {filteredContents.map(content => (
                    <div 
                      key={content.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedContent?.id === content.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-neutral-50'
                      }`}
                      onClick={() => setSelectedContent(content)}
                    >
                      <h3 className={`font-medium ${selectedContent?.id === content.id ? 'text-primary-foreground' : 'text-neutral-800'}`}>
                        {content.title}
                      </h3>
                      <p className={`text-sm mt-1 ${selectedContent?.id === content.id ? 'text-primary-foreground' : 'text-neutral-500'}`}>
                        {content.type.replace('_', ' ')}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs ${selectedContent?.id === content.id ? 'text-primary-foreground' : 'text-neutral-500'}`}>
                          QAQF Level {content.qaqfLevel}
                        </span>
                        <span className="mx-2 text-neutral-300">•</span>
                        <span className={`text-xs ${selectedContent?.id === content.id ? 'text-primary-foreground' : 'text-neutral-500'}`}>
                          {new Date(content.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Verification Panels */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <Tabs defaultValue="qaqf">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="qaqf">QAQF Verification</TabsTrigger>
                <TabsTrigger value="british">British Standards</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qaqf" className="mt-6">
                <EnhancedVerificationPanel 
                  content={selectedContent}
                  onVerificationComplete={handleVerificationComplete}
                />
              </TabsContent>
              
              <TabsContent value="british" className="mt-6">
                <BritishStandardsVerifier 
                  content={selectedContent}
                  onComplianceChecked={handleComplianceChecked}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full py-16">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <span className="material-icons text-4xl text-primary">fact_check</span>
                </div>
                <h3 className="text-xl font-semibold text-center">Select Content to Verify</h3>
                <p className="text-neutral-500 text-center mt-2 max-w-md">
                  Choose content from the list to verify against QAQF framework requirements and British standards
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;