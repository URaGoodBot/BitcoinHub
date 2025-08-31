import { BullMarketIndicators } from "@/components/BullMarketIndicators";

const TradingIndicators = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-muted/20 pb-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-foreground">Bull Market Peak Indicators</h1>
        </div>

      </header>
      
      {/* Bull Market Peak Indicators */}
      <BullMarketIndicators />
    </div>
  );
};

export default TradingIndicators;