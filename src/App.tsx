
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
  // Apply theme from localStorage on app start and fix scrolling issues
  useEffect(() => {
    const savedTheme = localStorage.getItem('btc-scalper-theme');
    // Default to 'midnight' theme if none is set
    const theme = savedTheme || 'midnight';
    
    document.documentElement.className = '';
    document.documentElement.classList.add(theme);
    localStorage.setItem('btc-scalper-theme', theme);
    
    // Fix scrolling issues with custom CSS
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
      
      /* Overall improved spacing */
      .container-fluid {
        padding: 0 1rem;
      }
      
      /* More efficient layout */
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
    
    // Fix for Safari/iOS
    document.body.style.minHeight = '100%';
    document.body.style.position = 'relative';
    
    return () => {
      if (document.getElementById('fix-scroll-behavior')) {
        document.getElementById('fix-scroll-behavior')?.remove();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner closeButton position="top-right" theme="dark" expand={true} richColors={true} />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
