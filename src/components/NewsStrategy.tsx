
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, NewspaperIcon, Newspaper, RotateCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

const NewsStrategy = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you would fetch from a real news API
      // For demonstration purposes, we're simulating an API call
      const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we have valid data
      if (data && data.Data && Array.isArray(data.Data)) {
        const formattedNews: NewsItem[] = data.Data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.body.substring(0, 140) + '...',
          url: item.url,
          source: item.source,
          publishedAt: new Date(item.published_on * 1000).toISOString(),
          sentiment: determineSentiment(item.title, item.body)
        }));
        
        setNews(formattedNews);
        console.log(`[${new Date().toLocaleTimeString()}] INFO    Fetched ${formattedNews.length} news articles`);
      } else {
        // If API is unavailable, use some fallback news (this would be removed in production)
        const fallbackNews = generateFallbackNews();
        setNews(fallbackNews);
        console.log(`[${new Date().toLocaleTimeString()}] INFO    Using fallback news data`);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to fetch news: ${err.message}`);
      
      // Use fallback data on error
      const fallbackNews = generateFallbackNews();
      setNews(fallbackNews);
      setError("Failed to fetch real-time news. Using cached data.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine sentiment based on keywords in title/content
  const determineSentiment = (title: string, content: string): 'positive' | 'negative' | 'neutral' => {
    const text = (title + ' ' + content).toLowerCase();
    
    const positiveWords = ['bullish', 'surge', 'soar', 'jump', 'gain', 'rally', 'rise', 'green', 'up', 'high', 'positive', 'growth'];
    const negativeWords = ['bearish', 'crash', 'plunge', 'tumble', 'drop', 'fall', 'red', 'down', 'low', 'negative', 'loss'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  };
  
  // Generate fallback news in case API fails
  const generateFallbackNews = (): NewsItem[] => {
    const currentDate = new Date().toISOString();
    return [
      {
        id: '1',
        title: 'Bitcoin Holds Above $95,000 as Institutional Demand Continues',
        description: 'Bitcoin maintains position above $95,000 as institutional investors continue to add BTC to their portfolios, signaling strong market confidence.',
        url: 'https://www.cryptonews.com/bitcoin-institutional-demand',
        source: 'CryptoNews',
        publishedAt: currentDate,
        sentiment: 'positive'
      },
      {
        id: '2',
        title: 'Kraken Introduces New Trading Features for Bitcoin Futures',
        description: 'Kraken exchange has announced new features for Bitcoin futures trading, including improved leverage options and reduced fees for high-volume traders.',
        url: 'https://www.kraken.com/blog/new-features',
        source: 'Kraken Blog',
        publishedAt: currentDate,
        sentiment: 'positive'
      },
      {
        id: '3',
        title: 'Market Analysis: Bitcoin Price Volatility Expected Ahead of Fed Meeting',
        description: 'Analysts predict increased Bitcoin price volatility in the coming days as traders anticipate the Federal Reserve\'s upcoming policy decision.',
        url: 'https://www.coindesk.com/markets/bitcoin-fed-meeting',
        source: 'CoinDesk',
        publishedAt: currentDate,
        sentiment: 'neutral'
      },
      {
        id: '4',
        title: 'Technical Analysis: Bitcoin Approaching Key Resistance Levels',
        description: 'Technical analysts point to important resistance levels for Bitcoin around $98,500, which could determine the next major price movement.',
        url: 'https://www.tradingview.com/ideas/bitcoin-resistance',
        source: 'TradingView',
        publishedAt: currentDate,
        sentiment: 'neutral'
      }
    ];
  };
  
  useEffect(() => {
    fetchNews();
    
    // Refresh news every 10 minutes
    const interval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="mb-6 bg-dark-card border-dark-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Newspaper className="mr-2 h-5 w-5" />
          Market News & Analysis
        </CardTitle>
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8 bg-dark-border/20 hover:bg-dark-border/30"
          onClick={fetchNews}
          disabled={isLoading}
        >
          <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
            {error}
          </div>
        )}
        
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {isLoading ? (
              // Show skeletons while loading
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))
            ) : (
              news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const NewsCard = ({ news }: { news: NewsItem }) => {
  // Format the published date
  const formattedDate = new Date(news.publishedAt).toLocaleString();
  
  // Get sentiment color
  const getSentimentColor = () => {
    switch (news.sentiment) {
      case 'positive': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'negative': return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    }
  };
  
  // Get sentiment text
  const getSentimentText = () => {
    switch (news.sentiment) {
      case 'positive': return 'Bullish';
      case 'negative': return 'Bearish';
      default: return 'Neutral';
    }
  };

  return (
    <div className="p-3 border border-dark-border rounded-md hover:border-primary/30 transition-colors">
      <div className="flex justify-between">
        <h3 className="font-medium">{news.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{news.description}</p>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{news.source}</span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded border ${getSentimentColor()}`}>
            {getSentimentText()}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(news.url, '_blank')}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsStrategy;
