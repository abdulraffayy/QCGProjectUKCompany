import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';


import { toast } from 'react-toastify';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  FolderPlus,
  Library,
  Folder,
  Loader2
} from 'lucide-react';
import { QAQF_LEVELS } from '@/types';

interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  type: string;
  qaqf_level: number;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  content?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Collection {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function StudyMaterial() {
  const [activeTab, setActiveTab] = useState('materials');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [createType, setCreateType] = useState<'material' | 'collection'>('material');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showDeleteCollectionDialog, setShowDeleteCollectionDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [levelId, setLevelId] = useState<string>('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: '',
    qaqf_level: '',
    content: ''
  });

  const resetNewMaterial = () => {
    setNewMaterial({
      title: '',
      description: '',
      type: '',
      qaqf_level: '',
      content: ''
    });
    setSelectedFile(null);
    setSelectedCollectionId('');
  };
  
 
  const queryClient = useQueryClient();

  // Fetch study materials
  const { data: materials = [], isLoading: materialsLoading } = useQuery<StudyMaterial[]>({
    queryKey: ['study-materials'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      console.log('Token used for /api/study-materials:', token);
      const response = await fetch('http://69.197.176.134:8000/api/study-materials', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error('Failed to fetch study materials');
      return response.json();
    },
  });

  // Fetch collections
  const { data: collections = [], isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      console.log('=== Fetching collections ===');
      console.log('Token used for /api/collection-study-materials:', token);
      const response = await fetch('http://69.197.176.134:8000/api/collection-study-materials', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      console.log('Collections response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      console.log('Collections data received:', data);
      return data;
    },
  });

  // Monitor collections data changes
  useEffect(() => {
    console.log('Collections data changed:', collections.length, 'items:', collections);
  }, [collections]);

  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://69.197.176.134:8000/api/study-materials', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create material');
      return response.json();
    },
    onSuccess: async (data) => {
      console.log('Material created successfully:', data);
      
      // Invalidate the correct query key that matches the GET request
      await queryClient.invalidateQueries({ 
        queryKey: ['study-materials'] 
      });
      
      // Also refetch the data immediately to update the UI
      await queryClient.refetchQueries({ 
        queryKey: ['study-materials'] 
      });
      
      toast.success("Material created successfully");
      setShowCreateDialog(false);
      resetNewMaterial();
      setIsUploading(false); // Stop loading state
    },
    onError: (error) => {
      console.error('Failed to create material:', error);
      toast.error('Failed to create material');
      setIsUploading(false); // Stop loading state
    },
  });

  // Update material mutation
  const updateMaterialMutation = useMutation({
    mutationFn: async ({formData }: { id: number; formData: FormData }) => {
      const token = localStorage.getItem('token');
      console.log('Token used for update /api/update-study-materials:', token);
      const response = await fetch('http://69.197.176.134:8000/api/update-study-materials', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update material');
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['study-materials'] 
      });
      await queryClient.refetchQueries({ 
        queryKey: ['study-materials'] 
      });
      toast.success('Material updated successfully');
      setShowEditDialog(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast.error('Failed to update material');
    },
  });

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const token = localStorage.getItem('token');
      console.log('API Token:', token); // Console log the token
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      
      const response = await fetch('http://69.197.176.134:8000/api/collection-study-materials', {
        method: 'POST',
        headers: token
          ? { 'Authorization': `Bearer ${token}` }
          : {},
        body: formData,
      });
      
      const responseData = await response.json();
      console.log('API Response:', responseData); // Console log the response
      
      if (!response.ok) throw new Error('Failed to create collection');
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection created successfully');
      setShowCreateDialog(false);
    },
    onError: () => {
      toast.error('Failed to create collection');
    },
  });

  // Update collection mutation
  const updateCollectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description: string } }) => {
      const token = localStorage.getItem('token');
      console.log('API Token:', token); // Console log the token
      console.log('Update Collection Data:', { id, data }); // Debug the data being sent
      
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
        const response = await fetch('http://69.197.176.134:8000/api/updatecollection-study-materials', {
        method: 'POST',
        headers: token
          ? { 'Authorization': `Bearer ${token}` }
          : {},
        body: formData,
      });
      
      const responseData = await response.json();
      console.log('API Response:', responseData); // Console log the response
      
      if (!response.ok) throw new Error('Failed to update collection');
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection updated successfully');
      setShowEditDialog(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast.error('Failed to update collection');
    },
  });

  const handleCreateNew = (type: 'material' | 'collection') => {
    setCreateType(type);
    setSelectedItem(null);
    setShowCreateDialog(true);
    // Reset form states when opening create dialog
    if (type === 'material') {
      setLevelId('');
      setSelectedCollectionId('');
      setSelectedFile(null);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowEditDialog(true);
    // Set form states based on selected item
    setLevelId(item.qaqf_level?.toString() || '');
    setSelectedCollectionId(item.collectionid?.toString() || item.collection_id?.toString() || '');
    
    // Map numeric QAQF level to the corresponding enum string
    let qaqfLevelString = '';
    if (item.qaqf_level) {
      // Find the enum value that contains the level number
      const levelNumber = item.qaqf_level.toString();
      const matchingLevel = Object.values(QAQF_LEVELS).find(level => 
        level.includes(`Level ${levelNumber}`)
      );
      qaqfLevelString = matchingLevel || item.qaqf_level.toString();
    }
    
    // Also update newMaterial state for the form
    setNewMaterial({
      title: item.title || '',
      description: item.description || '',
      type: item.type || '',
      qaqf_level: qaqfLevelString,
      content: item.content || ''
    });
  };

  const handleDelete = (item: any) => {
    if (activeTab === 'collections') {
      setCollectionToDelete(item);
      setShowDeleteCollectionDialog(true);
    } else {
      setItemToDelete(item);
      setShowDeleteConfirmDialog(true);
    }
  };

  // New delete function using /api/delete-study-materials endpoint with try-catch
  const confirmDeletecollection = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting study material with ID:', id, 'Token:', token);
      
      // Create form data to match backend expectation
      const formData = new FormData();
      formData.append('id', id.toString());
      
      const response = await fetch('http://69.197.176.134:8000/api/delete-study-materials', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          // Remove Content-Type header to let browser set it automatically for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Success - invalidate and refetch the study materials
      await queryClient.invalidateQueries({ 
        queryKey: ['study-materials'] 
      });
      await queryClient.refetchQueries({ 
        queryKey: ['study-materials'] 
      });
      
      toast.success('Study material deleted successfully');
      console.log('Study material deleted successfully');
      
    } catch (error) {
      console.error('Error deleting study material:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          toast.error('Study material not found or already deleted');
        } else if (error.message.includes('401')) {
          toast.error('Unauthorized - Please login again');
        } else if (error.message.includes('403')) {
          toast.error('Access denied - You do not have permission to delete this material');
        } else {
          toast.error(`Failed to delete study material: ${error.message}`);
        }
      } else {
        toast.error('An unexpected error occurred while deleting the study material');
      }
    }
  };

  // New delete function for collections using /api/deletecollection-study-materials endpoint
  const confirmDeleteCollection = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== Starting collection deletion ===');
      console.log('Collection ID:', id);
      console.log('Token available:', !!token);
      
      // Create form data to match backend expectation (similar to study material deletion)
      const formData = new FormData();
      formData.append('id', id.toString());
      console.log('FormData created with id:', id.toString());
      
      const response = await fetch('http://38.29.145.85:8000/api/deletecollection-study-materials', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          // Removed Content-Type header to let browser set it automatically for FormData
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first to see what we're actually getting
      const responseText = await response.text();
      console.log('Response text:', responseText);
      console.log('FormData sent:', Array.from(formData.entries())); // Added this logging

      if (!response.ok) {
        console.error('HTTP error response:', responseText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      // Try to parse response as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);
      } catch (parseError) {
        console.log('Response is not JSON, treating as plain text');
        responseData = { message: responseText };
      }

      console.log('=== Query invalidation starting ===');
      
      // Success - invalidate and refetch the collections
      await queryClient.invalidateQueries({ 
        queryKey: ['collections'] 
      });
      console.log('Query invalidated successfully');
      
      await queryClient.refetchQueries({ 
        queryKey: ['collections'] 
      });
      console.log('Query refetched successfully');
      
      toast.success('Collection deleted successfully');
      console.log('=== Collection deletion completed successfully ===');
      
    } catch (error) {
      console.error('=== Error in collection deletion ===');
      console.error('Error details:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        
        if (error.message.includes('404')) {
          toast.error('Collection not found or already deleted');
        } else if (error.message.includes('401')) {
          toast.error('Unauthorized - Please login again');
        } else if (error.message.includes('403')) {
          toast.error('Access denied - You do not have permission to delete this collection');
        } else {
          toast.error(`Failed to delete collection: ${error.message}`);
        }
      } else {
        console.error('Non-Error object:', error);
        toast.error('An unexpected error occurred while deleting the collection');
      }
    }
  };

  const handleView = async (item: any) => {
    if (activeTab === 'materials') {
      setSelectedItem(item);
      setShowViewDialog(true);
      
      // Extract PDF content if it's a PDF file
      if (item.mimeType === 'application/pdf' && item.filePath) {
        setIsExtractingPdf(true);
        try {
          const response = await fetch(`/api/extract-pdf-content?filePath=${encodeURIComponent(item.filePath)}`);
          if (response.ok) {
            const data = await response.json();
            setPdfContent(data.content || '');
          } else {
            setPdfContent('Unable to extract PDF content');
          }
        } catch (error) {
          console.error('Error extracting PDF content:', error);
          setPdfContent('Error extracting PDF content');
        } finally {
          setIsExtractingPdf(false);
        }
      } else {
        setPdfContent('');
      }
    } else if (activeTab === 'collections') {
      // Navigate to collection view page or show materials in collection
      setSelectedItem(item);
      setShowViewDialog(true);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleSubmitMaterial = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true); // Start loading state
  
    const formData = new FormData();

    // Use newMaterial state for form data
    formData.set('title', newMaterial.title);
    formData.set('description', newMaterial.description);
    formData.set('type', newMaterial.type);
    
    // Extract just the number from QAQF level string (e.g., "Qaqf Level 2 – Application" -> "2")
    const qaqfLevelMatch = newMaterial.qaqf_level.match(/Level (\d+)/);
    const qaqfLevelNumber = qaqfLevelMatch ? qaqfLevelMatch[1] : newMaterial.qaqf_level;
    formData.set('qaqf_level', qaqfLevelNumber);
    
    // Add content if provided
    if (newMaterial.content) {
      formData.set('content', newMaterial.content);
    }

    // Add selectedCollectionId to formData - backend expects 'collectionid'
    if (selectedCollectionId) {
      formData.set('collectionid', selectedCollectionId);
    }
    
    // Use the appropriate file based on which dialog is open
    const currentFile = showEditDialog ? null : selectedFile;
    if (currentFile) {
      formData.append('file', currentFile);
    }

    if (selectedItem && selectedItem.id) {
      // Add the ID to form data for update
      formData.set('id', selectedItem.id.toString());
      updateMaterialMutation.mutate({ id: selectedItem.id, formData });
    } else {
      // For creation, pass the FormData directly to the mutation
      console.log('Submitting form data:', formData);
      createMaterialMutation.mutate(formData);
    }
  };

  const handleSubmitCollection = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    if (selectedItem) {
      // For update, send name and description directly
      updateCollectionMutation.mutate({ 
        id: selectedItem.id, 
        data: {
          name: name,
          description: description
        }
      });
    } else {
      // For create, use name field as expected by create API
      createCollectionMutation.mutate({
        name: name,
        description: description
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getQAQFLevelBadge = (level: number) => {
    if (level <= 3) return <Badge variant="secondary">Basic (1-3)</Badge>;
    if (level <= 6) return <Badge variant="default">Intermediate (4-6)</Badge>;
    return <Badge variant="destructive">Advanced (7-9)</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Material Management</h1>
        <p className="text-gray-600">Manage your educational materials and collections</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Material Library
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Collections
          </TabsTrigger>
        </TabsList>

        {/* Material Library Tab */}
        <TabsContent value="materials" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Study Materials</h3>
              <Button onClick={() => handleCreateNew('material')}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>
            
            {materialsLoading ? (
              <div className="flex justify-center items-center h-full w-full py-8">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((material) => (
                  <Card key={material.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <FileText className="h-8 w-8 text-blue-500 mb-2" />
                        {getQAQFLevelBadge(material.qaqfLevel)}
                      </div>
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p> */}
                      <div className="space-y-1 text-xs text-gray-500">
                        {/* <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{material.type}</span>
                        </div> */}
                        {material.fileName && (
                          <div className="flex justify-between">
                            <span>File:</span>
                            <span>{material.fileName}</span>
                          </div>
                        )}
                        {material.fileSize && (
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span>{formatFileSize(material.fileSize)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleView(material)}>
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>

                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(material)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => handleDelete(material)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Material Collections</h3>
              <Button onClick={() => handleCreateNew('collection')}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>
            
            {collectionsLoading ? (
              <div className="text-center py-8">Loading collections...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                  <Card key={collection.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Folder className="h-8 w-8 text-purple-500 mb-2" />
                      </div>
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      
                      <div className="text-xs text-gray-500">
                       
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleView(collection)}>
                        <Folder className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(collection)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => handleDelete(collection)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Upload Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          resetNewMaterial();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createType === 'material' && 'Upload Study Material'}
              {createType === 'collection' && 'Create New Collection'}
            </DialogTitle>
          </DialogHeader>
          
          {createType === 'material' && (
            <form onSubmit={handleSubmitMaterial} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  name="title" 
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  name="description" 
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  name="type" 
                  value={newMaterial.type}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="worksheet">Worksheet</SelectItem>
                    <SelectItem value="handout">Handout</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="glossary">Glossary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qaqfLevel">QAQF Level</Label>
                <Select 
                  name="qaqfLevel" 
                  value={newMaterial.qaqf_level}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, qaqf_level: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select QAQF Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QAQF_LEVELS).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content (optional)</Label>
                <Textarea 
                  name="content" 
                  value={newMaterial.content}
                  onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                  placeholder="Text content if no file is uploaded" 
                />
              </div>
              <div>
                <Label htmlFor="collection">Material Collection *</Label>
                <Select 
                  name="collection" 
                  value={selectedCollectionId} 
                  onValueChange={(value) => {
                    setSelectedCollectionId(value);
                    console.log('Selected Collection ID:', value);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id.toString()}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">File (Optional)</Label>
                <Input 
                  type="file" 
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.md"
                  disabled={!selectedCollectionId}
                  className={!selectedCollectionId ? "opacity-50 cursor-not-allowed" : ""}
                />
                {!selectedCollectionId && (
                  <p className="text-sm text-gray-500 mt-1">
                    Please select a Material Collection first to enable file upload
                  </p>
                )}
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              
             
             
              
              <Button type="submit" className="w-full" disabled={isUploading || !selectedCollectionId}>
                {isUploading ? (
                  <span className="flex items-center justify-center">
                   uploading...
                    
                  </span>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Material
                  </>
                )}
              </Button>
            </form>
          )}

          {createType === 'collection' && (
            <form onSubmit={handleSubmitCollection} className="space-y-4">
              <div>
                <Label htmlFor="name">Collection Name</Label>
                <Input name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" />
              </div>
              <Button type="submit" className="w-full" disabled={createCollectionMutation.isPending}>
                {createCollectionMutation.isPending ? 'Creating...' : 'Create Collection'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'materials' && 'View Study Material'}
              {activeTab === 'collections' && 'View Collection'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Name</Label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{activeTab === 'collections' ? selectedItem.name : selectedItem.title}</p>
              </div>
              
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{selectedItem.description}</p>
              </div>
              
              {activeTab === 'materials' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Type</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedItem.type}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">QAQF Level</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">
                        {(() => {
                          // Map numeric QAQF level to the corresponding enum string
                          if (selectedItem.qaqf_level) {
                            const levelNumber = selectedItem.qaqf_level.toString();
                            const matchingLevel = Object.values(QAQF_LEVELS).find(level => 
                              level.includes(`Level ${levelNumber}`)
                            );
                            return matchingLevel || selectedItem.qaqf_level;
                          }
                          return selectedItem.qaqf_level || 'Not specified';
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedItem.fileName && (
                    <div>
                      <Label className="font-semibold">File Information</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded space-y-1">
                        <p><strong>Name:</strong> {selectedItem.fileName}</p>
                        <p><strong>Size:</strong> {selectedItem.fileSize ? `${(selectedItem.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}</p>
                        <p><strong>Type:</strong> {selectedItem.mimeType || 'Unknown'}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* PDF Content Display */}
                  {selectedItem.mimeType === 'application/pdf' && (
                    <div>
                      <Label className="font-semibold">PDF Content</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded max-h-60 overflow-y-auto">
                        {isExtractingPdf ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            <span>Extracting PDF content...</span>
                          </div>
                        ) : pdfContent ? (
                          <div className="text-sm whitespace-pre-wrap">
                            {pdfContent}
                          </div>
                        ) : (
                          <p className="text-gray-500">No content extracted from PDF</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="font-semibold">Content</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{selectedItem.content}</pre>
                    </div>
                  </div>
                </>
              )}
              
             
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'materials' && 'Edit Study Material'}
              {activeTab === 'collections' && 'Edit Collection'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && activeTab === 'materials' && (
            <form onSubmit={handleSubmitMaterial} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  name="title" 
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  name="description" 
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  name="type" 
                  value={newMaterial.type}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="worksheet">Worksheet</SelectItem>
                    <SelectItem value="handout">Handout</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="glossary">Glossary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qaqfLevel">QAQF Level</Label>
                <Select 
                  name="qaqfLevel" 
                  value={newMaterial.qaqf_level}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, qaqf_level: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select QAQF Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QAQF_LEVELS).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  name="content" 
                  value={newMaterial.content}
                  onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                  placeholder="Enter content here..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="collection">Material Collection</Label>
                <Select 
                  name="collection" 
                  value={selectedCollectionId} 
                  onValueChange={(value) => {
                    setSelectedCollectionId(value);
                    console.log('Edit - Selected Collection ID:', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id.toString()}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
             
              <Button type="submit" className="w-full" disabled={updateMaterialMutation.isPending}>
                {updateMaterialMutation.isPending ? 'Updating...' : 'Update Material'}
              </Button>
            </form>
          )}

          {selectedItem && activeTab === 'collections' && (
            <form onSubmit={handleSubmitCollection} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input name="name" defaultValue={selectedItem.name} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" defaultValue={selectedItem.description} required />
              </div>
              <Button type="submit" className="w-full" disabled={updateCollectionMutation.isPending}>
                {updateCollectionMutation.isPending ? 'Updating...' : 'Update Collection'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-2">
            <p>Are you sure you want to delete this item from the Material Library?</p>
            {itemToDelete && (
              <p className="text-sm text-muted-foreground">
                ID: {itemToDelete.id}
              </p>
            )}
          </DialogDescription>
          <div className="mt-6 flex justify-center space-x-3">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (itemToDelete && itemToDelete.id) {
                  confirmDeletecollection(itemToDelete.id);
                  setShowDeleteConfirmDialog(false);
                }
              }}
            >
              Yes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Confirmation Dialog */}
      <Dialog open={showDeleteCollectionDialog} onOpenChange={setShowDeleteCollectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-2">
            <p>Are you sure you want to delete this collection?</p>
            {collectionToDelete && (
              <p className="text-sm text-muted-foreground">
                ID: {collectionToDelete.id}
              </p>
            )}
          </DialogDescription>
          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (collectionToDelete && collectionToDelete.id) {
                  confirmDeleteCollection(collectionToDelete.id);
                  setShowDeleteCollectionDialog(false);
                }
              }}
            >
              Yes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteCollectionDialog(false)}
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}