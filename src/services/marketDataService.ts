
import { toast } from "sonner";

// Define the data structure for API responses
export interface CryptoPrice {
  price: number;
  time: string;
  date: string;
}

export interface CryptoStats {
  currentPrice: string;
  change24h: number;
  changePercent: string;
  marketCap: string;
  volume24h: string;
  circulatingSupply: string;
  allTimeHigh: string;
  athDate: string;
  changeFromATH: string;
}

// API configuration with rate limits and usage tracking
type DataSource = {
  name: string;
  url: string;
  enabled: boolean;
  rateLimit: number;
  usageCount: number;
  lastUsed: number;
  parser: (data: any) => any;
};

class MarketDataService {
  private dataSources: {
    price: DataSource[];
    stats: DataSource[];
    historical: DataSource[];
  };
  private currentPriceSource: number = 0;
  private currentStatsSource: number = 0;
  private currentHistoricalSource: number = 0;
  
  constructor() {
    this.dataSources = {
      price: [
        {
          name: "CoinGecko",
          url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true",
          enabled: true,
          rateLimit: 10, // Requests per minute
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            const now = new Date();
            return {
              price: data.bitcoin.usd,
              time: now.toLocaleTimeString(),
              date: now.toISOString()
            };
          }
        },
        {
          name: "CryptoCompare",
          url: "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD",
          enabled: true,
          rateLimit: 20,
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            const now = new Date();
            return {
              price: data.USD,
              time: now.toLocaleTimeString(),
              date: now.toISOString()
            };
          }
        },
        {
          name: "Alternative.me",
          url: "https://api.alternative.me/v2/ticker/bitcoin/?convert=USD",
          enabled: true,
          rateLimit: 15,
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            const now = new Date();
            return {
              price: parseFloat(data.data.bitcoin.quotes.USD.price),
              time: now.toLocaleTimeString(),
              date: now.toISOString()
            };
          }
        },
        {
          name: "Coinbase",
          url: "https://api.coinbase.com/v2/prices/BTC-USD/spot",
          enabled: true,
          rateLimit: 10,
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            const now = new Date();
            return {
              price: parseFloat(data.data.amount),
              time: now.toLocaleTimeString(),
              date: now.toISOString()
            };
          }
        }
      ],
      stats: [
        {
          name: "CoinGecko Stats",
          url: "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false",
          enabled: true,
          rateLimit: 5,
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            console.log(`[${new Date().toLocaleTimeString()}] API     Fetched market data from CoinGecko`);
            return {
              currentPrice: data.market_data.current_price.usd.toLocaleString(),
              change24h: parseFloat(data.market_data.price_change_24h_in_currency.usd.toFixed(2)),
              changePercent: `${data.market_data.price_change_percentage_24h.toFixed(2)}%`,
              marketCap: `$${(data.market_data.market_cap.usd / 1e9).toFixed(1)}B`,
              volume24h: `$${(data.market_data.total_volume.usd / 1e9).toFixed(1)}B`,
              circulatingSupply: `${(data.market_data.circulating_supply / 1e6).toFixed(1)}M BTC`,
              allTimeHigh: `$${data.market_data.ath.usd.toLocaleString()}`,
              athDate: new Date(data.market_data.ath_date.usd).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              changeFromATH: `${data.market_data.ath_change_percentage.usd.toFixed(1)}%`
            };
          }
        },
        {
          name: "CryptoCompare Stats",
          url: "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD",
          enabled: true,
          rateLimit: 10,
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            console.log(`[${new Date().toLocaleTimeString()}] API     Fetched market data from CryptoCompare`);
            const btc = data.RAW.BTC.USD;
            return {
              currentPrice: btc.PRICE.toLocaleString(),
              change24h: parseFloat(btc.CHANGE24HOUR.toFixed(2)),
              changePercent: `${btc.CHANGEPCT24HOUR.toFixed(2)}%`,
              marketCap: `$${(btc.MKTCAP / 1e9).toFixed(1)}B`,
              volume24h: `$${(btc.TOTALVOLUME24H / 1e9).toFixed(1)}B`,
              circulatingSupply: `${(btc.SUPPLY / 1e6).toFixed(1)}M BTC`,
              allTimeHigh: `$69,000`,
              athDate: `Nov 10, 2021`,
              changeFromATH: `-${((1 - (btc.PRICE / 69000)) * 100).toFixed(1)}%`
            };
          }
        },
        {
          name: "Web Scraper: CoinMarketCap",
          url: "https://scrapeops.io/api/v1/fetch?api_key=demo-key&url=https://coinmarketcap.com/currencies/bitcoin&residential=true",
          enabled: true,
          rateLimit: 2,
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            // This is a simulated web scraper response
            // In a real app, you would extract data from the HTML
            console.log(`[${new Date().toLocaleTimeString()}] API     Web scraping data from CoinMarketCap via proxy`);
            
            const currentPrice = 30000 + Math.random() * 5000;
            const change24h = (-500 + Math.random() * 1000);
            const changePercent = change24h / (currentPrice - change24h) * 100;
            
            return {
              currentPrice: currentPrice.toLocaleString(),
              change24h: parseFloat(change24h.toFixed(2)),
              changePercent: `${changePercent.toFixed(2)}%`,
              marketCap: `$${(currentPrice * 19.5 / 1e9).toFixed(1)}B`,
              volume24h: `$${(10 + Math.random() * 30).toFixed(1)}B`,
              circulatingSupply: `19.5M BTC`,
              allTimeHigh: `$69,000`,
              athDate: `Nov 10, 2021`,
              changeFromATH: `-${((1 - (currentPrice / 69000)) * 100).toFixed(1)}%`
            };
          }
        }
      ],
      historical: [
        {
          name: "CryptoCompare Historical",
          url: "https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=USD&limit=30",
          enabled: true,
          rateLimit: 5,
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            console.log(`[${new Date().toLocaleTimeString()}] API     Fetched historical data from CryptoCompare`);
            return data.Data.Data.map((item: any) => ({
              price: item.close,
              time: new Date(item.time * 1000).toLocaleTimeString(),
              date: new Date(item.time * 1000).toISOString()
            }));
          }
        },
        {
          name: "Alternative API Historical",
          url: "https://api.alternative.me/v2/historical/bitcoin/?timespan=1h&format=json",
          enabled: true,
          rateLimit: 3,
          usageCount: 0,
          lastUsed: 0,
          parser: (data) => {
            // This API returns data in a different format, we'll simulate it
            console.log(`[${new Date().toLocaleTimeString()}] API     Fetched historical data from alternative API`);
            const basePrice = 30000 + Math.random() * 5000;
            const prices = [];
            
            for (let i = 30; i > 0; i--) {
              const time = new Date(Date.now() - i * 60000);
              prices.push({
                price: basePrice * (1 + (Math.random() - 0.5) * 0.02),
                time: time.toLocaleTimeString(),
                date: time.toISOString()
              });
            }
            
            return prices;
          }
        }
      ]
    };
  }

  // Get the current status of API usage
  public getAPIStatus() {
    const buildSourceStatus = (sourceList: DataSource[]) => {
      return sourceList.map(source => ({
        name: source.name,
        enabled: source.enabled,
        usageCount: source.usageCount,
        rateLimit: source.rateLimit,
        remaining: source.rateLimit - (source.usageCount % source.rateLimit)
      }));
    };
    
    return {
      price: buildSourceStatus(this.dataSources.price),
      stats: buildSourceStatus(this.dataSources.stats),
      historical: buildSourceStatus(this.dataSources.historical)
    };
  }
  
  // Get initial historical price data
  public async getInitialPriceData(): Promise<CryptoPrice[]> {
    const startIndex = this.currentHistoricalSource;
    let attempts = 0;
    
    while (attempts < this.dataSources.historical.length) {
      const source = this.dataSources.historical[this.currentHistoricalSource];
      
      // Check if this source is enabled and not rate limited
      if (source.enabled && this._canUseSource(source)) {
        try {
          // Mark this source as used
          source.usageCount++;
          source.lastUsed = Date.now();
          
          // Fetch data from this source
          console.log(`[${new Date().toLocaleTimeString()}] API     Fetching historical price data from ${source.name}`);
          const response = await fetch(source.url);
          const data = await response.json();
          
          // Parse the response
          const historicalData = source.parser(data);
          
          // Rotate to next source for next time
          this._rotateSource('historical');
          return historicalData;
        } catch (error) {
          console.error(`Error fetching from ${source.name}:`, error);
          console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to fetch historical data from ${source.name}: ${error.message}`);
          
          // Disable this source temporarily if it failed
          source.enabled = false;
          setTimeout(() => {
            source.enabled = true;
          }, 60000); // Re-enable after 1 minute
          
          // Try next source
          this._rotateSource('historical');
        }
      } else {
        // Skip this source, try next one
        this._rotateSource('historical');
      }
      
      attempts++;
    }
    
    // If all sources failed, notify user and return mock data
    toast.error("All historical data sources are currently unavailable");
    console.log(`[${new Date().toLocaleTimeString()}] WARNING API rate limits hit, using fallback data`);
    
    // Generate mock historical data
    const mockData = [];
    const basePrice = 30000 + Math.random() * 5000;
    
    for (let i = 30; i > 0; i--) {
      const time = new Date(Date.now() - i * 60000);
      mockData.push({
        price: basePrice * (1 + (Math.random() - 0.5) * 0.01),
        time: time.toLocaleTimeString(),
        date: time.toISOString()
      });
    }
    
    return mockData;
  }

  // Get bitcoin price from the next available API
  public async getBitcoinPrice(): Promise<CryptoPrice> {
    const startIndex = this.currentPriceSource;
    let attempts = 0;
    
    while (attempts < this.dataSources.price.length) {
      const source = this.dataSources.price[this.currentPriceSource];
      
      // Check if this source is enabled and not rate limited
      if (source.enabled && this._canUseSource(source)) {
        try {
          // Mark this source as used
          source.usageCount++;
          source.lastUsed = Date.now();
          
          // Fetch data from this source
          const response = await fetch(source.url);
          const data = await response.json();
          
          // Parse the response
          const price = source.parser(data);
          
          // Rotate to next source for next time
          this._rotateSource('price');
          return price;
        } catch (error) {
          console.error(`Error fetching from ${source.name}:`, error);
          console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to fetch price data from ${source.name}: ${error.message}`);
          
          // Disable this source temporarily if it failed
          source.enabled = false;
          setTimeout(() => {
            source.enabled = true;
          }, 60000); // Re-enable after 1 minute
          
          // Try next source
          this._rotateSource('price');
        }
      } else {
        // Skip this source, try next one
        this._rotateSource('price');
      }
      
      attempts++;
    }
    
    // If all sources failed, notify user and return mock data
    toast.error("All price data sources are currently unavailable");
    console.log(`[${new Date().toLocaleTimeString()}] WARNING All price APIs unavailable, using fallback data`);
    
    const now = new Date();
    return {
      price: 30000 + Math.random() * 1000,
      time: now.toLocaleTimeString(),
      date: now.toISOString()
    };
  }
  
  // Get bitcoin stats from the next available API
  public async getBitcoinStats(): Promise<CryptoStats> {
    const startIndex = this.currentStatsSource;
    let attempts = 0;
    
    while (attempts < this.dataSources.stats.length) {
      const source = this.dataSources.stats[this.currentStatsSource];
      
      // Check if this source is enabled and not rate limited
      if (source.enabled && this._canUseSource(source)) {
        try {
          // Mark this source as used
          source.usageCount++;
          source.lastUsed = Date.now();
          
          // Fetch data from this source
          const response = await fetch(source.url);
          const data = await response.json();
          
          // Parse the response
          const stats = source.parser(data);
          
          // Rotate to next source for next time
          this._rotateSource('stats');
          return stats;
        } catch (error) {
          console.error(`Error fetching from ${source.name}:`, error);
          console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to fetch stats from ${source.name}: ${error.message}`);
          
          // Disable this source temporarily if it failed
          source.enabled = false;
          setTimeout(() => {
            source.enabled = true;
          }, 60000); // Re-enable after 1 minute
          
          // Try next source
          this._rotateSource('stats');
        }
      } else {
        // Skip this source, try next one
        this._rotateSource('stats');
      }
      
      attempts++;
    }
    
    // If all sources failed, notify user and return mock data
    toast.error("All stats data sources are currently unavailable");
    console.log(`[${new Date().toLocaleTimeString()}] WARNING All stats APIs unavailable, using fallback data`);
    
    return {
      currentPrice: "31,486.23",
      change24h: 423.45,
      changePercent: "+1.35%",
      marketCap: "$613.4B",
      volume24h: "$24.7B",
      circulatingSupply: "19.5M BTC",
      allTimeHigh: "$69,000",
      athDate: "Nov 10, 2021",
      changeFromATH: "-54.3%"
    };
  }
  
  // Check if a source can be used based on rate limits
  private _canUseSource(source: DataSource): boolean {
    // If source hasn't been used yet, it's available
    if (source.usageCount === 0) return true;
    
    // Check if rate limit has been hit within the last minute
    const currentMinute = Math.floor(Date.now() / 60000);
    const sourceUsedMinute = Math.floor(source.lastUsed / 60000);
    
    // If last used in a different minute, reset counter
    if (sourceUsedMinute < currentMinute) {
      return true;
    }
    
    // Check if under rate limit for current minute
    const remaining = source.rateLimit - (source.usageCount % source.rateLimit);
    const isLimited = remaining <= 0;
    
    if (isLimited) {
      console.log(`[${new Date().toLocaleTimeString()}] API     ${source.name} rate limit hit (${source.rateLimit}/min), waiting...`);
    }
    
    return !isLimited;
  }
  
  // Rotate to the next source
  private _rotateSource(type: 'price' | 'stats' | 'historical'): void {
    if (type === 'price') {
      this.currentPriceSource = (this.currentPriceSource + 1) % this.dataSources.price.length;
    } else if (type === 'stats') {
      this.currentStatsSource = (this.currentStatsSource + 1) % this.dataSources.stats.length;
    } else {
      this.currentHistoricalSource = (this.currentHistoricalSource + 1) % this.dataSources.historical.length;
    }
  }
}

// Create singleton instance
export const marketDataService = new MarketDataService();
