
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Filter, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemLogsProps {
  logs: string[];
}

const SystemLogs = ({ logs }: SystemLogsProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filter, setFilter] = useState<string>("");
  
  // Parse log type from log string
  const getLogType = (log: string): string => {
    if (log.includes("INFO")) return "info";
    if (log.includes("ERROR")) return "error";
    if (log.includes("WARNING")) return "warning";
    if (log.includes("SUCCESS")) return "success";
    if (log.includes("TRADE")) return "trade";
    if (log.includes("STRATEGY")) return "strategy";
    if (log.includes("API")) return "api";
    if (log.includes("SYSTEM")) return "system";
    return "info";
  };
  
  // Filter logs based on active tab and search filter
  const filteredLogs = logs.filter(log => {
    // Filter by tab
    if (activeTab !== "all") {
      const logType = getLogType(log).toUpperCase();
      if (activeTab === "trade" && !log.includes("TRADE")) return false;
      if (activeTab === "system" && !log.includes("SYSTEM")) return false;
      if (activeTab === "api" && !log.includes("API")) return false;
    }
    
    // Filter by search term
    if (filter && !log.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get CSS class for log type
  const getLogClass = (log: string): string => {
    if (log.includes("SUCCESS") || log.includes("strategy") && log.toLowerCase().includes("buy signal")) return "text-green-400";
    if (log.includes("ERROR")) return "text-red-400";
    if (log.includes("WARNING")) return "text-yellow-400";
    if (log.includes("STRATEGY") && log.toLowerCase().includes("sell signal")) return "text-red-400";
    if (log.includes("STRATEGY")) return "text-blue-400";
    if (log.includes("TRADE")) return "text-purple-400";
    if (log.includes("API")) return "text-cyan-400";
    if (log.includes("SYSTEM")) return "text-amber-400";
    return "text-gray-300";
  };
  
  // Extract log components for highlighting
  const formatLog = (log: string) => {
    const timestampMatch = log.match(/\[\d{2}:\d{2}:\d{2} [AP]M\]/);
    const typeMatch = log.match(/\s+(INFO|ERROR|WARNING|SUCCESS|TRADE|STRATEGY|API|SYSTEM)\s+/);
    
    if (!timestampMatch) return <span>{log}</span>;
    
    const timestamp = timestampMatch[0];
    const afterTimestamp = log.substring(timestamp.length);
    
    if (!typeMatch) {
      return (
        <>
          <span className="text-gray-500">{timestamp}</span>
          <span>{afterTimestamp}</span>
        </>
      );
    }
    
    const type = typeMatch[0];
    const beforeType = afterTimestamp.substring(0, afterTimestamp.indexOf(type));
    const afterType = afterTimestamp.substring(afterTimestamp.indexOf(type) + type.length);
    
    let typeClass = "text-blue-400";
    if (type.includes("ERROR")) typeClass = "text-red-400";
    if (type.includes("WARNING")) typeClass = "text-yellow-400";
    if (type.includes("SUCCESS")) typeClass = "text-green-400";
    
    return (
      <>
        <span className="text-gray-500">{timestamp}</span>
        <span className={typeClass}>{type}</span>
        <span>{afterType}</span>
      </>
    );
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          System Logs
          <span className="text-xs rounded px-2 py-0.5 bg-dark-border text-gray-400">
            {filteredLogs.length} entries
          </span>
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter logs..."
              className="h-9 w-[150px] sm:w-[200px] rounded-md border border-dark-border bg-dark-border/20 px-8 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter && (
              <X 
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-white" 
                onClick={() => setFilter("")}
              />
            )}
          </div>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Download className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs border-dark-border hover:border-red-400 hover:text-red-400 hover:bg-transparent"
            onClick={() => console.log(`[${new Date().toLocaleTimeString()}] SYSTEM  Log console cleared`)}
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="bg-dark-border/20 mb-4">
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="trade">Trade Logs</TabsTrigger>
            <TabsTrigger value="system">System Logs</TabsTrigger>
            <TabsTrigger value="api">API Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <div className="h-[300px] overflow-y-auto border border-dark-border rounded-md bg-black/30 font-mono text-sm p-1">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "py-1 px-2 border-b border-dark-border/50 whitespace-pre-wrap",
                      getLogClass(log)
                    )}
                  >
                    {formatLog(log)}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No logs available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemLogs;
