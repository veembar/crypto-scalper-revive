
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bitcoin, ChartLine, Play, Pause, Settings, Calendar, Moon, Sun } from "lucide-react";
import { strategyService } from "@/services/strategyService";
import { tradingService } from "@/services/tradingService";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Header = () => {
  const [isRunning, setIsRunning] = useState(strategyService.isRunning());
  const [showSettings, setShowSettings] = useState(false);
  const [showChartSettings, setShowChartSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  // Trading settings state
  const [tradingSettings, setTradingSettings] = useState(tradingService.getSettings());
  const [updateFrequency, setUpdateFrequency] = useState(15);
  const [chartSettingsTab, setChartSettingsTab] = useState("frequency");
  
  const toggleSystem = () => {
    if (isRunning) {
      strategyService.pause();
    } else {
      strategyService.start();
    }
    setIsRunning(!isRunning);
  };
  
  const handleSettingsChange = (key, value) => {
    setTradingSettings(prev => {
      const updatedSettings = { ...prev, [key]: value };
      tradingService.updateSettings(updatedSettings);
      return updatedSettings;
    });
  };
  
  const handleDataSourcePriority = (source, direction) => {
    console.log(`[${new Date().toLocaleTimeString()}] CONFIG   Changed data source priority: ${source} ${direction}`);
    // In a real app, this would update the priority in a service
  };
  
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-dark-card border-b border-dark-border">
      <div className="flex items-center gap-2">
        <Bitcoin className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-white">BTC Scalper Pro</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "text-xs sm:text-sm border border-dark-border",
            isRunning 
              ? "bg-green-500/20 hover:bg-green-500/30 text-green-500 border-green-600" 
              : "hover:border-primary hover:bg-transparent"
          )}
          onClick={toggleSystem}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" /> Trading Active
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" /> Start Trading
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          className="text-xs sm:text-sm border-dark-border hover:border-blue-400 hover:text-blue-400 hover:bg-transparent"
          onClick={() => setShowChartSettings(true)}
        >
          <ChartLine className="w-4 h-4 mr-2 text-blue-400" /> Real-time Data
        </Button>
        
        <Button 
          variant="outline" 
          className="text-xs sm:text-sm border-dark-border hover:border-yellow-400 hover:text-yellow-400 hover:bg-transparent"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-4 h-4 mr-2 text-yellow-400" /> Settings
        </Button>
        
        <Button 
          variant="outline" 
          className="hidden sm:flex text-xs sm:text-sm border-dark-border hover:border-purple-400 hover:text-purple-400 hover:bg-transparent"
          onClick={() => setShowCalendar(true)}
        >
          <Calendar className="w-4 h-4 mr-2 text-purple-400" /> {new Date().toLocaleDateString()}
        </Button>

        <Button 
          variant="outline" 
          className="text-xs sm:text-sm border-dark-border hover:border-blue-400 hover:text-blue-400 hover:bg-transparent"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-yellow-300" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-dark-card border-dark-border text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Trading Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-border/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Risk Management</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label>Stop Loss (%)</Label>
                      <span className="text-xs">{tradingSettings.stopLossPercent}%</span>
                    </div>
                    <Slider 
                      value={[tradingSettings.stopLossPercent]} 
                      min={0.5} 
                      max={10} 
                      step={0.5} 
                      onValueChange={([val]) => handleSettingsChange('stopLossPercent', val)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label>Take Profit (%)</Label>
                      <span className="text-xs">{tradingSettings.takeProfitPercent}%</span>
                    </div>
                    <Slider 
                      value={[tradingSettings.takeProfitPercent]} 
                      min={0.5} 
                      max={10} 
                      step={0.5} 
                      onValueChange={([val]) => handleSettingsChange('takeProfitPercent', val)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label>Maximum Daily Loss (%)</Label>
                      <span className="text-xs">{tradingSettings.maxDailyLossPercent}%</span>
                    </div>
                    <Slider 
                      value={[tradingSettings.maxDailyLossPercent]} 
                      min={1} 
                      max={20} 
                      step={1} 
                      onValueChange={([val]) => handleSettingsChange('maxDailyLossPercent', val)} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-dark-border/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Strategy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Use Trailing Stop</Label>
                    <Switch 
                      checked={tradingSettings.useTrailingStop} 
                      onCheckedChange={(val) => handleSettingsChange('useTrailingStop', val)} 
                    />
                  </div>
                  
                  {tradingSettings.useTrailingStop && (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label>Trailing Stop (%)</Label>
                        <span className="text-xs">{tradingSettings.trailingStopPercent}%</span>
                      </div>
                      <Slider 
                        value={[tradingSettings.trailingStopPercent]} 
                        min={0.1} 
                        max={5} 
                        step={0.1} 
                        onValueChange={([val]) => handleSettingsChange('trailingStopPercent', val)} 
                      />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label>Trade Size (BTC)</Label>
                      <span className="text-xs">{tradingSettings.tradeSize} BTC</span>
                    </div>
                    <Slider 
                      value={[tradingSettings.tradeSize * 100]} 
                      min={0.01 * 100} 
                      max={0.1 * 100} 
                      step={0.01 * 100} 
                      onValueChange={([val]) => handleSettingsChange('tradeSize', val / 100)} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label>Max Open Trades</Label>
                      <span className="text-xs">{tradingSettings.maxOpenTrades}</span>
                    </div>
                    <Slider 
                      value={[tradingSettings.maxOpenTrades]} 
                      min={1} 
                      max={10} 
                      step={1} 
                      onValueChange={([val]) => handleSettingsChange('maxOpenTrades', val)} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-dark-border/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Trading Mode</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Paper Trading</Label>
                    <Switch 
                      checked={tradingSettings.enablePaperTrading} 
                      onCheckedChange={(val) => handleSettingsChange('enablePaperTrading', val)} 
                    />
                  </div>
                  
                  {tradingSettings.enablePaperTrading && (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label>Paper Balance ($)</Label>
                        <span className="text-xs">${tradingSettings.paperTradingBalance.toFixed(2)}</span>
                      </div>
                      <Slider 
                        value={[tradingSettings.paperTradingBalance]} 
                        min={1000} 
                        max={50000} 
                        step={1000} 
                        onValueChange={([val]) => handleSettingsChange('paperTradingBalance', val)} 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Label>Live Trading</Label>
                    <Switch 
                      checked={tradingSettings.enableLiveTrading} 
                      onCheckedChange={(val) => handleSettingsChange('enableLiveTrading', val)} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-dark-border/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Trade Alerts</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Price Alerts</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Strategy Alerts</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chart Settings Dialog */}
      <Dialog open={showChartSettings} onOpenChange={setShowChartSettings}>
        <DialogContent className="bg-dark-card border-dark-border text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Real-time Data Settings</DialogTitle>
          </DialogHeader>
          <Tabs value={chartSettingsTab} onValueChange={setChartSettingsTab}>
            <TabsList className="bg-dark-border/20 mb-4">
              <TabsTrigger value="frequency">Update Frequency</TabsTrigger>
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
              <TabsTrigger value="timeframes">Chart Timeframes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="frequency" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Update Frequency</h3>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={updateFrequency === 5 ? "bg-primary/20" : "bg-dark-border/30"}
                    onClick={() => {
                      setUpdateFrequency(5);
                      console.log(`[${new Date().toLocaleTimeString()}] CONFIG   Set data refresh rate to 5 seconds`);
                    }}
                  >
                    5s
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={updateFrequency === 15 ? "bg-primary/20" : "bg-dark-border/30"}
                    onClick={() => {
                      setUpdateFrequency(15);
                      console.log(`[${new Date().toLocaleTimeString()}] CONFIG   Set data refresh rate to 15 seconds`);
                    }}
                  >
                    15s
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={updateFrequency === 30 ? "bg-primary/20" : "bg-dark-border/30"}
                    onClick={() => {
                      setUpdateFrequency(30);
                      console.log(`[${new Date().toLocaleTimeString()}] CONFIG   Set data refresh rate to 30 seconds`);
                    }}
                  >
                    30s
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sources" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Data Sources Priority</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center bg-dark-border/30 p-2 rounded">
                    <span>CoinGecko</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('CoinGecko', 'up')}>↑</Button>
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('CoinGecko', 'down')}>↓</Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-dark-border/30 p-2 rounded">
                    <span>CryptoCompare</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('CryptoCompare', 'up')}>↑</Button>
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('CryptoCompare', 'down')}>↓</Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-dark-border/30 p-2 rounded">
                    <span>Coinbase</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('Coinbase', 'up')}>↑</Button>
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('Coinbase', 'down')}>↓</Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-dark-border/30 p-2 rounded">
                    <span>Binance</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('Binance', 'up')}>↑</Button>
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('Binance', 'down')}>↓</Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-dark-border/30 p-2 rounded">
                    <span>Alternative.me</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('Alternative.me', 'up')}>↑</Button>
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => handleDataSourcePriority('Alternative.me', 'down')}>↓</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="timeframes" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Chart Timeframes</h3>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <Button variant="outline" size="sm" className="bg-dark-border/30">1min</Button>
                  <Button variant="outline" size="sm" className="bg-primary/20">5min</Button>
                  <Button variant="outline" size="sm" className="bg-dark-border/30">15min</Button>
                  <Button variant="outline" size="sm" className="bg-dark-border/30">30min</Button>
                  <Button variant="outline" size="sm" className="bg-dark-border/30">1h</Button>
                  <Button variant="outline" size="sm" className="bg-dark-border/30">4h</Button>
                  <Button variant="outline" size="sm" className="bg-dark-border/30">1d</Button>
                  <Button variant="outline" size="sm" className="bg-dark-border/30">1w</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="bg-dark-card border-dark-border text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Trading Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-dark-border/30 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Upcoming Economic Events</h3>
              <div className="space-y-2">
                <div className="border-l-2 border-yellow-400 pl-2">
                  <p className="text-xs font-medium">Federal Reserve Interest Rate Decision</p>
                  <p className="text-xs text-muted-foreground">May 1, 2025 - 2:00 PM EST</p>
                </div>
                <div className="border-l-2 border-blue-400 pl-2">
                  <p className="text-xs font-medium">US Non-Farm Payrolls</p>
                  <p className="text-xs text-muted-foreground">May 3, 2025 - 8:30 AM EST</p>
                </div>
                <div className="border-l-2 border-green-400 pl-2">
                  <p className="text-xs font-medium">Bitcoin Halving Event</p>
                  <p className="text-xs text-muted-foreground">May 8, 2025 (Estimated)</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <div className="text-muted-foreground">Su</div>
              <div className="text-muted-foreground">Mo</div>
              <div className="text-muted-foreground">Tu</div>
              <div className="text-muted-foreground">We</div>
              <div className="text-muted-foreground">Th</div>
              <div className="text-muted-foreground">Fr</div>
              <div className="text-muted-foreground">Sa</div>
              {Array.from({length: 30}, (_, i) => (
                <div key={i} className={`p-1 rounded ${i === 29 ? 'bg-primary/20 text-white' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
