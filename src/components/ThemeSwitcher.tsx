
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";
import { toast } from "sonner";

type Theme = "dark" | "cyberpunk" | "ocean" | "terminal" | "midnight";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load theme from local storage if available
    const savedTheme = localStorage.getItem('btc-scalper-theme');
    return (savedTheme as Theme) || 'dark';
  });

  useEffect(() => {
    // Apply theme classes and save to localStorage
    document.documentElement.className = '';
    document.documentElement.classList.add(theme);
    localStorage.setItem('btc-scalper-theme', theme);
    
    // Adding a slight delay to the toast to avoid it appearing during initial load
    if (theme) {
      setTimeout(() => {
        toast.success(`Theme changed to ${theme}`);
      }, 300);
    }
  }, [theme]);
  
  // Define theme options with their display names
  const themeOptions: { value: Theme; label: string }[] = [
    { value: "dark", label: "Dark (Default)" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "ocean", label: "Ocean Blue" },
    { value: "terminal", label: "Terminal" },
    { value: "midnight", label: "Midnight" }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={theme === themeOption.value ? 'bg-primary/20' : ''}
          >
            {themeOption.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSwitcher;
