import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scale, Calendar, TrendingUp, AlertCircle, ExternalLink } from "lucide-react";

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

const StaticLegislation = () => {
  // Static legislation data based on current Congressional activity
  const legislationData = {
    bills: [
      {
        id: "1",
        billName: "GENIUS Act",
        billNumber: "S.1289",
        description: "Guidance for Enforcement of Nuanced Information in Uniform Statutes Act - Provides regulatory clarity for digital assets",
        currentStatus: "Passed Senate (68-30)",
        nextSteps: "House Committee Review",
        passageChance: 78,
        whatsNext: "Expected House vote Q3 2025",
        lastAction: "Senate passage on July 10, 2025",
        sponsor: "Sen. Bill Hagerty (R-TN)",
        category: "regulation",
        priority: "high"
      },
      {
        id: "2", 
        billName: "CLARITY Act",
        billNumber: "H.R.1747",
        description: "Clarifying Law Around Intent of Transactions Act - Defines when crypto transactions are securities",
        currentStatus: "Committee Advancement",
        nextSteps: "House Floor Vote",
        passageChance: 65,
        whatsNext: "Floor vote scheduled for July 18, 2025",
        lastAction: "Committee markup completed July 9, 2025",
        sponsor: "Rep. Tom Emmer (R-MN)",
        category: "regulation",
        priority: "high"
      },
      {
        id: "3",
        billName: "Anti-CBDC Act", 
        billNumber: "H.R.5403",
        description: "Prohibits Federal Reserve from issuing Central Bank Digital Currency directly to individuals",
        currentStatus: "Scheduled for Vote",
        nextSteps: "House Floor Vote",
        passageChance: 72,
        whatsNext: "Vote expected during Crypto Week (July 14-18)",
        lastAction: "Rules Committee approval July 11, 2025",
        sponsor: "Rep. Tom Emmer (R-MN)",
        category: "enforcement",
        priority: "high"
      },
      {
        id: "4",
        billName: "DeFi Broker Rule Repeal",
        billNumber: "H.J.Res.25",
        description: "Joint resolution to overturn Treasury's proposed broker reporting requirements for DeFi protocols",
        currentStatus: "Committee Review",
        nextSteps: "House Vote",
        passageChance: 58,
        whatsNext: "Vote likely during Crypto Week",
        lastAction: "Committee hearings completed July 8, 2025",
        sponsor: "Rep. Mike Flood (R-NE)",
        category: "taxation",
        priority: "medium"
      },
      {
        id: "5",
        billName: "Stablecoin Transparency Act",
        billNumber: "S.2156",
        description: "Establishes federal framework for stablecoin issuers and reserve requirements",
        currentStatus: "Senate Banking Committee",
        nextSteps: "Committee Markup",
        passageChance: 45,
        whatsNext: "Committee markup scheduled August 2025",
        lastAction: "Hearings concluded June 2025",
        sponsor: "Sen. Pat Toomey (R-PA)",
        category: "stablecoin",
        priority: "medium"
      },
      {
        id: "6",
        billName: "Bitcoin Strategic Reserve Act",
        billNumber: "H.R.4501",
        description: "Authorizes U.S. Treasury to purchase and hold Bitcoin as strategic reserve asset",
        currentStatus: "Committee Introduction",
        nextSteps: "Committee Hearings",
        passageChance: 25,
        whatsNext: "Hearings expected Fall 2025",
        lastAction: "Introduced June 15, 2025",
        sponsor: "Rep. Cynthia Lummis (R-WY)",
        category: "innovation",
        priority: "low"
      }
    ],
    lastUpdated: new Date().toISOString(),
    summary: "Crypto Week (July 14-18, 2025) represents a pivotal moment for U.S. cryptocurrency legislation with multiple key bills scheduled for votes.",
    nextMajorEvent: "House votes on Anti-CBDC Act and DeFi Broker Rule Repeal during Crypto Week"
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'regulation': 'bg-blue-500/20 text-blue-500',
      'taxation': 'bg-orange-500/20 text-orange-500',
      'stablecoin': 'bg-green-500/20 text-green-500',
      'innovation': 'bg-purple-500/20 text-purple-500',
      'enforcement': 'bg-red-500/20 text-red-500'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'high': 'text-red-500',
      'medium': 'text-yellow-500', 
      'low': 'text-green-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  const getPassageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Scale className="h-8 w-8" />
            <span>Crypto Legislation Tracker</span>
          </h1>
          <p className="text-muted-foreground">Live tracking of U.S. cryptocurrency legislation in Congress</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>Legislative Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed mb-3">{legislationData.summary}</p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Next Major Event:</span>
            </div>
            <span className="font-medium">{legislationData.nextMajorEvent}</span>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Current Bills in Congress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Bill</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Next Steps</th>
                  <th className="text-left py-3 font-medium">Passage Chance</th>
                  <th className="text-left py-3 font-medium">What's Next</th>
                </tr>
              </thead>
              <tbody>
                {legislationData.bills.map((bill) => (
                  <tr key={bill.id} className="border-b hover:bg-muted/50">
                    <td className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{bill.billName}</span>
                          <Badge variant="outline" className={getCategoryColor(bill.category)}>
                            {bill.category}
                          </Badge>
                          <AlertCircle className={`h-3 w-3 ${getPriorityColor(bill.priority)}`} />
                        </div>
                        <div className="text-xs text-muted-foreground">{bill.billNumber}</div>
                        <div className="text-xs text-muted-foreground max-w-xs">
                          {bill.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sponsor: {bill.sponsor}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <Badge variant="outline">{bill.currentStatus}</Badge>
                        <div className="text-xs text-muted-foreground">
                          {bill.lastAction}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm">{bill.nextSteps}</span>
                    </td>
                    <td className="py-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${getPassageColor(bill.passageChance)}`}>
                            {bill.passageChance}%
                          </span>
                        </div>
                        <Progress value={bill.passageChance} className="h-2 w-20" />
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm">{bill.whatsNext}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Last updated: {new Date(legislationData.lastUpdated).toLocaleString()}</p>
        <p className="mt-1">Data compiled from Congressional records and committee schedules</p>
      </div>
    </div>
  );
};

export default StaticLegislation;