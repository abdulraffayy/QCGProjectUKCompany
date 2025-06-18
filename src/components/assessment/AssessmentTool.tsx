import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BookOpen, Target, CheckCircle, BarChart3 } from 'lucide-react';

const AssessmentTool: React.FC = () => {
  const [assessmentType, setAssessmentType] = useState('written');
  const [qaqfLevel, setQaqfLevel] = useState(1);
  const [subject, setSubject] = useState('');
  const [assessment, setAssessment] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleGenerateAssessment = () => {
    // Mock assessment generation
    const mockResults = {
      score: 85,
      breakdown: {
        clarity: 90,
        accuracy: 85,
        completeness: 80,
        alignment: 88
      },
      feedback: "Strong assessment that demonstrates good understanding of QAQF principles."
    };
    setResults(mockResults);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Assessment Creator
          </CardTitle>
          <CardDescription>
            Create QAQF-aligned assessments with automated scoring and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Assessment</TabsTrigger>
              <TabsTrigger value="analyze">Analyze Assessment</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Assessment Type</label>
                  <Select value={assessmentType} onValueChange={setAssessmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="written">Written Examination</SelectItem>
                      <SelectItem value="practical">Practical Assessment</SelectItem>
                      <SelectItem value="portfolio">Portfolio Assessment</SelectItem>
                      <SelectItem value="project">Project-Based Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">QAQF Level</label>
                  <Select value={qaqfLevel.toString()} onValueChange={(value) => setQaqfLevel(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select QAQF level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject Area</label>
                <Input 
                  placeholder="Enter subject area (e.g., Business Management, Engineering)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Assessment Content</label>
                <Textarea 
                  placeholder="Enter your assessment questions or criteria..."
                  className="min-h-[120px]"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                />
              </div>
              
              <Button onClick={handleGenerateAssessment} className="w-full">
                Generate Assessment Analysis
              </Button>
            </TabsContent>
            
            <TabsContent value="analyze" className="space-y-4">
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Assessment Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced AI-powered analysis of assessment quality and QAQF compliance
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              {results ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Assessment Results</h3>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {results.score}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(results.breakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{key}</span>
                          <span>{value}%</span>
                        </div>
                        <Progress value={value as number} className="h-2" />
                      </div>
                    ))}
                  </div>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Feedback</h4>
                      <p className="text-sm text-muted-foreground">{results.feedback}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Results Yet</h3>
                  <p className="text-muted-foreground">
                    Create and analyze an assessment to see results here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentTool;