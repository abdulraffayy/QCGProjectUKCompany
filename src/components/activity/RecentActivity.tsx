import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Activity } from "shared/schema";

interface RecentActivityProps {
  activities: Activity[];
  isLoading: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, isLoading }) => {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "verified":
        return "verified";
      case "created":
        return "add";
      case "rejected":
        return "feedback";
      case "updated":
        return "edit";
      default:
        return action;
    }
  };

  const getActivityIconColor = (action: string) => {
    switch (action) {
      case "verified":
        return "text-primary bg-primary-light bg-opacity-20";
      case "created":
        return "text-secondary bg-secondary bg-opacity-20";
      case "rejected":
        return "text-error bg-error bg-opacity-20";
      case "updated":
        return "text-amber-500 bg-amber-100";
      default:
        return "text-accent bg-accent bg-opacity-20";
    }
  };

  const formatActivityTime = (date: Date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diff = now.getTime() - activityDate.getTime();
    const diffInHours = diff / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return `Yesterday at ${activityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow p-6">
      <CardHeader className="flex flex-row items-center justify-between px-0 pb-2 pt-0">
        <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
        <Button variant="link" className="text-primary text-sm">View all</Button>
      </CardHeader>
      
      <CardContent className="px-0 pt-0">
        {isLoading ? (
          <div className="flex justify-center py-8">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">No recent activities</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${getActivityIconColor(activity.action)}`}>
                  <span className="material-icons text-sm">{getActivityIcon(activity.action)}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    <span className="font-medium">{activity.details?.user?.name || "A user"}</span> {activity.action} {activity.entity_type} <span className="text-primary">{activity.details?.title || ""}</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{formatActivityTime(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
