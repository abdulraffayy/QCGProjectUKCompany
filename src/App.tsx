import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ToastContainer } from 'react-toastify';
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
import Rafay from "./pages/Rafay";
import CourseGeneratorPlatform from "./pages/CourseGeneratorPlatform";
import { WizardPage } from "./pages/WizardPage";
import { courseTypes } from "./types/courseTypes";

import Dummy from "./pages/Dummy";



// Wrapper component to handle route props for Rafay
const RafayWrapper = () => <Rafay />;

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
        <Route path="/" component={() => <Redirect to="/login" />} />
      </Switch>
    );
  }
  return (
    <Switch>
      
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Layout>
        <Switch>
          <Route path="/" component={() => <Redirect to="/dashboard" />} />
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
          <Route path="/rafay" component={RafayWrapper} />
          <Route path="/course-generator" component={CourseGeneratorPlatform} />
          <Route path="/dummylesson" component={Dummy} />

          <Route
            path="/course-generator/wizard/:type"
            component={({ params }: any) => {
              const type = params.type as keyof typeof courseTypes[number] | string;
              const found = courseTypes.find((c) => c.id === type);
              if (!found) {
                return <Redirect to="/course-generator" />;
              }
              return (
                <WizardPage
                  courseType={found}
                  onBackToSelection={() => (window.location.href = "/course-generator")}
                  onCreateAnother={() => (window.location.href = "/course-generator")}
                />
              );
            }}
          />

          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Switch>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <ToastContainer />
          <AuthenticatedRoutes />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
