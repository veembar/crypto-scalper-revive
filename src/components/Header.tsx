
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
import { 
  GitGraph, 
  Settings, 
  ChartLine, 
  LogOut, 
  Menu, 
  BellRing,
  Database,
  AlertCircle
} from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import NotificationsPanel from "./NotificationsPanel";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasNotifications] = useState(true);
  
  const handleSettingsClick = () => {
    toast.success("Settings panel opened");
  };
  
  return (
    <header className="border-b border-dark-border p-3 md:p-4 sticky top-0 z-10 bg-background backdrop-blur-md bg-opacity-90">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <ChartLine className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">BTC Scalper Pro</h1>
          <span className="text-xs px-2 py-0.5 bg-primary/20 rounded ml-2">v1.2.0</span>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <GitGraph className="h-4 w-4" />
            <span>Kraken Exchange</span>
          </div>
          
          <ThemeSwitcher />
          
          {/* Notification Button with indicator */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-9 h-9 sm:w-10 sm:h-10 transition-all bg-secondary/30 hover:bg-secondary/50 relative"
              >
                <BellRing className="h-[1.2rem] w-[1.2rem]" />
                {hasNotifications && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white">
                    <span className="text-[10px]">3</span>
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <NotificationsPanel />
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-9 h-9 sm:w-10 sm:h-10 transition-all bg-secondary/30 hover:bg-secondary/50"
                onClick={handleSettingsClick}
              >
                <Settings className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Database className="mr-2 h-4 w-4" />
                <span>API Configuration</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Kraken API Guidelines</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellRing className="mr-2 h-4 w-4" />
                <span>Notification Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Mobile menu */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-secondary/30 hover:bg-secondary/50">
                <Menu className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Database className="mr-2 h-4 w-4" />
                <span>API Configuration</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellRing className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Kraken API Guidelines</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
