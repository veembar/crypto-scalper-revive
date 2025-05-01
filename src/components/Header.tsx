
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { GitGraph, Settings, ChartLine, LogOut } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

const Header = () => {
  return (
    <header className="border-b border-dark-border p-4 sticky top-0 z-10 bg-background">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <ChartLine className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">BTC Scalper Pro</h1>
          <span className="text-xs px-2 py-0.5 bg-primary/20 rounded ml-2">v1.2.0</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <GitGraph className="h-4 w-4" />
            <span>Kraken Exchange</span>
          </div>
          
          <ThemeSwitcher />
          
          <Button variant="outline" size="icon">
            <Settings className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          
          <Button variant="outline" size="icon">
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
