
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, CircleDollarSign, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradingStats } from "@/services/tradingService";

interface TradingDashboardProps {
  stats: TradingStats;
}

const TradingDashboard = ({ stats }: TradingDashboardProps) => {
  const profitColor = useMemo(() => {
    return stats.profitToday >= 0 ? "text-green-400" : "text-red-400";
  }, [stats.profitToday]);
  
  const profitIcon = useMemo(() => {
    return stats.profitToday >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />;
  }, [stats.profitToday]);
  
  const totalProfitColor = useMemo(() => {
    return stats.totalProfit >= 0 ? "text-green-400" : "text-red-400";
  }, [stats.totalProfit]);
  
  const winRateColor = useMemo(() => {
    const rate = stats.winRate * 100;
    if (rate >= 60) return "text-green-400";
    if (rate >= 50) return "text-yellow-400";
    return "text-red-400";
  }, [stats.winRate]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                {(stats.winRate * 100).toFixed(1)}%
              </h3>
            </div>
          </div>
          <div className="bg-dark-border/20 p-2">
            <div className="h-1.5 bg-dark-border w-full rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  stats.winRate >= 0.6 ? "bg-green-400" :
                  stats.winRate >= 0.5 ? "bg-yellow-400" : "bg-red-400"
                )}
                style={{ width: `${stats.winRate * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingDashboard;
