
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock, Server } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const KrakenApiGuidelines = () => {
  // Sample compliance data - in a real app, this would come from actual API usage metrics
  const apiUsage = {
    publicEndpoints: {
      rateLimit: 15, // calls per second
      currentUsage: 4,
      status: "healthy" // healthy, warning, critical
    },
    privateEndpoints: {
      rateLimit: 5, // calls per second
      currentUsage: 1,
      status: "healthy"
    },
    lastApiCall: new Date().toISOString(),
    complianceScore: 98
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">Healthy</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Warning</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const calculateUsagePercent = (current: number, limit: number) => {
    return Math.min(Math.round((current / limit) * 100), 100);
  };
  
  const publicUsagePercent = calculateUsagePercent(apiUsage.publicEndpoints.currentUsage, apiUsage.publicEndpoints.rateLimit);
  const privateUsagePercent = calculateUsagePercent(apiUsage.privateEndpoints.currentUsage, apiUsage.privateEndpoints.rateLimit);
  
  return (
    <Card className="mb-6 bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Kraken API Compliance Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Public Endpoints</span>
              </div>
              {getStatusBadge(apiUsage.publicEndpoints.status)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Usage Rate</span>
                <span>{apiUsage.publicEndpoints.currentUsage}/{apiUsage.publicEndpoints.rateLimit} calls/sec</span>
              </div>
              <Progress value={publicUsagePercent} className="h-1 bg-dark-border" 
                indicatorClassName={publicUsagePercent > 80 ? "bg-red-500" : publicUsagePercent > 50 ? "bg-yellow-500" : "bg-green-500"} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Private Endpoints</span>
              </div>
              {getStatusBadge(apiUsage.privateEndpoints.status)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Usage Rate</span>
                <span>{apiUsage.privateEndpoints.currentUsage}/{apiUsage.privateEndpoints.rateLimit} calls/sec</span>
              </div>
              <Progress value={privateUsagePercent} className="h-1 bg-dark-border" 
                indicatorClassName={privateUsagePercent > 80 ? "bg-red-500" : privateUsagePercent > 50 ? "bg-yellow-500" : "bg-green-500"} />
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-dark-border">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Last API Call</span>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(apiUsage.lastApiCall).toLocaleTimeString()}</span>
            </div>
            
            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end">
                {apiUsage.complianceScore >= 95 ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                )}
                <span className="text-sm">Compliance Score</span>
              </div>
              <span className={`text-xs font-medium ${apiUsage.complianceScore >= 95 ? 'text-green-500' : 'text-yellow-500'}`}>
                {apiUsage.complianceScore}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground border-t border-dark-border pt-2">
          <p>This application follows Kraken API guidelines to ensure all operations comply with exchange policies.</p>
          <ul className="list-disc pl-4 mt-1">
            <li>Rate limits strictly enforced</li>
            <li>Proper error handling & retries</li>
            <li>Secure API key management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default KrakenApiGuidelines;
