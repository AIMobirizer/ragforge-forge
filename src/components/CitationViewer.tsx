import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  Quote,
  FileText,
  ChevronRight,
  Star,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Citation {
  id: string;
  text: string;
  sourceId: string;
  sourceName: string;
  chunkId: string;
  score: number;
  context: string;
  pageNumber?: number;
  timestamp: string;
}

interface CitationViewerProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

export function CitationViewer({ citations, onCitationClick }: CitationViewerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (citation: Citation) => {
    const citationText = `"${citation.text}" - ${citation.sourceName}${citation.pageNumber ? `, p. ${citation.pageNumber}` : ''}`;
    navigator.clipboard.writeText(citationText);
    setCopiedId(citation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!citations || citations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Quote className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No citations available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5" />
          Citations & References
          <Badge variant="outline" className="ml-auto">
            {citations.length} sources
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {citations.map((citation, index) => (
              <div key={citation.id} className="space-y-3">
                <Card className="hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <FileText className="h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{citation.sourceName}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Chunk {citation.chunkId.split('-')[2] || '1'}</span>
                              {citation.pageNumber && (
                                <>
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Page {citation.pageNumber}</span>
                                </>
                              )}
                              <ChevronRight className="h-3 w-3" />
                              <span>{formatTimestamp(citation.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getScoreColor(citation.score))}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {Math.round(citation.score * 100)}%
                          </Badge>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyText(citation)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedId === citation.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCitationClick?.(citation)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Citation Text */}
                      <div className="pl-8">
                        <blockquote className="border-l-4 border-primary/20 pl-4 italic text-sm">
                          "{citation.text}"
                        </blockquote>
                      </div>

                      {/* Context */}
                      {citation.context && (
                        <div className="pl-8">
                          <details className="group">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Show context
                            </summary>
                            <div className="mt-2 p-2 bg-muted/20 rounded text-xs leading-relaxed">
                              {citation.context}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {index < citations.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Sample usage component
export function CitationViewerDemo() {
  const sampleCitations: Citation[] = [
    {
      id: 'cite1',
      text: 'Machine learning algorithms can automatically improve through experience without being explicitly programmed',
      sourceId: 'doc1',
      sourceName: 'Introduction to Machine Learning',
      chunkId: 'chunk-1-2',
      score: 0.92,
      context: 'In the context of artificial intelligence, machine learning algorithms can automatically improve through experience without being explicitly programmed. This capability makes them particularly useful for tasks where...',
      pageNumber: 15,
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 'cite2',
      text: 'Neural networks are inspired by biological neural networks and consist of interconnected processing nodes',
      sourceId: 'doc2',
      sourceName: 'Deep Learning Fundamentals',
      chunkId: 'chunk-2-5',
      score: 0.87,
      context: 'The architecture of artificial neural networks are inspired by biological neural networks and consist of interconnected processing nodes called neurons...',
      pageNumber: 42,
      timestamp: '2024-01-20T14:22:00Z'
    },
    {
      id: 'cite3',
      text: 'Data preprocessing is a crucial step that can significantly impact model performance',
      sourceId: 'doc3',
      sourceName: 'Data Science Best Practices',
      chunkId: 'chunk-3-1',
      score: 0.75,
      context: 'Before feeding data into machine learning models, data preprocessing is a crucial step that can significantly impact model performance. This includes cleaning, normalization, and feature engineering...',
      timestamp: '2024-01-25T09:15:00Z'
    }
  ];

  const handleCitationClick = (citation: Citation) => {
    console.log('Citation clicked:', citation);
    // In a real app, this would navigate to the source document
    // or open it in a viewer at the specific location
  };

  return (
    <CitationViewer 
      citations={sampleCitations}
      onCitationClick={handleCitationClick}
    />
  );
}