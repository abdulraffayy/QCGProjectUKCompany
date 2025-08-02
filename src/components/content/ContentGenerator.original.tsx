import { useState } from 'react';
import { Card, CardTitle, CardContent } from "../ui/card";
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
import { Slider } from "../ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import MarkingCriteriaModule from "../../components/assessment/MarkingCriteriaModule";

const ContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [contentType] = useState("academic_paper");
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
  const [showMarkingCriteria, setShowMarkingCriteria] = useState(false);
  
  // Assessment specific options
  const [includeAssessment] = useState(true);
  const [assessmentType, setAssessmentType] = useState("multiple-choice");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  
  // Puzzle options
  const [puzzleType, setPuzzleType] = useState("crossword");
  
  // Quiz options
  const [quizTimeLimit, setQuizTimeLimit] = useState(0);
  const [useAdaptiveScoring, setUseAdaptiveScoring] = useState(false);
  
  // Video specific options
  const [animationStyle, setAnimationStyle] = useState("2D Animation");
  const [videoDuration, setVideoDuration] = useState("3-5 minutes");
  const [videoDescription, setVideoDescription] = useState("");
  
  // Marking criteria options
  const [markingAssessmentResult, setMarkingAssessmentResult] = useState<any>({
    rubricType: "Academic Standards",
    innovativeMethod: "Adaptive Assessment",
    overallResults: {
      percentage: 85,
      grade: "Excellent"
    },
    criteria: [
      {
        title: "Knowledge Understanding",
        rating: 4,
        description: "Demonstrates strong understanding of QAQF principles"
      },
      {
        title: "Critical Analysis",
        rating: 5,
        description: "Excellent critical evaluation of content and sources"
      },
      {
        title: "Structure & Organization",
        rating: 4,
        description: "Well-structured with clear organization of ideas"
      },
      {
        title: "Originality",
        rating: 3,
        description: "Shows satisfactory level of original thinking"
      }
    ]
  });

  
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

  // Handle switching between assessment types
  const handleAssessmentTypeChange = (type: string) => {
    setAssessmentType(type);
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
    
    // For academic content, require marking criteria to enforce integration
    if (contentType !== "video" && !markingAssessmentResult) {
      toast({
        title: "Marking Criteria Required",
        description: "Please add marking criteria to your content before generating",
        variant: "destructive"
      });
      setActiveTab("marking-criteria");
      return;
    }
    
    // Always require assessment for all content types
    if (!includeAssessment) {
      toast({
        title: "Assessment Required",
        description: "You must include assessment materials with your content as per QAQF requirements",
        variant: "destructive"
      });
      setActiveTab("assessment");
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
          assessment: includeAssessment ? generateMockAssessment() : null
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
          content: `# ${subject}\n\n## Module: ${moduleCode || 'EDU-101'}\n\nThis content demonstrates QAQF Level ${qaqfLevel} implementation with selected characteristics.\n\n${additionalInstructions ? `### Notes\n${additionalInstructions}\n\n` : ''}### Main Content\nAcademic content generated based on the QAQF framework requirements and source materials.\n\n${primarySourceMaterial ? `### Source Material Analysis\nContent incorporates insights from primary source material.\n\n` : ''}${secondarySourceMaterial ? `### Supplementary Analysis\nContent enhanced with context from secondary source material.\n\n` : ''}${markingAssessmentResult ? `### Marking Criteria\nThis content includes integrated marking criteria and assessment rubrics aligned with QAQF Level ${qaqfLevel}.\n\n**Overall Assessment Score**: ${markingAssessmentResult.overallResults?.percentage || 0}%\n**Method**: ${markingAssessmentResult.innovativeMethod || "Standard Assessment"}` : ''}`,
          assessment: includeAssessment ? generateMockAssessment() : null,
          markingCriteria: markingAssessmentResult
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
        description: includeAssessment 
          ? `${successMessage} Assessment materials are included. Please proceed to the Quality Assurance module to verify and moderate your content.` 
          : successMessage + " Please proceed to the Quality Assurance module to verify and moderate your content.",
      });
      
      // Switch to Quality Assurance tab after successful generation
      setTimeout(() => {
        setActiveTab("quality-assurance");
      }, 1000);
    }, 2000);
  };
  
  // Generate mock assessment based on selected type
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
    switch (assessmentType) {
      case "puzzle":
        return {
          type: "puzzle",
          puzzleType: puzzleType,
          title: `${subject} QAQF Puzzle Assessment`,
          description: `This ${puzzleType} puzzle tests understanding of ${subject} at QAQF Level ${qaqfLevel}.`,
          data: puzzleType === "crossword" ? generateCrosswordData() : generateWordSearchData()
        };
      case "sorting":
        return {
          type: "sorting",
          title: `${subject} QAQF Sorting Exercise`,
          description: "Sort these concepts into their appropriate QAQF characteristic categories.",
          categories: [
            { name: "Knowledge and Understanding", items: [] },
            { name: "Critical Thinking", items: [] },
            { name: "Digital Skills", items: [] }
          ],
          items: Array.from({ length: 9 }, (_, i) => ({
            id: i + 1,
            text: `Concept ${i + 1} related to ${subject}`,
            category: Math.floor(i / 3)
          }))
        };
      case "quiz":
        return {
          type: "quiz",
          title: `${subject} QAQF Assessment Quiz`,
          description: `This quiz tests understanding of ${subject} at QAQF Level ${qaqfLevel}.`,
          timeLimit: quizTimeLimit > 0 ? `${quizTimeLimit} minutes` : "Unlimited",
          adaptiveScoring: useAdaptiveScoring,
          questions: Array.from({ length: numberOfQuestions }, (_, i) => ({
            id: i + 1,
            text: `Question ${i + 1} about ${subject} related to QAQF Level ${qaqfLevel}`,
            type: i % 3 === 0 ? "multiple-choice" : i % 3 === 1 ? "essay" : "matching",
            options: i % 3 === 0 ? ["Option A", "Option B", "Option C", "Option D"] : undefined,
            correctAnswer: i % 3 === 0 ? 0 : undefined
          }))
        };
      default:
        return {
          type: "standard",
          title: `${subject} Assessment`,
          description: `Standard assessment for ${subject} at QAQF Level ${qaqfLevel}`,
          questions: Array.from({ length: numberOfQuestions }, (_, i) => ({
            id: i + 1,
            text: `Question ${i + 1} about ${subject}`,
            type: "multiple-choice",
            options: ["Option A", "Option B", "Option C", "Option D"]
          }))
        };
    }
  };
  
  // Helper functions for generating puzzle data
  const generateCrosswordData = () => {
    return {
      grid: [
        ["Q", "A", "Q", "F", "_", "_", "_", "_", "_", "_"],
        ["_", "_", "U", "_", "_", "_", "_", "_", "_", "_"],
        ["_", "_", "A", "_", "_", "L", "E", "V", "E", "L"],
        ["_", "_", "L", "_", "_", "_", "_", "_", "_", "_"],
        ["K", "N", "O", "W", "L", "E", "D", "G", "E", "_"],
        ["_", "_", "T", "_", "_", "_", "_", "_", "_", "_"],
        ["_", "_", "Y", "_", "_", "_", "_", "_", "_", "_"],
        ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_"],
        ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_"],
        ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_"]
      ],
      clues: {
        across: [
          "1. The framework for academic quality assessment (4 letters)",
          "3. Classification of QAQF implementation (5 letters)",
          "5. Foundation characteristic in QAQF (9 letters)"
        ],
        down: [
          "1. The standard for academic excellence (7 letters)",
          "2. The measure of learning outcomes (6 letters)"
        ]
      }
    };
  };
  
  const generateWordSearchData = () => {
    return {
      grid: [
        ["Q", "A", "Q", "F", "K", "X", "Y", "Z", "K", "L"],
        ["U", "L", "E", "V", "E", "L", "P", "Q", "N", "A"],
        ["A", "B", "C", "D", "E", "F", "G", "H", "O", "B"],
        ["L", "I", "T", "E", "R", "A", "C", "Y", "W", "C"],
        ["I", "J", "K", "L", "M", "N", "O", "P", "L", "D"],
        ["T", "E", "A", "C", "H", "I", "N", "G", "E", "E"],
        ["Y", "R", "S", "T", "U", "V", "W", "X", "D", "F"],
        ["A", "B", "S", "K", "I", "L", "L", "S", "G", "G"],
        ["H", "I", "E", "J", "K", "L", "M", "N", "E", "H"],
        ["O", "P", "S", "T", "U", "D", "E", "N", "T", "I"]
      ],
      words: [
        "QAQF", "LEVEL", "QUALITY", "KNOWLEDGE", "SKILLS", "TEACHING", "LITERACY", "STUDENT"
      ]
    };
  };

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <CardTitle className="text-lg font-bold mb-4">Course Generator</CardTitle>
        <p className="text-neutral-600 text-sm mb-6">Create academic course content with integrated assessments aligned with QAQF framework</p>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-neutral-700 mb-1">Content Type</Label>
          <div className="w-full">
            <Button 
              variant="default"
              className="flex items-center justify-center px-4 py-2 rounded-lg text-sm w-full"
            >
              <span className="material-icons text-sm mr-2">description</span>
              0Academic Course
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="content">Content Details</TabsTrigger>
            <TabsTrigger value="video-options">Video Options</TabsTrigger>
            <TabsTrigger value="marking-criteria">Marking Criteria</TabsTrigger>
            <TabsTrigger value="quality-assurance">Quality Assurance</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
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
                      <SelectItem key={level.level} value={level.level.toString()}>
                        Level {level.level} - {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Subject Area</Label>
                <Input 
                  type="text" 
                  placeholder="Enter subject area" 
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
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {QAQFCharacteristics.map((characteristic) => (
                    <div key={characteristic.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`characteristic-${characteristic.id}`}
                        checked={selectedCharacteristics.includes(characteristic.id)}
                        onCheckedChange={() => handleCharacteristicToggle(characteristic.id)}
                      />
                      <label
                        htmlFor={`characteristic-${characteristic.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                  placeholder="Enter any specific requirements or notes for content generation" 
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-4 border rounded-md p-4 bg-neutral-50">
                <h3 className="text-sm font-semibold">Source Materials</h3>
                <p className="text-xs text-neutral-500">Add up to two source materials to help define QAQF characteristics and generate more comprehensive content</p>
                
                <div>
                  <Label className="block text-sm font-medium text-neutral-700 mb-1">
                    Primary Source Material
                    <span className="text-xs text-neutral-500 ml-2">(Main reference for content generation)</span>
                  </Label>
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => document.getElementById('primary-source-upload')?.click()}
                      >
                        <span className="material-icons text-sm mr-1">upload_file</span>
                        Upload File
                      </Button>
                      <span className="text-xs text-neutral-500">Supported formats: .pdf, .docx, .txt (max 5MB)</span>
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
                                // For other file types like PDF or DOCX, we would normally need server-side processing
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
                    placeholder="Paste your primary source material here or upload a file" 
                    value={primarySourceMaterial}
                    onChange={(e) => setPrimarySourceMaterial(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-neutral-700 mb-1">
                    Secondary Source Material
                    <span className="text-xs text-neutral-500 ml-2">(Additional context and characteristics)</span>
                  </Label>
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => document.getElementById('secondary-source-upload')?.click()}
                      >
                        <span className="material-icons text-sm mr-1">upload_file</span>
                        Upload File
                      </Button>
                      <span className="text-xs text-neutral-500">Supported formats: .pdf, .docx, .txt (max 5MB)</span>
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
                                // For other file types like PDF or DOCX, we would normally need server-side processing
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
                    placeholder="Paste your secondary source material here or upload a file" 
                    value={secondarySourceMaterial}
                    onChange={(e) => setSecondarySourceMaterial(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="extract-characteristics" 
                    checked={extractCharacteristics}
                    onCheckedChange={(checked) => {
                      setExtractCharacteristics(checked === true);
                    }}
                  />
                  <label
                    htmlFor="extract-characteristics"
                    className="text-sm text-neutral-600 leading-none"
                  >
                    Automatically extract QAQF characteristics from source materials
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Video Options */}
          <TabsContent value="video-options" className="space-y-4 pt-2">
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Animation Style</Label>
                <Select value={animationStyle} onValueChange={setAnimationStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select animation style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2D Animation">2D Animation</SelectItem>
                    <SelectItem value="3D Animation">3D Animation</SelectItem>
                    <SelectItem value="Motion Graphics">Motion Graphics</SelectItem>
                    <SelectItem value="Whiteboard Animation">Whiteboard Animation</SelectItem>
                    <SelectItem value="Stop Motion">Stop Motion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Video Duration</Label>
                <Select value={videoDuration} onValueChange={setVideoDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select video duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 minutes">1-2 minutes (Short)</SelectItem>
                    <SelectItem value="3-5 minutes">3-5 minutes (Standard)</SelectItem>
                    <SelectItem value="5-10 minutes">5-10 minutes (Extended)</SelectItem>
                    <SelectItem value="10-15 minutes">10-15 minutes (In-depth)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Video Description</Label>
                <Textarea 
                  placeholder="Describe what should be included in the video" 
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="p-4 bg-secondary/5 rounded-md space-y-3">
                <h4 className="font-medium flex items-center text-sm">
                  <span className="material-icons text-sm mr-1">lightbulb</span>
                  Animation Style Guidelines
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-white rounded border">
                    <p className="font-medium">2D Animation</p>
                    <p className="text-neutral-600">Best for simplified concepts, character-based explanations</p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <p className="font-medium">3D Animation</p>
                    <p className="text-neutral-600">Ideal for spatial concepts, complex processes visualization</p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <p className="font-medium">Motion Graphics</p>
                    <p className="text-neutral-600">Perfect for data visualization, statistics, and abstract concepts</p>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <p className="font-medium">Whiteboard Animation</p>
                    <p className="text-neutral-600">Great for step-by-step processes and storytelling</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Marking Criteria Options */}
          <TabsContent value="marking-criteria" className="space-y-4 pt-2">
            <div className="space-y-4">
              <div className="bg-secondary/5 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="material-icons text-base mr-2">assessment</span>
                  Marking Criteria & Rubrics
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Enhance your content with standardized marking criteria and innovative marketing assessment methodologies
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 border rounded-md bg-white">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <span className="material-icons text-sm mr-1">grading</span>
                      Rubric-Based Assessment
                    </h4>
                    <p className="text-xs text-neutral-600 mb-3">
                      Create detailed rubrics aligned with QAQF framework to assess content quality and standards compliance
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">QAQF-Aligned</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary text-xs">Standard</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md bg-white">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <span className="material-icons text-sm mr-1">campaign</span>
                      Marketing Methodologies
                    </h4>
                    <p className="text-xs text-neutral-600 mb-3">
                      Incorporate innovative marketing assessment tools to evaluate the effectiveness of content
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-accent font-medium">Market-Focused</span>
                      <Badge variant="outline" className="bg-accent/10 text-accent text-xs">Innovative</Badge>
                    </div>
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => setShowMarkingCriteria(true)}
                >
                  <span className="material-icons text-sm mr-1">add_circle</span>
                  Add Marking Criteria to Content
                </Button>
              </div>
              
              {markingAssessmentResult && (
                <div className="border rounded-md p-4">
                  <h4 className="font-medium text-sm mb-3">Applied Assessment Criteria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="p-2 bg-neutral-100 rounded-md">
                      <p className="text-xs text-neutral-600">Rubric Type</p>
                      <p className="text-sm font-medium truncate">{markingAssessmentResult.rubricType}</p>
                    </div>
                    <div className="p-2 bg-neutral-100 rounded-md">
                      <p className="text-xs text-neutral-600">Methodology</p>
                      <p className="text-sm font-medium">{markingAssessmentResult.innovativeMethod}</p>
                    </div>
                    <div className="p-2 bg-neutral-100 rounded-md">
                      <p className="text-xs text-neutral-600">Overall Score</p>
                      <p className="text-sm font-medium">{markingAssessmentResult.overallResults?.percentage}%</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowMarkingCriteria(true)}
                  >
                    <span className="material-icons text-xs mr-1">edit</span>
                    Edit Assessment Criteria
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Quality Assurance Module */}
          <TabsContent value="quality-assurance" className="space-y-4 pt-2">
            <div className="mb-4">
              <Card className="border-0 shadow-sm">
                <CardTitle className="px-4 py-3 text-md font-medium border-b bg-muted/20">
                  Quality Assurance Module
                </CardTitle>
                <CardContent className="p-4">
                  <p className="text-sm text-neutral-600 mb-4">
                    Comprehensive quality assessment for QAQF content including verification, moderation, and standards compliance
                  </p>
                  
                  <Tabs defaultValue="verification" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="verification" className="text-xs">
                        <span className="material-icons text-xs mr-1">check_circle</span>
                        Verification
                      </TabsTrigger>
                      <TabsTrigger value="standards" className="text-xs">
                        <span className="material-icons text-xs mr-1">gavel</span>
                        British Standards
                      </TabsTrigger>
                      <TabsTrigger value="moderation" className="text-xs">
                        <span className="material-icons text-xs mr-1">shield</span>
                        Moderation
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Verification Tab */}
                    <TabsContent value="verification" className="space-y-4 pt-1">
                      <div className="bg-white border rounded-md p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-semibold flex items-center">
                            <span className="material-icons text-base mr-2">verified</span>
                            Content Verification Status
                          </h3>
                          <Badge 
                            variant={verificationStatus === "verified" ? "default" : 
                                  verificationStatus === "rejected" ? "destructive" : "outline"}
                            className="px-2 py-1"
                          >
                            {verificationStatus === "verified" ? "Verified" : 
                            verificationStatus === "rejected" ? "Rejected" : "Pending Verification"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-neutral-600 mb-4">
                          Verify that content meets academic standards and adheres to QAQF requirements
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col space-y-2">
                            <Label htmlFor="verified-by" className="text-sm">Verified By</Label>
                            <Input 
                              id="verified-by" 
                              value={verifiedBy}
                              onChange={(e) => setVerifiedBy(e.target.value)}
                              placeholder="Enter verifier name"
                            />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Label htmlFor="verification-date" className="text-sm">Verification Date</Label>
                            <Input 
                              id="verification-date" 
                              type="date"
                              value={verificationDate}
                              onChange={(e) => setVerificationDate(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setVerificationStatus("verified");
                              setBritishStandardsCompliance(true);
                              setComplianceIssues([]);
                              if (!verificationDate) {
                                setVerificationDate(new Date().toISOString().split('T')[0]);
                              }
                              
                              toast({
                                title: "Content Verified",
                                description: "Content has been verified and marked as compliant",
                              });
                            }}
                            className="flex-1"
                          >
                            <span className="material-icons text-green-600 text-sm mr-1">check_circle</span>
                            Verify
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              setVerificationStatus("rejected");
                              setBritishStandardsCompliance(false);
                              if (!verificationDate) {
                                setVerificationDate(new Date().toISOString().split('T')[0]);
                              }
                              
                              toast({
                                title: "Content Rejected",
                                description: "Content has been rejected due to compliance issues",
                                variant: "destructive"
                              });
                            }}
                            className="flex-1"
                          >
                            <span className="material-icons text-red-600 text-sm mr-1">cancel</span>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* British Standards Tab */}
                    <TabsContent value="standards" className="space-y-4 pt-1">
                      <div className="bg-white border rounded-md p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-semibold flex items-center">
                            <span className="material-icons text-base mr-2">flag</span>
                            British Academic Standards Compliance
                          </h3>
                          <Badge 
                            variant={britishStandardsCompliance ? "default" : "outline"}
                            className="px-2 py-1"
                          >
                            {britishStandardsCompliance ? "Compliant" : "Non-Compliant"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-neutral-600 mb-4">
                          Ensure content adheres to British academic standards for quality and consistency
                        </p>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-md">
                            <div className="flex items-center">
                              <span className="material-icons text-sm mr-2">flag</span>
                              <span className="text-sm font-medium">Standards Compliance</span>
                            </div>
                            <Switch 
                              checked={britishStandardsCompliance}
                              onCheckedChange={setBritishStandardsCompliance}
                            />
                          </div>
                          
                          {britishStandardsCompliance && (
                            <div className="p-3 border border-green-200 bg-green-50 rounded-md">
                              <p className="text-sm text-green-700 flex items-center">
                                <span className="material-icons text-green-600 mr-1 text-sm">check_circle</span>
                                Content complies with British academic standards
                              </p>
                            </div>
                          )}
                          
                          {!britishStandardsCompliance && (
                            <div>
                              <p className="text-sm text-neutral-700 mb-2">Compliance Issues:</p>
                              <div className="space-y-2">
                                {complianceIssues.length > 0 ? (
                                  complianceIssues.map((issue, index) => (
                                    <div key={index} className="flex items-start bg-red-50 p-2 rounded border border-red-100">
                                      <span className="material-icons text-red-500 text-sm mr-2 mt-0.5">error</span>
                                      <p className="text-sm text-red-700">{issue}</p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center p-3 bg-neutral-100 rounded-md">
                                    <span className="material-icons text-neutral-400 mr-2 text-sm">note_add</span>
                                    <p className="text-sm text-neutral-500">No issues have been added yet</p>
                                  </div>
                                )}
                              </div>
                              <div className="mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const newIssue = "Sample issue: Formatting does not conform to British standards";
                                    setComplianceIssues([...complianceIssues, newIssue]);
                                  }}
                                  className="w-full"
                                >
                                  <span className="material-icons text-xs mr-1">add</span>
                                  Add Issue
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Moderation Tab */}
                    <TabsContent value="moderation" className="space-y-4 pt-1">
                      <div className="bg-white border rounded-md p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-semibold flex items-center">
                            <span className="material-icons text-base mr-2">tune</span>
                            Content Moderation
                          </h3>
                          <Badge 
                            variant={moderationStatus === "approved" ? "default" : 
                                  moderationStatus === "rejected" ? "destructive" : "outline"}
                            className="px-2 py-1"
                          >
                            {moderationStatus === "approved" ? "Approved" : 
                            moderationStatus === "rejected" ? "Rejected" : "Pending Moderation"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-neutral-600 mb-4">
                          Moderate content for appropriate language, accessibility, and pedagogical clarity
                        </p>
                        
                        <div className="space-y-3 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 border rounded-md bg-neutral-50">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium">Readability</h4>
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Good</Badge>
                              </div>
                              <p className="text-xs text-neutral-600">Content is readable and accessible for the target audience</p>
                            </div>
                            
                            <div className="p-3 border rounded-md bg-neutral-50">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium">Language</h4>
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Appropriate</Badge>
                              </div>
                              <p className="text-xs text-neutral-600">Language is appropriate and adheres to academic standards</p>
                            </div>
                            
                            <div className="p-3 border rounded-md bg-neutral-50">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium">Structure</h4>
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Well-Organized</Badge>
                              </div>
                              <p className="text-xs text-neutral-600">Content structure follows pedagogical best practices</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setModerationStatus("approved");
                              toast({
                                title: "Content Moderation Approved",
                                description: "Content has passed moderation standards",
                              });
                            }}
                            className="flex-1"
                          >
                            <span className="material-icons text-green-600 text-sm mr-1">check_circle</span>
                            Approve
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              setModerationStatus("rejected");
                              toast({
                                title: "Content Moderation Rejected",
                                description: "Content did not meet moderation standards",
                                variant: "destructive"
                              });
                            }}
                            className="flex-1"
                          >
                            <span className="material-icons text-red-600 text-sm mr-1">cancel</span>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Assessment Options */}
          <TabsContent value="assessment" className="space-y-4 pt-2">
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Assessment Type</Label>
                <Select value={assessmentType} onValueChange={handleAssessmentTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="puzzle">Puzzle</SelectItem>
                    <SelectItem value="sorting">Sorting Exercise</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {assessmentType === "puzzle" && (
                <div>
                  <Label className="block text-sm font-medium text-neutral-700 mb-1">Puzzle Type</Label>
                  <Select value={puzzleType} onValueChange={setPuzzleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select puzzle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crossword">Crossword</SelectItem>
                      <SelectItem value="wordSearch">Word Search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {assessmentType === "quiz" && (
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-neutral-700 mb-1">Time Limit (minutes)</Label>
                    <Input 
                      type="number" 
                      value={quizTimeLimit}
                      onChange={(e) => setQuizTimeLimit(parseInt(e.target.value) || 0)}
                      placeholder="0 for unlimited"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adaptive-scoring"
                      checked={useAdaptiveScoring}
                      onCheckedChange={(checked) => setUseAdaptiveScoring(checked === true)}
                    />
                    <label
                      htmlFor="adaptive-scoring"
                      className="text-sm font-medium leading-none"
                    >
                      Use adaptive scoring and feedback
                    </label>
                  </div>
                </div>
              )}
              
              {/* Standard assessment options */}
              {(assessmentType === "multiple-choice" || assessmentType === "essay" || assessmentType === "mixed") && (
                <div>
                  <Label className="block text-sm font-medium mb-1">
                    Number of Questions: {numberOfQuestions}
                  </Label>
                  <Slider defaultValue={[10]}
                    min={5}
                    max={20}
                    step={1}
                    value={[numberOfQuestions]}
                    onValueChange={(value) => setNumberOfQuestions(value[0])}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full mt-4"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="material-icons animate-spin mr-2">refresh</span>
              Generating Content...
            </>
          ) : (
            <>
              <span className="material-icons mr-2">auto_awesome</span>
              Generate {includeAssessment ? "Content with Assessment" : "Content"}
            </>
          )}
        </Button>
      </div>
      
      {/* Marking Criteria Dialog */}
      <Dialog open={showMarkingCriteria} onOpenChange={setShowMarkingCriteria}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Marking Criteria & Assessment</DialogTitle>
            <DialogDescription>
              Create standardized assessment rubrics and generate marketing strategies
            </DialogDescription>
          </DialogHeader>
          
          <MarkingCriteriaModule
            contentType={contentType}
            subject={subject}
            qaqfLevel={parseInt(qaqfLevel) || 1}
            onAssessmentComplete={(result) => {
              setMarkingAssessmentResult(result);
              setShowMarkingCriteria(false);
              
              toast({
                title: "Assessment Created",
                description: "Marking criteria and assessment have been applied to your content",
              });
            }}
            onClose={() => setShowMarkingCriteria(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {generatedContent?.title || "Generated Content"}
            </DialogTitle>
            <DialogDescription>
              {generatedContent?.moduleCode && (
                <Badge variant="outline" className="mr-2">
                  {generatedContent.moduleCode}
                </Badge>
              )}
              {generatedContent?.qaqfLevel && (
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                  QAQF Level {generatedContent.qaqfLevel}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {generatedContent && (
            <div className="mt-4">
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  {generatedContent.type === "video" && (
                    <TabsTrigger value="video">
                      Video
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">Video</Badge>
                    </TabsTrigger>
                  )}
                  {generatedContent.assessment && (
                    <TabsTrigger value="assessment">
                      Assessment
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">Required</Badge>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="marking">
                    Marking Criteria
                    <Badge variant="outline" className="ml-2 bg-accent/10 text-accent text-xs">QAQF</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="pt-4">
                  {generatedContent.type === "academic_paper" ? (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm font-sans p-4 bg-neutral-50 rounded-md">
                        {generatedContent.content}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <span className="material-icons text-primary text-2xl">videocam</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Video Content Generated</h3>
                      <p className="text-neutral-600 mb-4">
                        This content has been generated as a video. Please check the Video tab to preview it.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Video Content Preview */}
                {generatedContent.type === "video" && (
                  <TabsContent value="video" className="pt-4">
                    <div className="space-y-4">
                      <div className="bg-neutral-900 aspect-video rounded-lg relative overflow-hidden">
                        <img 
                          src={generatedContent.video.thumbnailUrl} 
                          alt="Video thumbnail" 
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="material-icons text-white text-6xl mb-4">play_circle</span>
                          <p className="text-white text-lg font-medium">Video Preview</p>
                          <div className="flex items-center mt-2 text-white/80 text-sm">
                            <span className="material-icons text-sm mr-1">movie</span>
                            <span>{generatedContent.video.animationStyle}</span>
                            <span className="mx-2">•</span>
                            <span className="material-icons text-sm mr-1">schedule</span>
                            <span>{generatedContent.video.duration}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-md bg-neutral-50">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <span className="material-icons text-sm mr-1">movie</span>
                            Animation Style
                          </h4>
                          <p className="text-sm text-neutral-600">{generatedContent.video.animationStyle}</p>
                        </div>
                        <div className="p-4 border rounded-md bg-neutral-50">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <span className="material-icons text-sm mr-1">schedule</span>
                            Duration
                          </h4>
                          <p className="text-sm text-neutral-600">{generatedContent.video.duration}</p>
                        </div>
                        <div className="p-4 border rounded-md bg-neutral-50">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <span className="material-icons text-sm mr-1">school</span>
                            QAQF Level
                          </h4>
                          <p className="text-sm text-neutral-600">Level {generatedContent.video.qaqfLevel}</p>
                        </div>
                      </div>
                      
                      {generatedContent.video.description && (
                        <div className="border rounded-md p-4">
                          <h4 className="text-sm font-medium mb-2">Video Description</h4>
                          <p className="text-sm text-neutral-600 whitespace-pre-line">
                            {generatedContent.video.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}
                
                {/* Marking Criteria Content */}
                <TabsContent value="marking" className="pt-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <span className="material-icons text-accent text-base mr-2">assessment</span>
                      QAQF Marking Criteria and Rubric
                    </h3>
                    
                    {markingAssessmentResult ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-neutral-50 rounded-md">
                            <h4 className="text-sm font-medium text-neutral-700 mb-1">Rubric Type</h4>
                            <p className="text-sm">{markingAssessmentResult.rubricType || "Standard"}</p>
                          </div>
                          <div className="p-3 bg-neutral-50 rounded-md">
                            <h4 className="text-sm font-medium text-neutral-700 mb-1">Overall Rating</h4>
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-primary">{markingAssessmentResult.overallResults?.percentage || 0}%</span>
                              <Badge className="ml-2 bg-primary/10 text-primary">
                                {markingAssessmentResult.overallResults?.grade || "N/A"}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 bg-neutral-50 rounded-md">
                            <h4 className="text-sm font-medium text-neutral-700 mb-1">Marketing Method</h4>
                            <p className="text-sm">{markingAssessmentResult.innovativeMethod || "Standard Assessment"}</p>
                          </div>
                        </div>
                        
                        {markingAssessmentResult.criteria && markingAssessmentResult.criteria.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Criteria Breakdown</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {markingAssessmentResult.criteria.map((criterion: any, index: number) => (
                                <div key={index} className="border p-3 rounded-md">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium">{criterion.title}</span>
                                    <Badge variant={criterion.rating >= 4 ? "default" : "outline"}>
                                      {criterion.rating}/5
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-neutral-600">{criterion.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <span className="material-icons text-neutral-400 text-3xl mb-2">warning</span>
                        <h4 className="text-base font-medium mb-1">No Marking Criteria Applied</h4>
                        <p className="text-sm text-neutral-600 mb-4">
                          You need to add marking criteria to this content before generating.
                        </p>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setShowPreview(false);
                            setActiveTab("marking-criteria");
                          }}
                        >
                          <span className="material-icons text-xs mr-1">add</span>
                          Add Marking Criteria
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {generatedContent.assessment && (
                  <TabsContent value="assessment" className="pt-4">
                    <div className="border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-2">{generatedContent.assessment.title}</h3>
                      <p className="text-neutral-600 mb-4">{generatedContent.assessment.description}</p>
                      
                      {/* Puzzle Assessment Preview */}
                      {generatedContent.assessment.type === "puzzle" && generatedContent.assessment.puzzleType === "crossword" && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-3">Crossword Puzzle</h4>
                          <div className="grid grid-cols-10 gap-1 mb-4">
                            {generatedContent.assessment.data.grid.map((row: string[], rowIndex: number) => (
                              row.map((cell: string, cellIndex: number) => (
                                <div 
                                  key={`${rowIndex}-${cellIndex}`} 
                                  className={`w-8 h-8 flex items-center justify-center text-xs font-medium border ${cell === '_' ? 'bg-neutral-100' : 'bg-white'}`}
                                >
                                  {cell !== '_' ? cell : ''}
                                </div>
                              ))
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium mb-2">Across</h5>
                              <ul className="list-disc pl-5 text-sm">
                                {generatedContent.assessment.data.clues.across.map((clue: string, index: number) => (
                                  <li key={`across-${index}`} className="mb-1">{clue}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-2">Down</h5>
                              <ul className="list-disc pl-5 text-sm">
                                {generatedContent.assessment.data.clues.down.map((clue: string, index: number) => (
                                  <li key={`down-${index}`} className="mb-1">{clue}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Word Search Preview */}
                      {generatedContent.assessment.type === "puzzle" && generatedContent.assessment.puzzleType === "wordSearch" && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-3">Word Search Puzzle</h4>
                          <div className="grid grid-cols-10 gap-1 mb-4">
                            {generatedContent.assessment.data.grid.map((row: string[], rowIndex: number) => (
                              row.map((cell: string, cellIndex: number) => (
                                <div 
                                  key={`${rowIndex}-${cellIndex}`} 
                                  className="w-8 h-8 flex items-center justify-center text-xs font-medium border bg-white"
                                >
                                  {cell}
                                </div>
                              ))
                            ))}
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Words to Find</h5>
                            <div className="flex flex-wrap gap-2">
                              {generatedContent.assessment.data.words.map((word: string, index: number) => (
                                <Badge key={`word-${index}`} variant="outline" className="font-mono">
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Sorting Exercise Preview */}
                      {generatedContent.assessment.type === "sorting" && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-3">Sorting Exercise</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {generatedContent.assessment.categories.map((category: any, index: number) => (
                              <div key={`category-${index}`} className="border rounded p-3 bg-secondary/5">
                                <h5 className="text-sm font-medium mb-2">{category.name}</h5>
                                <div className="min-h-[100px]"></div>
                              </div>
                            ))}
                          </div>
                          
                          <h5 className="text-sm font-medium mb-2">Items to Sort</h5>
                          <div className="flex flex-wrap gap-2 border-t pt-3">
                            {generatedContent.assessment.items.map((item: any, index: number) => (
                              <div 
                                key={`item-${index}`} 
                                className="border rounded p-2 bg-white shadow-sm text-sm cursor-move"
                              >
                                {item.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Quiz Assessment Preview */}
                      {generatedContent.assessment.type === "quiz" && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="text-xs">
                              {generatedContent.assessment.timeLimit}
                            </Badge>
                            <div className="text-sm text-neutral-500">
                              {generatedContent.assessment.questions.length} questions
                            </div>
                          </div>
                          
                          <div className="border rounded overflow-hidden">
                            {generatedContent.assessment.questions.slice(0, 3).map((question: any, index: number) => (
                              <div 
                                key={`question-${index}`} 
                                className={`p-4 ${index > 0 ? "border-t" : ""}`}
                              >
                                <div className="flex items-start mb-3">
                                  <span className="font-medium mr-2">Q{index + 1}.</span>
                                  <span>{question.text}</span>
                                </div>
                                
                                {question.type === "multiple-choice" && question.options && (
                                  <div className="ml-6 space-y-2">
                                    {question.options.map((option: string, optIndex: number) => (
                                      <div key={`option-${optIndex}`} className="flex items-center space-x-2">
                                        <div className="w-4 h-4 rounded-full border"></div>
                                        <span className="text-sm">{option}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {generatedContent.assessment.questions.length > 3 && (
                              <div className="p-4 border-t text-center text-neutral-500 text-sm">
                                + {generatedContent.assessment.questions.length - 3} more questions
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
            >
              Close Preview
            </Button>
            <Button 
              onClick={async () => {
                if (!generatedContent) {
                  toast({
                    title: "No Content Available",
                    description: "Please generate content before saving.",
                    variant: "destructive"
                  });
                  return;
                }
                
                try {
                  setIsSaving(true);
                  
                  // Prepare content data for saving - ensure all fields are correctly formatted
                  const contentData = {
                    type: contentType || "academic_paper",
                    title: generatedContent.title || `${subject} - QAQF Level ${qaqfLevel}`,
                    content: typeof generatedContent.content === 'string' ? generatedContent.content : JSON.stringify(generatedContent),
                    description: `${contentType} for ${subject} at QAQF Level ${qaqfLevel}`,
                    qaqfLevel: Number(qaqfLevel) || 1,
                    moduleCode: generatedContent.moduleCode || moduleCode || "EDU-101",
                    createdByUserId: 1, // Default user ID
                    verificationStatus: "pending",
                    verifiedByUserId: null,
                    characteristics: selectedCharacteristics.length > 0 ? selectedCharacteristics : [1,2]
                  };
                  
                  // Send request to save content
                  const response = await fetch('/api/content', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(contentData),
                  });
                  
                  if (!response.ok) {
                    throw new Error(`Failed to save content: ${response.status}`);
                  }
                  
                  
                  
                  // Show success notification
                  toast({
                    title: "Content Saved Successfully",
                    description: "Your content has been saved and can now be accessed from My Content."
                  });
                  
                  // Close the preview dialog
                  setShowPreview(false);
                  
                } catch (error) {
                  console.error("Error saving content:", error);
                  toast({
                    title: "Save Failed",
                    description: "There was a problem saving your content. Please try again.",
                    variant: "destructive"
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="material-icons animate-spin text-sm mr-1">sync</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-1">save</span>
                  Save Content
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Featured content characteristics image */}
      <div className="h-48 bg-neutral-100 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400" 
          alt="Education technology assessment process" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h4 className="font-bold text-lg">Integrated Academic Content</h4>
          <p className="text-sm">Content + Assessment based on QAQF Framework</p>
        </div>
      </div>
    </Card>
  );
};

export default ContentGenerator;
