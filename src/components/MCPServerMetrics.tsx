import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/stores/useAppStore';
import { MCPServerStatus } from '@/utils/mcpSimulation';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Zap,
  Database,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MCPServerMetricsProps {
  serverId: string;
}

export function MCPServerMetrics({ serverId }: MCPServerMetricsProps) {
  const { getMCPServerStatus } = useAppStore();
  const status = getMCPServerStatus(serverId);

  if (!status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No metrics available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatNumber = (num: number, decimals = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  const getStatusColor = (status: MCPServerStatus['status']) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'error': return 'text-destructive';
      case 'disconnected': return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: MCPServerStatus['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="h-4 w-4" />;
      case 'connecting': return <Clock className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'disconnected': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Server Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-2", getStatusColor(status.status))}>
              {getStatusIcon(status.status)}
              <span className="font-semibold capitalize">{status.status}</span>
            </div>
          </div>
          
          {status.status === 'connected' && (
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>{formatUptime(status.metrics.uptime)}</span>
              </div>
              {status.lastHealthCheck && (
                <div className="flex justify-between">
                  <span>Last Check:</span>
                  <span>{new Date(status.lastHealthCheck).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Requests/sec</span>
              <span className="font-semibold">{status.metrics.requestsPerSecond.toFixed(1)}</span>
            </div>
            <Progress 
              value={Math.min(status.metrics.requestsPerSecond * 10, 100)} 
              className="h-2" 
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Avg Latency</span>
              <span className="font-semibold">{status.metrics.averageLatency.toFixed(0)}ms</span>
            </div>
            <Progress 
              value={Math.min(status.metrics.averageLatency, 100)} 
              className="h-2" 
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className={cn(
                "font-semibold",
                status.metrics.errorRate > 0.1 ? "text-destructive" : "text-success"
              )}>
                {(status.metrics.errorRate * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={status.metrics.errorRate * 100} 
              className={cn(
                "h-2",
                status.metrics.errorRate > 0.1 && "bg-destructive/20"
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Connection Pool */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Connection Pool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold text-success">
                {status.connectionPool.active}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-muted-foreground">
                {status.connectionPool.idle}
              </div>
              <div className="text-xs text-muted-foreground">Idle</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {status.connectionPool.total}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pool Utilization</span>
              <span>
                {status.connectionPool.total > 0 
                  ? Math.round((status.connectionPool.active / status.connectionPool.total) * 100)
                  : 0}%
              </span>
            </div>
            <Progress 
              value={status.connectionPool.total > 0 
                ? (status.connectionPool.active / status.connectionPool.total) * 100
                : 0} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Request Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Request Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Requests</span>
            <Badge variant="secondary">
              {formatNumber(status.metrics.totalRequests)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Errors</span>
            <Badge 
              variant={status.metrics.totalErrors > 0 ? "destructive" : "secondary"}
            >
              {formatNumber(status.metrics.totalErrors)}
            </Badge>
          </div>
          
          {status.metrics.lastRequestTime > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Request</span>
              <span className="text-sm">
                {new Date(status.metrics.lastRequestTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Health */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall</span>
                <Badge 
                  variant={
                    status.metrics.errorRate < 0.01 ? "default" :
                    status.metrics.errorRate < 0.1 ? "secondary" : "destructive"
                  }
                >
                  {status.metrics.errorRate < 0.01 ? "Excellent" :
                   status.metrics.errorRate < 0.1 ? "Good" : "Poor"}
                </Badge>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="text-xs text-muted-foreground">
              {status.metrics.requestsPerSecond > 0 ? (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                  Active traffic detected
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full" />
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}