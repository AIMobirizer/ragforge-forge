import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchChatHistory,
  searchChatHistory,
  exportChatHistory,
  clearChatHistory,
  updateThreadTitle,
  favoriteThread,
  setHistorySearchQuery,
  setHistoryFilters,
  setPagination,
  toggleThreadFavorite,
  addThreadTag,
  removeThreadTag,
} from '@/store/slices/chatSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Heart, Download, Trash2, Search, Tag, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

/**
 * Comprehensive Chat History component showing all implemented features
 */
export const ChatHistoryExample = () => {
  const dispatch = useAppDispatch();
  const chat = useAppSelector(state => state.chat);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Load chat history on component mount
  useEffect(() => {
    dispatch(fetchChatHistory({
      page: chat.pagination.currentPage,
      limit: chat.pagination.itemsPerPage,
    }));
  }, [dispatch, chat.pagination.currentPage, chat.pagination.itemsPerPage]);

  // Search chat history
  const handleSearch = async () => {
    if (!chat.historySearch.query.trim()) return;

    try {
      await dispatch(searchChatHistory({
        query: chat.historySearch.query,
        filters: {
          dateRange: dateRange.start && dateRange.end ? {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString()
          } : undefined,
          role: chat.historyFilters.role !== 'all' ? chat.historyFilters.role : undefined,
          threadIds: chat.historyFilters.threadIds.length > 0 ? chat.historyFilters.threadIds : undefined,
        },
        limit: 50,
      })).unwrap();
      toast.success('Search completed');
    } catch (error) {
      toast.error('Search failed');
    }
  };

  // Export chat history
  const handleExport = async (format: 'json' | 'csv' | 'txt' | 'pdf') => {
    try {
      await dispatch(exportChatHistory({
        format,
        dateRange: dateRange.start && dateRange.end ? {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString()
        } : undefined,
      })).unwrap();
      toast.success(`Chat history exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  // Clear chat history
  const handleClearHistory = async () => {
    try {
      await dispatch(clearChatHistory({
        beforeDate: dateRange.end?.toISOString(),
        keepFavorites: true,
      })).unwrap();
      toast.success('Chat history cleared');
    } catch (error) {
      toast.error('Failed to clear chat history');
    }
  };

  // Update thread title
  const handleUpdateTitle = async (threadId: string) => {
    if (!newTitle.trim()) return;

    try {
      await dispatch(updateThreadTitle({
        threadId,
        title: newTitle,
      })).unwrap();
      setEditingTitle(null);
      setNewTitle('');
      toast.success('Thread title updated');
    } catch (error) {
      toast.error('Failed to update title');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (threadId: string, isFavorite: boolean) => {
    try {
      await dispatch(favoriteThread({
        threadId,
        favorite: !isFavorite,
      })).unwrap();
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  // Add tag to thread
  const handleAddTag = async (threadId: string) => {
    if (!newTag.trim()) return;

    dispatch(addThreadTag({ threadId, tag: newTag }));
    setNewTag('');
    toast.success('Tag added');
  };

  // Remove tag from thread
  const handleRemoveTag = (threadId: string, tag: string) => {
    dispatch(removeThreadTag({ threadId, tag }));
    toast.success('Tag removed');
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    dispatch(setPagination({ currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setPagination({ itemsPerPage: size, currentPage: 1 }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chat History</h2>
          <p className="text-muted-foreground">
            {chat.pagination.totalItems} conversations • {chat.historySearch.results.length} search results
          </p>
        </div>
        
        {/* Export buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="destructive" onClick={handleClearHistory}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search chat history..."
              value={chat.historySearch.query}
              onChange={(e) => dispatch(setHistorySearchQuery(e.target.value))}
              disabled={chat.historySearch.loading}
            />
            <Button onClick={handleSearch} disabled={chat.historySearch.loading}>
              <Search className="w-4 h-4 mr-2" />
              {chat.historySearch.loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters row */}
          <div className="flex gap-4 items-center">
            {/* Role filter */}
            <Select
              value={chat.historyFilters.role}
              onValueChange={(value: 'all' | 'user' | 'assistant') =>
                dispatch(setHistoryFilters({ role: value }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="user">User Only</SelectItem>
                <SelectItem value="assistant">Assistant Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range pickers */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange.start ? format(dateRange.start, 'MMM dd') : 'Start Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={dateRange.start}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange.end ? format(dateRange.end, 'MMM dd') : 'End Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={dateRange.end}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                />
              </PopoverContent>
            </Popover>

            {/* Clear filters */}
            <Button
              variant="ghost"
              onClick={() => {
                dispatch(setHistoryFilters({ role: 'all', threadIds: [], tags: [] }));
                setDateRange({});
                dispatch(setHistorySearchQuery(''));
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Threads */}
      <div className="space-y-4">
        {chat.threads.map((thread) => (
          <Card key={thread.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                {editingTitle === thread.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Thread title..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateTitle(thread.id);
                        if (e.key === 'Escape') setEditingTitle(null);
                      }}
                    />
                    <Button size="sm" onClick={() => handleUpdateTitle(thread.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingTitle(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{thread.title}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingTitle(thread.id);
                        setNewTitle(thread.title);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleFavorite(thread.id, !!thread.isFavorite)}
                    >
                      <Heart 
                        className={`w-4 h-4 ${thread.isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {thread.messages?.length || 0} messages
                </Badge>
                <span>{format(new Date(thread.updatedAt), 'MMM dd, HH:mm')}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {thread.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => handleRemoveTag(thread.id, tag)}
                >
                  {tag} ×
                </Badge>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-24 h-6 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag(thread.id);
                  }}
                />
                <Button size="sm" variant="ghost" onClick={() => handleAddTag(thread.id)}>
                  <Tag className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Recent messages preview */}
            <div className="space-y-2">
              {thread.messages?.slice(-2).map((message, index) => (
                <div key={message.id} className="text-sm">
                  <span className={`font-medium ${
                    message.role === 'user' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {message.role === 'user' ? 'You' : 'Assistant'}:
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {message.content.substring(0, 100)}
                    {message.content.length > 100 ? '...' : ''}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select
            value={chat.pagination.itemsPerPage.toString()}
            onValueChange={(value) => handlePageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={chat.pagination.currentPage === 1}
            onClick={() => handlePageChange(chat.pagination.currentPage - 1)}
          >
            Previous
          </Button>
          <span className="py-2 px-4 text-sm">
            Page {chat.pagination.currentPage} of {chat.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={chat.pagination.currentPage === chat.pagination.totalPages}
            onClick={() => handlePageChange(chat.pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};