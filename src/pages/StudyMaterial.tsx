import { useState,} from 'react';
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
  Layout,
  Folder,
  Loader2
} from 'lucide-react';

interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  type: string;
  qaqfLevel: number;
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
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface MaterialTemplate {
  id: number;
  title: string;
  description: string;
  type: string;
  qaqfLevel: string;
  templateContent: string;
  placeholders?: any[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function StudyMaterial() {
  const [activeTab, setActiveTab] = useState('materials');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [createType, setCreateType] = useState<'material' | 'collection' | 'template'>('material');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  
 
  const queryClient = useQueryClient();

  // Fetch study materials
  const { data: materials = [], isLoading: materialsLoading } = useQuery<StudyMaterial[]>({
    queryKey: ['http://38.29.145.85:8000/api/study-materials'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      console.log('Token used for /api/study-materials:', token);
      const response = await fetch('http://38.29.145.85:8000/api/study-materials', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error('Failed to fetch study materials');
      return response.json();
    },
  });

  // Fetch collections
  const { data: collections = [], isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ['http://38.29.145.85:8000/api/collection-study-materials'],
  });

  // Fetch material templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<MaterialTemplate[]>({
    queryKey: ['/api/material-templates'],
  });

  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://38.29.145.85:8000/api/study-materials', {
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
        queryKey: ['http://38.29.145.85:8000/api/study-materials'] 
      });
      
      // Also refetch the data immediately to update the UI
      await queryClient.refetchQueries({ 
        queryKey: ['http://38.29.145.85:8000/api/study-materials'] 
      });
      
      toast.success("PDF successfully uploaded");
      setShowCreateDialog(false);
      setSelectedFile(null);
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
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const token = localStorage.getItem('token');
      console.log('Token used for update /api/update-study-materials:', token);
      const response = await fetch('http://38.29.145.85:8000/api/update-study-materials', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update material');
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['http://38.29.145.85:8000/api/study-materials'] 
      });
      await queryClient.refetchQueries({ 
        queryKey: ['http://38.29.145.85:8000/api/study-materials'] 
      });
      toast.success('Material updated successfully');
      setShowEditDialog(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast.error('Failed to update material');
    },
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      console.log('Deleting material id:', id, 'Token:', token);
      const response = await fetch(`/api/study-materials/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error('Failed to delete material');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['http://38.29.145.85:8000/api/study-materials'] 
      });
      await queryClient.refetchQueries({ 
        queryKey: ['http://38.29.145.85:8000/api/study-materials'] 
      });
      toast.success('Material deleted successfully');
    },
    onError: (error: any) => {
      if (error instanceof Error && error.message === 'Failed to delete material') {
        toast.error('Material not found or already deleted');
      } else if (error?.response?.status === 404) {
        toast.error('Material not found (404)');
      } else {
        toast.error('Failed to delete material');
      }
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
      
      const response = await fetch('http://38.29.145.85:8000/api/collection-study-materials', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/study-materials'] });
      toast.success('Collection created successfully');
      setShowCreateDialog(false);
    },
    onError: () => {
      toast.error('Failed to create collection');
    },
  });

  // Update collection mutation
  const updateCollectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { title: string; description: string } }) => {
      const token = localStorage.getItem('token');
      console.log('API Token:', token); // Console log the token
      
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      
      const response = await fetch('http://38.29.145.85:8000/api/updatecollection-study-materials', {
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
      queryClient.invalidateQueries({ queryKey: ['http://38.29.145.85:8000/api/collection-study-materials'] });
      toast.success('Collection updated successfully');
      setShowEditDialog(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast.error('Failed to update collection');
    },
  });

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete collection');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error: any) => {
      if (error instanceof Error && error.message === 'Failed to delete collection') {
        toast.error('Collection not found or already deleted');
      } else if (error?.response?.status === 404) {
        toast.error('Collection not found (404)');
      } else {
        toast.error('Failed to delete collection');
      }
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/material-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-templates'] });
      toast.success('Template created successfully');
      setShowCreateDialog(false);
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/material-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-templates'] });
      toast.success('Template updated successfully');
      setShowEditDialog(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/material-templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      if (error instanceof Error && error.message === 'Failed to delete template') {
        toast.error('Template not found or already deleted');
      } else if (error?.response?.status === 404) {
        toast.error('Template not found (404)');
      } else {
        toast.error('Failed to delete template');
      }
    },
  });

  // Use template mutation
  const useTemplateMutation = useMutation({
    mutationFn: async ({ templateId, customizations }: { templateId: number; customizations: any }) => {
      const response = await fetch(`/api/material-templates/${templateId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customizations }),
      });
      if (!response.ok) throw new Error('Failed to use template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-materials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/material-templates'] });
      toast.success('Material created from template successfully');
    },
    onError: () => {
      toast.error('Failed to create material from template');
    },
  });

  const handleCreateNew = (type: 'material' | 'collection' | 'template') => {
    setCreateType(type);
    setSelectedItem(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (activeTab === 'materials') {
        deleteStudyMaterial(itemToDelete.id);
      } else if (activeTab === 'collections') {
        deleteCollectionMutation.mutate(itemToDelete.id);
      } else if (activeTab === 'templates') {
        deleteTemplateMutation.mutate(itemToDelete.id);
      }
      setShowDeleteConfirmDialog(false);
      setItemToDelete(null);
    }
  };

  // New delete function using /api/delete-study-materials endpoint with try-catch
  const deleteStudyMaterial = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting study material with ID:', id, 'Token:', token);
      
      // Create form data to match backend expectation
      const formData = new FormData();
      formData.append('id', id.toString());
      
      const response = await fetch('http://38.29.145.85:8000/api/delete-study-materials', {
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
        queryKey: ['http://38.29.145.85:8000/api/study-materials'] 
      });
      await queryClient.refetchQueries({ 
        queryKey: ['http://38.29.145.85:8000/api/study-materials'] 
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

  const handleUseTemplate = (template: MaterialTemplate) => {
    const customizations = {
      title: `${template.title} - Copy`,
      description: template.description,
    };
    useTemplateMutation.mutate({ templateId: template.id, customizations });
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
    } else if (activeTab === 'templates') {
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
  
    const formData = new FormData(event.currentTarget);

    // Ensure all text fields are part of formData for update as well
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const qaqfLevel = formData.get('qaqfLevel');
    const content = formData.get('content') as string;

    // Add all form fields to formData, handling qaqf_level and JSON string arrays
    formData.set('title', title);
    formData.set('description', description);
    formData.set('type', type);
    if (qaqfLevel) {
      formData.set('qaqf_level', String(Number(qaqfLevel)));
    } else if (selectedItem && typeof selectedItem.qaqfLevel === 'number') {
        // If qaqfLevel is not in form but exists in selectedItem, use it
        formData.set('qaqf_level', String(selectedItem.qaqfLevel));
    }
    formData.set('content', content || ''); // Ensure content is not null
    formData.set('characteristics', JSON.stringify([])); // Assuming empty array for now
    formData.set('tags', JSON.stringify([])); // Assuming empty array for now

    // Remove qaqfLevel form field name if it exists, as we use qaqf_level
    formData.delete('qaqfLevel');
    
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    if (selectedItem) {
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
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };
    
    if (selectedItem) {
      updateCollectionMutation.mutate({ id: selectedItem.id, data });
    } else {
      createCollectionMutation.mutate(data);
    }
  };

  const handleSubmitTemplate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      qaqfLevel: formData.get('qaqfLevel') as string,
      templateContent: formData.get('templateContent') as string,
      placeholders: [],
    };
    
    if (selectedItem) {
      updateTemplateMutation.mutate({ id: selectedItem.id, data });
    } else {
      createTemplateMutation.mutate(data);
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
        <p className="text-gray-600">Manage your educational materials, collections, and templates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Material Library
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Templates
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
                      <CardTitle className="text-lg">{collection.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{collection.description}</p>
                      <div className="text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
                        </div>
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

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Study Material Templates</h3>
              <Button onClick={() => handleCreateNew('template')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
            
            {templatesLoading ? (
              <div className="text-center py-8">Loading templates...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Layout className="h-8 w-8 text-green-500 mb-2" />
                        <Badge variant="outline">{template.qaqfLevel}</Badge>
                      </div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{template.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Used:</span>
                          <span>{template.usageCount} times</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last updated:</span>
                          <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleView(template)}>
                          <Layout className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleUseTemplate(template)}>
                          <FileText className="h-4 w-4 mr-1" />
                          Use
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => handleDelete(template)}>
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
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createType === 'material' && 'Upload Study Material'}
              {createType === 'collection' && 'Create New Collection'}
              {createType === 'template' && 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          
          {createType === 'material' && (
            <form onSubmit={handleSubmitMaterial} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input name="title" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue />
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
                <Select name="qaqfLevel" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                      <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content (optional)</Label>
                <Textarea name="content" placeholder="Text content if no file is uploaded" />
              </div>
              <div>
                <Label htmlFor="file">File (optional)</Label>
                <Input 
                  type="file" 
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              
             
             
              
              <Button type="submit" className="w-full" disabled={isUploading}>
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

          {createType === 'template' && (
            <form onSubmit={handleSubmitTemplate} className="space-y-4">
              <div>
                <Label htmlFor="title">Template Name</Label>
                <Input name="title" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="worksheet">Worksheet</SelectItem>
                    <SelectItem value="handout">Handout</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qaqfLevel">QAQF Level Range</Label>
                <Select name="qaqfLevel" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">Basic (1-3)</SelectItem>
                    <SelectItem value="4-6">Intermediate (4-6)</SelectItem>
                    <SelectItem value="7-9">Advanced (7-9)</SelectItem>
                    <SelectItem value="Various">Various Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="templateContent">Template Content</Label>
                <Textarea 
                  name="templateContent" 
                  required 
                  placeholder="Use {{variable_name}} for placeholders"
                  rows={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createTemplateMutation.isPending}>
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
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
              {activeTab === 'templates' && 'View Template'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Title</Label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{selectedItem.title}</p>
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
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedItem.qaqf_level}</p>
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

              {activeTab === 'templates' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Type</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedItem.type}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">QAQF Level</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedItem.qaqf_level}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">Template Content</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{selectedItem.templateContent}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">Usage Count</Label>
                    <p className="mt-1 p-2 bg-gray-50 rounded">{selectedItem.usageCount}</p>
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
              {activeTab === 'templates' && 'Edit Template'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && activeTab === 'materials' && (
            <form onSubmit={handleSubmitMaterial} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input name="title" defaultValue={selectedItem.title} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" defaultValue={selectedItem.description} required />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={selectedItem.type} required>
                  <SelectTrigger>
                    <SelectValue />
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
                <Select name="qaqfLevel" defaultValue={selectedItem.qaqf_level?.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9].map(level => (
                      <SelectItem key={level} value={level.toString()}>Level {level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  name="content" 
                  defaultValue={selectedItem?.content || ''} 
                  placeholder="Enter content here..."
                  rows={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateMaterialMutation.isPending}>
                {updateMaterialMutation.isPending ? 'Updating...' : 'Update Material'}
              </Button>
            </form>
          )}

          {selectedItem && activeTab === 'collections' && (
            <form onSubmit={handleSubmitCollection} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input name="title" defaultValue={selectedItem.title} required />
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

          {selectedItem && activeTab === 'templates' && (
            <form onSubmit={handleSubmitTemplate} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input name="title" defaultValue={selectedItem.title} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" defaultValue={selectedItem.description} required />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={selectedItem.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson_plan">Lesson Plan</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="worksheet">Worksheet</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="handout">Handout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qaqfLevel">QAQF Level</Label>
                <Select name="qaqfLevel" defaultValue={selectedItem.qaqfLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">Basic (1-3)</SelectItem>
                    <SelectItem value="4-6">Intermediate (4-6)</SelectItem>
                    <SelectItem value="7-9">Advanced (7-9)</SelectItem>
                    <SelectItem value="Various">Various Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="templateContent">Template Content</Label>
                <Textarea 
                  name="templateContent" 
                  defaultValue={selectedItem.templateContent}
                  required 
                  placeholder="Use {{variable_name}} for placeholders"
                  rows={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateTemplateMutation.isPending}>
                {updateTemplateMutation.isPending ? 'Updating...' : 'Update Template'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this Study Material item? 
            {itemToDelete && <p className='text-red-600 '>Item ID: {itemToDelete.id}</p>}
          </DialogDescription>
          <div className="mt-4 space-x-2 flex justify-end">
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}