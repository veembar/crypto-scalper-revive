
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Wallet, BarChart, Activity, ArrowUpRight } from "lucide-react";
import { tradingService, Position } from "@/services/tradingService";
import { cn } from "@/lib/utils";

const PositionsManager = ({ currentPrice }: { currentPrice: number }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [stats, setStats] = useState(tradingService.getStats());
  
  // Load positions and update regularly
  useEffect(() => {
    const updatePositions = () => {
      // Update positions with current price
      tradingService.updatePositions(currentPrice);
      
      // Get latest positions
      setPositions(tradingService.getPositions());
      setStats(tradingService.getStats());
    };
    
    // Initial update
    updatePositions();
    
    // Update every 5 seconds
    const intervalId = setInterval(updatePositions, 5000);
    
    return () => clearInterval(intervalId);
  }, [currentPrice]);
  
  // Close a position
  const handleClosePosition = (id: string) => {
    tradingService.closePosition(id, currentPrice, "Manual close");
    setPositions(tradingService.getPositions());
    setStats(tradingService.getStats());
  };
  
  // Filter positions
  const openPositions = positions.filter(p => p.status === "OPEN");
  const closedPositions = positions.filter(p => p.status === "CLOSED");

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Positions & Trading Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Trading Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-dark-border/20 p-3 rounded-md border border-dark-border">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Paper Balance</div>
              <Wallet className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-400">
              ${stats.paperBalance.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-dark-border/20 p-3 rounded-md border border-dark-border">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Profit Today</div>
              <Activity className="h-4 w-4 text-green-400" />
            </div>
            <div className={cn(
              "text-lg font-bold",
              stats.profitToday >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {stats.profitToday >= 0 ? "+" : ""}${stats.profitToday.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-dark-border/20 p-3 rounded-md border border-dark-border">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <BarChart className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-yellow-400">
              {(stats.winRate * 100).toFixed()}%
              <div className="text-xs text-muted-foreground">
                {stats.todayWins}/{stats.todayWins + stats.todayLosses} today
              </div>
            </div>
          </div>
          
          <div className="bg-dark-border/20 p-3 rounded-md border border-dark-border">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Open Trades</div>
              <ArrowUpRight className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-purple-400">
              {stats.openPositions} / {stats.totalTrades}
            </div>
          </div>
        </div>
        
        {/* Positions Tabs */}
        <Tabs defaultValue="open">
          <TabsList className="bg-dark-border/20 mb-4">
            <TabsTrigger value="open">
              Open Positions ({openPositions.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed Positions ({closedPositions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="open">
            <div className="rounded-md border border-dark-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openPositions.length > 0 ? (
                    openPositions.map((position) => (
                      <TableRow key={position.id} className="hover:bg-dark-border/10">
                        <TableCell>
                          <div className={cn(
                            "flex items-center gap-1",
                            position.type === "BUY" ? "text-green-400" : "text-red-400"
                          )}>
                            {position.type === "BUY" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {position.type}
                          </div>
                        </TableCell>
                        <TableCell>{position.amount} BTC</TableCell>
                        <TableCell>${position.price.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{position.strategyId}</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          (position.profit || 0) >= 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {position.profit !== undefined && position.profitPercent !== undefined ? (
                            <>
                              {position.profit >= 0 ? "+" : ""}${position.profit.toFixed(2)}
                              <div className="text-xs">
                                ({position.profitPercent >= 0 ? "+" : ""}
                                {position.profitPercent.toFixed(2)}%)
                              </div>
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleClosePosition(position.id)}
                          >
                            Close
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No open positions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="closed">
            <div className="rounded-md border border-dark-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Entry/Close Price</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedPositions.length > 0 ? (
                    closedPositions.map((position) => (
                      <TableRow key={position.id} className="hover:bg-dark-border/10">
                        <TableCell>
                          <div className={cn(
                            "flex items-center gap-1",
                            position.type === "BUY" ? "text-green-400" : "text-red-400"
                          )}>
                            {position.type === "BUY" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {position.type}
                          </div>
                        </TableCell>
                        <TableCell>{position.amount} BTC</TableCell>
                        <TableCell>
                          ${position.price.toLocaleString()}
                          {position.closedPrice && (
                            <div className="text-xs text-muted-foreground">
                              → ${position.closedPrice.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{position.strategyId}</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          (position.profit || 0) >= 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {position.profit !== undefined && position.profitPercent !== undefined ? (
                            <>
                              {position.profit >= 0 ? "+" : ""}${position.profit.toFixed(2)}
                              <div className="text-xs">
                                ({position.profitPercent >= 0 ? "+" : ""}
                                {position.profitPercent.toFixed(2)}%)
                              </div>
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No closed positions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PositionsManager;
