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

interface ProcessingCenterItemProps {
  item: {
    id: string;
    title: string;
    type: string;
    status: "processing" | "draft" | "failed" | "pending" | "completed";
    progress?: number;
    createdAt: string;
    createdBy: string;
    description?: string;
    qaqfLevel?: number;
    estimatedTime?: string;
    content?: string;
    metadata?: any;
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

  // Add state for card height (for resizing)
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isResizing = React.useRef(false);

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
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case "draft":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        newStatus as "processing" | "draft" | "failed" | "pending" | "completed"
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
      // Notify parent component about the update
      if (onAction) {
        onAction("updated", item.id);
      }
      // Show success message
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
                  </div>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
             
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

          {status === "processing" && item.progress !== undefined && (
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
                  <div className="space-y-4">
             
                </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Content Preview</h4>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md" style={{ overflow: 'visible', maxHeight: 'none' }}>
                    <div className="bg-gray-50 p-4 rounded shadow-sm border text-sm space-y-1" style={{ overflow: 'visible', maxHeight: 'none' }}>
                      {isEditing ? (
                        <div className="space-y-4 h-[900px]">
                          {/* Jodit Editor at the top */}
                          <div className="border rounded-md overflow-hidden">
                            <div className="bg-blue-50 px-3 py-2 border-b">
                              <Label className="text-sm font-medium text-blue-800">Content Editor</Label>
                            </div>
                            <JoditEditor
                              value={editableData.description}
                              config={{
                                toolbar: true,
                                spellcheck: true,
                                language: "en",
                                height: 150,
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
                                }
                              }}
                              onBlur={(newContent) => setEditableData(prev => ({ ...prev, description: newContent }))}
                              onChange={(newContent) => {}}
                            />
                          </div>

                          {/* Form fields in a grid layout */}
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
                              <Input
                                id="type"
                                value={editableData.type}
                                onChange={(e) => setEditableData(prev => ({ ...prev, type: e.target.value }))}
                                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
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
                              <Input
                                id="qaqfLevel"
                                value={editableData.qaqfLevel}
                                onChange={(e) => setEditableData(prev => ({ ...prev, qaqfLevel: e.target.value }))}
                                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="userid" className="text-sm font-medium text-gray-700">User ID</Label>
                              <Input
                                id="userid"
                                value={editableData.userid}
                                onChange={(e) => setEditableData(prev => ({ ...prev, userid: e.target.value }))}
                                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="courseid" className="text-sm font-medium text-gray-700">Course ID</Label>
                              <Input
                                id="courseid"
                                value={editableData.courseid}
                                onChange={(e) => setEditableData(prev => ({ ...prev, courseid: e.target.value }))}
                                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex justify-end gap-2 pt-2 border-t">
                           
                            <Button
                              size="sm"
                              onClick={handleSaveChanges}
                              disabled={saveLoading}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {saveLoading ? "Updating..." : "Update"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                          <div>
                            <b>Description:</b>
                            <div 
                              className="mt-2 p-3 bg-white border rounded-md"
                              dangerouslySetInnerHTML={{ 
                                __html: item.description || (item.metadata && item.metadata.description) || "" 
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </CardContent>
        )}
      </Card>
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
