import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TestTube,
  Star,
  Database,
  Code,
  FileText,
  Globe,
  Search
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

const popularServers = [
  {
    id: 'openai-mcp',
    name: 'OpenAI MCP Server',
    endpoint: 'https://api.openai.com/v1/mcp',
    authMethod: 'apikey' as const,
    description: 'Official OpenAI MCP server for enhanced AI capabilities',
    category: 'AI/ML',
    icon: Code,
    verified: true,
    rating: 4.9,
    installations: '10K+'
  },
  {
    id: 'github-mcp',
    name: 'GitHub MCP Server',
    endpoint: 'https://api.github.com/mcp',
    authMethod: 'oauth' as const,
    description: 'Access GitHub repositories, issues, and pull requests',
    category: 'Developer Tools',
    icon: Code,
    verified: true,
    rating: 4.8,
    installations: '8.5K+'
  },
  {
    id: 'notion-mcp',
    name: 'Notion MCP Server',
    endpoint: 'https://api.notion.com/v1/mcp',
    authMethod: 'bearer' as const,
    description: 'Connect to your Notion workspace and databases',
    category: 'Productivity',
    icon: FileText,
    verified: true,
    rating: 4.7,
    installations: '7.2K+'
  },
  {
    id: 'postgresql-mcp',
    name: 'PostgreSQL MCP Server',
    endpoint: 'postgresql://localhost:5432/mcp',
    authMethod: 'none' as const,
    description: 'Query and interact with PostgreSQL databases',
    category: 'Database',
    icon: Database,
    verified: true,
    rating: 4.6,
    installations: '5.8K+'
  },
  {
    id: 'web-search-mcp',
    name: 'Web Search MCP Server',
    endpoint: 'https://search.mcp.dev/api',
    authMethod: 'apikey' as const,
    description: 'Real-time web search and content retrieval',
    category: 'Search',
    icon: Search,
    verified: true,
    rating: 4.5,
    installations: '12K+'
  },
  {
    id: 'wikipedia-mcp',
    name: 'Wikipedia MCP Server',
    endpoint: 'https://en.wikipedia.org/api/mcp',
    authMethod: 'none' as const,
    description: 'Access Wikipedia articles and knowledge base',
    category: 'Knowledge',
    icon: Globe,
    verified: true,
    rating: 4.4,
    installations: '9.1K+'
  }
];

export default function MCPSetup() {
  const { mcpServers, addMCPServer, updateMCPServer, removeMCPServer } = useAppStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const handleConnectPopularServer = (popularServer: typeof popularServers[0]) => {
    // Check if server already exists
    const existingServer = mcpServers.find(s => s.endpoint === popularServer.endpoint);
    if (existingServer) {
      toast({
        title: "Server already exists",
        description: `${popularServer.name} is already configured.`,
        variant: "destructive"
      });
      return;
    }

    addMCPServer({
      name: popularServer.name,
      endpoint: popularServer.endpoint,
      authMethod: popularServer.authMethod,
      description: popularServer.description
    });

    toast({
      title: "Popular server added",
      description: `${popularServer.name} has been added successfully.`
    });
  };

  const categories = ['all', ...Array.from(new Set(popularServers.map(s => s.category)))];
  const filteredPopularServers = selectedCategory === 'all' 
    ? popularServers 
    : popularServers.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">MCP Servers</h1>
        <p className="text-muted-foreground">
          Configure Model Context Protocol servers for enhanced AI capabilities
        </p>
      </div>

      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="popular" className="gap-2">
            <Star className="h-4 w-4" />
            Popular Servers
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Server className="h-4 w-4" />
            My Servers ({mcpServers.length})
          </TabsTrigger>
        </TabsList>

        {/* Popular Servers Tab */}
        <TabsContent value="popular" className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-4">
            <Label>Category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Popular Servers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPopularServers.map((server) => {
              const Icon = server.icon;
              const isConnected = mcpServers.some(s => s.endpoint === server.endpoint);
              
              return (
                <Card key={server.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {server.name}
                            {server.verified && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {server.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              {server.rating}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {server.installations}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {server.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Endpoint</p>
                        <p className="text-xs font-mono bg-muted px-2 py-1 rounded truncate">
                          {server.endpoint}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Authentication</p>
                        <Badge variant="outline" className="text-xs">
                          {server.authMethod === 'none' ? 'No auth required' : server.authMethod.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleConnectPopularServer(server)}
                      disabled={isConnected}
                      className="w-full gap-2"
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Connect
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Custom Servers Tab */}
        <TabsContent value="custom" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Custom Server
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingServer ? 'Edit MCP Server' : 'Add Custom MCP Server'}
                    </DialogTitle>
                    <DialogDescription>
                      Configure a custom MCP server connection for enhanced AI context.
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

          {/* Custom Servers Grid */}
          {mcpServers.length === 0 ? (
            <Card className="p-12 text-center">
              <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Custom Servers Configured</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Add your first custom MCP server or browse popular servers in the other tab.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}