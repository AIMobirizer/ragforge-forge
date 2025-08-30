import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Scissors, 
  FileText, 
  RotateCcw,
  Info,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SAMPLE_DOCUMENT = `
# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that focuses on the development of algorithms and statistical models that enable computers to improve their performance on a specific task through experience, without being explicitly programmed.

## Types of Machine Learning

There are three main types of machine learning:

### Supervised Learning
Supervised learning involves training a model on labeled data. The algorithm learns from input-output pairs and can then make predictions on new, unseen data. Common examples include:
- Linear regression for predicting continuous values
- Classification algorithms for categorizing data
- Support vector machines for complex decision boundaries

### Unsupervised Learning  
Unsupervised learning works with data that has no labels. The algorithm must find patterns and structures in the data without guidance. Key techniques include:
- Clustering algorithms like K-means
- Dimensionality reduction techniques
- Association rule mining for finding relationships

### Reinforcement Learning
Reinforcement learning involves an agent that learns to make decisions by interacting with an environment. The agent receives rewards or penalties for its actions and learns to maximize cumulative reward over time.

## Applications
Machine learning has numerous real-world applications across various industries, from healthcare and finance to autonomous vehicles and natural language processing.
`.trim();

export function ChunkingPreview() {
  const [chunkSize, setChunkSize] = useState(200);
  const [overlap, setOverlap] = useState(20);
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);
  const { settings } = useAppStore();

  const textToChunk = useCustomText && customText.trim() ? customText : SAMPLE_DOCUMENT;

  const chunks = useMemo(() => {
    const words = textToChunk.split(/\s+/);
    const result = [];
    let startIndex = 0;

    while (startIndex < words.length) {
      const endIndex = Math.min(startIndex + chunkSize, words.length);
      const chunkWords = words.slice(startIndex, endIndex);
      const chunkText = chunkWords.join(' ');
      
      result.push({
        id: result.length + 1,
        text: chunkText,
        wordCount: chunkWords.length,
        startIndex,
        endIndex: endIndex - 1,
        overlap: startIndex > 0 ? Math.min(overlap, chunkWords.length) : 0
      });

      startIndex = endIndex - overlap;
      if (startIndex >= words.length) break;
    }

    return result;
  }, [textToChunk, chunkSize, overlap]);

  const totalWords = textToChunk.split(/\s+/).length;
  const avgChunkSize = chunks.reduce((acc, chunk) => acc + chunk.wordCount, 0) / chunks.length;

  const resetToDefaults = () => {
    setChunkSize(settings.chunkSize);
    setOverlap(settings.overlap);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Document Chunking Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Chunk Size (words)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[chunkSize]}
                    onValueChange={(value) => setChunkSize(value[0])}
                    max={500}
                    min={50}
                    step={10}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    className="w-20"
                    min={50}
                    max={500}
                  />
                </div>
              </div>

              <div>
                <Label>Overlap (words)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[overlap]}
                    onValueChange={(value) => setOverlap(value[0])}
                    max={Math.min(100, chunkSize / 2)}
                    min={0}
                    step={5}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={overlap}
                    onChange={(e) => setOverlap(Number(e.target.value))}
                    className="w-20"
                    min={0}
                    max={Math.min(100, chunkSize / 2)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseCustomText(!useCustomText)}
                >
                  {useCustomText ? 'Use Sample' : 'Use Custom Text'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{chunks.length}</div>
                  <div className="text-sm text-muted-foreground">Total Chunks</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{Math.round(avgChunkSize)}</div>
                  <div className="text-sm text-muted-foreground">Avg Chunk Size</div>
                </div>
              </div>

              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-lg font-bold">{totalWords}</div>
                <div className="text-sm text-muted-foreground">Total Words in Document</div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Chunking Strategy</p>
                  <p className="text-xs mt-1">
                    Overlap helps maintain context between chunks for better retrieval accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {useCustomText && (
            <div>
              <Label>Custom Text to Chunk</Label>
              <textarea
                className="w-full h-32 mt-2 p-3 border border-border rounded-lg resize-none"
                placeholder="Paste your text here to see how it will be chunked..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Chunk Preview
            </CardTitle>
            <Badge variant="outline">{chunks.length} chunks</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {chunks.map((chunk, index) => (
                <div key={chunk.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Chunk {chunk.id}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {chunk.wordCount} words
                      </span>
                      {chunk.overlap > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {chunk.overlap} overlap
                        </Badge>
                      )}
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg bg-muted/20">
                    <p className="text-sm leading-relaxed">{chunk.text}</p>
                  </div>
                  
                  {index < chunks.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}