import { useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { QAQFLevels, AnimationStyles, DurationOptions } from "@/lib/qaqf";

const VideoGenerator: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [animationStyle, setAnimationStyle] = useState("");
  const [duration, setDuration] = useState("");
  const [qaqfLevel, setQaqfLevel] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([]);

  const handleCharacteristicToggle = (characteristic: string) => {
    setSelectedCharacteristics(prev => 
      prev.includes(characteristic) 
        ? prev.filter(c => c !== characteristic) 
        : [...prev, characteristic]
    );
  };

  const handleGenerateVideo = () => {
    if (!title || !qaqfLevel || !animationStyle || !duration) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulating video generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Video Generated Successfully",
        description: "Your new video is now available in My Content.",
      });
    }, 3000);
  };

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <CardTitle className="text-lg font-bold">Video Generator</CardTitle>
            <p className="text-neutral-600 text-sm mt-1">Create educational videos with animation features aligned with QAQF</p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            variant="accent"
          >
            {isGenerating ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Creating Video...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">videocam</span>
                Create Video
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            {/* Video preview area */}
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
                  QAQF Level {qaqfLevel || "8"} - {qaqfLevel ? QAQFLevels.find(l => l.level.toString() === qaqfLevel)?.name : "Specialist"} Implementation
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Video Title</Label>
              <Input 
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Animation Style</Label>
              <Select value={animationStyle} onValueChange={setAnimationStyle}>
                <SelectTrigger>
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
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
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
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-700 mb-1">QAQF Level</Label>
              <Select value={qaqfLevel} onValueChange={setQaqfLevel}>
                <SelectTrigger>
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
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-700 mb-1">QAQF Characteristics Focus</Label>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center text-sm">
                  <Checkbox 
                    className="mr-1" 
                    checked={selectedCharacteristics.includes("Digitalisation & AI")}
                    onCheckedChange={() => handleCharacteristicToggle("Digitalisation & AI")}
                  />
                  Digitalisation & AI
                </label>
                <label className="flex items-center text-sm">
                  <Checkbox 
                    className="mr-1" 
                    checked={selectedCharacteristics.includes("Reflective & Creative")}
                    onCheckedChange={() => handleCharacteristicToggle("Reflective & Creative")}
                  />
                  Reflective & Creative
                </label>
                <label className="flex items-center text-sm">
                  <Checkbox 
                    className="mr-1" 
                    checked={selectedCharacteristics.includes("Sustainability")}
                    onCheckedChange={() => handleCharacteristicToggle("Sustainability")}
                  />
                  Sustainability
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoGenerator;
