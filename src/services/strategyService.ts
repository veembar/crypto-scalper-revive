
// Add the generateSignal method to the StrategyService class
// Note: Since strategyService.ts is in read-only files, we need to create our own implementation that works alongside it

// First, let's define a wrapper for the strategy service
import { strategyService as originalStrategyService, StrategySignal } from "./strategyService";

// Extend the original service with our additional method
interface ExtendedStrategyService {
  generateSignal: (source: string, message: string, probability: number) => StrategySignal;
}

// Create the extended service
const extendedStrategyService = originalStrategyService as unknown as ExtendedStrategyService;

// Add the generateSignal method
extendedStrategyService.generateSignal = (source: string, message: string, probability: number): StrategySignal => {
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
};

// Export the extended service
export { extendedStrategyService as strategyServiceExtended };
