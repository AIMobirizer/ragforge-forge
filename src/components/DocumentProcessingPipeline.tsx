import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/useAppStore';
import {
  Upload,
  Scissors,
  Brain,
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStage {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  duration?: number;
}

export function DocumentProcessingPipeline() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { dataSources } = useAppStore();

  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    {
      id: 'upload',
      name: 'Document Upload',
      icon: Upload,
      status: 'completed',
      progress: 100,
      message: 'Document successfully uploaded',
      duration: 1200
    },
    {
      id: 'chunking',
      name: 'Text Chunking',
      icon: Scissors,
      status: 'running',
      progress: 65,
      message: 'Splitting document into chunks (chunk 13/20)',
      duration: 2800
    },
    {
      id: 'embedding',
      name: 'Embedding Generation',
      icon: Brain,
      status: 'pending',
      progress: 0,
      message: 'Waiting for chunking to complete',
    },
    {
      id: 'indexing',
      name: 'Vector Indexing',
      icon: Database,
      status: 'pending',
      progress: 0,
      message: 'Ready to index embeddings',
    }
  ]);

  // Simulate pipeline progress
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setPipelineStages(prev => {
        const updated = [...prev];
        const runningStage = updated.find(stage => stage.status === 'running');
        
        if (runningStage) {
          runningStage.progress = Math.min(runningStage.progress + Math.random() * 15, 100);
          
          if (runningStage.progress >= 100) {
            runningStage.status = 'completed';
            runningStage.message = `${runningStage.name} completed successfully`;
            
            const currentIndex = updated.findIndex(s => s.id === runningStage.id);
            if (currentIndex < updated.length - 1) {
              updated[currentIndex + 1].status = 'running';
              updated[currentIndex + 1].message = `Processing ${updated[currentIndex + 1].name.toLowerCase()}...`;
            } else {
              setIsProcessing(false);
            }
          }
        }
        
        return updated;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const startProcessing = () => {
    setIsProcessing(true);
    setPipelineStages(prev => prev.map((stage, index) => ({
      ...stage,
      status: index === 0 ? 'running' : 'pending',
      progress: index === 0 ? 0 : 0,
      message: index === 0 ? 'Starting processing...' : 'Waiting...'
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'running':
        return <Clock className="h-4 w-4 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-success bg-success/5';
      case 'running':
        return 'border-primary bg-primary/5';
      case 'error':
        return 'border-destructive bg-destructive/5';
      default:
        return 'border-muted bg-muted/5';
    }
  };

  const totalProgress = pipelineStages.reduce((acc, stage) => acc + stage.progress, 0) / pipelineStages.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Document Processing Pipeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isProcessing ? 'default' : 'secondary'}>
                {isProcessing ? 'Processing' : 'Idle'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={startProcessing}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isProcessing ? 'Processing...' : 'Start Pipeline'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>

          <div className="space-y-4">
            {pipelineStages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <Card key={stage.id} className={cn('transition-all', getStatusColor(stage.status))}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{stage.name}</h3>
                            {getStatusIcon(stage.status)}
                          </div>
                          {stage.duration && (
                            <span className="text-xs text-muted-foreground">
                              ~{Math.round(stage.duration / 1000)}s
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{stage.message}</p>
                        
                        {stage.status === 'running' && (
                          <div className="space-y-1">
                            <Progress value={stage.progress} className="h-1" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Processing...</span>
                              <span>{Math.round(stage.progress)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Processing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {dataSources.length > 0 ? (
              <div className="space-y-2">
                {dataSources.slice(0, 3).map((source, index) => (
                  <div
                    key={source.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedDocumentId === source.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedDocumentId(source.id)}
                  >
                    <div>
                      <p className="font-medium text-sm">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.fileCount || 0} files • {source.type.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge variant={index === 0 ? 'default' : 'outline'} className="text-xs">
                      {index === 0 ? 'Processing' : `Queue #${index}`}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No documents in queue</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}