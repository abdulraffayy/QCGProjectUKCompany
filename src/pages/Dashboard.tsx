import { useQuery } from "@tanstack/react-query";
import { Content, Activity } from "shared/schema";

import StatCard from "../components/dashboard/StatCard";
import QAQFFramework from "../components/dashboard/QAQFFramework";
import VerificationStatus from "../components/dashboard/VerificationStatus";
import RecentContent from "../components/dashboard/RecentContent";
import QAQFLevels from "../components/dashboard/QAQFLevels";
import VideoGeneratorSummary from "../components/dashboard/VideoGeneratorSummary";
import RecentActivity from "../components/activity/RecentActivity";
import ContentGeneratorSummary from "../components/dashboard/ContentGeneratorSummary";
import VerificationPanel from "../components/verification/VerificationPanel";


// Define the stats interface for type safety
interface DashboardStats {
  contentCount: number;
  verifiedContentCount: number;
  pendingVerificationCount: number;
  videoCount: number;
}

const Dashboard: React.FC = () => {
  // Dashboard stats query
  const { data: stats = { 
    contentCount: 0, 
    verifiedContentCount: 0, 
    pendingVerificationCount: 0, 
    videoCount: 0 
  } as DashboardStats } = useQuery<DashboardStats>({
      queryKey: ['/api/dashboard/stats'],
  });

  // Recent content query
  const { data: contents = [] as Content[], isLoading: isLoadingContents } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });

  // Activities query
  const { data: activities = [] as Activity[], isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  const verificationStatuses = [
    { status: "Verified", color: "success", count: stats.verifiedContentCount },
    { status: "Pending", color: "warning", count: stats.pendingVerificationCount },
    { status: "Rejected", color: "error", count: 26 },
    { status: "In Review", color: "info", count: 15 }
  ];

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Academic Content Dashboard</h2>
            <p className="text-neutral-600 mt-1">Generate, verify, and assess academic content using the QAQF framework</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Content Generated" 
          value={stats.contentCount}
          icon="description"
          iconBgColor="bg-primary-light bg-opacity-20"
          iconColor="text-primary"
          trend={{ direction: "up", value: "12% increase" }}
        />
        
        <StatCard 
          title="Verified Content" 
          value={stats.verifiedContentCount}
          icon="verified"
          iconBgColor="bg-success bg-opacity-20"
          iconColor="text-success"
          trend={{ direction: "up", value: "8% increase" }}
        />
        
        <StatCard 
          title="Pending Verification" 
          value={stats.pendingVerificationCount}
          icon="pending_actions"
          iconBgColor="bg-warning bg-opacity-20"
          iconColor="text-warning"
          trend={{ direction: "neutral", value: "12 urgent" }}
        />
        
        <StatCard 
          title="Videos Created" 
          value={stats.videoCount}
          icon="movie"
          iconBgColor="bg-accent bg-opacity-20"
          iconColor="text-accent"
          trend={{ direction: "up", value: "15% increase" }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 lg:col-span-2">
          <QAQFFramework />
        </div>
        
        <VerificationStatus 
          statuses={verificationStatuses}
          completionPercentage={69}
        />
      </div>
      
      <RecentContent 
        contents={contents}
        isLoading={isLoadingContents}
      />
      
      <QAQFLevels />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ContentGeneratorSummary />
        <VerificationPanel 
          pendingContents={contents.filter((c: any) => c.verification_status === "pending")}
          isLoading={isLoadingContents}
        />
      </div>
      
      <VideoGeneratorSummary />
      
      <RecentActivity 
        activities={activities}
        isLoading={isLoadingActivities}
      />
    </>
  );
};

export default Dashboard;
