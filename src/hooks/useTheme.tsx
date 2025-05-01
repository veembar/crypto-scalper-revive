
import { useState, useEffect, createContext, useContext } from "react";

type Theme = "midnight" | "dark" | "cyberpunk" | "ocean" | "terminal" | "pro-dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "midnight",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("btc-scalper-theme");
    return (savedTheme as Theme) || "midnight";
  });

  useEffect(() => {
    localStorage.setItem("btc-scalper-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    
    // Remove all theme classes first
    document.documentElement.classList.remove("dark", "cyberpunk", "ocean", "terminal", "midnight", "pro-dark");
    
    // Add the new theme class
    document.documentElement.classList.add(theme);
    
    // Handle dark mode for system components
    if (theme === "dark" || theme === "midnight" || theme === "cyberpunk" || 
        theme === "terminal" || theme === "ocean" || theme === "pro-dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Apply CSS to prevent automatic scrolling
    const style = document.createElement('style');
    style.id = 'fix-scroll-behavior';
    style.textContent = `
      html, body {
        scroll-behavior: auto !important;
        overflow-x: hidden;
        height: 100%;
      }
      
      body {
        overflow-y: auto;
      }
      
      /* Stop auto-scrolling of logs */
      .logs-container {
        overflow-y: auto;
        scroll-behavior: auto !important;
        max-height: 400px;
      }
      
      .logs-container::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }
      
      .logs-container::-webkit-scrollbar {
        width: 8px;
        background-color: rgba(0, 0, 0, 0.2);
      }
      
      .logs-container::-webkit-scrollbar-track {
        background-color: transparent;
      }
      
      /* Enhance scrollbars for better visibility */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    `;
    
    const existingStyle = document.getElementById('fix-scroll-behavior');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);
    
    // Add these fixes to prevent auto-scrolling to bottom
    window.history.scrollRestoration = 'manual';
    
    return () => {
      if (document.getElementById('fix-scroll-behavior')) {
        document.getElementById('fix-scroll-behavior')?.remove();
      }
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const themeOrder: Theme[] = ["midnight", "dark", "cyberpunk", "ocean", "terminal", "pro-dark"];
      const currentIndex = themeOrder.indexOf(prevTheme);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      
      // Show success toast when theme is changed
      const themeNames: Record<Theme, string> = {
        midnight: "Midnight",
        dark: "Dark",
        cyberpunk: "Cyberpunk",
        ocean: "Ocean",
        terminal: "Terminal",
        "pro-dark": "Pro Dark"
      };
      toast.success(`Theme changed to ${themeNames[themeOrder[nextIndex]]}`);
      
      return themeOrder[nextIndex];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default useTheme;
