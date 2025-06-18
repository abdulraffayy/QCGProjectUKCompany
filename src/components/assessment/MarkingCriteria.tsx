import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  DefaultRubricTemplate, 
  MarketingRubricTemplate, 
  InnovativeAssessmentMethods,
  getRubricByContentType,
  getInnovativeAssessmentMethod,
  calculateRubricScore,
  AssessmentResponseTemplates
} from "../../lib/markingCriteria";

interface MarkingCriteriaProps {
  contentType: string;
  subject: string;
  qaqfLevel: number;
  onAssessmentComplete?: (assessment: any) => void;
}

const MarkingCriteria: React.FC<MarkingCriteriaProps> = ({
  contentType,
  subject,
  qaqfLevel,
  onAssessmentComplete
}) => {
  const [activeTab, setActiveTab] = useState('rubric');
  const [selectedRubric, setSelectedRubric] = useState<'default' | 'marketing' | 'custom'>('default');
  const [selectedInnovativeMethod, setSelectedInnovativeMethod] = useState<string>('competitive-analysis');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  
  // Get the appropriate rubric based on content type and subject
  const rubric = selectedRubric === 'marketing' 
    ? MarketingRubricTemplate 
    : selectedRubric === 'custom' 
      ? getRubricByContentType(contentType, subject) 
      : DefaultRubricTemplate;
  
  // Get the selected innovative assessment method
  const innovativeMethod = InnovativeAssessmentMethods.find(method => method.id === selectedInnovativeMethod) 
    || InnovativeAssessmentMethods[0];
  
  // Handle rating change for a criterion
  const handleRatingChange = (criterionId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [criterionId]: rating
    }));
  };
  
  // Handle feedback change for a criterion
  const handleFeedbackChange = (criterionId: string, text: string) => {
    setFeedback(prev => ({
      ...prev,
      [criterionId]: text
    }));
  };
  
  // Generate assessment results
  const generateAssessment = () => {
    // Calculate rubric scores
    const rubricResults = calculateRubricScore(rubric, ratings);
    
    // Generate criterion-level feedback
    const criteriaFeedback = rubric.criteria.map(criterion => {
      const score = ratings[criterion.id] || 0;
      const maxScore = criterion.levels.length;
      const scoreLevel = criterion.levels[score - 1] || criterion.levels[0];
      
      return AssessmentResponseTemplates.rubricFeedback(
        criterion.name,
        scoreLevel?.name || 'Not Rated',
        score,
        maxScore,
        feedback[criterion.id] || `Standard feedback for ${criterion.name}`
      );
    });
    
    // Identify strengths and areas for improvement
    const strengths = criteriaFeedback
      .filter(item => item.percentage >= 70)
      .map(item => item.criterionName);
    
    const areasForImprovement = criteriaFeedback
      .filter(item => item.percentage < 60)
      .map(item => item.criterionName);
    
    // Generate overall assessment result
    const result = {
      rubricType: rubric.name,
      innovativeMethod: innovativeMethod.name,
      date: new Date().toISOString(),
      criteriaFeedback,
      overallResults: AssessmentResponseTemplates.overallFeedback(
        rubricResults.totalScore,
        rubricResults.maxPossibleScore,
        strengths,
        areasForImprovement
      ),
      additionalFeedback: overallFeedback
    };
    
    setAssessmentResults(result);
    
    // Pass results to parent if callback exists
    if (onAssessmentComplete) {
      onAssessmentComplete(result);
    }
  };
  
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Marking Criteria Assessment</span>
          <Badge variant="outline" className="ml-2">QAQF Level {qaqfLevel}</Badge>
        </CardTitle>
        <CardDescription>
          Use rubrics and innovative methodologies to assess content quality and alignment with standards
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="rubric">
              <span className="flex items-center">
                <span className="material-icons text-sm mr-1">grading</span>
                Rubric Assessment
              </span>
            </TabsTrigger>
            <TabsTrigger value="innovative">
              <span className="flex items-center">
                <span className="material-icons text-sm mr-1">psychology</span>
                Innovative Methods
              </span>
            </TabsTrigger>
          </TabsList>
          
          {/* Rubric Assessment Tab */}
          <TabsContent value="rubric">
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Select Rubric Type</Label>
                <Select 
                  value={selectedRubric} 
                  onValueChange={(value: 'default' | 'marketing' | 'custom') => setSelectedRubric(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rubric type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">QAQF Standard Rubric</SelectItem>
                    <SelectItem value="marketing">Marketing Assessment Rubric</SelectItem>
                    <SelectItem value="custom">Content-Specific Rubric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-secondary/5 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-3">{rubric.name}</h3>
                <p className="text-sm text-neutral-600 mb-4">{rubric.description}</p>
                
                {/* Rubric criteria */}
                <div className="space-y-6">
                  {rubric.criteria.map((criterion) => (
                    <div key={criterion.id} className="border rounded-md p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium flex items-center">
                            {criterion.icon && (
                              <span className="material-icons text-sm mr-1">{criterion.icon}</span>
                            )}
                            {criterion.name}
                          </h4>
                          <p className="text-sm text-neutral-600">{criterion.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-neutral-100">
                          Weight: {criterion.weight}%
                        </Badge>
                      </div>
                      
                      {/* Rating radio buttons */}
                      <div className="mt-4">
                        <Label className="text-sm font-medium mb-2 block">Rating</Label>
                        <RadioGroup
                          value={ratings[criterion.id]?.toString() || "0"}
                          onValueChange={(value) => handleRatingChange(criterion.id, parseInt(value))}
                          className="flex flex-wrap gap-1"
                        >
                          {criterion.levels.map((level, index) => (
                            <div 
                              key={level.id}
                              className="flex-1 min-w-[100px]"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value={(index + 1).toString()} 
                                  id={level.id}
                                  className={`text-${level.color}-600`}
                                />
                                <Label
                                  htmlFor={level.id}
                                  className="text-xs cursor-pointer"
                                >
                                  {level.name}
                                </Label>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      {/* Feedback text area */}
                      <div className="mt-4">
                        <Label className="text-sm font-medium mb-2 block">Feedback</Label>
                        <Textarea
                          placeholder={`Enter feedback for ${criterion.name}`}
                          value={feedback[criterion.id] || ''}
                          onChange={(e) => handleFeedbackChange(criterion.id, e.target.value)}
                          className="h-20"
                        />
                      </div>
                      
                      {/* Progress indicator based on rating */}
                      {ratings[criterion.id] > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Score: {ratings[criterion.id]} / {criterion.levels.length}</span>
                            <span>{Math.round((ratings[criterion.id] / criterion.levels.length) * 100)}%</span>
                          </div>
                          <Progress 
                            value={Math.round((ratings[criterion.id] / criterion.levels.length) * 100)} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Overall Feedback */}
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Overall Feedback</Label>
                <Textarea
                  placeholder="Enter overall assessment feedback"
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  className="h-24"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Innovative Assessment Methods Tab */}
          <TabsContent value="innovative">
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Select Assessment Method</Label>
                <Select 
                  value={selectedInnovativeMethod} 
                  onValueChange={setSelectedInnovativeMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {InnovativeAssessmentMethods.map(method => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-secondary/5 p-4 rounded-md">
                <div className="flex items-center mb-3">
                  <span className={`material-icons text-lg mr-2`}>
                    {innovativeMethod.icon}
                  </span>
                  <h3 className="text-lg font-semibold">{innovativeMethod.name}</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-4">{innovativeMethod.description}</p>
                
                {/* Competitive Analysis */}
                {innovativeMethod.id === 'competitive-analysis' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Assessment Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {innovativeMethod.metrics.map((metric, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <p className="font-medium text-sm">{metric.name}</p>
                          <p className="text-xs text-neutral-600">{metric.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Scenario Simulation */}
                {innovativeMethod.id === 'scenario-simulation' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Simulation Types</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {innovativeMethod.simulationTypes.map((type, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <p className="font-medium text-sm">{type.name}</p>
                          <p className="text-xs text-neutral-600">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Data Storytelling */}
                {innovativeMethod.id === 'data-visualization' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Assessment Components</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {innovativeMethod.components.map((component, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <p className="font-medium text-sm">{component.name}</p>
                          <p className="text-xs text-neutral-600">{component.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Consumer Journey */}
                {innovativeMethod.id === 'consumer-journey' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Journey Stages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {innovativeMethod.journeyStages.map((stage, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <p className="font-medium text-sm">{stage.name}</p>
                          <p className="text-xs text-neutral-600">{stage.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Adaptive Assessment */}
                {innovativeMethod.id === 'adaptive-assessment' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Adaptive Elements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {innovativeMethod.adaptiveElements.map((element, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <p className="font-medium text-sm">{element.name}</p>
                          <p className="text-xs text-neutral-600">{element.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline">Reset Assessment</Button>
        <Button onClick={generateAssessment}>
          <span className="material-icons text-sm mr-1">assessment</span>
          Generate Assessment Report
        </Button>
      </CardFooter>
      
      {/* Assessment Results */}
      {assessmentResults && (
        <div className="mt-8 border-t pt-6 px-6">
          <h3 className="text-lg font-semibold mb-4">Assessment Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-neutral-100 p-4 rounded">
              <p className="text-sm text-neutral-600">Overall Score</p>
              <p className="text-2xl font-bold">{assessmentResults.overallResults.percentage}%</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded">
              <p className="text-sm text-neutral-600">Grade</p>
              <p className="text-2xl font-bold">{assessmentResults.overallResults.gradeLetter}</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded">
              <p className="text-sm text-neutral-600">Rubric Type</p>
              <p className="text-lg font-semibold">{assessmentResults.rubricType}</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded">
              <p className="text-sm text-neutral-600">Assessment Method</p>
              <p className="text-lg font-semibold">{assessmentResults.innovativeMethod}</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <h4 className="font-medium">Criteria Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="text-left p-2">Criterion</th>
                    <th className="text-left p-2">Rating</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2 hidden md:table-cell">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentResults.criteriaFeedback.map((item: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.criterionName}</td>
                      <td className="p-2">{item.scoreName}</td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <span className="mr-2">{item.percentage}%</span>
                          <Progress value={item.percentage} className="w-20 h-2" />
                        </div>
                      </td>
                      <td className="p-2 text-xs text-neutral-600 hidden md:table-cell">{item.feedback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium mb-2">Strengths</h4>
              {assessmentResults.overallResults.strengths.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {assessmentResults.overallResults.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm">{strength}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-600">No major strengths identified</p>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-2">Areas for Improvement</h4>
              {assessmentResults.overallResults.areasForImprovement.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {assessmentResults.overallResults.areasForImprovement.map((area: string, index: number) => (
                    <li key={index} className="text-sm">{area}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-600">No major areas for improvement identified</p>
              )}
            </div>
          </div>
          
          {assessmentResults.additionalFeedback && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Additional Feedback</h4>
              <p className="text-sm whitespace-pre-line">{assessmentResults.additionalFeedback}</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" className="mr-2">Download Report</Button>
            <Button>
              <span className="material-icons text-sm mr-1">save</span>
              Save Assessment
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MarkingCriteria;