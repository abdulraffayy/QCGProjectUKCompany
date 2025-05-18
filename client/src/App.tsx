import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import ContentGenerator from "@/pages/ContentGenerator";
import VideoGenerator from "@/pages/VideoGenerator";
import MyContent from "@/pages/MyContent";
import Verification from "@/pages/Verification";
import Moderation from "@/pages/Moderation";
import Assessment from "@/pages/Assessment";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import LessonPlan from "@/pages/LessonPlan";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/content-generator" component={ContentGenerator} />
        <Route path="/video-generator" component={VideoGenerator} />
        <Route path="/my-content" component={MyContent} />
        <Route path="/lesson-plan" component={LessonPlan} />
        <Route path="/verification" component={Verification} />
        <Route path="/moderation" component={Moderation} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
