import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Network, 
  Search, 
  Maximize2,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Brain,
  Tag
} from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import { cn } from '@/lib/utils';

interface GraphNode {
  id: string;
  name: string;
  type: 'document' | 'concept' | 'entity';
  size: number;
  color: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  type: 'reference' | 'similarity' | 'concept';
}

export function KnowledgeGraph() {
  const graphRef = useRef<any>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { dataSources } = useAppStore();

  // Generate sample graph data
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: []
  });

  useEffect(() => {
    const generateSampleData = () => {
      const nodes: GraphNode[] = [
        // Document nodes
        { id: 'doc1', name: 'Machine Learning Guide', type: 'document', size: 20, color: '#3b82f6' },
        { id: 'doc2', name: 'Neural Networks Basics', type: 'document', size: 18, color: '#3b82f6' },
        { id: 'doc3', name: 'Data Science Overview', type: 'document', size: 16, color: '#3b82f6' },
        { id: 'doc4', name: 'Deep Learning Research', type: 'document', size: 22, color: '#3b82f6' },
        
        // Concept nodes
        { id: 'concept1', name: 'Artificial Intelligence', type: 'concept', size: 25, color: '#10b981' },
        { id: 'concept2', name: 'Supervised Learning', type: 'concept', size: 15, color: '#10b981' },
        { id: 'concept3', name: 'Neural Networks', type: 'concept', size: 20, color: '#10b981' },
        { id: 'concept4', name: 'Data Processing', type: 'concept', size: 18, color: '#10b981' },
        
        // Entity nodes
        { id: 'entity1', name: 'TensorFlow', type: 'entity', size: 12, color: '#f59e0b' },
        { id: 'entity2', name: 'Python', type: 'entity', size: 14, color: '#f59e0b' },
        { id: 'entity3', name: 'Scikit-learn', type: 'entity', size: 10, color: '#f59e0b' },
        { id: 'entity4', name: 'Pandas', type: 'entity', size: 11, color: '#f59e0b' },
      ];

      const links: GraphLink[] = [
        // Document-concept relationships
        { source: 'doc1', target: 'concept1', value: 5, type: 'concept' },
        { source: 'doc1', target: 'concept2', value: 4, type: 'concept' },
        { source: 'doc2', target: 'concept3', value: 5, type: 'concept' },
        { source: 'doc3', target: 'concept4', value: 4, type: 'concept' },
        { source: 'doc4', target: 'concept3', value: 5, type: 'concept' },
        
        // Document-entity relationships
        { source: 'doc1', target: 'entity2', value: 3, type: 'reference' },
        { source: 'doc2', target: 'entity1', value: 4, type: 'reference' },
        { source: 'doc3', target: 'entity4', value: 3, type: 'reference' },
        { source: 'doc4', target: 'entity1', value: 5, type: 'reference' },
        
        // Concept relationships
        { source: 'concept1', target: 'concept2', value: 3, type: 'similarity' },
        { source: 'concept1', target: 'concept3', value: 4, type: 'similarity' },
        { source: 'concept2', target: 'concept3', value: 2, type: 'similarity' },
        
        // Entity relationships
        { source: 'entity1', target: 'entity2', value: 2, type: 'similarity' },
        { source: 'entity3', target: 'entity4', value: 3, type: 'similarity' },
      ];

      return { nodes, links };
    };

    setGraphData(generateSampleData());
  }, []);

  const filteredData = {
    nodes: graphData.nodes.filter(node => {
      if (filterType !== 'all' && node.type !== filterType) return false;
      if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    }),
    links: graphData.links.filter(link => {
      const sourceNode = graphData.nodes.find(n => n.id === link.source);
      const targetNode = graphData.nodes.find(n => n.id === link.target);
      if (!sourceNode || !targetNode) return false;
      
      if (filterType !== 'all' && sourceNode.type !== filterType && targetNode.type !== filterType) {
        return false;
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!sourceNode.name.toLowerCase().includes(searchLower) && 
            !targetNode.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    })
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'concept':
        return Brain;
      case 'entity':
        return Tag;
      default:
        return Network;
    }
  };

  const regenerateGraph = () => {
    if (graphRef.current) {
      graphRef.current.d3ReheatSimulation();
    }
  };

  return (
    <div className={cn("space-y-6", isFullScreen && "fixed inset-0 z-50 bg-background p-6")}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Knowledge Graph
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateGraph}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                {isFullScreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'document', 'concept', 'entity'].map((type) => (
              <Badge
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'All Types' : type + 's'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className={cn("relative", isFullScreen ? "h-[calc(100vh-200px)]" : "h-96")}>
            <ForceGraph2D
              ref={graphRef}
              graphData={filteredData}
              width={isFullScreen ? window.innerWidth - 100 : 800}
              height={isFullScreen ? window.innerHeight - 200 : 400}
              nodeLabel="name"
              nodeColor={(node: any) => node.color}
              nodeRelSize={1}
              nodeVal={(node: any) => node.size}
              linkColor={() => '#6b7280'}
              linkWidth={(link: any) => link.value}
              onNodeClick={(node: any) => setSelectedNode(node)}
              onNodeHover={(node: any) => {
                if (node) {
                  document.body.style.cursor = 'pointer';
                } else {
                  document.body.style.cursor = 'default';
                }
              }}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
            
            {selectedNode && (
              <div className="absolute top-4 right-4 w-64 p-4 bg-card border border-border rounded-lg shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {selectedNode.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNode(null)}
                      className="ml-auto h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  <h3 className="font-medium">{selectedNode.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Connected to {filteredData.links.filter(l => 
                      l.source === selectedNode.id || l.target === selectedNode.id
                    ).length} other nodes
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {filteredData.nodes.filter(n => n.type === 'document').length}
            </div>
            <p className="text-xs text-muted-foreground">Knowledge sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-green-500" />
              Concepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {filteredData.nodes.filter(n => n.type === 'concept').length}
            </div>
            <p className="text-xs text-muted-foreground">Key topics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-yellow-500" />
              Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {filteredData.nodes.filter(n => n.type === 'entity').length}
            </div>
            <p className="text-xs text-muted-foreground">Named entities</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}