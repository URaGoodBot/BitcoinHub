import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Learn from "@/pages/Learn";
import MemeCommunity from "@/pages/MemeCommunity";
import Portfolio from "@/pages/Portfolio";
import NewsFeed from "@/pages/NewsFeed";
import WebResources from "@/pages/WebResources";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  // Show loading state briefly while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Authentication pages - accessible to all */}
      <Route path="/login">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Login page coming soon...</div>
        </div>
      </Route>
      <Route path="/register">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Register page coming soon...</div>
        </div>
      </Route>
      
      {/* Main app */}
      {(!isAuthenticated && !isGuest) ? (
        <Route path="/" component={Landing} />
      ) : (
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/news" component={NewsFeed} />
          <Route path="/learn" component={Learn} />
          <Route path="/community" component={MemeCommunity} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/web-resources" component={WebResources} />
        </Layout>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
