import { toast } from "sonner";
import { StrategySignal } from "./strategyTypes";

// Position types
export interface Position {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  amount: number;
  price: number;
  timestamp: string;
  strategyId: string;
  profit?: number;
  profitPercent?: number;
  status: 'OPEN' | 'CLOSED';
  closedAt?: string;
  closedPrice?: number;
}

export interface TradingSettings {
  enablePaperTrading: boolean;
  enableLiveTrading: boolean;
  tradeSize: number; // Amount of BTC per trade
  maxOpenTrades: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  paperTradingBalance: number;
  useTrailingStop: boolean;
  trailingStopPercent: number;
  maxPositionSizePercent: number;
  maxDailyLossPercent: number;
}

export interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: number;
  profitToday: number;
  openPositions: number;
  winRate: number;
  paperBalance: number;
  todayWins: number;
  todayLosses: number;
}

export interface ApiKeys {
  kraken?: {
    apiKey: string;
    apiSecret: string;
    isValid: boolean;
    balance?: {
      BTC?: number;
      USD?: number;
    };
  };
}

class TradingService {
  private settings: TradingSettings = {
    enablePaperTrading: true,
    enableLiveTrading: false,
    tradeSize: 0.01,
    maxOpenTrades: 3,
    stopLossPercent: 2,
    takeProfitPercent: 3,
    paperTradingBalance: 10000,
    useTrailingStop: false,
    trailingStopPercent: 1,
    maxPositionSizePercent: 5,
    maxDailyLossPercent: 10
  };
  
  private positions: Position[] = [];
  private apiKeys: ApiKeys = {};
  private initialized: boolean = false;
  
  constructor() {
    this.loadSettingsFromStorage();
    
    // Check localStorage for persistent trading state
    const savedState = localStorage.getItem('tradingState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        this.positions = parsedState.positions || [];
        this.initialized = true;
      } catch (error) {
        console.error("Error parsing saved trading state:", error);
      }
    }
  }
  
  private loadSettingsFromStorage() {
    const savedSettings = localStorage.getItem('tradingSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        this.settings = { ...this.settings, ...parsedSettings };
      } catch (error) {
        console.error("Error parsing saved trading settings:", error);
      }
    }
  }
  
  private saveState() {
    localStorage.setItem('tradingState', JSON.stringify({
      positions: this.positions
    }));
    
    localStorage.setItem('tradingSettings', JSON.stringify(this.settings));
  }
  
  // Get current trading settings
  public getSettings(): TradingSettings {
    return { ...this.settings };
  }
  
  // Update trading settings
  public updateSettings(newSettings: Partial<TradingSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveState();
    toast.success("Trading settings updated");
  }
  
  // Get API keys
  public getApiKeys(): ApiKeys {
    return this.apiKeys;
  }
  
  // Set API keys
  public async setKrakenApiKeys(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      // For demo purposes, we'll just validate that the keys aren't empty
      // In a real app, you'd make a test API call to validate the keys
      if (apiKey.length < 10 || apiSecret.length < 10) {
        toast.error("Invalid API keys");
        this.apiKeys.kraken = {
          apiKey,
          apiSecret,
          isValid: false
        };
        return false;
      }
      
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate getting account balance
      const fakeBalance = {
        BTC: 0.25 + (Math.random() * 0.5),
        USD: 5000 + (Math.random() * 5000)
      };
      
      this.apiKeys.kraken = {
        apiKey,
        apiSecret,
        isValid: true,
        balance: fakeBalance
      };
      
      toast.success("Kraken API keys successfully validated");
      return true;
    } catch (error) {
      console.error("Error validating Kraken API keys:", error);
      toast.error("Failed to validate Kraken API keys");
      
      this.apiKeys.kraken = {
        apiKey,
        apiSecret,
        isValid: false
      };
      
      return false;
    }
  }
  
  // Process a trade signal
  public async processSignal(signal: StrategySignal, currentPrice: number): Promise<boolean> {
    // Skip neutral signals
    if (signal.type === 'NEUTRAL') return false;
    
    // Check if we should trade based on settings
    const shouldTrade = (
      (this.settings.enablePaperTrading || this.settings.enableLiveTrading) &&
      signal.strength > 60 &&
      this.getOpenPositionsCount() < this.settings.maxOpenTrades
    );
    
    if (!shouldTrade) return false;
    
    try {
      // Create a new position
      const newPosition: Position = {
        id: `pos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: signal.type,
        symbol: 'BTC/USD',
        amount: this.settings.tradeSize,
        price: currentPrice,
        timestamp: new Date().toISOString(),
        strategyId: signal.message.split(':')[0],
        status: 'OPEN'
      };
      
      // If live trading is enabled, execute on exchange
      if (this.settings.enableLiveTrading && this.apiKeys.kraken?.isValid) {
        // In a real app, you'd call the exchange API here
        console.log(`[${new Date().toLocaleTimeString()}] TRADE   New ${signal.type.toLowerCase()} position opened. Size: ${this.settings.tradeSize} BTC, Entry: $${currentPrice.toFixed(2)}`);
        toast.success(`Live trade executed: ${signal.type} ${this.settings.tradeSize} BTC at $${currentPrice}`);
      } else {
        // Paper trading
        console.log(`[${new Date().toLocaleTimeString()}] TRADE   New ${signal.type.toLowerCase()} position opened. Size: ${this.settings.tradeSize} BTC, Entry: $${currentPrice.toFixed(2)}`);
        toast.success(`Paper trade: ${signal.type} ${this.settings.tradeSize} BTC at $${currentPrice}`);
      }
      
      // Save the position
      this.positions.push(newPosition);
      this.saveState();
      return true;
    } catch (error) {
      console.error("Error processing trade signal:", error);
      toast.error("Failed to execute trade");
      return false;
    }
  }
  
  // Update open positions with current price
  public updatePositions(currentPrice: number): void {
    this.positions.forEach(position => {
      if (position.status === 'OPEN') {
        // Calculate current profit/loss
        const priceChange = position.type === 'BUY'
          ? currentPrice - position.price
          : position.price - currentPrice;
        
        const profitPercent = (priceChange / position.price) * 100;
        const profit = priceChange * position.amount;
        
        position.profit = profit;
        position.profitPercent = profitPercent;
        
        // Check for trailing stop if enabled
        if (this.settings.useTrailingStop && profitPercent > this.settings.trailingStopPercent) {
          // Check if profit has dropped by trailingStopPercent from highest point
          // (This would require tracking highest profit for each position, simplified here)
          if (Math.random() < 0.05) { // Simplified simulation of trailing stop hit
            console.log(`[${new Date().toLocaleTimeString()}] TRADE   Trailing stop hit on ${position.type} position`);
            this.closePosition(position.id, currentPrice, 'Trailing stop hit');
            return;
          }
        }
        
        // Check if stop loss or take profit hit
        if (profitPercent <= -this.settings.stopLossPercent) {
          console.log(`[${new Date().toLocaleTimeString()}] TRADE   Stop loss hit on ${position.type} position`);
          this.closePosition(position.id, currentPrice, 'Stop loss hit');
        } else if (profitPercent >= this.settings.takeProfitPercent) {
          console.log(`[${new Date().toLocaleTimeString()}] TRADE   Take profit hit on ${position.type} position`);
          this.closePosition(position.id, currentPrice, 'Take profit hit');
        }
      }
    });
    
    this.saveState();
  }
  
  // Close a position
  public closePosition(id: string, currentPrice: number, reason: string): void {
    const position = this.positions.find(p => p.id === id);
    
    if (position && position.status === 'OPEN') {
      // Update position
      position.status = 'CLOSED';
      position.closedAt = new Date().toISOString();
      position.closedPrice = currentPrice;
      
      // Calculate final profit/loss
      const priceChange = position.type === 'BUY'
        ? currentPrice - position.price
        : position.price - currentPrice;
      
      const profitPercent = (priceChange / position.price) * 100;
      const profit = priceChange * position.amount;
      
      position.profit = profit;
      position.profitPercent = profitPercent;
      
      // Update paper trading balance
      if (this.settings.enablePaperTrading && !this.settings.enableLiveTrading) {
        this.settings.paperTradingBalance += profit;
      }
      
      // Log the trade
      const logPrefix = `[${new Date().toLocaleTimeString()}] TRADE  `;
      if (profit >= 0) {
        console.log(`${logPrefix} Closed position with profit: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`);
        toast.success(`Position closed with profit: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`);
      } else {
        console.log(`${logPrefix} Closed position with loss: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`);
        toast.error(`Position closed with loss: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`);
      }
      
      this.saveState();
    }
  }
  
  // Get all positions
  public getPositions(): Position[] {
    return [...this.positions];
  }
  
  // Get open positions count
  public getOpenPositionsCount(): number {
    return this.positions.filter(p => p.status === 'OPEN').length;
  }
  
  // Get trading statistics
  public getStats(): TradingStats {
    const closedPositions = this.positions.filter(p => p.status === 'CLOSED');
    const successfulTrades = closedPositions.filter(p => (p.profit || 0) > 0).length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = closedPositions.filter(p => p.closedAt?.startsWith(today));
    const todayProfit = todayTrades.reduce((sum, p) => sum + (p.profit || 0), 0);
    const todayWins = todayTrades.filter(p => (p.profit || 0) > 0).length;
    const todayLosses = todayTrades.filter(p => (p.profit || 0) <= 0).length;
    
    const totalProfit = closedPositions.reduce((sum, p) => sum + (p.profit || 0), 0);
    
    return {
      totalTrades: this.positions.length,
      successfulTrades,
      failedTrades: closedPositions.length - successfulTrades,
      totalProfit,
      profitToday: todayProfit,
      openPositions: this.getOpenPositionsCount(),
      winRate: closedPositions.length > 0 ? successfulTrades / closedPositions.length : 0,
      paperBalance: this.settings.paperTradingBalance,
      todayWins,
      todayLosses
    };
  }
}

export const tradingService = new TradingService();
