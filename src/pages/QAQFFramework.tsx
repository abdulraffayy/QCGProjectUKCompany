import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { Link } from 'wouter';
import { ArrowLeft, TrendingUp, BookOpen, CheckCircle, Target } from 'lucide-react';

// Types for dynamic QAQF data
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

interface ContentStats {
  totalContent: number;
  verifiedContent: number;
  levelDistribution: Record<number, number>;
}

const QAQFFrameworkPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Fetch dynamic QAQF data
  const { data: qaqfLevels, isLoading: levelsLoading } = useQuery<QAQFLevel[]>({
    queryKey: ['/api/qaqf/levels'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: qaqfCharacteristics, isLoading: characteristicsLoading } = useQuery<QAQFCharacteristic[]>({
    queryKey: ['/api/qaqf/characteristics'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: contentStats } = useQuery<ContentStats>({
    queryKey: ['/api/dashboard/qaqf-stats'],
    staleTime: 2 * 60 * 1000,
  });

  const getCategoryColor = (level: number) => {
    if (level <= 3) return 'bg-blue-500 text-white';
    if (level <= 6) return 'bg-purple-500 text-white';
    return 'bg-violet-500 text-white';
  };

  const getCategoryName = (level: number) => {
    if (level <= 3) return 'Basic';
    if (level <= 6) return 'Intermediate';
    return 'Advanced';
  };

  const getContentCountForLevel = (level: number) => {
    return contentStats?.levelDistribution?.[level] || 0;
  };

  const getTotalContentForCategory = (category: string) => {
    if (!contentStats?.levelDistribution) return 0;
    const levels = category === 'basic' ? [1,2,3] : 
                  category === 'intermediate' ? [4,5,6] : [7,8,9];
    return levels.reduce((sum, level) => sum + getContentCountForLevel(level), 0);
  };

  const getVerificationRate = () => {
    if (!contentStats?.totalContent) return 0;
    return Math.round((contentStats.verifiedContent / contentStats.totalContent) * 100);
  };

  const getCharacteristicsForCategory = (category: string) => {
    if (!qaqfCharacteristics) return [];
    return qaqfCharacteristics.filter(char => 
      category === 'all' ? true : char.category === category
    );
  };

  if (levelsLoading || characteristicsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Loading QAQF Framework Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">QAQF Framework Details</h1>
            <p className="text-muted-foreground">
              Quality Assurance and Quality Framework implementation and guidelines
            </p>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold">{contentStats?.totalContent || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Content</p>
                <p className="text-2xl font-bold">{contentStats?.verifiedContent || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verification Rate</p>
                <p className="text-2xl font-bold">{getVerificationRate()}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={getVerificationRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">QAQF Levels</p>
                <p className="text-2xl font-bold">{qaqfLevels?.length || 0}</p>
              </div>
              <Target className="h-8 w-8 text-violet-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Framework Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Framework Overview</TabsTrigger>
          <TabsTrigger value="levels">QAQF Levels</TabsTrigger>
          <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
          <TabsTrigger value="analytics">Content Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QAQF Framework Implementation</CardTitle>
              <CardDescription>
                The Quality Assurance and Quality Framework (QAQF) provides a structured approach 
                to maintaining consistent quality standards across academic content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Framework Pyramid */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Framework Structure</h3>
                <div className="relative h-80 bg-gradient-to-t from-blue-50 to-violet-50 rounded-lg p-6">
                  {/* Advanced Level */}
                  <div className="absolute top-4 left-1/4 right-1/4 h-16 bg-violet-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <div className="text-center">
                      <div className="font-bold">Advanced (7-9)</div>
                      <div className="text-sm opacity-90">{getTotalContentForCategory('advanced')} items</div>
                    </div>
                  </div>
                  
                  {/* Intermediate Level */}
                  <div className="absolute top-24 left-1/6 right-1/6 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <div className="text-center">
                      <div className="font-bold">Intermediate (4-6)</div>
                      <div className="text-sm opacity-90">{getTotalContentForCategory('intermediate')} items</div>
                    </div>
                  </div>
                  
                  {/* Basic Level */}
                  <div className="absolute bottom-4 left-2 right-2 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <div className="text-center">
                      <div className="font-bold">Basic (1-3)</div>
                      <div className="text-sm opacity-90">{getTotalContentForCategory('basic')} items</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Implementation Guidelines */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Implementation Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-blue-700 text-sm">Basic Levels (1-3)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Foundation knowledge and understanding. Focus on clarity, completeness, and basic cognitive skills.
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-purple-700 text-sm">Intermediate Levels (4-6)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Enhanced application and communication. Emphasis on accountability, engagement, and digital integration.
                    </CardContent>
                  </Card>
                  
                  <Card className="border-violet-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-violet-700 text-sm">Advanced Levels (7-9)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Expert implementation and innovation. Focus on sustainability, creativity, and adaptive learning.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {qaqfLevels?.sort((a, b) => a.level - b.level).map((level) => (
              <Card 
                key={level.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedLevel === level.level ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedLevel(selectedLevel === level.level ? null : level.level)}
              >
                <CardHeader className={getCategoryColor(level.level)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <span className="bg-white text-gray-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 font-bold text-sm">
                        {level.level}
                      </span>
                      {level.name}
                    </CardTitle>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {getCategoryName(level.level)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">{level.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Content Items</span>
                    <Badge variant="secondary">{getContentCountForLevel(level.level)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="characteristics" className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Characteristics
              </Button>
              <Button
                variant={selectedCategory === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('basic')}
              >
                Basic
              </Button>
              <Button
                variant={selectedCategory === 'intermediate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('intermediate')}
              >
                Intermediate
              </Button>
              <Button
                variant={selectedCategory === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('advanced')}
              >
                Advanced
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCharacteristicsForCategory(selectedCategory).map((characteristic) => (
                <Card key={characteristic.id} className="hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{characteristic.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {characteristic.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{characteristic.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Distribution by Level</CardTitle>
                <CardDescription>Number of content items per QAQF level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {qaqfLevels?.sort((a, b) => a.level - b.level).map((level) => {
                    const count = getContentCountForLevel(level.level);
                    const percentage = contentStats?.totalContent 
                      ? Math.round((count / contentStats.totalContent) * 100) 
                      : 0;
                    return (
                      <div key={level.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(level.level).replace('text-white', '')}`}></div>
                          <span className="text-sm">Level {level.level}</span>
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
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Content items grouped by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['basic', 'intermediate', 'advanced'].map((category) => {
                    const count = getTotalContentForCategory(category);
                    const percentage = contentStats?.totalContent 
                      ? Math.round((count / contentStats.totalContent) * 100) 
                      : 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <span className="text-sm">{count} items ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QAQFFrameworkPage;