import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import StaticDashboard from "@/pages/StaticDashboard";
import Learn from "@/pages/Learn";
import StaticNewsFeed from "@/pages/StaticNewsFeed";
import WebResources from "@/pages/WebResources";
import StaticLegislation from "@/pages/StaticLegislation";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={StaticDashboard} />
        <Route path="/news" component={StaticNewsFeed} />
        <Route path="/learn" component={Learn} />
        <Route path="/web-resources" component={WebResources} />
        <Route path="/legislation" component={StaticLegislation} />
        <Route path="/admin" component={Admin} />
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
