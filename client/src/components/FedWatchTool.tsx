import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";

const FedWatchTool = () => {
  // Mock data based on the screenshot - in production this would come from CME API
  const fedData = {
    currentRate: "425-450",
    nextMeeting: "30 Jul 2025",
    probabilities: [
      { rate: "400-425", probability: 4.7, label: "Lower" },
      { rate: "425-450", probability: 95.3, label: "No Change (Current)" },
    ],
    futureOutlook: {
      oneWeek: { noChange: 81.4, cut: 18.6, hike: 0.0 },
      oneMonth: { noChange: 70.5, cut: 28.5, hike: 1.0 }
    }
  };

  return (
    <Card className="bg-card border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            CME Fed Watch Tool
          </h3>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Next Meeting: {fedData.nextMeeting}
          </div>
        </div>

        {/* Current Rate */}
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-1">Current Target Rate</p>
          <p className="text-2xl font-mono font-bold text-foreground">{fedData.currentRate} bps</p>
        </div>

        {/* Probability Chart */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Rate Probabilities for Next Meeting</h4>
          <div className="space-y-2">
            {fedData.probabilities.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-xs text-muted-foreground">
                  {item.rate}
                </div>
                <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      item.rate === "425-450" ? "bg-blue-500" : "bg-blue-300"
                    }`}
                    style={{ width: `${item.probability}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {item.probability}%
                  </span>
                </div>
                <div className="w-16 text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future Outlook */}
        <div>
          <h4 className="text-sm font-medium mb-3">Future Rate Expectations</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">1 Week Outlook</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>No Change</span>
                  <span className="font-mono">{fedData.futureOutlook.oneWeek.noChange}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Rate Cut</span>
                  <span className="font-mono text-green-600">{fedData.futureOutlook.oneWeek.cut}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">1 Month Outlook</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>No Change</span>
                  <span className="font-mono">{fedData.futureOutlook.oneMonth.noChange}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Rate Cut</span>
                  <span className="font-mono text-green-600">{fedData.futureOutlook.oneMonth.cut}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Rate Hike</span>
                  <span className="font-mono text-red-600">{fedData.futureOutlook.oneMonth.hike}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            Data from CME FedWatch Tool. Fed rate changes significantly impact Bitcoin markets through liquidity and risk appetite.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FedWatchTool;