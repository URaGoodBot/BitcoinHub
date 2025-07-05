import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, X, TrendingUp, TrendingDown } from "lucide-react";

const PriceAlertsWidget = () => {
  const [newAlert, setNewAlert] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Fetch current Bitcoin price for context
  const { data: bitcoinData } = useQuery({
    queryKey: ["/api/bitcoin/market-data"],
    refetchInterval: 60000,
  });
  
  const currentPrice = (bitcoinData as any)?.current_price?.usd || 108000;
  
  // Mock alerts for demonstration - in production, these would come from user's saved alerts
  const alerts = [
    { id: 1, price: 110000, type: "above", isActive: true },
    { id: 2, price: 105000, type: "below", isActive: true },
    { id: 3, price: 115000, type: "above", isActive: false },
  ];

  const handleAddAlert = () => {
    if (newAlert && !isNaN(Number(newAlert))) {
      // In production, this would make an API call to save the alert
      console.log("Adding alert for price:", newAlert);
      setNewAlert("");
      setIsAdding(false);
    }
  };

  const getAlertStatus = (alertPrice: number, type: string) => {
    if (type === "above") {
      return currentPrice >= alertPrice ? "triggered" : "active";
    } else {
      return currentPrice <= alertPrice ? "triggered" : "active";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Price Alerts
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Alert price (USD)"
              value={newAlert}
              onChange={(e) => setNewAlert(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={handleAddAlert}>
              Add
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsAdding(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Current Price: ${currentPrice.toLocaleString()}
          </div>
          
          {alerts.map((alert) => {
            const status = getAlertStatus(alert.price, alert.type);
            const distance = ((alert.price - currentPrice) / currentPrice * 100);
            
            return (
              <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg border border-muted/20">
                <div className="flex items-center gap-2">
                  {alert.type === "above" ? (
                    <TrendingUp className="h-4 w-4 text-[hsl(var(--positive))]" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-[hsl(var(--negative))]" />
                  )}
                  <span className="text-sm font-mono">
                    ${alert.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({distance > 0 ? '+' : ''}{distance.toFixed(1)}%)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={status === "triggered" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {status === "triggered" ? "Triggered" : "Active"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {alerts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No price alerts set
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceAlertsWidget;