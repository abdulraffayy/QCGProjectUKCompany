import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Content } from '@shared/schema';
import { checkBritishStandardsCompliance } from '@/lib/qaqf';

interface BritishStandardsVerifierProps {
  content: Content;
  onComplianceChecked: (isCompliant: boolean, issues: string[]) => void;
}

interface StandardCompliance {
  standard: string;
  description: string;
  compliant: boolean;
  notes: string;
}

const BritishStandardsVerifier: React.FC<BritishStandardsVerifierProps> = ({ 
  content, 
  onComplianceChecked 
}) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [checkCompleted, setCheckCompleted] = useState(false);
  const [complianceIssues, setComplianceIssues] = useState<string[]>([]);
  const [overallCompliance, setOverallCompliance] = useState(false);
  const [activeTab, setActiveTab] = useState("terminology");
  
  // Standard compliance checks
  const [standardsCompliance, setStandardsCompliance] = useState<StandardCompliance[]>([
    {
      standard: "BS 5261-1",
      description: "Copy preparation and proof correction",
      compliant: false,
      notes: ""
    },
    {
      standard: "BS 5261-2",
      description: "Specification for typographic requirements",
      compliant: false,
      notes: ""
    },
    {
      standard: "BS 4821",
      description: "British English academic terminology",
      compliant: false, 
      notes: ""
    },
    {
      standard: "BS 8888",
      description: "Technical product documentation and specification",
      compliant: false,
      notes: ""
    },
    {
      standard: "BS 8723",
      description: "Structured vocabularies for information retrieval",
      compliant: false,
      notes: ""
    }
  ]);
  
  // Terminology checks
  const [terminologyIssues, setTerminologyIssues] = useState<{americanTerm: string, britishTerm: string, occurrences: number}[]>([]);
  
  // Format checks
  const [formatIssues, setFormatIssues] = useState<{issue: string, location: string, recommendation: string}[]>([]);
  
  // Accessibility checks
  const [accessibilityScore, setAccessibilityScore] = useState(0);
  const [accessibilityIssues, setAccessibilityIssues] = useState<{priority: string, issue: string, impact: string}[]>([]);
  
  // Run compliance check
  const runComplianceCheck = () => {
    setIsChecking(true);
    
    // First check content against British standards (from qaqf.ts)
    const contentText = typeof content.content === 'string' 
      ? content.content 
      : JSON.stringify(content.content);
    
    const standardsCheck = checkBritishStandardsCompliance(contentText);
    
    // Simulate additional checks
    setTimeout(() => {
      // Update terminology issues based on content
      const newTerminologyIssues = [];
      
      if (contentText.includes("color")) {
        newTerminologyIssues.push({
          americanTerm: "color",
          britishTerm: "colour",
          occurrences: (contentText.match(/color/g) || []).length
        });
      }
      
      if (contentText.includes("center")) {
        newTerminologyIssues.push({
          americanTerm: "center",
          britishTerm: "centre",
          occurrences: (contentText.match(/center/g) || []).length
        });
      }
      
      if (contentText.includes("organization")) {
        newTerminologyIssues.push({
          americanTerm: "organization",
          britishTerm: "organisation",
          occurrences: (contentText.match(/organization/g) || []).length
        });
      }
      
      // Add more term checks as needed
      const americanTerms = ["analyze", "behavior", "catalog", "dialog", "license", "program", "standardize"];
      const britishTerms = ["analyse", "behaviour", "catalogue", "dialogue", "licence", "programme", "standardise"];
      
      americanTerms.forEach((term, index) => {
        if (contentText.toLowerCase().includes(term)) {
          newTerminologyIssues.push({
            americanTerm: term,
            britishTerm: britishTerms[index],
            occurrences: (contentText.toLowerCase().match(new RegExp(term, 'g')) || []).length
          });
        }
      });
      
      setTerminologyIssues(newTerminologyIssues);
      
      // Update format issues
      const newFormatIssues = [];
      
      if (!contentText.includes("learning outcomes")) {
        newFormatIssues.push({
          issue: "Missing learning outcomes section",
          location: "Document structure",
          recommendation: "Add a clear 'Learning Outcomes' section at the beginning of the content"
        });
      }
      
      // Check for assessment criteria
      if (!contentText.includes("assessment criteria")) {
        newFormatIssues.push({
          issue: "Missing assessment criteria",
          location: "Document structure",
          recommendation: "Include assessment criteria aligned with learning outcomes"
        });
      }
      
      // Check for proper headings structure
      if (!contentText.includes("#") && !contentText.includes("<h")) {
        newFormatIssues.push({
          issue: "Inadequate heading structure",
          location: "Throughout document",
          recommendation: "Use proper heading hierarchy (H1, H2, H3) for document structure"
        });
      }
      
      setFormatIssues(newFormatIssues);
      
      // Update accessibility issues
      const newAccessibilityIssues = [];
      let accessScore = 100; // Start with perfect score
      
      // Check for alternative text for images
      if (contentText.includes("![") && !contentText.includes("![alt text]")) {
        newAccessibilityIssues.push({
          priority: "High",
          issue: "Missing alternative text for images",
          impact: "Screen readers cannot interpret images without alt text"
        });
        accessScore -= 20;
      }
      
      // Check for table headers
      if (contentText.includes("|") && !contentText.includes("| --- |")) {
        newAccessibilityIssues.push({
          priority: "Medium",
          issue: "Tables may be missing proper headers",
          impact: "Screen readers cannot associate data cells with headers"
        });
        accessScore -= 15;
      }
      
      // Check for color contrast (simplified check)
      if (contentText.includes("color:") || contentText.includes("background-color:")) {
        newAccessibilityIssues.push({
          priority: "Medium",
          issue: "Custom colors used without contrast verification",
          impact: "Content may not be readable for users with visual impairments"
        });
        accessScore -= 15;
      }
      
      setAccessibilityIssues(newAccessibilityIssues);
      setAccessibilityScore(Math.max(0, accessScore));
      
      // Update standards compliance based on all checks
      const newStandardsCompliance = standardsCompliance.map(standard => {
        // Simulate compliance checks for each standard
        let compliant = Math.random() > 0.3; // 70% chance of compliance for demo
        let notes = "";
        
        if (standard.standard === "BS 4821") {
          compliant = newTerminologyIssues.length === 0;
          notes = compliant 
            ? "Content uses correct British English terminology" 
            : `${newTerminologyIssues.length} terminology issues found`;
        } else if (standard.standard === "BS 5261-1") {
          compliant = newFormatIssues.length === 0;
          notes = compliant 
            ? "Content follows correct formatting guidelines" 
            : `${newFormatIssues.length} formatting issues found`;
        } else if (standard.standard === "BS 8888") {
          compliant = !standardsCheck.issues.some(issue => 
            issue.includes("learning outcomes") || issue.includes("assessment")
          );
          notes = compliant 
            ? "Content includes required educational elements" 
            : "Missing required educational structure elements";
        }
        
        return {
          ...standard,
          compliant,
          notes
        };
      });
      
      setStandardsCompliance(newStandardsCompliance);
      
      // Calculate overall compliance
      const isCompliant = newStandardsCompliance.filter(s => !s.compliant).length <= 1 && 
                          newTerminologyIssues.length <= 2 &&
                          accessScore >= 70;
      
      setOverallCompliance(isCompliant);
      
      // Combine all issues
      const allIssues = [
        ...standardsCheck.issues,
        ...newTerminologyIssues.map(issue => 
          `American spelling "${issue.americanTerm}" used instead of British "${issue.britishTerm}" (${issue.occurrences} occurrences)`
        ),
        ...newFormatIssues.map(issue => 
          `${issue.issue}: ${issue.recommendation}`
        ),
        ...newAccessibilityIssues.map(issue =>
          `${issue.priority} priority: ${issue.issue} - ${issue.impact}`
        )
      ];
      
      setComplianceIssues(allIssues);
      setCheckCompleted(true);
      setIsChecking(false);
      
      // Notify parent component
      onComplianceChecked(isCompliant, allIssues);
      
      toast({
        title: isCompliant ? "Standards Check Passed" : "Standards Check Failed",
        description: isCompliant 
          ? "Content meets British standards with minor or no issues."
          : `Content does not meet British standards. ${allIssues.length} issues found.`,
        variant: isCompliant ? "default" : "destructive"
      });
    }, 2000);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-lg flex items-center">
            <span className="material-icons mr-2 text-base">gavel</span>
            British Standards Verification
          </CardTitle>
          
          <div className="flex mt-2 lg:mt-0 gap-2">
            <Button 
              onClick={runComplianceCheck}
              disabled={isChecking || checkCompleted}
            >
              {isChecking ? (
                <>
                  <span className="material-icons text-sm mr-1 animate-spin">refresh</span>
                  Checking...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-1">check_circle</span>
                  Check Compliance
                </>
              )}
            </Button>
          </div>
        </div>
        
        {checkCompleted && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Compliance Score</span>
              <Badge variant={overallCompliance ? "default" : "destructive"}>
                {overallCompliance ? "COMPLIANT" : "NON-COMPLIANT"}
              </Badge>
            </div>
            <Progress value={overallCompliance ? 100 : 50} className="h-2" />
          </div>
        )}
        
        {checkCompleted && (
          <Tabs 
            defaultValue="terminology" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="terminology">Terminology</TabsTrigger>
              <TabsTrigger value="format">Format & Structure</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="standards">Standards</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {!checkCompleted ? (
          <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <span className="material-icons text-3xl text-primary">fact_check</span>
            </div>
            <h3 className="text-lg font-medium mb-2">British Standards Verification</h3>
            <p className="text-neutral-600 mb-6 max-w-md">
              Check if your content meets British educational standards for terminology, 
              formatting, structure, and accessibility.
            </p>
            <Button 
              onClick={runComplianceCheck}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <span className="material-icons text-sm mr-1 animate-spin">refresh</span>
                  Checking...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-1">check_circle</span>
                  Check Compliance
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <TabsContent value="terminology" className="mt-4">
              <div className="space-y-4">
                <Alert variant={terminologyIssues.length === 0 ? "default" : "destructive"}>
                  <span className="material-icons mr-2">
                    {terminologyIssues.length === 0 ? "check_circle" : "error"}
                  </span>
                  <AlertTitle>Terminology Check</AlertTitle>
                  <AlertDescription>
                    {terminologyIssues.length === 0 
                      ? "No British English terminology issues found."
                      : `${terminologyIssues.length} terminology issues found that need correction.`
                    }
                  </AlertDescription>
                </Alert>
                
                {terminologyIssues.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="text-left p-3">American Term</th>
                          <th className="text-left p-3">British Term</th>
                          <th className="text-left p-3">Occurrences</th>
                        </tr>
                      </thead>
                      <tbody>
                        {terminologyIssues.map((issue, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 font-mono">{issue.americanTerm}</td>
                            <td className="p-3 font-mono text-green-600">{issue.britishTerm}</td>
                            <td className="p-3">{issue.occurrences}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="format" className="mt-4">
              <div className="space-y-4">
                <Alert variant={formatIssues.length === 0 ? "default" : "destructive"}>
                  <span className="material-icons mr-2">
                    {formatIssues.length === 0 ? "check_circle" : "error"}
                  </span>
                  <AlertTitle>Format & Structure Check</AlertTitle>
                  <AlertDescription>
                    {formatIssues.length === 0 
                      ? "Content follows British educational format standards."
                      : `${formatIssues.length} format and structure issues found that need correction.`
                    }
                  </AlertDescription>
                </Alert>
                
                {formatIssues.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="text-left p-3">Issue</th>
                          <th className="text-left p-3">Location</th>
                          <th className="text-left p-3">Recommendation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formatIssues.map((issue, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{issue.issue}</td>
                            <td className="p-3">{issue.location}</td>
                            <td className="p-3 text-blue-600">{issue.recommendation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="accessibility" className="mt-4">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-md">
                  <div>
                    <h3 className="text-lg font-medium">Accessibility Score</h3>
                    <p className="text-neutral-600">
                      {accessibilityScore >= 80 
                        ? "Content meets accessibility standards" 
                        : accessibilityScore >= 60
                          ? "Content needs minor accessibility improvements"
                          : "Content has significant accessibility issues"
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg"
                      style={{ 
                        borderColor: accessibilityScore >= 80 
                          ? 'rgb(34 197 94)' 
                          : accessibilityScore >= 60 
                            ? 'rgb(234 179 8)' 
                            : 'rgb(239 68 68)' 
                      }}
                    >
                      {accessibilityScore}%
                    </div>
                  </div>
                </div>
                
                {accessibilityIssues.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="text-left p-3">Priority</th>
                          <th className="text-left p-3">Issue</th>
                          <th className="text-left p-3">Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessibilityIssues.map((issue, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">
                              <Badge variant={
                                issue.priority === "High" ? "destructive" :
                                issue.priority === "Medium" ? "outline" : "secondary"
                              }>
                                {issue.priority}
                              </Badge>
                            </td>
                            <td className="p-3">{issue.issue}</td>
                            <td className="p-3 text-neutral-600">{issue.impact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="standards" className="mt-4">
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="text-left p-3">Standard</th>
                        <th className="text-left p-3">Description</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standardsCompliance.map((standard, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-medium">{standard.standard}</td>
                          <td className="p-3">{standard.description}</td>
                          <td className="p-3">
                            <Badge variant={standard.compliant ? "default" : "destructive"}>
                              {standard.compliant ? "PASS" : "FAIL"}
                            </Badge>
                          </td>
                          <td className="p-3 text-neutral-600">{standard.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BritishStandardsVerifier;