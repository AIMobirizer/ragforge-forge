import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  MessageSquare,
  Trash2,
  Download,
  Search,
  Plus,
  Calendar,
  FileText,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const { chatMessages, clearChatHistory } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Group messages by conversation (simplified - group by date for now)
  const groupedChats = chatMessages.reduce((acc, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, typeof chatMessages>);

  const filteredChats = Object.entries(groupedChats).filter(([date, messages]) => {
    if (!searchQuery) return true;
    return messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStartNewChat = () => {
    navigate('/');
    toast({
      title: "New chat started",
      description: "Ready for your next conversation"
    });
  };

  const handleExportChat = (date: string, messages: typeof chatMessages) => {
    const chatContent = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${date.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chat exported",
      description: `Chat from ${date} has been saved`
    });
  };

  const handleClearAllHistory = () => {
    clearChatHistory();
    toast({
      title: "Chat history cleared",
      description: "All conversations have been deleted",
      variant: "destructive"
    });
  };

  const getMessagePreview = (messages: typeof chatMessages) => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    return firstUserMessage?.content.slice(0, 100) + '...' || 'No messages';
  };

  const getTotalMessages = (messages: typeof chatMessages) => {
    return messages.length;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chat History</h1>
          <p className="text-muted-foreground">
            View and manage your conversation history
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleStartNewChat} className="gap-2">
            <Plus className="h-4 w-4" />
            Start New Chat
          </Button>
          {chatMessages.length > 0 && (
            <Button variant="destructive" onClick={handleClearAllHistory} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(groupedChats).length}</p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{chatMessages.length}</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {chatMessages.length > 0 ? Object.keys(groupedChats).length : 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat History List */}
      <div className="space-y-4">
        {filteredChats.length === 0 ? (
          <Card className="p-12 text-center">
            {chatMessages.length === 0 ? (
              <>
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Chat History</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first conversation to see it appear here
                </p>
                <Button onClick={handleStartNewChat} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Start New Chat
                </Button>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  No conversations match your search query
                </p>
              </>
            )}
          </Card>
        ) : (
          filteredChats.map(([date, messages]) => (
            <Card key={date} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{date}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {getTotalMessages(messages)} messages
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportChat(date, messages)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {getMessagePreview(messages)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{messages.filter(m => m.role === 'user').length} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span>{messages.filter(m => m.role === 'assistant').length} responses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(messages[messages.length - 1]?.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <ScrollArea className="h-32 w-full rounded border p-3 bg-muted/20">
                    <div className="space-y-2">
                      {messages.slice(0, 3).map((message) => (
                        <div key={message.id} className="flex gap-2 text-sm">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                            message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            {message.role === 'user' ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Bot className="h-3 w-3" />
                            )}
                          </div>
                          <p className="text-xs line-clamp-2">
                            {message.content.slice(0, 150)}...
                          </p>
                        </div>
                      ))}
                      {messages.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{messages.length - 3} more messages
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}