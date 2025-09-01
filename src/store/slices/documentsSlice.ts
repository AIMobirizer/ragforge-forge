import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  chunks?: DocumentChunk[];
  embeddings?: number[];
  metadata?: Record<string, any>;
  uploadedAt: string;
  processedAt?: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  similarity?: number;
}

export interface DocumentsState {
  documents: Document[];
  processing: string[];
  uploadProgress: Record<string, number>;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  processing: [],
  uploadProgress: {},
  loading: false,
  error: null,
};

// Async thunks for API calls
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  }
);

export const processDocument = createAsyncThunk(
  'documents/process',
  async (documentId: string) => {
    const response = await fetch(`/api/documents/${documentId}/process`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Processing failed');
    }
    
    return response.json();
  }
);

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async () => {
    const response = await fetch('/api/documents');
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    
    return response.json();
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (documentId: string) => {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Delete failed');
    }
    
    return documentId;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      state.uploadProgress[action.payload.id] = action.payload.progress;
    },
    clearError: (state) => {
      state.error = null;
    },
    addDocument: (state, action: PayloadAction<Document>) => {
      state.documents.push(action.payload);
    },
    updateDocument: (state, action: PayloadAction<Partial<Document> & { id: string }>) => {
      const index = state.documents.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = { ...state.documents[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Upload failed';
      })
      
      // Process document
      .addCase(processDocument.pending, (state, action) => {
        state.processing.push(action.meta.arg);
      })
      .addCase(processDocument.fulfilled, (state, action) => {
        state.processing = state.processing.filter(id => id !== action.payload.id);
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = { ...state.documents[index], ...action.payload };
        }
      })
      .addCase(processDocument.rejected, (state, action) => {
        state.processing = state.processing.filter(id => id !== action.meta.arg);
        state.error = action.error.message || 'Processing failed';
      })
      
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      
      // Delete document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      });
  },
});

export const { setUploadProgress, clearError, addDocument, updateDocument } = documentsSlice.actions;
export default documentsSlice.reducer;