import { create } from 'zustand';

export interface MCPServer {
  id: string;
  name: string;
  endpoint: string;
  authMethod: 'none' | 'api_key' | 'oauth' | 'bearer';
  description: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSync?: Date;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'google_drive' | 'dropbox' | 'github' | 'slack' | 'postgresql' | 'file';
  status: 'connected' | 'disconnected' | 'syncing';
  fileCount?: number;
  lastSync?: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: string[];
}

export interface AppSettings {
  chunkSize: number;
  overlap: number;
  embeddingModel: string;
  vectorDatabase: string;
  ollamaModel: string;
  temperature: number;
  maxTokens: number;
  apiEndpoint: string;
  darkMode: boolean;
  fontSize: number;
  language: string;
}

interface AppState {
  mcpServers: MCPServer[];
  dataSources: DataSource[];
  chatMessages: ChatMessage[];
  settings: AppSettings;
  isRightPanelOpen: boolean;
  currentPage: string;
  
  // Actions
  addMCPServer: (server: Omit<MCPServer, 'id'>) => void;
  updateMCPServer: (id: string, updates: Partial<MCPServer>) => void;
  removeMCPServer: (id: string) => void;
  addDataSource: (source: Omit<DataSource, 'id'>) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  removeDataSource: (id: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleRightPanel: () => void;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mcpServers: [
    {
      id: '1',
      name: 'Internal Knowledge Base',
      endpoint: 'https://api.internal.com/mcp',
      authMethod: 'api_key',
      description: 'Company internal documentation and policies',
      status: 'disconnected'
    },
    {
      id: '2', 
      name: 'Research Database',
      endpoint: 'https://research.example.com/mcp',
      authMethod: 'oauth',
      description: 'Scientific papers and research articles',
      status: 'disconnected'
    },
    {
      id: '3',
      name: 'Customer Support KB',
      endpoint: 'https://support.company.com/mcp',
      authMethod: 'bearer',
      description: 'Customer support documentation and FAQs',
      status: 'error'
    }
  ],
  
  dataSources: [
    {
      id: '1',
      name: 'Project Documentation',
      type: 'file',
      status: 'connected',
      fileCount: 25,
      lastSync: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '2',
      name: 'Team Slack',
      type: 'slack',
      status: 'syncing',
      fileCount: 1420,
      lastSync: new Date(Date.now() - 1000 * 60 * 5)
    }
  ],
  
  chatMessages: [
    {
      id: '1',
      content: 'Hello! How can I help you with your data analysis today?',
      role: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 10)
    },
    {
      id: '2',
      content: 'Can you explain the latest quarterly results from our financial documents?',
      role: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 9)
    },
    {
      id: '3',
      content: 'Based on the financial documents in your knowledge base, the Q3 results show a 15% increase in revenue compared to Q2, driven primarily by strong performance in the enterprise segment. The key highlights include...',
      role: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      sources: ['Q3_Financial_Report.pdf', 'Revenue_Analysis.xlsx']
    }
  ],
  
  settings: {
    chunkSize: 512,
    overlap: 50,
    embeddingModel: 'nomic-embed-text',
    vectorDatabase: 'chromadb',
    ollamaModel: 'llama3.2',
    temperature: 0.7,
    maxTokens: 2048,
    apiEndpoint: 'http://localhost:11434',
    darkMode: true,
    fontSize: 14,
    language: 'en'
  },
  
  isRightPanelOpen: false,
  currentPage: '/',
  
  addMCPServer: (server) => set((state) => ({
    mcpServers: [...state.mcpServers, { ...server, id: Date.now().toString() }]
  })),
  
  updateMCPServer: (id, updates) => set((state) => ({
    mcpServers: state.mcpServers.map(server => 
      server.id === id ? { ...server, ...updates } : server
    )
  })),
  
  removeMCPServer: (id) => set((state) => ({
    mcpServers: state.mcpServers.filter(server => server.id !== id)
  })),
  
  addDataSource: (source) => set((state) => ({
    dataSources: [...state.dataSources, { ...source, id: Date.now().toString() }]
  })),
  
  updateDataSource: (id, updates) => set((state) => ({
    dataSources: state.dataSources.map(source =>
      source.id === id ? { ...source, ...updates } : source
    )
  })),
  
  removeDataSource: (id) => set((state) => ({
    dataSources: state.dataSources.filter(source => source.id !== id)
  })),
  
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }]
  })),
  
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates }
  })),
  
  toggleRightPanel: () => set((state) => ({
    isRightPanelOpen: !state.isRightPanelOpen
  })),
  
  setCurrentPage: (page) => set({ currentPage: page })
}));