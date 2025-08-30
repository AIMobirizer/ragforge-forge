import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore, DataSource } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import {
  Database,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Circle,
  Cloud,
  Github,
  MessageSquare,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';

const connectorTypes = [
  {
    id: 'google_drive',
    name: 'Google Drive',
    icon: Cloud,
    description: 'Connect your Google Drive documents',
    color: 'text-blue-500'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: Cloud,
    description: 'Sync files from Dropbox',
    color: 'text-blue-600'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    description: 'Import repositories and documentation',
    color: 'text-gray-600'
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    description: 'Access team conversations and files',
    color: 'text-purple-500'
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: HardDrive,
    description: 'Connect to PostgreSQL database',
    color: 'text-blue-700'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'syncing':
      return <Clock className="h-4 w-4 text-warning animate-pulse" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function DataSources() {
  const { dataSources, addDataSource, updateDataSource, removeDataSource } = useAppStore();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleConnect = (type: string) => {
    const connector = connectorTypes.find(c => c.id === type);
    if (!connector) return;

    addDataSource({
      name: connector.name,
      type: type as any,
      status: 'syncing',
      fileCount: 0
    });

    toast({
      title: "Connecting...",
      description: `Establishing connection to ${connector.name}`
    });

    // Simulate connection process
    setTimeout(() => {
      const sources = dataSources.filter(s => s.type === type);
      const latestSource = sources[sources.length - 1];
      
      if (latestSource) {
        updateDataSource(latestSource.id, {
          status: 'connected',
          fileCount: Math.floor(Math.random() * 1000) + 50,
          lastSync: new Date()
        });

        toast({
          title: "Connected successfully",
          description: `${connector.name} has been connected and is syncing data.`
        });
      }
    }, 3000);
  };

  const handleFileUpload = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    let totalFiles = fileArray.length;
    
    setUploadProgress(0);
    
    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 10;
        if (prev >= 100) {
          clearInterval(interval);
          
          // Add uploaded files as a data source
          addDataSource({
            name: `Uploaded Files (${totalFiles} files)`,
            type: 'file',
            status: 'connected',
            fileCount: totalFiles,
            lastSync: new Date()
          });

          toast({
            title: "Files uploaded",
            description: `${totalFiles} files have been uploaded and indexed successfully.`
          });

          setTimeout(() => setUploadProgress(null), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [addDataSource, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const syncDataSource = (id: string) => {
    updateDataSource(id, { status: 'syncing' });
    
    setTimeout(() => {
      updateDataSource(id, {
        status: 'connected',
        lastSync: new Date(),
        fileCount: Math.floor(Math.random() * 500) + 100
      });
      
      toast({
        title: "Sync completed",
        description: "Data source has been synced successfully."
      });
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <p className="text-muted-foreground">
          Connect your data sources to enhance AI responses with relevant context
        </p>
      </div>

      {/* File Upload Area */}
      <Card className="border-dashed">
        <CardContent 
          className="p-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="text-center space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop files here, or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-4">
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">TXT</Badge>
                <Badge variant="outline">MD</Badge>
                <Badge variant="outline">CSV</Badge>
                <Badge variant="outline">JSON</Badge>
                <Badge variant="outline">DOCX</Badge>
              </div>
            </div>
            
            {uploadProgress !== null ? (
              <div className="space-y-2 max-w-md mx-auto">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">
                  Uploading and processing files... {uploadProgress}%
                </p>
              </div>
            ) : (
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </Button>
            )}
            
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.txt,.md,.csv,.json,.docx"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Connectors */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Connectors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectorTypes.map((connector) => {
            const Icon = connector.icon;
            const isConnected = dataSources.some(s => s.type === connector.id);
            
            return (
              <Card 
                key={connector.id} 
                className={cn(
                  "hover:shadow-lg transition-all cursor-pointer",
                  isConnected && "border-primary/50 bg-primary/5"
                )}
                onClick={() => !isConnected && handleConnect(connector.id)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <Icon className={cn("h-10 w-10 mx-auto", connector.color)} />
                  <div>
                    <h3 className="font-semibold">{connector.name}</h3>
                    <p className="text-sm text-muted-foreground">{connector.description}</p>
                  </div>
                  
                  <Button 
                    disabled={isConnected}
                    variant={isConnected ? "outline" : "default"}
                    className="w-full"
                  >
                    {isConnected ? 'Connected' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Connected Sources */}
      {dataSources.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Connected Sources</h2>
          
          <div className="space-y-4">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(source.status)}
                      <div>
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {source.type.replace('_', ' ')} • {source.fileCount?.toLocaleString()} files
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => syncDataSource(source.id)}
                        disabled={source.status === 'syncing'}
                        className="gap-2"
                      >
                        <RefreshCw className={cn("h-4 w-4", source.status === 'syncing' && "animate-spin")} />
                        Sync
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDataSource(source.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <Badge variant={source.status === 'connected' ? 'default' : 'secondary'}>
                        {source.status}
                      </Badge>
                      
                      {source.lastSync && (
                        <span className="text-muted-foreground">
                          Last sync: {source.lastSync.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    {source.status === 'syncing' && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 animate-pulse" />
                        Syncing...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {dataSources.length === 0 && (
        <Card className="p-12 text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Sources Connected</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Connect your first data source or upload files to start building your knowledge base.
          </p>
        </Card>
      )}
    </div>
  );
}