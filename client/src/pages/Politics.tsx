import { Helmet } from "react-helmet-async";
import CongressionalCryptoTracker from "@/components/CongressionalCryptoTracker";

const Politics = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Helmet>
        <title>Politics & Bitcoin - Congressional Crypto Trading | BitcoinHub</title>
        <meta name="description" content="Track Congressional crypto trading activity, political Bitcoin trends, and how politicians' trades correlate with crypto markets and policy decisions." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Politics & Bitcoin
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Monitor Congressional crypto trading activity and analyze how political decisions impact Bitcoin markets. 
            Track when politicians buy or sell crypto-related stocks before major announcements or policy changes.
          </p>
        </div>
        
        <CongressionalCryptoTracker />
      </div>
    </div>
  );
};

export default Politics;