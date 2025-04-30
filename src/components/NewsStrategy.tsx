
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Newspaper, TrendingUp, AlertTriangle, ArrowRightCircle } from "lucide-react";

// Array of crypto news with sentiment and trading signals
const cryptoNews = [
  {
    id: 1,
    title: "Federal Reserve Increases Interest Rates by 50 Basis Points",
    source: "Bloomberg",
    time: "2 hours ago",
    sentiment: "negative",
    impact: "high",
    strategy: "Short BTC with tight stop-loss"
  },
  {
    id: 2,
    title: "BlackRock Bitcoin ETF Sees $500M Inflows in Single Day",
    source: "CoinDesk",
    time: "4 hours ago",
    sentiment: "positive",
    impact: "high",
    strategy: "Long BTC with 1:2 risk-reward ratio"
  },
  {
    id: 3,
    title: "Major Exchange Announces Enhanced Security Protocol",
    source: "Cointelegraph",
    time: "6 hours ago",
    sentiment: "positive",
    impact: "medium",
    strategy: "Hold current positions"
  },
  {
    id: 4,
    title: "Mining Difficulty Increases 3.4% in Latest Adjustment",
    source: "Bitcoin Magazine",
    time: "8 hours ago",
    sentiment: "neutral",
    impact: "low",
    strategy: "No action recommended"
  },
  {
    id: 5,
    title: "South Korea Proposes New Crypto Tax Framework",
    source: "The Block",
    time: "12 hours ago",
    sentiment: "neutral",
    impact: "medium",
    strategy: "Reduce position size temporarily"
  }
];

// Sentiment colors
const sentimentColors = {
  positive: "bg-green-500/20 text-green-500",
  neutral: "bg-blue-500/20 text-blue-500",
  negative: "bg-red-500/20 text-red-500"
};

// Impact colors
const impactColors = {
  high: "bg-red-500/20 text-red-500",
  medium: "bg-yellow-500/20 text-yellow-500",
  low: "bg-blue-500/20 text-blue-500"
};

const NewsStrategy = () => {
  const [activeTab, setActiveTab] = useState("latest");
  const [newsData, setNewsData] = useState(cryptoNews);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate fetching news data
  const refreshNewsData = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, we would fetch from news APIs
      console.log(`[${new Date().toLocaleTimeString()}] INFO    Fetching latest crypto news and sentiment analysis`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just shuffle our existing news
      const shuffled = [...cryptoNews]
        .sort(() => Math.random() - 0.5)
        .map(item => ({...item, time: `${Math.floor(Math.random() * 6) + 1} hours ago`}));
      
      setNewsData(shuffled);
      setLastUpdate(new Date());
      console.log(`[${new Date().toLocaleTimeString()}] INFO    News data updated with sentiment analysis`);
    } catch (error) {
      console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to update news data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    refreshNewsData();
    
    // Refresh news every 30 minutes
    const intervalId = setInterval(refreshNewsData, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className="bg-dark-card border-dark-border mb-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium flex items-center">
          <Newspaper className="w-5 h-5 mr-2 text-yellow-400" />
          News-Based Trading Signals
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshNewsData} 
            disabled={isLoading}
            className="text-xs border-dark-border"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="latest" onValueChange={setActiveTab}>
          <TabsList className="bg-dark-border/20 mb-4">
            <TabsTrigger value="latest">Latest News</TabsTrigger>
            <TabsTrigger value="high-impact">High Impact</TabsTrigger>
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsData
                .filter(item => {
                  if (activeTab === "high-impact") return item.impact === "high";
                  if (activeTab === "signals") return item.sentiment !== "neutral";
                  return true;
                })
                .map(item => (
                  <div key={item.id} className="border border-dark-border rounded-md p-3 bg-dark-border/10 hover:bg-dark-border/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge className={sentimentColors[item.sentiment]}>
                          {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                        </Badge>
                        <Badge className={impactColors[item.impact]}>
                          {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">Source: {item.source}</p>
                    
                    <div className="mt-3 pt-2 border-t border-dark-border flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-blue-400" />
                        <span className="text-xs">Signal:</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        item.strategy.toLowerCase().includes('long') 
                          ? 'text-green-400' 
                          : item.strategy.toLowerCase().includes('short')
                            ? 'text-red-400'
                            : 'text-blue-400'
                      }`}>
                        {item.strategy}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            
            {activeTab === "signals" && (
              <div className="border border-dark-border rounded-md p-3 bg-dark-border/10 mt-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 mr-1 text-yellow-400" />
                  <h3 className="text-sm font-medium">News-Based Trading Strategy</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  This strategy analyzes news sentiment and market impact to generate trading signals. 
                  High-impact positive news generates long signals, while high-impact negative news generates short signals.
                  Combined with technical indicators, this can improve strategy performance.
                </p>
                <Button variant="outline" size="sm" className="mt-3 text-xs border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
                  <ArrowRightCircle className="w-3 h-3 mr-1" /> Enable news-based trading signals
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NewsStrategy;

