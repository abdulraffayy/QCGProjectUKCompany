import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QAQFLevels, QAQFCharacteristics } from "@/lib/qaqf";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

const AssessmentTool: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qaqfLevel, setQaqfLevel] = useState("");
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<number[]>([]);
  const [assessmentType, setAssessmentType] = useState("multiple-choice");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [moduleCode, setModuleCode] = useState("");
  const [showPuzzleOptions, setShowPuzzleOptions] = useState(false);
  const [showSortingOptions, setShowSortingOptions] = useState(false);
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedAssessment, setGeneratedAssessment] = useState<any>(null);
  
  // Puzzle specific options
  const [puzzleType, setPuzzleType] = useState("crossword");
  const [puzzleDifficulty, setPuzzleDifficulty] = useState("medium");
  
  // Sorting specific options
  const [sortingCategories, setSortingCategories] = useState(2);
  const [sortingItems, setSortingItems] = useState(10);
  
  // Quiz specific options
  const [quizType, setQuizType] = useState("multiple-choice");
  const [timeLimit, setTimeLimit] = useState(0);
  
  // Innovative assessment options
  const [useAdaptiveScoring, setUseAdaptiveScoring] = useState(false);
  const [useAIFeedback, setUseAIFeedback] = useState(false);
  const [usePeerReview, setUsePeerReview] = useState(false);
  const [useLevelProgression, setUseLevelProgression] = useState(false);
  
  // Assessment Analysis
  const [analysisContent, setAnalysisContent] = useState("");
  const [analysisScores, setAnalysisScores] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCharacteristicToggle = (characteristicId: number) => {
    setSelectedCharacteristics(prev => 
      prev.includes(characteristicId) 
        ? prev.filter(id => id !== characteristicId) 
        : [...prev, characteristicId]
    );
  };

  // Update assessment type options based on selection
  const handleAssessmentTypeChange = (type: string) => {
    setAssessmentType(type);
    setShowPuzzleOptions(type === "puzzle");
    setShowSortingOptions(type === "sorting");
    setShowQuizOptions(type === "quiz");
  };

  const handleGenerateAssessment = () => {
    if (!qaqfLevel || !assessmentName || !assessmentType || selectedCharacteristics.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate assessment generation
    setTimeout(() => {
      // Create mock generated assessment
      const mockAssessment = {
        id: Math.floor(Math.random() * 1000),
        name: assessmentName,
        type: assessmentType,
        qaqfLevel: parseInt(qaqfLevel),
        characteristics: selectedCharacteristics,
        createdAt: new Date().toISOString(),
        moduleCode: moduleCode || "EDU-101",
        content: generateMockAssessmentContent(assessmentType)
      };
      
      setGeneratedAssessment(mockAssessment);
      setShowPreview(true);
      setIsGenerating(false);
      
      toast({
        title: "Assessment Generated",
        description: "Your assessment has been created successfully.",
      });
    }, 2000);
  };
  
  // Generate mock assessment content based on type
  const generateMockAssessmentContent = (type: string) => {
    switch (type) {
      case "puzzle":
        return generatePuzzleContent();
      case "sorting":
        return generateSortingContent();
      case "quiz":
        return generateQuizContent();
      case "adaptive":
        return generateAdaptiveContent();
      case "portfolio":
        return generatePortfolioContent();
      default:
        return generateBasicContent();
    }
  };
  
  // Mock content generators for each assessment type
  const generatePuzzleContent = () => {
    const puzzleTypes = {
      crossword: {
        title: "QAQF Framework Crossword Puzzle",
        description: "Complete the crossword puzzle by filling in terms related to the QAQF framework.",
        grid: [
          ["K", "N", "O", "W", "L", "E", "D", "G", "E", "_"],
          ["_", "_", "_", "_", "E", "_", "I", "_", "_", "_"],
          ["_", "C", "R", "I", "T", "I", "C", "A", "L", "_"],
          ["_", "_", "E", "_", "_", "_", "_", "_", "_", "_"],
          ["_", "_", "F", "U", "T", "U", "R", "I", "S", "T"],
          ["_", "_", "L", "_", "_", "_", "_", "_", "_", "_"],
          ["D", "I", "G", "I", "T", "A", "L", "_", "_", "_"],
          ["_", "_", "C", "_", "_", "_", "_", "_", "_", "_"],
          ["_", "_", "T", "_", "_", "_", "_", "_", "_", "_"],
          ["_", "_", "I", "N", "N", "O", "V", "A", "T", "E"]
        ],
        clues: {
          across: [
            "1. Foundation of all learning and education (9 letters)",
            "3. Type of thinking that questions assumptions (8 letters)",
            "5. Forward-looking perspective in QAQF Level 9 (8 letters)",
            "7. Skills related to technology usage (7 letters)",
            "10. To create something new (8 letters)"
          ],
          down: [
            "1. The process of using knowledge in practical situations (11 letters)",
            "2. Technology-enhanced thinking (10 letters)",
            "4. Environmental consideration in QAQF (13 letters)",
            "6. Self-directed learning capability (8 letters)",
            "8. Ability to work with others (11 letters)"
          ]
        }
      },
      wordSearch: {
        title: "QAQF Characteristics Word Search",
        description: "Find all 9 QAQF characteristics hidden in this word search puzzle.",
        grid: [
          ["K", "N", "O", "W", "L", "E", "D", "G", "E", "Q"],
          ["C", "O", "G", "N", "I", "T", "I", "V", "E", "A"],
          ["A", "P", "P", "L", "I", "E", "D", "F", "G", "H"],
          ["I", "K", "L", "D", "I", "G", "I", "T", "A", "L"],
          ["N", "A", "I", "S", "U", "V", "W", "X", "Y", "Z"],
          ["N", "E", "V", "I", "T", "A", "E", "R", "C", "A"],
          ["O", "F", "G", "H", "I", "J", "K", "L", "M", "N"],
          ["V", "S", "T", "C", "O", "M", "M", "U", "N", "I"],
          ["A", "U", "T", "O", "N", "O", "M", "Y", "Q", "R"],
          ["E", "S", "U", "S", "T", "A", "I", "N", "A", "B"]
        ],
        words: [
          "KNOWLEDGE", "APPLIED", "COGNITIVE", "DIGITAL", 
          "AUTONOMY", "COMMUNICATION", "SUSTAINABLE", "CREATIVE", "INNOVATIVE"
        ]
      },
      jigsaw: {
        title: "QAQF Framework Jigsaw Puzzle",
        description: "Arrange the pieces to complete the QAQF framework diagram.",
        pieces: 12,
        imageUrl: "https://example.com/qaqf-jigsaw.png" // This would be a server-generated image URL
      }
    };
    
    return puzzleTypes[puzzleType as keyof typeof puzzleTypes] || puzzleTypes.crossword;
  };
  
  const generateSortingContent = () => {
    const categories = [
      { name: "Foundation QAQF (Levels 1-3)", items: [] },
      { name: "Intermediate QAQF (Levels 4-6)", items: [] },
      { name: "Advanced QAQF (Levels 7-9)", items: [] }
    ];
    
    const allItems = [
      { id: 1, text: "Basic factual knowledge", category: 0 },
      { id: 2, text: "Simple conceptual understanding", category: 0 },
      { id: 3, text: "Fundamental cognitive skills", category: 0 },
      { id: 4, text: "Applied theoretical knowledge", category: 0 },
      { id: 5, text: "Standard communication skills", category: 1 },
      { id: 6, text: "Team collaboration capabilities", category: 1 },
      { id: 7, text: "Digital literacy implementation", category: 1 },
      { id: 8, text: "Technology-enhanced learning", category: 1 },
      { id: 9, text: "Sustainable practice integration", category: 2 },
      { id: 10, text: "Ecological thinking application", category: 2 },
      { id: 11, text: "Creative solution development", category: 2 },
      { id: 12, text: "Future-focused innovative methods", category: 2 }
    ];
    
    // Randomize items order
    const shuffledItems = [...allItems].sort(() => Math.random() - 0.5);
    
    return {
      title: "QAQF Framework Sorting Exercise",
      description: "Sort each characteristic into its appropriate QAQF level category.",
      categories: categories,
      items: shuffledItems.slice(0, sortingItems)
    };
  };
  
  const generateQuizContent = () => {
    return {
      title: "QAQF Framework Quiz",
      description: `This quiz will test your understanding of the QAQF framework at Level ${qaqfLevel}.`,
      timeLimit: timeLimit > 0 ? `${timeLimit} minutes` : "Unlimited",
      questions: [
        {
          id: 1,
          text: "Which of the following characteristics is categorized in the Foundation level of QAQF?",
          type: "multiple-choice",
          options: [
            "Knowledge and understanding", 
            "Digital skills",
            "Sustainability thinking",
            "Creative practices"
          ],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "QAQF Level 5 is classified as:",
          type: "multiple-choice",
          options: [
            "Simple", 
            "Basic",
            "Substantial",
            "Advanced"
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          text: "Explain how critical thinking contributes to higher QAQF levels.",
          type: "essay",
          wordLimit: 200
        },
        {
          id: 4,
          text: "Match each characteristic with its appropriate QAQF category:",
          type: "matching",
          pairs: [
            { item: "Knowledge and understanding", match: "Foundation" },
            { item: "Communication", match: "Intermediate" },
            { item: "Sustainable thinking", match: "Advanced" },
            { item: "Digital skills", match: "Intermediate" }
          ]
        },
        {
          id: 5,
          text: "Rate your confidence in implementing QAQF Level 7 characteristics in your teaching:",
          type: "scale",
          min: 1,
          max: 10,
          labels: ["Not confident at all", "Extremely confident"]
        }
      ]
    };
  };
  
  const generateAdaptiveContent = () => {
    return {
      title: "Adaptive QAQF Assessment",
      description: "This assessment adapts to your performance, adjusting difficulty based on your answers.",
      features: [
        "Begins with mid-level questions and adjusts based on performance",
        "Provides real-time feedback after each response",
        "Personalizes follow-up questions based on response patterns",
        "Uses AI to identify knowledge gaps and provide targeted resources",
        "Dynamically adjusts to focus on areas needing improvement"
      ],
      initialQuestion: {
        id: 1,
        text: "Explain the relationship between QAQF characteristics and educational outcomes.",
        type: "open-ended",
        difficulty: 5,
        subsequentQuestions: [3, 7, 12] // IDs of potential follow-up questions
      }
    };
  };
  
  const generatePortfolioContent = () => {
    return {
      title: "QAQF Portfolio Assessment",
      description: "Create a portfolio demonstrating your application of QAQF principles in your professional practice.",
      sections: [
        {
          title: "Evidence of Knowledge Application",
          description: "Provide 2-3 artifacts demonstrating your application of QAQF knowledge",
          criteria: ["Clear connection to QAQF principles", "Evidence of implementation", "Critical reflection"]
        },
        {
          title: "Digital Skills Implementation",
          description: "Show how you've integrated digital tools aligned with QAQF requirements",
          criteria: ["Appropriate tool selection", "Innovative application", "Enhancement of learning"]
        },
        {
          title: "Sustainable Practice",
          description: "Demonstrate how your practice incorporates sustainable approaches",
          criteria: ["Long-term viability", "Resource efficiency", "Environmental consideration"]
        },
        {
          title: "Reflective Analysis",
          description: "Provide a written reflection on your QAQF implementation journey",
          criteria: ["Critical self-assessment", "Identification of strengths/weaknesses", "Future development plans"]
        }
      ],
      rubric: {
        excellent: "Comprehensive evidence of all QAQF characteristics at target level",
        proficient: "Clear evidence of most QAQF characteristics at target level",
        developing: "Some evidence of QAQF characteristics, but inconsistent application",
        beginning: "Limited evidence of QAQF characteristics, needs substantial development"
      }
    };
  };
  
  const generateBasicContent = () => {
    return {
      title: `QAQF Level ${qaqfLevel} Assessment`,
      description: `Standard assessment for QAQF Level ${qaqfLevel}`,
      questions: Array.from({ length: numberOfQuestions }, (_, i) => ({
        id: i + 1,
        text: `Question ${i + 1}: This would be a ${assessmentType} question related to QAQF characteristics.`,
        type: assessmentType,
        options: assessmentType === "multiple-choice" ? ["Option A", "Option B", "Option C", "Option D"] : undefined
      }))
    };
  };

  const handleAnalyzeAssessment = () => {
    if (!analysisContent) {
      toast({
        title: "Missing Content",
        description: "Please paste the content you want to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      // Generate mock analysis scores for demonstration
      const mockScores: Record<string, number> = {};
      QAQFCharacteristics.forEach(char => {
        mockScores[char.name] = Math.floor(Math.random() * 100);
      });
      
      setAnalysisScores(mockScores);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Assessment has been analyzed against QAQF characteristics.",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QAQF Assessment Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="create">Create Assessment</TabsTrigger>
            <TabsTrigger value="analyze">Analyze Content</TabsTrigger>
            <TabsTrigger value="view">My Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessment-name">Assessment Name</Label>
                  <Input 
                    id="assessment-name" 
                    placeholder="Enter assessment name"
                    value={assessmentName}
                    onChange={(e) => setAssessmentName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="module-code">Module Code</Label>
                  <Input 
                    id="module-code" 
                    placeholder="e.g. EDU-573"
                    value={moduleCode}
                    onChange={(e) => setModuleCode(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="assessment-description">Description</Label>
                <Textarea 
                  id="assessment-description" 
                  placeholder="Describe the purpose and scope of this assessment"
                  value={assessmentDescription}
                  onChange={(e) => setAssessmentDescription(e.target.value)}
                  className="h-20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qaqf-level">QAQF Level</Label>
                  <Select value={qaqfLevel} onValueChange={setQaqfLevel}>
                    <SelectTrigger id="qaqf-level">
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
                  <Label htmlFor="assessment-type">Assessment Type</Label>
                  <Select value={assessmentType} onValueChange={handleAssessmentTypeChange}>
                    <SelectTrigger id="assessment-type">
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="essay">Essay Questions</SelectItem>
                      <SelectItem value="puzzle">
                        <div className="flex items-center">
                          Puzzle
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
                      <SelectItem value="adaptive">
                        <div className="flex items-center">
                          Adaptive Assessment
                          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">New</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="portfolio">
                        <div className="flex items-center">
                          Portfolio Assessment
                          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">New</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="project">Project-based</SelectItem>
                      <SelectItem value="practical">Practical Assessment</SelectItem>
                      <SelectItem value="mixed">Mixed Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(assessmentType === "multiple-choice" || assessmentType === "essay" || assessmentType === "mixed") && (
                <div>
                  <Label htmlFor="num-questions">Number of Questions: {numberOfQuestions}</Label>
                  <Slider 
                    id="num-questions"
                    min={5} 
                    max={50} 
                    step={5}
                    value={[numberOfQuestions]} 
                    onValueChange={(value) => setNumberOfQuestions(value[0])} 
                    className="my-4" 
                  />
                </div>
              )}
              
              {/* Puzzle options */}
              {showPuzzleOptions && (
                <div className="p-4 border rounded-md bg-secondary/5 mt-2 mb-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <span className="material-icons text-sm mr-1">extension</span>
                    Puzzle Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="puzzle-type">Puzzle Type</Label>
                      <Select value={puzzleType} onValueChange={setPuzzleType}>
                        <SelectTrigger id="puzzle-type">
                          <SelectValue placeholder="Select puzzle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crossword">Crossword Puzzle</SelectItem>
                          <SelectItem value="wordSearch">Word Search</SelectItem>
                          <SelectItem value="jigsaw">Jigsaw Puzzle</SelectItem>
                          <SelectItem value="matching">Matching Exercise</SelectItem>
                          <SelectItem value="sequencing">Sequencing Activity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="puzzle-difficulty">Difficulty Level</Label>
                      <Select value={puzzleDifficulty} onValueChange={setPuzzleDifficulty}>
                        <SelectTrigger id="puzzle-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="adaptive">Adaptive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Sorting exercise options */}
              {showSortingOptions && (
                <div className="p-4 border rounded-md bg-secondary/5 mt-2 mb-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <span className="material-icons text-sm mr-1">sort</span>
                    Sorting Exercise Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sorting-categories">Number of Categories: {sortingCategories}</Label>
                      <Slider 
                        id="sorting-categories"
                        min={2} 
                        max={5} 
                        step={1}
                        value={[sortingCategories]} 
                        onValueChange={(value) => setSortingCategories(value[0])} 
                        className="my-4" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="sorting-items">Number of Items: {sortingItems}</Label>
                      <Slider 
                        id="sorting-items"
                        min={5} 
                        max={20} 
                        step={1}
                        value={[sortingItems]} 
                        onValueChange={(value) => setSortingItems(value[0])} 
                        className="my-4" 
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quiz options */}
              {showQuizOptions && (
                <div className="p-4 border rounded-md bg-secondary/5 mt-2 mb-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <span className="material-icons text-sm mr-1">quiz</span>
                    Interactive Quiz Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiz-type">Quiz Format</Label>
                      <Select value={quizType} onValueChange={setQuizType}>
                        <SelectTrigger id="quiz-type">
                          <SelectValue placeholder="Select quiz format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="matching">Matching</SelectItem>
                          <SelectItem value="fill-in-blanks">Fill in the Blanks</SelectItem>
                          <SelectItem value="mixed">Mixed Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="time-limit">Time Limit (minutes): {timeLimit > 0 ? timeLimit : "None"}</Label>
                      <Slider 
                        id="time-limit"
                        min={0} 
                        max={60} 
                        step={5}
                        value={[timeLimit]} 
                        onValueChange={(value) => setTimeLimit(value[0])} 
                        className="my-4" 
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="mb-2 block">Advanced Features</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="adaptive-scoring"
                            checked={useAdaptiveScoring}
                            onCheckedChange={(checked) => setUseAdaptiveScoring(checked === true)}
                          />
                          <label
                            htmlFor="adaptive-scoring"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Adaptive Scoring
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ai-feedback"
                            checked={useAIFeedback}
                            onCheckedChange={(checked) => setUseAIFeedback(checked === true)}
                          />
                          <label
                            htmlFor="ai-feedback"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            AI-Powered Feedback
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="peer-review"
                            checked={usePeerReview}
                            onCheckedChange={(checked) => setUsePeerReview(checked === true)}
                          />
                          <label
                            htmlFor="peer-review"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Peer Review
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="level-progression"
                            checked={useLevelProgression}
                            onCheckedChange={(checked) => setUseLevelProgression(checked === true)}
                          />
                          <label
                            htmlFor="level-progression"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Level Progression
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="mb-2 block">QAQF Characteristics</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
              
              <Button 
                onClick={handleGenerateAssessment}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Generating Assessment...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">assignment</span>
                    Generate Assessment
                  </>
                )}
              </Button>
              
              {/* Assessment Preview Dialog */}
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {generatedAssessment?.content?.title || "Assessment Preview"}
                    </DialogTitle>
                    <DialogDescription>
                      {generatedAssessment?.moduleCode && (
                        <Badge variant="outline" className="mr-2">
                          {generatedAssessment.moduleCode}
                        </Badge>
                      )}
                      {generatedAssessment?.qaqfLevel && (
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                          QAQF Level {generatedAssessment.qaqfLevel}
                        </Badge>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {generatedAssessment && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">
                        {generatedAssessment.content?.description || "Assessment Description"}
                      </h3>
                      
                      {/* Puzzle Content Preview */}
                      {assessmentType === "puzzle" && generatedAssessment.content && (
                        <div>
                          {puzzleType === "crossword" && (
                            <div className="mt-4 border rounded p-4">
                              <h4 className="text-sm font-medium mb-3">Crossword Puzzle</h4>
                              <div className="grid grid-cols-10 gap-1 mb-4">
                                {generatedAssessment.content.grid.map((row, rowIndex) => (
                                  row.map((cell, cellIndex) => (
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
                                    {generatedAssessment.content.clues.across.map((clue, index) => (
                                      <li key={`across-${index}`} className="mb-1">{clue}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium mb-2">Down</h5>
                                  <ul className="list-disc pl-5 text-sm">
                                    {generatedAssessment.content.clues.down.map((clue, index) => (
                                      <li key={`down-${index}`} className="mb-1">{clue}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {puzzleType === "wordSearch" && (
                            <div className="mt-4 border rounded p-4">
                              <h4 className="text-sm font-medium mb-3">Word Search Puzzle</h4>
                              <div className="grid grid-cols-10 gap-1 mb-4">
                                {generatedAssessment.content.grid.map((row, rowIndex) => (
                                  row.map((cell, cellIndex) => (
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
                                  {generatedAssessment.content.words.map((word, index) => (
                                    <Badge key={`word-${index}`} variant="outline" className="font-mono">
                                      {word}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {puzzleType === "jigsaw" && (
                            <div className="mt-4 border rounded p-4 text-center">
                              <h4 className="text-sm font-medium mb-3">Jigsaw Puzzle Preview</h4>
                              <p className="text-sm text-neutral-500 mb-2">
                                This jigsaw puzzle contains {generatedAssessment.content.pieces} pieces.
                              </p>
                              <div className="bg-neutral-100 h-64 rounded flex items-center justify-center">
                                <span className="material-icons text-neutral-400 text-5xl">extension</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Sorting Content Preview */}
                      {assessmentType === "sorting" && generatedAssessment.content && (
                        <div className="mt-4 border rounded p-4">
                          <h4 className="text-sm font-medium mb-3">Sorting Exercise</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {generatedAssessment.content.categories.map((category, index) => (
                              <div key={`category-${index}`} className="border rounded p-3 bg-secondary/5">
                                <h5 className="text-sm font-medium mb-2">{category.name}</h5>
                                <div className="min-h-[100px]"></div>
                              </div>
                            ))}
                          </div>
                          
                          <h5 className="text-sm font-medium mb-2">Items to Sort</h5>
                          <div className="flex flex-wrap gap-2 border-t pt-3">
                            {generatedAssessment.content.items.map((item, index) => (
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
                      
                      {/* Quiz Content Preview */}
                      {assessmentType === "quiz" && generatedAssessment.content && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="text-xs">
                              {generatedAssessment.content.timeLimit}
                            </Badge>
                            <div className="text-sm text-neutral-500">
                              {generatedAssessment.content.questions.length} questions
                            </div>
                          </div>
                          
                          <Accordion type="single" collapsible className="border rounded overflow-hidden">
                            {generatedAssessment.content.questions.map((question, index) => (
                              <AccordionItem 
                                key={`question-${index}`} 
                                value={`question-${index}`}
                                className={index > 0 ? "border-t" : ""}
                              >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-neutral-50">
                                  <div className="flex items-start text-left">
                                    <span className="font-medium mr-2">Q{index + 1}.</span>
                                    <span className="text-sm">{question.text}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-3">
                                  {question.type === "multiple-choice" && question.options && (
                                    <RadioGroup className="space-y-1 mt-2">
                                      {question.options.map((option, optIndex) => (
                                        <div key={`option-${optIndex}`} className="flex items-center space-x-2">
                                          <RadioGroupItem value={`option-${optIndex}`} id={`q${index}-opt${optIndex}`} />
                                          <label
                                            htmlFor={`q${index}-opt${optIndex}`}
                                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {option}
                                          </label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  )}
                                  
                                  {question.type === "essay" && (
                                    <div>
                                      <Textarea
                                        placeholder="Enter your answer here..."
                                        className="mt-2 h-20"
                                      />
                                      {question.wordLimit && (
                                        <div className="text-xs text-neutral-500 mt-1">
                                          Word limit: {question.wordLimit} words
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {question.type === "matching" && question.pairs && (
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                      <div>
                                        {question.pairs.map((pair, pairIndex) => (
                                          <div 
                                            key={`match-item-${pairIndex}`}
                                            className="p-2 mb-2 border rounded bg-neutral-50"
                                          >
                                            {pair.item}
                                          </div>
                                        ))}
                                      </div>
                                      <div>
                                        {question.pairs.map((pair, pairIndex) => (
                                          <div 
                                            key={`match-pair-${pairIndex}`}
                                            className="p-2 mb-2 border rounded bg-white"
                                          >
                                            {pair.match}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {question.type === "scale" && (
                                    <div className="mt-3">
                                      <div className="flex justify-between text-xs text-neutral-500 mb-1">
                                        <span>{question.labels?.[0] || question.min}</span>
                                        <span>{question.labels?.[1] || question.max}</span>
                                      </div>
                                      <Slider
                                        min={question.min || 1}
                                        max={question.max || 10}
                                        step={1}
                                        defaultValue={[Math.floor((question.min + question.max) / 2)]}
                                      />
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}
                      
                      {/* Adaptive Assessment Preview */}
                      {assessmentType === "adaptive" && generatedAssessment.content && (
                        <div className="mt-4 border rounded p-4">
                          <div className="flex items-center text-primary mb-3">
                            <span className="material-icons text-sm mr-1">psychology</span>
                            <h4 className="text-sm font-medium">Adaptive Assessment</h4>
                          </div>
                          
                          <ul className="list-disc pl-5 text-sm mb-4 space-y-1">
                            {generatedAssessment.content.features.map((feature, index) => (
                              <li key={`feature-${index}`}>{feature}</li>
                            ))}
                          </ul>
                          
                          <div className="border rounded p-3 bg-neutral-50 mt-3">
                            <h5 className="text-sm font-medium mb-2">Initial Question</h5>
                            <p className="text-sm mb-2">{generatedAssessment.content.initialQuestion.text}</p>
                            <div className="mt-3">
                              <Textarea
                                placeholder="Enter your response here..."
                                className="h-24"
                              />
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <div className="text-xs text-neutral-500">
                                Difficulty: {generatedAssessment.content.initialQuestion.difficulty}/10
                              </div>
                              <Button size="sm" variant="outline">
                                <span className="material-icons text-sm mr-1">arrow_forward</span>
                                Begin Assessment
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Portfolio Assessment Preview */}
                      {assessmentType === "portfolio" && generatedAssessment.content && (
                        <div className="mt-4">
                          <div className="bg-secondary/10 rounded p-3 mb-4">
                            <p className="text-sm">{generatedAssessment.content.description}</p>
                          </div>
                          
                          <Accordion type="multiple" className="border rounded overflow-hidden">
                            {generatedAssessment.content.sections.map((section, index) => (
                              <AccordionItem 
                                key={`section-${index}`} 
                                value={`section-${index}`}
                                className={index > 0 ? "border-t" : ""}
                              >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-neutral-50">
                                  <div className="text-left">
                                    <span className="font-medium">{section.title}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-3">
                                  <p className="text-sm mb-3">{section.description}</p>
                                  
                                  <h6 className="text-xs font-medium mb-1">Assessment Criteria:</h6>
                                  <ul className="list-disc pl-5 text-xs text-neutral-600 mb-3">
                                    {section.criteria.map((criterion, critIndex) => (
                                      <li key={`criterion-${critIndex}`}>{criterion}</li>
                                    ))}
                                  </ul>
                                  
                                  <div className="bg-neutral-50 p-3 rounded border border-dashed border-neutral-300 flex flex-col items-center justify-center text-center">
                                    <span className="material-icons text-neutral-400 mb-2">upload_file</span>
                                    <p className="text-xs text-neutral-500">
                                      Drag and drop files here or click to upload evidence
                                    </p>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                          
                          <div className="mt-4 border-t pt-4">
                            <h5 className="text-sm font-medium mb-2">Assessment Rubric</h5>
                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(generatedAssessment.content.rubric).map(([level, description], index) => (
                                <div key={`rubric-${index}`} className="flex items-start p-2 border-b last:border-0">
                                  <div className="font-medium text-sm capitalize w-24">{level}:</div>
                                  <div className="text-sm">{description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <DialogFooter className="gap-2 sm:gap-0 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPreview(false)}
                    >
                      Close Preview
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button>
                            <span className="material-icons text-sm mr-1">save</span>
                            Save Assessment
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save assessment to your library</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="analyze">
            <div className="space-y-4">
              <div>
                <Label htmlFor="analysis-content">Paste Content for Analysis</Label>
                <Textarea 
                  id="analysis-content" 
                  placeholder="Paste the content you want to analyze against QAQF characteristics..."
                  value={analysisContent}
                  onChange={(e) => setAnalysisContent(e.target.value)}
                  className="h-40"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="analysis-level">Target QAQF Level</Label>
                  <Select>
                    <SelectTrigger id="analysis-level">
                      <SelectValue placeholder="Select target level" />
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
                  <Label htmlFor="analysis-type">Content Type</Label>
                  <Select>
                    <SelectTrigger id="analysis-type">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic_paper">Academic Paper</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleAnalyzeAssessment}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">analytics</span>
                    Analyze Against QAQF
                  </>
                )}
              </Button>
              
              {Object.keys(analysisScores).length > 0 && (
                <div className="mt-6 border rounded-md p-4 bg-neutral-50">
                  <h3 className="text-lg font-medium mb-4">QAQF Analysis Results</h3>
                  <div className="space-y-4">
                    {Object.entries(analysisScores).map(([characteristic, score]) => (
                      <div key={characteristic}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{characteristic}</span>
                          <span className="text-sm font-bold">{score}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-secondary bg-opacity-10 rounded-md">
                    <h4 className="text-sm font-medium text-secondary mb-2">Overall Assessment</h4>
                    <p className="text-sm">
                      This content demonstrates strong implementation of QAQF characteristics. 
                      Consider enhancing the focus on reflective and innovative elements to reach higher QAQF levels.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="view">
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-neutral-400 mb-2">assignment</span>
              <h3 className="text-lg font-medium mb-2">Your Assessments</h3>
              <p className="text-neutral-600 mb-4">
                You haven't created any assessments yet
              </p>
              <Button onClick={() => setActiveTab("create")}>
                Create Your First Assessment
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AssessmentTool;
