
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { marketDataService } from "@/services/marketDataService";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ApiStatus = () => {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update API status regularly
  useEffect(() => {
    const updateStatus = () => {
      setApiStatus(marketDataService.getAPIStatus());
    };
    
    // Initial update
    updateStatus();
    
    // Update every 10 seconds
    const intervalId = setInterval(updateStatus, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const refreshConnections = async () => {
    setIsRefreshing(true);
    
    try {
      console.log(`[${new Date().toLocaleTimeString()}] CONFIG   Refreshing API connections`);
      // Simulate refreshing connections
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log result
      let workingApis = 0;
      if (apiStatus) {
        workingApis = [...apiStatus.price, ...apiStatus.stats].filter(api => api.enabled).length;
      }
      
      console.log(`[${new Date().toLocaleTimeString()}] API     Refreshed connections - ${workingApis} working APIs`);
      toast.success(`API connections refreshed: ${workingApis} working connections`);
      
      // Update status
      setApiStatus(marketDataService.getAPIStatus());
    } catch (error) {
      console.log(`[${new Date().toLocaleTimeString()}] ERROR   Failed to refresh API connections: ${error.message}`);
      toast.error("Failed to refresh API connections");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  if (!apiStatus) {
    return null;
  }
  
  // Calculate total API status
  const totalApis = [...apiStatus.price, ...apiStatus.stats].length;
  const workingApis = [...apiStatus.price, ...apiStatus.stats].filter(api => api.enabled).length;
  const statusPercentage = Math.round((workingApis / totalApis) * 100);
  
  const statusText = statusPercentage === 100 ? "All Systems Operational" :
                     statusPercentage >= 75 ? "Most Systems Operational" :
                     statusPercentage >= 50 ? "Partial System Outage" :
                     "Major System Outage";
  
  const statusColor = statusPercentage === 100 ? "text-green-400" :
                      statusPercentage >= 75 ? "text-blue-400" :
                      statusPercentage >= 50 ? "text-yellow-400" :
                      "text-red-400";

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">API Status</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={isRefreshing}
          onClick={refreshConnections}
          className="h-8 px-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="ml-1">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-2 bg-dark-border/30 rounded-md">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`}></span>
              <span>{statusText}</span>
            </div>
            <span className={`text-sm font-medium ${statusColor}`}>{statusPercentage}%</span>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Price Data Sources</h3>
            <div className="space-y-2">
              {apiStatus.price.map((source: any) => (
                <div key={source.name} className="flex justify-between items-center">
                  <span className="text-sm">{source.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {source.usageCount}/{source.rateLimit} used
                    </span>
                    <div className="flex items-center">
                      {!source.enabled && <AlertTriangle className="h-3 w-3 text-orange-400 mr-1" />}
                      <span className={`h-2 w-2 rounded-full ${source.enabled ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Market Data Sources</h3>
            <div className="space-y-2">
              {apiStatus.stats.map((source: any) => (
                <div key={source.name} className="flex justify-between items-center">
                  <span className="text-sm">{source.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {source.usageCount}/{source.rateLimit} used
                    </span>
                    <div className="flex items-center">
                      {!source.enabled && <AlertTriangle className="h-3 w-3 text-orange-400 mr-1" />}
                      <span className={`h-2 w-2 rounded-full ${source.enabled ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Web Scrapers</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">News Scraper</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 15)}/30 used
                  </span>
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Social Media Scraper</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 15)}/30 used
                  </span>
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Trading View Signals</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 15)}/30 used
                  </span>
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatus;
