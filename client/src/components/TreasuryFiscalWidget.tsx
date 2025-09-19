import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, RefreshCw, Users, Calculator } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface TreasuryFiscalData {
  debtToPenny: {
    totalDebt: number;
    publicDebt: number;
    intergovernmentalHoldings: number;
    dateOfData: string;
    lastUpdated: string;
  };
  averageInterestRates: {
    totalInterestBearingDebt: number;
    weightedAverageRate: number;
    monthlyChange: number;
    yearOverYearChange: number;
    lastUpdated: string;
  };
  debtStatistics: {
    debtPerCitizen: number;
    debtPerTaxpayer: number;
    debtToGDP: number;
    dailyIncrease: number;
  };
}

const TreasuryFiscalWidget = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: fiscalData, isLoading, error } = useQuery<TreasuryFiscalData>({
    queryKey: ['/api/financial/treasury-fiscal'],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/financial/treasury-fiscal');
      if (!response.ok) {
        throw new Error('Failed to fetch Treasury Fiscal data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/financial/treasury-fiscal'], data);
      setIsRefreshing(false);
    },
    onError: () => setIsRefreshing(false)
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshMutation.mutate();
  };

  const formatCurrency = (amount: number, compact = false): string => {
    if (compact && amount >= 1e12) {
      return `$${(amount / 1e12).toFixed(1)}T`;
    } else if (compact && amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(1)}B`;
    } else if (compact && amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  if (isLoading) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading Treasury Fiscal data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !fiscalData) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load Treasury Fiscal data</p>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-500" />
            U.S. Treasury Fiscal Data
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated: {new Date().toLocaleTimeString()}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="refresh-treasury-fiscal"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* U.S. Debt Clock */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium mb-3 text-red-400">🚨 U.S. Debt to the Penny</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Public Debt Outstanding</p>
              <p className="text-2xl font-mono font-bold text-red-400" data-testid="total-debt">
                {formatCurrency(fiscalData.debtToPenny.totalDebt, true)}
              </p>
              <p className="text-xs text-muted-foreground">
                Growing by ~{formatCurrency(fiscalData.debtStatistics.dailyIncrease, true)} daily
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Public Debt</p>
                <p className="text-lg font-mono font-bold text-foreground">
                  {formatCurrency(fiscalData.debtToPenny.publicDebt, true)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Intragovernmental</p>
                <p className="text-lg font-mono font-bold text-foreground">
                  {formatCurrency(fiscalData.debtToPenny.intergovernmentalHoldings, true)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Debt Burden per Person */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium mb-3 text-orange-400 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Debt Burden per Person
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Per U.S. Citizen</p>
              <p className="text-xl font-mono font-bold text-foreground" data-testid="debt-per-citizen">
                {formatCurrency(fiscalData.debtStatistics.debtPerCitizen)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Per Taxpayer</p>
              <p className="text-xl font-mono font-bold text-foreground" data-testid="debt-per-taxpayer">
                {formatCurrency(fiscalData.debtStatistics.debtPerTaxpayer)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-orange-500/20">
            <p className="text-xs text-muted-foreground mb-1">Debt-to-GDP Ratio</p>
            <p className="text-lg font-mono font-bold text-orange-400">
              {fiscalData.debtStatistics.debtToGDP.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Average Interest Rates */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium mb-3 text-blue-400 flex items-center gap-1">
            <Calculator className="h-4 w-4" />
            Government Debt Interest Rates
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Weighted Average Interest Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-mono font-bold text-blue-400" data-testid="average-interest-rate">
                  {fiscalData.averageInterestRates.weightedAverageRate.toFixed(2)}%
                </p>
                <div className={`flex items-center text-sm ${
                  fiscalData.averageInterestRates.monthlyChange >= 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {fiscalData.averageInterestRates.monthlyChange >= 0 ? '+' : ''}{fiscalData.averageInterestRates.monthlyChange.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Interest-Bearing Debt</p>
              <p className="text-lg font-mono font-bold text-foreground">
                {formatCurrency(fiscalData.averageInterestRates.totalInterestBearingDebt, true)}
              </p>
            </div>
          </div>
        </div>

        {/* Bitcoin Context */}
        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            Bitcoin's fixed 21M supply contrasts sharply with unlimited government debt expansion. 
            Debt-to-GDP above 100% historically correlates with currency debasement.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Data from U.S. Treasury Bureau of the Fiscal Service • Last updated: {new Date(fiscalData.debtToPenny.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryFiscalWidget;