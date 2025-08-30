import { create } from 'zustand';
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

export interface ChatMessage {
  id: string;
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

interface AppStore {
  mcpServers: MCPServer[];
  mcpStatuses: MCPServerStatus[];
  connectionManager: MCPConnectionPoolManager;
  addMCPServer: (server: Omit<MCPServer, 'id' | 'status'>) => void;
  updateMCPServer: (id: string, updates: Partial<MCPServer>) => void;
  deleteMCPServer: (id: string) => void;
  removeMCPServer: (id: string) => void;
  testMCPConnection: (id: string) => Promise<boolean>;
  connectMCPServer: (id: string) => Promise<void>;
  disconnectMCPServer: (id: string) => void;
  connectAllMCPServers: () => Promise<void>;
  disconnectAllMCPServers: () => void;
  importMCPConfigurations: (jsonData: string) => { success: number; errors: string[] };
  exportMCPConfigurations: () => string;
  getMCPServerStatus: (id: string) => MCPServerStatus | undefined;
  
  dataSources: DataSource[];
  addDataSource: (source: Omit<DataSource, 'id'>) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
  removeDataSource: (id: string) => void;
  processDocument: (sourceId: string) => Promise<void>;
  
  uploadedFiles: UploadedFile[];
  addUploadedFile: (file: Omit<UploadedFile, 'id' | 'uploadedAt'>) => void;
  deleteUploadedFile: (id: string) => void;
  
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => void;
  exportChatAsMarkdown: () => string;
  exportChatAsPDF: () => void;
  
  // RAG functionality
  documentEmbeddings: DocumentEmbedding[];
  knowledgeGraph: {
    nodes: KnowledgeGraphNode[];
    links: KnowledgeGraphLink[];
  };
  semanticSearch: (query: string) => Promise<DocumentChunk[]>;
  updateEmbeddings: (sourceId: string, embeddings: DocumentEmbedding[]) => void;
  updateKnowledgeGraph: (nodes: KnowledgeGraphNode[], links: KnowledgeGraphLink[]) => void;
  
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  
  isRightPanelOpen: boolean;
  toggleRightPanel: () => void;
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

export const useAppStore = create<AppStore>((set, get) => {
  const connectionManager = new MCPConnectionPoolManager((statuses) => {
    set({ mcpStatuses: statuses });
  });

  sampleMCPServers.forEach(server => {
    connectionManager.addServer(server.id, server);
  });

  return {
    mcpServers: sampleMCPServers,
    mcpStatuses: [],
    connectionManager,
    
    addMCPServer: (serverData) => {
      const server: MCPServer = {
        ...serverData,
        id: `mcp-${Date.now()}`,
        status: 'disconnected',
      };
      
      get().connectionManager.addServer(server.id, server);
      set(state => ({
        mcpServers: [...state.mcpServers, server]
      }));
    },
    
    updateMCPServer: (id, updates) => {
      set(state => ({
        mcpServers: state.mcpServers.map(server =>
          server.id === id ? { ...server, ...updates } : server
        )
      }));
    },
    
    deleteMCPServer: (id) => {
      get().connectionManager.removeServer(id);
      set(state => ({
        mcpServers: state.mcpServers.filter(server => server.id !== id)
      }));
    },
    
    removeMCPServer: (id) => {
      get().deleteMCPServer(id);
    },
    
    testMCPConnection: async (id) => {
      const simulator = get().connectionManager.getServer(id);
      if (simulator) {
        return await simulator.testConnection();
      }
      return false;
    },
    
    connectMCPServer: async (id) => {
      const simulator = get().connectionManager.getServer(id);
      if (simulator) {
        await simulator.connect();
        set(state => ({
          mcpServers: state.mcpServers.map(server =>
            server.id === id 
              ? { ...server, status: 'connected', lastConnected: new Date().toISOString() }
              : server
          )
        }));
      }
    },
    
    disconnectMCPServer: (id) => {
      const simulator = get().connectionManager.getServer(id);
      if (simulator) {
        simulator.disconnect();
        set(state => ({
          mcpServers: state.mcpServers.map(server =>
            server.id === id ? { ...server, status: 'disconnected' } : server
          )
        }));
      }
    },
    
    connectAllMCPServers: async () => {
      await get().connectionManager.connectAll();
    },
    
    disconnectAllMCPServers: () => {
      get().connectionManager.disconnectAll();
    },
    
    importMCPConfigurations: (jsonData) => {
      return get().connectionManager.importConfigurations(jsonData);
    },
    
    exportMCPConfigurations: () => {
      return get().connectionManager.exportAllConfigurations();
    },
    
    getMCPServerStatus: (id) => {
      return get().mcpStatuses.find(status => status.id === id);
    },
    
    dataSources: [],
    addDataSource: (sourceData) => {
      const source: DataSource = {
        ...sourceData,
        id: `ds-${Date.now()}`,
      };
      set(state => ({
        dataSources: [...state.dataSources, source]
      }));
    },
    updateDataSource: (id, updates) => {
      set(state => ({
        dataSources: state.dataSources.map(source =>
          source.id === id ? { ...source, ...updates } : source
        )
      }));
    },
    deleteDataSource: (id) => {
      set(state => ({
        dataSources: state.dataSources.filter(source => source.id !== id)
      }));
    },
    
    removeDataSource: (id) => {
      get().deleteDataSource(id);
    },
    
    uploadedFiles: [],
    addUploadedFile: (fileData) => {
      const file: UploadedFile = {
        ...fileData,
        id: `file-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      set(state => ({
        uploadedFiles: [...state.uploadedFiles, file]
      }));
    },
    deleteUploadedFile: (id) => {
      set(state => ({
        uploadedFiles: state.uploadedFiles.filter(file => file.id !== id)
      }));
    },
    
    chatMessages: [],
    addChatMessage: (messageData) => {
      const message: ChatMessage = {
        ...messageData,
        id: `msg-${Date.now()}`,
      };
      set(state => ({
        chatMessages: [...state.chatMessages, message]
      }));
    },

    exportChatAsMarkdown: () => {
      const { chatMessages } = get();
      let markdown = '# Chat Export\n\n';
      
      chatMessages.forEach(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        markdown += `## ${msg.role === 'user' ? 'User' : 'Assistant'} - ${timestamp}\n\n`;
        markdown += `${msg.content}\n\n`;
        
        if (msg.citations && msg.citations.length > 0) {
          markdown += '### Citations\n\n';
          msg.citations.forEach((citation, index) => {
            markdown += `${index + 1}. ${citation.text} (Score: ${citation.score.toFixed(2)})\n`;
          });
          markdown += '\n';
        }
        
        markdown += '---\n\n';
      });
      
      return markdown;
    },

    exportChatAsPDF: () => {
      const markdown = get().exportChatAsMarkdown();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    },

    // RAG functionality
    documentEmbeddings: [],
    knowledgeGraph: {
      nodes: [],
      links: []
    },

    processDocument: async (sourceId: string) => {
      // Simulate document processing pipeline
      const source = get().dataSources.find(s => s.id === sourceId);
      if (!source) return;

      // Update processing status
      get().updateDataSource(sourceId, {
        processingStatus: {
          id: `proc-${Date.now()}`,
          sourceId,
          stage: 'chunking',
          progress: 0,
          message: 'Starting document processing...',
          timestamp: new Date().toISOString()
        }
      });

      // Simulate processing stages
      const stages = ['chunking', 'embedding', 'indexing', 'completed'] as const;
      
      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        get().updateDataSource(sourceId, {
          processingStatus: {
            id: `proc-${Date.now()}`,
            sourceId,
            stage: stages[i],
            progress: ((i + 1) / stages.length) * 100,
            message: `Processing: ${stages[i]}...`,
            timestamp: new Date().toISOString()
          }
        });
      }
    },

    semanticSearch: async (query: string) => {
      // Simulate semantic search
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock results
      return [
        {
          id: 'chunk1',
          sourceId: 'source1',
          content: 'Sample content that matches the query...',
          startIndex: 0,
          endIndex: 100,
          embedding: [],
          score: 0.85
        }
      ];
    },

    updateEmbeddings: (sourceId: string, embeddings: DocumentEmbedding[]) => {
      set(state => ({
        documentEmbeddings: [
          ...state.documentEmbeddings.filter(e => e.sourceId !== sourceId),
          ...embeddings
        ]
      }));
    },

    updateKnowledgeGraph: (nodes: KnowledgeGraphNode[], links: KnowledgeGraphLink[]) => {
      set({ knowledgeGraph: { nodes, links } });
    },
    
    settings: {
      chunkSize: 512,
      overlap: 50,
      embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
      vectorDatabase: 'chromadb',
      ollamaModel: 'llama3.2',
      temperature: 0.7,
      maxTokens: 2048,
      apiEndpoint: 'http://localhost:11434',
      theme: 'dark',
      fontSize: 14,
      language: 'en',
    },
    updateSettings: (updates) => {
      set(state => ({
        settings: { ...state.settings, ...updates }
      }));
    },
    
    isRightPanelOpen: false,
    toggleRightPanel: () => {
      set(state => ({ isRightPanelOpen: !state.isRightPanelOpen }));
    },
  };
});