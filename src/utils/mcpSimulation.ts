export interface MCPServerMetrics {
  requestsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  totalRequests: number;
  totalErrors: number;
  uptime: number;
  lastRequestTime: number;
}

export interface MCPServerLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: any;
}

export interface MCPServerStatus {
  id: string;
  status: 'connecting' | 'connected' | 'error' | 'disconnected';
  metrics: MCPServerMetrics;
  logs: MCPServerLog[];
  connectionTime?: number;
  lastHealthCheck?: number;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
}

export class MCPServerSimulator {
  private status: MCPServerStatus;
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private onStatusUpdate?: (status: MCPServerStatus) => void;
  private simulationIntervals: NodeJS.Timeout[] = [];

  constructor(
    private serverId: string,
    private serverConfig: any,
    onStatusUpdate?: (status: MCPServerStatus) => void
  ) {
    this.onStatusUpdate = onStatusUpdate;
    this.status = {
      id: serverId,
      status: 'disconnected',
      metrics: {
        requestsPerSecond: 0,
        averageLatency: 0,
        errorRate: 0,
        totalRequests: 0,
        totalErrors: 0,
        uptime: 0,
        lastRequestTime: 0,
      },
      logs: [],
      connectionPool: {
        active: 0,
        idle: 0,
        total: 0
      }
    };
  }

  async connect(): Promise<void> {
    this.updateStatus('connecting');
    this.addLog('info', `Attempting to connect to ${this.serverConfig.name}`);

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate connection success/failure based on server config
    const shouldFail = Math.random() < 0.1; // 10% failure rate
    
    if (shouldFail) {
      this.updateStatus('error');
      this.addLog('error', 'Connection failed: Timeout after 3000ms');
      return;
    }

    this.updateStatus('connected');
    this.status.connectionTime = Date.now();
    this.addLog('info', `Successfully connected to ${this.serverConfig.name}`);
    this.addLog('debug', `Endpoint: ${this.serverConfig.endpoint}`);

    // Initialize connection pool
    this.status.connectionPool = {
      active: Math.floor(Math.random() * 5) + 1,
      idle: Math.floor(Math.random() * 3) + 1,
      total: 0
    };
    this.status.connectionPool.total = 
      this.status.connectionPool.active + this.status.connectionPool.idle;

    this.startHealthChecks();
    this.startMetricsSimulation();
    this.startActivitySimulation();
  }

  async disconnect(): Promise<void> {
    this.addLog('info', `Disconnecting from ${this.serverConfig.name}`);
    this.stopAllIntervals();
    this.updateStatus('disconnected');
    this.status.connectionTime = undefined;
    this.status.connectionPool = { active: 0, idle: 0, total: 0 };
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  private async performHealthCheck(): Promise<void> {
    const latency = Math.random() * 100 + 20; // 20-120ms
    this.status.lastHealthCheck = Date.now();
    
    // Simulate occasional health check failures
    if (Math.random() < 0.05) { // 5% failure rate
      this.addLog('warn', `Health check failed - high latency: ${latency.toFixed(1)}ms`);
      this.status.metrics.errorRate = Math.min(this.status.metrics.errorRate + 0.1, 1);
    } else {
      this.addLog('debug', `Health check passed - latency: ${latency.toFixed(1)}ms`);
      this.status.metrics.errorRate = Math.max(this.status.metrics.errorRate - 0.01, 0);
    }

    this.notifyStatusUpdate();
  }

  private startMetricsSimulation(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, 1000); // Update every second
  }

  private updateMetrics(): void {
    if (this.status.status !== 'connected') return;

    const now = Date.now();
    const baseRps = Math.random() * 10 + 2; // 2-12 requests per second
    const latency = Math.random() * 50 + 30; // 30-80ms average
    
    // Simulate request bursts
    const isBurst = Math.random() < 0.1;
    const currentRps = isBurst ? baseRps * 3 : baseRps;
    
    this.status.metrics.requestsPerSecond = currentRps;
    this.status.metrics.averageLatency = latency;
    this.status.metrics.totalRequests += Math.floor(currentRps);
    this.status.metrics.lastRequestTime = now;
    
    // Calculate uptime
    if (this.status.connectionTime) {
      this.status.metrics.uptime = now - this.status.connectionTime;
    }

    // Simulate occasional errors
    if (Math.random() < 0.02) { // 2% error rate
      this.status.metrics.totalErrors++;
      this.addLog('error', 'Request failed: Internal server error');
    }

    this.status.metrics.errorRate = 
      this.status.metrics.totalRequests > 0 
        ? this.status.metrics.totalErrors / this.status.metrics.totalRequests 
        : 0;

    this.notifyStatusUpdate();
  }

  private startActivitySimulation(): void {
    // Simulate random log activity
    const logInterval = setInterval(() => {
      if (this.status.status === 'connected' && Math.random() < 0.3) {
        const activities = [
          { level: 'info' as const, message: 'Processing chat completion request' },
          { level: 'debug' as const, message: 'Loading context from vector database' },
          { level: 'info' as const, message: 'Retrieved 15 relevant documents' },
          { level: 'debug' as const, message: 'Applying RAG processing pipeline' },
          { level: 'info' as const, message: 'Response generated successfully' },
        ];
        
        const activity = activities[Math.floor(Math.random() * activities.length)];
        this.addLog(activity.level, activity.message);
      }
    }, 2000 + Math.random() * 3000); // Every 2-5 seconds

    this.simulationIntervals.push(logInterval);

    // Simulate connection pool changes
    const poolInterval = setInterval(() => {
      if (this.status.status === 'connected') {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        this.status.connectionPool.active = Math.max(0, 
          Math.min(10, this.status.connectionPool.active + change));
        
        const idleChange = Math.floor(Math.random() * 2) - Math.floor(Math.random() * 2);
        this.status.connectionPool.idle = Math.max(0, 
          Math.min(5, this.status.connectionPool.idle + idleChange));
        
        this.status.connectionPool.total = 
          this.status.connectionPool.active + this.status.connectionPool.idle;
        
        this.notifyStatusUpdate();
      }
    }, 5000); // Every 5 seconds

    this.simulationIntervals.push(poolInterval);
  }

  private addLog(level: MCPServerLog['level'], message: string, details?: any): void {
    const log: MCPServerLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      details
    };

    this.status.logs.unshift(log);
    
    // Keep only last 100 logs
    if (this.status.logs.length > 100) {
      this.status.logs = this.status.logs.slice(0, 100);
    }

    this.notifyStatusUpdate();
  }

  private updateStatus(status: MCPServerStatus['status']): void {
    this.status.status = status;
    this.notifyStatusUpdate();
  }

  private notifyStatusUpdate(): void {
    if (this.onStatusUpdate) {
      this.onStatusUpdate({ ...this.status });
    }
  }

  private stopAllIntervals(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }

    this.simulationIntervals.forEach(interval => clearInterval(interval));
    this.simulationIntervals = [];
  }

  getStatus(): MCPServerStatus {
    return { ...this.status };
  }

  // Export server configuration
  exportConfig(): string {
    return JSON.stringify({
      ...this.serverConfig,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  // Test connection without fully connecting
  async testConnection(): Promise<boolean> {
    this.addLog('info', 'Testing connection...');
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const success = Math.random() > 0.2; // 80% success rate for tests
    
    if (success) {
      this.addLog('info', 'Connection test successful');
    } else {
      this.addLog('error', 'Connection test failed: Unable to reach endpoint');
    }
    
    return success;
  }
}

export class MCPConnectionPoolManager {
  private simulators: Map<string, MCPServerSimulator> = new Map();
  private onGlobalStatusUpdate?: (statuses: MCPServerStatus[]) => void;

  constructor(onGlobalStatusUpdate?: (statuses: MCPServerStatus[]) => void) {
    this.onGlobalStatusUpdate = onGlobalStatusUpdate;
  }

  addServer(serverId: string, config: any): MCPServerSimulator {
    const simulator = new MCPServerSimulator(serverId, config, (status) => {
      this.notifyGlobalUpdate();
    });
    
    this.simulators.set(serverId, simulator);
    return simulator;
  }

  removeServer(serverId: string): void {
    const simulator = this.simulators.get(serverId);
    if (simulator) {
      simulator.disconnect();
      this.simulators.delete(serverId);
      this.notifyGlobalUpdate();
    }
  }

  getServer(serverId: string): MCPServerSimulator | undefined {
    return this.simulators.get(serverId);
  }

  getAllStatuses(): MCPServerStatus[] {
    return Array.from(this.simulators.values()).map(sim => sim.getStatus());
  }

  async connectAll(): Promise<void> {
    const promises = Array.from(this.simulators.values()).map(sim => sim.connect());
    await Promise.allSettled(promises);
  }

  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.simulators.values()).map(sim => sim.disconnect());
    await Promise.allSettled(promises);
  }

  private notifyGlobalUpdate(): void {
    if (this.onGlobalStatusUpdate) {
      this.onGlobalStatusUpdate(this.getAllStatuses());
    }
  }

  // Import multiple server configurations
  importConfigurations(jsonData: string): { success: number; errors: string[] } {
    try {
      const configs = JSON.parse(jsonData);
      const errors: string[] = [];
      let success = 0;

      if (Array.isArray(configs)) {
        configs.forEach((config, index) => {
          try {
            if (config.id && config.name && config.endpoint) {
              this.addServer(config.id, config);
              success++;
            } else {
              errors.push(`Configuration ${index + 1}: Missing required fields`);
            }
          } catch (error) {
            errors.push(`Configuration ${index + 1}: ${error}`);
          }
        });
      } else if (configs.id) {
        this.addServer(configs.id, configs);
        success = 1;
      } else {
        errors.push('Invalid configuration format');
      }

      return { success, errors };
    } catch (error) {
      return { success: 0, errors: [`Invalid JSON: ${error}`] };
    }
  }

  // Export all configurations
  exportAllConfigurations(): string {
    const configs = Array.from(this.simulators.entries()).map(([id, sim]) => 
      JSON.parse(sim.exportConfig())
    );
    
    return JSON.stringify({
      configurations: configs,
      exportedAt: new Date().toISOString(),
      totalServers: configs.length,
      version: '1.0'
    }, null, 2);
  }
}
