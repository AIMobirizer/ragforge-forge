import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppStore, MCPServer } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import {
  Server,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Circle,
  TestTube
} from 'lucide-react';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'connecting':
      return <Clock className="h-4 w-4 text-warning animate-pulse" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'default';
    case 'error':
      return 'destructive';
    case 'connecting':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function MCPSetup() {
  const { mcpServers, addMCPServer, updateMCPServer, removeMCPServer } = useAppStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    endpoint: string;
    authMethod: 'none' | 'apikey' | 'oauth' | 'bearer';
    description: string;
  }>({
    name: '',
    endpoint: '',
    authMethod: 'none',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      endpoint: '',
      authMethod: 'none',
      description: ''
    });
    setEditingServer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingServer) {
      updateMCPServer(editingServer.id, {
        ...formData
      });
      toast({
        title: "Server updated",
        description: "MCP server configuration has been updated successfully."
      });
    } else {
      addMCPServer(formData);
      toast({
        title: "Server added",
        description: "New MCP server has been added successfully."
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (server: MCPServer) => {
    setEditingServer(server);
    setFormData({
      name: server.name,
      endpoint: server.endpoint,
      authMethod: server.authMethod,
      description: server.description
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    removeMCPServer(id);
    toast({
      title: "Server removed",
      description: "MCP server has been removed successfully."
    });
  };

  const testConnection = async (serverId: string) => {
    updateMCPServer(serverId, { status: 'connecting' });
    
    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      updateMCPServer(serverId, { 
        status: success ? 'connected' : 'error'
      });
      
      toast({
        title: success ? "Connection successful" : "Connection failed",
        description: success 
          ? "Successfully connected to MCP server." 
          : "Failed to connect. Please check your configuration.",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCP Servers</h1>
          <p className="text-muted-foreground">
            Configure Model Context Protocol servers for enhanced AI capabilities
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Server
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingServer ? 'Edit MCP Server' : 'Add MCP Server'}
                </DialogTitle>
                <DialogDescription>
                  Configure a new MCP server connection for enhanced AI context.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Server Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Knowledge Server"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    type="url"
                    value={formData.endpoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="https://api.example.com/mcp"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auth">Authentication Method</Label>
                  <Select
                    value={formData.authMethod}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, authMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="apikey">API Key</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this server's purpose..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingServer ? 'Update' : 'Add'} Server
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Servers Grid */}
      {mcpServers.length === 0 ? (
        <Card className="p-12 text-center">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No MCP Servers Configured</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Add your first MCP server to enhance your AI assistant with external knowledge sources and tools.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Server
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mcpServers.map((server) => (
            <Card key={server.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(server.status)}
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(server)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(server.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge variant={getStatusColor(server.status)} className="w-fit capitalize">
                  {server.status}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Endpoint</p>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded truncate">
                    {server.endpoint}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Authentication</p>
                  <Badge variant="outline" className="text-xs">
                    {server.authMethod.replace('_', ' ')}
                  </Badge>
                </div>
                
                {server.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-card-foreground">{server.description}</p>
                  </div>
                )}
                
                <Button
                  onClick={() => testConnection(server.id)}
                  disabled={server.status === 'connecting'}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {server.status === 'connecting' ? 'Testing...' : 'Test Connection'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}