import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Learn from "@/pages/Learn";
import NewsFeed from "@/pages/NewsFeed";
import WebResources from "@/pages/WebResources";
import Legislation from "@/pages/Legislation";
import TradingIndicators from "@/pages/TradingIndicators";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/news" component={NewsFeed} />
        <Route path="/learn" component={Learn} />
        <Route path="/web-resources" component={WebResources} />
        <Route path="/legislation" component={Legislation} />
        <Route path="/indicators" component={TradingIndicators} />
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
