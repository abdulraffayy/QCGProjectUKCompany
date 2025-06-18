import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { QAQFLevels, QAQFCharacteristics } from "../lib/qaqf";

// Simple arrays for animation styles and duration options
const AnimationStyles = [
  "2D Animation",
  "3D Animation", 
  "Motion Graphics",
  "Whiteboard Animation",
  "Character Animation"
];

const DurationOptions = [
  "2-3 minutes",
  "5-7 minutes", 
  "10-15 minutes",
  "20+ minutes"
];

import { useToast } from "../../hooks/use-toast";

const VideoGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [qaqfLevel, setQaqfLevel] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [animationStyle, setAnimationStyle] = useState("");
  const [duration, setDuration] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Get videos query
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['/api/videos'],
  });

  const handleCharacteristicToggle = (characteristicId: number) => {
    setSelectedCharacteristics(prev => 
      prev.includes(characteristicId) 
        ? prev.filter(id => id !== characteristicId) 
        : [...prev, characteristicId]
    );
  };

  const handleGenerateVideo = () => {
    if (!title || !qaqfLevel || !animationStyle || !duration || selectedCharacteristics.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate video generation
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewOpen(true);
      
      toast({
        title: "Video Generated Successfully",
        description: "Your new video is now available in My Content.",
      });
    }, 3000);
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Video Generator</h2>
            <p className="text-neutral-600 mt-1">Create educational videos with animation features aligned with QAQF framework</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Educational Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="video-title">Video Title</Label>
                    <Input 
                      id="video-title" 
                      placeholder="Enter video title" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="module-code">Module Code (optional)</Label>
                    <Input 
                      id="module-code" 
                      placeholder="e.g. TECH-428" 
                      value={moduleCode}
                      onChange={(e) => setModuleCode(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="qaqf-level">QAQF Level</Label>
                    <Select value={qaqfLevel} onValueChange={setQaqfLevel}>
                      <SelectTrigger id="qaqf-level">
                        <SelectValue placeholder="Select QAQF Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {QAQFLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id.toString()}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="animation-style">Animation Style</Label>
                    <Select value={animationStyle} onValueChange={setAnimationStyle}>
                      <SelectTrigger id="animation-style">
                        <SelectValue placeholder="Select animation style" />
                      </SelectTrigger>
                      <SelectContent>
                        {AnimationStyles.map((style, index) => (
                          <SelectItem key={index} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {DurationOptions.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what your video should contain"
                  className="h-20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="mb-6">
                <Label className="mb-2 block">QAQF Characteristics</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
              
              <div className="mb-6">
                <Label htmlFor="additional-instructions">Additional Instructions (optional)</Label>
                <Textarea 
                  id="additional-instructions" 
                  placeholder="Add any specific requirements or instructions for video generation"
                  className="h-20"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="w-full"
                variant="default"
              >
                {isGenerating ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Generating Video...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">videocam</span>
                    Generate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-neutral-900 h-64 rounded-lg relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
                  alt="Education technology with animation capabilities" 
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="material-icons text-white text-3xl">play_arrow</span>
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <h4 className="text-white font-medium">{title || "AI in Educational Technologies"}</h4>
                  <p className="text-white text-opacity-80 text-sm">
                    {qaqfLevel ? QAQFLevels.find(l => l.id.toString() === qaqfLevel)?.name : "Level 8 - Innovative content"} Implementation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Video Generation Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Animation Styles</h4>
                  <p className="text-sm text-neutral-600 mb-2">
                    Choose the animation style that best suits your educational content:
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-neutral-100 rounded-md">
                      <p className="text-xs font-medium">2D Animation</p>
                      <p className="text-xs text-neutral-600">Simplified flat animations, best for clear concepts</p>
                    </div>
                    <div className="p-2 bg-neutral-100 rounded-md">
                      <p className="text-xs font-medium">3D Animation</p>
                      <p className="text-xs text-neutral-600">Complex visualization, ideal for spatial concepts</p>
                    </div>
                    <div className="p-2 bg-neutral-100 rounded-md">
                      <p className="text-xs font-medium">Motion Graphics</p>
                      <p className="text-xs text-neutral-600">Dynamic text and graphics, great for data visualization</p>
                    </div>
                    <div className="p-2 bg-neutral-100 rounded-md">
                      <p className="text-xs font-medium">Whiteboard Animation</p>
                      <p className="text-xs text-neutral-600">Sequential drawing style, perfect for processes</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Best Practices</h4>
                  <ul className="text-sm text-neutral-600 space-y-1 list-disc pl-4">
                    <li>Keep videos concise and focused on key concepts</li>
                    <li>Ensure clear audio narration with professional voice-over</li>
                    <li>Include interactive elements to improve engagement</li>
                    <li>Follow QAQF guidelines for educational quality</li>
                    <li>Include assessments at the end of each video when appropriate</li>
                  </ul>
                </div>
                
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1596525663581-d2a97eb0a9e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                    alt="Education technology with animation capabilities" 
                    className="w-full h-auto rounded-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recently Generated Videos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingVideos ? (
                <div className="text-center py-4">Loading videos...</div>
              ) : !videos || videos.length === 0 ? (
                <div className="text-center py-4 text-neutral-500">No videos generated yet</div>
              ) : (
                <div className="space-y-4">
                  {videos.slice(0, 3).map((video: any) => (
                    <div key={video.id} className="flex items-start space-x-3">
                      <div className="w-16 h-10 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-icons text-neutral-400">movie</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{video.title}</h4>
                        <p className="text-xs text-neutral-500">QAQF Level {video.qaqfLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title || "AI in Educational Technologies"}</DialogTitle>
            <DialogDescription>
              QAQF Level {qaqfLevel} | {animationStyle} | {duration}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-neutral-900 aspect-video rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="material-icons text-white text-6xl mb-4">movie</span>
              <p className="text-white text-lg font-medium">Video Generation Complete</p>
              <p className="text-white text-opacity-70">Your video is ready to view</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button>Download Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoGeneratorPage;
