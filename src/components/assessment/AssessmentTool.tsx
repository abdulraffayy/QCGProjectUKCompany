import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { 
  FileText, 
  Video, 
  BookOpen, 
  PenTool, 
  BarChart3, 
  Clock, 
  Users, 
  Target,
  AlertCircle
} from 'lucide-react';

interface AssessmentCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: AssessmentLevel[];
}

interface AssessmentLevel {
  score: number;
  description: string;
  indicators: string[];
}

interface AssessmentToolProps {
  contentType: string;
  qaqfLevel: number;
  onAssessmentComplete?: (assessment: any) => void;
}

const AssessmentTool: React.FC<AssessmentToolProps> = ({
  contentType,
  qaqfLevel,
  onAssessmentComplete
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState<string>('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('criteria');

  const assessmentCriteria: AssessmentCriteria[] = [
    {
      id: 'clarity',
      name: 'Clarity',
      description: 'Clear and understandable content structure',
      weight: 20,
      levels: [
        {
          score: 4,
          description: 'Exceptionally clear and well-structured',
          indicators: ['Perfect logical flow', 'Crystal clear explanations', 'Excellent use of examples']
        },
        {
          score: 3,
          description: 'Clear and well-organized',
          indicators: ['Good logical flow', 'Clear explanations', 'Appropriate examples']
        },
        {
          score: 2,
          description: 'Generally clear with some areas for improvement',
          indicators: ['Mostly logical', 'Some unclear sections', 'Limited examples']
        },
        {
          score: 1,
          description: 'Unclear or poorly structured',
          indicators: ['Poor organization', 'Confusing explanations', 'Missing examples']
        }
      ]
    },
    {
      id: 'completeness',
      name: 'Completeness',
      description: 'Comprehensive coverage of topic',
      weight: 25,
      levels: [
        {
          score: 4,
          description: 'Comprehensive and thorough coverage',
          indicators: ['All key topics covered', 'Detailed explanations', 'Additional resources provided']
        },
        {
          score: 3,
          description: 'Good coverage of main topics',
          indicators: ['Most topics covered', 'Adequate detail', 'Some additional context']
        },
        {
          score: 2,
          description: 'Basic coverage with gaps',
          indicators: ['Some topics missing', 'Limited detail', 'Minimal context']
        },
        {
          score: 1,
          description: 'Incomplete or insufficient coverage',
          indicators: ['Major gaps', 'Superficial treatment', 'Missing context']
        }
      ]
    },
    {
      id: 'accuracy',
      name: 'Accuracy',
      description: 'Factual correctness and reliability',
      weight: 25,
      levels: [
        {
          score: 4,
          description: 'Completely accurate and up-to-date',
          indicators: ['No factual errors', 'Current information', 'Reliable sources']
        },
        {
          score: 3,
          description: 'Mostly accurate with minor issues',
          indicators: ['Few minor errors', 'Generally current', 'Good sources']
        },
        {
          score: 2,
          description: 'Generally accurate but some concerns',
          indicators: ['Some errors present', 'Some outdated info', 'Mixed source quality']
        },
        {
          score: 1,
          description: 'Significant accuracy issues',
          indicators: ['Multiple errors', 'Outdated information', 'Poor sources']
        }
      ]
    },
    {
      id: 'engagement',
      name: 'Engagement',
      description: 'Level of learner engagement and interaction',
      weight: 15,
      levels: [
        {
          score: 4,
          description: 'Highly engaging and interactive',
          indicators: ['Multiple interaction types', 'Compelling content', 'Active learning promoted']
        },
        {
          score: 3,
          description: 'Engaging with good interaction',
          indicators: ['Some interactions', 'Interesting content', 'Encourages participation']
        },
        {
          score: 2,
          description: 'Moderately engaging',
          indicators: ['Limited interaction', 'Adequate interest', 'Some participation']
        },
        {
          score: 1,
          description: 'Low engagement level',
          indicators: ['Minimal interaction', 'Dry content', 'Passive learning']
        }
      ]
    },
    {
      id: 'alignment',
      name: 'QAQF Alignment',
      description: 'Alignment with QAQF level requirements',
      weight: 15,
      levels: [
        {
          score: 4,
          description: 'Perfect alignment with QAQF level',
          indicators: ['Meets all level criteria', 'Appropriate complexity', 'Correct depth']
        },
        {
          score: 3,
          description: 'Good alignment with minor gaps',
          indicators: ['Meets most criteria', 'Generally appropriate', 'Mostly correct depth']
        },
        {
          score: 2,
          description: 'Partial alignment with concerns',
          indicators: ['Some criteria missing', 'Inconsistent complexity', 'Variable depth']
        },
        {
          score: 1,
          description: 'Poor alignment with QAQF level',
          indicators: ['Many criteria missing', 'Wrong complexity', 'Incorrect depth']
        }
      ]
    }
  ];

  const getContentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'course': return <BookOpen className="h-5 w-5" />;
      default: return <PenTool className="h-5 w-5" />;
    }
  };

  const calculateOverallScore = () => {
    const totalWeight = assessmentCriteria.reduce((sum, criteria) => sum + criteria.weight, 0);
    const weightedScore = assessmentCriteria.reduce((sum, criteria) => {
      const score = scores[criteria.id] || 0;
      return sum + (score * criteria.weight);
    }, 0);
    
    return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 25) : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleScoreChange = (criteriaId: string, score: number) => {
    setScores(prev => ({ ...prev, [criteriaId]: score }));
  };

  const handleFeedbackChange = (criteriaId: string, text: string) => {
    setFeedback(prev => ({ ...prev, [criteriaId]: text }));
  };

  const generateAssessment = () => {
    const overallScore = calculateOverallScore();
    const assessment = {
      contentType,
      qaqfLevel,
      overallScore,
      criteria: assessmentCriteria.map(criteria => ({
        id: criteria.id,
        name: criteria.name,
        score: scores[criteria.id] || 0,
        feedback: feedback[criteria.id] || '',
        weight: criteria.weight
      })),
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations()
    };

    if (onAssessmentComplete) {
      onAssessmentComplete(assessment);
    }
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    assessmentCriteria.forEach(criteria => {
      const score = scores[criteria.id] || 0;
      if (score < 3) {
        recommendations.push({
          criteria: criteria.name,
          suggestion: `Improve ${criteria.name.toLowerCase()} by focusing on ${criteria.levels[2].indicators.join(', ')}`
        });
      }
    });

    return recommendations;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getContentIcon(contentType)}
            <div>
              <CardTitle>Assessment Tool</CardTitle>
              <CardDescription>
                {contentType} Assessment - QAQF Level {qaqfLevel}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="criteria">Assessment Criteria</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="criteria" className="space-y-4">
          <div className="grid gap-4">
            {assessmentCriteria.map((criteria) => (
              <Card key={criteria.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCriteria(criteria.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{criteria.name}</CardTitle>
                      <CardDescription>{criteria.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{criteria.weight}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {criteria.levels.map((level) => (
                      <div key={level.score} className="border rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={level.score >= 3 ? "default" : "secondary"}>
                            {level.score}/4
                          </Badge>
                          <span className="font-medium">{level.description}</span>
                        </div>
                        <ul className="text-sm text-muted-foreground ml-4">
                          {level.indicators.map((indicator, idx) => (
                            <li key={idx}>• {indicator}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <div className="grid gap-6">
            {assessmentCriteria.map((criteria) => (
              <Card key={criteria.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {criteria.name}
                    <Badge variant="outline">{criteria.weight}%</Badge>
                  </CardTitle>
                  <CardDescription>{criteria.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Score</Label>
                    <RadioGroup
                      value={scores[criteria.id]?.toString() || ''}
                      onValueChange={(value) => handleScoreChange(criteria.id, parseInt(value))}
                      className="mt-2"
                    >
                      {criteria.levels.map((level) => (
                        <div key={level.score} className="flex items-center space-x-2">
                          <RadioGroupItem value={level.score.toString()} id={`${criteria.id}-${level.score}`} />
                          <Label htmlFor={`${criteria.id}-${level.score}`} className="flex-1">
                            <span className="font-medium">{level.score}/4</span> - {level.description}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor={`feedback-${criteria.id}`} className="text-base font-medium">
                      Feedback & Comments
                    </Label>
                    <Textarea
                      id={`feedback-${criteria.id}`}
                      placeholder={`Provide specific feedback for ${criteria.name.toLowerCase()}...`}
                      value={feedback[criteria.id] || ''}
                      onChange={(e) => handleFeedbackChange(criteria.id, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Assessment Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(calculateOverallScore())}`}>
                  {calculateOverallScore()}%
                </div>
                <p className="text-muted-foreground mt-1">Overall Score</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Criteria Breakdown</h4>
                {assessmentCriteria.map((criteria) => {
                  const score = scores[criteria.id] || 0;
                  const percentage = (score / 4) * 100;
                  
                  return (
                    <div key={criteria.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{criteria.name}</span>
                        <span>{score}/4 ({Math.round(percentage)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={generateAssessment}
                  className="w-full"
                  disabled={Object.keys(scores).length === 0}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Complete Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentTool;