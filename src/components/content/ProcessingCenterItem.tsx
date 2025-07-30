import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import JoditEditor from "jodit-react";
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Video,
  BookOpen,
  Settings,
  Eye,
  Download,
  X,
  User,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";

interface ProcessingCenterItemProps {
  item: {
    id: string;
    title: string;
    type: string;
    status?: "verified" | "unverified" | "rejected" | "pending";
    progress?: number;
    createdAt: string;
    createdBy: string;
    description?: string;
    qaqfLevel?: number;
    estimatedTime?: string;
    content?: string;
    metadata?: any;
    verificationStatus?: "verified" | "unverified" | "rejected" | "pending"; // Add verification status
  };
  lessons?: any[];
  onAction?: (action: string, itemId: string) => void;
}

const ProcessingCenterItem: React.FC<ProcessingCenterItemProps> = ({
  item,
  lessons = [],
  onAction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState(item.status || "pending");
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Add state for editable fields
  const [editableData, setEditableData] = useState({
    title: item.title || "",
    type: item.type || "",
    duration: (item.metadata && item.metadata.duration) || "",
    qaqfLevel: item.qaqfLevel ? String(item.qaqfLevel) : "",
    userid: (item.metadata && item.metadata.userid) || "",
    courseid: (item.metadata && item.metadata.courseid) || "",
    description: item.description || (item.metadata && item.metadata.description) || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Add state for AI generation
  const [aiQuery, setAiQuery] = useState("");
  const [aiReference, setAiReference] = useState("");
  const [aiGenerateLoading, setAiGenerateLoading] = useState(false);

  // Add state for card height (for resizing)
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isResizing = React.useRef(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  // Track permanently disabled buttons after first click
  const [permanentlyDisabledButtons, setPermanentlyDisabledButtons] = useState<Set<string>>(new Set());

  // Check localStorage on mount to see if AI Generate should be disabled for this item
  useEffect(() => {
    const isDisabled = localStorage.getItem(`processingCenterAiGenerateDisabled_${item.id}`) === 'true';
    console.log(`Item ${item.id} disabled state:`, isDisabled);
    if (isDisabled) {
      setPermanentlyDisabledButtons(prev => new Set([...prev, 'aiGenerate']));
    }
  }, [item.id]);

  // Mouse event handlers for resizing (vertical only)
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isResizing.current && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const newHeight = e.clientY - rect.top;
        if (newHeight > 100) setCardHeight(newHeight); // minimum height
      }
    }
    function handleMouseUp() {
      isResizing.current = false;
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "unverified":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "unverified":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Add verification status functions
  const getVerificationStatusIcon = (verificationStatus: string | undefined) => {
    switch (verificationStatus) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "unverified":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVerificationStatusColor = (verificationStatus: string | undefined) => {
    switch (verificationStatus) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "unverified":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVerificationStatusText = (verificationStatus: string | undefined) => {
    switch (verificationStatus) {
      case "verified":
        return "Verified";
      case "rejected":
        return "Rejected";
      case "unverified":
        return "Unverified";
      case "pending":
        return "Pending";
      default:
        return "Pending";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "course":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action, item.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/lessons_status/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setStatus(
        newStatus as "verified" | "unverified" | "rejected"
      );
      // Notify parent component about status change
      if (onAction) {
        onAction("status_changed", item.id);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/lessons/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete lesson");
      
      // Mark as deleted immediately
      setIsDeleted(true);
      
      // Notify parent component about the deletion
      if (onAction) {
        onAction("deleted", item.id);
      }
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      alert("Could not delete lesson");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/lessons/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editableData.title,
          type: editableData.type,
          description: editableData.description,
          level: parseInt(editableData.qaqfLevel) || null,
          userid: editableData.userid,
          courseid: editableData.courseid,
          duration: editableData.duration
        }),
      });
      if (!res.ok) throw new Error("Failed to update lesson");
      // Update the local item data with the new values
      Object.assign(item, {
        title: editableData.title,
        type: editableData.type,
        description: editableData.description,
        qaqfLevel: parseInt(editableData.qaqfLevel) || null,
        metadata: {
          ...item.metadata,
          userid: editableData.userid,
          courseid: editableData.courseid,
          duration: editableData.duration
        }
      });
      setIsEditing(false);
      setIsEditDialogOpen(false); // <-- Close dialog after update
      if (onAction) {
        onAction("updated", item.id);
      }
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Failed to update lesson:", err);
      alert("Failed to save changes");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditableData({
      title: item.title || "",
      type: item.type || "",
      duration: (item.metadata && item.metadata.duration) || "",
      qaqfLevel: item.qaqfLevel ? String(item.qaqfLevel) : "",
      userid: (item.metadata && item.metadata.userid) || "",
      courseid: (item.metadata && item.metadata.courseid) || "",
      description: item.description || (item.metadata && item.metadata.description) || "",
    });
    setIsEditing(false);
    setIsEditDialogOpen(false);
  };

  const handleAiGenerate = async () => {
    // Permanently disable this button after first click
    setPermanentlyDisabledButtons(prev => new Set([...prev, 'aiGenerate']));
    setAiGenerateLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User token is missing!');
        return;
      }
      
      const generation_type = editableData.type || "quiz";
      const material = aiReference || "";
      const qaqf_level = String(editableData.qaqfLevel || "1");
      const subject = editableData.title || "";
      const userquery = aiQuery || "";
      
      const response = await fetch('/api/ai/assessment-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          generation_type,
          material,
          qaqf_level,
          subject,
          userquery,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      const data = await response.json();
      
      if (data.generated_content && data.generated_content.length > 0) {
        setEditableData(prev => ({ ...prev, description: data.generated_content[0] }));
        // Store in localStorage to remember the disabled state
        localStorage.setItem(`processingCenterAiGenerateDisabled_${item.id}`, 'true');
      } else {
        setEditableData(prev => ({ ...prev, description: "No content generated." }));
      }
    } catch (error) {
      console.error('AI Generate error:', error);
      setEditableData(prev => ({ ...prev, description: "AI generation failed." }));
    } finally {
      setAiGenerateLoading(false);
      // Button stays permanently disabled - no re-enabling
    }
  };

  // Temporary function to reset localStorage for testing
  const resetAiGenerateState = () => {
    localStorage.removeItem(`processingCenterAiGenerateDisabled_${item.id}`);
    setPermanentlyDisabledButtons(new Set());
    setAiGenerateLoading(false);
  };

  // useEffect to handle deletion state
  useEffect(() => {
    if (isDeleted) {
      // The component will be removed from the parent's state
      // This useEffect ensures the deletion state is properly managed
    }
  }, [isDeleted]);

  // Don't render if deleted
  if (isDeleted) {
    return null;
  }

  return (
    <div
      className="relative group"
      style={{ minHeight: cardHeight || undefined, width: '100%' }}
      ref={cardRef}
    >
      <Card
        className="transition-all hover:shadow-md w-full"
        style={{ minHeight: cardHeight, height: cardHeight, width: '100%' }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center gap-2">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate ">{item.title}</CardTitle>
                <CardDescription className="mt-1">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.createdBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.qaqfLevel && <span>Level {item.qaqfLevel}</span>}
                    {/* Add verification status badge */}
                
                  </div>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
            {(item.verificationStatus || item.status) && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getVerificationStatusColor(item.verificationStatus || item.status || "pending")}`}>
                        {getVerificationStatusIcon(item.verificationStatus || item.status || "pending")}
                        <span>{getVerificationStatusText(item.verificationStatus || item.status || "pending")}</span>
                      </div>
                    )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1"
                onClick={handleDeleteLesson}
                disabled={deleteLoading || isDeleted}
                aria-label="Close"
              >
                {deleteLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {status === "unverified" && item.progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Processing...</span>
                <span>{Math.round(item.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              {item.estimatedTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated time remaining: {item.estimatedTime}
                </p>
              )}
            </div>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 border-t ">
            <div className="space-y-4">
              {item.content && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Content Preview</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditClick}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md" style={{ overflow: 'visible', maxHeight: 'none' }}>
                    <div className="bg-gray-50 p-4 rounded shadow-sm border text-sm space-y-1" style={{ overflow: 'visible', maxHeight: 'none' }}>
                      {/* ... non-editing preview ... */}
                      <div>
                        <b>Title:</b>{" "}
                        {item.title ||
                          (item.metadata && item.metadata.title) ||
                          "N/A"}
                      </div>
                      <div>
                        <b>Type:</b>{" "}
                        {item.type ||
                          (item.metadata && item.metadata.type) ||
                          "N/A"}
                      </div>
                      <div>
                        <b>Duration:</b>{" "}
                        {(item.metadata && item.metadata.duration) || "N/A"}
                      </div>
                      <div>
                        <b>QAQF Level:</b>{" "}
                        {typeof item.qaqfLevel === "number"
                          ? item.qaqfLevel
                          : typeof (item as any).qaqflevel === "number"
                          ? (item as any).qaqflevel
                          : "N/A"}
                      </div>
                      <div>
                        <b>User ID:</b>{" "}
                        {(item.metadata && item.metadata.userid) || "N/A"}
                      </div>
                      <div>
                        <b>Course ID:</b>{" "}
                        {(item.metadata && item.metadata.courseid) || "N/A"}
                      </div>
                      {/* Add verification status display */}
                      <div>
                        <b>Verification Status:</b>{" "}
                        {(item.verificationStatus || item.status) ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(item.verificationStatus || item.status || "pending")}`}>
                            {getVerificationStatusIcon(item.verificationStatus || item.status || "pending")}
                            {getVerificationStatusText(item.verificationStatus || item.status || "pending")}
                          </span>
                        ) : (
                          "Not verified"
                        )}
                      </div>
                      <div>
                        <b>Description:</b>
                        <div 
                          className="mt-2 p-3 bg-white border rounded-md"
                          dangerouslySetInnerHTML={{ 
                            __html: item.description || (item.metadata && item.metadata.description) || "" 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </CardContent>
        )}
      </Card>

      {/* Fullscreen Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <DialogContent className="w-[100%] h-screen max-w-full max-h-full p-0 flex flex-col mx-auto">
          <DialogHeader className="p-6">
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
          <div className="border rounded-md w-full mb-6">
             
              <div className="p-4 space-y-3">
              
               
                <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                <Input
                  id="title"
                  value={editableData.title}
                  onChange={(e) => setEditableData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type</Label>
                <select
                  id="type"
                  className="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full focus:border-blue-500 focus:ring-blue-500"
                  value={editableData.type}
                  onChange={(e) => setEditableData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="lecture">Lecture</option>
                  <option value="practical">Practical</option>
                  <option value="seminar">Seminar</option>
                  <option value="activity">Activity</option>
                  <option value="case_study">Case Study</option>
                </select>
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration</Label>
                <Input
                  id="duration"
                  value={editableData.duration}
                  onChange={(e) => setEditableData(prev => ({ ...prev, duration: e.target.value }))}
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="qaqfLevel" className="text-sm font-medium text-gray-700">QAQF Level</Label>
                <select
                  id="qaqfLevel"
                  className="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full focus:border-blue-500 focus:ring-blue-500"
                  value={editableData.qaqfLevel}
                  onChange={(e) => setEditableData(prev => ({ ...prev, qaqfLevel: e.target.value }))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                    <option key={lvl} value={lvl}>QAQF {lvl}</option>
                  ))}
                </select>
              </div>    
              <div>
                  <Label htmlFor="aiQuery" className="text-sm font-medium text-gray-700">Ask your query (Optional)</Label>
                  <Input
                    id="aiQuery"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask your query"
                    className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>   
                  <Label htmlFor="aiReference" className="text-sm font-medium text-gray-700">AI reference study material (Optional)</Label>
                  <Input
                    id="aiReference"
                    value={aiReference}
                    onChange={(e) => setAiReference(e.target.value)}
                    placeholder="AI reference study material"
                    className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div> 
            </div>
              </div>
            </div>
            {/* Content Editor full width above the grid */}
            <div className="border rounded-md w-full mb-6">
              <div className="bg-blue-50 px-3 py-2 border-b">
                <Label className="text-sm font-medium text-blue-800">Content Editor</Label>
              </div>
              <JoditEditor
                value={editableData.description}
                config={{
                  toolbar: true,
                  spellcheck: true,
                  language: "en",
                  height: 350,
                  theme: "default",
                  buttons: [
                    "source",
                    "|",
                    "bold",
                    "strikethrough",
                    "underline",
                    "italic",
                    "|",
                    "ul",
                    "ol",
                    "|",
                    "outdent",
                    "indent",
                    "|",
                    "font",
                    "fontsize",
                    "brush",
                    "paragraph",
                    "|",
                    "image",
                    "link",
                    "table",
                    "|",
                    "align",
                    "undo",
                    "redo",
                    "|",
                    "hr",
                    "eraser",
                    "copyformat",
                    "|",
                    "fullsize"
                  ],
                  colors: {
                    greyscale: [
                      "#000000",
                      "#434343",
                      "#666666",
                      "#999999",
                      "#b7b7b7",
                      "#cccccc",
                      "#d9d9d9",
                      "#efefef",
                      "#f3f3f3",
                      "#ffffff"
                    ],
                    palette: [
                      "#980000",
                      "#ff0000",
                      "#ff9900",
                      "#ffff00",
                      "#00ff00",
                      "#00ffff",
                      "#4a86e8",
                      "#0000ff",
                      "#9900ff",
                      "#ff00ff"
                    ]
                  },
                  style: {
                    width: '100%'
                  }
                }}
                onBlur={(newContent) => setEditableData(prev => ({ ...prev, description: newContent }))}
                onChange={() => {}}
              />
            </div>
          </div>
          <DialogFooter className="p-6 flex justify-end gap-2">
            
            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={saveLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveLoading ? "Updating..." : "Update"}
            </Button>
                        <div className="flex justify-end">
                          <Button 
                variant="default" 
                onClick={handleAiGenerate}
                disabled={aiGenerateLoading || permanentlyDisabledButtons.has('aiGenerate')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {aiGenerateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : permanentlyDisabledButtons.has('aiGenerate') ? (
                  'Already Generated'
                ) : (
                  'AI Generate'
                )}
              </Button>
                </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resize handle visually on the border, not inside the card */}
      <div
        className="absolute left-0 bottom-0 w-full h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-ns-resize z-20"
        onMouseDown={e => {
          e.preventDefault();
          isResizing.current = true;
        }}
      >
        <div className="w-8 h-1 rounded bg-gray-400" />
      </div>
    </div>
  );
};

export default ProcessingCenterItem;
