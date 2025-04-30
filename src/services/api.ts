
// This file contains mock data for demonstration purposes
// In a real app, you would implement actual API calls

// Generate mock price data for charts
export const generateMockChartData = (length = 30, startPrice = 30000, volatility = 500) => {
  const data = [];
  let currentPrice = startPrice;
  
  const now = new Date();
  for (let i = length - 1; i >= 0; i--) {
    // Generate random price movement
    const change = (Math.random() - 0.5) * volatility;
    currentPrice = Math.max(currentPrice + change, 1000); // Ensure price doesn't go below 1000
    
    const date = new Date(now);
    date.setMinutes(now.getMinutes() - i * 10); // 10 minute intervals
    
    data.push({
      time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      price: parseFloat(currentPrice.toFixed(2)),
      date: date.toISOString(), // Store full date for tooltip
    });
  }
  
  return data;
};

// Generate mock trades
export const generateMockTrades = (count = 10) => {
  const trades = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isProfit = Math.random() > 0.4; // 60% chance of profit
    const profit = ((Math.random() * 200) + 10).toFixed(2);
    const date = new Date(now);
    date.setMinutes(now.getMinutes() - i * 30); // 30 minute intervals
    
    trades.push({
      id: `trade-${i}`,
      type: Math.random() > 0.5 ? "BUY" : "SELL",
      amount: `${(Math.random() * 0.5 + 0.01).toFixed(4)} BTC`,
      price: (Math.random() * 5000 + 25000).toFixed(2),
      date: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      profit: `${isProfit ? '+' : '-'}$${profit}`,
      isProfit,
    });
  }
  
  return trades;
};

// Mock Bitcoin stats
export const getBitcoinStats = () => {
  return {
    currentPrice: '31,486.23',
    change24h: 423.45,
    changePercent: '+1.35%',
    marketCap: '$613.4B',
    volume24h: '$24.7B',
    circulatingSupply: '19.5M BTC',
    allTimeHigh: '$69,000',
    athDate: 'Nov 10, 2021',
    changeFromATH: '-54.3%'
  };
};

// Mock Ethereum stats
export const getEthereumStats = () => {
  return {
    currentPrice: '1,864.57',
    change24h: -23.78,
    changePercent: '-1.27%',
    marketCap: '$224.1B',
    volume24h: '$13.2B',
    circulatingSupply: '120.2M ETH',
    allTimeHigh: '$4,878',
    athDate: 'Nov 10, 2021',
    changeFromATH: '-61.8%'
  };
};
