import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { QAQFLevelCategories, getCharacteristicsByCategory } from "../../lib/qaqf";
import { cn } from "../../lib/utils";

const QAQFLevels: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">QAQF Levels</h3>
        <Button variant="link" className="text-primary text-sm">View all levels</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(QAQFLevelCategories).map((category: { levels: number[]; name: string; color: string; description?: string }, index: number) => (
          <Card key={index} className="overflow-hidden qaqf-level">
            <div className={`h-1 bg-${category.color}`}></div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Levels {category.levels[0]}-{category.levels[category.levels.length - 1]}</h4>
                <Badge variant={category.color as any}>{category.name}</Badge>
              </div>
              <p className="text-sm text-neutral-600 mt-2">{category.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {getCharacteristicsByCategory(category.name.toLowerCase()).map((char, idx) => (
                  <span 
                    key={idx} 
                    className={cn(
                      "characteristic-badge px-2 py-1 rounded-md text-xs",
                      `text-${category.color}`
                    )}
                  >
                    {char.name.split(' ')[0]}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QAQFLevels;
