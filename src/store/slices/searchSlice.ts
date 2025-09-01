import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DocumentChunk } from './documentsSlice';

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
  source: string;
  highlighted?: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  filters: {
    sources: string[];
    dateRange?: { start: string; end: string };
    similarity: number;
  };
  searchHistory: string[];
}

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  filters: {
    sources: [],
    similarity: 0.7,
  },
  searchHistory: [],
};

// Async thunks for search API calls
export const performSemanticSearch = createAsyncThunk(
  'search/semantic',
  async (params: {
    query: string;
    sources?: string[];
    limit?: number;
    similarity?: number;
  }) => {
    const response = await fetch('/api/search/semantic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return response.json();
  }
);

export const performHybridSearch = createAsyncThunk(
  'search/hybrid',
  async (params: {
    query: string;
    sources?: string[];
    limit?: number;
    weights?: { semantic: number; keyword: number };
  }) => {
    const response = await fetch('/api/search/hybrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Hybrid search failed');
    }
    
    return response.json();
  }
);

export const getSimilarDocuments = createAsyncThunk(
  'search/similar',
  async (documentId: string) => {
    const response = await fetch(`/api/search/similar/${documentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get similar documents');
    }
    
    return response.json();
  }
);

export const saveSearch = createAsyncThunk(
  'search/save',
  async (params: { query: string; results: SearchResult[] }) => {
    const response = await fetch('/api/search/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save search');
    }
    
    return response.json();
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<SearchState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      if (!state.searchHistory.includes(action.payload)) {
        state.searchHistory.unshift(action.payload);
        if (state.searchHistory.length > 10) {
          state.searchHistory.pop();
        }
      }
    },
    clearHistory: (state) => {
      state.searchHistory = [];
    },
    highlightResult: (state, action: PayloadAction<{ id: string; highlighted: string }>) => {
      const result = state.results.find(r => r.id === action.payload.id);
      if (result) {
        result.highlighted = action.payload.highlighted;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Semantic search
      .addCase(performSemanticSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSemanticSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        if (action.payload.query) {
          searchSlice.caseReducers.addToHistory(state, { payload: action.payload.query, type: 'search/addToHistory' });
        }
      })
      .addCase(performSemanticSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Search failed';
      })
      
      // Hybrid search
      .addCase(performHybridSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performHybridSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        if (action.payload.query) {
          searchSlice.caseReducers.addToHistory(state, { payload: action.payload.query, type: 'search/addToHistory' });
        }
      })
      .addCase(performHybridSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Hybrid search failed';
      })
      
      // Similar documents
      .addCase(getSimilarDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSimilarDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
      })
      .addCase(getSimilarDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get similar documents';
      });
  },
});

export const { 
  setQuery, 
  clearResults, 
  setFilters, 
  addToHistory, 
  clearHistory, 
  highlightResult 
} = searchSlice.actions;

export default searchSlice.reducer;