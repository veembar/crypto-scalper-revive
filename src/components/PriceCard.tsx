
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceCardProps {
  title: string;
  price: string;
  change: number;
  changePercent: string;
  className?: string;
}

const PriceCard = ({
  title,
  price,
  change,
  changePercent,
  className,
}: PriceCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card className={cn("bg-dark-card border-dark-border", className)}>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="mt-1 flex justify-between items-center">
          <p className="text-lg font-bold">${price}</p>
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              isPositive ? "text-profit" : "text-loss"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{changePercent}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceCard;
