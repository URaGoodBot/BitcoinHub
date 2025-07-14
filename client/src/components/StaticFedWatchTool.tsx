import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, TrendingUp, RefreshCw } from "lucide-react";

const StaticFedWatchTool = () => {
  // Static Fed Watch data
  const fedData = {
    currentRate: "4.33%",
    nextMeeting: "January 29, 2025",
    probabilities: [
      { rate: "4.25-4.50%", probability: 75, label: "Hold" },
      { rate: "4.00-4.25%", probability: 20, label: "Cut 25bp" },
      { rate: "4.50-4.75%", probability: 5, label: "Hike 25bp" }
    ],
    futureOutlook: {
      oneWeek: { noChange: 85, cut: 12, hike: 3 },
      oneMonth: { noChange: 70, cut: 25, hike: 5 }
    },
    lastUpdated: new Date().toLocaleString()
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Card className="bg-card border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground">Fed Watch Tool</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Current Rate</span>
            </div>
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{fedData.currentRate}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Next Meeting</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fedData.nextMeeting}</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Rate Probabilities</h4>
            {fedData.probabilities.map((prob, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-foreground">{prob.rate}</span>
                  <span className="text-xs text-muted-foreground">{prob.probability}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${prob.probability}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">{prob.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-muted">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Future Outlook</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-medium">1 Week</p>
                <p>Hold: {fedData.futureOutlook.oneWeek.noChange}%</p>
                <p>Cut: {fedData.futureOutlook.oneWeek.cut}%</p>
                <p>Hike: {fedData.futureOutlook.oneWeek.hike}%</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">1 Month</p>
                <p>Hold: {fedData.futureOutlook.oneMonth.noChange}%</p>
                <p>Cut: {fedData.futureOutlook.oneMonth.cut}%</p>
                <p>Hike: {fedData.futureOutlook.oneMonth.hike}%</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Last updated: {fedData.lastUpdated}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticFedWatchTool;