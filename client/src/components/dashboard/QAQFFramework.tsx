import { QAQFCharacteristics, QAQFLevelCategories } from "@/lib/qaqf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QAQFFramework: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold">QAQF Framework Implementation</CardTitle>
        </div>
        <Button variant="link" className="text-primary text-sm flex items-center">
          View details
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </Button>
      </CardHeader>
      <CardContent>
        {/* QAQF Pyramid Visualization */}
        <div className="relative h-64 py-4">
          {/* Pyramid levels from bottom to top */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-primary-light rounded-lg flex items-center justify-center text-white">
            <span className="text-sm font-medium">Levels 1-3: Knowledge, Understanding & Cognitive Skills</span>
          </div>
          
          <div className="absolute bottom-14 left-4 right-4 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="text-sm font-medium">Levels 4-6: Communication, Accountability & Digitalisation</span>
          </div>
          
          <div className="absolute bottom-28 left-8 right-8 h-12 bg-secondary rounded-lg flex items-center justify-center text-white">
            <span className="text-sm font-medium">Level 7: Sustainability, Resilience and Ecological</span>
          </div>
          
          <div className="absolute bottom-42 left-12 right-12 h-12 bg-accent rounded-lg flex items-center justify-center text-white">
            <span className="text-sm font-medium">Level 8: Reflective, Creativity & Innovative Skills</span>
          </div>
          
          <div className="absolute bottom-56 left-16 right-16 h-12 bg-neutral-700 rounded-lg flex items-center justify-center text-white">
            <span className="text-sm font-medium">Level 9: Futuristic/Genius Skills</span>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3">QAQF Characteristics</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QAQFCharacteristics.map((characteristic) => (
              <div 
                key={characteristic.id}
                className={cn(
                  "characteristic-badge px-3 py-2 rounded-md flex items-center relative",
                  characteristic.category === "foundation" ? "text-primary" :
                  characteristic.category === "intermediate" ? "text-secondary" : "text-accent"
                )}
              >
                <span className="material-icons text-sm mr-2">{characteristic.icon}</span>
                <span className="text-xs font-medium">{characteristic.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QAQFFramework;
