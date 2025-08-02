import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Content } from 'shared/schema';

interface ContentVersion {
  id: number;
  contentId: number;
  version: number;
  content: string;
  characteristics: number[];
  changedBy: string;
  timestamp: string;
  changes: string[];
}

// Mock version history data
const generateMockVersions = (content: Content): ContentVersion[] => {
  const currentVersion: ContentVersion = {
    id: 1,
    contentId: content.id,
    version: 1.0,
    content: typeof content.content === 'string' ? content.content : JSON.stringify(content.content),
    characteristics: Array.isArray(content.characteristics) ? content.characteristics : [1, 2, 3],
    changedBy: "Current User",
    timestamp: new Date().toISOString(),
    changes: ["Initial version"]
  };
  
  // Create a few older versions with minor changes
  return [
    currentVersion,
    {
      id: 2,
      contentId: content.id,
      version: 0.9,
      content: typeof content.content === 'string' 
        ? content.content.replace("Main Content", "Draft Content") 
        : JSON.stringify(content.content),
      characteristics: Array.isArray(content.characteristics) 
        ? content.characteristics.filter(c => c !== content.characteristics[0]) 
        : [1, 2],
      changedBy: "Content Editor",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      changes: ["Updated content structure", "Applied QAQF formatting"]
    },
    {
      id: 3,
      contentId: content.id,
      version: 0.5,
      content: "# Initial Draft\n\nThis is the initial draft of the content.",
      characteristics: [1],
      changedBy: "Content Creator",
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      changes: ["Created initial content draft"]
    }
  ];
};

interface ContentVersionHistoryProps {
  content: Content;
}

const ContentVersionHistory: React.FC<ContentVersionHistoryProps> = ({ content }) => {
  const { toast } = useToast();
  const [versions] = useState<ContentVersion[]>(generateMockVersions(content));
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareVersion, setCompareVersion] = useState<ContentVersion | null>(null);
  
  const handleViewVersion = (version: ContentVersion) => {
    setSelectedVersion(version);
    setIsViewOpen(true);
  };
  
  const handleCompareVersions = (versionA: ContentVersion, versionB: ContentVersion) => {
    setSelectedVersion(versionA);
    setCompareVersion(versionB);
    setIsCompareOpen(true);
  };
  
  const handleRestoreVersion = (version: ContentVersion) => {
    toast({
      title: "Version Restored",
      description: `Content restored to version ${version.version}`
    });
    
    setIsViewOpen(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <span className="material-icons mr-2 text-base">history</span>
            Version History
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full">
              <thead className="bg-neutral-50 sticky top-0">
                <tr>
                  <th className="text-left p-2">Version</th>
                  <th className="text-left p-2">Modified</th>
                  <th className="text-left p-2">Changed By</th>
                  <th className="text-left p-2">Changes</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version, index) => (
                  <tr key={version.id} className="border-t">
                    <td className="p-2">
                      <Badge variant={index === 0 ? "default" : "outline"} className="font-mono">
                        v{version.version.toFixed(1)}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">
                      {formatDate(version.timestamp)}
                    </td>
                    <td className="p-2">
                      {version.changedBy}
                    </td>
                    <td className="p-2">
                      <ul className="list-disc list-inside text-sm">
                        {version.changes.map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewVersion(version)}
                        >
                          <span className="material-icons text-sm">visibility</span>
                        </Button>
                        
                        {index > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCompareVersions(versions[0], version)}
                          >
                            <span className="material-icons text-sm">compare</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* View Version Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version.toFixed(1)}
              <span className="text-neutral-500 text-sm ml-2">
                ({formatDate(selectedVersion?.timestamp || new Date().toISOString())})
              </span>
            </DialogTitle>
            <DialogDescription>
              Modified by {selectedVersion?.changedBy}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="p-4 border rounded-md bg-neutral-50">
              <h3 className="text-sm font-semibold mb-2">Applied Changes</h3>
              <ul className="list-disc list-inside text-sm">
                {selectedVersion?.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="text-sm font-semibold mb-2">Content Preview</h3>
              <div className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border">
                {selectedVersion?.content}
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="text-sm font-semibold mb-2">QAQF Characteristics</h3>
              <div className="flex flex-wrap gap-2">
                {selectedVersion?.characteristics.map(charId => (
                  <Badge key={charId} variant="outline">
                    Characteristic {charId}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Cancel</Button>
            {selectedVersion?.version !== versions[0].version && (
              <Button onClick={() => handleRestoreVersion(selectedVersion!)}>
                <span className="material-icons text-sm mr-1">restore</span>
                Restore This Version
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Compare Versions Dialog */}
      <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
            <DialogDescription>
              Comparing current version with v{compareVersion?.version.toFixed(1)} 
              ({formatDate(compareVersion?.timestamp || new Date().toISOString())})
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Content Diff</TabsTrigger>
              <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-semibold mb-2">
                    Current Version (v{selectedVersion?.version.toFixed(1)})
                  </h3>
                  <div className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border max-h-[400px] overflow-y-auto">
                    {selectedVersion?.content}
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-semibold mb-2">
                    Previous Version (v{compareVersion?.version.toFixed(1)})
                  </h3>
                  <div className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border max-h-[400px] overflow-y-auto">
                    {compareVersion?.content}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="characteristics" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-semibold mb-2">
                    Current QAQF Characteristics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVersion?.characteristics.map(charId => (
                      <Badge key={charId} variant="default">
                        Characteristic {charId}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-semibold mb-2">
                    Previous QAQF Characteristics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {compareVersion?.characteristics.map(charId => (
                      <Badge key={charId} variant="outline">
                        Characteristic {charId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metadata" className="space-y-4 mt-4">
              <table className="w-full border">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="p-2 text-left">Field</th>
                    <th className="p-2 text-left">Current Version</th>
                    <th className="p-2 text-left">Previous Version</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2 font-semibold">Version</td>
                    <td className="p-2">v{selectedVersion?.version.toFixed(1)}</td>
                    <td className="p-2">v{compareVersion?.version.toFixed(1)}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2 font-semibold">Modified By</td>
                    <td className="p-2">{selectedVersion?.changedBy}</td>
                    <td className="p-2">{compareVersion?.changedBy}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2 font-semibold">Timestamp</td>
                    <td className="p-2">{formatDate(selectedVersion?.timestamp || '')}</td>
                    <td className="p-2">{formatDate(compareVersion?.timestamp || '')}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2 font-semibold">Changes</td>
                    <td className="p-2">
                      <ul className="list-disc list-inside text-sm">
                        {selectedVersion?.changes.map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2">
                      <ul className="list-disc list-inside text-sm">
                        {compareVersion?.changes.map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCompareOpen(false)}>Close</Button>
            <Button 
              onClick={() => {
                handleRestoreVersion(compareVersion!);
                setIsCompareOpen(false);
              }}
            >
              <span className="material-icons text-sm mr-1">restore</span>
              Restore Previous Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentVersionHistory;