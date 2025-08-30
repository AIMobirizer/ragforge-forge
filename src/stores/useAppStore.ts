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
  status: 'connecting' | 'connected' | 'error' | 'disconnected';
  lastSync?: string;
  fileCount?: number;
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
  
  uploadedFiles: UploadedFile[];
  addUploadedFile: (file: Omit<UploadedFile, 'id' | 'uploadedAt'>) => void;
  deleteUploadedFile: (id: string) => void;
  
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