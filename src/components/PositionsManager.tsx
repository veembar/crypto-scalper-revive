
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Clock, CheckCircle, Dices, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { tradingService, Position } from "@/services/tradingService";
import { toast } from "sonner";

interface PositionsManagerProps {
  currentPrice: number;
}

const PositionsManager = ({ currentPrice }: PositionsManagerProps) => {
  const [positions, setPositions] = useState<Position[]>(tradingService.getPositions().filter(p => p.status === 'OPEN'));
  
  const closePosition = (id: string) => {
    tradingService.closePosition(id, currentPrice, 'Manual close');
    setPositions(tradingService.getPositions().filter(p => p.status === 'OPEN'));
    toast.success("Position closed successfully");
  };
  
  return (
    <Card className="mb-6 bg-dark-card border-dark-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <CircleDollarSign className="mr-2 h-5 w-5" />
          Open Positions ({positions.length})
        </CardTitle>
        <div className="flex gap-2">
          {positions.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                positions.forEach(p => closePosition(p.id));
                toast.success("All positions closed");
              }}
              className="text-xs h-8"
            >
              Close All
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const randomType = Math.random() > 0.5 ? 'BUY' : 'SELL';
              const signal = {
                type: randomType,
                strength: 95,
                timestamp: new Date().toISOString(),
                message: "Manual Trade: High probability signal"
              };
              
              tradingService.processSignal(signal, currentPrice);
              setPositions(tradingService.getPositions().filter(p => p.status === 'OPEN'));
              toast.success(`New ${randomType.toLowerCase()} position opened`);
            }}
            className="text-xs h-8 bg-primary/20 hover:bg-primary/30 text-primary"
          >
            <Dices className="mr-1 h-3 w-3" />
            Open Test Position
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {positions.length > 0 ? (
          <ScrollArea className="h-[280px] rounded-md border border-dark-border">
            <div className="space-y-2 p-2">
              {positions.map(position => (
                <PositionCard 
                  key={position.id} 
                  position={position} 
                  currentPrice={currentPrice}
                  onClose={() => closePosition(position.id)}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mb-2 opacity-30" />
            <p>No open positions</p>
            <p className="text-xs mt-1">Open a test position or wait for signals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PositionCardProps {
  position: Position;
  currentPrice: number;
  onClose: () => void;
}

const PositionCard = ({ position, currentPrice, onClose }: PositionCardProps) => {
  // Calculate current profit/loss
  const priceChange = position.type === 'BUY'
    ? currentPrice - position.price
    : position.price - currentPrice;
  
  const profitPercent = (priceChange / position.price) * 100;
  const profit = priceChange * position.amount;
  const isProfitable = profit > 0;

  return (
    <div className="p-3 bg-dark-border/20 rounded-md border border-dark-border hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          {position.type === 'BUY' ? (
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
          )}
          <div>
            <div className="flex items-center">
              <span className="font-medium">
                {position.type} {position.amount} BTC
              </span>
              <Badge 
                variant="outline" 
                className="ml-2 text-xs"
              >
                {position.strategyId.split(':')[0]}
              </Badge>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                Opened {new Date(position.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs bg-dark-border/30 hover:bg-dark-border/50"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-xs text-muted-foreground">Entry Price</span>
          <div>${position.price.toLocaleString()}</div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Current Price</span>
          <div>${currentPrice.toLocaleString()}</div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Profit/Loss</span>
          <div className={cn(
            isProfitable ? "text-green-500" : "text-red-500"
          )}>
            {isProfitable ? "+" : ""}{profit.toFixed(2)} USD
          </div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">P/L %</span>
          <div className={cn(
            isProfitable ? "text-green-500" : "text-red-500"
          )}>
            {isProfitable ? "+" : ""}{profitPercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionsManager;
