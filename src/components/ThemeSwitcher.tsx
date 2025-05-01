
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

type Theme = "dark" | "light" | "cyberpunk" | "midnight" | "ocean" | "trading" | "professional";

interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
}

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load theme from local storage if available
    const savedTheme = localStorage.getItem('btc-scalper-theme');
    return (savedTheme as Theme) || 'dark';
  });

  // Define theme options with their display names and descriptions
  const themeOptions: ThemeOption[] = [
    { value: "dark", label: "Dark", description: "Classic dark theme for night trading" },
    { value: "light", label: "Light", description: "Clear view for daytime trading" },
    { value: "cyberpunk", label: "Cyberpunk", description: "Futuristic neon style" },
    { value: "midnight", label: "Midnight", description: "Deep blue professional look" },
    { value: "ocean", label: "Ocean", description: "Calm blue gradient theme" },
    { value: "trading", label: "Trading Terminal", description: "Classic trading terminal style" },
    { value: "professional", label: "Professional", description: "Clean minimalist style" }
  ];

  useEffect(() => {
    // Apply theme classes and save to localStorage
    document.documentElement.className = '';
    document.documentElement.classList.add(theme);
    localStorage.setItem('btc-scalper-theme', theme);
    
    // Configure theme-specific CSS variables
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--background', '#121212');
      root.style.setProperty('--card-bg', '#1e1e1e');
      root.style.setProperty('--border-color', '#333333');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a0a0a0');
      root.style.setProperty('--accent-color', '#3377FF');
    } 
    else if (theme === 'light') {
      root.style.setProperty('--background', '#f5f5f5');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--border-color', '#e0e0e0');
      root.style.setProperty('--text-primary', '#2d3748');
      root.style.setProperty('--text-secondary', '#718096');
      root.style.setProperty('--accent-color', '#3355FF');
    }
    else if (theme === 'cyberpunk') {
      root.style.setProperty('--background', '#0f0e17');
      root.style.setProperty('--card-bg', '#232135');
      root.style.setProperty('--border-color', '#4d4d72');
      root.style.setProperty('--text-primary', '#fffffe');
      root.style.setProperty('--text-secondary', '#a7a9be');
      root.style.setProperty('--accent-color', '#ff8906');
    }
    else if (theme === 'midnight') {
      root.style.setProperty('--background', '#0f1729');
      root.style.setProperty('--card-bg', '#1a2942');
      root.style.setProperty('--border-color', '#2a3f5f');
      root.style.setProperty('--text-primary', '#eef2f7');
      root.style.setProperty('--text-secondary', '#98a5b3');
      root.style.setProperty('--accent-color', '#3366ff');
    }
    else if (theme === 'ocean') {
      root.style.setProperty('--background', '#0d1b2a');
      root.style.setProperty('--card-bg', '#1b263b');
      root.style.setProperty('--border-color', '#415a77');
      root.style.setProperty('--text-primary', '#e0e1dd');
      root.style.setProperty('--text-secondary', '#bfc0c0');
      root.style.setProperty('--accent-color', '#48cae4');
    }
    else if (theme === 'trading') {
      root.style.setProperty('--background', '#131722');
      root.style.setProperty('--card-bg', '#1e222d');
      root.style.setProperty('--border-color', '#2a2e39');
      root.style.setProperty('--text-primary', '#d1d4dc');
      root.style.setProperty('--text-secondary', '#787b86');
      root.style.setProperty('--accent-color', '#2962ff');
    }
    else if (theme === 'professional') {
      root.style.setProperty('--background', '#1f2937');
      root.style.setProperty('--card-bg', '#374151');
      root.style.setProperty('--border-color', '#4b5563');
      root.style.setProperty('--text-primary', '#f9fafb');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--accent-color', '#10b981');
    }
    
    // Add CSS to prevent automatic scrolling
    const style = document.createElement('style');
    style.id = 'prevent-auto-scroll';
    style.textContent = `
      html, body {
        scroll-behavior: auto !important;
        overflow-x: hidden;
      }
      
      /* Custom scrollbar for better UI */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--background);
      }
      
      ::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--accent-color);
      }
      
      /* Improved card styling */
      .bg-dark-card {
        background-color: var(--card-bg) !important;
      }
      
      .border-dark-border {
        border-color: var(--border-color) !important;
      }
    `;
    
    const existingStyle = document.getElementById('prevent-auto-scroll');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);
    
    // Adding a slight delay to the toast to avoid it appearing during initial load
    if (theme) {
      const themeOption = themeOptions.find(option => option.value === theme);
      setTimeout(() => {
        toast.success(`Theme changed to ${themeOption?.label || theme}`);
      }, 300);
    }
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 h-9 sm:w-10 sm:h-10 transition-all">
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
