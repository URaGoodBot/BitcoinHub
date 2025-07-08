import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PriceAlert } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const PriceAlertsWidget = () => {
  const [newAlert, setNewAlert] = useState("");
  const [alertType, setAlertType] = useState<"above" | "below">("above");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  
  // Fetch current Bitcoin price for context
  const { data: bitcoinData } = useQuery({
    queryKey: ["/api/bitcoin/market-data"],
    refetchInterval: 60000,
  });
  
  // Fetch user's price alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchOnWindowFocus: false,
  });
  
  const currentPrice = (bitcoinData as any)?.current_price?.usd || 108000;
  
  const createAlertMutation = useMutation({
    mutationFn: async (data: { type: 'above' | 'below', price: number }) => {
      const response = await apiRequest('POST', '/api/alerts', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert created",
        description: `You will be notified when Bitcoin price goes ${alertType} $${newAlert}`,
      });
      setNewAlert("");
      setIsAdding(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create alert",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await apiRequest('DELETE', `/api/alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert removed",
        description: "Price alert has been removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove alert",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddAlert = () => {
    const priceValue = parseFloat(newAlert);
    if (!newAlert || isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    
    createAlertMutation.mutate({ type: alertType, price: priceValue });
  };

  const handleDeleteAlert = (alertId: string) => {
    deleteAlertMutation.mutate(alertId);
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (alert.isTriggered) return "triggered";
    
    if (alert.type === "above") {
      return currentPrice >= alert.price ? "triggered" : "active";
    } else {
      return currentPrice <= alert.price ? "triggered" : "active";
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
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as "above" | "below")}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <Input
                type="number"
                placeholder="Alert price (USD)"
                value={newAlert}
                onChange={(e) => setNewAlert(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleAddAlert}
                disabled={createAlertMutation.isPending}
              >
                {createAlertMutation.isPending ? "Adding..." : "Add Alert"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Current Price: ${currentPrice.toLocaleString()}
          </div>
          
          {alertsLoading ? (
            <div className="space-y-2">
              <div className="h-12 bg-muted rounded-lg animate-pulse" />
              <div className="h-12 bg-muted rounded-lg animate-pulse" />
            </div>
          ) : (
            (alerts as PriceAlert[]).map((alert) => {
              const status = getAlertStatus(alert);
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteAlert(alert.id)}
                    disabled={deleteAlertMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
          )}
          
          {!alertsLoading && (alerts as PriceAlert[]).length === 0 && (
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