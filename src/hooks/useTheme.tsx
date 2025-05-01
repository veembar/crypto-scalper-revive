
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
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const themeOrder: Theme[] = ["midnight", "dark", "cyberpunk", "ocean", "terminal", "pro-dark"];
      const currentIndex = themeOrder.indexOf(prevTheme);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
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
