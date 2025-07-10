import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Learn from "@/pages/Learn";
import MemeCommunity from "@/pages/MemeCommunity";
import Portfolio from "@/pages/Portfolio";
import NewsFeed from "@/pages/NewsFeed";
import WebResources from "@/pages/WebResources";
import NotFound from "@/pages/not-found";

function Router() {
  // Temporarily bypass authentication - show main app directly
  return (
    <Layout>
      <Switch>
        <Route path="/landing" component={Landing} />
        <Route path="/" component={Dashboard} />
        <Route path="/news" component={NewsFeed} />
        <Route path="/learn" component={Learn} />
        <Route path="/community" component={MemeCommunity} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/web-resources" component={WebResources} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
