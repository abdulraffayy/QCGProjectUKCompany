import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { QAQFLevels, QAQFCharacteristics } from "../../lib/qaqf";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { apiRequest } from "../lib/queryClient";

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Check if we're regenerating content (redirected from CourseWorkflowView)
  useEffect(() => {
    const regenerateContentData = localStorage.getItem('regenerateContent');
    
    if (regenerateContentData) {
      try {
        const contentToRegenerate = JSON.parse(regenerateContentData);
        
        // Populate the form with the existing content data
        if (contentToRegenerate.title) {
          // Extract subject from the title (removing the QAQF Level part if present)
          const titleParts = contentToRegenerate.title.split('(QAQF Level');
          setSubject(titleParts[0].trim());
        }
        
        if (contentToRegenerate.type) {
          setContentType(contentToRegenerate.type);
        }
        
        if (contentToRegenerate.moduleCode) {
          setModuleCode(contentToRegenerate.moduleCode);
        }
        
        if (contentToRegenerate.qaqfLevel) {
          setQaqfLevel(contentToRegenerate.qaqfLevel.toString());
        }
        
        if (contentToRegenerate.characteristics && Array.isArray(contentToRegenerate.characteristics)) {
          setSelectedCharacteristics(contentToRegenerate.characteristics);
        } else if (contentToRegenerate.characteristics && typeof contentToRegenerate.characteristics === 'object') {
          // If characteristics is an object, extract the keys as numbers
          try {
            const characteristicIds = Object.keys(contentToRegenerate.characteristics)
              .map(key => parseInt(key))
              .filter(id => !isNaN(id));
            setSelectedCharacteristics(characteristicIds);
          } catch (error) {
            console.error('Error parsing characteristics:', error);
          }
        }
        
        // Set flag to show we're regenerating
        setIsRegenerating(true);
        
        // Show a toast notification to inform the user
        toast({
          title: "Content loaded for regeneration",
          description: "The existing content settings have been loaded. Generating new content...",
        });
        
        // Clear the localStorage item so we don't reload it on page refresh
        localStorage.removeItem('regenerateContent');
        
        // Automatically generate new content after a short delay to ensure state is updated
        setTimeout(() => {
          handleGenerate();
        }, 500);
      } catch (error) {
        console.error('Error parsing regeneration data:', error);
        localStorage.removeItem('regenerateContent');
      }
    }
  }, [toast]);
  
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
  
  // Handling toggling of QAQF characteristics
  const handleCharacteristicToggle = (characteristicId: number) => {
    setSelectedCharacteristics(current => 
      current.includes(characteristicId) 
        ? current.filter(id => id !== characteristicId)
        : [...current, characteristicId]
    );
  };
  
  // Generate mock video content
  const generateMockVideo = () => {
    return {
      animationStyle: animationStyle,
      duration: videoDuration,
      description: videoDescription || `This video explores ${subject} with a focus on QAQF Level ${qaqfLevel} implementation.`,
      thumbnailUrl: "https://via.placeholder.com/640x360.png?text=Video+Thumbnail",
      url: "#video-preview"
    };
  };
  
  // Generate mock assessment content
  const generateMockAssessment = () => {
    // Add questions based on source materials if they exist
    const baseQuestions = [
      {
        question: `What does QAQF Level ${qaqfLevel} primarily focus on?`,
        options: [
          "Basic content structure",
          "Advanced integration with pedagogical approaches",
          "Intermediate content organization",
          "Technical implementation details"
        ],
        correctAnswer: 1
      },
      {
        question: `Which of the following is NOT a characteristic of ${subject}?`,
        options: [
          "Critical analysis",
          "Evidence-based practice",
          "Theoretical foundations",
          "None of the above"
        ],
        correctAnswer: 3
      }
    ];
    
    // Add source material based questions when sources are provided
    let sourceMaterialQuestions = [];
    
    if (primarySourceMaterial) {
      // Create a question based on primary source material
      const primarySourceSnippet = primarySourceMaterial.length > 30 
        ? primarySourceMaterial.substring(0, 30) + "..." 
        : primarySourceMaterial;
        
      sourceMaterialQuestions.push({
        question: `Based on the primary source material, which statement is most accurate about ${subject}?`,
        options: [
          `${primarySourceSnippet} suggests a theoretical approach to ${subject}`,
          `${primarySourceSnippet} contradicts established ${subject} principles`,
          `${primarySourceSnippet} reinforces the importance of evidence-based practice in ${subject}`,
          `${primarySourceSnippet} is not relevant to ${subject}`
        ],
        correctAnswer: 2
      });
    }
    
    if (secondarySourceMaterial) {
      // Create a question based on secondary source material
      const secondarySourceSnippet = secondarySourceMaterial.length > 30 
        ? secondarySourceMaterial.substring(0, 30) + "..." 
        : secondarySourceMaterial;
        
      sourceMaterialQuestions.push({
        question: `According to the secondary source material, what is a key element of ${subject}?`,
        options: [
          `The integration of ${secondarySourceSnippet} with practical applications`,
          `The rejection of traditional approaches mentioned in ${secondarySourceSnippet}`,
          `The historical context described in ${secondarySourceSnippet}`,
          `None of the above`
        ],
        correctAnswer: 0
      });
    }
    
    return {
      type: "multiple-choice",
      questions: [...baseQuestions, ...sourceMaterialQuestions],
      timeLimit: 20,
      passingScore: 70,
      sourceBasedQuestions: sourceMaterialQuestions.length > 0
    };
  };
  
  // Handle content generation
  const handleGenerate = () => {
    if (!qaqfLevel) {
      toast({
        title: "Missing QAQF Level",
        description: "Please select a QAQF level for your content.",
        variant: "destructive"
      });
      return;
    }
    
    if (!subject) {
      toast({
        title: "Missing Subject",
        description: "Please enter a subject for your content.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedCharacteristics.length === 0) {
      toast({
        title: "No Characteristics Selected",
        description: "Please select at least one QAQF characteristic.",
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
    
    // Log source materials for debugging
    console.log("Primary Source Material:", primarySourceMaterial ? primarySourceMaterial.substring(0, 100) + "..." : "None");
    console.log("Secondary Source Material:", secondarySourceMaterial ? secondarySourceMaterial.substring(0, 100) + "..." : "None");
    
    // Force set extract characteristics if source materials are present
    if ((primarySourceMaterial || secondarySourceMaterial) && !extractCharacteristics) {
      setExtractCharacteristics(true);
      toast({
        title: "Source Materials Detected",
        description: "Automatically enabling extraction of QAQF characteristics from source materials.",
      });
    }
    
    // Simulating content generation
    setTimeout(() => {
      let mockContent;
      
      if (contentType === "video") {
        // Create video content with source material integration
        const hasSourceMaterials = primarySourceMaterial || secondarySourceMaterial;
        
        // Log source materials for debugging
        console.log("Generating content with source materials:", hasSourceMaterials);
        
        let videoDescriptionWithSources = videoDescription || `This video explores ${subject} with a focus on QAQF Level ${qaqfLevel} implementation.`;
        
        // If we have source materials, enhance the video description
        if (hasSourceMaterials) {
          videoDescriptionWithSources += "\n\nThis video draws from the following source materials:";
          
          if (primarySourceMaterial) {
            const primarySourceSnippet = primarySourceMaterial.length > 100 
              ? primarySourceMaterial.substring(0, 100) + "..." 
              : primarySourceMaterial;
            
            videoDescriptionWithSources += `\n\nPrimary Source: "${primarySourceSnippet}"`;
          }
          
          if (secondarySourceMaterial) {
            const secondarySourceSnippet = secondarySourceMaterial.length > 100 
              ? secondarySourceMaterial.substring(0, 100) + "..." 
              : secondarySourceMaterial;
            
            videoDescriptionWithSources += `\n\nSecondary Source: "${secondarySourceSnippet}"`;
          }
        }
        
        // Extract additional characteristics from source materials if enabled
        let extractedCharacteristics: number[] = [];
        if (extractCharacteristics && hasSourceMaterials) {
          // Simulate extracting characteristics based on source content
          extractedCharacteristics = primarySourceMaterial 
            ? [1, 3, 5, 7, 9].filter(id => !selectedCharacteristics.includes(id)).slice(0, 3)
            : [];
            
          extractedCharacteristics = [
            ...extractedCharacteristics,
            ...(secondarySourceMaterial 
              ? [2, 4, 6, 8].filter(id => !selectedCharacteristics.includes(id)).slice(0, 2)
              : [])
          ];
        }
        
        // Combine selected and extracted characteristics
        const combinedCharacteristics = Array.from(new Set([...selectedCharacteristics, ...extractedCharacteristics]));
        
        mockContent = {
          id: Math.floor(Math.random() * 1000),
          type: "video",
          title: `${subject} (QAQF Level ${qaqfLevel})`,
          moduleCode: moduleCode || "EDU-101",
          qaqfLevel: parseInt(qaqfLevel),
          characteristics: combinedCharacteristics,
          sourceMaterials: {
            primary: primarySourceMaterial || null,
            secondary: secondarySourceMaterial || null,
            extracted: extractCharacteristics && hasSourceMaterials
          },
          content: `# ${subject} - Video Content\n\n${videoDescriptionWithSources}\n\n## Source Material Integration\n${hasSourceMaterials 
            ? 'This video content has been developed with direct integration of provided source materials, ensuring academic rigor and content validity.'
            : 'No source materials were provided for this video content. Consider adding source materials for enhanced academic quality.'}`,
          video: {
            ...generateMockVideo(),
            description: videoDescriptionWithSources
          },
          assessment: generateMockAssessment()
        };
      } else {
        // Create text-based academic content with source material integration
        const hasSourceMaterials = primarySourceMaterial || secondarySourceMaterial;
        
        // Process source materials to extract insights and characteristics
        let extractedCharacteristics: number[] = [];
        let sourceAnalysis = "";
        let contentBody = "";
        
        // Track if we're actually using source materials to create better content
        const actuallyUsingSourceMaterials = hasSourceMaterials;
        
        toast({
          title: actuallyUsingSourceMaterials ? "Source Materials Applied" : "No Source Materials",
          description: actuallyUsingSourceMaterials 
            ? "Generating content with source material integration" 
            : "No source materials detected. Consider adding source materials for richer content.",
        });
        
        // Generate content body based on source materials
        if (hasSourceMaterials) {
          // Primary source processing
          if (primarySourceMaterial) {
            const primarySourceSnippet = primarySourceMaterial.length > 150 
              ? primarySourceMaterial.substring(0, 150) + "..." 
              : primarySourceMaterial;
            
            sourceAnalysis += "## Primary Source Analysis\n\n";
            sourceAnalysis += `The primary source material provides key insights for ${subject}:\n\n`;
            sourceAnalysis += `"${primarySourceSnippet}"\n\n`;
            
            // Extract QAQF characteristics if enabled
            if (extractCharacteristics) {
              // Simulate extracting characteristics based on primary source content
              const primarySourceExtractedCharacteristics = [1, 3, 5, 7, 9]
                .filter(id => !selectedCharacteristics.includes(id))
                .slice(0, 3);
              
              extractedCharacteristics = [...extractedCharacteristics, ...primarySourceExtractedCharacteristics];
              
              sourceAnalysis += `From analyzing the primary source, the following QAQF characteristics were identified:\n`;
              primarySourceExtractedCharacteristics.forEach(id => {
                const characteristic = QAQFCharacteristics.find(c => c.id === id);
                if (characteristic) {
                  sourceAnalysis += `- ${characteristic.name} (Level ${qaqfLevel})\n`;
                }
              });
              sourceAnalysis += "\n";
            }
            
            // Generate content that directly uses primary source material
            contentBody += "### Analysis from Primary Source\n\n";
            
            // Extract key sentences or concepts from the primary source
            const sentences = primarySourceMaterial.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const selectedSentences = sentences.length > 5 
              ? [sentences[0], sentences[Math.floor(sentences.length/3)], sentences[Math.floor(sentences.length*2/3)]]
              : sentences;
            
            selectedSentences.forEach(sentence => {
              contentBody += `${sentence.trim()}. This concept is fundamental to understanding ${subject} in the context of QAQF Level ${qaqfLevel}.\n\n`;
            });
            
            contentBody += `The primary source establishes the theoretical foundation for ${subject}, which aligns with QAQF Level ${qaqfLevel} standards requiring rigorous academic underpinnings.\n\n`;
          }
          
          // Secondary source processing
          if (secondarySourceMaterial) {
            const secondarySourceSnippet = secondarySourceMaterial.length > 150 
              ? secondarySourceMaterial.substring(0, 150) + "..." 
              : secondarySourceMaterial;
            
            sourceAnalysis += "## Secondary Source Analysis\n\n";
            sourceAnalysis += `The secondary source material provides additional context for ${subject}:\n\n`;
            sourceAnalysis += `"${secondarySourceSnippet}"\n\n`;
            
            // Extract QAQF characteristics if enabled
            if (extractCharacteristics) {
              // Simulate extracting characteristics based on secondary source content
              const secondarySourceExtractedCharacteristics = [2, 4, 6, 8]
                .filter(id => !selectedCharacteristics.includes(id))
                .slice(0, 2);
              
              extractedCharacteristics = [...extractedCharacteristics, ...secondarySourceExtractedCharacteristics];
              
              sourceAnalysis += `From analyzing the secondary source, the following QAQF characteristics were identified:\n`;
              secondarySourceExtractedCharacteristics.forEach(id => {
                const characteristic = QAQFCharacteristics.find(c => c.id === id);
                if (characteristic) {
                  sourceAnalysis += `- ${characteristic.name} (Level ${qaqfLevel})\n`;
                }
              });
              sourceAnalysis += "\n";
            }
            
            // Generate content that directly uses secondary source material
            contentBody += "### Integration with Secondary Source\n\n";
            
            // Extract key sentences or concepts from the secondary source
            const sentences = secondarySourceMaterial.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const selectedSentences = sentences.length > 5 
              ? [sentences[0], sentences[Math.floor(sentences.length/2)]]
              : sentences;
            
            selectedSentences.forEach(sentence => {
              contentBody += `${sentence.trim()}. This supports the broader application of ${subject} and meets QAQF Level ${qaqfLevel} requirements for comprehensive analysis.\n\n`;
            });
            
            contentBody += `The secondary source provides practical applications that complement the theoretical framework established above.\n\n`;
          }
        } else {
          // Generate generic content without source materials
          contentBody = `### Overview of ${subject}\n\nThis content has been developed to meet QAQF Level ${qaqfLevel} standards but lacks specific source material integration. For enhanced academic quality and alignment with highest QAQF standards, consider adding primary and secondary source materials.\n\n`;
          
          contentBody += `### Theoretical Framework\n\nThe ${subject} can be understood through the following key concepts at QAQF Level ${qaqfLevel}:\n\n`;
          contentBody += `1. Foundational principles of ${subject}\n`;
          contentBody += `2. Application in educational contexts\n`;
          contentBody += `3. Assessment and evaluation methodologies\n`;
          contentBody += `4. Integration with broader curriculum\n\n`;
          
          contentBody += `### Best Practices\n\nImplementing ${subject} at QAQF Level ${qaqfLevel} requires attention to:\n\n`;
          contentBody += `- Alignment with educational standards\n`;
          contentBody += `- Continuous quality improvement\n`;
          contentBody += `- Feedback integration mechanisms\n`;
          contentBody += `- Reflective practice\n\n`;
        }
        
        // Combine selected and extracted characteristics
        const combinedCharacteristics = Array.from(new Set([...selectedCharacteristics, ...extractedCharacteristics]));
        
        // Generate comprehensive content with explicit source material references and QAQF alignment
        mockContent = {
          id: Math.floor(Math.random() * 1000),
          type: contentType,
          title: `${subject} (QAQF Level ${qaqfLevel})`,
          moduleCode: moduleCode || "EDU-101",
          qaqfLevel: parseInt(qaqfLevel),
          characteristics: combinedCharacteristics,
          sourceMaterials: {
            primary: primarySourceMaterial || null,
            secondary: secondarySourceMaterial || null,
            extracted: extractCharacteristics && hasSourceMaterials
          },
          content: `# ${subject}\n\n## Module: ${moduleCode || 'EDU-101'}\n\n## QAQF Level ${qaqfLevel} Implementation\n\nThis ${contentType.replace('_', ' ')} integrates QAQF framework Level ${qaqfLevel} with ${combinedCharacteristics.length} characteristics.\n\n### QAQF Characteristics Applied\n\n${combinedCharacteristics.map(id => {
            // Find the characteristic by ID
            const characteristic = QAQFCharacteristics.find(c => c.id === id);
            return `- Characteristic ${id}: ${characteristic ? characteristic.name : `Unknown (${id})`}`;
          }).join('\n')}\n\n${additionalInstructions ? `### Additional Requirements\n${additionalInstructions}\n\n` : ''}### Main Content\n\n${contentBody}\n\n${sourceAnalysis ? `### Source Material Analysis\n\n${sourceAnalysis}\n\n` : ''}### Synthesis\n\nThis ${contentType.replace('_', ' ')} on ${subject} has been developed to align with QAQF Level ${qaqfLevel} standards${hasSourceMaterials ? ', with direct integration of source materials to ensure academic rigor and content validity' : ' but would benefit from source material integration for enhanced academic quality'}. The content structure and delivery methods are designed to facilitate effective learning outcomes while meeting British educational standards.\n\n`,
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
  
  // Handle saving generated content
  const handleSaveContent = async () => {
    if (!generatedContent) {
      toast({
        title: "No Content to Save",
        description: "Please generate content first before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real application, this would make an API call to save the content
      // Here we just simulate the backend saving process
      setTimeout(() => {
        setIsSaving(false);
        toast({
          title: "Content Saved Successfully",
          description: "Your content has been saved to the module library and can now be accessed from the Course Content tab.",
        });
        
        // Dispatch an event to switch to the Content tab in the parent component
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
              variant={contentType === "lecture" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("lecture")}
            >
              <span className="material-icons text-sm mr-2">menu_book</span>
              Lecture Notes
            </Button>
            <Button 
              variant={contentType === "tutorial" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("tutorial")}
            >
              <span className="material-icons text-sm mr-2">school</span>
              Tutorial
            </Button>
            <Button 
              variant={contentType === "case_study" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("case_study")}
            >
              <span className="material-icons text-sm mr-2">psychology</span>
              Case Study
            </Button>
            <Button 
              variant={contentType === "video" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setContentType("video")}
            >
              <span className="material-icons text-sm mr-2">videocam</span>
              Video Content
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
          </TabsList>
          
          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Module Title</Label>
                <Input
                  placeholder="Enter the subject or module title"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Module Code (Optional)</Label>
                <Input
                  placeholder="e.g. EDU101, BUS220"
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value)}
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">QAQF Level</Label>
                <Select 
                  value={qaqfLevel} 
                  onValueChange={setQaqfLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a QAQF level" />
                  </SelectTrigger>
                  <SelectContent>
                    {QAQFLevels.map((level) => (
                      <SelectItem key={level.level} value={level.level.toString()}>
                        {level.name}: {level.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Source Materials</h4>
                      {(primarySourceMaterial || secondarySourceMaterial) && (
                        <Badge variant="outline" className="bg-green-50 text-green-600">
                          {primarySourceMaterial && secondarySourceMaterial 
                            ? "Primary & Secondary Sources Added" 
                            : primarySourceMaterial 
                              ? "Primary Source Added" 
                              : "Secondary Source Added"}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="block text-sm font-medium text-neutral-700">Primary Source Material</Label>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => document.getElementById('primary-source-upload')?.click()}
                            >
                              <span className="material-icons text-xs mr-1">upload_file</span>
                              Upload File
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <span className="material-icons text-xs mr-1">link</span>
                                  Add Website
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Add Website as Source</DialogTitle>
                                  <DialogDescription>
                                    Enter a website URL to extract content as source material
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-4 py-4">
                                  <Input 
                                    id="primary-source-url" 
                                    placeholder="https://example.com/article" 
                                    className="w-full"
                                  />
                                  <p className="text-xs text-neutral-500">
                                    Note: The system will extract the main content from the website.
                                  </p>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      const urlInput = document.getElementById('primary-source-url') as HTMLInputElement;
                                      const url = urlInput?.value;
                                      
                                      if (!url) {
                                        toast({
                                          title: "URL Required",
                                          description: "Please enter a valid URL",
                                          variant: "destructive"
                                        });
                                        return;
                                      }
                                      
                                      try {
                                        // Validate URL format
                                        new URL(url);
                                        
                                        // Simulate fetching content from the URL
                                        toast({
                                          title: "Extracting content",
                                          description: "Fetching content from the provided URL...",
                                        });
                                        
                                        // In a real implementation, this would make an API call to extract content
                                        setTimeout(() => {
                                          // Simulate the extracted content
                                          const extractedContent = `Content extracted from ${url}\n\nThis is simulated content that would be extracted from the web page. In a real implementation, this would contain the actual content from the URL, processed and formatted for use as source material.\n\nThe extraction would typically include the main article text, headings, and other relevant content while filtering out navigation, ads, and other non-content elements.`;
                                          
                                          setPrimarySourceMaterial(extractedContent);
                                          
                                          toast({
                                            title: "Content extracted",
                                            description: `Successfully extracted content from ${url}`,
                                          });
                                          
                                          // Close the dialog
                                          const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                                          if (closeButton) {
                                            closeButton.click();
                                          }
                                        }, 1500);
                                      } catch (error) {
                                        toast({
                                          title: "Invalid URL",
                                          description: "Please enter a valid URL including http:// or https://",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                  >
                                    Extract Content
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <input
                            id="primary-source-upload"
                            type="file"
                            accept=".pdf,.docx,.txt"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Show file name in a preview area
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  try {
                                    // For text files, we can directly set the content
                                    if (file.type === 'text/plain') {
                                      setPrimarySourceMaterial(event.target?.result as string);
                                    } else {
                                      // For other file types like PDF or DOCX, we would need server-side processing
                                      // For now, just show that the file was uploaded
                                      toast({
                                        title: "File uploaded successfully",
                                        description: `${file.name} has been uploaded as primary source material.`,
                                      });
                                      setPrimarySourceMaterial(`File uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "Error processing file",
                                      description: "Please try a different file format or paste the content directly.",
                                      variant: "destructive",
                                    });
                                  }
                                };
                                
                                if (file.type === 'text/plain') {
                                  reader.readAsText(file);
                                } else {
                                  // For other file types, just read as data URL to confirm upload
                                  reader.readAsDataURL(file);
                                }
                              }
                            }}
                          />
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
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => document.getElementById('secondary-source-upload')?.click()}
                            >
                              <span className="material-icons text-xs mr-1">upload_file</span>
                              Upload File
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <span className="material-icons text-xs mr-1">link</span>
                                  Add Website
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Add Website as Source</DialogTitle>
                                  <DialogDescription>
                                    Enter a website URL to extract content as secondary source material
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-4 py-4">
                                  <Input 
                                    id="secondary-source-url" 
                                    placeholder="https://example.com/article" 
                                    className="w-full"
                                  />
                                  <p className="text-xs text-neutral-500">
                                    Note: The system will extract the main content from the website.
                                  </p>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      const urlInput = document.getElementById('secondary-source-url') as HTMLInputElement;
                                      const url = urlInput?.value;
                                      
                                      if (!url) {
                                        toast({
                                          title: "URL Required",
                                          description: "Please enter a valid URL",
                                          variant: "destructive"
                                        });
                                        return;
                                      }
                                      
                                      try {
                                        // Validate URL format
                                        new URL(url);
                                        
                                        // Simulate fetching content from the URL
                                        toast({
                                          title: "Extracting content",
                                          description: "Fetching content from the provided URL...",
                                        });
                                        
                                        // In a real implementation, this would make an API call to extract content
                                        setTimeout(() => {
                                          // Simulate the extracted content
                                          const extractedContent = `Content extracted from ${url}\n\nThis is simulated content that would be extracted from the web page. In a real implementation, this would contain the actual content from the URL, processed and formatted for use as source material.\n\nThe extraction would typically include the main article text, headings, and other relevant content while filtering out navigation, ads, and other non-content elements.`;
                                          
                                          setSecondarySourceMaterial(extractedContent);
                                          
                                          toast({
                                            title: "Content extracted",
                                            description: `Successfully extracted content from ${url}`,
                                          });
                                          
                                          // Close the dialog
                                          const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                                          if (closeButton) {
                                            closeButton.click();
                                          }
                                        }, 1500);
                                      } catch (error) {
                                        toast({
                                          title: "Invalid URL",
                                          description: "Please enter a valid URL including http:// or https://",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                  >
                                    Extract Content
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <input
                            id="secondary-source-upload"
                            type="file"
                            accept=".pdf,.docx,.txt"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Show file name in a preview area
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  try {
                                    // For text files, we can directly set the content
                                    if (file.type === 'text/plain') {
                                      setSecondarySourceMaterial(event.target?.result as string);
                                    } else {
                                      // For other file types like PDF or DOCX, we would need server-side processing
                                      // For now, just show that the file was uploaded
                                      toast({
                                        title: "File uploaded successfully",
                                        description: `${file.name} has been uploaded as secondary source material.`,
                                      });
                                      setSecondarySourceMaterial(`File uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "Error processing file",
                                      description: "Please try a different file format or paste the content directly.",
                                      variant: "destructive",
                                    });
                                  }
                                };
                                
                                if (file.type === 'text/plain') {
                                  reader.readAsText(file);
                                } else {
                                  // For other file types, just read as data URL to confirm upload
                                  reader.readAsDataURL(file);
                                }
                              }
                            }}
                          />
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
                <div className="mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{generatedContent.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-600">
                        QAQF Level 22 {generatedContent.qaqfLevel}
                      </Badge>
                      <Badge variant="outline">
                        Module: {generatedContent.moduleCode}
                      </Badge>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600">
                        Type: {generatedContent.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => {
                      setActiveTab("content");
                      setTimeout(() => {
                        handleGenerate();
                      }, 100);
                    }}
                  >
                    <span className="material-icons text-sm mr-1">refresh</span>
                    Regenerate
                  </Button>
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
                
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">QAQF Compliance Check</h4>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      Verify if the content meets all required characteristics for QAQF Level {generatedContent.qaqfLevel}.
                    </p>
                    <Button size="sm">Verify QAQF Compliance</Button>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">British Standards Check</h4>
                      <Badge variant="outline" className="bg-neutral-100 text-neutral-800">
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