
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import PriceCard from "@/components/PriceCard";
import CryptoChart from "@/components/CryptoChart";
import MarketStats from "@/components/MarketStats";
import TradeHistory from "@/components/TradeHistory";
import ApiStatus from "@/components/ApiStatus";
import StrategyManager from "@/components/StrategyManager";
import PositionsManager from "@/components/PositionsManager";
import SignalsDisplay from "@/components/SignalsDisplay";
import ApiKeySettings from "@/components/ApiKeySettings";
import SystemLogs from "@/components/SystemLogs";
import NewsStrategy from "@/components/NewsStrategy";
import TradingDashboard from "@/components/TradingDashboard";

import { marketDataService, CryptoPrice, CryptoStats } from "@/services/marketDataService";
import { strategyService, StrategySignal } from "@/services/strategyService";
import { tradingService } from "@/services/tradingService";
import { toast } from "sonner";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<CryptoPrice[]>([]);
  const [signals, setSignals] = useState<StrategySignal[]>([]);
  const [trades, setTrades] = useState([]);
  const [btcStats, setBtcStats] = useState<CryptoStats>({
    currentPrice: "0",
    change24h: 0,
    changePercent: "0%",
    marketCap: "$0",
    volume24h: "$0",
    circulatingSupply: "0 BTC",
    allTimeHigh: "$0",
    athDate: "-",
    changeFromATH: "0%"
  });
  const [logs, setLogs] = useState<string[]>([]);
  
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tradingStarted = useRef<boolean>(strategyService.isRunning());

  // Log interceptor
  useEffect(() => {
    // Create initial logs
    const initialLogs = [
      `[${new Date().toLocaleTimeString()}] INFO    System initializing...`,
      `[${new Date().toLocaleTimeString()}] INFO    Loading configuration from storage`,
      `[${new Date().toLocaleTimeString()}] API     Connecting to market data providers`
    ];
    setLogs(initialLogs);
    
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      originalConsoleLog.apply(console, args);
      
      // Only capture log entries in our format
      const logString = args.join(' ');
      if (logString.match(/^\[\d{1,2}:\d{2}:\d{2}/)) {
        setLogs(prev => {
          const newLogs = [...prev, logString];
          if (newLogs.length > 200) {
            return newLogs.slice(newLogs.length - 200);
          }
          return newLogs;
        });
      }
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        console.log(`[${new Date().toLocaleTimeString()}] INFO    Initializing market data service`);
        
        // Fetch initial Bitcoin stats
        const stats = await marketDataService.getBitcoinStats();
        setBtcStats(stats);
        console.log(`[${new Date().toLocaleTimeString()}] INFO    Fetched current market stats for BTC`);
        
        // Fetch initial price data
        const initialPriceData = await marketDataService.getInitialPriceData();
        setChartData(initialPriceData);
        console.log(`[${new Date().toLocaleTimeString()}] INFO    Loaded initial price history (${initialPriceData.length} data points)`);
        
        setIsLoading(false);
        
        // Restore trading state from localstorage if it was running
        const wasTradingActive = localStorage.getItem('tradingActive') === 'true';
        if (wasTradingActive && !strategyService.isRunning()) {
          console.log(`[${new Date().toLocaleTimeString()}] INFO    Automatically resuming trading session`);
          strategyService.start();
          tradingStarted.current = true;
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to initialize market data: ${error.message}`);
        setIsLoading(false);
        
        // Add fallback to generate market data for display purposes if real data fetch fails
        createFallbackData();
      }
    };

    fetchData();
    
    // Fetch trade history
    setTrades(tradingService.getPositions());
    
    // Save trading state when user leaves/refreshes
    const handleBeforeUnload = () => {
      localStorage.setItem('tradingActive', strategyService.isRunning().toString());
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  // Create fallback data if API calls fail
  const createFallbackData = () => {
    console.log(`[${new Date().toLocaleTimeString()}] WARNING API services unavailable, waiting for connectivity...`);
    toast.error("Unable to fetch market data", {
      description: "Check your internet connection or try again later."
    });
    
    // Set minimal chart data to avoid errors
    const emptyData: CryptoPrice[] = [];
    for (let i = 0; i < 10; i++) {
      emptyData.push({
        price: 0,
        time: "00:00",
        date: new Date().toISOString()
      });
    }
    setChartData(emptyData);
  };

  // Fetch data periodically
  useEffect(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    
    const updateInterval = setInterval(async () => {
      if (!isLoading) {
        try {
          // Get new price data
          const newPrice = await marketDataService.getBitcoinPrice();
          
          // Add logging
          console.log(`[${new Date().toLocaleTimeString()}] INFO    Current BTC price: $${newPrice.price.toLocaleString()}`);
          
          // Update chart data
          setChartData(prevData => {
            const newData = [...prevData, newPrice];
            // Keep only last 50 data points
            if (newData.length > 50) {
              return newData.slice(newData.length - 50);
            }
            return newData;
          });
          
          // Process signals from strategies
          const priceValues = chartData.map(d => d.price);
          const newSignals = strategyService.processData(priceValues);
          if (newSignals.length > 0) {
            setSignals(newSignals);
            
            // Process trading signals
            newSignals.forEach(signal => {
              tradingService.processSignal(signal, newPrice.price);
            });
          }
          
          // Every few updates, also refresh Bitcoin stats
          if (Math.random() < 0.2) {
            try {
              const stats = await marketDataService.getBitcoinStats();
              setBtcStats(stats);
            } catch (error) {
              console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to update BTC stats: ${error.message}`);
            }
          }
          
          // Update trades/positions
          tradingService.updatePositions(newPrice.price);
          setTrades(tradingService.getPositions());
        } catch (error) {
          console.error("Error updating data:", error);
          console.log(`[${new Date().toLocaleTimeString()}] ERROR   Data update failed: ${error.message}`);
        }
      }
    }, 5000); // Update every 5 seconds
    
    updateIntervalRef.current = updateInterval;

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [chartData, isLoading]);

  // Current price for calculations
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 p-4">
        <TradingDashboard stats={tradingService.getStats()} />
        
        {/* Main layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Price Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <PriceCard
              title="Bitcoin (BTC)"
              price={btcStats.currentPrice}
              change={btcStats.change24h}
              changePercent={btcStats.changePercent}
            />
            <ApiStatus />
          </div>
          
          {/* API Settings */}
          <div className="lg:col-span-1">
            <ApiKeySettings />
          </div>

          {/* Chart and Signals */}
          <div className="lg:col-span-2">
            <CryptoChart 
              data={chartData}
              title="BTC/USD Price Chart"
              isLoading={isLoading}
            />
          </div>
          
          <div className="lg:col-span-1">
            <SignalsDisplay signals={signals} />
          </div>
          
          {/* News Strategy Section */}
          <div className="lg:col-span-3">
            <NewsStrategy />
          </div>
          
          {/* Stats and Strategy Manager */}
          <div className="lg:col-span-1">
            <MarketStats stats={btcStats} />
          </div>
          
          <div className="lg:col-span-2">
            <StrategyManager />
          </div>
          
          {/* System Logs */}
          <div className="lg:col-span-3 mt-4">
            <SystemLogs logs={logs} />
          </div>
          
          {/* Positions Manager */}
          <div className="lg:col-span-3">
            <PositionsManager currentPrice={currentPrice} />
          </div>
          
          {/* Trade History */}
          <div className="lg:col-span-3">
            <TradeHistory trades={trades} />
          </div>
        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-dark-border">
        <p>BTC Scalper Pro - {new Date().getFullYear()} - Using real-time market data</p>
      </footer>
    </div>
  );
};

export default Index;
