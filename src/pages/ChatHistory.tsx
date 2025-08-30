import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Trash2,
  Search,
  Plus,
  MoreHorizontal
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
  
  const { 
    chatThreads, 
    chatMessages, 
    deleteThread, 
    switchToThread, 
    createNewThread,
    clearChatHistory 
  } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredThreads = chatThreads.filter(thread => {
    if (!searchQuery) return true;
    return thread.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleStartNewChat = () => {
    createNewThread();
    navigate('/');
  };

  const handleContinueThread = (threadId: string) => {
    switchToThread(threadId);
    navigate('/');
  };

  const handleDeleteThread = (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteThread(threadId);
    toast({
      title: "Conversation deleted",
      variant: "destructive"
    });
  };

  const handleClearAll = () => {
    clearChatHistory();
    toast({
      title: "All conversations cleared",
      variant: "destructive"
    });
  };

  const getThreadPreview = (thread: any) => {
    const threadMessages = chatMessages.filter(m => m.threadId === thread.id);
    return threadMessages.length > 0 ? `${threadMessages.length} messages` : 'Empty conversation';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (chatThreads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No conversations yet</h3>
            <p className="text-muted-foreground">Start chatting to see your history here</p>
          </div>
          <Button onClick={handleStartNewChat} className="gap-2">
            <Plus className="h-4 w-4" />
            Start new conversation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Chat History</h1>
          <div className="flex gap-2">
            <Button onClick={handleStartNewChat} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New
            </Button>
            {chatThreads.length > 0 && (
              <Button onClick={handleClearAll} variant="ghost" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => handleContinueThread(thread.id)}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h3 className="font-medium truncate text-sm">
                    {thread.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{getThreadPreview(thread)}</span>
                  <span>•</span>
                  <span>{formatDate(thread.updatedAt)}</span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={(e) => handleDeleteThread(thread.id, e)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}