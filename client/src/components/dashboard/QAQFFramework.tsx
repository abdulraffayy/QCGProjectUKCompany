import { QAQFCharacteristics, QAQFLevels, QAQFLevelCategories } from "@/lib/qaqf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useState } from "react";

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

// Define the QAQF level structure for the dynamic view
interface QAQFLevelDefinition {
  id: string;
  name: string;
  levels: string;
  description: string;
  bgColor: string;
  textColor: string;
  characteristics: string[];
}

const defaultLevelDefinitions: QAQFLevelDefinition[] = [
  {
    id: "basic",
    name: "Basic",
    levels: "1-3",
    description: "Knowledge, Understanding & Cognitive Skills",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    characteristics: ["Clarity", "Completeness", "Accuracy"]
  },
  {
    id: "intermediate",
    name: "Intermediate",
    levels: "4-6",
    description: "Communication, Accountability & Digitalisation",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    characteristics: ["Coherence", "Relevance", "Engagement"]
  },
  {
    id: "advanced",
    name: "Advanced",
    levels: "7-9",
    description: "Sustainability, Creativity & Innovation",
    bgColor: "bg-violet-100",
    textColor: "text-violet-800",
    characteristics: ["Critical Thinking", "Accessibility", "Assessment Integration", "Adaptability"]
  }
];

const QAQFFramework: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [levelDefinitions, setLevelDefinitions] = useState<QAQFLevelDefinition[]>(defaultLevelDefinitions);
  const [editMode, setEditMode] = useState(false);
  
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
    // For levels 1-3, show first 3 characteristics
    if (level <= 3) return QAQFCharacteristics.slice(0, 3);
    // For levels 4-6, show first 6 characteristics
    if (level <= 6) return QAQFCharacteristics.slice(0, 6);
    // For levels 7-9, show all characteristics
    return QAQFCharacteristics;
  };
  
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-violet-50">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold">QAQF Framework Implementation</CardTitle>
          <CardDescription>Quality Assurance and Quality Framework for academic content</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className={`${editMode ? 'bg-blue-100' : ''} text-sm flex items-center`}
            onClick={() => setEditMode(!editMode)}
          >
            <span className="material-icons text-sm mr-1">{editMode ? 'done' : 'edit'}</span>
            {editMode ? 'Done' : 'Edit Framework'}
          </Button>
          <Link href="/qaqf-framework">
            <Button variant="outline" size="sm" className="text-primary text-sm flex items-center">
              <span className="material-icons text-sm mr-1">school</span>
              Details
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="pyramid" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pyramid">Pyramid View</TabsTrigger>
            <TabsTrigger value="levels">QAQF Levels</TabsTrigger>
            <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pyramid">
            {editMode && (
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <h3 className="text-sm font-semibold mb-2">Edit QAQF Framework Structure</h3>
                <p className="text-xs text-neutral-600 mb-3">
                  Modify the framework levels by updating the fields below. Changes will be reflected in the pyramid visualization.
                </p>
                <div className="space-y-4">
                  {levelDefinitions.map((level, index) => (
                    <div key={level.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-sm font-medium ${level.textColor}`}>{level.name} (Levels {level.levels})</h4>
                        <div className="flex space-x-2">
                          {index > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const newOrder = [...levelDefinitions];
                                [newOrder[index], newOrder[index-1]] = [newOrder[index-1], newOrder[index]];
                                setLevelDefinitions(newOrder);
                              }}
                            >
                              <span className="material-icons text-sm">arrow_upward</span>
                            </Button>
                          )}
                          {index < levelDefinitions.length - 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const newOrder = [...levelDefinitions];
                                [newOrder[index], newOrder[index+1]] = [newOrder[index+1], newOrder[index]];
                                setLevelDefinitions(newOrder);
                              }}
                            >
                              <span className="material-icons text-sm">arrow_downward</span>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-neutral-500 mb-1 block">Level Range</label>
                          <input 
                            type="text" 
                            className="w-full text-xs p-1.5 border rounded" 
                            value={level.levels} 
                            onChange={(e) => {
                              const updated = [...levelDefinitions];
                              updated[index] = { ...level, levels: e.target.value };
                              setLevelDefinitions(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 mb-1 block">Description</label>
                          <input 
                            type="text" 
                            className="w-full text-xs p-1.5 border rounded" 
                            value={level.description} 
                            onChange={(e) => {
                              const updated = [...levelDefinitions];
                              updated[index] = { ...level, description: e.target.value };
                              setLevelDefinitions(updated);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* QAQF Pyramid Visualization - Dynamic pyramid with correct order */}
            <div className="relative h-80 py-4 overflow-hidden">
              {/* Render the pyramid levels dynamically based on levelDefinitions */}
              {levelDefinitions.map((level, index) => {
                // Calculate position and styling based on index - bottom level has index 0
                const positions = [
                  { 
                    bottom: 0, left: 0, right: 0, 
                    bgColor: "bg-blue-500", 
                    hoverColor: "hover:bg-blue-600"
                  },
                  { 
                    bottom: 18, left: 6, right: 6,
                    bgColor: "bg-purple-500", 
                    hoverColor: "hover:bg-purple-600"
                  },
                  { 
                    bottom: 36, left: 12, right: 12,
                    bgColor: "bg-violet-600", 
                    hoverColor: "hover:bg-violet-700"
                  }
                ];
                
                // If more than 3 levels are defined, adjust positions
                const pos = index < 3 ? positions[index] : positions[2];
                
                // Parse level numbers for indicator display
                const levelNumbers = level.levels.split('-').map(l => parseInt(l))
                  .filter(n => !isNaN(n));
                
                return (
                  <div 
                    key={level.id}
                    className={`absolute ${pos.bgColor} bg-opacity-80 rounded-lg flex items-center justify-center text-white transition-all ${pos.hoverColor} cursor-pointer`}
                    style={{
                      bottom: `${pos.bottom}rem`,
                      left: `${pos.left}rem`,
                      right: `${pos.right}rem`,
                      height: '4rem'
                    }}
                  >
                    <div className="text-center">
                      <span className="text-sm font-medium">Levels {level.levels}: {level.name}</span>
                      <div className="text-xs mt-1 opacity-80">{level.description}</div>
                      <div className="flex justify-center mt-1 space-x-1">
                        {Array.from({ length: levelNumbers.length > 1 ? levelNumbers[1] - levelNumbers[0] + 1 : 1 }).map((_, i) => {
                          const levelNum = levelNumbers.length > 1 ? levelNumbers[0] + i : levelNumbers[0];
                          return (
                            <span key={i} className="px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">
                              L{levelNum}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                {/* Sort levels by ID to ensure ascending order */}
                {QAQFLevels.sort((a, b) => a.id - b.id).map((level) => (
                  <div 
                    key={level.id} 
                    className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className={`${getCategoryColor(level.id)} p-2 text-center`}>
                      <h3 className="text-sm font-medium flex items-center justify-center">
                        <span className="bg-white text-sm text-slate-800 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 font-bold">
                          {level.id}
                        </span>
                        {level.name}
                      </h3>
                      <Badge variant="outline" className="mt-1 bg-white/20 text-white text-xs">
                        {getCategoryName(level.id)}
                      </Badge>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-neutral-600">{level.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {getCharacteristicsForLevel(level.id).slice(0, 3).map((char) => (
                          <span key={char.id} className="inline-block text-xs bg-neutral-100 px-2 py-1 rounded-full">
                            {char.name}
                          </span>
                        ))}
                        {level.id > 3 && (
                          <span className="inline-block text-xs bg-neutral-100 px-2 py-1 rounded-full">
                            +{getCharacteristicsForLevel(level.id).length - 3} more
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
                {QAQFCharacteristics
                  .filter(char => {
                    if (activeCategory === "all") return true;
                    if (activeCategory === "basic" && char.id <= 3) return true;
                    if (activeCategory === "intermediate" && char.id > 3 && char.id <= 6) return true;
                    if (activeCategory === "advanced" && char.id > 6) return true;
                    return false;
                  })
                  .map((characteristic) => (
                    <div 
                      key={characteristic.id}
                      className="border p-3 rounded-md hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center mb-1">
                        <span className="material-icons text-sm mr-2 text-primary">
                          {characteristicIcons[characteristic.name] || "check"}
                        </span>
                        <span className="text-sm font-medium">{characteristic.name}</span>
                      </div>
                      <p className="text-xs text-neutral-600">{characteristic.description}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QAQFFramework;
