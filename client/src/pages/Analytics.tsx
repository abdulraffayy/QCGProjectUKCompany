import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QAQFAnalytics from "@/components/analytics/QAQFAnalytics";
import BatchProcessingPanel from "@/components/content/BatchProcessingPanel";
import { useToast } from "@/hooks/use-toast";
import { Content } from '@shared/schema';

const AnalyticsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("all-time");
  
  // Get content data
  const { data: contents = [], isLoading: isLoadingContents, refetch } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });
  
  // Handle content update (e.g., after batch processing)
  const handleContentUpdate = () => {
    refetch();
  };
  
  // Date range filter options
  const dateRangeOptions = [
    { value: "all-time", label: "All Time" },
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "last-3-months", label: "Last 3 Months" },
    { value: "last-6-months", label: "Last 6 Months" },
    { value: "this-year", label: "This Year" }
  ];
  
  // Filter content by date range
  const getFilteredContents = (): Content[] => {
    if (dateRange === "all-time") return contents;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (dateRange) {
      case "this-month":
        filterDate.setMonth(now.getMonth(), 1);
        break;
      case "last-month":
        filterDate.setMonth(now.getMonth() - 1, 1);
        break;
      case "last-3-months":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "last-6-months":
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case "this-year":
        filterDate.setFullYear(now.getFullYear(), 0, 1);
        break;
      default:
        return contents;
    }
    
    return contents.filter(content => 
      new Date(content.createdAt) >= filterDate
    );
  };

  // Calculate analytics metrics
  const calculateMetrics = () => {
    const filteredData = getFilteredContents();
    return {
      totalContent: filteredData.length,
      verifiedContent: filteredData.filter(c => c.verificationStatus === 'verified').length,
      pendingContent: filteredData.filter(c => c.verificationStatus === 'pending').length,
      contentByLevel: filteredData.reduce((acc, content) => {
        acc[content.qaqfLevel] = (acc[content.qaqfLevel] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalContent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.verifiedContent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingContent}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qaqf-analysis">QAQF Analysis</TabsTrigger>
          <TabsTrigger value="batch-processing">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content by QAQF Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.contentByLevel).map(([level, count]) => (
                    <div key={level} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>Level {level}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Activity tracking will be displayed here based on user interactions.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qaqf-analysis">
          <QAQFAnalytics contents={getFilteredContents()} />
        </TabsContent>

        <TabsContent value="batch-processing">
          <BatchProcessingPanel 
            contents={getFilteredContents()} 
            onContentUpdate={handleContentUpdate} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
  
  const filteredContents = getFilteredContents();
  
  // Calculate analytics summary
  const totalContent = filteredContents.length;
  const verifiedContent = filteredContents.filter(content => content.verificationStatus === "verified").length;
  const pendingContent = filteredContents.filter(content => content.verificationStatus === "pending").length;
  const rejectedContent = filteredContents.filter(content => content.verificationStatus === "rejected").length;
  
  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">QAQF Analytics Dashboard</h2>
            <p className="text-neutral-600 mt-1">Analyze and manage your QAQF content with advanced analytics</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => refetch()}>
                <span className="material-icons text-sm mr-1">refresh</span>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Content</p>
                <h3 className="text-3xl font-bold">{totalContent}</h3>
              </div>
              <div className="h-12 w-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="material-icons text-primary">insert_drive_file</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Verified Content</p>
                <h3 className="text-3xl font-bold">{verifiedContent}</h3>
              </div>
              <div className="h-12 w-12 bg-green-500 bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="material-icons text-green-500">verified</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Content</p>
                <h3 className="text-3xl font-bold">{pendingContent}</h3>
              </div>
              <div className="h-12 w-12 bg-amber-500 bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="material-icons text-amber-500">pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Rejected Content</p>
                <h3 className="text-3xl font-bold">{rejectedContent}</h3>
              </div>
              <div className="h-12 w-12 bg-red-500 bg-opacity-10 rounded-full flex items-center justify-center">
                <span className="material-icons text-red-500">cancel</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Analytics Overview</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {isLoadingContents ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredContents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <span className="material-icons text-6xl text-neutral-300">analytics</span>
                <h3 className="mt-4 text-xl font-semibold text-neutral-600">No Data Available</h3>
                <p className="text-neutral-500 mt-2">
                  There is no content data available for the selected date range.
                </p>
              </CardContent>
            </Card>
          ) : (
            <QAQFAnalytics contents={filteredContents} />
          )}
        </TabsContent>
        
        <TabsContent value="batch" className="mt-6">
          <BatchProcessingPanel 
            contents={filteredContents} 
            onContentUpdate={handleContentUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <span className="material-icons mr-2 text-base">file_download</span>
                Export Options
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-red-500 bg-opacity-10 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons text-3xl">picture_as_pdf</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">PDF Export</h3>
                      <p className="text-neutral-600 text-sm mb-4">
                        Export content as professionally formatted PDF documents with QAQF characteristics included
                      </p>
                      <Button 
                        className="w-full"
                        disabled={filteredContents.length === 0}
                        onClick={() => {
                          if (filteredContents.length > 0) {
                            toast({
                              title: "Export Initiated",
                              description: `Exporting ${Math.min(5, filteredContents.length)} content items as PDF.`
                            });
                          }
                        }}
                      >
                        <span className="material-icons text-sm mr-1">file_download</span>
                        Export to PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-blue-500 bg-opacity-10 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons text-3xl">code</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">HTML Export</h3>
                      <p className="text-neutral-600 text-sm mb-4">
                        Export content as web-ready HTML files with styling and formatting preserved
                      </p>
                      <Button 
                        className="w-full"
                        disabled={filteredContents.length === 0}
                        onClick={() => {
                          if (filteredContents.length > 0) {
                            toast({
                              title: "Export Initiated",
                              description: `Exporting ${Math.min(5, filteredContents.length)} content items as HTML.`
                            });
                          }
                        }}
                      >
                        <span className="material-icons text-sm mr-1">file_download</span>
                        Export to HTML
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-green-500 bg-opacity-10 text-green-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons text-3xl">table_chart</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">CSV Export</h3>
                      <p className="text-neutral-600 text-sm mb-4">
                        Export content metadata to CSV spreadsheets for analysis and reporting
                      </p>
                      <Button 
                        className="w-full"
                        disabled={filteredContents.length === 0}
                        onClick={() => {
                          if (filteredContents.length > 0) {
                            toast({
                              title: "Export Initiated",
                              description: `Exporting ${filteredContents.length} content items metadata as CSV.`
                            });
                          }
                        }}
                      >
                        <span className="material-icons text-sm mr-1">file_download</span>
                        Export to CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-purple-500 bg-opacity-10 text-purple-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons text-3xl">text_snippet</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Markdown Export</h3>
                      <p className="text-neutral-600 text-sm mb-4">
                        Export content as markdown files for easy integration with other systems
                      </p>
                      <Button 
                        className="w-full"
                        disabled={filteredContents.length === 0}
                        onClick={() => {
                          if (filteredContents.length > 0) {
                            toast({
                              title: "Export Initiated",
                              description: `Exporting ${Math.min(5, filteredContents.length)} content items as Markdown.`
                            });
                          }
                        }}
                      >
                        <span className="material-icons text-sm mr-1">file_download</span>
                        Export to Markdown
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-cyan-500 bg-opacity-10 text-cyan-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons text-3xl">description</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">DOCX Export</h3>
                      <p className="text-neutral-600 text-sm mb-4">
                        Export content as Word documents for editing and sharing
                      </p>
                      <Button 
                        className="w-full"
                        disabled={filteredContents.length === 0}
                        onClick={() => {
                          if (filteredContents.length > 0) {
                            toast({
                              title: "Export Initiated",
                              description: `Exporting ${Math.min(5, filteredContents.length)} content items as DOCX.`
                            });
                          }
                        }}
                      >
                        <span className="material-icons text-sm mr-1">file_download</span>
                        Export to DOCX
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-orange-500 bg-opacity-10 text-orange-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-icons text-3xl">data_object</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">JSON Export</h3>
                      <p className="text-neutral-600 text-sm mb-4">
                        Export content as structured JSON data for programmatic use
                      </p>
                      <Button 
                        className="w-full"
                        disabled={filteredContents.length === 0}
                        onClick={() => {
                          if (filteredContents.length > 0) {
                            toast({
                              title: "Export Initiated",
                              description: `Exporting ${Math.min(5, filteredContents.length)} content items as JSON.`
                            });
                          }
                        }}
                      >
                        <span className="material-icons text-sm mr-1">file_download</span>
                        Export to JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AnalyticsPage;