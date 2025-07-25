import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusCache, setStatusCache] = useState<{ [lessonId: number]: string }>({});
  const [statusValue, setStatusValue] = useState('pending');

  // Add scoring state and helper
  const [clarityScore, setClarityScore] = useState(0);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [alignmentScore, setAlignmentScore] = useState(0);
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

  // When a lesson is selected, set the dropdown to its cached status (or 'pending')
  React.useEffect(() => {
    if (selectedContent && selectedContent.id) {
      setStatusValue(statusCache[selectedContent.id] || 'pending');
    } else {
      setStatusValue('pending');
    }
  }, [selectedContent, statusCache]);

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

  const filteredLessons = lessons.filter(lesson =>
    (lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lesson.description && lesson.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content List */}
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Content Review</CardTitle>
            <CardDescription>
              {selectedContent ? 'Review selected content' : 'Select content to review'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedContent ? (
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
                <div className="flex flex-wrap items-center justify-end gap-4 mt-8">
                  <Button variant="outline">British Standard</Button>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">QAQF Level</span>
                    <Select>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="1–3" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
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
                  <div className="flex items-center gap-2">
                  </div>
                  <div className="mt-8">
                    <h3 className="font-bold text-xl mb-4">Scoring</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      <div className="w-[710px] flex flex-col mt-2">
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
                        <div className="w-[710px] flex flex-col mt-2">
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
                        <div className="w-[710PX] flex flex-col mt-2">
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
                        <div className="w-[710PX] flex flex-col mt-2">
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