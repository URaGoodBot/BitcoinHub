import { BullMarketIndicators } from "@/components/BullMarketIndicators";

const TradingIndicators = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">

      
      {/* Bull Market Peak Indicators */}
      <BullMarketIndicators />
    </div>
  );
};

export default TradingIndicators;