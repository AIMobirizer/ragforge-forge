import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import { Search, Zap, FileText } from 'lucide-react';

interface VectorPoint {
  id: string;
  x: number;
  y: number;
  sourceId: string;
  content: string;
  score?: number;
  highlighted?: boolean;
}

export function VectorSearchVisualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visualizationData, setVisualizationData] = useState<VectorPoint[]>([]);
  const { documentEmbeddings, dataSources } = useAppStore();

  // Generate sample visualization data
  useEffect(() => {
    const generateSampleData = () => {
      const data: VectorPoint[] = [];
      const numPoints = 150;
      
      for (let i = 0; i < numPoints; i++) {
        // Create clusters representing different document types
        const cluster = Math.floor(i / (numPoints / 5));
        const clusterCenters = [
          { x: 100, y: 100 },
          { x: 300, y: 150 },
          { x: 200, y: 300 },
          { x: 400, y: 250 },
          { x: 150, y: 200 }
        ];
        
        const center = clusterCenters[cluster] || { x: 250, y: 200 };
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 60 + 20;
        
        data.push({
          id: `point-${i}`,
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius,
          sourceId: `source-${cluster}`,
          content: `Document ${i + 1} content preview...`,
          score: Math.random(),
        });
      }
      
      return data;
    };

    setVisualizationData(generateSampleData());
  }, []);

  useEffect(() => {
    if (!svgRef.current || visualizationData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const xScale = d3.scaleLinear()
      .domain(d3.extent(visualizationData, d => d.x) as [number, number])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(visualizationData, d => d.y) as [number, number])
      .range([height - margin.bottom, margin.top]);

    // Color scale for different sources
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('visibility', 'hidden')
      .style('z-index', '1000');

    // Draw points
    svg.selectAll('circle')
      .data(visualizationData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => d.highlighted ? 8 : 4)
      .attr('fill', d => d.highlighted ? '#f59e0b' : colorScale(d.sourceId))
      .attr('opacity', d => d.highlighted ? 1 : 0.7)
      .attr('stroke', d => d.highlighted ? '#d97706' : 'none')
      .attr('stroke-width', 2)
      .on('mouseover', (event, d) => {
        tooltip
          .style('visibility', 'visible')
          .html(`<strong>Document:</strong> ${d.id}<br><strong>Content:</strong> ${d.content}<br><strong>Score:</strong> ${(d.score || 0).toFixed(3)}`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    return () => {
      tooltip.remove();
    };
  }, [visualizationData]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setVisualizationData(prev => prev.map(p => ({ ...p, highlighted: false })));
      return;
    }

    // Simulate semantic search by highlighting random points
    setVisualizationData(prev => prev.map(point => ({
      ...point,
      highlighted: Math.random() > 0.7,
      score: point.highlighted ? Math.random() * 0.3 + 0.7 : point.score
    })));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Vector Search Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search in document embeddings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        <div className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height="400"
            viewBox="0 0 500 400"
            className="border border-border rounded-lg bg-muted/20"
          />
          
          <div className="absolute top-2 left-2 space-y-1">
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {visualizationData.length} Documents
            </Badge>
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                <Search className="h-3 w-3 mr-1" />
                {visualizationData.filter(p => p.highlighted).length} Matches
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">Embedding Dimensions</p>
            <p className="text-muted-foreground">768-dimensional vectors</p>
          </div>
          <div>
            <p className="font-medium mb-1">Similarity Metric</p>
            <p className="text-muted-foreground">Cosine similarity</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {dataSources.slice(0, 5).map((source, index) => (
            <Badge key={source.id} variant="outline" className="text-xs">
              <div 
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: d3.schemeCategory10[index] }}
              />
              {source.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}