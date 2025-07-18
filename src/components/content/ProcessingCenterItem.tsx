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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

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
    try {
      // Replace `/api/lessons/${item.id}` with your actual delete endpoint if different
      const res = await fetch(`/api/lessons/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete lesson");
      // Optionally, call a parent callback to remove the item from the list
      if (onAction) onAction("deleted", item.id);
    } catch (err) {
      // Optionally show an error message
      alert("Could not delete lesson");
    }
  };

  return (
    <Card className="transition-all hover:shadow-md ">
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
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={statusLoading}
            >
              <SelectTrigger className="w-32 border border-neutral-300 focus:ring-0 focus:border-neutral-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
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
              aria-label="Close"
            >
              <X className="h-4 w-4" />
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
        <CardContent className="pt-0 border-t">
          <div className="space-y-4">
            {item.content && (
              <div>
                <div className="space-y-4">
             
            </div>
                <h4 className="font-medium mb-2">Content Preview</h4>
                
                <div className="bg-white p-3 rounded-md max-h-40 overflow-y-auto">
                  <div className="bg-gray-50 p-4 rounded shadow-sm border text-sm space-y-1">
                  <div>
                <Label htmlFor="feedback">Feedback</Label>
                <JoditEditor
                  value={feedback}
                  config={{
                    toolbar: true,
                    spellcheck: true,
                    language: "en",
                    height: 300,
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
                  onBlur={(newContent) => setFeedback(newContent)}
                  onChange={(newContent) => {}}
                />
              </div>
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
                      <b>Description:</b>{" "}
                      {(item.description
                        ? item.description.replace(/<[^>]+>/g, "")
                        : item.metadata && item.metadata.description) || ""}
                    </div>
                  </div>
                </div>
              </div>
            )}

            

            <div className="flex flex-wrap gap-2">
              {status === "completed" && <></>}
              {status === "processing" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction("cancel")}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
              {status === "failed" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("retry")}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("details")}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Error Details
                  </Button>
                </>
              )}
              {status === "pending" && (
                <Button size="sm" onClick={() => handleAction("update")}>
                  Update
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProcessingCenterItem;
