import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/stores/useAppStore';
import {
  Settings,
  User,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  PanelRight,
  PanelRightClose
} from 'lucide-react';

export function Header() {
  const { 
    settings, 
    updateSettings, 
    mcpServers, 
    dataSources, 
    isRightPanelOpen, 
    toggleRightPanel 
  } = useAppStore();

  const connectedServers = mcpServers.filter(s => s.status === 'connected').length;
  const connectedSources = dataSources.filter(s => s.status === 'connected').length;
  const hasErrors = mcpServers.some(s => s.status === 'error');

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
        
        {/* Model Selection */}
        <Select
          value={settings.ollamaModel}
          onValueChange={(value) => updateSettings({ ollamaModel: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="llama3.2">Llama 3.2 (7B)</SelectItem>
            <SelectItem value="llama3.2:13b">Llama 3.2 (13B)</SelectItem>
            <SelectItem value="mistral">Mistral 7B</SelectItem>
            <SelectItem value="codellama">Code Llama 7B</SelectItem>
            <SelectItem value="phi3">Phi-3 Mini</SelectItem>
          </SelectContent>
        </Select>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={hasErrors ? "destructive" : connectedServers > 0 ? "default" : "secondary"}
            className="gap-1"
          >
            {hasErrors ? (
              <XCircle className="h-3 w-3" />
            ) : connectedServers > 0 ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {connectedServers + connectedSources} Connected
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Right Panel Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRightPanel}
          className="h-8 w-8 p-0"
        >
          {isRightPanelOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRight className="h-4 w-4" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  U
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@ragforge.ai
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}