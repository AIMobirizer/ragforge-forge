import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Settings,
  FileText,
  Clock,
  BarChart3,
  Zap,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function RightPanel() {
  const { 
    isRightPanelOpen, 
    toggleRightPanel, 
    chatMessages, 
    dataSources,
    mcpServers 
  } = useAppStore();

  const lastMessage = chatMessages[chatMessages.length - 1];
  const totalFiles = dataSources.reduce((acc, source) => acc + (source.fileCount || 0), 0);
  const connectedSources = dataSources.filter(s => s.status === 'connected').length;
  const connectedServers = mcpServers.filter(s => s.status === 'connected').length;

  return (
    <div className={cn(
      "fixed right-0 top-14 bottom-0 w-80 bg-card border-l border-border transition-transform duration-300 z-40",
      isRightPanelOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Context Panel</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRightPanel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-full pb-20">
        <div className="p-4 space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{connectedSources}</div>
                  <div className="text-xs text-muted-foreground">Data Sources</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{connectedServers}</div>
                  <div className="text-xs text-muted-foreground">MCP Servers</div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalFiles.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">2.1 GB</div>
                  <div className="text-xs text-muted-foreground">Storage Used</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sources */}
          {lastMessage?.sources && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sources Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lastMessage.sources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate flex-1">{source}</span>
                      <Badge variant="secondary" className="text-xs">95%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Connections */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Active Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataSources.filter(s => s.status === 'connected').map((source) => (
                  <div key={source.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.fileCount} files
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {source.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}

                {mcpServers.filter(s => s.status === 'connected').map((server) => (
                  <div key={server.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{server.name}</p>
                      <p className="text-xs text-muted-foreground">
                        MCP Server
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {server.authMethod}
                    </Badge>
                  </div>
                ))}

                {connectedSources === 0 && connectedServers === 0 && (
                  <div className="text-center py-4">
                    <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No active connections</p>
                    <p className="text-xs text-muted-foreground">Connect data sources to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Response Time</span>
                  <span className="font-medium">1.2s</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full w-4/5" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Relevance Score</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-[92%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cache Hit Rate</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full w-[78%]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p>Query processed</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-success mt-2" />
                  <div>
                    <p>Data source synced</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                  <div>
                    <p>Index updated</p>
                    <p className="text-xs text-muted-foreground">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}