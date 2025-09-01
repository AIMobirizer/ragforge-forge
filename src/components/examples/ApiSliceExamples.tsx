import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  uploadDocument, 
  processDocument, 
  fetchDocuments,
  setUploadProgress 
} from '@/store/slices/documentsSlice';
import { 
  performSemanticSearch, 
  setQuery, 
  setFilters 
} from '@/store/slices/searchSlice';
import { 
  sendMessage, 
  createThread, 
  setActiveThread 
} from '@/store/slices/chatSlice';
import { 
  fetchAnalyticsMetrics, 
  setDateRange 
} from '@/store/slices/analyticsSlice';
import { 
  connectToServer, 
  fetchServerList 
} from '@/store/slices/mcpSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Example component showing how to use all the API slices
 * This demonstrates the working code for each slice
 */
export const ApiSliceExamples = () => {
  const dispatch = useAppDispatch();
  
  // Access state from all slices
  const documents = useAppSelector(state => state.documents);
  const search = useAppSelector(state => state.search);
  const chat = useAppSelector(state => state.chat);
  const analytics = useAppSelector(state => state.analytics);
  const mcp = useAppSelector(state => state.mcp);

  // Example: Document handling
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload document
      const result = await dispatch(uploadDocument(file)).unwrap();
      toast.success('Document uploaded successfully');
      
      // Process the document
      await dispatch(processDocument(result.id)).unwrap();
      toast.success('Document processed successfully');
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  // Example: Search functionality
  const handleSearch = async () => {
    if (!search.query.trim()) return;

    try {
      await dispatch(performSemanticSearch({
        query: search.query,
        limit: 10,
        similarity: search.filters.similarity
      })).unwrap();
      toast.success('Search completed');
    } catch (error) {
      toast.error('Search failed');
    }
  };

  // Example: Chat functionality
  const handleSendMessage = async () => {
    if (!chat.activeThreadId) {
      // Create new thread first
      const thread = await dispatch(createThread({
        title: 'New Conversation'
      })).unwrap();
      dispatch(setActiveThread(thread.id));
    }

    try {
      await dispatch(sendMessage({
        threadId: chat.activeThreadId!,
        message: 'Hello, how can you help me?',
        model: chat.selectedModel
      })).unwrap();
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Example: Analytics data fetching
  const handleFetchAnalytics = async () => {
    try {
      await dispatch(fetchAnalyticsMetrics({
        start: analytics.dateRange.start,
        end: analytics.dateRange.end,
        granularity: 'day'
      })).unwrap();
      toast.success('Analytics loaded');
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  };

  // Example: MCP server connection
  const handleConnectMCP = async () => {
    try {
      await dispatch(connectToServer({
        url: 'ws://localhost:8080/mcp',
        config: { timeout: 30000 }
      })).unwrap();
      toast.success('Connected to MCP server');
    } catch (error) {
      toast.error('Failed to connect to MCP server');
    }
  };

  // Load initial data
  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchServerList());
  }, [dispatch]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">API Slice Examples</h2>
      
      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>Documents API ({documents.documents.length} docs)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt"
            disabled={documents.loading}
          />
          <p className="text-sm text-muted-foreground">
            Status: {documents.loading ? 'Loading...' : 'Ready'}
          </p>
          {documents.processing.length > 0 && (
            <p className="text-sm text-blue-600">
              Processing: {documents.processing.length} documents
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search API ({search.results.length} results)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={search.query}
              onChange={(e) => dispatch(setQuery(e.target.value))}
              placeholder="Enter search query..."
              disabled={search.loading}
            />
            <Button onClick={handleSearch} disabled={search.loading}>
              {search.loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            History: {search.searchHistory.length} queries
          </div>
        </CardContent>
      </Card>

      {/* Chat Section */}
      <Card>
        <CardHeader>
          <CardTitle>Chat API ({chat.threads.length} threads)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSendMessage} disabled={chat.loading || chat.streaming}>
            {chat.loading || chat.streaming ? 'Sending...' : 'Send Test Message'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Model: {chat.selectedModel} | Active: {chat.activeThreadId || 'None'}
          </p>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics API ({analytics.metrics.length} metrics)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleFetchAnalytics} disabled={analytics.loading}>
            {analytics.loading ? 'Loading...' : 'Fetch Analytics'}
          </Button>
          <div className="flex gap-4 text-sm">
            <Input
              type="date"
              value={analytics.dateRange.start.split('T')[0]}
              onChange={(e) => dispatch(setDateRange({
                ...analytics.dateRange,
                start: new Date(e.target.value).toISOString()
              }))}
            />
            <Input
              type="date"
              value={analytics.dateRange.end.split('T')[0]}
              onChange={(e) => dispatch(setDateRange({
                ...analytics.dateRange,
                end: new Date(e.target.value).toISOString()
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* MCP Section */}
      <Card>
        <CardHeader>
          <CardTitle>MCP API ({mcp.servers.length} servers)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleConnectMCP} disabled={mcp.loading}>
            {mcp.loading ? 'Connecting...' : 'Connect Test Server'}
          </Button>
          <div className="space-y-2">
            {mcp.servers.map(server => (
              <div key={server.id} className="flex justify-between items-center p-2 bg-muted rounded">
                <span>{server.name}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  server.status === 'connected' ? 'bg-green-100 text-green-800' :
                  server.status === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {server.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};