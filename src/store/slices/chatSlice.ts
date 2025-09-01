import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  threadId: string;
  sources?: {
    id: string;
    title: string;
    content: string;
    similarity: number;
  }[];
  metadata?: {
    model?: string;
    temperature?: number;
    tokens?: number;
    cost?: number;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  model?: string;
  systemPrompt?: string;
}

export interface ChatState {
  threads: ChatThread[];
  activeThreadId: string | null;
  loading: boolean;
  streaming: boolean;
  error: string | null;
  models: string[];
  selectedModel: string;
  settings: {
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
}

const initialState: ChatState = {
  threads: [],
  activeThreadId: null,
  loading: false,
  streaming: false,
  error: null,
  models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet'],
  selectedModel: 'gpt-4',
  settings: {
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are a helpful AI assistant with access to a knowledge base.',
  },
};

// Async thunks for chat API calls
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (params: {
    threadId: string;
    message: string;
    model?: string;
    settings?: Partial<ChatState['settings']>;
  }) => {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
  }
);

export const streamMessage = createAsyncThunk(
  'chat/streamMessage',
  async (params: {
    threadId: string;
    message: string;
    model?: string;
    settings?: Partial<ChatState['settings']>;
  }, { dispatch }) => {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to stream message');
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response body');
    }
    
    let fullResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return fullResponse;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullResponse += parsed.content;
              dispatch(updateStreamingMessage({ content: parsed.content }));
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    return fullResponse;
  }
);

export const createThread = createAsyncThunk(
  'chat/createThread',
  async (params: { title?: string; systemPrompt?: string }) => {
    const response = await fetch('/api/chat/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create thread');
    }
    
    return response.json();
  }
);

export const fetchThreads = createAsyncThunk(
  'chat/fetchThreads',
  async () => {
    const response = await fetch('/api/chat/threads');
    
    if (!response.ok) {
      throw new Error('Failed to fetch threads');
    }
    
    return response.json();
  }
);

export const deleteThread = createAsyncThunk(
  'chat/deleteThread',
  async (threadId: string) => {
    const response = await fetch(`/api/chat/threads/${threadId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete thread');
    }
    
    return threadId;
  }
);

export const regenerateResponse = createAsyncThunk(
  'chat/regenerateResponse',
  async (params: { threadId: string; messageId: string }) => {
    const response = await fetch('/api/chat/regenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to regenerate response');
    }
    
    return response.json();
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveThread: (state, action: PayloadAction<string | null>) => {
      state.activeThreadId = action.payload;
    },
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<ChatState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const thread = state.threads.find(t => t.id === action.payload.threadId);
      if (thread) {
        thread.messages.push(action.payload);
        thread.updatedAt = new Date().toISOString();
      }
    },
    updateMessage: (state, action: PayloadAction<Partial<ChatMessage> & { id: string }>) => {
      const thread = state.threads.find(t => 
        t.messages.some(m => m.id === action.payload.id)
      );
      if (thread) {
        const messageIndex = thread.messages.findIndex(m => m.id === action.payload.id);
        if (messageIndex !== -1) {
          thread.messages[messageIndex] = { 
            ...thread.messages[messageIndex], 
            ...action.payload 
          };
        }
      }
    },
    updateStreamingMessage: (state, action: PayloadAction<{ content: string }>) => {
      const activeThread = state.threads.find(t => t.id === state.activeThreadId);
      if (activeThread && activeThread.messages.length > 0) {
        const lastMessage = activeThread.messages[activeThread.messages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content += action.payload.content;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { userMessage, assistantMessage } = action.payload;
        const thread = state.threads.find(t => t.id === userMessage.threadId);
        if (thread) {
          thread.messages.push(userMessage, assistantMessage);
          thread.updatedAt = new Date().toISOString();
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      
      // Stream message
      .addCase(streamMessage.pending, (state) => {
        state.streaming = true;
        state.error = null;
      })
      .addCase(streamMessage.fulfilled, (state) => {
        state.streaming = false;
      })
      .addCase(streamMessage.rejected, (state, action) => {
        state.streaming = false;
        state.error = action.error.message || 'Failed to stream message';
      })
      
      // Create thread
      .addCase(createThread.fulfilled, (state, action) => {
        state.threads.push(action.payload);
        state.activeThreadId = action.payload.id;
      })
      
      // Fetch threads
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch threads';
      })
      
      // Delete thread
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter(t => t.id !== action.payload);
        if (state.activeThreadId === action.payload) {
          state.activeThreadId = null;
        }
      })
      
      // Regenerate response
      .addCase(regenerateResponse.fulfilled, (state, action) => {
        const thread = state.threads.find(t => t.id === action.payload.threadId);
        if (thread) {
          const messageIndex = thread.messages.findIndex(m => m.id === action.payload.oldMessageId);
          if (messageIndex !== -1) {
            thread.messages[messageIndex] = action.payload.newMessage;
          }
        }
      });
  },
});

export const {
  setActiveThread,
  setSelectedModel,
  updateSettings,
  addMessage,
  updateMessage,
  updateStreamingMessage,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;