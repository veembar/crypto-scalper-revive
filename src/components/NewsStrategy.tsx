
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, 
  TrendingUp,
  TrendingDown,
  AlertCircle, 
  Check, 
  X, 
  RefreshCw, 
  Globe, 
  Newspaper, 
  ArrowUpRight 
} from "lucide-react";
import { toast } from "sonner";
import { strategyService } from "@/services/strategyService";

// Define news sources
const newsSources = [
  { id: "coindesk", name: "CoinDesk", priority: 1, enabled: true },
  { id: "cointelegraph", name: "CoinTelegraph", priority: 2, enabled: true },
  { id: "bitcoinmagazine", name: "Bitcoin Magazine", priority: 3, enabled: true },
  { id: "cryptobriefing", name: "Crypto Briefing", priority: 4, enabled: false },
  { id: "decrypt", name: "Decrypt", priority: 5, enabled: false }
];

// Define news sentiments with their signal effects
const sentimentEffects = [
  { id: "very_bullish", name: "Very Bullish", probability: 0.95, signal: "Strong Buy" },
  { id: "bullish", name: "Bullish", probability: 0.75, signal: "Buy" },
  { id: "neutral", name: "Neutral", probability: 0.5, signal: "Hold" },
  { id: "bearish", name: "Bearish", probability: 0.25, signal: "Sell" },
  { id: "very_bearish", name: "Very Bearish", probability: 0.05, signal: "Strong Sell" }
];

// Sample news data - in real implementation this would come from API
const sampleNews = [
  {
    id: "news1",
    title: "Bitcoin Surges Past $95,000 as Institutional Demand Increases",
    source: "CoinDesk",
    url: "#",
    sentiment: "very_bullish",
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    summary: "Bitcoin reached a new all-time high as BlackRock ETF sees record inflows from institutional investors."
  },
  {
    id: "news2",
    title: "FED Chairman: Crypto Regulation Framework Coming This Quarter",
    source: "Bitcoin Magazine",
    url: "#",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    summary: "The Federal Reserve is planning to announce comprehensive crypto regulations that may impact exchange operations."
  },
  {
    id: "news3",
    title: "Major Exchange Faces Liquidity Issues Amid Market Volatility",
    source: "CoinTelegraph",
    url: "#",
    sentiment: "bearish",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    summary: "A major cryptocurrency exchange has temporarily halted withdrawals due to liquidity constraints."
  }
];

const NewsStrategy = () => {
  const [newsItems, setNewsItems] = useState(sampleNews);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sensitivityLevel, setSensitivityLevel] = useState([50]);
  const [activeTab, setActiveTab] = useState("news");
  const [enabledSources, setEnabledSources] = useState(
    newsSources.filter(source => source.enabled).map(source => source.id)
  );
  
  // Format timeago
  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };
  
  // Toggle news source
  const toggleSource = (sourceId: string) => {
    setEnabledSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  };
  
  // Refresh news data
  const refreshNews = () => {
    setIsLoading(true);
    setTimeout(() => {
      // In a real implementation, this would fetch new data from APIs
      setIsLoading(false);
      toast.success("News data refreshed");
      console.log(`[${new Date().toLocaleTimeString()}] INFO    News data refreshed from ${enabledSources.join(", ")}`);
    }, 1500);
  };
  
  // Process news data for trading signals
  const processNewsForSignals = () => {
    const bullishNews = newsItems.filter(item => 
      ["very_bullish", "bullish"].includes(item.sentiment) && 
      enabledSources.includes(item.source.toLowerCase())
    );
    
    const bearishNews = newsItems.filter(item => 
      ["very_bearish", "bearish"].includes(item.sentiment) && 
      enabledSources.includes(item.source.toLowerCase())
    );
    
    if (bullishNews.length > 0) {
      const mostBullish = bullishNews[0];
      const sentiment = sentimentEffects.find(s => s.id === mostBullish.sentiment);
      
      if (sentiment) {
        const signal = strategyService.generateSignal(
          "NewsStrategy",
          `Bullish news: ${mostBullish.title}`,
          sentiment.probability
        );
        
        console.log(`[${new Date().toLocaleTimeString()}] SIGNAL  Generated BUY signal from news with strength: ${signal.strength}`);
        toast.success("Generated BUY signal from news data", {
          description: mostBullish.title
        });
      }
    }
    
    if (bearishNews.length > 0) {
      const mostBearish = bearishNews[0];
      const sentiment = sentimentEffects.find(s => s.id === mostBearish.sentiment);
      
      if (sentiment) {
        const signal = strategyService.generateSignal(
          "NewsStrategy",
          `Bearish news: ${mostBearish.title}`,
          sentiment.probability
        );
        
        console.log(`[${new Date().toLocaleTimeString()}] SIGNAL  Generated SELL signal from news with strength: ${signal.strength}`);
        toast.error("Generated SELL signal from news data", {
          description: mostBearish.title
        });
      }
    }
  };
  
  // Enable/disable strategy
  const toggleStrategy = () => {
    setIsEnabled(!isEnabled);
    if (!isEnabled) {
      toast.success("News trading strategy activated");
      console.log(`[${new Date().toLocaleTimeString()}] INFO    News trading strategy activated`);
      processNewsForSignals();
    } else {
      toast.info("News trading strategy deactivated");
      console.log(`[${new Date().toLocaleTimeString()}] INFO    News trading strategy deactivated`);
    }
  };
  
  // Get sentiment badge styling
  const getSentimentBadge = (sentiment: string) => {
    switch(sentiment) {
      case "very_bullish":
        return { label: "Very Bullish", className: "bg-green-600 hover:bg-green-700" };
      case "bullish":
        return { label: "Bullish", className: "bg-green-400 hover:bg-green-500" };
      case "neutral":
        return { label: "Neutral", className: "bg-gray-500 hover:bg-gray-600" };
      case "bearish":
        return { label: "Bearish", className: "bg-red-400 hover:bg-red-500" };
      case "very_bearish":
        return { label: "Very Bearish", className: "bg-red-600 hover:bg-red-700" };
      default:
        return { label: "Unknown", className: "bg-gray-400" };
    }
  };

  return (
    <Card className="mb-6 bg-dark-card border-dark-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center">
            <Newspaper className="mr-2 h-5 w-5" />
            News-Based Trading Strategy
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Switch id="strategy-toggle" checked={isEnabled} onCheckedChange={toggleStrategy} />
          <Label htmlFor="strategy-toggle">{isEnabled ? "Enabled" : "Disabled"}</Label>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="news" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="news">News Feed</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="settings">Strategy Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="news">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Displaying {newsItems.length} relevant news items from {enabledSources.length} sources
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshNews}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            
            <div className="space-y-3">
              {newsItems.map(item => {
                const sentimentStyle = getSentimentBadge(item.sentiment);
                return (
                  <div key={item.id} className="border border-dark-border rounded-lg p-3 bg-dark-card/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <div className="flex items-center mt-1 gap-2">
                          <Badge variant="outline">{item.source}</Badge>
                          <Badge className={sentimentStyle.className}>
                            {sentimentStyle.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(item.timestamp)}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                    {item.summary && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {item.summary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="sources">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Active News Sources</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Select which news sources to include in trading decisions
              </p>
              
              <div className="space-y-2">
                {newsSources.map(source => (
                  <div key={source.id} className="flex items-center justify-between border border-dark-border p-2 rounded">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{source.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">Priority {source.priority}</Badge>
                    </div>
                    <Switch 
                      id={`source-${source.id}`} 
                      checked={enabledSources.includes(source.id)} 
                      onCheckedChange={() => toggleSource(source.id)} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">News Trading Sensitivity</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Adjust how sensitive the algorithm is to news events
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Low</span>
                  <Slider 
                    value={sensitivityLevel} 
                    onValueChange={setSensitivityLevel} 
                    min={1}
                    max={100}
                    step={1}
                  />
                  <span className="text-xs">High</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-xs">{sensitivityLevel}%</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Trading Rules</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trade-on-very-bullish">Trade on Very Bullish News</Label>
                    <Switch id="trade-on-very-bullish" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trade-on-bullish">Trade on Bullish News</Label>
                    <Switch id="trade-on-bullish" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trade-on-bearish">Trade on Bearish News</Label>
                    <Switch id="trade-on-bearish" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trade-on-very-bearish">Trade on Very Bearish News</Label>
                    <Switch id="trade-on-very-bearish" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Confirmation Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-multiple-sources">Require multiple sources</Label>
                    <Switch id="require-multiple-sources" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wait-for-price-confirmation">Wait for price confirmation</Label>
                    <Switch id="wait-for-price-confirmation" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NewsStrategy;
