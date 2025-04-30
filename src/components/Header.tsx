
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bitcoin, ChartLine, Play, Pause, Settings } from "lucide-react";
import { strategyService } from "@/services/strategyService";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isRunning, setIsRunning] = useState(strategyService.isRunning());
  
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
              ? "bg-primary/20 hover:bg-primary/30 text-primary" 
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
        
        <Button variant="outline" className="text-xs sm:text-sm border-dark-border hover:border-primary hover:bg-transparent">
          <ChartLine className="w-4 h-4 mr-2" /> Real-time Data
        </Button>
        
        <Button variant="outline" className="text-xs sm:text-sm border-dark-border hover:border-primary hover:bg-transparent">
          <Settings className="w-4 h-4 mr-2" /> Settings
        </Button>
      </div>
    </header>
  );
};

export default Header;
