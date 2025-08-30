import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { MCPConnectionPoolManager, MCPServerStatus } from '@/utils/mcpSimulation';

export interface MCPServer {
  id: string;
  name: string;
  endpoint: string;
  authMethod: 'none' | 'apikey' | 'oauth' | 'bearer';
  authValue?: string;
  description?: string;
  status: 'connecting' | 'connected' | 'error' | 'disconnected';
  lastConnected?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'google-drive' | 'dropbox' | 'github' | 'slack' | 'postgresql' | 'file';
  status: 'connecting' | 'connected' | 'error' | 'disconnected' | 'syncing';
  lastSync?: string;
  fileCount?: number;
  chunks?: DocumentChunk[];
  embeddings?: DocumentEmbedding[];
  processingStatus?: ProcessingPipelineStatus;
}

export interface DocumentChunk {
  id: string;
  sourceId: string;
  content: string;
  startIndex: number;
  endIndex: number;
  embedding?: number[];
  score?: number;
}

export interface DocumentEmbedding {
  id: string;
  sourceId: string;
  vector: number[];
  metadata: {
    chunkId: string;
    content: string;
    position: { x: number; y: number };
  };
}

export interface ProcessingPipelineStatus {
  id: string;
  sourceId: string;
  stage: 'uploading' | 'chunking' | 'embedding' | 'indexing' | 'completed' | 'error';
  progress: number;
  message: string;
  timestamp: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'document' | 'concept' | 'entity';
  size: number;
  color: string;
  metadata?: any;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  strength: number;
  type: 'reference' | 'similarity' | 'concept';
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  sources?: string[];
  citations?: Array<{
    id: string;
    text: string;
    sourceId: string;
    chunkId: string;
    score: number;
  }>;
  highlightedContent?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  processed: boolean;
}

export interface Settings {
  chunkSize: number;
  overlap: number;
  embeddingModel: string;
  vectorDatabase: string;
  ollamaModel: string;
  temperature: number;
  maxTokens: number;
  apiEndpoint: string;
  theme: 'light' | 'dark';
  fontSize: number;
  language: string;
}

export interface AppState {
  mcpServers: MCPServer[];
  mcpStatuses: MCPServerStatus[];
  connectionManager: MCPConnectionPoolManager | null;
  dataSources: DataSource[];
  uploadedFiles: UploadedFile[];
  chatThreads: ChatThread[];
  currentThreadId: string | null;
  chatMessages: ChatMessage[];
  documentEmbeddings: DocumentEmbedding[];
  knowledgeGraph: {
    nodes: KnowledgeGraphNode[];
    links: KnowledgeGraphLink[];
  };
  settings: Settings;
  isRightPanelOpen: boolean;
}

const sampleMCPServers: MCPServer[] = [
  {
    id: 'mcp-1',
    name: 'Local RAG Server',
    endpoint: 'ws://localhost:8001/mcp',
    authMethod: 'none',
    description: 'Local development MCP server',
    status: 'disconnected',
  },
];

const initialState: AppState = {
  mcpServers: sampleMCPServers,
  mcpStatuses: [],
  connectionManager: null,
  dataSources: [],
  uploadedFiles: [],
  chatThreads: [],
  currentThreadId: null,
  chatMessages: [],
  documentEmbeddings: [],
  knowledgeGraph: {
    nodes: [],
    links: []
  },
  settings: {
    chunkSize: 1000,
    overlap: 100,
    embeddingModel: 'text-embedding-ada-002',
    vectorDatabase: 'pinecone',
    ollamaModel: 'llama3:8b',
    temperature: 0.7,
    maxTokens: 2048,
    apiEndpoint: 'http://localhost:11434',
    theme: 'light',
    fontSize: 14,
    language: 'en'
  },
  isRightPanelOpen: false,
};

// Async thunks
export const processDocument = createAsyncThunk(
  'app/processDocument',
  async (sourceId: string, { getState, dispatch }) => {
    const state = getState() as { app: AppState };
    const source = state.app.dataSources.find(s => s.id === sourceId);
    if (!source) return;

    // Update processing status
    dispatch(updateDataSource({
      id: sourceId,
      updates: {
        processingStatus: {
          id: `proc-${Date.now()}`,
          sourceId,
          stage: 'chunking',
          progress: 0,
          message: 'Starting document processing...',
          timestamp: new Date().toISOString()
        }
      }
    }));

    // Simulate processing stages
    const stages = ['chunking', 'embedding', 'indexing', 'completed'] as const;
    
    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(updateDataSource({
        id: sourceId,
        updates: {
          processingStatus: {
            id: `proc-${Date.now()}`,
            sourceId,
            stage: stages[i],
            progress: ((i + 1) / stages.length) * 100,
            message: `Processing stage: ${stages[i]}`,
            timestamp: new Date().toISOString()
          }
        }
      }));
    }
  }
);

export const semanticSearch = createAsyncThunk(
  'app/semanticSearch',
  async (query: string, { getState }): Promise<DocumentChunk[]> => {
    const state = getState() as { app: AppState };
    
    // Simulate semantic search
    const mockChunks: DocumentChunk[] = [
      {
        id: 'chunk-1',
        sourceId: 'ds-1',
        content: `Sample content related to: ${query}`,
        startIndex: 0,
        endIndex: 100,
        score: 0.95
      },
      {
        id: 'chunk-2',
        sourceId: 'ds-2',
        content: `Another relevant chunk for: ${query}`,
        startIndex: 100,
        endIndex: 200,
        score: 0.87
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChunks;
  }
);

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setConnectionManager: (state, action: PayloadAction<MCPConnectionPoolManager>) => {
      state.connectionManager = action.payload;
    },
    setMCPStatuses: (state, action: PayloadAction<MCPServerStatus[]>) => {
      state.mcpStatuses = action.payload;
    },
    addMCPServer: (state, action: PayloadAction<Omit<MCPServer, 'id' | 'status'>>) => {
      const server: MCPServer = {
        ...action.payload,
        id: `mcp-${Date.now()}`,
        status: 'disconnected',
      };
      state.mcpServers.push(server);
    },
    updateMCPServer: (state, action: PayloadAction<{ id: string; updates: Partial<MCPServer> }>) => {
      const index = state.mcpServers.findIndex(server => server.id === action.payload.id);
      if (index !== -1) {
        state.mcpServers[index] = { ...state.mcpServers[index], ...action.payload.updates };
      }
    },
    deleteMCPServer: (state, action: PayloadAction<string>) => {
      state.mcpServers = state.mcpServers.filter(server => server.id !== action.payload);
    },
    addDataSource: (state, action: PayloadAction<Omit<DataSource, 'id'>>) => {
      const source: DataSource = {
        ...action.payload,
        id: `ds-${Date.now()}`,
      };
      state.dataSources.push(source);
    },
    updateDataSource: (state, action: PayloadAction<{ id: string; updates: Partial<DataSource> }>) => {
      const index = state.dataSources.findIndex(source => source.id === action.payload.id);
      if (index !== -1) {
        state.dataSources[index] = { ...state.dataSources[index], ...action.payload.updates };
      }
    },
    deleteDataSource: (state, action: PayloadAction<string>) => {
      state.dataSources = state.dataSources.filter(source => source.id !== action.payload);
    },
    addUploadedFile: (state, action: PayloadAction<Omit<UploadedFile, 'id' | 'uploadedAt'>>) => {
      const file: UploadedFile = {
        ...action.payload,
        id: `file-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      state.uploadedFiles.push(file);
    },
    deleteUploadedFile: (state, action: PayloadAction<string>) => {
      state.uploadedFiles = state.uploadedFiles.filter(file => file.id !== action.payload);
    },
    createNewThread: (state) => {
      const newThread: ChatThread = {
        id: `thread-${Date.now()}`,
        title: 'New Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      state.chatThreads.push(newThread);
      state.currentThreadId = newThread.id;
    },
    switchToThread: (state, action: PayloadAction<string>) => {
      state.currentThreadId = action.payload;
    },
    addChatMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'threadId'>>) => {
      let threadId = state.currentThreadId;
      
      // Create new thread if none exists
      if (!threadId) {
        const newThread: ChatThread = {
          id: `thread-${Date.now()}`,
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
        };
        state.chatThreads.push(newThread);
        state.currentThreadId = newThread.id;
        threadId = newThread.id;
      }
      
      const message: ChatMessage = {
        ...action.payload,
        id: `msg-${Date.now()}`,
        threadId,
      };
      
      state.chatMessages.push(message);
      
      // Update thread
      const threadIndex = state.chatThreads.findIndex(t => t.id === threadId);
      if (threadIndex !== -1) {
        const threadMessages = state.chatMessages.filter(m => m.threadId === threadId);
        const isFirstMessage = threadMessages.length === 1 && action.payload.role === 'user';
        
        state.chatThreads[threadIndex] = {
          ...state.chatThreads[threadIndex],
          title: isFirstMessage ? action.payload.content.slice(0, 50) + '...' : state.chatThreads[threadIndex].title,
          updatedAt: new Date().toISOString(),
          messageCount: threadMessages.length,
          lastMessage: action.payload.content.slice(0, 100)
        };
      }
    },
    updateThreadTitle: (state, action: PayloadAction<{ threadId: string; title: string }>) => {
      const index = state.chatThreads.findIndex(thread => thread.id === action.payload.threadId);
      if (index !== -1) {
        state.chatThreads[index].title = action.payload.title;
      }
    },
    deleteThread: (state, action: PayloadAction<string>) => {
      state.chatThreads = state.chatThreads.filter(thread => thread.id !== action.payload);
      state.chatMessages = state.chatMessages.filter(message => message.threadId !== action.payload);
      if (state.currentThreadId === action.payload) {
        state.currentThreadId = null;
      }
    },
    clearChatHistory: (state) => {
      state.chatMessages = [];
      state.chatThreads = [];
      state.currentThreadId = null;
    },
    updateEmbeddings: (state, action: PayloadAction<{ sourceId: string; embeddings: DocumentEmbedding[] }>) => {
      // Remove old embeddings for this source
      state.documentEmbeddings = state.documentEmbeddings.filter(
        emb => emb.sourceId !== action.payload.sourceId
      );
      // Add new embeddings
      state.documentEmbeddings.push(...action.payload.embeddings);
    },
    updateKnowledgeGraph: (state, action: PayloadAction<{ nodes: KnowledgeGraphNode[]; links: KnowledgeGraphLink[] }>) => {
      state.knowledgeGraph = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    toggleRightPanel: (state) => {
      state.isRightPanelOpen = !state.isRightPanelOpen;
    },
  },
});

export const {
  setConnectionManager,
  setMCPStatuses,
  addMCPServer,
  updateMCPServer,
  deleteMCPServer,
  addDataSource,
  updateDataSource,
  deleteDataSource,
  addUploadedFile,
  deleteUploadedFile,
  createNewThread,
  switchToThread,
  addChatMessage,
  updateThreadTitle,
  deleteThread,
  clearChatHistory,
  updateEmbeddings,
  updateKnowledgeGraph,
  updateSettings,
  toggleRightPanel,
} = appSlice.actions;

export default appSlice.reducer;