import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import {
  Settings as SettingsIcon,
  Database,
  Cpu,
  Palette,
  Save,
  RotateCcw
} from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useAppStore();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your configuration has been saved successfully."
    });
  };

  const handleReset = () => {
    updateSettings({
      chunkSize: 512,
      overlap: 50,
      embeddingModel: 'nomic-embed-text',
      vectorDatabase: 'chromadb',
      ollamaModel: 'llama3.2',
      temperature: 0.7,
      maxTokens: 2048,
      apiEndpoint: 'http://localhost:11434',
      theme: 'dark',
      fontSize: 14,
      language: 'en'
    });

    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values."
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your RAG pipeline and AI model preferences
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RAG Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              RAG Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Chunk Size: {settings.chunkSize} tokens</Label>
              <Slider
                value={[settings.chunkSize]}
                onValueChange={(value) => updateSettings({ chunkSize: value[0] })}
                min={128}
                max={2048}
                step={64}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Size of text chunks for document processing
              </p>
            </div>

            <div className="space-y-3">
              <Label>Overlap: {settings.overlap} tokens</Label>
              <Slider
                value={[settings.overlap]}
                onValueChange={(value) => updateSettings({ overlap: value[0] })}
                min={0}
                max={200}
                step={10}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Token overlap between adjacent chunks
              </p>
            </div>

            <div className="space-y-2">
              <Label>Embedding Model</Label>
              <Select
                value={settings.embeddingModel}
                onValueChange={(value) => updateSettings({ embeddingModel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nomic-embed-text">Nomic Embed Text</SelectItem>
                  <SelectItem value="all-minilm">All-MiniLM-L6-v2</SelectItem>
                  <SelectItem value="text-embedding-ada-002">OpenAI Ada-002</SelectItem>
                  <SelectItem value="sentence-transformers">Sentence Transformers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vector Database</Label>
              <Select
                value={settings.vectorDatabase}
                onValueChange={(value) => updateSettings({ vectorDatabase: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chromadb">ChromaDB</SelectItem>
                  <SelectItem value="pinecone">Pinecone</SelectItem>
                  <SelectItem value="qdrant">Qdrant</SelectItem>
                  <SelectItem value="weaviate">Weaviate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ollama Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Ollama Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={settings.ollamaModel}
                onValueChange={(value) => updateSettings({ ollamaModel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama3.2">Llama 3.2 (7B)</SelectItem>
                  <SelectItem value="llama3.2:13b">Llama 3.2 (13B)</SelectItem>
                  <SelectItem value="mistral">Mistral 7B</SelectItem>
                  <SelectItem value="codellama">Code Llama 7B</SelectItem>
                  <SelectItem value="phi3">Phi-3 Mini</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Temperature: {settings.temperature}</Label>
              <Slider
                value={[settings.temperature]}
                onValueChange={(value) => updateSettings({ temperature: Math.round(value[0] * 100) / 100 })}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Controls randomness in responses (0 = deterministic, 1 = creative)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                min={256}
                max={8192}
                step={256}
              />
              <p className="text-sm text-muted-foreground">
                Maximum tokens in model response
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input
                value={settings.apiEndpoint}
                onChange={(e) => updateSettings({ apiEndpoint: e.target.value })}
                placeholder="http://localhost:11434"
              />
              <p className="text-sm text-muted-foreground">
                Ollama server endpoint URL
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark theme interface
                </p>
              </div>
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                min={12}
                max={18}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSettings({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">RagForge v1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Build</p>
                <p className="font-medium">2024.01.15</p>
              </div>
              <div>
                <p className="text-muted-foreground">Environment</p>
                <p className="font-medium">Production</p>
              </div>
              <div>
                <p className="text-muted-foreground">Node.js</p>
                <p className="font-medium">v20.10.0</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>245 MB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-1/3" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span>2.1 GB / 10 GB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-1/5" />
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              Export Configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}