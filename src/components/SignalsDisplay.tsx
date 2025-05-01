
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
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
      // Add new signals to the top of the list
      const newSignals = [...signals, ...displayedSignals].slice(0, 5);
      setDisplayedSignals(newSignals);
    }
  }, [signals]);

  const renderSignalIcon = (signal: StrategySignal) => {
    if (signal.type === 'BUY') {
      return <TrendingUp className="w-4 h-4 text-profit" />;
    } else if (signal.type === 'SELL') {
      return <TrendingDown className="w-4 h-4 text-loss" />;
    } else {
      return <Lightbulb className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSignalTime = (timestamp: string) => {
    const signalTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - signalTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins === 1) {
      return '1 minute ago';
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      return signalTime.toLocaleTimeString();
    }
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Trading Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pl-1 pr-1">
          {displayedSignals.length > 0 ? (
            displayedSignals.map((signal, index) => (
              <div 
                key={`${signal.timestamp}-${index}`}
                className={cn(
                  "p-3 rounded-md flex items-start gap-3 border transition-all hover:translate-y-[-2px]",
                  signal.type === 'BUY' 
                    ? "bg-profit/10 border-profit/20" 
                    : signal.type === 'SELL'
                      ? "bg-loss/10 border-loss/20"
                      : "bg-yellow-500/10 border-yellow-500/20"
                )}
              >
                <div className={cn(
                  "mt-1 p-1 rounded-full",
                  signal.type === 'BUY' 
                    ? "bg-profit/20" 
                    : signal.type === 'SELL'
                      ? "bg-loss/20"
                      : "bg-yellow-500/20"
                )}>
                  {renderSignalIcon(signal)}
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "font-medium",
                    signal.type === 'BUY' 
                      ? "text-profit" 
                      : signal.type === 'SELL'
                        ? "text-loss"
                        : "text-yellow-400"
                  )}>
                    {signal.type} Signal (Strength: {signal.strength})
                  </div>
                  <div className="text-sm mt-1">{signal.message}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    {signal.strength > 80 && (
                      <>
                        <AlertTriangle className="w-3 h-3 mr-1 text-yellow-400" />
                        <span className="font-medium mr-2">High Probability</span>
                      </>
                    )}
                    {getSignalTime(signal.timestamp)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Lightbulb className="h-10 w-10 mb-2 text-muted-foreground opacity-50" />
              <div>No signals received yet</div>
              <div className="text-xs mt-2">Signals will appear here when trading strategies detect opportunities</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SignalsDisplay;
