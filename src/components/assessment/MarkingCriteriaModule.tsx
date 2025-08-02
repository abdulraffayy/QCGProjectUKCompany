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
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import MarkingCriteria from './MarkingCriteria';

interface MarkingCriteriaModuleProps {
  contentId?: number;
  contentType: string;
  subject: string;
  qaqfLevel: number;
  onAssessmentComplete?: (assessment: any) => void;
  onClose?: () => void;
}

const MarkingCriteriaModule: React.FC<MarkingCriteriaModuleProps> = ({
  contentType,
  subject,
  qaqfLevel,
  onAssessmentComplete,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('rubrics');
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [marketingPlan, setMarketingPlan] = useState('');
  
  // Handle assessment completion
  const handleAssessmentComplete = (assessment: any) => {
    setAssessmentResult(assessment);
    
    if (onAssessmentComplete) {
      onAssessmentComplete(assessment);
    }
  };
  
  // Generate marketing material suggestions based on assessment results
  const generateMarketingSuggestions = () => {
    // Here we would call the AI services to generate suggestions
    const mockSuggestions = `# Marketing Strategy Recommendations

## Key Strengths to Leverage
- ${assessmentResult?.overallResults?.strengths?.join('\n- ') || 'Strong theoretical foundations'}
- Clear market positioning potential

## Areas to Address
- ${assessmentResult?.overallResults?.areasForImprovement?.join('\n- ') || 'Enhance digital integration'}
- Develop more consistent brand messaging

## Recommended Marketing Approaches
1. **Content Marketing Strategy**: Create educational content that showcases your expertise in ${subject}
2. **Social Media Campaign**: Develop a campaign highlighting the QAQF Level ${qaqfLevel} quality standards
3. **Email Marketing Series**: Create a nurturing sequence focused on ${subject} insights
4. **Case Study Development**: Document success stories and implementation examples
5. **Webinar Series**: Host educational sessions on ${subject} best practices

## Implementation Timeline
- **Week 1-2**: Strategy finalization and content calendar development
- **Week 3-4**: Asset creation and campaign setup
- **Week 5-6**: Launch initial campaigns
- **Week 7-8**: Measure results and optimize approach`;

    setMarketingPlan(mockSuggestions);
  };
  
  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Marking Criteria & Assessment Module</CardTitle>
            <CardDescription>
              Use rubrics and innovative methodologies to assess content and generate marketing strategies
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">QAQF Level {qaqfLevel}</Badge>
            <Badge variant="outline">{contentType}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="rubrics">
              <span className="flex items-center">
                <span className="material-icons text-sm mr-1">assessment</span>
                Standard Rubrics
              </span>
            </TabsTrigger>
            <TabsTrigger value="marketing">
              <span className="flex items-center">
                <span className="material-icons text-sm mr-1">campaign</span>
                Marketing Strategies
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rubrics" className="pt-4">
            <div className="space-y-4">
              <MarkingCriteria 
                contentType={contentType}
                subject={subject}
                qaqfLevel={qaqfLevel}
                onAssessmentComplete={handleAssessmentComplete}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="marketing" className="pt-4">
            <div className="space-y-4">
              <div className="bg-secondary/5 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="material-icons text-base mr-2">campaign</span>
                  Marketing Strategy Development
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Generate targeted marketing strategies based on content assessment results
                </p>
                
                {assessmentResult ? (
                  <>
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Assessment Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="p-3 bg-white rounded border">
                          <p className="text-xs text-neutral-600">Overall Score</p>
                          <p className="font-medium">{assessmentResult.overallResults.percentage}%</p>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <p className="text-xs text-neutral-600">Grade</p>
                          <p className="font-medium">{assessmentResult.overallResults.gradeLetter}</p>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <p className="text-xs text-neutral-600">Subject</p>
                          <p className="font-medium truncate">{subject}</p>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <p className="text-xs text-neutral-600">Content Type</p>
                          <p className="font-medium">{contentType}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={generateMarketingSuggestions}
                      className="w-full"
                    >
                      <span className="material-icons text-sm mr-1">auto_awesome</span>
                      Generate Marketing Recommendations
                    </Button>
                    
                    {marketingPlan && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Marketing Strategy Recommendations</h4>
                        <div className="prose max-w-none bg-white p-4 rounded border">
                          <pre className="whitespace-pre-wrap text-sm font-sans">
                            {marketingPlan}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                      <span className="material-icons text-neutral-500 text-2xl">assessment</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Assessment Results Yet</h3>
                    <p className="text-neutral-600 mb-4 max-w-md mx-auto">
                      Complete the content assessment using rubrics first to generate marketing strategy recommendations.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('rubrics')}
                    >
                      Go to Assessment
                    </Button>
                  </div>
                )}
              </div>
              
              {marketingPlan && (
                <>
                  <div className="bg-secondary/5 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <span className="material-icons text-base mr-2">psychology</span>
                      Innovative Marketing Methodologies
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <span className="material-icons text-sm mr-1">insights</span>
                          Data-Driven Approach
                        </h4>
                        <p className="text-xs text-neutral-600">
                          Utilize assessment metrics to inform targeted marketing campaigns and content strategy.
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <span className="material-icons text-sm mr-1">groups</span>
                          Audience Segmentation
                        </h4>
                        <p className="text-xs text-neutral-600">
                          Segment audience based on QAQF levels and characteristics for personalized messaging.
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <span className="material-icons text-sm mr-1">analytics</span>
                          Conversion Optimization
                        </h4>
                        <p className="text-xs text-neutral-600">
                          Focus on high-scoring areas to create compelling value propositions and conversion paths.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Marketing Implementation Notes</h3>
                    <Textarea
                      placeholder="Add your implementation notes and strategy adjustments here..."
                      className="min-h-[150px]"
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        <Button>
          <span className="material-icons text-sm mr-1">save</span>
          Save Assessment & Strategies
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MarkingCriteriaModule;