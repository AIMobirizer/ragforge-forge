import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import {
  MessageSquare,
  Server,
  Database,
  Brain,
  BarChart3,
  Settings,
  Circle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { title: 'Chat', url: '/', icon: MessageSquare },
  { title: 'MCP Servers', url: '/mcp-setup', icon: Server },
  { title: 'Data Sources', url: '/data-sources', icon: Database },
  { title: 'RAG Dashboard', url: '/rag-dashboard', icon: Brain },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-3 w-3 text-success" />;
    case 'error':
      return <XCircle className="h-3 w-3 text-destructive" />;
    case 'connecting':
    case 'syncing':
      return <Clock className="h-3 w-3 text-warning animate-pulse" />;
    default:
      return <Circle className="h-3 w-3 text-muted-foreground" />;
  }
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { mcpServers, dataSources } = useAppStore();
  
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const connectedServers = mcpServers.filter(s => s.status === 'connected').length;
  const connectedSources = dataSources.filter(s => s.status === 'connected').length;

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            {state !== 'collapsed' && (
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-sidebar-foreground">RagForge</h1>
                <p className="text-xs text-sidebar-foreground/70">AI Assistant</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'hover:bg-sidebar-accent/50'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* MCP Servers */}
        {state !== 'collapsed' && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              MCP Servers
              <Badge variant="secondary" className="text-xs">
                {connectedServers}/{mcpServers.length}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2">
                {mcpServers.slice(0, 3).map((server) => (
                  <div
                    key={server.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
                  >
                    {getStatusIcon(server.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{server.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{server.status}</p>
                    </div>
                  </div>
                ))}
                {mcpServers.length > 3 && (
                  <div className="px-3 py-1">
                    <p className="text-xs text-muted-foreground">
                      +{mcpServers.length - 3} more servers
                    </p>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Data Sources */}
        {state !== 'collapsed' && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              Data Sources
              <Badge variant="secondary" className="text-xs">
                {connectedSources}/{dataSources.length}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2">
                {dataSources.slice(0, 3).map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
                  >
                    {getStatusIcon(source.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.fileCount} files • {source.status}
                      </p>
                    </div>
                  </div>
                ))}
                {dataSources.length > 3 && (
                  <div className="px-3 py-1">
                    <p className="text-xs text-muted-foreground">
                      +{dataSources.length - 3} more sources
                    </p>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Stats */}
        {state !== 'collapsed' && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">2.1 GB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-3/4 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground">
                Last sync: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}