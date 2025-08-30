import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { chatMessages, addChatMessage, dataSources, mcpServers } = useAppStore();

  const connectedSources = dataSources.filter(s => s.status === 'connected');
  const connectedServers = mcpServers.filter(s => s.status === 'connected');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    
    // Add user message
    addChatMessage({
      content: userMessage,
      role: 'user'
    });

    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responses = [
        "Based on your connected data sources, I found relevant information. Here's what I can tell you about that topic...",
        "I've analyzed the documents in your knowledge base and found several relevant matches. Let me provide you with a comprehensive answer...",
        "Drawing from your MCP servers and uploaded files, I can provide insights on this question. Here's what the data shows...",
        "I've searched through your connected resources and found some interesting patterns. Here's my analysis..."
      ];

      const sources = connectedSources.length > 0 ? 
        connectedSources.slice(0, 2).map(s => `${s.name}.${s.type === 'file' ? 'pdf' : 'data'}`) : 
        ['sample_document.pdf', 'knowledge_base.txt'];

      addChatMessage({
        content: responses[Math.floor(Math.random() * responses.length)],
        role: 'assistant',
        sources: Math.random() > 0.5 ? sources : undefined
      });

      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">RagForge AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Connected to {connectedSources.length} data sources and {connectedServers.length} MCP servers
            </p>
          </div>
          <div className="flex gap-2">
            {connectedSources.length > 0 && (
              <Badge variant="default" className="gap-1">
                <FileText className="h-3 w-3" />
                {connectedSources.length} Sources
              </Badge>
            )}
            {connectedServers.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Bot className="h-3 w-3" />
                {connectedServers.length} Servers
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to RagForge AI</h3>
              <p className="text-muted-foreground mb-4">
                I'm ready to help you analyze your data and answer questions using your connected sources.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer" 
                      onClick={() => setMessage("What's in my latest reports?")}>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm">Analyze Reports</p>
                  </CardContent>
                </Card>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setMessage("Summarize recent activity")}>
                  <CardContent className="p-4 text-center">
                    <Bot className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm">Get Summary</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex gap-3 max-w-3xl",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={cn(
                    "rounded-lg p-4 space-y-2",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground ml-12" 
                      : "bg-card border mr-12"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.sources && (
                      <>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Sources referenced:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((source, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-card border rounded-lg p-4 mr-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your data..."
                className="min-h-[60px] max-h-[200px] pr-20"
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toast({ title: "File upload coming soon!" })}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toast({ title: "Voice input coming soon!" })}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="h-[60px] px-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Ctrl+Enter to send • Connected to {connectedSources.length + connectedServers.length} sources
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
