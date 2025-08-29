import { BullMarketIndicators } from "@/components/BullMarketIndicators";

const TradingIndicators = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-muted/20 pb-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-foreground">Bull Market Peak Indicators</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          30 key indicators from CoinGlass to help identify Bitcoin bull market peaks. Data refreshes every 5 minutes with real-time analysis.
        </p>
      </header>
      
      {/* Bull Market Peak Indicators */}
      <BullMarketIndicators />
    </div>
  );
};

export default TradingIndicators;