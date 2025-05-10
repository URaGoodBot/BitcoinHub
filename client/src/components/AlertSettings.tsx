import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PriceAlert } from "@/lib/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const AlertSettings = () => {
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [price, setPrice] = useState<string>('');
  const { toast } = useToast();
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchOnWindowFocus: false,
  });
  
  const createAlertMutation = useMutation({
    mutationFn: async (data: { type: 'above' | 'below', price: number }) => {
      const response = await apiRequest('POST', '/api/alerts', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert created",
        description: `You will be notified when Bitcoin price goes ${alertType} ${formatCurrency(parseFloat(price))}`,
      });
      setPrice('');
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
  
  const handleCreateAlert = () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    
    createAlertMutation.mutate({ type: alertType, price: priceValue });
  };
  
  return (
    <Card className="bg-card shadow-lg overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-muted/50">
        <CardTitle className="text-lg font-semibold">Price Alerts</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {isLoading ? (
          <AlertSettingsSkeleton />
        ) : (
          <>
            {/* Active alerts */}
            {(alerts as PriceAlert[])?.map((alert) => (
              <div key={alert.id} className="bg-muted p-3 rounded-md flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    {alert.type === 'above' ? (
                      <ArrowUp className="text-[hsl(var(--positive))] h-4 w-4 mr-2" />
                    ) : (
                      <ArrowDown className="text-[hsl(var(--negative))] h-4 w-4 mr-2" />
                    )}
                    <p className="text-sm font-medium text-foreground">
                      {alert.type === 'above' ? 'Above' : 'Below'} {formatCurrency(alert.price)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {formatRelativeTime(alert.created)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground h-8 w-8"
                  onClick={() => deleteAlertMutation.mutate(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* New alert form */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Set New Alert
              </label>
              <div className="flex space-x-2">
                <Select 
                  value={alertType} 
                  onValueChange={(value) => setAlertType(value as 'above' | 'below')}
                >
                  <SelectTrigger className="flex-1 bg-muted">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="text"
                    className="bg-muted pl-8"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="mt-3 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleCreateAlert}
                disabled={createAlertMutation.isPending}
              >
                {createAlertMutation.isPending ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const AlertSettingsSkeleton = () => (
  <>
    {[1, 2].map((i) => (
      <div key={i} className="bg-muted p-3 rounded-md flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-3 w-32 mt-1" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))}
    
    <div className="mt-6">
      <Skeleton className="h-5 w-24 mb-2" />
      <div className="flex space-x-2">
        <Skeleton className="flex-1 h-10 rounded-md" />
        <Skeleton className="flex-1 h-10 rounded-md" />
      </div>
      <Skeleton className="mt-3 w-full h-10 rounded-md" />
    </div>
  </>
);

export default AlertSettings;
