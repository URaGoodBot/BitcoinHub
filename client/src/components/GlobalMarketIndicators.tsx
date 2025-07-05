import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Globe, Zap } from "lucide-react";

const GlobalMarketIndicators = () => {
  // These would come from backend APIs in production
  const indicators = [
    {
      title: "DXY (US Dollar Index)",
      value: "106.45",
      change: -0.12,
      description: "Strong dollar often inversely correlates with Bitcoin",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Gold (XAU/USD)",
      value: "$2,635",
      change: 0.8,
      description: "Digital gold vs traditional store of value",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      title: "SPX (S&P 500)",
      value: "5,995",
      change: 0.25,
      description: "Risk-on sentiment indicator for crypto markets",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: "VIX (Fear Index)",
      value: "14.2",
      change: -1.5,
      description: "Market volatility and fear indicator",
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Global Market Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((indicator, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                {indicator.icon}
                {indicator.title}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold">{indicator.value}</span>
                <div className={`flex items-center text-sm ${
                  indicator.change >= 0 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'
                }`}>
                  {indicator.change >= 0 ? 
                    <TrendingUp className="h-3 w-3 mr-1" /> : 
                    <TrendingDown className="h-3 w-3 mr-1" />
                  }
                  {Math.abs(indicator.change).toFixed(2)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{indicator.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalMarketIndicators;