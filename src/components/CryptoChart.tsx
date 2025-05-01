
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
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, BarChart as BarChartIcon, CandlestickChart } from "lucide-react";

interface CryptoChartProps {
  data: any[];
  title: string;
  isLoading?: boolean;
}

const CryptoChart = ({ data, title, isLoading = false }: CryptoChartProps) => {
  const [priceChange, setPriceChange] = useState<{value: number, percent: string}>({value: 0, percent: "0%"});
  const [chartType, setChartType] = useState<"area" | "bar" | "ohlc">("area");
  const [timeframe, setTimeframe] = useState<string>("5min");
  
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
      const displayData = chartType === "ohlc" ? (
        <>
          <p className="text-xs text-muted-foreground">Open: ${Number(payload[0].payload.open).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Close: ${Number(payload[0].payload.close).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">High: ${Number(payload[0].payload.high).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Low: ${Number(payload[0].payload.low).toLocaleString()}</p>
        </>
      ) : (
        <p className="text-sm font-medium text-white">
          ${Number(payload[0].value).toLocaleString()}
        </p>
      );
        
      return (
        <div className="bg-dark-card p-3 border border-dark-border rounded-md shadow-lg">
          <p className="text-xs text-muted-foreground">{label}</p>
          {displayData}
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
  
  // Transform data for OHLC chart
  const transformToOHLCData = (data: any[]) => {
    // In a real app, this would use actual OHLC data
    // For now, we'll simulate it based on price
    return data.map((d, index) => {
      const basePrice = d.price;
      const volatility = basePrice * 0.01; // 1% volatility range
      
      // Simulate open, high, low prices based on the current price
      const open = index > 0 ? data[index - 1].price : basePrice * (1 - Math.random() * 0.005);
      const close = basePrice;
      const high = Math.max(open, close) + (Math.random() * volatility);
      const low = Math.min(open, close) - (Math.random() * volatility);
      
      return {
        ...d,
        open,
        high,
        close,
        low
      };
    });
  };

  // Prepare OHLC data
  const ohlcData = transformToOHLCData(data);

  // Volume data (simplified for this example)
  const volumeData = data.map(d => ({
    ...d,
    volume: d.price * (0.5 + Math.random())
  }));

  const renderOHLCBars = () => {
    return ohlcData.map((item, index) => {
      const isRising = item.close >= item.open;
      const color = isRising ? "rgb(72, 187, 120)" : "rgb(245, 101, 101)";
      const x = index * (800 / ohlcData.length);
      const width = 8;
      
      return (
        <g key={`ohlc-${index}`}>
          {/* Wick line from high to low */}
          <line
            x1={x + width/2}
            y1={item.high}
            x2={x + width/2}
            y2={item.low}
            stroke={color}
            strokeWidth={1}
          />
          {/* Body rectangle from open to close */}
          <rect
            x={x}
            y={isRising ? item.open : item.close}
            width={width}
            height={Math.abs(item.close - item.open)}
            fill={color}
          />
        </g>
      );
    });
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {title}
            {isLoading && (
              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded animate-pulse-light">
                Updating...
              </span>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Tabs defaultValue={timeframe} onValueChange={setTimeframe} className="h-8">
              <TabsList className="h-8 bg-dark-border/20">
                <TabsTrigger value="1min" className="text-xs h-6 px-2">1m</TabsTrigger>
                <TabsTrigger value="5min" className="text-xs h-6 px-2">5m</TabsTrigger>
                <TabsTrigger value="15min" className="text-xs h-6 px-2">15m</TabsTrigger>
                <TabsTrigger value="1h" className="text-xs h-6 px-2">1h</TabsTrigger>
                <TabsTrigger value="1d" className="text-xs h-6 px-2">1d</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex bg-dark-border/20 rounded-md p-0.5 gap-0.5">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-6 w-6 p-0", chartType === "area" ? "bg-primary/20" : "bg-transparent")} 
                onClick={() => setChartType("area")}
              >
                <ChartLine className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-6 w-6 p-0", chartType === "bar" ? "bg-primary/20" : "bg-transparent")} 
                onClick={() => setChartType("bar")}
              >
                <BarChartIcon className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-6 w-6 p-0", chartType === "ohlc" ? "bg-primary/20" : "bg-transparent")} 
                onClick={() => setChartType("ohlc")}
              >
                <CandlestickChart className="h-3 w-3" />
              </Button>
            </div>
            
            {data.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-sm">$
                  {data[data.length - 1].price.toLocaleString()}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                  {priceChange.percent}
                </span>
              </div>
            )}
          </div>
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
              {chartType === "area" && (
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
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
              )}
              
              {chartType === "bar" && (
                <BarChart
                  data={volumeData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
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
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#718096" }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    name="Price"
                    dataKey="price"
                    fill={chartColor}
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    name="Volume"
                    dataKey="volume"
                    fill="#718096"
                    radius={[2, 2, 0, 0]}
                    yAxisId="right"
                    opacity={0.5}
                  />
                </BarChart>
              )}
              
              {chartType === "ohlc" && (
                <AreaChart
                  data={ohlcData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
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
                    domain={['auto', 'auto']}
                    padding={{ top: 10, bottom: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/* We use the AreaChart as a container but don't render the Area */}
                  {/* Custom OHLC visualization would be implemented here */}
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{timeframe} timeframe</span>
          <span>{chartType === "area" ? "Line Chart" : chartType === "bar" ? "Bar Chart" : "OHLC Chart"}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoChart;
