import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";
import Layout from "./components/layout/Layout";

import UnifiedContentGenerator from "./pages/UnifiedContentGenerator";
import VideoGenerator from "./pages/VideoGenerator";
import MyContent from "./pages/MyContent";
import Verification from "./pages/Verification";
import Moderation from "./pages/Moderation";
import Assessment from "./pages/Assessment";
import AssessmentInProgress from "./pages/AssessmentInProgress";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import LessonPlan from "./pages/LessonPlan";
import StudyMaterial from "./pages/StudyMaterial";
import QAQFFramework from "./pages/QAQFFramework";
import QAQFAdmin from "./pages/QAQFAdmin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";

function AuthenticatedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route>{() => {
          window.location.replace('/login');
          return null;
        }}</Route>
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/content-generator" component={UnifiedContentGenerator} />
        <Route path="/ai-content-studio" component={UnifiedContentGenerator} />
        <Route path="/processing-center" component={UnifiedContentGenerator} />
        <Route path="/video-generator" component={VideoGenerator} />
        <Route path="/my-content" component={MyContent} />
        <Route path="/lesson-plan" component={LessonPlan} />
        <Route path="/study-material" component={StudyMaterial} />
        <Route path="/qaqf-framework" component={QAQFFramework} />
        <Route path="/qaqf-admin" component={QAQFAdmin} />
        <Route path="/verification" component={Verification} />
        <Route path="/moderation" component={Moderation} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/assessment-in-progress" component={AssessmentInProgress} />
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AuthenticatedRoutes />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
