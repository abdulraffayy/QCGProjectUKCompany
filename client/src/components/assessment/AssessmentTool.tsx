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
      setIsGenerating(false);
      toast({
        title: "Assessment Generated",
        description: "Your assessment has been created successfully.",
      });
    }, 2000);
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
                  <Select value={assessmentType} onValueChange={setAssessmentType}>
                    <SelectTrigger id="assessment-type">
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="essay">Essay Questions</SelectItem>
                      <SelectItem value="project">Project-based</SelectItem>
                      <SelectItem value="practical">Practical Assessment</SelectItem>
                      <SelectItem value="mixed">Mixed Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
