import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Search, 
  FileText, 
  Zap,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  sourceId: string;
  sourceName: string;
  content: string;
  highlightedContent: string;
  score: number;
  matchedPhrases: string[];
  chunkId: string;
}

export function SemanticSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { dataSources } = useAppStore();

  // Sample content for demonstration
  const sampleContent = [
    {
      id: 'doc1',
      name: 'Machine Learning Guide',
      content: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.'
    },
    {
      id: 'doc2', 
      name: 'Neural Networks Basics',
      content: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes that process information using connectionist approaches to computation.'
    },
    {
      id: 'doc3',
      name: 'Data Science Overview',
      content: 'Data science combines statistics, mathematics, programming, and domain expertise to extract insights from structured and unstructured data. It involves data collection, cleaning, analysis, and visualization.'
    }
  ];

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple keyword matching for demo (in real app, this would use embeddings/vector search)
    const searchResults: SearchResult[] = [];
    
    sampleContent.forEach((doc, docIndex) => {
      const query = searchQuery.toLowerCase();
      const content = doc.content.toLowerCase();
      
      if (content.includes(query)) {
        // Find matching phrases and highlight them
        const words = query.split(' ');
        let highlightedContent = doc.content;
        let matchedPhrases: string[] = [];
        
        words.forEach(word => {
          if (word.length > 2 && content.includes(word)) {
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedContent = highlightedContent.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
            matchedPhrases.push(word);
          }
        });
        
        // Calculate relevance score (simplified)
        const score = matchedPhrases.length / words.length + (Math.random() * 0.3);
        
        searchResults.push({
          id: `result-${docIndex}`,
          sourceId: doc.id,
          sourceName: doc.name,
          content: doc.content,
          highlightedContent,
          score: Math.min(score, 1),
          matchedPhrases,
          chunkId: `chunk-${docIndex}-1`
        });
      }
    });

    // Sort by relevance score
    searchResults.sort((a, b) => b.score - a.score);
    
    setResults(searchResults);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Semantic Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search across all documents using natural language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={performSearch} 
              disabled={isSearching || !searchQuery.trim()}
              className="gap-2"
            >
              {isSearching ? (
                <Zap className="h-4 w-4 animate-pulse" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>

          {searchQuery && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Query: "{searchQuery}"
              </Badge>
              {results.length > 0 && (
                <Badge variant="default" className="text-xs">
                  {results.length} results found
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={result.id} className="space-y-3">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <h3 className="font-medium text-sm">{result.sourceName}</h3>
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Chunk {result.chunkId.split('-')[2]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={result.score > 0.8 ? 'default' : result.score > 0.6 ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {Math.round(result.score * 100)}% match
                              </Badge>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div 
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
                          />

                          <div className="flex flex-wrap gap-1">
                            {result.matchedPhrases.map((phrase, phraseIndex) => (
                              <Badge key={phraseIndex} variant="outline" className="text-xs">
                                {phrase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {index < results.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {searchQuery && results.length === 0 && !isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">No results found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try different keywords or check your connected data sources.
            </p>
            <Button variant="outline" onClick={clearSearch}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <p className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              Use natural language queries for better results
            </p>
            <p className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-primary" />
              Search across {dataSources.length} connected data sources
            </p>
            <p className="flex items-center gap-2">
              <Search className="h-3 w-3 text-primary" />
              Results are ranked by semantic similarity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}