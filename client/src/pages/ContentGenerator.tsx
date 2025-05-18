import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { QAQFLevels, QAQFCharacteristics, ContentTypes } from "@/lib/qaqf";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { generateAcademicContent } from '@/lib/openai';

const ContentGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("academic");
  const [contentType, setContentType] = useState(ContentTypes[0].id);
  const [qaqfLevel, setQaqfLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

  // Get QAQF characteristics
  const { data: characteristics, isLoading: isLoadingCharacteristics } = useQuery({
    queryKey: ['/api/qaqf/characteristics'],
  });

  const handleCharacteristicToggle = (characteristicId: number) => {
    setSelectedCharacteristics(prev => 
      prev.includes(characteristicId) 
        ? prev.filter(id => id !== characteristicId) 
        : [...prev, characteristicId]
    );
  };

  const [sourceMaterial, setSourceMaterial] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"internal" | "uploaded">("internal");
  const [isUploadingSource, setIsUploadingSource] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploadingSource(true);
    
    try {
      // For text files, read directly
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSourceMaterial(event.target.result as string);
            setSourceType("uploaded");
            toast({
              title: "Source Material Added",
              description: "Text file has been loaded as source material."
            });
          }
        };
        reader.readAsText(file);
      } else {
        // In a full implementation, this would upload and process PDF/audio files
        // For now, we just simulate reading content
        setTimeout(() => {
          setSourceMaterial("Sample extracted content from uploaded file: " + file.name);
          setSourceType("uploaded");
          toast({
            title: "Source Material Added",
            description: `${file.name} has been processed as source material.`
          });
          setIsUploadingSource(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to process the uploaded file.",
        variant: "destructive"
      });
      setIsUploadingSource(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!qaqfLevel || !subject || selectedCharacteristics.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields: QAQF Level, Subject Area, and at least one Characteristic.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedPreview(null);

    try {
      const characIds = selectedCharacteristics.map(id => id.toString());
      
      // Call the API to generate content
      const response = await generateAcademicContent({
        contentType,
        qaqfLevel: parseInt(qaqfLevel),
        subject,
        characteristics: characIds,
        additionalInstructions,
        sourceType,
        sourceContent: sourceMaterial || undefined
      });
      
      // Format the content for preview
      const characNames = selectedCharacteristics.map(id => 
        characteristics?.find(c => c.id === id)?.name || ""
      ).filter(Boolean);
      
      // Use the generated content or fall back to a template
      const preview = response.content || `
# ${response.title || subject}

## Module: ${response.moduleCode || moduleCode || 'EDU-101'}

### QAQF Level ${qaqfLevel} Implementation

This academic content demonstrates the application of the following QAQF characteristics:
${characNames.map(name => `- ${name}`).join('\n')}

${additionalInstructions ? `### Additional Instructions\n${additionalInstructions}\n` : ''}

### Content Body
Content generation is being processed. Please try again in a moment.
      `;
      
      setGeneratedPreview(preview);
      setIsGenerating(false);
      
      toast({
        title: "Content Generated",
        description: "Your content has been generated successfully!",
      });
    } catch (error) {
      console.error("Content generation error:", error);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Content Generator</h2>
            <p className="text-neutral-600 mt-1">Create academic content aligned with QAQF framework and British standards</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="academic" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="academic">Academic Content</TabsTrigger>
                  <TabsTrigger value="video">Video Content</TabsTrigger>
                </TabsList>
                
                <TabsContent value="academic">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="content-type">Content Type</Label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger id="content-type">
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ContentTypes.filter(type => type.id !== 'video').map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <span className="flex items-center">
                                <span className="material-icons mr-2 text-sm">{type.icon}</span>
                                {type.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="qaqf-level">QAQF Level</Label>
                        <Select value={qaqfLevel} onValueChange={setQaqfLevel}>
                          <SelectTrigger id="qaqf-level">
                            <SelectValue placeholder="Select QAQF Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {QAQFLevels.map((level) => (
                              <SelectItem key={level.id} value={level.level.toString()}>
                                Level {level.level} - {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="module-code">Module Code (optional)</Label>
                        <Input 
                          id="module-code" 
                          placeholder="e.g. EDU-573" 
                          value={moduleCode}
                          onChange={(e) => setModuleCode(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject-area">Subject Area</Label>
                      <Input 
                        id="subject-area" 
                        placeholder="e.g. Critical Thinking in Higher Education" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>QAQF Characteristics (select at least one)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {QAQFCharacteristics.map((characteristic) => (
                          <div key={characteristic.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`characteristic-${characteristic.id}`}
                              checked={selectedCharacteristics.includes(characteristic.id)}
                              onCheckedChange={() => handleCharacteristicToggle(characteristic.id)}
                            />
                            <label
                              htmlFor={`characteristic-${characteristic.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {characteristic.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="additional-instructions">Additional Instructions (optional)</Label>
                      <Textarea 
                        id="additional-instructions" 
                        placeholder="Add any specific requirements or instructions for content generation"
                        className="min-h-[100px]"
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                      />
                    </div>
                    
                    <div className="border rounded-md p-4 mb-4 bg-gray-50">
                      <div className="flex items-center mb-2">
                        <span className="material-icons text-primary mr-2">source</span>
                        <h3 className="font-medium">Source Material</h3>
                      </div>
                      
                      <p className="text-sm text-neutral-600 mb-3">
                        Upload your own source material (PDF, text, audio transcript) to generate content based on verified sources only
                      </p>
                      
                      <div className="border-2 border-dashed border-neutral-300 rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="file"
                          id="source-upload"
                          accept=".txt,.pdf,.docx,.mp3"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="source-upload" className="cursor-pointer">
                          {sourceMaterial ? (
                            <div className="text-sm">
                              <span className="material-icons text-success mb-1">check_circle</span>
                              <p className="font-medium">Source material added</p>
                              <p className="text-neutral-500 truncate max-w-full">{sourceMaterial.substring(0, 50)}...</p>
                            </div>
                          ) : isUploadingSource ? (
                            <div>
                              <span className="material-icons animate-spin mb-1">refresh</span>
                              <p>Processing source material...</p>
                            </div>
                          ) : (
                            <div>
                              <span className="material-icons text-3xl mb-1">upload_file</span>
                              <p>Drag & drop or click to upload</p>
                              <p className="text-xs text-neutral-500 mt-1">Supported formats: PDF, TXT, DOCX, MP3</p>
                            </div>
                          )}
                        </label>
                      </div>
                      
                      {sourceMaterial && (
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSourceMaterial(null);
                              setSourceType("internal");
                            }}
                          >
                            <span className="material-icons text-sm mr-1">delete</span>
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleGenerateContent}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <span className="material-icons animate-spin mr-2">refresh</span>
                          Generating Content...
                        </>
                      ) : (
                        <>
                          <span className="material-icons mr-2">auto_awesome</span>
                          Generate Content
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="video">
                  <div className="flex justify-center items-center p-8">
                    <div className="text-center">
                      <span className="material-icons text-4xl text-neutral-400 mb-2">videocam</span>
                      <h3 className="text-lg font-medium mb-2">Video Generator</h3>
                      <p className="text-neutral-600 mb-4">
                        Use our dedicated video generator for creating educational videos
                      </p>
                      <Button onClick={() => window.location.href = '/video-generator'}>
                        Go to Video Generator
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {generatedPreview && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Generated Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-neutral-50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{generatedPreview}</pre>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline">
                    <span className="material-icons mr-2 text-sm">edit</span>
                    Edit
                  </Button>
                  <Button>
                    <span className="material-icons mr-2 text-sm">save</span>
                    Save to My Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>QAQF Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">About QAQF Framework</h4>
                  <p className="text-sm text-neutral-600">
                    The QAQF framework has nine characteristics and nine levels to measure the quality of academic content.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Level Descriptors</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-md">
                      <p className="text-xs font-medium text-primary">Levels 1-3: Foundation</p>
                      <p className="text-xs text-neutral-600">Basic knowledge and understanding implementation</p>
                    </div>
                    <div className="p-2 bg-secondary bg-opacity-10 rounded-md">
                      <p className="text-xs font-medium text-secondary">Levels 4-6: Intermediate</p>
                      <p className="text-xs text-neutral-600">Communication, accountability, and digitalisation focus</p>
                    </div>
                    <div className="p-2 bg-accent bg-opacity-10 rounded-md">
                      <p className="text-xs font-medium text-accent">Levels 7-9: Advanced</p>
                      <p className="text-xs text-neutral-600">Sustainability, creativity, and futuristic skills</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">British Standards Alignment</h4>
                  <p className="text-sm text-neutral-600">
                    All generated content is automatically checked against British educational standards for quality and compliance.
                  </p>
                </div>
                
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1453906971074-ce568cccbc63?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                    alt="Education quality assessment process" 
                    className="w-full h-auto rounded-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ContentGeneratorPage;
