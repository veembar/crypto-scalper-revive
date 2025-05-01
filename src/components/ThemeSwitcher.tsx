
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  
  // Define theme options with their display names and descriptions
  const themeOptions = [
    { value: "dark", label: "Dark", description: "Classic dark theme for night trading" },
    { value: "midnight", label: "Midnight", description: "Deep blue professional look" },
    { value: "ocean", label: "Ocean", description: "Calm blue gradient theme" },
    { value: "cyberpunk", label: "Cyberpunk", description: "Futuristic neon style" },
    { value: "terminal", label: "Trading Terminal", description: "Classic trading terminal style" },
    { value: "pro-dark", label: "Professional", description: "High contrast dark mode" }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-9 h-9 sm:w-10 sm:h-10 transition-all bg-secondary/30 hover:bg-secondary/50"
        >
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={theme === themeOption.value ? 'bg-primary/20' : ''}
          >
            <div>
              <div className="font-medium">{themeOption.label}</div>
              <p className="text-xs text-muted-foreground">{themeOption.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSwitcher;
