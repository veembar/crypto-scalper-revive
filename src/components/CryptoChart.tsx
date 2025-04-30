
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

interface CryptoChartProps {
  data: any[];
  title: string;
  isLoading?: boolean;
}

const CryptoChart = ({ data, title, isLoading = false }: CryptoChartProps) => {
  const [priceChange, setPriceChange] = useState<{value: number, percent: string}>({value: 0, percent: "0%"});
  
  // Calculate price change when data updates
  useEffect(() => {
    if (data.length >= 2) {
      const latestPrice = data[data.length - 1].price;
      const firstPrice = data[0].price;
      const change = latestPrice - firstPrice;
      const percentChange = (change / firstPrice) * 100;
      
      setPriceChange({
        value: change,
        percent: `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`
      });
    }
  }, [data]);

  // Format large numbers with commas
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  // Format time for x-axis
  const formatXAxis = (value: string) => {
    return value.split(" ")[0]; // Just show the time part
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card p-3 border border-dark-border rounded-md shadow-lg">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium text-white">
            ${Number(payload[0].value).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(payload[0].payload.date).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate min and max for better scaling
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.995; // 0.5% padding
  const maxPrice = Math.max(...prices) * 1.005; // 0.5% padding

  // Define chart colors based on price trend
  const isPositive = priceChange.value >= 0;
  const chartColor = isPositive ? "rgb(72, 187, 120)" : "rgb(245, 101, 101)";
  const gradientStart = isPositive ? "rgba(72, 187, 120, 0.15)" : "rgba(245, 101, 101, 0.15)";
  const gradientEnd = "rgba(0, 0, 0, 0)";

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {title}
            {isLoading && (
              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded animate-pulse-light">
                Updating...
              </span>
            )}
          </CardTitle>
          {data.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-sm">Current: ${data[data.length - 1].price.toLocaleString()}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded",
                isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              )}>
                {priceChange.percent}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          {isLoading && data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={chartColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" strokeOpacity={0.3} />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: "#CBD5E0" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12, fill: "#CBD5E0" }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  domain={[minPrice, maxPrice]}
                  padding={{ top: 10, bottom: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {data.length > 1 && (
                  <ReferenceLine
                    y={data[0].price}
                    stroke="#718096"
                    strokeDasharray="3 3"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  animationDuration={300}
                  activeDot={{ r: 6, strokeWidth: 0, fill: chartColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Last 30 data points</span>
          <span>Real-time BTC/USD Price</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoChart;
