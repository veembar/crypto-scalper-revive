
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, CircleAlert, BarChart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { tradingService } from "@/services/tradingService";
import { strategyService } from "@/services/strategyService";
import { toast } from "sonner";

// Mock news data structure
interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: string;
  sentiment: "positive" | "negative" | "neutral";
  keywords: string[];
  summary: string;
  impact: number;
}

// Mock news sentiment data
interface SentimentData {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

const NewsStrategy = () => {
  const [enabled, setEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("latest");
  const [sentimentThreshold, setSentimentThreshold] = useState(75);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [keywords, setKeywords] = useState("bitcoin, btc, crypto");
  const [sources, setSources] = useState("Bloomberg, Reuters, CoinDesk, CoinTelegraph");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingInterval, setScrapingInterval] = useState(10); // minutes
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Fetch news data on component mount
  useEffect(() => {
    if (enabled) {
      fetchNews();
      const interval = setInterval(fetchNews, scrapingInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [enabled, scrapingInterval]);
  
  // Generate mock sentiment data
  useEffect(() => {
    if (enabled) {
      const newSentimentData: SentimentData[] = [];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(now.getHours() - i * 4);
        
        newSentimentData.push({
          date: `${date.getHours().toString().padStart(2, '0')}:00`,
          positive: Math.floor(Math.random() * 30) + 10,
          negative: Math.floor(Math.random() * 20) + 5,
          neutral: Math.floor(Math.random() * 25) + 15
        });
      }
      
      setSentimentData(newSentimentData);
    }
  }, [enabled, newsItems]);
  
  // Fetch news from various sources
  const fetchNews = async () => {
    try {
      setIsLoading(true);
      console.log(`[${new Date().toLocaleTimeString()}] INFO    Starting news scraping from: ${sources.split(',').map(s => s.trim()).join(', ')}`);
      
      // Simulated API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would be an actual API call to scrape news
      const mockNewsItems: NewsItem[] = [];
      const sources = ["Bloomberg", "Reuters", "CoinDesk", "CoinTelegraph"];
      const sentiments = ["positive", "negative", "neutral"];
      const now = new Date();
      
      // Generate mock news items with real timestamps
      for (let i = 0; i < 15; i++) {
        const timestamp = new Date(now);
        timestamp.setMinutes(now.getMinutes() - i * 30);
        
        const sentiment = sentiments[Math.floor(Math.random() * 3)] as "positive" | "negative" | "neutral";
        const impact = sentiment === "positive" ? Math.random() * 40 + 60 : 
                       sentiment === "negative" ? Math.random() * 40 - 80 : 
                       Math.random() * 20 + 40;
        
        mockNewsItems.push({
          id: `news-${Date.now()}-${i}`,
          title: generateNewsTitle(sentiment),
          source: sources[Math.floor(Math.random() * sources.length)],
          url: "https://example.com/news",
          timestamp: timestamp.toISOString(),
          sentiment: sentiment,
          keywords: ["bitcoin", "crypto", "market", "trading"].slice(0, Math.floor(Math.random() * 3) + 1),
          summary: generateNewsSummary(sentiment),
          impact: Math.abs(impact)
        });
      }
      
      // Process news for trading signals
      processNewsItems(mockNewsItems);
      
      setNewsItems(mockNewsItems);
      setLastUpdated(new Date().toLocaleString());
      setIsLoading(false);
      
      console.log(`[${new Date().toLocaleTimeString()}] INFO    Completed news scraping, found ${mockNewsItems.length} articles`);
    } catch (error) {
      console.error("Error fetching news:", error);
      console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to scrape news: ${error}`);
      setIsLoading(false);
      toast.error("Failed to fetch news data");
    }
  };
  
  // Process news items for trading signals
  const processNewsItems = (items: NewsItem[]) => {
    if (!enabled) return;
    
    // Group by sentiment
    const positiveNews = items.filter(item => item.sentiment === "positive");
    const negativeNews = items.filter(item => item.sentiment === "negative");
    
    // Calculate sentiment strength
    const positiveSentimentStrength = positiveNews.reduce((sum, news) => sum + news.impact, 0) / (positiveNews.length || 1);
    const negativeSentimentStrength = negativeNews.reduce((sum, news) => sum + news.impact, 0) / (negativeNews.length || 1);
    
    // Generate signals based on news sentiment if it meets the threshold
    if (positiveSentimentStrength > sentimentThreshold) {
      console.log(`[${new Date().toLocaleTimeString()}] STRATEGY News Sentiment: BUY signal detected with strength ${positiveSentimentStrength.toFixed(2)}`);
      
      const signal: typeof strategyService.generateSignal = {
        type: "BUY",
        timestamp: new Date().toISOString(),
        source: "News Sentiment",
        strength: positiveSentimentStrength,
        message: `News Sentiment: Multiple positive headlines`
      };
      
      tradingService.processSignal(signal, 0); // The actual price will be set by the trading service
    }
    
    if (negativeSentimentStrength > sentimentThreshold) {
      console.log(`[${new Date().toLocaleTimeString()}] STRATEGY News Sentiment: SELL signal detected with strength ${negativeSentimentStrength.toFixed(2)}`);
      
      const signal: typeof strategyService.generateSignal = {
        type: "SELL",
        timestamp: new Date().toISOString(),
        source: "News Sentiment",
        strength: negativeSentimentStrength,
        message: `News Sentiment: Multiple negative headlines`
      };
      
      tradingService.processSignal(signal, 0); // The actual price will be set by the trading service
    }
  };
  
  const toggleEnabled = (value: boolean) => {
    setEnabled(value);
    if (value) {
      fetchNews();
      toast.success("News sentiment analysis enabled");
    } else {
      toast.info("News sentiment analysis disabled");
    }
  };
  
  // Helper function to generate news titles
  const generateNewsTitle = (sentiment: string) => {
    if (sentiment === "positive") {
      const titles = [
        "Bitcoin Breaks Above Key Resistance Level",
        "Major Financial Institution Adopts Bitcoin",
        "Bitcoin ETF Approval Imminent",
        "Institutional Investment in BTC Surges",
        "BTC Hash Rate Reaches All-Time High"
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    } else if (sentiment === "negative") {
      const titles = [
        "Regulatory Concerns Grow for Crypto Markets",
        "BTC Drops Below Support Level",
        "Major Exchange Reports Security Breach",
        "Bitcoin Mining Difficulty Increases Amid Price Drop",
        "Analysts Warn of BTC Correction"
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    } else {
      const titles = [
        "Bitcoin Price Consolidates After Recent Move",
        "Experts Analyze BTC Market Structure",
        "On-Chain Metrics Show Mixed Signals",
        "Trading Volume Remains Consistent for BTC",
        "Market Players Await Next Bitcoin Move"
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    }
  };
  
  // Helper function to generate news summaries
  const generateNewsSummary = (sentiment: string) => {
    if (sentiment === "positive") {
      const summaries = [
        "Bitcoin has surpassed a key technical resistance level, suggesting potential for continued upward momentum. Analysts point to institutional buying as a primary driver.",
        "A major financial institution announced plans to add Bitcoin to their balance sheet, marking another milestone for mainstream adoption of the cryptocurrency.",
        "Sources close to regulators indicate a Bitcoin ETF approval is in final stages, which could bring significant new capital into the market.",
        "Data shows institutional investment in Bitcoin has reached new highs in Q2, with several major funds disclosing positions.",
        "The Bitcoin network's hash rate has reached an all-time high, indicating strong miner confidence despite recent market volatility."
      ];
      return summaries[Math.floor(Math.random() * summaries.length)];
    } else if (sentiment === "negative") {
      const summaries = [
        "Regulatory bodies are signaling increased scrutiny of cryptocurrency markets, raising concerns about potential restrictions on trading and usage.",
        "Bitcoin price has fallen below a key support level that had held for several months, potentially indicating further downside ahead.",
        "A major cryptocurrency exchange reported a security incident affecting user wallets, though the full extent of the breach remains unclear.",
        "Bitcoin mining difficulty has increased significantly while prices dropped, putting pressure on miner profitability and potentially forcing sell-offs.",
        "Several prominent market analysts have warned that Bitcoin may be due for a correction after its recent price action, citing technical indicators."
      ];
      return summaries[Math.floor(Math.random() * summaries.length)];
    } else {
      const summaries = [
        "Bitcoin continues to trade within a consolidation range as traders assess market conditions and await catalysts for the next major move.",
        "On-chain analysts note that Bitcoin metrics are showing mixed signals, with some indicators bullish while others suggest caution.",
        "Trading volume for Bitcoin has remained relatively consistent over the past week, suggesting neither strong accumulation nor distribution patterns.",
        "Market participants are watching key technical levels for Bitcoin as the asset continues to establish its short-term direction.",
        "Derivatives data shows balanced positioning among Bitcoin traders, with neither longs nor shorts showing significant dominance."
      ];
      return summaries[Math.floor(Math.random() * summaries.length)];
    }
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">News Sentiment Strategy</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            checked={enabled}
            onCheckedChange={toggleEnabled}
            className="data-[state=checked]:bg-green-500"
          />
          <span className="text-sm text-muted-foreground">
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-dark-border/20 mb-4">
            <TabsTrigger value="latest">Latest News</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="latest" className="h-[400px] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Latest Market News</h3>
                <p className="text-xs text-muted-foreground">
                  {lastUpdated ? `Last updated: ${lastUpdated}` : "Not yet updated"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchNews} 
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh News"}
              </Button>
            </div>
            
            <ScrollArea className="h-[340px]">
              {newsItems.length > 0 ? (
                <div className="space-y-3">
                  {newsItems.map(news => (
                    <div 
                      key={news.id}
                      className="border border-dark-border rounded-md p-3 hover:bg-dark-border/10 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm mb-1">{news.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>{new Date(news.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded text-xs font-medium flex items-center",
                          news.sentiment === "positive" ? "bg-green-500/20 text-green-400" :
                          news.sentiment === "negative" ? "bg-red-500/20 text-red-400" :
                          "bg-blue-500/20 text-blue-400"
                        )}>
                          {news.sentiment === "positive" ? (
                            <><TrendingUp className="h-3 w-3 mr-1" /> Bullish</>
                          ) : news.sentiment === "negative" ? (
                            <><TrendingDown className="h-3 w-3 mr-1" /> Bearish</>
                          ) : (
                            <><CircleAlert className="h-3 w-3 mr-1" /> Neutral</>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{news.summary}</p>
                      <div className="flex flex-wrap gap-1">
                        {news.keywords.map((keyword, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-1.5 py-0.5 bg-dark-border/30 rounded-full"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  {isLoading ? (
                    <p>Fetching latest news...</p>
                  ) : (
                    <>
                      <Globe className="h-8 w-8 mb-2 opacity-50" />
                      <p>No news articles available</p>
                      <p className="text-xs mt-1">Enable the strategy to start collecting market news</p>
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="sentiment" className="h-[400px] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-border/10 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-xs text-muted-foreground mb-1">Overall Sentiment</div>
                <div className={cn(
                  "text-xl font-semibold mb-1",
                  positiveCount() > negativeCount() ? "text-green-400" :
                  negativeCount() > positiveCount() ? "text-red-400" : "text-blue-400"
                )}>
                  {positiveCount() > negativeCount() ? "Bullish" :
                   negativeCount() > positiveCount() ? "Bearish" : "Neutral"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Based on {newsItems.length} articles
                </div>
              </div>
              
              <div className="bg-dark-border/10 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-muted-foreground mb-2">Sentiment Distribution</div>
                <div className="flex-1 flex items-end justify-between gap-2">
                  <div className="flex flex-col items-center">
                    <div className="text-xs mb-1 text-green-400">{positiveCount()}</div>
                    <div 
                      className="w-8 bg-green-500/80 rounded-t"
                      style={{ height: `${(positiveCount() / newsItems.length) * 100}px` }}
                    ></div>
                    <div className="text-xs mt-1">Bullish</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-xs mb-1 text-blue-400">{neutralCount()}</div>
                    <div 
                      className="w-8 bg-blue-500/80 rounded-t"
                      style={{ height: `${(neutralCount() / newsItems.length) * 100}px` }}
                    ></div>
                    <div className="text-xs mt-1">Neutral</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-xs mb-1 text-red-400">{negativeCount()}</div>
                    <div 
                      className="w-8 bg-red-500/80 rounded-t"
                      style={{ height: `${(negativeCount() / newsItems.length) * 100}px` }}
                    ></div>
                    <div className="text-xs mt-1">Bearish</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark-border/10 rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-2">Signal Strength</div>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-dark-border/30 rounded-full h-2.5">
                    <div 
                      className={cn(
                        "h-2.5 rounded-full",
                        calculateSignalStrength() > 70 ? "bg-green-500" :
                        calculateSignalStrength() > 40 ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                      style={{ width: `${calculateSignalStrength()}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{calculateSignalStrength()}%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-4">
                  {enabled ? (
                    `Trading threshold: ${sentimentThreshold}%`
                  ) : (
                    "Strategy disabled"
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-dark-border/10 rounded-lg p-4 mt-4 h-[220px]">
              <div className="flex justify-between mb-4">
                <h3 className="text-sm font-medium">Top Impactful News</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <BarChart className="h-3 w-3 mr-1" />
                  Impact Score
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Headline</TableHead>
                    <TableHead className="w-[20%]">Source</TableHead>
                    <TableHead className="w-[20%]">Sentiment</TableHead>
                    <TableHead className="w-[20%] text-right">Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsItems
                    .sort((a, b) => b.impact - a.impact)
                    .slice(0, 5)
                    .map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="truncate font-medium">
                          {item.title}
                        </TableCell>
                        <TableCell>{item.source}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            item.sentiment === "positive" ? "bg-green-500/20 text-green-400" :
                            item.sentiment === "negative" ? "bg-red-500/20 text-red-400" :
                            "bg-blue-500/20 text-blue-400"
                          )}>
                            {item.sentiment}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.impact.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keywords">Keyword Filters</Label>
                  <Input 
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="bitcoin, btc, crypto, ethereum..."
                    className="bg-dark-border/20 border-dark-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter keywords separated by commas to filter news articles
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="sources">News Sources</Label>
                  <Input 
                    id="sources"
                    value={sources}
                    onChange={(e) => setSources(e.target.value)}
                    placeholder="Bloomberg, Reuters, CoinDesk..."
                    className="bg-dark-border/20 border-dark-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter news sources separated by commas
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="interval">Scraping Interval (minutes)</Label>
                  <Input 
                    id="interval"
                    type="number"
                    value={scrapingInterval.toString()}
                    onChange={(e) => setScrapingInterval(Math.max(1, parseInt(e.target.value) || 10))}
                    className="bg-dark-border/20 border-dark-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How often to check for new articles
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="threshold">Signal Strength Threshold ({sentimentThreshold}%)</Label>
                  <Slider 
                    id="threshold"
                    min={50}
                    max={95}
                    step={5}
                    value={[sentimentThreshold]}
                    onValueChange={(value) => setSentimentThreshold(value[0])}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Only generate trading signals when sentiment exceeds this threshold
                  </p>
                </div>
                
                <div className="bg-dark-border/10 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-medium mb-2">Strategy Configuration</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable for BUY signals</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable for SELL signals</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require confirmation</span>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={fetchNews}>
                    Save & Apply Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
  
  // Helper functions for sentiment calculation
  function positiveCount() {
    return newsItems.filter(item => item.sentiment === "positive").length;
  }
  
  function negativeCount() {
    return newsItems.filter(item => item.sentiment === "negative").length;
  }
  
  function neutralCount() {
    return newsItems.filter(item => item.sentiment === "neutral").length;
  }
  
  function calculateSignalStrength() {
    if (newsItems.length === 0) return 0;
    
    const positiveWeight = positiveCount() * 1.5;
    const negativeWeight = negativeCount() * 1.2;
    const totalWeight = positiveWeight + negativeWeight + neutralCount();
    
    return Math.min(100, Math.round((positiveWeight / totalWeight) * 100));
  }
};

export default NewsStrategy;
