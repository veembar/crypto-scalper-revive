
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TerminalSquare, Download, RotateCw, Pause, Play, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemLogsProps {
  logs: string[];
}

const SystemLogs = ({ logs }: SystemLogsProps) => {
  const [filter, setFilter] = useState<string | null>(null);
  const [autoscroll, setAutoscroll] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [filteredLogs, setFilteredLogs] = useState<string[]>([]);
  
  // Apply filters and update filteredLogs
  useEffect(() => {
    if (!filter) {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.includes(filter)));
    }
  }, [logs, filter]);
  
  // Handle autoscroll behavior
  useEffect(() => {
    if (autoscroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoscroll]);
  
  // Download logs as text file
  const downloadLogs = () => {
    const text = logs.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `btc-scalper-logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Clear logs
  const clearLogs = () => {
    console.clear();
    // The actual logs are stored in the parent component, so this won't clear them permanently
    // but this is a UX indicator
    console.log(`[${new Date().toLocaleTimeString()}] INFO    Logs cleared by user`);
  };
  
  // Apply log category styling
  const getLogStyle = (log: string): string => {
    if (log.includes('ERROR')) return 'text-red-400';
    if (log.includes('INFO')) return 'text-blue-400';
    if (log.includes('API')) return 'text-green-400';
    if (log.includes('SIGNAL')) return 'text-yellow-400';
    if (log.includes('TRADE')) return 'text-purple-400';
    return 'text-muted-foreground';
  };
  
  // Handle log click
  const handleLogClick = (log: string) => {
    setSelectedLog(selectedLog === log ? null : log);
  };
  
  // Toggle filter
  const toggleFilter = (filterName: string) => {
    setFilter(filter === filterName ? null : filterName);
  };
  
  // Create filter buttons
  const filterButtons = [
    { name: 'ERROR', color: 'border-red-500 text-red-400' },
    { name: 'INFO', color: 'border-blue-500 text-blue-400' },
    { name: 'API', color: 'border-green-500 text-green-400' },
    { name: 'SIGNAL', color: 'border-yellow-500 text-yellow-400' },
    { name: 'TRADE', color: 'border-purple-500 text-purple-400' }
  ];

  return (
    <Card className="mb-6 bg-dark-card border-dark-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <TerminalSquare className="mr-2 h-5 w-5" />
          System Logs
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoscroll(!autoscroll)}
            title={autoscroll ? "Disable auto-scroll" : "Enable auto-scroll"}
            className={cn(
              "border-dark-border bg-dark-border/20 hover:bg-dark-border/30",
              autoscroll && "border-primary/50 bg-primary/10"
            )}
          >
            {autoscroll ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            title="Clear logs"
            className="border-dark-border bg-dark-border/20 hover:bg-dark-border/30"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadLogs}
            title="Download logs"
            className="border-dark-border bg-dark-border/20 hover:bg-dark-border/30"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {filterButtons.map((btn) => (
            <Badge
              key={btn.name}
              variant="outline"
              className={cn(
                "cursor-pointer border", 
                btn.color,
                filter === btn.name && "bg-black/50"
              )}
              onClick={() => toggleFilter(btn.name)}
            >
              {filter === btn.name && <Filter className="h-3 w-3 mr-1" />}
              {btn.name}
            </Badge>
          ))}
          
          {filter && (
            <Badge
              variant="outline"
              className="cursor-pointer border border-dark-border"
              onClick={() => setFilter(null)}
            >
              <X className="h-3 w-3 mr-1" />
              Clear filter
            </Badge>
          )}
        </div>
        
        <div 
          ref={logsContainerRef}
          className="logs-container bg-dark-border/10 border border-dark-border rounded-lg p-2 font-mono text-sm h-96 overflow-y-auto scroll-container"
        >
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                onClick={() => handleLogClick(log)}
                className={cn(
                  "py-0.5 px-1 rounded cursor-pointer hover:bg-dark-border/20 whitespace-pre-wrap break-all",
                  selectedLog === log && "bg-dark-border/30",
                  getLogStyle(log)
                )}
              >
                {log}
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {filter ? "No logs match the current filter" : "No logs available"}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div>
            Showing {filteredLogs.length} {filter ? `filtered logs (${filter})` : "logs"}
          </div>
          <div>
            Auto-scroll: {autoscroll ? "ON" : "OFF"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemLogs;
