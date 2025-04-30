
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PriceCard from "@/components/PriceCard";
import CryptoChart from "@/components/CryptoChart";
import MarketStats from "@/components/MarketStats";
import TradeHistory from "@/components/TradeHistory";
import {
  generateMockChartData,
  generateMockTrades,
  getBitcoinStats,
  getEthereumStats,
} from "@/services/api";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [trades, setTrades] = useState([]);
  const [btcStats, setBtcStats] = useState({
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
  const [ethStats, setEthStats] = useState({
    currentPrice: "0",
    change24h: 0,
    changePercent: "0%",
    marketCap: "$0",
    volume24h: "$0",
    circulatingSupply: "0 ETH",
    allTimeHigh: "$0",
    athDate: "-",
    changeFromATH: "0%"
  });

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API delay
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setChartData(generateMockChartData(50, 31000));
        setTrades(generateMockTrades(8));
        setBtcStats(getBitcoinStats());
        setEthStats(getEthereumStats());
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update chart data periodically
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (!isLoading) {
        // Update chart with new data point
        const lastPrice = chartData.length > 0 
          ? chartData[chartData.length - 1].price 
          : 31000;
        
        const newDataPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          price: parseFloat((lastPrice + (Math.random() - 0.5) * 100).toFixed(2)),
          date: new Date().toISOString(),
        };
        
        setChartData(prevData => [...prevData.slice(1), newDataPoint]);
        
        // Occasionally add a new trade (1 in 4 chance)
        if (Math.random() > 0.75) {
          const newTrade = generateMockTrades(1)[0];
          setTrades(prevTrades => [newTrade, ...prevTrades.slice(0, -1)]);
        }
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
  }, [chartData, isLoading]);

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
            <PriceCard
              title="Ethereum (ETH)"
              price={ethStats.currentPrice}
              change={ethStats.change24h}
              changePercent={ethStats.changePercent}
            />
          </div>
          
          {/* Empty space to align with grid */}
          <div className="hidden lg:block"></div>

          {/* Chart and Stats */}
          <div className="lg:col-span-2">
            <CryptoChart 
              data={chartData}
              title="BTC/USD Price Chart"
              isLoading={isLoading}
            />
          </div>
          
          <div className="lg:col-span-1">
            <MarketStats stats={btcStats} />
          </div>
          
          {/* Trade History */}
          <div className="lg:col-span-3 mt-4">
            <TradeHistory trades={trades} />
          </div>
        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-dark-border">
        <p>BTC Scalper Pro - Demo Version - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
