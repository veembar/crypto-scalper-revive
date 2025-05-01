
// Define types for the strategy service
export interface StrategySignal {
  type: 'BUY' | 'SELL' | 'NEUTRAL';
  message: string;
  strength: number;
  timestamp: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  enabled: boolean;
  signalCount: {
    buy: number;
    sell: number;
  };
}

export interface BacktestResult {
  strategyId: string;
  profitPercent: number;
  tradesCount: number;
  winRate: number;
}

// Basic interface of expected strategy service
export interface StrategyServiceInterface {
  getStrategies: () => Strategy[];
  toggleStrategy: (id: string, enabled: boolean) => void;
  getBacktestResults: () => BacktestResult[];
  isRunning: () => boolean;
  start: () => void;
  pause: () => void;
  processData: (prices: number[]) => StrategySignal[];
  generateSignal: (source: string, message: string, probability: number) => StrategySignal;
}
