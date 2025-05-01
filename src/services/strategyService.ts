
// Strategy service implementation
import { StrategySignal, Strategy, BacktestResult, StrategyServiceInterface } from "./strategyTypes";

// This represents our actual strategy service that would be imported from elsewhere
// For this example, we'll create a mock implementation
class StrategyServiceImplementation implements StrategyServiceInterface {
  private running: boolean = false;
  private strategies: Strategy[] = [
    {
      id: "macd-1",
      name: "MACD Crossover",
      description: "Detects when MACD line crosses above the signal line",
      timeframe: "5m",
      enabled: true,
      signalCount: { buy: 12, sell: 8 }
    },
    {
      id: "rsi-1",
      name: "RSI Overbought/Oversold",
      description: "Identifies overbought and oversold conditions using RSI",
      timeframe: "15m",
      enabled: true,
      signalCount: { buy: 5, sell: 7 }
    },
    {
      id: "bolinger-1",
      name: "Bollinger Band Bounce",
      description: "Identifies price bounce from Bollinger Band edges",
      timeframe: "1h",
      enabled: false,
      signalCount: { buy: 3, sell: 2 }
    }
  ];
  
  private backtestResults: BacktestResult[] = [
    {
      strategyId: "macd-1",
      profitPercent: 8.4,
      tradesCount: 20,
      winRate: 0.65
    },
    {
      strategyId: "rsi-1",
      profitPercent: 5.7,
      tradesCount: 12,
      winRate: 0.58
    },
    {
      strategyId: "bolinger-1",
      profitPercent: -1.2,
      tradesCount: 5,
      winRate: 0.4
    }
  ];

  getStrategies(): Strategy[] {
    return this.strategies;
  }

  toggleStrategy(id: string, enabled: boolean): void {
    this.strategies = this.strategies.map(strategy => {
      if (strategy.id === id) {
        return { ...strategy, enabled };
      }
      return strategy;
    });
  }

  getBacktestResults(): BacktestResult[] {
    return this.backtestResults;
  }

  isRunning(): boolean {
    return this.running;
  }

  start(): void {
    this.running = true;
    console.log(`[${new Date().toLocaleTimeString()}] INFO    Trading system started`);
  }

  pause(): void {
    this.running = false;
    console.log(`[${new Date().toLocaleTimeString()}] INFO    Trading system paused`);
  }

  processData(prices: number[]): StrategySignal[] {
    // This would normally process price data through all active strategies
    // For now, we'll return a simple signal if the last price is higher than the previous one
    if (prices.length < 2) return [];
    
    const signals: StrategySignal[] = [];
    const lastPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2];
    
    if (this.running && Math.random() < 0.2) {
      // Occasionally generate a signal for testing
      if (lastPrice > prevPrice) {
        signals.push({
          type: 'BUY',
          message: 'Price momentum upward',
          strength: 65,
          timestamp: new Date().toISOString()
        });
      } else if (lastPrice < prevPrice) {
        signals.push({
          type: 'SELL',
          message: 'Price momentum downward',
          strength: 60,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return signals;
  }

  generateSignal(source: string, message: string, probability: number): StrategySignal {
    // Determine signal type based on probability
    let type: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    let strength = 0;
    
    if (probability > 0.6) {
      type = 'BUY';
      strength = Math.floor(probability * 100);
    } else if (probability < 0.4) {
      type = 'SELL';
      strength = Math.floor((1 - probability) * 100);
    } else {
      type = 'NEUTRAL';
      strength = 50;
    }
    
    // Create signal
    const signal: StrategySignal = {
      type,
      message: `${source}: ${message}`,
      strength,
      timestamp: new Date().toISOString()
    };
    
    return signal;
  }
}

// Create and export the singleton instance
export const strategyService = new StrategyServiceImplementation();
