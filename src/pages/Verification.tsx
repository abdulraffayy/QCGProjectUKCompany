import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import EnhancedVerificationPanel from "../components/verification/EnhancedVerificationPanel";
import BritishStandardsVerifier from "../components/verification/BritishStandardsVerifier";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";

const VerificationPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  // Use only React state for statusCache (no localStorage)
  const [statusCache, setStatusCache] = useState<{ [lessonId: number]: string }>({});
  const [statusValue, setStatusValue] = useState('pending');
  // Add these states at the top inside VerificationPage component
  const [clarityScore, setClarityScore] = useState(0);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [alignmentScore, setAlignmentScore] = useState(0);
  const [britishStandardValue, setBritishStandardValue] = useState('no');

  const getProgressPercent = (score: number) => (score / 4) * 100;

  // QAQF_LEVELS for lesson detail card
  const QAQF_LEVELS: { [key: number]: string } = {
    1: 'Entry',
    2: 'Basic',
    3: 'Foundation',
    4: 'Intermediate',
    5: 'Advanced',
    6: 'Specialist',
    7: 'Professional',
    8: 'Expert',
    9: 'Master',
  };

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        // Optionally show a toast
      }
    };
    fetchCourses();
  }, []);

  // Set statusValue to the lesson's status (if available) whenever a new lesson is selected
  React.useEffect(() => {
    if (selectedContent && selectedContent.status) {
      setStatusValue(selectedContent.status);
    } else {
      setStatusValue('pending');
    }
  }, [selectedContent]);

  // When a lesson is selected, set the dropdown to its cached status (or 'pending')
  React.useEffect(() => {
    if (selectedContent && selectedContent.id) {
      setStatusValue(statusCache[selectedContent.id] || 'pending');
    } else {
      setStatusValue('pending');
    }
  }, [selectedContent, statusCache]);

  // When lessons are loaded for a course, set all their statuses to the backend value (or 'pending' if missing)
  React.useEffect(() => {
    if (lessons && lessons.length > 0) {
      setStatusCache(() => {
        const updated: { [lessonId: number]: string } = {};
        lessons.forEach((lesson: any) => {
          updated[lesson.id] = lesson.status || 'pending';
        });
        return updated;
      });
    }
  }, [lessons]);

  // Fetch lessons/licenses for the selected course
  React.useEffect(() => {
    if (!selectedCourse) {
      setLessons([]);
      return;
    }
    setIsLoadingLessons(true);
    fetch(`/api/lessons?courseid=${encodeURIComponent(selectedCourse)}`)
      .then(res => res.json())
      .then(data => {
        setLessons(Array.isArray(data) ? data : []);
        setIsLoadingLessons(false);
      })
      .catch(() => {
        setLessons([]);
        setIsLoadingLessons(false);
      });
  }, [selectedCourse]);

  // Filter lessons by search term
  const filteredLessons = lessons.filter(lesson =>
  (lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lesson.description && lesson.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Handle verification completion
  const handleVerificationComplete = (status: string, feedback: string) => {
    if (!selectedContent) return;
    toast({
      title: "Verification Complete",
      description: `Content "${selectedContent.title}" has been marked as ${status}.`
    });
    // In a real implementation, you would update the content status in the database
    console.log(`Content ${selectedContent.id} verification status updated to ${status}`);
    console.log('Feedback:', feedback);
  };

  // Handle British standards compliance check completion
  const handleComplianceChecked = (isCompliant: boolean, issues: string[]) => {
    if (!selectedContent) return;
    toast({
      title: isCompliant ? "Standards Compliance Verified" : "Standards Compliance Issues Found",
      description: isCompliant
        ? "The content meets British standards requirements."
        : `The content has ${issues.length} British standards compliance issues.`,
      variant: isCompliant ? "default" : "destructive"
    });
    // In a real implementation, you would update the content compliance status
    console.log(`Content ${selectedContent.id} compliance status: ${isCompliant ? 'compliant' : 'non-compliant'}`);
    console.log('Issues:', issues);
  };

  // Update status and cache on change
  async function updateLessonStatus(lessonId: number, status: string) {
    try {
      const res = await fetch(`/api/lessons_status/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setStatusCache(prev => ({ ...prev, [lessonId]: status }));
      setStatusValue(status); // Ensure UI updates immediately
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to update lesson status.',
        variant: 'destructive',
      });
    }
  }

  const handleSaveChanges = async () => {
    if (!selectedContent?.id) {
      toast({
        title: "Error",
        description: "No content selected to save changes.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${selectedContent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          britishStandard: britishStandardValue,
          status: statusValue,
          clarityScore,
          completenessScore,
          accuracyScore,
          alignmentScore
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      toast({
        title: "Changes Saved",
        description: "All changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Content Verification</h2>
          <p className="text-neutral-600 mt-1">
            Verify content against QAQF and British standards
          </p>
        </div>

        <div className="flex items-center">
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content Selection Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Pending Content
                </CardTitle>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-40 focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCourse ? (
                <div className="text-center py-8 border rounded-md">
                  <span className="material-icons text-4xl text-neutral-300">inventory_2</span>
                  <p className="mt-2 text-neutral-500">Select a course to view its licenses/lessons</p>
                </div>
              ) : isLoadingLessons ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredLessons.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                  <span className="material-icons text-4xl text-neutral-300">inventory_2</span>
                  <p className="mt-2 text-neutral-500">No licenses/lessons found for this course</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedContent?.id === lesson.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-neutral-50'
                        }`}
                      onClick={() => setSelectedContent(lesson)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className={`font-medium ${selectedContent?.id === lesson.id ? 'text-primary-foreground' : 'text-neutral-800'}`}>{lesson.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-1"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedContent(lesson);
                          }}
                          title="View details"
                        >
                          <span className="material-icons text-base">visibility</span>
                        </Button>
                      </div>
                      <p className={`text-sm mt-1 ${selectedContent?.id === lesson.id ? 'text-primary-foreground' : 'text-neutral-500'}`}>{lesson.type ? lesson.type.replace('_', ' ') : ''}</p>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs ${selectedContent?.id === lesson.id ? 'text-primary-foreground' : 'text-neutral-500'}`}>{lesson.level ? `QAQF Level ${lesson.level}` : ''}</span>
                        {lesson.createddate && <><span className="mx-2 text-neutral-300">•</span>
                          <span className={`text-xs ${selectedContent?.id === lesson.id ? 'text-primary-foreground' : 'text-neutral-500'}`}>{new Date(lesson.createddate).toLocaleDateString()}</span></>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Lesson Detail Card Panel */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <Tabs defaultValue="content">
              <TabsList className="w-full sm:w-auto grid grid-cols-3">
                <TabsTrigger value="content">Course Content</TabsTrigger>
                <TabsTrigger value="qaqf">QAQF Verification</TabsTrigger>
                <TabsTrigger value="british">British Standards</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
              
                {selectedContent ? (
                  <div className="bg-neutral-50 border rounded shadow p-4 animate-slideDown relative w-full">
                    <div className="flex flex-col items-start mb-2">
                      <div><b>Title:</b> {selectedContent.title}</div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div><b>Type:</b> {selectedContent.type}</div>
                      <div><b>Duration:</b> {selectedContent.duration}</div>
                      <div>
                        <b>QAQF Level:</b>{" "}
                        {(selectedContent.qaqfLevel || selectedContent.level || selectedContent.qaqf_level) && QAQF_LEVELS[selectedContent.qaqfLevel || selectedContent.level || selectedContent.qaqf_level]
                          ? `QAQF ${selectedContent.qaqfLevel || selectedContent.level || selectedContent.qaqf_level}: ${QAQF_LEVELS[selectedContent.qaqfLevel || selectedContent.level || selectedContent.qaqf_level]}`
                          : `N/A (qaqfLevel: ${selectedContent.qaqfLevel}, level: ${selectedContent.level}, qaqf_level: ${selectedContent.qaqf_level})`}
                      </div>
                      <div><b>User ID:</b> {selectedContent.userid}</div>
                      <div><b>Course ID:</b> {selectedContent.courseid}</div>
                      <div>
                        <b>Description:</b>
                        <div
                          className="mt-2 p-3 bg-white border rounded-md"
                          dangerouslySetInnerHTML={{
                            __html: selectedContent.description || (selectedContent.metadata && selectedContent.metadata.description) || ''
                          }}
                        />
                      </div>
                      {/* Action Row: Button and Dropdowns */}
                      <div className="flex items-end justify-between flex-wrap gap-4">
                        <Button 
                          onClick={handleSaveChanges}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Save Changes
                        </Button>
                      
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">British Standard</span>
                            <Select
                              value={britishStandardValue}
                              onValueChange={setBritishStandardValue}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Status</span>
                            <Select
                              value={statusValue}
                              onValueChange={(value) => {
                                if (selectedContent?.id) {
                                  updateLessonStatus(selectedContent.id, value);
                                }
                              }}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Scoring Sections Start */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Row 1: Clarity & Completeness */}
                        <div>
                          <span className="font-bold text-lg">Clarity</span>
                          <RadioGroup
                            className="flex flex-col gap-2 mt-2"
                            name="clarity-score"
                            value={clarityScore ? clarityScore.toString() : ''}
                            onValueChange={val => setClarityScore(Number(val))}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="4" id="clarity-4" />
                              <Label htmlFor="clarity-4">4/4 - Exceptionally clear and well-structured</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="3" id="clarity-3" />
                              <Label htmlFor="clarity-3">3/4 - Clear and well-organized</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2" id="clarity-2" />
                              <Label htmlFor="clarity-2">2/4 - Generally clear with some areas for improvement</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="clarity-1" />
                              <Label htmlFor="clarity-1">1/4 - Unclear or poorly structured</Label>
                            </div>
                          </RadioGroup>
                          
                        </div>
                        <div>
                          <span className="font-bold text-lg">Completeness</span>
                          <RadioGroup
                            className="flex flex-col gap-2 mt-2"
                            name="completeness-score"
                            value={completenessScore ? completenessScore.toString() : ''}
                            onValueChange={val => setCompletenessScore(Number(val))}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="4" id="completeness-4" />
                              <Label htmlFor="completeness-4">4/4 - Comprehensive and thorough coverage</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="3" id="completeness-3" />
                              <Label htmlFor="completeness-3">3/4 - Good coverage of main topics</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2" id="completeness-2" />
                              <Label htmlFor="completeness-2">2/4 - Basic coverage with gaps</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="completeness-1" />
                              <Label htmlFor="completeness-1">1/4 - Incomplete or insufficient coverage</Label>
                            </div>
                          </RadioGroup>
                          
                        </div>
                        {/* Row 2: Accuracy & QAQF Alignment */}
                        <div>
                          <span className="font-bold text-lg">Accuracy</span>
                          <RadioGroup
                            className="flex flex-col gap-2 mt-2"
                            name="accuracy-score"
                            value={accuracyScore ? accuracyScore.toString() : ''}
                            onValueChange={val => setAccuracyScore(Number(val))}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="4" id="accuracy-4" />
                              <Label htmlFor="accuracy-4">4/4 - Completely accurate and up-to-date</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="3" id="accuracy-3" />
                              <Label htmlFor="accuracy-3">3/4 - Mostly accurate with minor issues</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2" id="accuracy-2" />
                              <Label htmlFor="accuracy-2">2/4 - Generally accurate but some concerns</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="accuracy-1" />
                              <Label htmlFor="accuracy-1">1/4 - Significant accuracy issues</Label>
                            </div>
                          </RadioGroup>
                          
                        </div>
                        <div>
                          <span className="font-bold text-lg">QAQF Alignment</span>
                          <RadioGroup
                            className="flex flex-col gap-2 mt-2"
                            name="alignment-score"
                            value={alignmentScore ? alignmentScore.toString() : ''}
                            onValueChange={val => setAlignmentScore(Number(val))}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="4" id="alignment-4" />
                              <Label htmlFor="alignment-4">4/4 - Perfect alignment with QAQF level</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="3" id="alignment-3" />
                              <Label htmlFor="alignment-3">3/4 - Good alignment with minor gaps</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2" id="alignment-2" />
                              <Label htmlFor="alignment-2">2/4 - Partial alignment with concerns</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="alignment-1" />
                              <Label htmlFor="alignment-1">1/4 - Poor alignment with QAQF level</Label>
                            </div>
                          </RadioGroup>
                          
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-bold text-lg">Clarity</span>
                        <div className="w-[1030px] flex flex-col mt-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded relative">
                              <div
                                className="h-2 bg-blue-500 rounded transition-all duration-300"
                                style={{ width: `${getProgressPercent(clarityScore)}%` }}
                              />
                            </div>
                            <span className="ml-2 min-w-[40px] text-right text-sm font-semibold text-blue-700">
                              {getProgressPercent(clarityScore)}%
                            </span>
                          </div>
                          <div className="w-[1030px] flex flex-col gap-2 mt-2">
                            <span className="font-bold text-lg">Completeness</span>
                            <div className="flex-1 h-2 bg-green-500/10 rounded relative">
                              <div
                                className="h-2 bg-green-500 rounded transition-all duration-300"
                                style={{ width: `${getProgressPercent(completenessScore)}%` }}
                              />
                            </div>
                            <span className="ml-2 min-w-[40px] text-right text-sm font-semibold text-green-700">
                              {getProgressPercent(completenessScore)}%
                            </span>
                          </div>
                          <div className="w-[1030px] flex flex-col mt-2">
                            <span className="font-bold text-lg">Accuracy</span>
                            <div className="flex-1 h-2 bg-yellow-500/10 rounded relative">
                              <div
                                className="h-2 bg-yellow-500 rounded transition-all duration-300"
                                style={{ width: `${getProgressPercent(accuracyScore)}%` }}
                              />
                            </div>
                            <span className="ml-2 min-w-[40px] text-right text-sm font-semibold text-yellow-700">
                              {getProgressPercent(accuracyScore)}%
                            </span>
                          </div>
                          <div className="w-[1030px] flex flex-col mt-2">
                            <span className="font-bold text-lg">QAQF Alignment</span>
                            <div className="flex-1 h-2 bg-purple-500/10 rounded relative">
                              <div
                                className="h-2 bg-purple-500 rounded transition-all duration-300"
                                style={{ width: `${getProgressPercent(alignmentScore)}%` }}
                              />
                            </div>
                            <span className="ml-2 min-w-[40px] text-right text-sm font-semibold text-purple-700">
                              {getProgressPercent(alignmentScore)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <style>{`
                      @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px);}
                        to { opacity: 1; transform: translateY(0);}
                      }
                      .animate-slideDown {
                        animation: slideDown 0.2s ease;
                      }
                    `}</style>
                  </div>
                ) : (
                  <div className="text-center text-neutral-400">No lesson selected.</div>
                )}
              </TabsContent>

              <TabsContent value="qaqf" className="mt-6">
                <EnhancedVerificationPanel
                  content={selectedContent}
                  onVerificationComplete={handleVerificationComplete}
                />
              </TabsContent>

              <TabsContent value="british" className="mt-6">
                <BritishStandardsVerifier
                  content={selectedContent}
                  onComplianceChecked={handleComplianceChecked}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full py-16">
              <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Content Moderation</h2>
            <p className="text-neutral-600 mt-1">Moderate and ensure content adheres to British standards and QAQF framework</p>
          </div>
        </div>
      </div>
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <span className="material-icons text-4xl text-primary">fact_check</span>
                </div>
                <h3 className="text-xl font-semibold text-center">Select Content to Verify</h3>
                <p className="text-neutral-500 text-center mt-2 max-w-md">
                  Choose content from the list to verify against QAQF framework requirements and British standards
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default VerificationPage;