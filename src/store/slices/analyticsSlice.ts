import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  timestamp: string;
}

export interface UsageStats {
  totalQueries: number;
  totalDocuments: number;
  totalChunks: number;
  avgResponseTime: number;
  successRate: number;
  topQueries: { query: string; count: number }[];
  topSources: { source: string; count: number }[];
}

export interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface AnalyticsState {
  metrics: AnalyticsMetric[];
  usageStats: UsageStats | null;
  performanceData: PerformanceMetric[];
  loading: boolean;
  error: string | null;
  dateRange: {
    start: string;
    end: string;
  };
  refreshInterval: number;
}

const initialState: AnalyticsState = {
  metrics: [],
  usageStats: null,
  performanceData: [],
  loading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
  refreshInterval: 30000, // 30 seconds
};

// Async thunks for analytics API calls
export const fetchAnalyticsMetrics = createAsyncThunk(
  'analytics/fetchMetrics',
  async (params: { start: string; end: string; granularity?: 'hour' | 'day' | 'week' }) => {
    const response = await fetch('/api/analytics/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics metrics');
    }
    
    return response.json();
  }
);

export const fetchUsageStats = createAsyncThunk(
  'analytics/fetchUsageStats',
  async (params: { start: string; end: string }) => {
    const response = await fetch('/api/analytics/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch usage stats');
    }
    
    return response.json();
  }
);

export const fetchPerformanceData = createAsyncThunk(
  'analytics/fetchPerformance',
  async (params: { start: string; end: string; interval?: number }) => {
    const response = await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance data');
    }
    
    return response.json();
  }
);

export const trackEvent = createAsyncThunk(
  'analytics/trackEvent',
  async (params: {
    event: string;
    properties?: Record<string, any>;
    userId?: string;
    sessionId?: string;
  }) => {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to track event');
    }
    
    return response.json();
  }
);

export const generateReport = createAsyncThunk(
  'analytics/generateReport',
  async (params: {
    type: 'usage' | 'performance' | 'errors' | 'custom';
    start: string;
    end: string;
    format: 'pdf' | 'csv' | 'json';
    filters?: Record<string, any>;
  }) => {
    const response = await fetch('/api/analytics/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate report');
    }
    
    return response.json();
  }
);

export const exportData = createAsyncThunk(
  'analytics/exportData',
  async (params: {
    type: 'metrics' | 'usage' | 'performance';
    start: string;
    end: string;
    format: 'csv' | 'json';
  }) => {
    const response = await fetch('/api/analytics/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to export data');
    }
    
    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const filename = `analytics-${params.type}-${Date.now()}.${params.format}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.dateRange = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addPerformancePoint: (state, action: PayloadAction<PerformanceMetric>) => {
      state.performanceData.push(action.payload);
      // Keep only last 100 points for real-time display
      if (state.performanceData.length > 100) {
        state.performanceData.shift();
      }
    },
    updateMetric: (state, action: PayloadAction<Partial<AnalyticsMetric> & { id: string }>) => {
      const index = state.metrics.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.metrics[index] = { ...state.metrics[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metrics
      .addCase(fetchAnalyticsMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics;
      })
      .addCase(fetchAnalyticsMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      })
      
      // Fetch usage stats
      .addCase(fetchUsageStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsageStats.fulfilled, (state, action) => {
        state.loading = false;
        state.usageStats = action.payload;
      })
      .addCase(fetchUsageStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch usage stats';
      })
      
      // Fetch performance data
      .addCase(fetchPerformanceData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPerformanceData.fulfilled, (state, action) => {
        state.loading = false;
        state.performanceData = action.payload.data;
      })
      .addCase(fetchPerformanceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch performance data';
      })
      
      // Track event
      .addCase(trackEvent.fulfilled, (state, action) => {
        // Optionally update local state based on tracked event
      })
      
      // Generate report
      .addCase(generateReport.fulfilled, (state, action) => {
        // Handle report generation success
      })
      
      // Export data
      .addCase(exportData.fulfilled, (state, action) => {
        // Handle export success
      });
  },
});

export const {
  setDateRange,
  setRefreshInterval,
  clearError,
  addPerformancePoint,
  updateMetric,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
