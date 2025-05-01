
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StrategySignal } from "@/services/strategyTypes";

interface SignalsDisplayProps {
  signals: StrategySignal[];
}

const SignalsDisplay = ({ signals }: SignalsDisplayProps) => {
  const [displayedSignals, setDisplayedSignals] = useState<StrategySignal[]>([]);
  
  // Update displayed signals when new ones arrive
  useEffect(() => {
    if (signals.length > 0) {
      // Limit to last 5 signals and merge with existing
      const newSignals = [...signals, ...displayedSignals].slice(0, 5);
      setDisplayedSignals(newSignals);
    }
  }, [signals]);

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Trading Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {displayedSignals.length > 0 ? (
            displayedSignals.map((signal, index) => (
              <div 
                key={`${signal.timestamp}-${index}`}
                className={cn(
                  "p-3 rounded-md flex items-start gap-3",
                  signal.type === 'BUY' 
                    ? "bg-profit/10 border border-profit/20" 
                    : "bg-loss/10 border border-loss/20"
                )}
              >
                <div className={cn(
                  "mt-1 p-1 rounded-full",
                  signal.type === 'BUY' ? "bg-profit/20" : "bg-loss/20"
                )}>
                  {signal.type === 'BUY' ? (
                    <TrendingUp className="w-4 h-4 text-profit" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-loss" />
                  )}
                </div>
                <div>
                  <div className={cn(
                    "font-medium",
                    signal.type === 'BUY' ? "text-profit" : "text-loss"
                  )}>
                    {signal.type} Signal (Strength: {signal.strength})
                  </div>
                  <div className="text-sm mt-1">{signal.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(signal.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No signals received yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SignalsDisplay;
