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
    toast({
      title: "Content Updated",
      description: "Analytics data has been refreshed.",
    });
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

  if (isLoadingContents) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          <Button 
            onClick={() => refetch()} 
            variant="outline"
            size="sm"
          >
            Refresh Data
          </Button>
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
                  {Object.keys(metrics.contentByLevel).length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No content available for the selected date range
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span>Verified</span>
                    <span className="font-semibold text-green-600">{metrics.verifiedContent}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span>Pending</span>
                    <span className="font-semibold text-yellow-600">{metrics.pendingContent}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Total</span>
                    <span className="font-semibold">{metrics.totalContent}</span>
                  </div>
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