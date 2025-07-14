import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, TrendingUp, Clock } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  category: string;
}

interface CryptoEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  location: string;
  url: string;
  category: string;
}

const StaticNewsFeed = () => {
  // Static news data for the static website
  // Static news data that loads immediately
  const newsData: NewsItem[] = [
    {
      id: "1",
      title: "Bitcoin Price Analysis: Bulls Target $125,000 Resistance",
      summary: "Technical analysis suggests Bitcoin is consolidating before the next major move higher as institutional adoption continues.",
      url: "https://coindesk.com",
      publishedAt: new Date().toISOString(),
      source: "CoinDesk",
      category: "Analysis"
    },
    {
      id: "2", 
      title: "Federal Reserve Maintains Current Interest Rate Policy",
      summary: "The Fed continues its measured approach to monetary policy amid Bitcoin's strong performance and growing institutional interest.",
      url: "https://reuters.com",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: "Reuters",
      category: "Markets"
    },
    {
      id: "3",
      title: "Bitcoin Network Hash Rate Reaches New All-Time High",
      summary: "Mining security continues to strengthen as hash rate climbs above 900 EH/s, indicating robust network health.",
      url: "https://bitcoin.com",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: "Bitcoin.com",
      category: "Network"
    },
    {
      id: "4",
      title: "Corporate Bitcoin Adoption Accelerates in 2025",
      summary: "More companies are adding Bitcoin to their treasury reserves as a hedge against inflation and currency debasement.",
      url: "https://cointelegraph.com",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: "Cointelegraph",
      category: "Adoption"
    },
    {
      id: "5",
      title: "Lightning Network Adoption Surges with New Integrations",
      summary: "Major platforms are integrating Lightning Network for instant Bitcoin payments, improving user experience.",
      url: "https://bitcoinmagazine.com",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      source: "Bitcoin Magazine",
      category: "Technology"
    }
  ];

  const eventsData: CryptoEvent[] = [
    {
      id: "1",
      title: "Bitcoin 2025 Conference",
      description: "The largest Bitcoin conference bringing together industry leaders, developers, and enthusiasts.",
      startDate: "2025-07-25",
      location: "Miami, FL",
      url: "https://bitcoin2025.com",
      category: "conference"
    },
    {
      id: "2",
      title: "Advancing Bitcoin Workshop",
      description: "Technical workshop focused on Bitcoin development and protocol improvements.",
      startDate: "2025-08-15",
      location: "London, UK", 
      url: "https://advancingbitcoin.com",
      category: "workshop"
    },
    {
      id: "3",
      title: "Bitcoin Mining Summit",
      description: "Conference dedicated to Bitcoin mining technology, sustainability, and economics.",
      startDate: "2025-09-10",
      location: "Austin, TX",
      url: "https://bitcoinminingsummit.com", 
      category: "conference"
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilEvent = (eventDate: string): string => {
    const now = new Date();
    const event = new Date(eventDate);
    const timeDiff = event.getTime() - now.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30)} months`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Analysis': 'bg-blue-500/20 text-blue-500',
      'Markets': 'bg-green-500/20 text-green-500',
      'Network': 'bg-purple-500/20 text-purple-500',
      'Adoption': 'bg-orange-500/20 text-orange-500',
      'Technology': 'bg-indigo-500/20 text-indigo-500'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bitcoin News</h1>
          <p className="text-muted-foreground">Stay updated with the latest Bitcoin developments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main News Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Latest News</span>
          </h2>
          
          {newsData.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight hover:text-primary">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-2">
                        <span>{article.title}</span>
                        <ExternalLink className="h-4 w-4 mt-1 text-muted-foreground" />
                      </a>
                    </CardTitle>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge variant="outline" className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{article.source}</span>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {article.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventsData.map((event) => (
                <div key={event.id} className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center space-x-1">
                          <span>{event.title}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{event.location}</span>
                        <Badge variant="outline" className="text-xs">
                          {getDaysUntilEvent(event.startDate)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bitcoin Price</span>
                <span className="font-semibold">$120,154</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">24h Change</span>
                <span className="font-semibold text-green-500">+2.34%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Market Cap</span>
                <span className="font-semibold">$2.4T</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fear & Greed</span>
                <span className="font-semibold">74 (Greed)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaticNewsFeed;