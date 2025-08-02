import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Edit, Trash2, Search, Download, Upload, Shield, BookOpen, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Types for admin data
interface QAQFLevel {
  id: number;
  level: number;
  name: string;
  description: string;
}

interface QAQFCharacteristic {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Content {
  id: number;
  title: string;
  description: string;
  type: string;
  qaqf_level: number;
  module_code: string;
  verification_status: string;
  created_by_user_id: number;
  verified_by_user_id?: number;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details: any;
  created_at: string;
}

const QAQFAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dynamic data
  const { data: qaqfLevels } = useQuery<QAQFLevel[]>({
    queryKey: ['/api/qaqf/levels'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: qaqfCharacteristics } = useQuery<QAQFCharacteristic[]>({
    queryKey: ['/api/qaqf/characteristics'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: contentList } = useQuery<Content[]>({
    queryKey: ['/api/content'],
    staleTime: 2 * 60 * 1000,
  });

  const { data: auditLogs } = useQuery<AuditLog[]>({
    queryKey: ['/api/activities'],
    staleTime: 1 * 60 * 1000,
  });

  useQuery({
    queryKey: ['/api/dashboard/qaqf-stats'],
    staleTime: 2 * 60 * 1000,
  });

  // Mutations for content management
  const updateContentMutation = useMutation({
    mutationFn: async (content: Partial<Content>) => {
      const response = await fetch(`/api/content/${content.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/qaqf-stats'] });
      toast({ title: "Content updated successfully" });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update content", variant: "destructive" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete content');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/qaqf-stats'] });
      toast({ title: "Content deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete content", variant: "destructive" });
    },
  });

  // Filter content based on search and filters
  const filteredContent = contentList?.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || content.qaqf_level.toString() === filterLevel;
    const matchesStatus = filterStatus === 'all' || content.verification_status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Eye className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  // Mutations for levels and characteristics management
  const addLevelMutation = useMutation({
    mutationFn: async (levelData: { level: number; name: string; description: string }) => {
      const response = await fetch('/api/qaqf/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelData),
      });
      if (!response.ok) throw new Error('Failed to create level');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qaqf/levels'] });
      toast({ title: "Level created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create level", variant: "destructive" });
    },
  });

  const updateLevelMutation = useMutation({
    mutationFn: async ({ id, ...levelData }: { id: number; level?: number; name?: string; description?: string }) => {
      const response = await fetch(`/api/qaqf/levels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelData),
      });
      if (!response.ok) throw new Error('Failed to update level');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qaqf/levels'] });
      toast({ title: "Level updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update level", variant: "destructive" });
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: async (levelId: number) => {
      const response = await fetch(`/api/qaqf/levels/${levelId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete level');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qaqf/levels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/qaqf-stats'] });
      toast({ title: "Level deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete level", variant: "destructive" });
    },
  });

  const addCharacteristicMutation = useMutation({
    mutationFn: async (charData: { name: string; description: string; category: string }) => {
      const response = await fetch('/api/qaqf/characteristics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charData),
      });
      if (!response.ok) throw new Error('Failed to create characteristic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qaqf/characteristics'] });
      toast({ title: "Characteristic created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create characteristic", variant: "destructive" });
    },
  });

  const updateCharacteristicMutation = useMutation({
    mutationFn: async ({ id, ...charData }: { id: number; name?: string; description?: string; category?: string }) => {
      const response = await fetch(`/api/qaqf/characteristics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charData),
      });
      if (!response.ok) throw new Error('Failed to update characteristic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qaqf/characteristics'] });
      toast({ title: "Characteristic updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update characteristic", variant: "destructive" });
    },
  });

  const deleteCharacteristicMutation = useMutation({
    mutationFn: async (charId: number) => {
      const response = await fetch(`/api/qaqf/characteristics/${charId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete characteristic');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qaqf/characteristics'] });
      toast({ title: "Characteristic deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete characteristic", variant: "destructive" });
    },
  });

  const getContentCountForLevel = (level: number) => {
    return contentList?.filter(c => c.qaqf_level === level).length || 0;
  };

  const handleVerifyContent = (content: Content, status: string) => {
    updateContentMutation.mutate({
      id: content.id,
      verification_status: status,
      verified_by_user_id: 1, // Current user ID - would come from auth context
    });
  };

  // Form components
  const AddLevelForm = () => {
    const [level, setLevel] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addLevelMutation.mutate({
        level: parseInt(level),
        name,
        description,
      });
      setLevel('');
      setName('');
      setDescription('');
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Level Number</label>
          <Input
            type="number"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g., 1"
            min="1"
            max="9"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Level Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Basic"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this QAQF level..."
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={addLevelMutation.isPending}>
            {addLevelMutation.isPending ? 'Creating...' : 'Create Level'}
          </Button>
        </div>
      </form>
    );
  };

  const EditLevelForm = ({ level }: { level: QAQFLevel }) => {
    const [levelNum, setLevelNum] = useState(level.level.toString());
    const [name, setName] = useState(level.name);
    const [description, setDescription] = useState(level.description);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateLevelMutation.mutate({
        id: level.id,
        level: parseInt(levelNum),
        name,
        description,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Level Number</label>
          <Input
            type="number"
            value={levelNum}
            onChange={(e) => setLevelNum(e.target.value)}
            min="1"
            max="9"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Level Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={updateLevelMutation.isPending}>
            {updateLevelMutation.isPending ? 'Updating...' : 'Update Level'}
          </Button>
        </div>
      </form>
    );
  };

  const AddCharacteristicForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addCharacteristicMutation.mutate({
        name,
        description,
        category,
      });
      setName('');
      setDescription('');
      setCategory('');
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Characteristic Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Critical Thinking"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this characteristic..."
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={addCharacteristicMutation.isPending}>
            {addCharacteristicMutation.isPending ? 'Creating...' : 'Create Characteristic'}
          </Button>
        </div>
      </form>
    );
  };

  const EditCharacteristicForm = ({ characteristic }: { characteristic: QAQFCharacteristic }) => {
    const [name, setName] = useState(characteristic.name);
    const [description, setDescription] = useState(characteristic.description);
    const [category, setCategory] = useState(characteristic.category);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateCharacteristicMutation.mutate({
        id: characteristic.id,
        name,
        description,
        category,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Characteristic Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={updateCharacteristicMutation.isPending}>
            {updateCharacteristicMutation.isPending ? 'Updating...' : 'Update Characteristic'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/qaqf-framework">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Framework
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">QAQF Admin Panel</h1>
            <p className="text-muted-foreground">
              Audit, edit, and manage QAQF framework content and settings
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold">{contentList?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">
                  {contentList?.filter(c => c.verification_status === 'pending').length || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Content</p>
                <p className="text-2xl font-bold">
                  {contentList?.filter(c => c.verification_status === 'verified').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Actions</p>
                <p className="text-2xl font-bold">{auditLogs?.length || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="levels">Levels & Characteristics</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Status Distribution</CardTitle>
                <CardDescription>Overview of content verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['verified', 'pending', 'rejected'].map(status => {
                    const count = contentList?.filter(c => c.verification_status === status).length || 0;
                    const percentage = contentList?.length ? Math.round((count / contentList.length) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <span className="ml-2 text-sm capitalize">{status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Admin Activities</CardTitle>
                <CardDescription>Latest actions performed by administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs?.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.entity_type} #{log.entity_id}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {/* Content Management Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Content Management
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Content</DialogTitle>
                      <DialogDescription>
                        Create new content item for the QAQF framework
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Content title" />
                      <Textarea placeholder="Content description" />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select QAQF Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {qaqfLevels?.map(level => (
                            <SelectItem key={level.id} value={level.level.toString()}>
                              Level {level.level} - {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button>Create Content</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {qaqfLevels?.map(level => (
                      <SelectItem key={level.id} value={level.level.toString()}>
                        Level {level.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent?.map(content => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{content.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {content.qaqf_level}</Badge>
                      </TableCell>
                      <TableCell>{content.type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(content.verification_status)}>
                          {content.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(content.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedContent(content);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {content.verification_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyContent(content, 'verified')}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyContent(content, 'rejected')}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Content</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this content? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteContentMutation.mutate(content.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>QAQF Levels</CardTitle>
                  <CardDescription>Manage framework levels and their definitions</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Level
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New QAQF Level</DialogTitle>
                      <DialogDescription>
                        Create a new level for the QAQF framework
                      </DialogDescription>
                    </DialogHeader>
                    <AddLevelForm />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {qaqfLevels?.map(level => (
                    <div key={level.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium">Level {level.level} - {level.name}</p>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {getContentCountForLevel(level.level)} content items using this level
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit QAQF Level</DialogTitle>
                              <DialogDescription>
                                Modify level details and description
                              </DialogDescription>
                            </DialogHeader>
                            <EditLevelForm level={level} />
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Level {level.level}</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this level? This action cannot be undone.
                                {getContentCountForLevel(level.level) > 0 && (
                                  <span className="text-red-600 block mt-2">
                                    Warning: This level is being used by {getContentCountForLevel(level.level)} content items.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteLevelMutation.mutate(level.id)}
                                disabled={getContentCountForLevel(level.level) > 0}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>QAQF Characteristics</CardTitle>
                  <CardDescription>Manage framework characteristics and categories</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Characteristic
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New QAQF Characteristic</DialogTitle>
                      <DialogDescription>
                        Create a new characteristic for the QAQF framework
                      </DialogDescription>
                    </DialogHeader>
                    <AddCharacteristicForm />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {qaqfCharacteristics?.map(characteristic => (
                    <div key={characteristic.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium">{characteristic.name}</p>
                        <p className="text-sm text-muted-foreground">{characteristic.description}</p>
                        <Badge variant="outline" className="mt-1">
                          {characteristic.category}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit QAQF Characteristic</DialogTitle>
                              <DialogDescription>
                                Modify characteristic details and category
                              </DialogDescription>
                            </DialogHeader>
                            <EditCharacteristicForm characteristic={characteristic} />
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Characteristic</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{characteristic.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCharacteristicMutation.mutate(characteristic.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete history of administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs?.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.entity_type} #{log.entity_id}
                      </TableCell>
                      <TableCell>User {log.user_id}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Modify content details and verification status
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <Input 
                defaultValue={selectedContent.title}
                placeholder="Content title" 
              />
              <Textarea 
                defaultValue={selectedContent.description}
                placeholder="Content description" 
              />
              <Select defaultValue={selectedContent.qaqf_level.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select QAQF Level" />
                </SelectTrigger>
                <SelectContent>
                  {qaqfLevels?.map(level => (
                    <SelectItem key={level.id} value={level.level.toString()}>
                      Level {level.level} - {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue={selectedContent.verification_status}>
                <SelectTrigger>
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Update logic here
                  setIsEditDialogOpen(false);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QAQFAdmin;