
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

const StatItem = ({ label, value, change, positive }: StatItemProps) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex flex-col items-end">
      <span className="text-sm font-medium">{value}</span>
      {change && (
        <span
          className={cn(
            "text-xs",
            positive ? "text-profit" : "text-loss"
          )}
        >
          {change}
        </span>
      )}
    </div>
  </div>
);

interface MarketStatsProps {
  stats: {
    marketCap: string;
    volume24h: string;
    circulatingSupply: string;
    allTimeHigh: string;
    athDate: string;
    changeFromATH: string;
  };
}

const MarketStats = ({ stats }: MarketStatsProps) => {
  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Market Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <StatItem label="Market Cap" value={stats.marketCap} />
          <StatItem label="24h Volume" value={stats.volume24h} />
          <StatItem label="Circulating Supply" value={stats.circulatingSupply} />
          <Separator className="my-2 bg-dark-border" />
          <StatItem label="All Time High" value={stats.allTimeHigh} />
          <StatItem label="ATH Date" value={stats.athDate} />
          <StatItem
            label="From ATH"
            value={stats.changeFromATH}
            positive={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketStats;
