import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Scale, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { useState } from "react";

interface LegislationBill {
  id: string;
  billName: string;
  billNumber: string;
  description: string;
  currentStatus: string;
  nextSteps: string;
  passageChance: number;
  whatsNext: string;
  lastAction: string;
  sponsor: string;
  category: 'regulation' | 'taxation' | 'stablecoin' | 'innovation' | 'enforcement';
  priority: 'high' | 'medium' | 'low';
}

interface CryptoCatalyst {
  id: string;
  event: string;
  description: string;
  probability: number;
  nextSteps: string[];
  category: 'policy' | 'regulatory' | 'market' | 'legal' | 'defi' | 'etf';
  impact: 'high' | 'medium' | 'low';
  dueDate?: string;
}

interface CatalystsData {
  catalysts: CryptoCatalyst[];
  lastUpdated: string;
  marketImpact: string;
  riskFactors: string;
}

interface LegislationData {
  bills: LegislationBill[];
  lastUpdated: string;
  summary: string;
  nextMajorEvent: string;
}

const Legislation = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: legislationData, isLoading, error } = useQuery<LegislationData>({
    queryKey: ['/api/legislation'],
    refetchInterval: 24 * 60 * 60 * 1000, // Refetch every 24 hours
  });

  const { data: catalystsData } = useQuery<CatalystsData>({
    queryKey: ['/api/legislation/catalysts'],
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });

  const refreshCatalystsMutation = useMutation({
    mutationFn: async () => {
      setIsRefreshing(true);
      queryClient.removeQueries({ queryKey: ['/api/legislation/catalysts'] });
      const response = await fetch('/api/legislation/catalysts?refresh=true');
      if (!response.ok) {
        throw new Error('Failed to refresh catalysts data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/legislation/catalysts'], data);
      setIsRefreshing(false);
    },
    onError: (error) => {
      console.error('Error refreshing catalysts:', error);
      setIsRefreshing(false);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      setIsRefreshing(true);
      const response = await fetch('/api/legislation/refresh', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to refresh legislation data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/legislation'], data);
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    }
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'regulation': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'taxation': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'stablecoin': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'innovation': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'enforcement': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getChanceColor = (chance: number) => {
    if (chance >= 70) return 'text-green-600 font-bold';
    if (chance >= 40) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-muted-foreground">Loading legislation data...</h2>
            <p className="text-muted-foreground mt-2">Analyzing current crypto bills in Congress</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !legislationData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Failed to Load Legislation Data</h2>
              <p className="text-muted-foreground mb-4">Unable to fetch current crypto legislation status</p>
              <Button 
                onClick={() => refreshMutation.mutate()} 
                disabled={isRefreshing}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">US Crypto Legislation - September 2025</h1>
                <p className="text-muted-foreground">Track congressional bills affecting cryptocurrency with AI-powered updates</p>
              </div>
            </div>
            <Button 
              onClick={() => refreshMutation.mutate()} 
              disabled={isRefreshing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating with AI...' : 'Refresh with AI'}
            </Button>
          </div>

          {/* Summary Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Congressional Summary</h3>
                  <p className="text-muted-foreground">{legislationData.summary}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Next Major Event</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{legislationData.nextMajorEvent}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(legislationData.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Active Crypto Bills in Congress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-4 font-semibold">Bill</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Next Steps</th>
                    <th className="text-center p-4 font-semibold">Passage Chance</th>
                    <th className="text-left p-4 font-semibold">What's Next</th>
                  </tr>
                </thead>
                <tbody>
                  {legislationData.bills.map((bill, index) => (
                    <tr key={bill.id} className={`border-b hover:bg-muted/20 ${index % 2 === 0 ? 'bg-muted/5' : ''}`}>
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{bill.billName}</span>
                            <Badge className={getPriorityColor(bill.priority)}>
                              {bill.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">{bill.billNumber}</div>
                          <Badge variant="outline" className={getCategoryColor(bill.category)}>
                            {bill.category}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {bill.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sponsor: {bill.sponsor}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium text-foreground mb-1">{bill.currentStatus}</div>
                          <div className="text-xs text-muted-foreground">{bill.lastAction}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground max-w-xs">
                          {bill.nextSteps}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`text-2xl font-bold ${getChanceColor(bill.passageChance)}`}>
                          {bill.passageChance}%
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground max-w-xs">
                          {bill.whatsNext}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            Legislative data is analyzed daily using Grok AI and publicly available congressional records. 
            Passage probabilities are estimates based on current political climate and bill progress. 
            For official information, consult Congress.gov.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Legislation;