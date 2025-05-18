import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { saveContentAsPDF } from "@/lib/pdfGenerator";
import { Content } from '@shared/schema';

interface BatchProcessingPanelProps {
  contents: Content[];
  onContentUpdate: () => void;
}

const BatchProcessingPanel: React.FC<BatchProcessingPanelProps> = ({ contents, onContentUpdate }) => {
  const { toast } = useToast();
  const [selectedContents, setSelectedContents] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const handleSelectAll = () => {
    if (selectedContents.length === contents.length) {
      setSelectedContents([]);
    } else {
      setSelectedContents(contents.map(content => content.id));
    }
  };
  
  const handleContentSelect = (contentId: number) => {
    setSelectedContents(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId) 
        : [...prev, contentId]
    );
  };
  
  const executeAction = async () => {
    if (selectedContents.length === 0) {
      toast({
        title: "No Content Selected",
        description: "Please select at least one content item to process.",
        variant: "destructive"
      });
      return;
    }
    
    if (!bulkAction) {
      toast({
        title: "No Action Selected",
        description: "Please select an action to perform.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      switch (bulkAction) {
        case "export-pdf": {
          // Export selected content as PDFs
          const selectedItems = contents.filter(content => selectedContents.includes(content.id));
          
          toast({
            title: "Exporting PDFs",
            description: `Exporting ${selectedItems.length} content items as PDFs...`
          });
          
          for (const content of selectedItems) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
            try {
              saveContentAsPDF(content);
            } catch (error) {
              console.error("Error exporting PDF for content:", content.id, error);
            }
          }
          
          toast({
            title: "Export Complete",
            description: `Successfully exported ${selectedItems.length} content items as PDFs.`
          });
          break;
        }
        
        case "verify-all": {
          // Simulate verifying all selected content
          const selectedItems = contents.filter(content => selectedContents.includes(content.id));
          
          toast({
            title: "Verifying Content",
            description: `Verifying ${selectedItems.length} content items...`
          });
          
          // Here you would make API calls to verify each content item
          await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API calls
          
          toast({
            title: "Verification Complete",
            description: `Successfully verified ${selectedItems.length} content items.`
          });
          
          onContentUpdate(); // Refresh content list
          break;
        }
        
        case "delete-all": {
          // Simulate deleting all selected content
          const selectedItems = contents.filter(content => selectedContents.includes(content.id));
          
          toast({
            title: "Deleting Content",
            description: `Deleting ${selectedItems.length} content items...`
          });
          
          // Here you would make API calls to delete each content item
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API calls
          
          toast({
            title: "Deletion Complete",
            description: `Successfully deleted ${selectedItems.length} content items.`
          });
          
          setSelectedContents([]);
          onContentUpdate(); // Refresh content list
          break;
        }
        
        case "export-csv": {
          // Export content metadata to CSV
          const selectedItems = contents.filter(content => selectedContents.includes(content.id));
          
          const headers = "ID,Title,Type,QAQF Level,Verification Status,Created At\n";
          const rows = selectedItems.map(content => 
            `${content.id},"${content.title}",${content.type},${content.qaqfLevel},${content.verificationStatus},"${new Date(content.createdAt).toISOString()}"`
          ).join('\n');
          
          const csvContent = `${headers}${rows}`;
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'qaqf_content_export.csv');
          link.click();
          
          toast({
            title: "CSV Export Complete",
            description: `Successfully exported ${selectedItems.length} content items to CSV.`
          });
          break;
        }
      }
    } catch (error) {
      console.error("Error processing batch action:", error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the batch action.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setBulkAction("");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <span className="material-icons mr-2 text-base">batch_prediction</span>
          Batch Processing
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-0">
        <div className="overflow-auto max-h-[300px]">
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0">
              <tr>
                <th className="text-left p-2">
                  <div className="flex items-center">
                    <Checkbox 
                      checked={selectedContents.length === contents.length && contents.length > 0} 
                      onCheckedChange={handleSelectAll}
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm">Select All</label>
                  </div>
                </th>
                <th className="text-left p-2">Content Title</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {contents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-neutral-500">
                    No content available for batch processing
                  </td>
                </tr>
              ) : (
                contents.map(content => (
                  <tr key={content.id} className="border-t">
                    <td className="p-2">
                      <Checkbox 
                        checked={selectedContents.includes(content.id)} 
                        onCheckedChange={() => handleContentSelect(content.id)}
                        id={`content-${content.id}`}
                      />
                    </td>
                    <td className="p-2">
                      <label htmlFor={`content-${content.id}`} className="cursor-pointer">
                        {content.title}
                      </label>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">
                        {content.type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge 
                        variant={
                          content.verificationStatus === 'verified' ? 'default' :
                          content.verificationStatus === 'rejected' ? 'destructive' : 'outline'
                        }
                      >
                        {content.verificationStatus}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col sm:flex-row gap-2 pt-4">
        <div className="flex-1 w-full sm:max-w-[200px]">
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="export-pdf">Export as PDFs</SelectItem>
              <SelectItem value="export-csv">Export as CSV</SelectItem>
              <SelectItem value="verify-all">Verify Selected</SelectItem>
              <SelectItem value="delete-all">Delete Selected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={executeAction} 
          disabled={isProcessing || selectedContents.length === 0 || !bulkAction}
        >
          {isProcessing ? (
            <>
              <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
              Processing...
            </>
          ) : (
            <>
              <span className="material-icons mr-2 text-sm">play_arrow</span>
              Execute Action
            </>
          )}
        </Button>
        
        <div className="text-sm text-neutral-500 pt-2 sm:pt-0">
          {selectedContents.length} of {contents.length} items selected
        </div>
      </CardFooter>
    </Card>
  );
};

export default BatchProcessingPanel;