import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ExternalLink, TrendingUp, Users, BookOpen } from "lucide-react";

// Define icons for each characteristic
const characteristicIcons: Record<string, string> = {
  "Clarity": "lightbulb",
  "Completeness": "check_circle",
  "Accuracy": "verified",
  "Coherence": "sync_alt",
  "Relevance": "trending_up",
  "Engagement": "people",
  "Critical Thinking": "psychology",
  "Accessibility": "accessibility",
  "Assessment Integration": "analytics",
  "Adaptability": "bubble_chart"
};

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

const QAQFFramework: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  // Fetch dynamic QAQF levels from database
  const { data: qaqfLevels, isLoading: levelsLoading } = useQuery<QAQFLevel[]>({
    queryKey: ['/api/qaqf/levels'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch dynamic QAQF characteristics from database
  const { data: qaqfCharacteristics, isLoading: characteristicsLoading } = useQuery<QAQFCharacteristic[]>({
    queryKey: ['/api/qaqf/characteristics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch content statistics for dashboard insights
  const { data: contentStats } = useQuery<ContentStats>({
    queryKey: ['/api/dashboard/qaqf-stats'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const getCategoryColor = (level: number) => {
    if (level <= 3) return "bg-blue-500 text-white";
    if (level <= 6) return "bg-purple-500 text-white";
    return "bg-violet-500 text-white";
  };
  
  const getCategoryName = (level: number) => {
    if (level <= 3) return "Basic";
    if (level <= 6) return "Intermediate";
    return "Advanced";
  };
  
  const getCharacteristicsForLevel = (level: number) => {
    if (!qaqfCharacteristics) return [];
    // Filter characteristics based on category and level
    if (level <= 3) return qaqfCharacteristics.filter(char => char.category === 'basic');
    if (level <= 6) return qaqfCharacteristics.filter(char => ['basic', 'intermediate'].includes(char.category));
    return qaqfCharacteristics; // All characteristics for advanced levels
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

  if (levelsLoading || characteristicsLoading) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading QAQF Framework...</span>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-violet-50">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold">QAQF Framework Implementation</CardTitle>
          <CardDescription>Quality Assurance and Quality Framework for academic content</CardDescription>
        </div>
        <Link href="/qaqf-framework">
          <Button variant="outline" className="text-primary text-sm flex items-center">
            <span className="material-icons text-sm mr-1">school</span>
            Framework Details
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="pyramid" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pyramid">Pyramid View</TabsTrigger>
            <TabsTrigger value="levels">QAQF Levels</TabsTrigger>
            <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pyramid">
            {/* QAQF Pyramid Visualization - Pyramid with correct order: Basic at bottom, Advanced at top */}
            <div className="relative h-80 py-4 overflow-hidden">
              {/* Bottom level: Basic (1-3) */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-blue-500 bg-opacity-80 rounded-lg flex items-center justify-center text-white transition-all hover:bg-blue-600 cursor-pointer">
                <div className="text-center">
                  <span className="text-sm font-medium">Levels 1-3: Basic</span>
                  <div className="text-xs mt-1 opacity-80">Knowledge, Understanding & Cognitive Skills</div>
                  <div className="flex justify-center mt-1 space-x-1">
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L1</span>
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L2</span>
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L3</span>
                  </div>
                </div>
              </div>
              
              {/* Middle level: Intermediate (4-6) */}
              <div className="absolute bottom-18 left-6 right-6 h-16 bg-purple-500 bg-opacity-80 rounded-lg flex items-center justify-center text-white transition-all hover:bg-purple-600 cursor-pointer">
                <div className="text-center">
                  <span className="text-sm font-medium">Levels 4-6: Intermediate</span>
                  <div className="text-xs mt-1 opacity-80">Communication, Accountability & Digitalisation</div>
                  <div className="flex justify-center mt-1 space-x-1">
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L4</span>
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L5</span>
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L6</span>
                  </div>
                </div>
              </div>
              
              {/* Top level: Advanced (7-9) */}
              <div className="absolute bottom-36 left-12 right-12 h-16 bg-violet-600 bg-opacity-80 rounded-lg flex items-center justify-center text-white transition-all hover:bg-violet-700 cursor-pointer">
                <div className="text-center">
                  <span className="text-sm font-medium">Levels 7-9: Advanced</span>
                  <div className="text-xs mt-1 opacity-80">Sustainability, Creativity & Innovative Skills</div>
                  <div className="flex justify-center mt-1 space-x-1">
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L7</span>
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L8</span>
                    <span className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">L9</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">QAQF Implementation Guidelines</h4>
              <p className="text-sm text-neutral-600 mb-4">
                The QAQF framework is implemented on a progressive level basis where higher levels incorporate all characteristics from lower levels with increased sophistication. The framework ensures consistent quality across academic content through structured criteria.
              </p>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-blue-100 rounded-md">
                  <div className="font-medium text-blue-800">Basic (1-3)</div>
                  <div className="text-neutral-600 mt-1">Knowledge, Understanding & Cognitive Skills</div>
                </div>
                <div className="p-2 bg-purple-100 rounded-md">
                  <div className="font-medium text-purple-800">Intermediate (4-6)</div>
                  <div className="text-neutral-600 mt-1">Communication, Accountability & Digitalisation</div>
                </div>
                <div className="p-2 bg-violet-100 rounded-md">
                  <div className="font-medium text-violet-800">Advanced (7-9)</div>
                  <div className="text-neutral-600 mt-1">Sustainability, Creativity & Innovation</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="levels">
            <div className="space-y-4">
              {/* Category headings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-blue-600">Basic (Levels 1-3)</h3>
                  <p className="text-xs text-neutral-600">Foundation knowledge and skills</p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-purple-600">Intermediate (Levels 4-6)</h3>
                  <p className="text-xs text-neutral-600">Enhanced application and understanding</p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-violet-600">Advanced (Levels 7-9)</h3>
                  <p className="text-xs text-neutral-600">Expert implementation and innovation</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort levels by level number to ensure ascending order */}
                {qaqfLevels?.sort((a, b) => a.level - b.level).map((level) => (
                  <div 
                    key={level.id} 
                    className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className={`${getCategoryColor(level.level)} p-2 text-center`}>
                      <h3 className="text-sm font-medium flex items-center justify-center">
                        <span className="bg-white text-sm text-slate-800 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 font-bold">
                          {level.level}
                        </span>
                        {level.name}
                      </h3>
                      <Badge variant="outline" className="mt-1 bg-white/20 text-white text-xs">
                        {getCategoryName(level.level)}
                      </Badge>
                      <div className="mt-1 text-xs opacity-80">
                        {getContentCountForLevel(level.level)} content items
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-neutral-600">{level.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {getCharacteristicsForLevel(level.level).slice(0, 3).map((char) => (
                          <span key={char.id} className="inline-block text-xs bg-neutral-100 px-2 py-1 rounded-full">
                            {char.name}
                          </span>
                        ))}
                        {level.level > 3 && (
                          <span className="inline-block text-xs bg-neutral-100 px-2 py-1 rounded-full">
                            +{getCharacteristicsForLevel(level.level).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="characteristics">
            <div className="mb-4">
              <div className="flex space-x-2 mb-3">
                <Badge 
                  variant={activeCategory === "all" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setActiveCategory("all")}
                >
                  All
                </Badge>
                <Badge 
                  variant={activeCategory === "basic" ? "default" : "outline"} 
                  className="cursor-pointer bg-blue-500"
                  onClick={() => setActiveCategory("basic")}
                >
                  Basic (1-3)
                </Badge>
                <Badge 
                  variant={activeCategory === "intermediate" ? "default" : "outline"} 
                  className="cursor-pointer bg-purple-500"
                  onClick={() => setActiveCategory("intermediate")}
                >
                  Intermediate (4-6)
                </Badge>
                <Badge 
                  variant={activeCategory === "advanced" ? "default" : "outline"} 
                  className="cursor-pointer bg-violet-500"
                  onClick={() => setActiveCategory("advanced")}
                >
                  Advanced (7-9)
                </Badge>
              </div>
            
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {qaqfCharacteristics
                  ?.filter(char => {
                    if (activeCategory === "all") return true;
                    if (activeCategory === "basic" && char.category === "basic") return true;
                    if (activeCategory === "intermediate" && char.category === "intermediate") return true;
                    if (activeCategory === "advanced" && char.category === "advanced") return true;
                    return false;
                  })
                  .map((characteristic) => (
                    <div 
                      key={characteristic.id}
                      className="border p-3 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLevel(characteristic.id)}
                    >
                      <div className="flex items-center mb-1">
                        <span className="material-icons text-sm mr-2 text-primary">
                          {characteristicIcons[characteristic.name] || "check"}
                        </span>
                        <span className="text-sm font-medium">{characteristic.name}</span>
                      </div>
                      <p className="text-xs text-neutral-600">{characteristic.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {characteristic.category}
                      </Badge>
                    </div>
                  )) || []}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QAQFFramework;