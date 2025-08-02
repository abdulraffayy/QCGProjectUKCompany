import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  calculateCharacteristicsDistribution, 
  calculateLevelDistribution,
  calculateVerificationDistribution,
  calculateContentTypeDistribution,
  analyzeContentOverTime
} from '../../lib/analyticsHelpers';
import { QAQFCharacteristics, QAQFLevels } from '../../lib/qaqf';
import { Content } from 'shared/schema';

interface QAQFAnalyticsProps {
  contents: Content[];
}

const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
  '#d0ed57', '#ffc658', '#ff8042', '#ff6b6b', '#c882b5'
];

const QAQFAnalytics: React.FC<QAQFAnalyticsProps> = ({ contents }) => {
  const [activeTab, setActiveTab] = React.useState("characteristics");
  
  // Prepare data for characteristics chart
  const characteristicsData = React.useMemo(() => {
    const distribution = calculateCharacteristicsDistribution(contents);
    return QAQFCharacteristics.map(char => ({
      name: char.name,
      count: distribution[char.id] || 0,
      id: char.id
    }));
  }, [contents]);
  
  // Prepare data for levels chart
  const levelsData = React.useMemo(() => {
    const distribution = calculateLevelDistribution(contents);
    return QAQFLevels.map(level => ({
      name: `Level ${level.level}`,
      count: distribution[level.level] || 0,
      id: level.level
    }));
  }, [contents]);
  
  // Prepare data for verification status chart
  const verificationData = React.useMemo(() => {
    const distribution = calculateVerificationDistribution(contents);
    return Object.entries(distribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      status
    }));
  }, [contents]);
  
  // Prepare data for content type chart
  const contentTypeData = React.useMemo(() => {
    const distribution = calculateContentTypeDistribution(contents);
    return Object.entries(distribution).map(([type, count]) => ({
      name: type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1),
      count,
      type
    }));
  }, [contents]);
  
  // Prepare data for time series chart
  const timeSeriesData = React.useMemo(() => {
    return analyzeContentOverTime(contents);
  }, [contents]);
  
  const exportChartAsPNG = (chartId: string) => {
    const chartSvg = document.getElementById(chartId);
    if (!chartSvg) return;
    
    // Logic to convert SVG to PNG and download
    // This is a simplified placeholder - in production you'd use a library like dom-to-image
    alert(`Chart would be exported as PNG (${chartId})`);
  };
  
  const exportAnalyticsAsCSV = () => {
    const characteristicsCSV = characteristicsData
      .map(item => `${item.name},${item.count}`)
      .join('\n');
    
    const levelsCSV = levelsData
      .map(item => `${item.name},${item.count}`)
      .join('\n');
    
    const csvContent = 
      `QAQF Characteristics Distribution\nCharacteristic,Count\n${characteristicsCSV}\n\n` +
      `QAQF Levels Distribution\nLevel,Count\n${levelsCSV}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'qaqf_analytics.csv');
    link.click();
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle>QAQF Analytics</CardTitle>
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={exportAnalyticsAsCSV}
          >
            <span className="material-icons text-sm mr-1">download</span>
            Export All Analytics
          </Button>
        </div>
        
        <Tabs 
          defaultValue="characteristics" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
            <TabsTrigger value="levels">QAQF Levels</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="contentTypes">Content Types</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="pt-4">
        <TabsContent value="characteristics" className="mt-0">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%" id="characteristics-chart">
              <BarChart
                data={characteristicsData.sort((a, b) => b.count - a.count)}
                margin={{ top: 20, right: 30, left: 30, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Content Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => exportChartAsPNG('characteristics-chart')}
            >
              <span className="material-icons text-sm mr-1">image</span>
              Export Chart
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="levels" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" id="levels-bar-chart">
                <BarChart
                  data={levelsData}
                  margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Content Count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" id="levels-pie-chart">
                <PieChart>
                  <Pie
                    data={levelsData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {levelsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => exportChartAsPNG('levels-pie-chart')}
            >
              <span className="material-icons text-sm mr-1">image</span>
              Export Chart
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="verification" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" id="verification-bar-chart">
                <BarChart
                  data={verificationData}
                  margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Content Count" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" id="verification-pie-chart">
                <PieChart>
                  <Pie
                    data={verificationData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {verificationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'verified' ? '#82ca9d' : 
                              entry.status === 'rejected' ? '#ff6b6b' : '#ffc658'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => exportChartAsPNG('verification-pie-chart')}
            >
              <span className="material-icons text-sm mr-1">image</span>
              Export Chart
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="contentTypes" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" id="contentType-bar-chart">
                <BarChart
                  data={contentTypeData}
                  margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Content Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" id="contentType-pie-chart">
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {contentTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => exportChartAsPNG('contentType-pie-chart')}
            >
              <span className="material-icons text-sm mr-1">image</span>
              Export Chart
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-0">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%" id="timeline-chart">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Content Created" 
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => exportChartAsPNG('timeline-chart')}
            >
              <span className="material-icons text-sm mr-1">image</span>
              Export Chart
            </Button>
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default QAQFAnalytics;