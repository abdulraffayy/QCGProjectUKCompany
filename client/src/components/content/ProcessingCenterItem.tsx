import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  CheckCircle, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  FileText, 
  GraduationCap,
  Calendar,
  Target,
  BarChart3,
  Lightbulb,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedItem {
  id: string;
  type: 'content' | 'course';
  title: string;
  description: string;
  qaqf_level: number;
  qaqf_compliance_score: number;
  content: any;
  created_at: string;
  status: 'draft' | 'reviewed' | 'approved';
}

interface ProcessingCenterItemProps {
  item: GeneratedItem;
  onUpdate: (item: GeneratedItem) => void;
  onDelete: (id: string) => void;
}

const ProcessingCenterItem: React.FC<ProcessingCenterItemProps> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      // In a real app, this would make an API call
      onUpdate(editedItem);
      setIsEditing(false);
      toast({ title: "Content updated successfully" });
    } catch (error) {
      toast({ title: "Failed to update content", variant: "destructive" });
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'reviewed' | 'approved') => {
    const updatedItem = { ...item, status: newStatus };
    onUpdate(updatedItem);
    toast({ 
      title: `Content ${newStatus}`,
      description: `Status changed to ${newStatus}`
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      onDelete(item.id);
      toast({ title: "Content deleted" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {item.type === 'content' ? (
              <FileText className="h-6 w-6 text-primary" />
            ) : (
              <GraduationCap className="h-6 w-6 text-primary" />
            )}
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editedItem.title}
                    onChange={(e) => setEditedItem({...editedItem, title: e.target.value})}
                    className="font-semibold"
                  />
                  <Textarea
                    value={editedItem.description}
                    onChange={(e) => setEditedItem({...editedItem, description: e.target.value})}
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(item.status)}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
            <Badge variant="outline" className={getComplianceColor(item.qaqf_compliance_score)}>
              {item.qaqf_compliance_score}% QAQF
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span><strong>Level:</strong> {item.qaqf_level}</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <span><strong>Score:</strong> {item.qaqf_compliance_score}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span><strong>Created:</strong> {new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4 text-gray-500" />
            <span><strong>Type:</strong> {item.type}</span>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm" className="flex items-center space-x-1">
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedItem(item);
                }} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
              <Button 
                onClick={() => setIsExpanded(!isExpanded)} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>{isExpanded ? 'Hide' : 'Preview'}</span>
              </Button>
            </>
          )}

          {/* Status Change Buttons */}
          {item.status === 'draft' && (
            <Button 
              onClick={() => handleStatusChange('reviewed')} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-1"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Review</span>
            </Button>
          )}
          {item.status === 'reviewed' && (
            <Button 
              onClick={() => handleStatusChange('approved')} 
              size="sm"
              className="flex items-center space-x-1"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve</span>
            </Button>
          )}

          {/* Export/Download */}
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>

          {/* Delete */}
          <Button 
            onClick={handleDelete} 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>

        {/* Expanded Content Preview */}
        {isExpanded && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Content Preview:</Label>
            <div className="max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Editing Mode - Status Selection */}
        {isEditing && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <Label className="text-sm font-medium">Change Status:</Label>
            <Select 
              value={editedItem.status} 
              onValueChange={(value: 'draft' | 'reviewed' | 'approved') => 
                setEditedItem({...editedItem, status: value})
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingCenterItem;