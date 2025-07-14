import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import { getDailyTip } from "@/lib/api";

const DailyTipWidget = () => {
  const tip = getDailyTip();

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
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyTipWidget;