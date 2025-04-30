
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bitcoin, ChartLine, Play, Pause, Settings, Calendar, Moon, Sun } from "lucide-react";
import { strategyService } from "@/services/strategyService";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";

const Header = () => {
  const [isRunning, setIsRunning] = useState(strategyService.isRunning());
  const [showSettings, setShowSettings] = useState(false);
  const [showChartSettings, setShowChartSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const toggleSystem = () => {
    if (isRunning) {
      strategyService.pause();
    } else {
      strategyService.start();
    }
    setIsRunning(!isRunning);
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
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-border/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Risk Management</h3>
                <p className="text-xs text-muted-foreground">Configure stop-loss, take-profit, and position sizing</p>
              </div>
              <div className="bg-dark-border/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Strategy Settings</h3>
                <p className="text-xs text-muted-foreground">Adjust parameters for trading strategies</p>
              </div>
              <div className="bg-dark-border/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Exchange Settings</h3>
                <p className="text-xs text-muted-foreground">Configure exchange connections and API settings</p>
              </div>
              <div className="bg-dark-border/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Notifications</h3>
                <p className="text-xs text-muted-foreground">Configure alerts and notification preferences</p>
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
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Update Frequency</h3>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button variant="outline" size="sm" className="bg-dark-border/30">5s</Button>
                <Button variant="outline" size="sm" className="bg-primary/20">15s</Button>
                <Button variant="outline" size="sm" className="bg-dark-border/30">30s</Button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">Data Sources Priority</h3>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center bg-dark-border/30 p-2 rounded">
                  <span>CoinGecko</span>
                  <Button variant="ghost" size="sm" className="h-6">↑</Button>
                </div>
                <div className="flex justify-between items-center bg-dark-border/30 p-2 rounded">
                  <span>CryptoCompare</span>
                  <Button variant="ghost" size="sm" className="h-6">↓</Button>
                </div>
                <div className="flex justify-between items-center bg-dark-border/30 p-2 rounded">
                  <span>Coinbase</span>
                  <Button variant="ghost" size="sm" className="h-6">↑</Button>
                </div>
              </div>
            </div>
          </div>
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
