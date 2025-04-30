
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { marketDataService } from "@/services/marketDataService";

const ApiStatus = () => {
  const [apiStatus, setApiStatus] = useState<any>(null);

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
  
  if (!apiStatus) {
    return null;
  }

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">API Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                    <span className={`h-2 w-2 rounded-full ${source.enabled ? 'bg-profit' : 'bg-loss'}`}></span>
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
                    <span className={`h-2 w-2 rounded-full ${source.enabled ? 'bg-profit' : 'bg-loss'}`}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatus;
