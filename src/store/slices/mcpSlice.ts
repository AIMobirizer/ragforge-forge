import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  version?: string;
  capabilities: string[];
  lastPing?: string;
  config: Record<string, any>;
  metrics: {
    uptime: number;
    requestCount: number;
    errorCount: number;
    avgResponseTime: number;
  };
}

export interface MCPTool {
  id: string;
  serverId: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface MCPResource {
  id: string;
  serverId: string;
  type: string;
  name: string;
  uri: string;
  metadata: Record<string, any>;
}

export interface MCPState {
  servers: MCPServer[];
  tools: MCPTool[];
  resources: MCPResource[];
  activeServerId: string | null;
  loading: boolean;
  error: string | null;
  connectionLogs: {
    id: string;
    serverId: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
  }[];
}

const initialState: MCPState = {
  servers: [],
  tools: [],
  resources: [],
  activeServerId: null,
  loading: false,
  error: null,
  connectionLogs: [],
};

// Async thunks for MCP API calls
export const connectToServer = createAsyncThunk(
  'mcp/connectToServer',
  async (params: { url: string; config?: Record<string, any> }) => {
    const response = await fetch('/api/mcp/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect to MCP server');
    }
    
    return response.json();
  }
);

export const disconnectFromServer = createAsyncThunk(
  'mcp/disconnectFromServer',
  async (serverId: string) => {
    const response = await fetch(`/api/mcp/servers/${serverId}/disconnect`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect from server');
    }
    
    return serverId;
  }
);

export const fetchServerList = createAsyncThunk(
  'mcp/fetchServerList',
  async () => {
    const response = await fetch('/api/mcp/servers');
    
    if (!response.ok) {
      throw new Error('Failed to fetch server list');
    }
    
    return response.json();
  }
);

export const fetchServerTools = createAsyncThunk(
  'mcp/fetchServerTools',
  async (serverId: string) => {
    const response = await fetch(`/api/mcp/servers/${serverId}/tools`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch server tools');
    }
    
    return response.json();
  }
);

export const executeTool = createAsyncThunk(
  'mcp/executeTool',
  async (params: {
    serverId: string;
    toolId: string;
    parameters: Record<string, any>;
  }) => {
    const response = await fetch('/api/mcp/tools/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to execute tool');
    }
    
    return response.json();
  }
);

export const fetchServerResources = createAsyncThunk(
  'mcp/fetchServerResources',
  async (serverId: string) => {
    const response = await fetch(`/api/mcp/servers/${serverId}/resources`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch server resources');
    }
    
    return response.json();
  }
);

export const updateServerConfig = createAsyncThunk(
  'mcp/updateServerConfig',
  async (params: { serverId: string; config: Record<string, any> }) => {
    const response = await fetch(`/api/mcp/servers/${params.serverId}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config: params.config }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update server config');
    }
    
    return response.json();
  }
);

export const pingServer = createAsyncThunk(
  'mcp/pingServer',
  async (serverId: string) => {
    const response = await fetch(`/api/mcp/servers/${serverId}/ping`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to ping server');
    }
    
    return response.json();
  }
);

export const fetchServerLogs = createAsyncThunk(
  'mcp/fetchServerLogs',
  async (params: { serverId: string; limit?: number; level?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.level) searchParams.set('level', params.level);
    
    const response = await fetch(`/api/mcp/servers/${params.serverId}/logs?${searchParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch server logs');
    }
    
    return response.json();
  }
);

const mcpSlice = createSlice({
  name: 'mcp',
  initialState,
  reducers: {
    setActiveServer: (state, action: PayloadAction<string | null>) => {
      state.activeServerId = action.payload;
    },
    updateServerStatus: (state, action: PayloadAction<{ id: string; status: MCPServer['status'] }>) => {
      const server = state.servers.find(s => s.id === action.payload.id);
      if (server) {
        server.status = action.payload.status;
        server.lastPing = new Date().toISOString();
      }
    },
    addConnectionLog: (state, action: PayloadAction<{
      serverId: string;
      level: 'info' | 'warn' | 'error';
      message: string;
    }>) => {
      state.connectionLogs.unshift({
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only last 100 logs
      if (state.connectionLogs.length > 100) {
        state.connectionLogs.pop();
      }
    },
    updateServerMetrics: (state, action: PayloadAction<{
      serverId: string;
      metrics: Partial<MCPServer['metrics']>;
    }>) => {
      const server = state.servers.find(s => s.id === action.payload.serverId);
      if (server) {
        server.metrics = { ...server.metrics, ...action.payload.metrics };
      }
    },
    toggleTool: (state, action: PayloadAction<{ toolId: string; enabled: boolean }>) => {
      const tool = state.tools.find(t => t.id === action.payload.toolId);
      if (tool) {
        tool.enabled = action.payload.enabled;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLogs: (state) => {
      state.connectionLogs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect to server
      .addCase(connectToServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectToServer.fulfilled, (state, action) => {
        state.loading = false;
        state.servers.push(action.payload.server);
        state.activeServerId = action.payload.server.id;
      })
      .addCase(connectToServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to connect to server';
      })
      
      // Disconnect from server
      .addCase(disconnectFromServer.fulfilled, (state, action) => {
        const server = state.servers.find(s => s.id === action.payload);
        if (server) {
          server.status = 'disconnected';
        }
        if (state.activeServerId === action.payload) {
          state.activeServerId = null;
        }
      })
      
      // Fetch server list
      .addCase(fetchServerList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServerList.fulfilled, (state, action) => {
        state.loading = false;
        state.servers = action.payload.servers;
      })
      .addCase(fetchServerList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch servers';
      })
      
      // Fetch server tools
      .addCase(fetchServerTools.fulfilled, (state, action) => {
        // Replace tools for the specific server
        state.tools = state.tools.filter(t => t.serverId !== action.payload.serverId);
        state.tools.push(...action.payload.tools);
      })
      
      // Execute tool
      .addCase(executeTool.fulfilled, (state, action) => {
        // Handle tool execution result if needed
      })
      
      // Fetch server resources
      .addCase(fetchServerResources.fulfilled, (state, action) => {
        // Replace resources for the specific server
        state.resources = state.resources.filter(r => r.serverId !== action.payload.serverId);
        state.resources.push(...action.payload.resources);
      })
      
      // Update server config
      .addCase(updateServerConfig.fulfilled, (state, action) => {
        const server = state.servers.find(s => s.id === action.payload.serverId);
        if (server) {
          server.config = action.payload.config;
        }
      })
      
      // Ping server
      .addCase(pingServer.fulfilled, (state, action) => {
        const server = state.servers.find(s => s.id === action.payload.serverId);
        if (server) {
          server.status = action.payload.status;
          server.lastPing = action.payload.timestamp;
          server.metrics.avgResponseTime = action.payload.responseTime;
        }
      })
      
      // Fetch server logs
      .addCase(fetchServerLogs.fulfilled, (state, action) => {
        state.connectionLogs = action.payload.logs;
      });
  },
});

export const {
  setActiveServer,
  updateServerStatus,
  addConnectionLog,
  updateServerMetrics,
  toggleTool,
  clearError,
  clearLogs,
} = mcpSlice.actions;

export default mcpSlice.reducer;
