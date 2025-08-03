import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";

const VerificationPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<{ id: string, title: string, description?: string }[]>([]);
  const [selectedCourseDescription, setSelectedCourseDescription] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  // Use only React state for statusCache (no localStorage)
  const [statusCache, setStatusCache] = useState<{ [lessonId: number]: string }>({});
  const [statusValue, setStatusValue] = useState('pending');
  // Add scoring data cache for each lesson with localStorage persistence
  const [scoringCache, setScoringCache] = useState<{ 
    [lessonId: number]: {
      clarity: number;
      completeness: number;
      accuracy: number;
      alignment: number;
      britishStandard: string;
      comments: string;
      completed: boolean;
    }
  }>(() => {
    // Load from localStorage on component mount
    try {
      const cached = localStorage.getItem('verificationScoringCache');
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('Error loading scoring cache from localStorage:', error);
      return {};
    }
  });
  
  // Custom setter for scoringCache that also saves to localStorage
  const updateScoringCache = (updater: (prev: any) => any) => {
    setScoringCache(prev => {
      const newCache = updater(prev);
      // Save to localStorage
      try {
        localStorage.setItem('verificationScoringCache', JSON.stringify(newCache));
      } catch (error) {
        console.error('Error saving scoring cache to localStorage:', error);
      }
      return newCache;
    });
  };
  
  // Current lesson scoring states
  const [clarityScore, setClarityScore] = useState(0);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [alignmentScore, setAlignmentScore] = useState(0);
  const [britishStandardValue, setBritishStandardValue] = useState('no');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [verificationComments, setVerificationComments] = useState('');


  const getProgressPercent = (score: number) => (score / 4) * 100;

  // Function to map API response data to UI state and cache it
  const mapApiResponseToUI = (apiData: any) => {
    if (!apiData || !selectedContent?.id) return;
    
    const newScoringData = {
      clarity: apiData.verification_clarity !== undefined ? apiData.verification_clarity : clarityScore,
      completeness: apiData.verification_completeness !== undefined ? apiData.verification_completeness : completenessScore,
      accuracy: apiData.verification_accuracy !== undefined ? apiData.verification_accuracy : accuracyScore,
      alignment: apiData.verification_qaqf_alignment !== undefined ? apiData.verification_qaqf_alignment : alignmentScore,
      britishStandard: apiData.verification_british_standard !== undefined ? apiData.verification_british_standard : britishStandardValue,
      comments: apiData.verification_comments !== undefined ? apiData.verification_comments : verificationComments,
      completed: true
    };
    
    // Update UI state
    setClarityScore(newScoringData.clarity);
    setCompletenessScore(newScoringData.completeness);
    setAccuracyScore(newScoringData.accuracy);
    setAlignmentScore(newScoringData.alignment);
    setBritishStandardValue(newScoringData.britishStandard);
    setVerificationComments(newScoringData.comments);
    setVerificationCompleted(true);
    
    // Cache the scoring data for this lesson
    updateScoringCache(prev => ({
      ...prev,
      [selectedContent.id]: newScoringData
    }));
  };

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

  // When a lesson is selected, set the dropdown to its cached status and load cached scoring data
  React.useEffect(() => {
    if (selectedContent && selectedContent.id) {
      setStatusValue(statusCache[selectedContent.id] || 'pending');
      
      // Load cached scoring data for this lesson
      const cachedScoring = scoringCache[selectedContent.id];
      if (cachedScoring) {
        setClarityScore(cachedScoring.clarity);
        setCompletenessScore(cachedScoring.completeness);
        setAccuracyScore(cachedScoring.accuracy);
        setAlignmentScore(cachedScoring.alignment);
        setBritishStandardValue(cachedScoring.britishStandard);
        setVerificationComments(cachedScoring.comments);
        setVerificationCompleted(cachedScoring.completed);
      } else {
        // Reset scoring data for new lesson
        setClarityScore(0);
        setCompletenessScore(0);
        setAccuracyScore(0);
        setAlignmentScore(0);
        setBritishStandardValue('no');
        setVerificationComments('');
        setVerificationCompleted(false);
      }
    } else {
      setStatusValue('pending');
      // Reset scoring data
      setClarityScore(0);
      setCompletenessScore(0);
      setAccuracyScore(0);
      setAlignmentScore(0);
      setBritishStandardValue('no');
      setVerificationComments('');
      setVerificationCompleted(false);
    }
  }, [selectedContent, statusCache, scoringCache]);

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
      })
      .catch(err => {
        console.error('Failed to fetch lessons:', err);
        setLessons([]);
      })
      .finally(() => {
        setIsLoadingLessons(false);
      });
  }, [selectedCourse]);

  // Filter lessons based on search term
  const filteredLessons = lessons.filter(lesson =>
    lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerificationComplete = (status: string, feedback: string) => {
    setVerificationCompleted(true);
    setVerificationComments(feedback);
    setStatusValue(status);
    
    if (selectedContent?.id) {
      updateLessonStatus(selectedContent.id, status);
    }
  };

  const handleComplianceChecked = (isCompliant: boolean, issues: string[]) => {
    if (isCompliant) {
      setBritishStandardValue('yes');
    } else {
      setBritishStandardValue('no');
    }
  };

  async function updateLessonStatus(lessonId: number, status: string) {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson status');
      }

      // Update local cache
      setStatusCache(prev => ({
        ...prev,
        [lessonId]: status
      }));

      toast({
        title: "Status Updated",
        description: `Lesson status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating lesson status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update lesson status",
        variant: "destructive",
      });
    }
  }

  const handleSaveChanges = async () => {
    try {
      if (!selectedContent?.id) {
        toast({
          title: "No Content Selected",
          description: "Please select content to save changes",
          variant: "destructive",
        });
        return;
      }

      // Save all current state
      const saveData = {
        lessonId: selectedContent.id,
        status: statusValue,
        britishStandard: britishStandardValue,
        scores: {
          clarity: clarityScore,
          completeness: completenessScore,
          accuracy: accuracyScore,
          alignment: alignmentScore,
        },
        comments: verificationComments,
      };

      const response = await fetch(`http://38.29.145.85:8000/api/verification_lessons/${selectedContent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        throw new Error('Failed to save verification data');
      }

      toast({
        title: "Changes Saved",
        description: "Verification data has been saved successfully",
      });

      // Update local cache
      setStatusCache(prev => ({
        ...prev,
        [selectedContent.id]: statusValue
      }));

      // Update scoring cache to persist the saved data
      updateScoringCache(prev => ({
        ...prev,
        [selectedContent.id]: {
          clarity: clarityScore,
          completeness: completenessScore,
          accuracy: accuracyScore,
          alignment: alignmentScore,
          britishStandard: britishStandardValue,
          comments: verificationComments,
          completed: true
        }
      }));

    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save verification data",
        variant: "destructive",
      });
    }
  };

  const runAutoVerificationForSelectedLesson = async () => {
    if (!selectedContent || !selectedContent.description) {
      return;
    }

    setIsVerifying(true);
    setVerificationCompleted(false);
    setVerificationComments('');

    try {
      const response = await fetch('http://38.29.145.85:8000/api/autoverification_lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: selectedContent.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Auto-verification failed');
      }

      const result = await response.json();
      
      // Debug: Log the AI response
      console.log('Auto-Verification AI Response:', result);
      
      // Check if the response has the expected structure
      if (result.success && result.data) {
        const data = result.data;
        console.log('Auto-Verification Data:', data);
        
        // Map API response data to UI components using the helper function
        mapApiResponseToUI(data);
        
        // Only set verification comments if it exists in the API response
        if (data.verification_comments !== undefined) {
          setVerificationComments(data.verification_comments);
        } else {
          setVerificationComments(''); // Clear any previous content
        }
      } else {
        console.log('Unexpected API response structure:', result);
        setVerificationComments('');
      }
      
      // Calculate average score using the mapped values
      const scores = [clarityScore, completenessScore, accuracyScore, alignmentScore];
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      // Determine final status based on API response or scores
      let finalStatus = 'pending';
      
      // First try to use the verification_status from API response
      if (result.success && result.data && result.data.verification_status) {
        finalStatus = result.data.verification_status;
      } else {
        // Fallback to calculating based on average score
        if (averageScore >= 3.5) {
          finalStatus = 'verified';
        } else if (averageScore >= 2.5) {
          finalStatus = 'pending';
        } else {
          finalStatus = 'unverified';
        }
      }

      // Update status
      setStatusValue(finalStatus);
      if (selectedContent?.id) {
        updateLessonStatus(selectedContent.id, finalStatus);
      }

      setVerificationCompleted(true);
      setIsVerifying(false);

      toast({
        title: "Auto-Verification Complete",
        description: `Content verification completed with average score: ${averageScore.toFixed(1)}/4`,
      });

    } catch (error) {
      setIsVerifying(false);
      toast({
        title: "Auto-Verification Failed",
        description: "Failed to complete auto-verification process.",
        variant: "destructive",
      });
    }
  };

  const runAutoVerification = async () => {
    if (!selectedContent) {
      toast({
        title: "No Content Selected",
        description: "Please select content to verify",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationCompleted(false);
    setVerificationComments('');

    try {
      const response = await fetch('http://38.29.145.85:8000/api/autoverification_lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
         
          content: selectedContent.description,
         
        }),
      });

      if (!response.ok) {
        throw new Error('Auto-verification failed');
      }

      const result = await response.json();
      
      // Debug: Log the AI response
      console.log('Auto-Verification AI Response:', result);
      
              // Check if the response has the expected structure
        if (result.success && result.data) {
          const data = result.data;
          console.log('Auto-Verification Data:', data);
          
          // Map API response data to UI components using the helper function
          mapApiResponseToUI(data);
          
          // Only set verification comments if it exists in the API response
          // If not found, leave the textarea empty
          if (data.verification_comments !== undefined) {
            setVerificationComments(data.verification_comments);
            } else {
            setVerificationComments(''); // Clear any previous content
          }
        } else {
          console.log('Unexpected API response structure:', result);
          // Don't show any JSON in the comments field
          setVerificationComments('');
        }
      
      // Calculate average score using the mapped values
      const scores = [clarityScore, completenessScore, accuracyScore, alignmentScore];
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      // Determine final status based on API response or scores
      let finalStatus = 'pending';
      
      // First try to use the verification_status from API response
      if (result.success && result.data && result.data.verification_status) {
        finalStatus = result.data.verification_status;
      } else {
        // Fallback to calculating based on average score
        if (averageScore >= 3.5) {
          finalStatus = 'verified';
        } else if (averageScore >= 2.5) {
          finalStatus = 'pending';
        } else {
          finalStatus = 'unverified';
        }
      }

      // Update status
      setStatusValue(finalStatus);
      if (selectedContent?.id) {
        updateLessonStatus(selectedContent.id, finalStatus);
      }

      setVerificationCompleted(true);
      setIsVerifying(false);

      toast({
        title: "Auto-Verification Complete",
        description: `Content verification completed with average score: ${averageScore.toFixed(1)}/4`,
      });

    } catch (error) {
      setIsVerifying(false);
      toast({
        title: "Auto-Verification Failed",
        description: "Failed to complete auto-verification process.",
        variant: "destructive",
      });
    }
  };

  const resetVerification = () => {
    setClarityScore(0);
    setCompletenessScore(0);
    setAccuracyScore(0);
    setAlignmentScore(0);
    setBritishStandardValue('no');
    setVerificationCompleted(false);
    setVerificationComments('');
    setIsVerifying(false);
    
    // Clear cached scoring data for current lesson
    if (selectedContent?.id) {
      updateScoringCache(prev => {
        const updated = { ...prev };
        delete updated[selectedContent.id];
        return updated;
      });
    }
  };

  const handleVerify = async () => {
    if (!selectedContent) {
      toast({
        title: "No Content Selected",
        description: "Please select content to verify",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationCompleted(false);

    try {
      const response = await fetch('/api/verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: selectedContent.id,
          title: selectedContent.title,
          description: selectedContent.content,
          type: selectedContent.type,
          level: selectedContent.level || selectedContent.qaqfLevel || selectedContent.qaqf_level,
          scores: {
            clarity: clarityScore,
            completeness: completenessScore,
            accuracy: accuracyScore,
            alignment: alignmentScore,
          },
          britishStandard: britishStandardValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const result = await response.json();
      
      // Debug: Log the AI response
      console.log('AI Response:', result);
      console.log('AI Scores:', result.scores);
      console.log('British Standard Compliant:', result.britishStandardCompliant);
      
      // Set scores based on AI analysis (if available in response)
      if (result.scores) {
        console.log('Setting scores from AI response:', result.scores);
        setClarityScore(result.scores.clarity || 0);
        setCompletenessScore(result.scores.completeness || 0);
        setAccuracyScore(result.scores.accuracy || 0);
        setAlignmentScore(result.scores.alignment || 0);
      } else {
        console.log('No scores found in AI response');
      }
      
      // Set British standard compliance (if available in response)
      if (result.britishStandardCompliant !== undefined) {
        console.log('Setting British Standard:', result.britishStandardCompliant ? 'yes' : 'no');
        setBritishStandardValue(result.britishStandardCompliant ? 'yes' : 'no');
      } else {
        console.log('No British Standard compliance found in AI response');
      }
      
      // Set comments with full AI response
      const aiResponse = JSON.stringify(result, null, 2);
      setVerificationComments(aiResponse);
      
      // Calculate average score using AI scores if available, otherwise use current scores
      const scores = result.scores ? 
        [result.scores.clarity || 0, result.scores.completeness || 0, result.scores.accuracy || 0, result.scores.alignment || 0] :
        [clarityScore, completenessScore, accuracyScore, alignmentScore];
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      // Determine final status based on scores
      let finalStatus = 'pending';
      if (averageScore >= 3.5) {
        finalStatus = 'verified';
      } else if (averageScore >= 2.5) {
        finalStatus = 'pending';
      } else {
        finalStatus = 'unverified';
      }

      // Update status
      setStatusValue(finalStatus);
      if (selectedContent?.id) {
        updateLessonStatus(selectedContent.id, finalStatus);
      }

      setVerificationCompleted(true);
      setIsVerifying(false);

      toast({
        title: "Verification Complete",
        description: `Content verification completed with average score: ${averageScore.toFixed(1)}/4`,
      });

    } catch (error) {
      setIsVerifying(false);
      toast({
        title: "Verification Failed",
        description: "Failed to complete verification process.",
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

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6">
          {/* Content Selection Panel */}
          <div className="md:col-span-1 lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Pending Content
                  </CardTitle>
                  <Select value={selectedCourse} onValueChange={(value) => {
                    setSelectedCourse(value);
                    // Find and store the course description
                    const course = courses.find(c => c.id === value);
                    setSelectedCourseDescription(course?.description || '');
                  }}>
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
                          <div className="flex items-center gap-1">
                            {selectedContent?.id === lesson.id && isVerifying && (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                            )}
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
          <div className="md:col-span-1 lg:col-span-2">
            {selectedContent ? (
              <div className="mt-6">
                <div className="bg-neutral-50 border rounded shadow p-4 animate-slideDown relative w-full">
                  <div className="flex flex-col items-start mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg font-semibold">{selectedContent.title}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Auto-Verify {isVerifying ? "Running..." : verificationCompleted ? "Complete" : "Ready"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-4">
                    <div><b>Type:</b> {selectedContent.type}</div>
                    <div><b>Duration:</b> {selectedContent.duration}</div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <b>QAQF Level:</b>{" "}
                      {(selectedContent.qaqfLevel || selectedContent.level || selectedContent.qaqf_level) && QAQF_LEVELS[selectedContent.qaqfLevel || selectedContent.level || selectedContent.qaqf_level]
                        ? `QAQF ${selectedContent.qaqfLevel || selectedContent.level || selectedContent.qaqf_level}: ${QAQF_LEVELS[selectedContent.qaqfLevel || selectedContent.level || selectedContent.qaqf_level]}`
                        : `N/A (qaqfLevel: ${selectedContent.qaqfLevel}, level: ${selectedContent.level}, qaqf_level: ${selectedContent.qaqf_level})`}
                    </div>
                    <div><b>User ID:</b> {selectedContent.userid}</div>
                    <div><b>Course ID:</b> {selectedContent.courseid}</div>
                  </div>
                  <div className="mb-4">
                    <b>Description:</b>
                    <div
                      className="mt-2 p-3 bg-white border rounded-md max-h-40 overflow-y-auto"
                      dangerouslySetInnerHTML={{
                        __html: selectedContent.description || (selectedContent.metadata && selectedContent.metadata.description) || ''
                      }}
                    />
                  </div>

                  {/* Action Row: Button and Dropdowns */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={handleSaveChanges}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={resetVerification}
                        disabled={isVerifying || !verificationCompleted}
                        size="sm"
                      >
                        <span className="material-icons text-sm mr-1">refresh</span>
                        Reset
                      </Button>
                      <Button 
                        variant="default"
                        onClick={() => {
                          if (selectedContent && selectedContent.description) {
                            runAutoVerificationForSelectedLesson();
                          } else {
                            toast({
                              title: "No Content Selected",
                              description: "Please select a lesson with content to auto-verify",
                              variant: "destructive",
                            });
                          }
                        }}
                        size="sm"
                      >
                        Auto-Verify
                      </Button>
                     
                      <Button 
                        onClick={handleVerify}
                        disabled={isVerifying || verificationCompleted}
                        size="sm"
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
                  
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">British Standard</span>
                        <Select
                          value={britishStandardValue}
                          onValueChange={setBritishStandardValue}
                        >
                          <SelectTrigger className="w-20 sm:w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Status</span>
                        <Select
                          value={statusValue}
                          onValueChange={(value) => {
                            if (selectedContent?.id) {
                              updateLessonStatus(selectedContent.id, value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-28 sm:w-36">
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
                  <div className="mt-4 space-y-6">
                    {/* Radio Groups Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 md:gap-6">
                      {/* Row 1: Clarity & Completeness */}
                      <div className="bg-white p-4 rounded-lg border">
                        <span className="font-bold text-lg">Clarity</span>
                        <RadioGroup
                          className="flex flex-col gap-2 mt-2"
                          name="clarity-score"
                          value={clarityScore ? clarityScore.toString() : ''}
                          onValueChange={val => setClarityScore(Number(val))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="clarity-4" />
                            <Label htmlFor="clarity-4" className="text-sm">4/4 - Exceptionally clear and well-structured</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="clarity-3" />
                            <Label htmlFor="clarity-3" className="text-sm">3/4 - Clear and well-organized</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="clarity-2" />
                            <Label htmlFor="clarity-2" className="text-sm">2/4 - Generally clear with some areas for improvement</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="clarity-1" />
                            <Label htmlFor="clarity-1" className="text-sm">1/4 - Unclear or poorly structured</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <span className="font-bold text-lg">Completeness</span>
                        <RadioGroup
                          className="flex flex-col gap-2 mt-2"
                          name="completeness-score"
                          value={completenessScore ? completenessScore.toString() : ''}
                          onValueChange={val => setCompletenessScore(Number(val))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="completeness-4" />
                            <Label htmlFor="completeness-4" className="text-sm">4/4 - Comprehensive and thorough coverage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="completeness-3" />
                            <Label htmlFor="completeness-3" className="text-sm">3/4 - Good coverage of main topics</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="completeness-2" />
                            <Label htmlFor="completeness-2" className="text-sm">2/4 - Basic coverage with gaps</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="completeness-1" />
                            <Label htmlFor="completeness-1" className="text-sm">1/4 - Incomplete or insufficient coverage</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Row 2: Accuracy & QAQF Alignment */}
                      <div className="bg-white p-4 rounded-lg border">
                        <span className="font-bold text-lg">Accuracy</span>
                        <RadioGroup
                          className="flex flex-col gap-2 mt-2"
                          name="accuracy-score"
                          value={accuracyScore ? accuracyScore.toString() : ''}
                          onValueChange={val => setAccuracyScore(Number(val))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="accuracy-4" />
                            <Label htmlFor="accuracy-4" className="text-sm">4/4 - Completely accurate and up-to-date</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="accuracy-3" />
                            <Label htmlFor="accuracy-3" className="text-sm">3/4 - Mostly accurate with minor issues</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="accuracy-2" />
                            <Label htmlFor="accuracy-2" className="text-sm">2/4 - Generally accurate but some concerns</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="accuracy-1" />
                            <Label htmlFor="accuracy-1" className="text-sm">1/4 - Significant accuracy issues</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <span className="font-bold text-lg">QAQF Alignment</span>
                        <RadioGroup
                          className="flex flex-col gap-2 mt-2"
                          name="alignment-score"
                          value={alignmentScore ? alignmentScore.toString() : ''}
                          onValueChange={val => setAlignmentScore(Number(val))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="4" id="alignment-4" />
                            <Label htmlFor="alignment-4" className="text-sm">4/4 - Perfect alignment with QAQF level</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="alignment-3" />
                            <Label htmlFor="alignment-3" className="text-sm">3/4 - Good alignment with minor gaps</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="alignment-2" />
                            <Label htmlFor="alignment-2" className="text-sm">2/4 - Partial alignment with concerns</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="alignment-1" />
                            <Label htmlFor="alignment-1" className="text-sm">1/4 - Poor alignment with QAQF level</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {/* Progress Bars Section */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="font-bold text-lg mb-4">Scoring Progress</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Clarity</span>
                            <span className="text-sm font-semibold text-blue-700">{getProgressPercent(clarityScore)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded relative">
                            <div
                              className="h-2 bg-blue-500 rounded transition-all duration-300"
                              style={{ width: `${getProgressPercent(clarityScore)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Completeness</span>
                            <span className="text-sm font-semibold text-green-700">{getProgressPercent(completenessScore)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded relative">
                            <div
                              className="h-2 bg-green-500 rounded transition-all duration-300"
                              style={{ width: `${getProgressPercent(completenessScore)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Accuracy</span>
                            <span className="text-sm font-semibold text-yellow-700">{getProgressPercent(accuracyScore)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded relative">
                            <div
                              className="h-2 bg-yellow-500 rounded transition-all duration-300"
                              style={{ width: `${getProgressPercent(accuracyScore)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">QAQF Alignment</span>
                            <span className="text-sm font-semibold text-purple-700">{getProgressPercent(alignmentScore)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded relative">
                            <div
                              className="h-2 bg-purple-500 rounded transition-all duration-300"
                              style={{ width: `${getProgressPercent(alignmentScore)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Comments Section */}
                <div className="mt-6 bg-neutral-50 border rounded shadow p-4">
                  <div className="mb-3">
                    <Label htmlFor="verification-comments" className="font-bold text-lg">
                      Verification Comments
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      id="verification-comments"
                      placeholder="Verification data will appear here..."
                      value={verificationComments}
                      onChange={(e) => setVerificationComments(e.target.value)}
                      className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md resize-vertical font-mono text-sm"
                      readOnly={verificationCompleted}
                    />
                    <p className="text-sm text-neutral-500">
                      All verification data from the API response will be displayed here.
                    </p>
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
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full py-16">
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