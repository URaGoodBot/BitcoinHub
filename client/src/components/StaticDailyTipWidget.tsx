import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

const StaticDailyTipWidget = () => {
  // Static daily tip data
  const tip = {
    id: "tip_1",
    title: "Dollar Cost Averaging (DCA) Strategy",
    content: "Consider implementing a Dollar Cost Averaging strategy by purchasing a fixed dollar amount of Bitcoin at regular intervals, regardless of price. This approach can help reduce the impact of volatility and remove the stress of trying to time the market perfectly. Many successful Bitcoin investors use DCA to build their position over time.",
    category: "Investment Strategy",
    difficulty: "Beginner",
    createdAt: new Date().toISOString()
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>Bitcoin Tip of the Day</span>
          <Badge variant="outline">{tip.category}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">{tip.title}</h4>
          <p className="text-muted-foreground leading-relaxed">
            {tip.content}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              {tip.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated daily with new insights
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticDailyTipWidget;