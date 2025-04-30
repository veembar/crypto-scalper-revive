
import { toast } from "sonner";

// Strategy types
export interface StrategySignal {
  type: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number; // 0-100
  timestamp: string;
  message: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  signalCount: { buy: number; sell: number; };
  enabled: boolean;
  lastSignal?: StrategySignal;
  calculate: (data: number[], ...args: any[]) => StrategySignal;
}

export interface BacktestResult {
  strategyId: string;
  profitPercent: number;
  tradesCount: number;
  winRate: number;
}

class StrategyService {
  private strategies: Strategy[] = [];
  private activeStrategies: Set<string> = new Set();
  private running: boolean = false;
  
  constructor() {
    this._initStrategies();
  }
  
  // Initialize predefined strategies
  private _initStrategies() {
    // Simple Moving Average Crossover
    this.strategies.push({
      id: 'sma-cross-fast',
      name: 'SMA Crossover (Fast)',
      description: 'Buy when 5-period SMA crosses above 20-period SMA, sell when crosses below',
      timeframe: '1m',
      signalCount: { buy: 0, sell: 0 },
      enabled: true,
      calculate: (prices) => {
        if (prices.length < 20) {
          return { type: 'NEUTRAL', strength: 0, timestamp: new Date().toISOString(), message: 'Insufficient data' };
        }
        
        const sma5 = this._calculateSMA(prices.slice(-5));
        const sma5Prev = this._calculateSMA(prices.slice(-6, -1));
        const sma20 = this._calculateSMA(prices.slice(-20));
        const sma20Prev = this._calculateSMA(prices.slice(-21, -1));
        
        // Detect crossover
        const crossUp = sma5Prev <= sma20Prev && sma5 > sma20;
        const crossDown = sma5Prev >= sma20Prev && sma5 < sma20;
        
        if (crossUp) {
          return {
            type: 'BUY',
            strength: 70,
            timestamp: new Date().toISOString(),
            message: '5 SMA crossed above 20 SMA'
          };
        } else if (crossDown) {
          return {
            type: 'SELL',
            strength: 70,
            timestamp: new Date().toISOString(),
            message: '5 SMA crossed below 20 SMA'
          };
        }
        
        return {
          type: 'NEUTRAL',
          strength: 0,
          timestamp: new Date().toISOString(),
          message: 'No signal'
        };
      }
    });
    
    // RSI Overbought/Oversold
    this.strategies.push({
      id: 'rsi-basic',
      name: 'RSI Basic',
      description: 'Buy when RSI(14) < 30, sell when RSI(14) > 70',
      timeframe: '5m',
      signalCount: { buy: 0, sell: 0 },
      enabled: true,
      calculate: (prices) => {
        if (prices.length < 15) {
          return { type: 'NEUTRAL', strength: 0, timestamp: new Date().toISOString(), message: 'Insufficient data' };
        }
        
        const rsi = this._calculateRSI(prices, 14);
        
        if (rsi < 30) {
          return {
            type: 'BUY',
            strength: 80,
            timestamp: new Date().toISOString(),
            message: `RSI Oversold (${rsi.toFixed(2)})`
          };
        } else if (rsi > 70) {
          return {
            type: 'SELL',
            strength: 80,
            timestamp: new Date().toISOString(),
            message: `RSI Overbought (${rsi.toFixed(2)})`
          };
        }
        
        return {
          type: 'NEUTRAL',
          strength: 0,
          timestamp: new Date().toISOString(),
          message: 'No signal'
        };
      }
    });
    
    // MACD Signal
    this.strategies.push({
      id: 'macd-cross',
      name: 'MACD Crossover',
      description: 'Buy when MACD line crosses above signal line, sell when crosses below',
      timeframe: '15m',
      signalCount: { buy: 0, sell: 0 },
      enabled: true,
      calculate: (prices) => {
        if (prices.length < 35) {
          return { type: 'NEUTRAL', strength: 0, timestamp: new Date().toISOString(), message: 'Insufficient data' };
        }
        
        const { macd, signal } = this._calculateMACD(prices);
        const prevMacd = macd[macd.length - 2];
        const prevSignal = signal[signal.length - 2];
        const currentMacd = macd[macd.length - 1];
        const currentSignal = signal[signal.length - 1];
        
        const crossUp = prevMacd <= prevSignal && currentMacd > currentSignal;
        const crossDown = prevMacd >= prevSignal && currentMacd < currentSignal;
        
        if (crossUp) {
          return {
            type: 'BUY',
            strength: 75,
            timestamp: new Date().toISOString(),
            message: 'MACD crossed above signal line'
          };
        } else if (crossDown) {
          return {
            type: 'SELL',
            strength: 75,
            timestamp: new Date().toISOString(),
            message: 'MACD crossed below signal line'
          };
        }
        
        return {
          type: 'NEUTRAL',
          strength: 0,
          timestamp: new Date().toISOString(),
          message: 'No signal'
        };
      }
    });
    
    // Add many more strategies (simplified for brevity)
    // In a real implementation, we'd add all 50 strategies here
    for (let i = 0; i < 47; i++) {
      this.strategies.push({
        id: `strategy-${i + 4}`,
        name: `Strategy ${i + 4}`,
        description: `This is a placeholder for strategy ${i + 4}`,
        timeframe: ['1m', '5m', '15m', '1h'][i % 4],
        signalCount: { buy: 0, sell: 0 },
        enabled: i < 10, // Enable only first 10 strategies by default
        calculate: (prices) => {
          // Simple random strategy for demo purposes
          const random = Math.random();
          if (random > 0.95) {
            return {
              type: 'BUY',
              strength: Math.floor(60 + Math.random() * 40),
              timestamp: new Date().toISOString(),
              message: `Strategy ${i + 4} buy signal`
            };
          } else if (random < 0.05) {
            return {
              type: 'SELL',
              strength: Math.floor(60 + Math.random() * 40),
              timestamp: new Date().toISOString(),
              message: `Strategy ${i + 4} sell signal`
            };
          }
          
          return {
            type: 'NEUTRAL',
            strength: 0,
            timestamp: new Date().toISOString(),
            message: 'No signal'
          };
        }
      });
    }
  }
  
  // Helper: Calculate SMA
  private _calculateSMA(prices: number[]): number {
    if (prices.length === 0) return 0;
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }
  
  // Helper: Calculate RSI
  private _calculateRSI(prices: number[], period: number): number {
    if (prices.length <= period) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) {
        gains += diff;
      } else {
        losses -= diff;
      }
    }
    
    if (losses === 0) return 100;
    
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }
  
  // Helper: Calculate MACD
  private _calculateMACD(prices: number[]) {
    const shortPeriod = 12;
    const longPeriod = 26;
    const signalPeriod = 9;
    
    // Calculate EMAs
    const shortEMA = this._calculateEMA(prices, shortPeriod);
    const longEMA = this._calculateEMA(prices, longPeriod);
    
    // Calculate MACD line
    const macdLine = shortEMA.map((value, index) => value - longEMA[index]);
    
    // Calculate signal line (EMA of MACD line)
    const signalLine = this._calculateEMA(macdLine, signalPeriod);
    
    return { macd: macdLine, signal: signalLine };
  }
  
  // Helper: Calculate EMA
  private _calculateEMA(prices: number[], period: number) {
    const k = 2 / (period + 1);
    const emaArray = [prices[0]];
    
    for (let i = 1; i < prices.length; i++) {
      const ema = prices[i] * k + emaArray[i - 1] * (1 - k);
      emaArray.push(ema);
    }
    
    return emaArray;
  }
  
  // Get list of all available strategies
  public getStrategies(): Strategy[] {
    return this.strategies;
  }
  
  // Enable/disable a strategy
  public toggleStrategy(id: string, enabled: boolean): void {
    const strategy = this.strategies.find(s => s.id === id);
    if (strategy) {
      strategy.enabled = enabled;
      
      if (enabled) {
        this.activeStrategies.add(id);
        toast.success(`Strategy "${strategy.name}" enabled`);
      } else {
        this.activeStrategies.delete(id);
        toast.info(`Strategy "${strategy.name}" disabled`);
      }
    }
  }
  
  // Process price data with all active strategies
  public processData(prices: number[]): StrategySignal[] {
    const signals: StrategySignal[] = [];
    
    // Only process if trading system is running
    if (!this.running) return signals;
    
    this.strategies.forEach(strategy => {
      if (strategy.enabled) {
        const signal = strategy.calculate(prices);
        
        if (signal.type !== 'NEUTRAL') {
          // Update strategy signal count
          if (signal.type === 'BUY') {
            strategy.signalCount.buy++;
          } else if (signal.type === 'SELL') {
            strategy.signalCount.sell++;
          }
          
          // Store last signal
          strategy.lastSignal = signal;
          
          // Add to signals list
          signals.push({
            ...signal,
            message: `${strategy.name}: ${signal.message}`
          });
        }
      }
    });
    
    return signals;
  }
  
  // Start trading system
  public start(): void {
    this.running = true;
    toast.success("Trading system started");
  }
  
  // Pause trading system
  public pause(): void {
    this.running = false;
    toast.info("Trading system paused");
  }
  
  // Check if trading system is running
  public isRunning(): boolean {
    return this.running;
  }
  
  // Get backtest results for strategies
  public getBacktestResults(): BacktestResult[] {
    // This would normally use historical data to backtest
    // For this demo, we'll generate random results
    return this.strategies.map(strategy => ({
      strategyId: strategy.id,
      profitPercent: Math.random() * 200 - 50, // -50% to +150%
      tradesCount: Math.floor(Math.random() * 100) + 10,
      winRate: Math.random() * 0.7 + 0.3 // 30% to 100%
    }));
  }
}

export const strategyService = new StrategyService();
