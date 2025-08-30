import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/DateRangePicker';
import { useAppStore } from '@/stores/useAppStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp,
  MessageSquare,
  Clock,
  Zap,
  Users,
  Database,
  Download,
  Calendar,
  Activity,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';
import { addDays, subDays, format } from 'date-fns';

// Sample data generators
const generateChatUsageData = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'MMM dd'),
      fullDate: format(date, 'yyyy-MM-dd'),
      messages: Math.floor(Math.random() * 50) + 10,
      responses: Math.floor(Math.random() * 45) + 8,
    });
  }
  return data;
};

const generateResponseTimeData = () => {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    data.push({
      hour: `${23 - i}:00`,
      avgResponseTime: Math.floor(Math.random() * 2000) + 500,
      p95ResponseTime: Math.floor(Math.random() * 1000) + 1500,
    });
  }
  return data;
};

const generateDataSourceUsage = () => [
  { name: 'Google Drive', value: 35, color: '#3b82f6' },
  { name: 'Slack', value: 25, color: '#10b981' },
  { name: 'GitHub', value: 20, color: '#f59e0b' },
  { name: 'File Uploads', value: 15, color: '#ef4444' },
  { name: 'PostgreSQL', value: 5, color: '#8b5cf6' },
];

const generateTokenUsageData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'MMM dd'),
      promptTokens: Math.floor(Math.random() * 50000) + 20000,
      completionTokens: Math.floor(Math.random() * 30000) + 15000,
      totalTokens: 0,
    });
  }
  return data.map(item => ({
    ...item,
    totalTokens: item.promptTokens + item.completionTokens,
  }));
};

const generateHeatmapData = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = [];
  
  days.forEach((day, dayIndex) => {
    hours.forEach(hour => {
      data.push({
        day,
        hour,
        dayIndex,
        activity: Math.floor(Math.random() * 100),
      });
    });
  });
  
  return data;
};

const popularTopics = [
  { text: 'machine learning', value: 120 },
  { text: 'data science', value: 100 },
  { text: 'neural networks', value: 80 },
  { text: 'python', value: 75 },
  { text: 'artificial intelligence', value: 70 },
  { text: 'deep learning', value: 65 },
  { text: 'analytics', value: 60 },
  { text: 'statistics', value: 55 },
  { text: 'algorithms', value: 50 },
  { text: 'visualization', value: 45 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  const { chatMessages, dataSources, mcpServers } = useAppStore();

  const chatUsageData = useMemo(() => generateChatUsageData(), [timeRange]);
  const responseTimeData = useMemo(() => generateResponseTimeData(), []);
  const dataSourceUsage = useMemo(() => generateDataSourceUsage(), []);
  const tokenUsageData = useMemo(() => generateTokenUsageData(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  // Calculate key metrics
  const totalMessages = chatUsageData.reduce((sum, day) => sum + day.messages, 0);
  const avgResponseTime = responseTimeData.reduce((sum, hour) => sum + hour.avgResponseTime, 0) / responseTimeData.length;
  const totalTokens = tokenUsageData.reduce((sum, day) => sum + day.totalTokens, 0);
  const activeDataSources = dataSources.filter(ds => ds.status === 'connected').length;

  const exportToCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActivityColor = (activity: number) => {
    if (activity > 80) return 'bg-primary';
    if (activity > 60) return 'bg-primary/80';
    if (activity > 40) return 'bg-primary/60';
    if (activity > 20) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into system usage and performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => exportToCSV(chatUsageData, 'analytics-report')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-3xl font-bold">{totalMessages.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from last week
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold">{Math.round(avgResponseTime)}ms</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  -8% faster
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-3xl font-bold">{(totalTokens / 1000).toFixed(1)}K</p>
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {activeDataSources} active sources
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">247</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  +5% this week
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity Heatmap</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages Per Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chatUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#3b82f6" name="User Messages" />
                    <Bar dataKey="responses" fill="#10b981" name="AI Responses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Data Source Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Source Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataSourceUsage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {dataSourceUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Token Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Token Usage Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={tokenUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [value.toLocaleString(), '']} />
                  <Area 
                    type="monotone" 
                    dataKey="promptTokens" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    name="Prompt Tokens" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completionTokens" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    name="Completion Tokens" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Response Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value}ms`, '']} />
                    <Line 
                      type="monotone" 
                      dataKey="avgResponseTime" 
                      stroke="#3b82f6" 
                      name="Average Response Time"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="p95ResponseTime" 
                      stroke="#f59e0b" 
                      name="95th Percentile"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Popular Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularTopics.slice(0, 8).map((topic, index) => (
                    <div key={topic.text} className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 text-center">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{topic.text}</span>
                          <span className="text-xs text-muted-foreground">{topic.value}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${(topic.value / popularTopics[0].value) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Activity Heatmap
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Activity intensity by day of week and hour
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-primary/20 rounded-sm" />
                    <div className="w-3 h-3 bg-primary/40 rounded-sm" />
                    <div className="w-3 h-3 bg-primary/60 rounded-sm" />
                    <div className="w-3 h-3 bg-primary/80 rounded-sm" />
                    <div className="w-3 h-3 bg-primary rounded-sm" />
                  </div>
                  <span className="text-sm text-muted-foreground">More</span>
                </div>
                
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-24 gap-1 min-w-[800px]">
                    {/* Hour labels */}
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="text-xs text-muted-foreground text-center pb-1">
                        {i}
                      </div>
                    ))}
                    
                    {/* Heatmap grid */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                      <div key={day} className="contents">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const dataPoint = heatmapData.find(d => d.dayIndex === dayIndex && d.hour === hour);
                          return (
                            <div
                              key={`${day}-${hour}`}
                              className={cn(
                                "w-4 h-4 rounded-sm cursor-pointer transition-all hover:scale-110",
                                getActivityColor(dataPoint?.activity || 0)
                              )}
                              title={`${day} ${hour}:00 - ${dataPoint?.activity || 0}% activity`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full w-[45%] transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground">Average: 38%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <HardDrive className="h-4 w-4" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-warning h-3 rounded-full w-[68%] transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground">8.1 GB / 12 GB</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wifi className="h-4 w-4" />
                  Network I/O
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Inbound</span>
                    <span className="font-medium">125 MB/s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Outbound</span>
                    <span className="font-medium">89 MB/s</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Peak: 250 MB/s</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Vector Database</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Embedding Service</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm">MCP Servers</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {mcpServers.filter(s => s.status === 'connected').length}/{mcpServers.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Data Sources</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activeDataSources}/{dataSources.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Documents</span>
                      <span>1.2 GB</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-[30%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Embeddings</span>
                      <span>850 MB</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-[22%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cache</span>
                      <span>340 MB</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full w-[8%]" />
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Used</span>
                      <span>2.4 GB / 10 GB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}