import { useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { QAQFLevels, QAQFCharacteristics } from "@/lib/qaqf";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const [contentType, setContentType] = useState("academic_paper");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qaqfLevel, setQaqfLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<number[]>([]);

  const handleCharacteristicToggle = (characteristicId: number) => {
    setSelectedCharacteristics(prev => 
      prev.includes(characteristicId) 
        ? prev.filter(id => id !== characteristicId) 
        : [...prev, characteristicId]
    );
  };

  const handleGenerate = () => {
    if (!qaqfLevel || !subject || selectedCharacteristics.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulating content generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Content Generated Successfully",
        description: "Your new content is now available in My Content.",
      });
    }, 2000);
  };

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <CardTitle className="text-lg font-bold mb-4">Content Generator</CardTitle>
        <p className="text-neutral-600 text-sm mb-6">Create academic content aligned with QAQF levels and characteristics</p>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-neutral-700 mb-1">Content Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant={contentType === "academic_paper" ? "default" : "outline"}
              className="flex items-center justify-center px-4 py-2 rounded-lg text-sm"
              onClick={() => setContentType("academic_paper")}
            >
              <span className="material-icons text-sm mr-2">description</span>
              Academic Content
            </Button>
            <Button 
              variant={contentType === "video" ? "default" : "outline"}
              className="flex items-center justify-center px-4 py-2 rounded-lg text-sm"
              onClick={() => setContentType("video")}
            >
              <span className="material-icons text-sm mr-2">movie</span>
              Video Content
            </Button>
          </div>
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
          <Label className="block text-sm font-medium text-neutral-700 mb-1">Subject Area</Label>
          <Input 
            type="text" 
            placeholder="Enter subject area" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <Label className="block text-sm font-medium text-neutral-700 mb-1">QAQF Characteristics</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
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
        
        <Button 
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating}
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
      
      {/* Featured content characteristics image */}
      <div className="h-48 bg-neutral-100 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400" 
          alt="Education technology assessment process" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h4 className="font-bold text-lg">Quality Academic Content</h4>
          <p className="text-sm">Aligned with British Standards</p>
        </div>
      </div>
    </Card>
  );
};

export default ContentGenerator;
