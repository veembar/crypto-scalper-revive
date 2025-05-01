
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000
    }
  }
});

const App = () => {
  // Apply theme from localStorage on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('btc-scalper-theme');
    if (savedTheme) {
      document.documentElement.className = '';
      document.documentElement.classList.add(savedTheme);
    } else {
      // Default theme
      document.documentElement.className = '';
      document.documentElement.classList.add('dark');
    }
    
    // Fix auto-scrolling issue with CSS
    const style = document.createElement('style');
    style.id = 'fix-scroll-behavior';
    style.textContent = `
      html, body {
        scroll-behavior: auto !important;
        overflow-x: hidden;
      }
      
      /* Make scrollbar visible */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--background, #121212);
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: var(--border-color, #333);
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--accent-color, #555);
      }
      
      /* Improve overall spacing */
      .container-fluid {
        padding: 0 1rem;
      }
      
      /* More efficient use of space */
      @media (min-width: 1024px) {
        .lg-compact-layout {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1rem;
        }
      }
    `;
    
    const existingStyle = document.getElementById('fix-scroll-behavior');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);
    
    // Prevent automatic scrolling
    window.history.scrollRestoration = 'manual';
    
    // Reset scroll position on load
    window.scrollTo(0, 0);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner closeButton position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
