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
  Clock,
  Edit3,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ChatHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const { 
    chatThreads, 
    chatMessages, 
    deleteThread, 
    updateThreadTitle,
    switchToThread, 
    createNewThread,
    clearChatHistory 
  } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredThreads = chatThreads.filter(thread => {
    if (!searchQuery) return true;
    const threadMessages = chatMessages.filter(m => m.threadId === thread.id);
    return thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           threadMessages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleStartNewChat = () => {
    const threadId = createNewThread();
    navigate('/');
    toast({
      title: "New chat started",
      description: "Ready for your next conversation"
    });
  };

  const handleContinueThread = (threadId: string) => {
    switchToThread(threadId);
    navigate('/');
    toast({
      title: "Thread resumed",
      description: "Continuing previous conversation"
    });
  };

  const handleExportThread = (thread: any) => {
    const threadMessages = chatMessages.filter(m => m.threadId === thread.id);
    const chatContent = threadMessages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${thread.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Thread exported",
      description: `"${thread.title}" has been saved`
    });
  };

  const handleDeleteThread = (threadId: string) => {
    deleteThread(threadId);
    toast({
      title: "Thread deleted",
      description: "Conversation has been removed",
      variant: "destructive"
    });
  };

  const handleStartEdit = (thread: any) => {
    setEditingThreadId(thread.id);
    setEditTitle(thread.title);
  };

  const handleSaveEdit = () => {
    if (editingThreadId && editTitle.trim()) {
      updateThreadTitle(editingThreadId, editTitle.trim());
      setEditingThreadId(null);
      setEditTitle('');
      toast({
        title: "Thread renamed",
        description: "Thread title has been updated"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
    setEditTitle('');
  };

  const handleClearAllHistory = () => {
    clearChatHistory();
    toast({
      title: "All threads deleted",
      description: "All conversations have been cleared",
      variant: "destructive"
    });
  };

  const getThreadMessageCount = (threadId: string) => {
    return chatMessages.filter(m => m.threadId === threadId).length;
  };

  const getThreadPreview = (threadId: string) => {
    const threadMessages = chatMessages.filter(m => m.threadId === threadId);
    const lastMessage = threadMessages[threadMessages.length - 1];
    return lastMessage?.content.slice(0, 100) + '...' || 'No messages';
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
                <p className="text-2xl font-bold">{chatThreads.length}</p>
                <p className="text-sm text-muted-foreground">Chat Threads</p>
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
                  {chatThreads.length > 0 
                    ? new Set(chatThreads.map(t => new Date(t.createdAt).toDateString())).size 
                    : 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thread List */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <Card className="p-12 text-center">
            {chatThreads.length === 0 ? (
              <>
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Chat Threads</h3>
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
                  No threads match your search query
                </p>
              </>
            )}
          </Card>
        ) : (
          filteredThreads.map((thread) => (
            <Card key={thread.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingThreadId === thread.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-lg font-semibold"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{thread.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {getThreadMessageCount(thread.id)} messages • {new Date(thread.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleContinueThread(thread.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Continue Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStartEdit(thread)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportThread(thread)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteThread(thread.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {getThreadPreview(thread.id)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{chatMessages.filter(m => m.threadId === thread.id && m.role === 'user').length} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span>{chatMessages.filter(m => m.threadId === thread.id && m.role === 'assistant').length} responses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(thread.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <ScrollArea className="h-24 w-full rounded border p-3 bg-muted/20">
                    <div className="space-y-2">
                      {chatMessages
                        .filter(m => m.threadId === thread.id)
                        .slice(-2)
                        .map((message) => (
                          <div key={message.id} className="flex gap-2 text-xs">
                            <div className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                              message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                              {message.role === 'user' ? (
                                <User className="h-2 w-2" />
                              ) : (
                                <Bot className="h-2 w-2" />
                              )}
                            </div>
                            <p className="text-xs line-clamp-2 leading-relaxed">
                              {message.content.slice(0, 120)}...
                            </p>
                          </div>
                        ))}
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