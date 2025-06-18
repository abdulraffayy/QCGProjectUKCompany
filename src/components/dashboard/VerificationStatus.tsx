import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Link } from "wouter";

interface StatusItem {
  status: string;
  color: string;
  count: number;
}

interface VerificationStatusProps {
  statuses: StatusItem[];
  completionPercentage: number;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  statuses, 
  completionPercentage 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Verification Status</CardTitle>
        <Button variant="link" className="text-primary text-sm">View all</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((item, index) => (
            <div key={index} className="flex items-center text-sm">
              <div className={`w-3 h-3 rounded-full bg-${item.color} mr-3`}></div>
              <div className="flex-1">{item.status}</div>
              <div className="font-medium">{item.count}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Progress value={completionPercentage} className="h-2 w-full" />
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <div>0%</div>
            <div>{completionPercentage}% completed</div>
            <div>100%</div>
          </div>
        </div>
        
        <div className="mt-6 flex">
          <Link href="/verification">
            <Button className="flex-1 mr-2 text-sm font-medium">Verify Content</Button>
          </Link>
          <Link href="/moderation">
            <Button variant="outline" className="flex-1 text-sm font-medium">Moderate</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
