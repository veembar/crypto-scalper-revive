
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Newspaper, TrendingUp, AlertTriangle, ArrowRightCircle } from "lucide-react";
import { tradingService } from "@/services/tradingService";
import { toast } from "sonner";

const MAX_RETRIES = 3;

// News-based trading strategy integration
const NewsStrategy = () => {
  const [activeTab, setActiveTab] = useState("latest");
  const [newsData, setNewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [newsStrategyEnabled, setNewsStrategyEnabled] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Fetch crypto news from various sources
  const fetchNewsData = async () => {
    setIsLoading(true);
    
    try {
      console.log(`[${new Date().toLocaleTimeString()}] INFO    Fetching latest crypto news and sentiment analysis`);
      
      // Try multiple sources for news data (in reality, these would call different APIs)
      let newsResponse;
      
      try {
        // Try CryptoCompare News API (simulated)
        console.log(`[${new Date().toLocaleTimeString()}] API     Fetching news from CryptoCompare`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, we would fetch from actual news APIs
        newsResponse = await fetchSimulatedNewsData();
        console.log(`[${new Date().toLocaleTimeString()}] API     Successfully fetched ${newsResponse.length} news items`);
      } catch (error) {
        // If first source fails, try alternate source
        console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to fetch news from primary source: ${error.message}`);
        
        // Try CoinDesk News API (simulated)
        console.log(`[${new Date().toLocaleTimeString()}] API     Fetching news from CoinDesk (backup source)`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        newsResponse = await fetchSimulatedNewsData();
        console.log(`[${new Date().toLocaleTimeString()}] API     Successfully fetched ${newsResponse.length} news items from backup source`);
      }
      
      // Convert news to trading signals through sentiment analysis
      console.log(`[${new Date().toLocaleTimeString()}] INFO    Analyzing sentiment for ${newsResponse.length} news items`);
      const analyzedNews = await analyzeSentiment(newsResponse);
      
      setNewsData(analyzedNews);
      setLastUpdate(new Date());
      setRetryCount(0);
      
      // If news strategy is enabled, process high-impact news
      if (newsStrategyEnabled) {
        processNewsSignals(analyzedNews);
      }
    } catch (error) {
      console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to update news data: ${error.message}`);
      
      // Implement retry mechanism
      if (retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);
        console.log(`[${new Date().toLocaleTimeString()}] INFO    Retrying news fetch (${nextRetry}/${MAX_RETRIES})`);
        
        // Wait before retry
        setTimeout(() => fetchNewsData(), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simulate news fetch from APIs
  const fetchSimulatedNewsData = async () => {
    // This would be an actual API call in a production app
    
    // Get current Bitcoin price to make news more realistic
    const btcPrice = Math.floor(90000 + Math.random() * 10000);
    
    // Create array of recent and relevant news items
    const currentDate = new Date();
    const timeOptions = { hour: 'numeric', minute: 'numeric' };
    
    // Mix of actual and simulated news
    return [
      {
        id: `news-${Date.now()}-1`,
        title: `Bitcoin ${Math.random() > 0.5 ? 'Surges' : 'Drops'} to $${btcPrice.toLocaleString()} as ${Math.random() > 0.5 ? 'Bulls' : 'Bears'} Take Control`,
        source: "CryptoCompare",
        time: `${Math.floor(Math.random() * 2) + 1} hours ago`,
        content: `The price of Bitcoin has ${Math.random() > 0.5 ? 'surged' : 'dropped'} to $${btcPrice.toLocaleString()} in a ${Math.random() > 0.5 ? 'bullish' : 'bearish'} market movement.`
      },
      {
        id: `news-${Date.now()}-2`,
        title: `Major Exchange Reports ${Math.random() > 0.5 ? 'Increased' : 'Decreased'} BTC Trading Volume`,
        source: "CoinDesk",
        time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
        content: `Trading volume on major exchanges has ${Math.random() > 0.5 ? 'increased' : 'decreased'} by ${Math.floor(Math.random() * 30) + 10}% in the past 24 hours.`
      },
      {
        id: `news-${Date.now()}-3`,
        title: "Bitcoin ETF Sees Significant Inflows For Third Straight Day",
        source: "Bloomberg",
        time: `${Math.floor(Math.random() * 4) + 2} hours ago`,
        content: "Institutional investors continue to pour money into Bitcoin ETFs, with daily inflows exceeding $100M."
      },
      {
        id: `news-${Date.now()}-4`,
        title: "Mining Difficulty Adjusted by 2.7% in Latest Update",
        source: "Bitcoin Magazine",
        time: `${Math.floor(Math.random() * 6) + 2} hours ago`,
        content: "The Bitcoin network's mining difficulty has been adjusted by 2.7% in the latest automatic update."
      },
      {
        id: `news-${Date.now()}-5`,
        title: Math.random() > 0.5 ? 
          "SEC Chair Makes Positive Comments About Crypto Regulation" : 
          "Regulatory Concerns Grow as Government Official Speaks Out Against Crypto",
        source: "The Block",
        time: `${Math.floor(Math.random() * 8) + 3} hours ago`,
        content: Math.random() > 0.5 ? 
          "Comments from the SEC chair suggest a more favorable regulatory environment for cryptocurrencies." :
          "A high-ranking government official has expressed concerns about the cryptocurrency market."
      },
      {
        id: `news-${Date.now()}-6`,
        title: `Technical Analysis: Bitcoin ${Math.random() > 0.5 ? 'Breaks Above' : 'Tests'} Key Resistance Level`,
        source: "TradingView",
        time: `${Math.floor(Math.random() * 2) + 1} hours ago`,
        content: `Technical analysts note that Bitcoin has ${Math.random() > 0.5 ? 'broken above' : 'is testing'} a key resistance level at $${Math.floor(btcPrice/1000)*1000}.`
      },
      {
        id: `news-${Date.now()}-7`,
        title: "Whale Alert: Large BTC Transaction Spotted Moving to Exchange",
        source: "Whale Alert",
        time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
        content: `A transaction of ${Math.floor(Math.random() * 900) + 100} BTC was spotted moving from a cold wallet to a major exchange.`
      }
    ];
  };
  
  // Simulate sentiment analysis on news data
  const analyzeSentiment = async (newsItems) => {
    // In a real app, this would use NLP APIs like Google Cloud Natural Language API
    // or a custom machine learning model to perform sentiment analysis
    
    return newsItems.map(item => {
      // Simulate sentiment analysis
      let sentiment;
      let impact;
      let strategy;
      
      // Analyze title for sentiment cues
      const title = item.title.toLowerCase();
      
      // Positive sentiment indicators
      if (title.includes("surge") || 
          title.includes("bull") || 
          title.includes("rise") || 
          title.includes("gain") ||
          title.includes("positive") ||
          title.includes("inflow") ||
          title.includes("breaks above")) {
        sentiment = "positive";
      } 
      // Negative sentiment indicators
      else if (title.includes("drop") || 
               title.includes("bear") || 
               title.includes("fall") || 
               title.includes("decrease") ||
               title.includes("concern") ||
               title.includes("against")) {
        sentiment = "negative";
      } 
      // Neutral if no clear indicators
      else {
        sentiment = "neutral";
      }
      
      // Determine impact based on content and source
      if (title.includes("etf") || 
          title.includes("sec") || 
          title.includes("regulation") ||
          title.includes("major") ||
          title.includes("significant")) {
        impact = "high";
      } else if (title.includes("technical") || 
                 title.includes("analyst") || 
                 title.includes("whale") ||
                 title.includes("volume")) {
        impact = "medium";
      } else {
        impact = "low";
      }
      
      // Generate trading strategy recommendation
      if (sentiment === "positive" && impact === "high") {
        strategy = "Long BTC with 1:2 risk-reward ratio";
      } else if (sentiment === "negative" && impact === "high") {
        strategy = "Short BTC with tight stop-loss";
      } else if (sentiment === "positive" && impact === "medium") {
        strategy = "Long BTC with small position size";
      } else if (sentiment === "negative" && impact === "medium") {
        strategy = "Reduce position size gradually";
      } else if (sentiment === "neutral" && impact === "high") {
        strategy = "Stay hedged with options";
      } else {
        strategy = "No action recommended";
      }
      
      return {
        ...item,
        sentiment,
        impact,
        strategy
      };
    });
  };
  
  // Process news signals for automated trading
  const processNewsSignals = (news) => {
    const highImpactNews = news.filter(item => item.impact === "high");
    
    if (highImpactNews.length === 0) {
      return;
    }
    
    console.log(`[${new Date().toLocaleTimeString()}] STRATEGY News Strategy: Analyzing ${highImpactNews.length} high-impact news items`);
    
    highImpactNews.forEach(news => {
      // Only react to high-impact news with clear sentiment
      if (news.sentiment === "positive") {
        console.log(`[${new Date().toLocaleTimeString()}] STRATEGY News Strategy: Buy signal from news "${news.title}"`);
        
        // Create a strategy signal
        const signal = {
          type: "BUY",
          timestamp: new Date().toISOString(),
          source: "News Strategy",
          strength: news.impact === "high" ? 80 : 65,
          message: `News Strategy: ${news.title}`,
        };
        
        // Send to trading service
        tradingService.processSignal(signal, 0); // Price will be set by the service
      } 
      else if (news.sentiment === "negative") {
        console.log(`[${new Date().toLocaleTimeString()}] STRATEGY News Strategy: Sell signal from news "${news.title}"`);
        
        // Create a strategy signal
        const signal = {
          type: "SELL",
          timestamp: new Date().toISOString(),
          source: "News Strategy",
          strength: news.impact === "high" ? 80 : 65,
          message: `News Strategy: ${news.title}`,
        };
        
        // Send to trading service
        tradingService.processSignal(signal, 0); // Price will be set by the service
      }
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchNewsData();
    
    // Refresh news every 5 minutes
    const intervalId = setInterval(fetchNewsData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Toggle news-based trading
  const toggleNewsStrategy = () => {
    const newState = !newsStrategyEnabled;
    setNewsStrategyEnabled(newState);
    
    if (newState) {
      console.log(`[${new Date().toLocaleTimeString()}] CONFIG   Enabled news-based trading strategy`);
      toast.success("News-based trading signals enabled");
      
      // Process current news immediately
      processNewsSignals(newsData);
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] CONFIG   Disabled news-based trading strategy`);
      toast.info("News-based trading signals disabled");
    }
  };

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
            onClick={fetchNewsData} 
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
            
            {newsData.length === 0 && (
              <div className="border border-dark-border rounded-md p-8 bg-dark-border/10 flex flex-col items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-muted-foreground text-center">
                  {isLoading ? "Loading news data..." : "No news data available at the moment."}
                </p>
                {!isLoading && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchNewsData} 
                    className="mt-3"
                  >
                    Refresh News Data
                  </Button>
                )}
              </div>
            )}
            
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`mt-3 text-xs border-yellow-500 ${newsStrategyEnabled ? 'bg-yellow-500/20' : ''} text-yellow-500 hover:bg-yellow-500/10`}
                  onClick={toggleNewsStrategy}
                >
                  <ArrowRightCircle className="w-3 h-3 mr-1" /> 
                  {newsStrategyEnabled ? "Disable" : "Enable"} news-based trading signals
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
