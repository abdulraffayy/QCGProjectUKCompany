import { cn } from "../lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend
}) => {
  const getTrendColor = (direction: "up" | "down" | "neutral") => {
    switch (direction) {
      case "up":
        return "text-success";
      case "down":
        return "text-error";
      case "neutral":
        return "text-warning";
      default:
        return "text-neutral-500";
    }
  };

  const getTrendIcon = (direction: "up" | "down" | "neutral") => {
    switch (direction) {
      case "up":
        return "arrow_upward";
      case "down":
        return "arrow_downward";
      case "neutral":
        return "priority_high";
      default:
        return "";
    }
  };

  return (
    <div className="dashboard-card bg-white rounded-lg shadow p-6 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <p className={cn("text-sm flex items-center mt-1", getTrendColor(trend.direction))}>
              <span className="material-icons text-sm mr-1">{getTrendIcon(trend.direction)}</span>
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBgColor)}>
          <span className={cn("material-icons", iconColor)}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
