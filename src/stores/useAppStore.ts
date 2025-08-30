// Legacy compatibility layer for Redux migration
import { useAppSelector, useAppDispatch } from '@/store';
import { 
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
  processDocument,
  semanticSearch,
  setConnectionManager,
  type MCPServer,
  type DataSource,
  type DocumentChunk,
  type DocumentEmbedding,
  type ProcessingPipelineStatus,
  type KnowledgeGraphNode,
  type KnowledgeGraphLink,
  type ChatThread,
  type ChatMessage,
  type UploadedFile,
  type Settings,
} from '@/store/slices/appSlice';
import { MCPConnectionPoolManager } from '@/utils/mcpSimulation';

// Re-export types from the slice
export type {
  MCPServer,
  DataSource,
  DocumentChunk,
  DocumentEmbedding,
  ProcessingPipelineStatus,
  KnowledgeGraphNode,
  KnowledgeGraphLink,
  ChatThread,
  ChatMessage,
  UploadedFile,
  Settings,
};

// Custom hook that provides the same API as the old Zustand store
export const useAppStore = () => {
  const dispatch = useAppDispatch();
  const {
    mcpServers,
    mcpStatuses,
    connectionManager,
    dataSources,
    uploadedFiles,
    chatThreads,
    currentThreadId,
    chatMessages,
    documentEmbeddings,
    knowledgeGraph,
    settings,
    isRightPanelOpen,
  } = useAppSelector(state => state.app);

  // Initialize connection manager if needed
  if (!connectionManager) {
    const manager = new MCPConnectionPoolManager((statuses) => {
      // Update statuses through Redux
    });
    dispatch(setConnectionManager(manager));
  }

  return {
    // State
    mcpServers,
    mcpStatuses,
    connectionManager,
    dataSources,
    uploadedFiles,
    chatThreads,
    currentThreadId,
    chatMessages,
    documentEmbeddings,
    knowledgeGraph,
    settings,
    isRightPanelOpen,

    // MCP Server actions
    addMCPServer: (server: Omit<MCPServer, 'id' | 'status'>) => {
      dispatch(addMCPServer(server));
      if (connectionManager) {
        const newServer = {
          ...server,
          id: `mcp-${Date.now()}`,
          status: 'disconnected' as const,
        };
        connectionManager.addServer(newServer.id, newServer);
      }
    },
    updateMCPServer: (id: string, updates: Partial<MCPServer>) => {
      dispatch(updateMCPServer({ id, updates }));
    },
    deleteMCPServer: (id: string) => {
      dispatch(deleteMCPServer(id));
      if (connectionManager) {
        connectionManager.removeServer(id);
      }
    },
    removeMCPServer: (id: string) => {
      dispatch(deleteMCPServer(id));
      if (connectionManager) {
        connectionManager.removeServer(id);
      }
    },
    testMCPConnection: async (id: string): Promise<boolean> => {
      if (connectionManager) {
        const simulator = connectionManager.getServer(id);
        if (simulator) {
          return await simulator.testConnection();
        }
      }
      return false;
    },
    connectMCPServer: async (id: string) => {
      if (connectionManager) {
        const simulator = connectionManager.getServer(id);
        if (simulator) {
          await simulator.connect();
          dispatch(updateMCPServer({ 
            id, 
            updates: { 
              status: 'connected' as const, 
              lastConnected: new Date().toISOString() 
            }
          }));
        }
      }
    },
    disconnectMCPServer: (id: string) => {
      if (connectionManager) {
        const simulator = connectionManager.getServer(id);
        if (simulator) {
          simulator.disconnect();
          dispatch(updateMCPServer({ id, updates: { status: 'disconnected' as const } }));
        }
      }
    },
    connectAllMCPServers: async () => {
      if (connectionManager) {
        await connectionManager.connectAll();
      }
    },
    disconnectAllMCPServers: () => {
      if (connectionManager) {
        connectionManager.disconnectAll();
      }
    },
    importMCPConfigurations: (jsonData: string) => {
      if (connectionManager) {
        return connectionManager.importConfigurations(jsonData);
      }
      return { success: 0, errors: [] };
    },
    exportMCPConfigurations: () => {
      if (connectionManager) {
        return connectionManager.exportAllConfigurations();
      }
      return '{}';
    },
    getMCPServerStatus: (id: string) => {
      return mcpStatuses.find(status => status.id === id);
    },

    // Data source actions  
    addDataSource: (source: Omit<DataSource, 'id'>) => {
      dispatch(addDataSource(source));
    },
    updateDataSource: (id: string, updates: Partial<DataSource>) => {
      dispatch(updateDataSource({ id, updates }));
    },
    deleteDataSource: (id: string) => {
      dispatch(deleteDataSource(id));
    },
    removeDataSource: (id: string) => {
      dispatch(deleteDataSource(id));
    },
    processDocument: (sourceId: string) => {
      return dispatch(processDocument(sourceId));
    },

    // File actions
    addUploadedFile: (file: Omit<UploadedFile, 'id' | 'uploadedAt'>) => {
      dispatch(addUploadedFile(file));
    },
    deleteUploadedFile: (id: string) => {
      dispatch(deleteUploadedFile(id));
    },

    // Chat actions
    createNewThread: () => {
      dispatch(createNewThread());
      return currentThreadId || `thread-${Date.now()}`;
    },
    switchToThread: (threadId: string) => {
      dispatch(switchToThread(threadId));
    },
    addChatMessage: (message: Omit<ChatMessage, 'id' | 'threadId'>) => {
      dispatch(addChatMessage(message));
    },
    updateThreadTitle: (threadId: string, title: string) => {
      dispatch(updateThreadTitle({ threadId, title }));
    },
    deleteThread: (threadId: string) => {
      dispatch(deleteThread(threadId));
    },
    clearChatHistory: () => {
      dispatch(clearChatHistory());
    },
    getCurrentThreadMessages: () => {
      if (!currentThreadId) return [];
      return chatMessages.filter(message => message.threadId === currentThreadId);
    },
    exportChatAsMarkdown: () => {
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
      const markdown = chatMessages.length > 0 ? 'Export functionality' : 'No chat to export';
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    },

    // RAG actions
    semanticSearch: (query: string) => {
      return dispatch(semanticSearch(query));
    },
    updateEmbeddings: (sourceId: string, embeddings: DocumentEmbedding[]) => {
      dispatch(updateEmbeddings({ sourceId, embeddings }));
    },
    updateKnowledgeGraph: (nodes: KnowledgeGraphNode[], links: KnowledgeGraphLink[]) => {
      dispatch(updateKnowledgeGraph({ nodes, links }));
    },

    // Settings actions
    updateSettings: (updates: Partial<Settings>) => {
      dispatch(updateSettings(updates));
    },

    // UI actions
    toggleRightPanel: () => {
      dispatch(toggleRightPanel());
    },
  };
};