
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SystemLogsProps {
  logs: string[];
}

const SystemLogs = ({ logs }: SystemLogsProps) => {
  const [filter, setFilter] = useState("all");
  const [autoscroll, setAutoscroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Filter logs based on the selected filter
  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "info") return log.includes("INFO") || log.includes("API");
    if (filter === "trades") return log.includes("TRADE");
    if (filter === "signals") return log.includes("STRATEGY");
    if (filter === "errors") return log.includes("ERROR");
    return true;
  });
  
  // Function to colorize log messages
  const colorizeLog = (log: string) => {
    if (log.includes("INFO")) {
      return <span className="text-blue-400">{log}</span>;
    } else if (log.includes("ERROR")) {
      return <span className="text-red-400">{log}</span>;
    } else if (log.includes("WARNING")) {
      return <span className="text-yellow-400">{log}</span>;
    } else if (log.includes("TRADE")) {
      return <span className="text-green-400">{log}</span>;
    } else if (log.includes("STRATEGY")) {
      return <span className="text-purple-400">{log}</span>;
    } else if (log.includes("API")) {
      return <span className="text-cyan-400">{log}</span>;
    } else if (log.includes("CONFIG")) {
      return <span className="text-yellow-400">{log}</span>;
    } else {
      return log;
    }
  };
  
  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (autoscroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoscroll]);
  
  const clearConsole = () => {
    // In a real app, this would clear the logs array
    console.log(`[${new Date().toLocaleTimeString()}] INFO    Cleared system logs`);
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">System Logs</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-dark-border"
            onClick={() => setAutoscroll(!autoscroll)}
          >
            {autoscroll ? "Disable Autoscroll" : "Enable Autoscroll"}
          </Button>
          <Button
            variant="outline" 
            size="sm"
            className="h-7 border-dark-border"
            onClick={clearConsole}
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setFilter}>
          <TabsList className="bg-dark-border/20 mb-2">
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter}>
            <ScrollArea ref={scrollAreaRef} className="h-[300px] bg-dark-border/10 rounded-md p-2 text-xs font-mono">
              <div className="space-y-1">
                {filteredLogs.map((log, index) => (
                  <div key={index} className="whitespace-nowrap">
                    {colorizeLog(log)}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{filteredLogs.length} log entries</span>
          <span>System activity and trading events</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemLogs;
