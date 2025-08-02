import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Progress } from "../ui/progress";

const BatchProcessingPanel: React.FC = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [batchItems, setBatchItems] = useState<any[]>([]);
  const [jsonFormat, setJsonFormat] = useState(false);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvContent(content);
        
        // Parse CSV or JSON content
        try {
          if (file.name.endsWith('.json')) {
            const jsonData = JSON.parse(content);
            setBatchItems(Array.isArray(jsonData) ? jsonData : [jsonData]);
            setJsonFormat(true);
          } else {
            // Simple CSV parsing (could be improved with a CSV library)
            const lines = content.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const items = lines.slice(1).filter(line => line.trim()).map(line => {
              const values = line.split(',').map(v => v.trim());
              const item: any = {};
              
              headers.forEach((header, index) => {
                item[header] = values[index];
              });
              
              return item;
            });
            
            setBatchItems(items);
            setJsonFormat(false);
          }
          
          toast({
            title: "File parsed successfully",
            description: `Found ${batchItems.length} course items to process`,
          });
        } catch (error) {
          toast({
            title: "Error parsing file",
            description: "Please check the file format and try again",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsText(file);
    }
  };

  const startBatchProcessing = () => {
    if (!batchItems.length) {
      toast({
        title: "No items to process",
        description: "Please upload a valid CSV or JSON file first",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing with a timer
    let currentItem = 0;
    const total = batchItems.length;
    
    const processInterval = setInterval(() => {
      currentItem++;
      const newProgress = Math.round((currentItem / total) * 100);
      setProgress(newProgress);
      
      if (currentItem >= total) {
        clearInterval(processInterval);
        setIsProcessing(false);
        
        toast({
          title: "Batch processing complete",
          description: `Successfully processed ${total} course items`,
        });
      }
    }, 500);
  };

  const clearBatch = () => {
    setCsvFile(null);
    setCsvContent("");
    setBatchItems([]);
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <div className="batch-processing">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Batch Course Processing</h3>
            <p className="text-sm text-neutral-600">Upload a CSV or JSON file with course specifications</p>
          </div>
          
          <div className="flex space-x-2">
            <a href="/templates/course_batch_template.csv" className="text-sm text-primary hover:underline flex items-center">
              <span className="material-icons text-sm mr-1">file_download</span>
              Download CSV Template
            </a>
            <a href="/templates/course_batch_template.json" className="text-sm text-primary hover:underline flex items-center">
              <span className="material-icons text-sm mr-1">file_download</span>
              Download JSON Template
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 border rounded-lg p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Upload Batch File</label>
            <Input 
              type="file" 
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="mb-4"
              disabled={isProcessing}
            />
            
            {csvFile && (
              <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-md">
                <div className="flex items-center">
                  <span className="material-icons text-neutral-500 mr-2">description</span>
                  <span className="text-sm">{csvFile.name}</span>
                </div>
                <Badge>{jsonFormat ? 'JSON' : 'CSV'}</Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1 border rounded-lg p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Manual Entry (JSON Format)</label>
            <Textarea 
              placeholder='[{"title": "Introduction to QAQF", "subject": "Education", "qaqfLevel": 3, ...}]'
              className="mb-4 h-24"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              disabled={isProcessing}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                try {
                  const items = JSON.parse(csvContent);
                  setBatchItems(Array.isArray(items) ? items : [items]);
                  setJsonFormat(true);
                  toast({
                    title: "JSON parsed successfully",
                    description: `Found ${Array.isArray(items) ? items.length : 1} course items`,
                  });
                } catch (error) {
                  toast({
                    title: "Invalid JSON format",
                    description: "Please check your JSON syntax and try again",
                    variant: "destructive",
                  });
                }
              }}
              disabled={isProcessing || !csvContent}
            >
              Parse JSON
            </Button>
          </div>
        </div>
      </div>
      
      {batchItems.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Batch Items ({batchItems.length})</h4>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm"
              onClick={clearBatch}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-auto max-h-60">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  {batchItems.length > 0 && 
                    Object.keys(batchItems[0]).slice(0, 5).map((key) => (
                      <th 
                        key={key}
                        className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))
                  }
                  <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {batchItems.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    {Object.entries(item).slice(0, 5).map(([key, value]) => (
                      <td key={key} className="px-4 py-2 text-sm text-neutral-600 truncate max-w-xs">
                        {String(value)}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right">
                      <Badge variant={progress > (index / batchItems.length) * 100 ? "default" : "outline"}>
                        {progress > (index / batchItems.length) * 100 ? "Processed" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {batchItems.length > 5 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-center text-sm text-neutral-500">
                      + {batchItems.length - 5} more items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="batch-controls">
        {isProcessing && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Processing...</span>
              <span className="text-sm text-neutral-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button 
            onClick={startBatchProcessing}
            className="flex items-center"
            disabled={isProcessing || batchItems.length === 0}
          >
            <span className="material-icons mr-2 text-sm">play_arrow</span>
            Start Batch Processing
          </Button>
          
          <Button 
            variant="outline"
            onClick={clearBatch}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessingPanel;