import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { Content } from 'shared/schema';

interface VerificationCriterion {
  id: string;
  name: string;
  description: string;
  score: number;
  maxScore: number;
  feedback: string;
}

interface EnhancedVerificationPanelProps {
  content: Content;
  onVerificationComplete: (status: string, feedback: string) => void;
}

const EnhancedVerificationPanel: React.FC<EnhancedVerificationPanelProps> = ({ 
  content, 
  onVerificationComplete 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("academic");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState("");
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  
  // Initial verification criteria
  const [academicCriteria, setAcademicCriteria] = useState<VerificationCriterion[]>([
    {
      id: "clarity",
      name: "Clarity",
      description: "Content is clear and well-structured",
      score: 0,
      maxScore: 10,
      feedback: ""
    },
    {
      id: "accuracy",
      name: "Accuracy",
      description: "Information is accurate and properly sourced",
      score: 0,
      maxScore: 10,
      feedback: ""
    },
    {
      id: "depth",
      name: "Depth",
      description: "Content shows appropriate depth of knowledge",
      score: 0,
      maxScore: 10,
      feedback: ""
    }
  ]);
  
  const [qaqfCriteria, setQaqfCriteria] = useState<VerificationCriterion[]>([
    {
      id: "alignment",
      name: "QAQF Alignment",
      description: `Aligns with QAQF Level ${content.qaqf_level} requirements`,
      score: 0,
      maxScore: 10,
      feedback: ""
    },
    {
      id: "characteristics",
      name: "Characteristics Implementation",
      description: "Properly implements selected QAQF characteristics",
      score: 0,
      maxScore: 10,
      feedback: ""
    },
    {
      id: "application",
      name: "Practical Application",
      description: "Demonstrates practical application of QAQF principles",
      score: 0,
      maxScore: 10,
      feedback: ""
    }
  ]);
  
  const [inclusivityCriteria, setInclusivityCriteria] = useState<VerificationCriterion[]>([
    {
      id: "accessibility",
      name: "Accessibility",
      description: "Content is accessible to diverse learners",
      score: 0,
      maxScore: 10,
      feedback: ""
    },
    {
      id: "inclusivity",
      name: "Inclusivity",
      description: "Content is inclusive and diverse in representation",
      score: 0,
      maxScore: 10,
      feedback: ""
    },
    {
      id: "bias",
      name: "Bias Avoidance",
      description: "Content avoids implicit and explicit bias",
      score: 0,
      maxScore: 10,
      feedback: ""
    }
  ]);
  
  // Update criteria score
  const updateCriterionScore = (
    criteriaType: "academic" | "qaqf" | "inclusivity", 
    id: string, 
    score: number
  ) => {
    switch (criteriaType) {
      case "academic":
        setAcademicCriteria(prev => 
          prev.map(criterion => 
            criterion.id === id ? { ...criterion, score } : criterion
          )
        );
        break;
      case "qaqf":
        setQaqfCriteria(prev => 
          prev.map(criterion => 
            criterion.id === id ? { ...criterion, score } : criterion
          )
        );
        break;
      case "inclusivity":
        setInclusivityCriteria(prev => 
          prev.map(criterion => 
            criterion.id === id ? { ...criterion, score } : criterion
          )
        );
        break;
    }
  };
  
  // Update criterion feedback
  const updateCriterionFeedback = (
    criteriaType: "academic" | "qaqf" | "inclusivity", 
    id: string, 
    feedback: string
  ) => {
    switch (criteriaType) {
      case "academic":
        setAcademicCriteria(prev => 
          prev.map(criterion => 
            criterion.id === id ? { ...criterion, feedback } : criterion
          )
        );
        break;
      case "qaqf":
        setQaqfCriteria(prev => 
          prev.map(criterion => 
            criterion.id === id ? { ...criterion, feedback } : criterion
          )
        );
        break;
      case "inclusivity":
        setInclusivityCriteria(prev => 
          prev.map(criterion => 
            criterion.id === id ? { ...criterion, feedback } : criterion
          )
        );
        break;
    }
  };
  
  // Calculate overall score
  const calculateOverallScore = (): number => {
    const allCriteria = [...academicCriteria, ...qaqfCriteria, ...inclusivityCriteria];
    const totalScore = allCriteria.reduce((sum, criterion) => sum + criterion.score, 0);
    const totalMaxScore = allCriteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
    
    return Math.round((totalScore / totalMaxScore) * 100);
  };
  
  // Get verification status based on score
  const getVerificationStatus = (score: number): string => {
    if (score >= 80) return "verified";
    if (score >= 50) return "pending"; // Needs improvements
    return "rejected";
  };
  
  // Handle verification process
  const handleVerify = () => {
    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      const overallScore = calculateOverallScore();
      const status = getVerificationStatus(overallScore);
      
      // Generate combined feedback
      const feedbackParts = [];
      
      // Add academic criteria feedback
      feedbackParts.push("## Academic Quality Assessment");
      academicCriteria.forEach(criterion => {
        if (criterion.feedback) {
          feedbackParts.push(`### ${criterion.name} (${criterion.score}/${criterion.maxScore})`);
          feedbackParts.push(criterion.feedback);
        }
      });
      
      // Add QAQF criteria feedback
      feedbackParts.push("\n## QAQF Framework Alignment");
      qaqfCriteria.forEach(criterion => {
        if (criterion.feedback) {
          feedbackParts.push(`### ${criterion.name} (${criterion.score}/${criterion.maxScore})`);
          feedbackParts.push(criterion.feedback);
        }
      });
      
      // Add inclusivity criteria feedback
      feedbackParts.push("\n## Accessibility and Inclusivity");
      inclusivityCriteria.forEach(criterion => {
        if (criterion.feedback) {
          feedbackParts.push(`### ${criterion.name} (${criterion.score}/${criterion.maxScore})`);
          feedbackParts.push(criterion.feedback);
        }
      });
      
      // Add overall assessment
      feedbackParts.push(`\n## Overall Assessment`);
      feedbackParts.push(`Overall Score: ${overallScore}%`);
      feedbackParts.push(`Status: ${status.toUpperCase()}`);
      
      if (status === "verified") {
        feedbackParts.push("This content meets or exceeds the required standards and is approved for use.");
      } else if (status === "pending") {
        feedbackParts.push("This content needs some improvements before it can be fully verified.");
      } else {
        feedbackParts.push("This content does not meet the required standards and needs significant revision.");
      }
      
      // Overall verification feedback
      const combinedFeedback = feedbackParts.join("\n\n");
      setVerificationFeedback(combinedFeedback);
      
      // Complete verification
      setVerificationCompleted(true);
      onVerificationComplete(status, combinedFeedback);
      
      toast({
        title: "Verification Complete",
        description: `Content has been ${status === "verified" ? "verified" : status === "pending" ? "marked for revision" : "rejected"} with an overall score of ${overallScore}%.`
      });
      
      setIsVerifying(false);
    }, 2000);
  };
  
  // Reset verification
  const resetVerification = () => {
    setAcademicCriteria(prev => prev.map(c => ({ ...c, score: 0, feedback: "" })));
    setQaqfCriteria(prev => prev.map(c => ({ ...c, score: 0, feedback: "" })));
    setInclusivityCriteria(prev => prev.map(c => ({ ...c, score: 0, feedback: "" })));
    setVerificationFeedback("");
    setVerificationCompleted(false);
  };
  
  // Run auto-verification
  const runAutoVerification = () => {
    setIsVerifying(true);
    
    // Simulate auto-verification
    setTimeout(() => {
      // Set random scores for academic criteria
      setAcademicCriteria(prev => 
        prev.map(criterion => ({
          ...criterion,
          score: Math.floor(Math.random() * 4) + 7, // 7-10 range
          feedback: `Automated assessment for ${criterion.name}: This aspect of the content meets expectations.`
        }))
      );
      
      // Set random scores for QAQF criteria
      setQaqfCriteria(prev => 
        prev.map(criterion => ({
          ...criterion,
          score: Math.floor(Math.random() * 4) + 7, // 7-10 range
          feedback: `Automated assessment for ${criterion.name}: Good implementation of QAQF principles.`
        }))
      );
      
      // Set random scores for inclusivity criteria
      setInclusivityCriteria(prev => 
        prev.map(criterion => ({
          ...criterion,
          score: Math.floor(Math.random() * 3) + 7, // 7-9 range
          feedback: `Automated assessment for ${criterion.name}: The content is mostly inclusive and accessible.`
        }))
      );
      
      setIsVerifying(false);
      
      toast({
        title: "Auto-Verification Complete",
        description: "The content has been automatically verified. Please review the scores and feedback, then complete the verification process."
      });
    }, 3000);
  };
  
  // Render a criteria section
  const renderCriteria = (
    criteria: VerificationCriterion[], 
    criteriaType: "academic" | "qaqf" | "inclusivity"
  ) => {
    return criteria.map(criterion => (
      <div key={criterion.id} className="border rounded-md p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
          <div>
            <h3 className="font-medium text-base">{criterion.name}</h3>
            <p className="text-neutral-500 text-sm">{criterion.description}</p>
          </div>
          <div className="flex items-center mt-2 lg:mt-0">
            <span className="mr-2 text-sm font-semibold">
              {criterion.score}/{criterion.maxScore}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <button
                  key={score}
                  className={`w-6 h-6 text-xs flex items-center justify-center rounded-full mx-0.5 ${
                    criterion.score >= score 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                  onClick={() => updateCriterionScore(criteriaType, criterion.id, score)}
                  disabled={verificationCompleted || isVerifying}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Textarea
          placeholder={`Provide feedback for ${criterion.name}...`}
          value={criterion.feedback}
          onChange={(e) => updateCriterionFeedback(criteriaType, criterion.id, e.target.value)}
          className="mt-2"
          disabled={verificationCompleted || isVerifying}
        />
      </div>
    ));
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center text-lg">
            <span className="material-icons mr-2 text-base">verified</span>
            Enhanced QAQF Verification
          </CardTitle>
          
          <div className="flex mt-2 lg:mt-0 gap-2">
            <Button 
              variant="outline" 
              onClick={resetVerification}
              disabled={isVerifying || !verificationCompleted}
            >
              <span className="material-icons text-sm mr-1">refresh</span>
              Reset
            </Button>
            <Button 
              variant="outline" 
              onClick={runAutoVerification}
              disabled={isVerifying || verificationCompleted}
            >
              <span className="material-icons text-sm mr-1">auto_fix_high</span>
              Auto-Verify
            </Button>
            <Button 
              onClick={handleVerify}
              disabled={isVerifying || verificationCompleted}
            >
              {isVerifying ? (
                <>
                  <span className="material-icons text-sm mr-1 animate-spin">refresh</span>
                  Verifying...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-1">check_circle</span>
                  Complete Verification
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Verification Progress</span>
            <span className="text-sm font-semibold">{calculateOverallScore()}%</span>
          </div>
          <Progress value={calculateOverallScore()} className="h-2" />
        </div>
        
        <Tabs 
          defaultValue="academic" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="academic">Academic Quality</TabsTrigger>
            <TabsTrigger value="qaqf">QAQF Alignment</TabsTrigger>
            <TabsTrigger value="inclusivity">Inclusivity</TabsTrigger>
            {verificationCompleted && (
              <TabsTrigger value="results">Verification Results</TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="pt-4">
        <TabsContent value="academic" className="mt-0 space-y-4">
          <p className="text-sm text-neutral-600 mb-4">
            Assess the academic quality of the content according to standard educational criteria.
          </p>
          {renderCriteria(academicCriteria, "academic")}
        </TabsContent>
        
        <TabsContent value="qaqf" className="mt-0 space-y-4">
          <p className="text-sm text-neutral-600 mb-4">
            Evaluate how well the content aligns with QAQF framework requirements for level {content.qaqf_level}.
          </p>
          {renderCriteria(qaqfCriteria, "qaqf")}
        </TabsContent>
        
        <TabsContent value="inclusivity" className="mt-0 space-y-4">
          <p className="text-sm text-neutral-600 mb-4">
            Assess the content's accessibility and inclusivity for diverse learners.
          </p>
          {renderCriteria(inclusivityCriteria, "inclusivity")}
        </TabsContent>
        
        <TabsContent value="results" className="mt-0">
          <div className="border rounded-md p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Verification Results</h3>
                <p className="text-neutral-500">
                  Overall Score: {calculateOverallScore()}%
                </p>
              </div>
              <Badge 
                className="mt-2 lg:mt-0"
                variant={
                  getVerificationStatus(calculateOverallScore()) === "verified" ? "default" :
                  getVerificationStatus(calculateOverallScore()) === "pending" ? "outline" : "destructive"
                }
              >
                {getVerificationStatus(calculateOverallScore()).toUpperCase()}
              </Badge>
            </div>
            
            <div className="prose prose-sm max-w-none bg-neutral-50 p-4 rounded-md">
              <div className="whitespace-pre-wrap">
                {verificationFeedback}
              </div>
            </div>
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default EnhancedVerificationPanel;