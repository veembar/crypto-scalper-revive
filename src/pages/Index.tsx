
// In this file, we're going to modify the layout to better use the space
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
import { strategyService } from "@/services/strategyService";
import { StrategySignal } from "@/services/strategyTypes";
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
  const [dataSourceErrors, setDataSourceErrors] = useState<string[]>([]);
  
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tradingStarted = useRef<boolean>(strategyService.isRunning());
  const retryAttemptsRef = useRef<number>(0);
  const maxRetryAttempts = 5;

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
        retryAttemptsRef.current = 0;
        
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
        
        // Instead of creating fallback data, we'll retry with exponential backoff
        if (retryAttemptsRef.current < maxRetryAttempts) {
          retryAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, retryAttemptsRef.current), 30000);
          console.log(`[${new Date().toLocaleTimeString()}] INFO    Retrying data fetch in ${delay/1000} seconds (attempt ${retryAttemptsRef.current}/${maxRetryAttempts})...`);
          
          setTimeout(() => {
            fetchData();
          }, delay);
        } else {
          console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to fetch market data after ${maxRetryAttempts} attempts`);
          toast.error("Failed to fetch market data", {
            description: "Check your connection or try again later."
          });
        }
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
              setDataSourceErrors(prev => [...prev, `Failed to update BTC stats: ${error.message}`]);
            }
          }
          
          // Update trades/positions
          tradingService.updatePositions(newPrice.price);
          setTrades(tradingService.getPositions());
          
          // Clear any previous errors since we've successfully fetched data
          if (dataSourceErrors.length > 0) {
            setDataSourceErrors([]);
          }
        } catch (error) {
          console.error("Error updating data:", error);
          console.log(`[${new Date().toLocaleTimeString()}] ERROR   Data update failed: ${error.message}`);
          setDataSourceErrors(prev => [...prev, `Data update failed: ${error.message}`]);
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
      
      <main className="flex-1 p-2 md:p-4 overflow-x-hidden">
        <TradingDashboard stats={tradingService.getStats()} />
        
        {/* Main layout grid - Improved to use space better */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-4">
          {/* Price Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 mb-4">
            <PriceCard
              title="Bitcoin (BTC)"
              price={btcStats.currentPrice}
              change={btcStats.change24h}
              changePercent={btcStats.changePercent}
            />
            <ApiStatus />
          </div>
          
          {/* API Settings */}
          <div className="lg:col-span-4">
            <ApiKeySettings />
          </div>

          {/* Chart and Market Stats */}
          <div className="lg:col-span-9">
            <CryptoChart 
              data={chartData}
              title="BTC/USD Price Chart"
              isLoading={isLoading}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-4">
              <MarketStats stats={btcStats} />
              <SignalsDisplay signals={signals} />
            </div>
          </div>
          
          {/* Trading Strategy Sections */}
          <div className="lg:col-span-12">
            <StrategyManager />
          </div>
          
          <div className="lg:col-span-12">
            <NewsStrategy />
          </div>
          
          {/* Positions Manager */}
          <div className="lg:col-span-12">
            <PositionsManager currentPrice={currentPrice} />
          </div>
          
          {/* System Logs */}
          <div className="lg:col-span-12">
            <SystemLogs logs={logs} />
          </div>
          
          {/* Trade History */}
          <div className="lg:col-span-12">
            <TradeHistory trades={trades} />
          </div>
        </div>
      </main>
      
      <footer className="p-2 md:p-4 text-center text-sm text-muted-foreground border-t border-dark-border">
        <p>BTC Scalper Pro - {new Date().getFullYear()} - Using real-time market data</p>
      </footer>
    </div>
  );
};

export default Index;
