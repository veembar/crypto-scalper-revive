
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Pause, AlertTriangle } from "lucide-react";
import { 
  strategyService, 
  Strategy, 
  BacktestResult 
} from "@/services/strategyService";
import { tradingService } from "@/services/tradingService";

const StrategyManager = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
  
  // Calculate pagination
  const totalPages = Math.ceil(strategies.length / itemsPerPage);
  const paginatedStrategies = strategies.slice(
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
        <CardTitle className="text-lg font-medium">Scalping Strategies</CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dark-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">Active</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Timeframe</TableHead>
                <TableHead className="text-right">Signals</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
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
                      <div className="text-xs text-muted-foreground mt-1 max-w-48 truncate">
                        {strategy.description}
                      </div>
                    </TableCell>
                    <TableCell>{strategy.timeframe}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <span className="text-profit">{strategy.signalCount.buy}</span>
                        <span>/</span>
                        <span className="text-loss">{strategy.signalCount.sell}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {backtest ? (
                        <span className={backtest.profitPercent >= 0 ? "text-profit" : "text-loss"}>
                          {backtest.profitPercent >= 0 ? "+" : ""}
                          {backtest.profitPercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {backtest ? (
                        <div className="flex justify-end items-center gap-1">
                          {backtest.winRate < 0.5 && (
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          )}
                          {(backtest.winRate * 100).toFixed()}%
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
                    No strategies available
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
