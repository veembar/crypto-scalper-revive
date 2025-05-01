import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Pause, AlertTriangle, Search, ArrowUpDown } from "lucide-react";
import { strategyService } from "@/services/strategyService";
import { Strategy, BacktestResult } from "@/services/strategyTypes";
import { tradingService } from "@/services/tradingService";
import { cn } from "@/lib/utils";

const StrategyManager = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;
  
  // Load strategies and backtest results
  useEffect(() => {
    setStrategies(strategyService.getStrategies());
    setBacktestResults(strategyService.getBacktestResults());
    setIsRunning(strategyService.isRunning());
  }, []);
  
  // Toggle strategy enabled/disabled
  const toggleStrategy = (id: string, enabled: boolean) => {
    strategyService.toggleStrategy(id, enabled);
    setStrategies([...strategyService.getStrategies()]);
  };
  
  // Start/pause trading system
  const toggleSystem = () => {
    if (isRunning) {
      strategyService.pause();
    } else {
      strategyService.start();
    }
    setIsRunning(!isRunning);
  };
  
  // Get backtest result for a strategy
  const getBacktestForStrategy = (id: string) => {
    return backtestResults.find(result => result.strategyId === id);
  };
  
  // Sort strategies
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Filter and sort strategies
  const filteredStrategies = strategies
    .filter(strategy => strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       strategy.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortColumn === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortColumn === "timeframe") {
        return sortDirection === "asc" 
          ? a.timeframe.localeCompare(b.timeframe) 
          : b.timeframe.localeCompare(a.timeframe);
      } else if (sortColumn === "signals") {
        const aSignals = a.signalCount.buy + a.signalCount.sell;
        const bSignals = b.signalCount.buy + b.signalCount.sell;
        return sortDirection === "asc" ? aSignals - bSignals : bSignals - aSignals;
      } else if (sortColumn === "profit") {
        const aBacktest = getBacktestForStrategy(a.id);
        const bBacktest = getBacktestForStrategy(b.id);
        const aProfit = aBacktest?.profitPercent || 0;
        const bProfit = bBacktest?.profitPercent || 0;
        return sortDirection === "asc" ? aProfit - bProfit : bProfit - aProfit;
      } else if (sortColumn === "winRate") {
        const aBacktest = getBacktestForStrategy(a.id);
        const bBacktest = getBacktestForStrategy(b.id);
        const aWinRate = aBacktest?.winRate || 0;
        const bWinRate = bBacktest?.winRate || 0;
        return sortDirection === "asc" ? aWinRate - bWinRate : bWinRate - aWinRate;
      }
      
      return 0;
    });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredStrategies.length / itemsPerPage);
  const paginatedStrategies = filteredStrategies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Enable paper trading on first render
  useEffect(() => {
    const settings = tradingService.getSettings();
    if (!settings.enablePaperTrading) {
      tradingService.updateSettings({ enablePaperTrading: true });
    }
  }, []);

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Bitcoin Scalping Strategies</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search strategies..."
              className="h-9 w-[150px] sm:w-[200px] rounded-md border border-dark-border bg-dark-border/20 px-8 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={toggleSystem} 
            variant={isRunning ? "destructive" : "default"}
            className="w-28"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> Start
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dark-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">Active</TableHead>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  <div className="flex items-center">
                    Strategy {sortColumn === "name" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("timeframe")} className="cursor-pointer">
                  <div className="flex items-center">
                    Timeframe {sortColumn === "timeframe" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("signals")} className="text-right cursor-pointer">
                  <div className="flex items-center justify-end">
                    Signals {sortColumn === "signals" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("profit")} className="text-right cursor-pointer">
                  <div className="flex items-center justify-end">
                    Profit {sortColumn === "profit" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("winRate")} className="text-right cursor-pointer">
                  <div className="flex items-center justify-end">
                    Win Rate {sortColumn === "winRate" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStrategies.map((strategy) => {
                const backtest = getBacktestForStrategy(strategy.id);
                return (
                  <TableRow key={strategy.id} className="hover:bg-dark-border/10">
                    <TableCell className="text-center">
                      <Switch
                        checked={strategy.enabled}
                        onCheckedChange={(checked) => toggleStrategy(strategy.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {strategy.name}
                      <div className="text-xs text-muted-foreground mt-1 max-w-60 truncate">
                        {strategy.description}
                      </div>
                    </TableCell>
                    <TableCell>{strategy.timeframe}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <span className="text-green-400">{strategy.signalCount.buy}</span>
                        <span>/</span>
                        <span className="text-red-400">{strategy.signalCount.sell}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {backtest ? (
                        <span className={backtest.profitPercent >= 0 ? "text-green-400" : "text-red-400"}>
                          {backtest.profitPercent >= 0 ? "+" : ""}
                          {backtest.profitPercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {backtest ? `${backtest.tradesCount} trades` : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {backtest ? (
                        <div className="flex justify-end items-center gap-1">
                          {backtest.winRate < 0.5 && (
                            <AlertTriangle className="w-3 h-3 text-yellow-400" />
                          )}
                          <div className="text-white">
                            {(backtest.winRate * 100).toFixed()}%
                            <div className="w-20 h-1.5 bg-dark-border rounded-full overflow-hidden mt-1">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  backtest.winRate >= 0.7 ? "bg-green-400" :
                                  backtest.winRate >= 0.6 ? "bg-blue-400" :
                                  backtest.winRate >= 0.5 ? "bg-yellow-400" : 
                                  "bg-red-400"
                                )}
                                style={{ width: `${backtest.winRate * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {paginatedStrategies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No strategies found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-dark-border/20 border-dark-border h-8 w-8 p-0"
            >
              &lt;
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-dark-border/20 border-dark-border h-8 w-8 p-0"
            >
              &gt;
            </Button>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Total: {strategies.length} strategies, {strategies.filter(s => s.enabled).length} active</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyManager;
