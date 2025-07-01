import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Units from "@/pages/units";
import Assignments from "@/pages/assignments";
import StudyPlan from "@/pages/study-plan";
import AIChat from "@/pages/ai-chat";
import LoadingScreen from "@/components/loading-screen";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/units" component={Units} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/study-plan" component={StudyPlan} />
      <Route path="/ai-chat" component={AIChat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading time for the page flip animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
