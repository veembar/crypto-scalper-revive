
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Position } from "@/services/tradingService";

interface TradeHistoryProps {
  trades: Position[];
}

const TradeHistory = ({ trades }: TradeHistoryProps) => {
  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Trade History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          <div className="grid grid-cols-5 gap-4 py-2 border-b border-dark-border">
            <span className="text-sm font-medium text-muted-foreground">Type</span>
            <span className="text-sm font-medium text-muted-foreground">Amount</span>
            <span className="text-sm font-medium text-muted-foreground">Price</span>
            <span className="text-sm font-medium text-muted-foreground">Date</span>
            <span className="text-sm font-medium text-muted-foreground text-right">P/L</span>
          </div>
          
          {trades.length > 0 ? (
            trades.map((trade) => (
              <div key={trade.id} className="grid grid-cols-5 gap-4 py-3 border-b border-dark-border">
                <span className={cn(
                  "text-sm",
                  trade.type === "BUY" ? "text-green-400" : "text-red-400"
                )}>
                  {trade.type}
                </span>
                <span className="text-sm">{trade.amount} BTC</span>
                <span className="text-sm">${trade.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn(
                  "text-sm font-medium text-right",
                  (trade.profit || 0) >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {trade.profit !== undefined ? (
                    <>
                      {trade.profit >= 0 ? "+" : ""}{trade.profit.toFixed(2)}
                    </>
                  ) : (
                    "-"
                  )}
                </span>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              No trade history available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeHistory;
