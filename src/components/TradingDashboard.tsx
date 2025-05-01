
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, CircleDollarSign, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradingStats } from "@/services/tradingService";

interface TradingDashboardProps {
  stats: TradingStats;
}

const TradingDashboard = ({ stats }: TradingDashboardProps) => {
  const [profitColor, setProfitColor] = useState(stats.profitToday >= 0 ? "text-green-400" : "text-red-400");
  const [profitIcon, setProfitIcon] = useState(stats.profitToday >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />);
  const [totalProfitColor, setTotalProfitColor] = useState(stats.totalProfit >= 0 ? "text-green-400" : "text-red-400");
  
  // Update colors and icons when stats change
  useEffect(() => {
    setProfitColor(stats.profitToday >= 0 ? "text-green-400" : "text-red-400");
    setProfitIcon(stats.profitToday >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />);
    setTotalProfitColor(stats.totalProfit >= 0 ? "text-green-400" : "text-red-400");
  }, [stats]);
  
  // Calculate win rate
  const winRatePercentage = stats.winRate * 100;
  let winRateColor = "text-green-400";
  if (winRatePercentage < 95) {
    winRateColor = "text-yellow-400";
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4">
      <Card className="bg-card border-dark-border overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            <div className="bg-primary/10 rounded-full p-2 mr-3">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paper Trading Balance</p>
              <h3 className="text-2xl font-semibold">${stats.paperBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
            </div>
          </div>
          <div className="bg-dark-border/20 p-2 text-xs flex justify-between">
            <span>Starting: $10,000.00</span>
            <span className={totalProfitColor}>
              {stats.totalProfit >= 0 ? "+" : "-"}${Math.abs(stats.totalProfit).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-dark-border overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            <div className={cn(
              "rounded-full p-2 mr-3",
              stats.profitToday >= 0 ? "bg-green-500/10" : "bg-red-500/10"
            )}>
              {profitIcon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">24h Profit/Loss</p>
              <h3 className={cn("text-2xl font-semibold", profitColor)}>
                {stats.profitToday >= 0 ? "+" : "-"}${Math.abs(stats.profitToday).toFixed(2)}
              </h3>
            </div>
          </div>
          <div className="bg-dark-border/20 p-2 text-xs flex justify-between">
            <span>Trades Today: {stats.todayWins + stats.todayLosses}</span>
            <span>
              <span className="text-green-400">{stats.todayWins} W</span> / 
              <span className="text-red-400"> {stats.todayLosses} L</span>
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-dark-border overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            <div className="bg-blue-500/10 rounded-full p-2 mr-3">
              <CircleDollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open Positions</p>
              <h3 className="text-2xl font-semibold">{stats.openPositions}</h3>
            </div>
          </div>
          <div className="bg-dark-border/20 p-2 text-xs flex justify-between">
            <span>Total Trades: {stats.totalTrades}</span>
            <span>
              <span className="text-green-400">{stats.successfulTrades} W</span> / 
              <span className="text-red-400"> {stats.failedTrades} L</span>
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-dark-border overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            <div className="bg-green-500/10 rounded-full p-2 mr-3">
              <BarChart3 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <h3 className={cn("text-2xl font-semibold", winRateColor)}>
                {winRatePercentage.toFixed(1)}% 
                {winRatePercentage >= 98 && (
                  <span className="text-xs text-green-400 ml-1">HIGH PRECISION</span>
                )}
              </h3>
            </div>
          </div>
          <div className="bg-dark-border/20 p-2">
            <div className="h-1.5 bg-dark-border w-full rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-green-400"
                style={{ width: `${winRatePercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingDashboard;
