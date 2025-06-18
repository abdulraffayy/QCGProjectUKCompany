import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Edit, Search, Filter } from 'lucide-react';
import { Content } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const MyContentPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("modules");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Fetch content data
  const { data: contents = [], isLoading } = useQuery({
    queryKey: ['/api/content'],
    queryFn: async () => {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    }
  });

  // Filter contents based on search and tab
  const filteredContents = contents.filter((content: Content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'content':
        return matchesSearch && (content.type === 'academic_paper' || content.type === 'lecture');
      case 'assessments':
        return matchesSearch && content.type === 'assessment';
      case 'videos':
        return matchesSearch && content.type === 'video';
      default:
        return matchesSearch;
    }
  });

  const handleView = (content: Content) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (content: Content) => {
    setEditingContent({ ...content });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingContent) return;
    
    try {
      const response = await fetch(`/api/content/${editingContent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingContent.title,
          description: editingContent.description,
        }),
      });
      
      if (response.ok) {
        toast({ title: "Content updated successfully!" });
        setIsEditDialogOpen(false);
        setEditingContent(null);
      }
    } catch (error) {
      toast({ title: "Failed to update content", variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Module Library</h1>
          <p className="text-neutral-600">View and manage your QAQF modules here.</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <span className="material-icons mr-2 text-sm">add</span>
          Create New Module
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">All Modules</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-10 border rounded-md">
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No modules found</h3>
              <p className="text-neutral-500 mb-4">There are no modules available to display.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContents.map((content: any) => (
                <Card key={content.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-xs text-neutral-500">
                        <span className="material-icons text-xs mr-1">school</span>
                        <span>QAQF Level {content.qaqfLevel}</span>
                      </div>
                      <Badge variant="outline">{content.type}</Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(content)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleEdit(content)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.filter(content => content.type === 'academic_paper' || content.type === 'lecture').map((content: Content) => (
              <Card key={content.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">QAQF Level {content.qaqfLevel}</span>
                    <span className="material-icons text-sm text-blue-600">article</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.filter(content => content.type === 'assessment').map((content: Content) => (
              <Card key={content.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">QAQF Level {content.qaqfLevel}</span>
                    <span className="material-icons text-sm text-green-600">quiz</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.filter(content => content.type === 'video').map((content: Content) => (
              <Card key={content.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">QAQF Level {content.qaqfLevel}</span>
                    <span className="material-icons text-sm text-red-600">play_circle</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Content Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {selectedContent && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedContent.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">QAQF Level</h4>
                    <Badge>{selectedContent.qaqfLevel}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Content Type</h4>
                    <Badge variant="outline">{selectedContent.type}</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{selectedContent.content}</pre>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          {editingContent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingContent.title}
                  onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingContent.description}
                  onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
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

export default MyContentPage;