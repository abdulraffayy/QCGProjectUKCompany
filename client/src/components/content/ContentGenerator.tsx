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

const ContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [contentType, setContentType] = useState("academic_paper");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qaqfLevel, setQaqfLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<number[]>([]);
  const [moduleCode, setModuleCode] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Assessment specific options
  const [includeAssessment, setIncludeAssessment] = useState(false);
  const [assessmentType, setAssessmentType] = useState("multiple-choice");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  
  // Puzzle options
  const [puzzleType, setPuzzleType] = useState("crossword");
  
  // Quiz options
  const [quizTimeLimit, setQuizTimeLimit] = useState(0);
  const [useAdaptiveScoring, setUseAdaptiveScoring] = useState(false);

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

    setIsGenerating(true);
    
    // Simulating content generation
    setTimeout(() => {
      // Create generated content mock
      const mockContent = {
        id: Math.floor(Math.random() * 1000),
        title: `${subject} (QAQF Level ${qaqfLevel})`,
        moduleCode: moduleCode || "EDU-101",
        qaqfLevel: parseInt(qaqfLevel),
        characteristics: selectedCharacteristics,
        content: `# ${subject}\n\n## Module: ${moduleCode || 'EDU-101'}\n\nThis content demonstrates QAQF Level ${qaqfLevel} implementation with selected characteristics.\n\n${additionalInstructions ? `### Notes\n${additionalInstructions}\n\n` : ''}### Main Content\nAcademic content would be generated here based on the QAQF framework requirements.`,
        assessment: includeAssessment ? generateMockAssessment() : null
      };
      
      setGeneratedContent(mockContent);
      setShowPreview(true);
      setIsGenerating(false);
      
      toast({
        title: "Content Generated Successfully",
        description: "Your content has been generated with assessment materials.",
      });
    }, 2000);
  };
  
  // Generate mock assessment based on selected type
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
        <CardTitle className="text-lg font-bold mb-4">Content Generator</CardTitle>
        <p className="text-neutral-600 text-sm mb-6">Create academic content with integrated assessments aligned with QAQF framework</p>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-neutral-700 mb-1">Content Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant={contentType === "academic_paper" ? "default" : "outline"}
              className="flex items-center justify-center px-4 py-2 rounded-lg text-sm"
              onClick={() => setContentType("academic_paper")}
            >
              <span className="material-icons text-sm mr-2">description</span>
              Academic Content
            </Button>
            <Button 
              variant={contentType === "video" ? "default" : "outline"}
              className="flex items-center justify-center px-4 py-2 rounded-lg text-sm"
              onClick={() => setContentType("video")}
            >
              <span className="material-icons text-sm mr-2">movie</span>
              Video Content
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="content">Content Details</TabsTrigger>
            <TabsTrigger value="assessment">
              Assessment Options
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">Integrated</Badge>
            </TabsTrigger>
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
                      <SelectItem key={level.id} value={level.level.toString()}>
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
              
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Source Material (Optional)</Label>
                <Textarea 
                  placeholder="Paste any source material to use as a reference for content generation" 
                  value={sourceMaterial}
                  onChange={(e) => setSourceMaterial(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Assessment Options */}
          <TabsContent value="assessment" className="space-y-4 pt-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="include-assessment"
                  checked={includeAssessment}
                  onCheckedChange={setIncludeAssessment}
                />
                <Label 
                  htmlFor="include-assessment" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Include assessment materials with content
                </Label>
              </div>
              
              {includeAssessment && (
                <>
                  <div>
                    <Label className="block text-sm font-medium text-neutral-700 mb-1">Assessment Type</Label>
                    <Select value={assessmentType} onValueChange={handleAssessmentTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice Questions</SelectItem>
                        <SelectItem value="puzzle">
                          <div className="flex items-center">
                            Interactive Puzzle
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">New</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="sorting">
                          <div className="flex items-center">
                            Sorting Exercise
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">New</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="quiz">
                          <div className="flex items-center">
                            Interactive Quiz
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">New</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="essay">Essay Questions</SelectItem>
                        <SelectItem value="mixed">Mixed Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Puzzle-specific options */}
                  {assessmentType === "puzzle" && (
                    <div className="p-4 border rounded-md bg-secondary/5">
                      <h4 className="font-medium mb-3 flex items-center">
                        <span className="material-icons text-sm mr-1">extension</span>
                        Puzzle Options
                      </h4>
                      <div>
                        <Label className="block text-sm font-medium mb-1">Puzzle Type</Label>
                        <Select value={puzzleType} onValueChange={setPuzzleType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select puzzle type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crossword">Crossword Puzzle</SelectItem>
                            <SelectItem value="wordSearch">Word Search</SelectItem>
                            <SelectItem value="matching">Matching Exercise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {/* Quiz-specific options */}
                  {assessmentType === "quiz" && (
                    <div className="p-4 border rounded-md bg-secondary/5">
                      <h4 className="font-medium mb-3 flex items-center">
                        <span className="material-icons text-sm mr-1">quiz</span>
                        Quiz Options
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <Label className="block text-sm font-medium mb-1">
                            Number of Questions: {numberOfQuestions}
                          </Label>
                          <Slider
                            min={5}
                            max={20}
                            step={1}
                            value={[numberOfQuestions]}
                            onValueChange={(value) => setNumberOfQuestions(value[0])}
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium mb-1">
                            Time Limit (minutes): {quizTimeLimit > 0 ? quizTimeLimit : "None"}
                          </Label>
                          <Slider
                            min={0}
                            max={60}
                            step={5}
                            value={[quizTimeLimit]}
                            onValueChange={(value) => setQuizTimeLimit(value[0])}
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
                    </div>
                  )}
                  
                  {/* Standard assessment options */}
                  {(assessmentType === "multiple-choice" || assessmentType === "essay" || assessmentType === "mixed") && (
                    <div>
                      <Label className="block text-sm font-medium mb-1">
                        Number of Questions: {numberOfQuestions}
                      </Label>
                      <Slider
                        min={5}
                        max={20}
                        step={1}
                        value={[numberOfQuestions]}
                        onValueChange={(value) => setNumberOfQuestions(value[0])}
                      />
                    </div>
                  )}
                </>
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
                  {generatedContent.assessment && (
                    <TabsTrigger value="assessment">
                      Assessment
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">New</Badge>
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="content" className="pt-4">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm font-sans p-4 bg-neutral-50 rounded-md">
                      {generatedContent.content}
                    </pre>
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
            <Button>
              <span className="material-icons text-sm mr-1">save</span>
              Save Content
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
