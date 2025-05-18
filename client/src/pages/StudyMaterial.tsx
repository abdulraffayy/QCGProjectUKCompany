import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StudyMaterialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("library");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">Study Material Library</h1>
        <p className="text-neutral-600">Access, manage, and organize your study materials and resources</p>
      </div>

      <Tabs defaultValue="library" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 text-xs md:text-sm">
          <TabsTrigger value="library" className="flex items-center">
            <span className="material-icons text-sm mr-2">auto_stories</span>
            Material Library
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center">
            <span className="material-icons text-sm mr-2">folder</span>
            Collections
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <span className="material-icons text-sm mr-2">dashboard_customize</span>
            Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="library">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <span className="material-icons text-sm">search</span>
                  </span>
                  <Input 
                    type="text" 
                    placeholder="Search materials" 
                    className="pl-10 w-full md:w-80" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Material Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="worksheet">Worksheet</SelectItem>
                      <SelectItem value="handout">Handout</SelectItem>
                      <SelectItem value="guide">Study Guide</SelectItem>
                      <SelectItem value="glossary">Glossary</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="QAQF Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="1-3">Basic (1-3)</SelectItem>
                      <SelectItem value="4-6">Intermediate (4-6)</SelectItem>
                      <SelectItem value="7-9">Advanced (7-9)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="default">
                    <span className="material-icons text-sm mr-2">filter_list</span>
                    More Filters
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 1,
                    title: "Healthcare Ethics Quick Reference",
                    type: "handout",
                    qaqfLevel: 3,
                    lastUpdated: "May 15, 2025",
                    pages: 2,
                    featured: true
                  },
                  {
                    id: 2,
                    title: "Patient Assessment Techniques Glossary",
                    type: "glossary",
                    qaqfLevel: 4,
                    lastUpdated: "May 10, 2025",
                    pages: 5,
                    featured: false
                  },
                  {
                    id: 3,
                    title: "Research Methods Worksheet",
                    type: "worksheet",
                    qaqfLevel: 6,
                    lastUpdated: "May 7, 2025",
                    pages: 8,
                    featured: false
                  },
                  {
                    id: 4,
                    title: "Nursing Case Studies Collection",
                    type: "guide",
                    qaqfLevel: 5,
                    lastUpdated: "May 12, 2025",
                    pages: 15,
                    featured: true
                  },
                  {
                    id: 5,
                    title: "Medical Terminology Reference",
                    type: "glossary",
                    qaqfLevel: 2,
                    lastUpdated: "May 8, 2025",
                    pages: 12,
                    featured: false
                  },
                  {
                    id: 6,
                    title: "Anatomy & Physiology Visual Guide",
                    type: "handout",
                    qaqfLevel: 3,
                    lastUpdated: "May 5, 2025",
                    pages: 10,
                    featured: true
                  }
                ].map((material) => (
                  <Card key={material.id} className={`overflow-hidden ${material.featured ? 'border-primary border-2' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{material.title}</CardTitle>
                        {material.featured && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <span className="capitalize">{material.type}</span>
                        <span className="text-xs">•</span>
                        <span>{material.pages} pages</span>
                        <span className="text-xs">•</span>
                        <Badge className={material.qaqfLevel <= 3 ? "bg-blue-100 text-blue-800" : 
                                        material.qaqfLevel <= 6 ? "bg-purple-100 text-purple-800" : 
                                        "bg-violet-100 text-violet-800"}>
                          QAQF {material.qaqfLevel}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="text-sm text-neutral-600">
                        Last updated: {material.lastUpdated}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button variant="outline" size="sm">
                        <span className="material-icons text-sm mr-1">visibility</span>
                        View
                      </Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="material-icons text-sm">download</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                          <span className="material-icons text-sm">delete</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button variant="outline">
                  <span className="material-icons text-sm mr-2">refresh</span>
                  Load More
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="collections">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Your Collections</h3>
                <Button>
                  <span className="material-icons text-sm mr-2">add</span>
                  New Collection
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 1,
                    title: "Nursing Fundamentals",
                    description: "Core materials for introductory nursing concepts",
                    itemCount: 12,
                    lastUpdated: "May 15, 2025",
                  },
                  {
                    id: 2,
                    title: "Healthcare Ethics",
                    description: "Case studies and worksheets on ethical considerations",
                    itemCount: 8,
                    lastUpdated: "May 12, 2025",
                  },
                  {
                    id: 3,
                    title: "Clinical Practice Resources",
                    description: "Guides and worksheets for clinical rotations",
                    itemCount: 15,
                    lastUpdated: "May 10, 2025",
                  },
                  {
                    id: 4,
                    title: "Research Methods",
                    description: "Materials for teaching research principles",
                    itemCount: 10,
                    lastUpdated: "May 8, 2025",
                  }
                ].map((collection) => (
                  <Card key={collection.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{collection.title}</CardTitle>
                      <CardDescription>{collection.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <div className="flex justify-between mb-2">
                          <span className="text-neutral-600">Items:</span>
                          <span className="font-medium">{collection.itemCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Last updated:</span>
                          <span>{collection.lastUpdated}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <span className="material-icons text-sm mr-1">visibility</span>
                        View
                      </Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                          <span className="material-icons text-sm">delete</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Study Material Templates</h3>
                <Button>
                  <span className="material-icons text-sm mr-2">add</span>
                  Create Template
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 1,
                    title: "Weekly Quiz Template",
                    description: "Standard format for weekly knowledge checks",
                    qaqfLevel: "Various",
                    lastUpdated: "May 15, 2025",
                    usageCount: 23
                  },
                  {
                    id: 2,
                    title: "Case Study Worksheet",
                    description: "Template for analyzing healthcare cases",
                    qaqfLevel: "4-6",
                    lastUpdated: "May 12, 2025",
                    usageCount: 18
                  },
                  {
                    id: 3,
                    title: "Vocabulary Handout",
                    description: "Glossary template for medical terminology",
                    qaqfLevel: "1-3",
                    lastUpdated: "May 8, 2025",
                    usageCount: 31
                  },
                  {
                    id: 4,
                    title: "Lab Report Guide",
                    description: "Structured template for lab activities",
                    qaqfLevel: "5-7",
                    lastUpdated: "May 5, 2025",
                    usageCount: 14
                  }
                ].map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <div className="flex justify-between mb-2">
                          <span className="text-neutral-600">QAQF Level:</span>
                          <span className="font-medium">{template.qaqfLevel}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-neutral-600">Used:</span>
                          <span>{template.usageCount} times</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Last updated:</span>
                          <span>{template.lastUpdated}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <span className="material-icons text-sm mr-1">content_copy</span>
                        Use Template
                      </Button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                          <span className="material-icons text-sm">delete</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyMaterialPage;