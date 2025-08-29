import { CryptoIndicators } from "@/components/CryptoIndicators";

const TradingIndicators = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-muted/20 pb-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-foreground">Bitcoin Trading Indicators</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Comprehensive AI-powered analysis of 30+ technical indicators with live Bitcoin data, price predictions, and market insights.
        </p>
      </header>
      
      {/* Cryptocurrency Trading Indicators */}
      <CryptoIndicators />
    </div>
  );
};

export default TradingIndicators;