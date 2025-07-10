import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  // Temporarily show the main app directly while implementing authentication
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
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
