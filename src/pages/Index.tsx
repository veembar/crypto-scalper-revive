import { useState, useEffect } from "react";
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

import { marketDataService, CryptoPrice, CryptoStats } from "@/services/marketDataService";
import { strategyService, StrategySignal } from "@/services/strategyService";
import { tradingService } from "@/services/tradingService";

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

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch initial Bitcoin stats
        const stats = await marketDataService.getBitcoinStats();
        setBtcStats(stats);
        
        // Fetch initial price data
        const initialPriceData: CryptoPrice[] = [];
        for (let i = 0; i < 30; i++) {
          const priceData = await marketDataService.getBitcoinPrice();
          // Add some random variance for historical data
          initialPriceData.unshift({
            ...priceData,
            price: priceData.price * (1 + (Math.random() - 0.5) * 0.01),
          });
        }
        
        setChartData(initialPriceData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Fetch trade history
    setTrades(tradingService.getPositions());
  }, []);

  // Fetch data periodically
  useEffect(() => {
    const updateInterval = setInterval(async () => {
      if (!isLoading) {
        try {
          // Get new price data
          const newPrice = await marketDataService.getBitcoinPrice();
          
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
            const stats = await marketDataService.getBitcoinStats();
            setBtcStats(stats);
          }
          
          // Update trades/positions
          setTrades(tradingService.getPositions());
        } catch (error) {
          console.error("Error updating data:", error);
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(updateInterval);
  }, [chartData, isLoading]);

  // Current price for calculations
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 p-4">
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
          
          {/* Stats and Strategy Manager */}
          <div className="lg:col-span-1">
            <MarketStats stats={btcStats} />
          </div>
          
          <div className="lg:col-span-2">
            <StrategyManager />
          </div>
          
          {/* Positions Manager */}
          <div className="lg:col-span-3 mt-4">
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
