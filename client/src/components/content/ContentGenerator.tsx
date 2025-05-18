import { useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { QAQFLevels, QAQFCharacteristics } from "@/lib/qaqf";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

const ContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [contentType, setContentType] = useState("academic_paper");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [qaqfLevel, setQaqfLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<number[]>([]);
  const [moduleCode, setModuleCode] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [primarySourceMaterial, setPrimarySourceMaterial] = useState("");
  const [secondarySourceMaterial, setSecondarySourceMaterial] = useState("");
  const [extractCharacteristics, setExtractCharacteristics] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Video specific options
  const [animationStyle, setAnimationStyle] = useState("2D Animation");
  const [videoDuration, setVideoDuration] = useState("3-5 minutes");
  const [videoDescription, setVideoDescription] = useState("");
  
  // Verification and moderation options
  const [verificationStatus, setVerificationStatus] = useState<string>("pending");
  const [moderationStatus, setModerationStatus] = useState<string>("pending");
  const [britishStandardsCompliance, setBritishStandardsCompliance] = useState<boolean>(false);
  const [complianceIssues, setComplianceIssues] = useState<string[]>([]);
  const [verifiedBy, setVerifiedBy] = useState<string>("");
  const [verificationDate, setVerificationDate] = useState<string>("");

  const handleCharacteristicToggle = (characteristicId: number) => {
    setSelectedCharacteristics(prev => 
      prev.includes(characteristicId) 
        ? prev.filter(id => id !== characteristicId) 
        : [...prev, characteristicId]
    );
  };

  const handleGenerate = () => {
    if (!qaqfLevel || !subject || selectedCharacteristics.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive"
      });
      return;
    }

    // For video content, check additional required fields
    if (contentType === "video" && !animationStyle) {
      toast({
        title: "Missing Video Information",
        description: "Please select an animation style for your video.",
        variant: "destructive"
      });
      return;
    }
    
    // Check for at least one source material if extract characteristics is enabled
    if (extractCharacteristics && !primarySourceMaterial && !secondarySourceMaterial) {
      toast({
        title: "Source Material Required",
        description: "Please provide at least one source material to extract QAQF characteristics.",
        variant: "destructive"
      });
      return;
    }
    
    // Set initial quality assurance states
    setVerificationStatus("pending");
    setModerationStatus("pending");
    setBritishStandardsCompliance(false);
    setComplianceIssues([]);
    setVerifiedBy("");
    setVerificationDate("");

    setIsGenerating(true);
    
    // Simulating content generation
    setTimeout(() => {
      let mockContent;
      
      if (contentType === "video") {
        // Create video content
        mockContent = {
          id: Math.floor(Math.random() * 1000),
          type: "video",
          title: `${subject} (QAQF Level ${qaqfLevel})`,
          moduleCode: moduleCode || "EDU-101",
          qaqfLevel: parseInt(qaqfLevel),
          characteristics: extractCharacteristics && (primarySourceMaterial || secondarySourceMaterial)
            ? [...selectedCharacteristics, 1, 2, 3] // Simulate extracting additional characteristics
            : selectedCharacteristics,
          sourceMaterials: {
            primary: primarySourceMaterial || null,
            secondary: secondarySourceMaterial || null,
            extracted: extractCharacteristics
          },
          video: generateMockVideo(),
          assessment: generateMockAssessment()
        };
      } else {
        // Create text-based academic content
        mockContent = {
          id: Math.floor(Math.random() * 1000),
          type: "academic_paper",
          title: `${subject} (QAQF Level ${qaqfLevel})`,
          moduleCode: moduleCode || "EDU-101",
          qaqfLevel: parseInt(qaqfLevel),
          characteristics: extractCharacteristics && (primarySourceMaterial || secondarySourceMaterial)
            ? [...selectedCharacteristics, 1, 2, 3] // Simulate extracting additional characteristics
            : selectedCharacteristics,
          sourceMaterials: {
            primary: primarySourceMaterial || null,
            secondary: secondarySourceMaterial || null,
            extracted: extractCharacteristics
          },
          content: `# ${subject}\n\n## Module: ${moduleCode || 'EDU-101'}\n\nThis content demonstrates QAQF Level ${qaqfLevel} implementation with selected characteristics.\n\n${additionalInstructions ? `### Notes\n${additionalInstructions}\n\n` : ''}### Main Content\nAcademic content generated based on the QAQF framework requirements and source materials.\n\n${primarySourceMaterial ? `### Source Material Analysis\nContent incorporates insights from primary source material.\n\n` : ''}${secondarySourceMaterial ? `### Supplementary Analysis\nContent enhanced with context from secondary source material.\n\n` : ''}`,
          assessment: generateMockAssessment()
        };
      }
      
      setGeneratedContent(mockContent);
      setShowPreview(true);
      setIsGenerating(false);
      
      const successMessage = contentType === "video" 
        ? "Your video content has been generated successfully."
        : "Your academic content has been generated successfully.";
        
      toast({
        title: "Content Generated Successfully",
        description: `${successMessage} Please proceed to the Module tab to manage your content or to the Assessment in Progress page to add assessment materials.`,
      });
      
      // Switch to Content Preview tab after successful generation
      setTimeout(() => {
        setActiveTab("preview");
      }, 1000);
    }, 2000);
  };
  
  // Generate video content mock
  const generateMockVideo = () => {
    return {
      id: Math.floor(Math.random() * 1000),
      title: subject || `Educational Video on QAQF Level ${qaqfLevel}`,
      description: videoDescription || `This video explains concepts related to ${subject} at QAQF Level ${qaqfLevel}`,
      animationStyle: animationStyle,
      duration: videoDuration,
      moduleCode: moduleCode || "EDU-101",
      characteristics: selectedCharacteristics,
      qaqfLevel: parseInt(qaqfLevel),
      thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      url: "#",
      createdAt: new Date().toISOString()
    };
  };

  const generateMockAssessment = () => {
    return {
      type: "standard",
      title: `${subject} Assessment`,
      description: `Standard assessment for ${subject} at QAQF Level ${qaqfLevel}`,
      questions: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        text: `Question ${i + 1} about ${subject}`,
        type: "multiple-choice",
        options: ["Option A", "Option B", "Option C", "Option D"]
      }))
    };
  };

  const handleSaveContent = async () => {
    if (!generatedContent) {
      toast({
        title: "No Content to Save",
        description: "Please generate content before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare content data
      const contentData = {
        title: generatedContent.title,
        description: `${contentType} for ${subject} at QAQF Level ${qaqfLevel}`,
        type: contentType,
        qaqfLevel: parseInt(qaqfLevel),
        moduleCode: moduleCode || null,
        createdByUserId: 1, // Default user ID
        content: generatedContent.content,
        characteristics: selectedCharacteristics,
        verificationStatus: "pending"
      };
      
      // Save to database using API
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save content');
      }
      
      const savedContent = await response.json();
      
      toast({
        title: "Content Saved Successfully",
        description: "Your course has been saved and is now available in Course Content.",
      });
      
      setShowPreview(false);
      setIsSaving(false);
      
      // Switch to the Course Content tab
      setTimeout(() => {
        // This will trigger parent component to switch tabs
        window.dispatchEvent(new CustomEvent('switchToContentTab'));
      }, 1000);
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error Saving Content",
        description: "There was an error saving your content. Please try again.",
        variant: "destructive"
      });
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <CardTitle className="text-lg font-bold mb-4">Course Generator</CardTitle>
        <p className="text-neutral-600 text-sm mb-6">Create academic course content aligned with QAQF framework</p>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-neutral-700 mb-1">Content Type</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
            <Button 
              variant={contentType === "academic_paper" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("academic_paper")}
            >
              <span className="material-icons text-sm mr-2">description</span>
              Academic Paper
            </Button>
            <Button 
              variant={contentType === "assignment" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("assignment")}
            >
              <span className="material-icons text-sm mr-2">assignment</span>
              Assignment
            </Button>
            <Button 
              variant={contentType === "lecture_notes" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("lecture_notes")}
            >
              <span className="material-icons text-sm mr-2">menu_book</span>
              Lecture Notes
            </Button>
            <Button 
              variant={contentType === "course_outline" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("course_outline")}
            >
              <span className="material-icons text-sm mr-2">list_alt</span>
              Course Outline
            </Button>
            <Button 
              variant={contentType === "teaching_resource" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("teaching_resource")}
            >
              <span className="material-icons text-sm mr-2">school</span>
              Teaching Resource
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="content">Content Details</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedContent}>Preview</TabsTrigger>
            <TabsTrigger value="approval" disabled={!generatedContent}>Approval</TabsTrigger>
          </TabsList>
          
          {/* Content Generation Options */}
          <TabsContent value="content" className="space-y-4 pt-2">
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">QAQF Level</Label>
                <Select value={qaqfLevel} onValueChange={setQaqfLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select QAQF Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {QAQFLevels.map((level) => (
                      <SelectItem key={level.id} value={String(level.id)}>
                        Level {level.id}: {level.name} ({level.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Module title</Label>
                <Input
                  type="text"
                  placeholder="Enter module title"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Module Code (Optional)</Label>
                <Input
                  type="text"
                  placeholder="e.g. EDU-101"
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value)}
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">QAQF Characteristics</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                  {QAQFCharacteristics.map((characteristic) => (
                    <div key={characteristic.id} className="flex items-center">
                      <Checkbox 
                        id={`characteristic-${characteristic.id}`}
                        checked={selectedCharacteristics.includes(characteristic.id)}
                        onCheckedChange={() => handleCharacteristicToggle(characteristic.id)}
                      />
                      <label 
                        htmlFor={`characteristic-${characteristic.id}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {characteristic.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Additional Instructions (Optional)</Label>
                <Textarea
                  placeholder="Enter any additional instructions or requirements"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  className="min-h-24"
                />
              </div>
              
              <div>
                <Label className="flex items-center text-sm font-medium text-neutral-700 mb-1">
                  <Checkbox 
                    id="extract-characteristics"
                    checked={extractCharacteristics}
                    onCheckedChange={(checked) => setExtractCharacteristics(checked === true)}
                    className="mr-2"
                  />
                  Extract additional QAQF characteristics from source materials
                </Label>
                
                <div className="space-y-3 mt-2">
                  <div className="border rounded-md p-4 bg-neutral-50">
                    <h4 className="font-medium mb-3">Source Materials</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="block text-sm font-medium text-neutral-700">Primary Source Material</Label>
                          <Button variant="outline" size="sm" className="text-xs">
                            <span className="material-icons text-xs mr-1">upload_file</span>
                            Upload File
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Enter or paste primary source material content"
                          value={primarySourceMaterial}
                          onChange={(e) => setPrimarySourceMaterial(e.target.value)}
                          className="min-h-24"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="block text-sm font-medium text-neutral-700">Secondary Source Material</Label>
                          <Button variant="outline" size="sm" className="text-xs">
                            <span className="material-icons text-xs mr-1">upload_file</span>
                            Upload File
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Enter or paste secondary source material content"
                          value={secondarySourceMaterial}
                          onChange={(e) => setSecondarySourceMaterial(e.target.value)}
                          className="min-h-24"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <Label className="block text-sm font-medium text-neutral-700 mb-1">Upload Additional Resources</Label>
                      <div className="border border-dashed rounded-md p-4 text-center">
                        <span className="material-icons text-neutral-400 text-3xl">cloud_upload</span>
                        <p className="text-sm text-neutral-600 mt-2">Drag and drop files here, or click to browse</p>
                        <p className="text-xs text-neutral-500 mt-1">Supports PDF, DOC, TXT (up to 10MB)</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          Browse Files
                        </Button>
                      </div>
                    </div>
                    
                    {extractCharacteristics && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-800">
                          <span className="font-medium">QAQF Extraction enabled:</span> The system will analyze your source materials to identify additional QAQF characteristics.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              

            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="mr-1 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Content Preview */}
          <TabsContent value="preview" className="space-y-4 pt-2">
            {generatedContent && (
              <div className="border rounded-md p-4 bg-white">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{generatedContent.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600">
                      QAQF Level {generatedContent.qaqfLevel}
                    </Badge>
                    <Badge variant="outline">
                      Module: {generatedContent.moduleCode}
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600">
                      Type: {generatedContent.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                {generatedContent.type === "video" ? (
                  <div>
                    <div className="aspect-video bg-neutral-100 rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={generatedContent.video.thumbnailUrl} 
                        alt="Video Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <span className="material-icons text-3xl text-primary">play_arrow</span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-medium">Video Description</h4>
                      <p className="text-neutral-600 text-sm mt-1">{generatedContent.video.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-sm">Animation Style</h4>
                        <p className="text-neutral-600 text-sm">{generatedContent.video.animationStyle}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Duration</h4>
                        <p className="text-neutral-600 text-sm">{generatedContent.video.duration}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none mb-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm overflow-auto max-h-96 bg-neutral-50 rounded-md p-4">
                      {generatedContent.content}
                    </pre>
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Next Steps</h4>
                  <p className="text-sm text-neutral-600 mb-4">
                    Your content has been generated. You can save it to your content library, or perform additional actions.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSaveContent} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className="mr-1 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-sm mr-1">save</span>
                          Save Content
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("approval")}>
                      <span className="material-icons text-sm mr-1">approval</span>
                      Proceed to Approval
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Approval Tab */}
          <TabsContent value="approval" className="space-y-4 pt-2">
            {generatedContent && (
              <div className="border rounded-md p-4 bg-white">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Content Approval Workflow</h3>
                  <p className="text-sm text-neutral-600">
                    Before your content can be published or used in modules, it needs to go through the approval process.
                    This ensures all content meets the required QAQF standards.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="border rounded-md p-4 bg-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">QAQF Verification</h4>
                      <Badge variant={verificationStatus === "pending" ? "outline" : "default"} className="bg-yellow-100 text-yellow-800">
                        Pending Verification
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Verify that this content meets the QAQF Level {generatedContent.qaqfLevel} requirements and includes all necessary characteristics.
                    </p>
                    <Button size="sm">Send for Verification</Button>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">British Standards Compliance</h4>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Not Checked
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Ensure the content complies with British educational standards and terminologies.
                    </p>
                    <Button size="sm">Check Compliance</Button>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Content Moderation</h4>
                      <Badge variant="outline" className="bg-neutral-100 text-neutral-800">
                        Not Started
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Review content for clarity, pedagogy, and academic integrity.
                    </p>
                    <Button size="sm">Request Moderation</Button>
                  </div>
                </div>
                
                <div className="mt-6 bg-neutral-50 p-4 rounded-md">
                  <p className="text-sm text-neutral-700">
                    <span className="font-medium">Note:</span> For assessment-related verification and quality control, please visit the 
                    <a href="/assessment-in-progress" className="text-primary font-medium ml-1">Assessment in Progress</a> page.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default ContentGenerator;