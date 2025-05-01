
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, CircleDollarSign, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradingStats } from "@/services/tradingService";

interface TradingDashboardProps {
  stats: TradingStats;
}

const TradingDashboard = ({ stats }: TradingDashboardProps) => {
  // Moving from useMemo to useState to avoid React hooks issues
  const [profitColor] = useState(stats.profitToday >= 0 ? "text-green-400" : "text-red-400");
  const [profitIcon] = useState(stats.profitToday >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />);
  const [totalProfitColor] = useState(stats.totalProfit >= 0 ? "text-green-400" : "text-red-400");
  
  const winRatePercentage = stats.winRate * 100;
  let winRateColor = "text-red-400";
  if (winRatePercentage >= 60) {
    winRateColor = "text-green-400";
  } else if (winRatePercentage >= 50) {
    winRateColor = "text-yellow-400";
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4">
      <Card className="bg-dark-card border-dark-border overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            <div className="bg-primary/10 rounded-full p-2 mr-3">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paper Trading Balance</p>
              <h3 className="text-2xl font-semibold">${stats.paperBalance.toLocaleString()}</h3>
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
      
      <Card className="bg-dark-card border-dark-border overflow-hidden">
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
      
      <Card className="bg-dark-card border-dark-border overflow-hidden">
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
      
      <Card className="bg-dark-card border-dark-border overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            <div className="bg-yellow-500/10 rounded-full p-2 mr-3">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <h3 className={cn("text-2xl font-semibold", winRateColor)}>
                {winRatePercentage.toFixed(1)}%
              </h3>
            </div>
          </div>
          <div className="bg-dark-border/20 p-2">
            <div className="h-1.5 bg-dark-border w-full rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  winRatePercentage >= 60 ? "bg-green-400" :
                  winRatePercentage >= 50 ? "bg-yellow-400" : "bg-red-400"
                )}
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
