
// Global type definitions for the application

// Market data types
export interface MarketStatus {
  status: 'up' | 'down' | 'neutral';
  value: number;
  percent: number;
}

export interface ApiSource {
  name: string;
  status: 'online' | 'offline' | 'limited' | 'delayed';
  lastUpdated: string;
  totalRequests: number;
  successfulRequests: number;
}

// Chart & Time series data
export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

// Theme configuration
export type ThemeType = 'dark' | 'cyberpunk' | 'ocean' | 'terminal' | 'midnight';

export interface ThemeConfig {
  name: string;
  value: ThemeType;
  background: string;
  foreground: string;
  accent: string;
}
