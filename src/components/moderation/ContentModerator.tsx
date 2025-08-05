import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

interface Content {
  id: number;
  title: string;
  description: string;
  type: string;
  qaqf_level: number;
  verification_status: string;
  content: string;
  created_at: string;
}

interface ContentModeratorProps {
  contents?: Content[];
  onApprove?: (id: number) => void;
  onReject?: (id: number, reason: string) => void;
  onRequestChanges?: (id: number, feedback: string) => void;
}

const ContentModerator: React.FC<ContentModeratorProps> = ({
  contents = [],
  onApprove,
  onReject,
  onRequestChanges
}) => {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [statusCache, setStatusCache] = useState<{ [lessonId: number]: string }>({});
  const [statusValue, setStatusValue] = useState('pending');
  const [britishStandardValue, setBritishStandardValue] = useState('no');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [verificationComments, setVerificationComments] = useState('');

  // Add scoring state and helper with localStorage persistence
  const [clarityScore, setClarityScore] = useState(0);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [alignmentScore, setAlignmentScore] = useState(0);
  
  // Cache for verification data per lesson
  const [verificationCache, setVerificationCache] = useState<{
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
      const cached = localStorage.getItem('moderationVerificationCache');
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('Error loading verification cache from localStorage:', error);
      return {};
    }
  });
  
  // Custom setter for verificationCache that also saves to localStorage
  const updateVerificationCache = (updater: (prev: any) => any) => {
    setVerificationCache(prev => {
      const newCache = updater(prev);
      // Save to localStorage
      try {
        localStorage.setItem('moderationVerificationCache', JSON.stringify(newCache));
      } catch (error) {
        console.error('Error saving verification cache to localStorage:', error);
      }
      return newCache;
    });
  };
  
  const getProgressPercent = (score: number) => (score / 4) * 100;

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

  // When lessons are loaded, set their statuses in the cache
  React.useEffect(() => {
    if (lessons && lessons.length > 0) {
      setStatusCache(() => {
        const updated: { [lessonId: number]: string } = {};
        lessons.forEach((lesson: any) => {
          updated[lesson.id] = (lesson as any).status || 'pending';
        });
        return updated;
      });
    }
  }, [lessons]);

  // When a lesson is selected, set the dropdown to its cached status and load verification data
  React.useEffect(() => {
    if (selectedContent && selectedContent.id) {
      setStatusValue(statusCache[selectedContent.id] || 'pending');
      
      // Load cached verification data for this lesson
      const cachedVerification = verificationCache[selectedContent.id];
      if (cachedVerification) {
        setClarityScore(cachedVerification.clarity);
        setCompletenessScore(cachedVerification.completeness);
        setAccuracyScore(cachedVerification.accuracy);
        setAlignmentScore(cachedVerification.alignment);
        setBritishStandardValue(cachedVerification.britishStandard);
        setVerificationComments(cachedVerification.comments);
        setVerificationCompleted(cachedVerification.completed);
      } else {
        // Reset verification data for new lesson
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
      // Reset verification data
      setClarityScore(0);
      setCompletenessScore(0);
      setAccuracyScore(0);
      setAlignmentScore(0);
      setBritishStandardValue('no');
      setVerificationComments('');
      setVerificationCompleted(false);
    }
  }, [selectedContent, statusCache, verificationCache]);

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
      // Optionally show a toast
    }
  }

  const filteredLessons = lessons;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleApprove = (content: Content) => {
    if (onApprove) {
      onApprove(content.id);
    }
  };

  const handleReject = (content: Content) => {
    if (onReject && rejectionReason.trim()) {
      onReject(content.id, rejectionReason);
      setRejectionReason('');
    }
  };

  const handleRequestChanges = (content: Content) => {
    if (onRequestChanges && feedback.trim()) {
      onRequestChanges(content.id, feedback);
      setFeedback('');
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!selectedContent?.id) {
        console.error('No content selected');
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

      const response = await fetch(`http://38.29.145.85:8000/api/moderation_lessons/${selectedContent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        throw new Error('Failed to save verification data');
      }

      // Update verification cache with current state
      if (selectedContent?.id) {
        updateVerificationCache(prev => ({
          ...prev,
          [selectedContent.id]: {
            clarity: clarityScore,
            completeness: completenessScore,
            accuracy: accuracyScore,
            alignment: alignmentScore,
            britishStandard: britishStandardValue,
            comments: verificationComments,
            completed: verificationCompleted
          }
        }));
      }

      console.log('Changes saved successfully');

    } catch (error) {
      console.error('Error saving changes:', error);
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
    
    // Clear cached verification data for current lesson
    if (selectedContent?.id) {
      updateVerificationCache(prev => {
        const updated = { ...prev };
        delete updated[selectedContent.id];
        return updated;
      });
    }
  };

  const runAutoVerification = async () => {
    if (!selectedContent) {
      console.error('No content selected');
      return;
    }

    if (!selectedContent.description || selectedContent.description.trim() === '') {
      console.error('No description content available');
      setVerificationComments('Error: No content description available for moderation');
      return;
    }

    setIsVerifying(true);
    setVerificationCompleted(false);
    setVerificationComments('');

    try {
      const requestBody = {
        content: selectedContent.description.trim(),
      };
      
      console.log('Sending request to API:', requestBody);
      
      const response = await fetch('http://38.29.145.85:8000/api/autoverification_lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Auto-verification failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Raw API Response:', result);
      
      if (result.success && result.data) {
        const data = result.data;
        
        console.log('API Response Data:', data);
        
        // Map API response data to UI components using correct field names
        const newClarityScore = data.verification_clarity || 0;
        const newCompletenessScore = data.verification_completeness || 0;
        const newAccuracyScore = data.verification_accuracy || 0;
        const newAlignmentScore = data.verification_qaqf_alignment || 0;
        
        console.log('Mapped Scores:', {
          clarity: newClarityScore,
          completeness: newCompletenessScore,
          accuracy: newAccuracyScore,
          alignment: newAlignmentScore,
          britishStandard: data.verification_british_standard,
          comments: data.verification_comments
        });
        
        // Update UI state with API response data
        setClarityScore(newClarityScore);
        setCompletenessScore(newCompletenessScore);
        setAccuracyScore(newAccuracyScore);
        setAlignmentScore(newAlignmentScore);
        setBritishStandardValue(data.verification_british_standard || 'no');
        setVerificationComments(data.verification_comments || '');
        setVerificationCompleted(true);
        
        // Cache the verification data for this lesson
        if (selectedContent?.id) {
          updateVerificationCache(prev => ({
            ...prev,
            [selectedContent.id]: {
              clarity: newClarityScore,
              completeness: newCompletenessScore,
              accuracy: newAccuracyScore,
              alignment: newAlignmentScore,
              britishStandard: data.verification_british_standard || 'no',
              comments: data.verification_comments || '',
              completed: true
            }
          }));
        }
        
        // Calculate average score using the new values from API
        const scores = [newClarityScore, newCompletenessScore, newAccuracyScore, newAlignmentScore];
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // Determine final status based on API response or calculated average
        let finalStatus = 'pending';
        if (data.verification_status) {
          finalStatus = data.verification_status;
        } else {
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
      } else if (result.success === false) {
        // Handle API error response
        console.error('API returned error:', result.error);
        setVerificationComments(`API Error: ${result.error}`);
        setVerificationCompleted(true);
      } else {
        console.log('Unexpected API response structure:', result);
        setVerificationComments('Unexpected API response format');
      }

       setVerificationCompleted(true);
       setIsVerifying(false);

    } catch (error) {
      setIsVerifying(false);
      console.error('Auto-verification failed:', error);
    }
  };

  const handleVerify = async () => {
    if (!selectedContent) {
      console.error('No content selected');
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
          level: selectedContent.qaqf_level,
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
      
      // Set scores based on AI analysis (if available in response)
      if (result.scores) {
        setClarityScore(result.scores.clarity || 0);
        setCompletenessScore(result.scores.completeness || 0);
        setAccuracyScore(result.scores.accuracy || 0);
        setAlignmentScore(result.scores.alignment || 0);
      }
      
      // Set British standard compliance (if available in response)
      if (result.britishStandardCompliant !== undefined) {
        setBritishStandardValue(result.britishStandardCompliant ? 'yes' : 'no');
      }
      
      // Set comments with full AI response
      const aiResponse = JSON.stringify(result, null, 2);
      setVerificationComments(aiResponse);
      
      // Calculate average score
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

    } catch (error) {
      setIsVerifying(false);
      console.error('Verification failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Content List */}
        <Card className='w-[400px] flex-shrink-0'>
          <CardHeader>
            <CardTitle>Content Queue</CardTitle>
            <CardDescription>
              Review and moderate submitted content
            </CardDescription>
            <div className="flex items-center justify-between mt-4">
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
            {/* License/Lesson List - no scrollbar, no max-h */}
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
              <div className="space-y-2 mb-4">
                {filteredLessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedContent?.id === lesson.id
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
            {/* Existing content queue list below */}
            <div className="space-y-3">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedContent?.id === content.id 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedContent(content)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{content.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {content.description.length > 60 
                          ? `${content.description.substring(0, 60)}...`
                          : content.description
                        }
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Level {content.qaqf_level}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(content.verification_status)}`}>
                          {getStatusIcon(content.verification_status)}
                          <span className="ml-1">{content.verification_status}</span>
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContent(content);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
            </div>
          </CardContent>
        </Card>

        {/* Content Review Panel */}
        <Card className='flex-1'>
          <CardHeader>
            <CardTitle>Content Review</CardTitle>
            <CardDescription>
              {selectedContent ? 'Review selected content' : 'Select content to review'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedContent ? (
              <>
                <div className="bg-neutral-50 border rounded shadow p-4 animate-slideDown relative w-full">
                  <div className="flex flex-col items-start mb-2">
                    <div><b>ID:</b> {selectedContent.id}</div>
                    <div><b>Title:</b> {selectedContent.title}</div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div><b>Type:</b> {selectedContent.type || 'N/A'}</div>
                    <div><b>QAQF Level:</b> {selectedContent.qaqf_level ? `QAQF ${selectedContent.qaqf_level}` : 'N/A'}</div>
                    <div>
                      <b>Description:</b>
                      <div
                        className="mt-2 p-3 bg-white border rounded-md"
                        dangerouslySetInnerHTML={{
                          __html: selectedContent.description || ''
                        }}
                      />
                    </div>
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

                     
                    </div>
                  
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <Button 
                        variant="default"
                        onClick={() => {
                          if (selectedContent && selectedContent.description) {
                            runAutoVerification();
                          } else {
                            console.error('No content selected or no description available');
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
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete Moderation
                          </>
                        )}
                      </Button>
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
               </>
             ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="mx-auto h-8 w-8 mb-2" />
                  <p>Select content from the queue to begin review</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentModerator;