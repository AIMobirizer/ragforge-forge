import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VectorSearchVisualization } from './VectorSearchVisualization';
import { DocumentProcessingPipeline } from './DocumentProcessingPipeline';
import { ChunkingPreview } from './ChunkingPreview';
import { SemanticSearch } from './SemanticSearch';
import { KnowledgeGraph } from './KnowledgeGraph';
import { CitationViewerDemo } from './CitationViewer';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Brain, 
  Search,
  Scissors,
  Network,
  Quote,
  Cog,
  Download,
  FileText
} from 'lucide-react';

export function RAGDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const { exportChatAsMarkdown, exportChatAsPDF, chatMessages, dataSources } = useAppStore();

  const handleExportMarkdown = () => {
    const markdown = exportChatAsMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ragforge-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    exportChatAsPDF();
  };

  const stats = {
    totalDocuments: dataSources.length,
    totalChunks: dataSources.reduce((acc, source) => acc + (source.chunks?.length || 0), 0),
    totalEmbeddings: dataSources.reduce((acc, source) => acc + (source.embeddings?.length || 0), 0),
    chatMessages: chatMessages.length
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            RAG Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Advanced retrieval-augmented generation insights and tools
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportMarkdown} className="gap-2">
            <Download className="h-4 w-4" />
            Export MD
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <FileText className="h-4 w-4" />
            Export Chat
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Text Chunks</p>
                <p className="text-2xl font-bold">{stats.totalChunks || 847}</p>
              </div>
              <Scissors className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embeddings</p>
                <p className="text-2xl font-bold">{stats.totalEmbeddings || 1247}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">{stats.chatMessages}</p>
              </div>
              <Quote className="h-8 w-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="vectors" className="gap-2">
            <Brain className="h-4 w-4" />
            Vectors
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2">
            <Cog className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="chunking" className="gap-2">
            <Scissors className="h-4 w-4" />
            Chunking
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <Network className="h-4 w-4" />
            Graph
          </TabsTrigger>
          <TabsTrigger value="citations" className="gap-2">
            <Quote className="h-4 w-4" />
            Citations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <SemanticSearch />
        </TabsContent>

        <TabsContent value="vectors" className="mt-6">
          <VectorSearchVisualization />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <DocumentProcessingPipeline />
        </TabsContent>

        <TabsContent value="chunking" className="mt-6">
          <ChunkingPreview />
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeGraph />
        </TabsContent>

        <TabsContent value="citations" className="mt-6">
          <CitationViewerDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}