
import React from 'react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample notifications data
const notifications = [
  {
    id: 1,
    title: "Trade Executed",
    description: "BUY 0.01 BTC at $96,450",
    time: "2 minutes ago",
    type: "success"
  },
  {
    id: 2,
    title: "Profit Alert",
    description: "Position closed with 2.4% profit",
    time: "15 minutes ago",
    type: "profit"
  },
  {
    id: 3,
    title: "API Rate Limit",
    description: "Approaching Kraken API rate limit (80%)",
    time: "1 hour ago",
    type: "warning"
  }
];

const NotificationsPanel = () => {
  return (
    <DropdownMenuContent align="end" className="w-80 p-0">
      <DropdownMenuLabel className="flex items-center justify-between p-4 border-b border-dark-border">
        <span>Notifications</span>
        <span className="text-xs text-muted-foreground">
          {notifications.length} new
        </span>
      </DropdownMenuLabel>
      
      <ScrollArea className="h-80">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No new notifications
          </div>
        )}
      </ScrollArea>
      
      <DropdownMenuSeparator />
      <DropdownMenuItem className="flex justify-center p-2 cursor-pointer text-primary">
        View all notifications
        <ArrowUpRight className="ml-1 h-4 w-4" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "success" | "profit" | "warning" | "error" | "info";
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "profit":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "hover:bg-green-500/10";
      case "profit":
        return "hover:bg-green-500/10";
      case "warning":
        return "hover:bg-yellow-500/10";
      case "error":
        return "hover:bg-red-500/10";
      default:
        return "hover:bg-blue-500/10";
    }
  };
  
  return (
    <div className={cn(
      "p-3 border-b border-dark-border cursor-pointer flex items-start gap-3",
      getBgColor()
    )}>
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{notification.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {notification.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {notification.time}
        </p>
      </div>
    </div>
  );
};

export default NotificationsPanel;
