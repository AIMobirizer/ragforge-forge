# RagForge AI - Architecture Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Design](#database-design)
6. [API Architecture](#api-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [Authentication & Security](#authentication--security)
9. [Data Flow Diagrams](#data-flow-diagrams)
10. [Component Architecture](#component-architecture)
11. [Feature Specifications](#feature-specifications)
12. [Deployment Architecture](#deployment-architecture)
13. [Performance & Scalability](#performance--scalability)
14. [Security Considerations](#security-considerations)

---

## System Overview

RagForge AI is a modern, intelligent RAG (Retrieval-Augmented Generation) assistant that combines AI chatbot capabilities with MCP (Model Context Protocol) server integration. The system provides users with advanced document processing, semantic search, knowledge graph visualization, and intelligent conversation capabilities.

### Key Objectives
- **Intelligent Document Processing**: Advanced chunking and vectorization of documents
- **Semantic Search**: Context-aware search across user documents and knowledge bases
- **Knowledge Graph Visualization**: Interactive representation of document relationships
- **MCP Server Integration**: Seamless integration with Model Context Protocol servers
- **Real-time Analytics**: Comprehensive analytics dashboard for usage insights
- **Multi-modal AI**: Support for text, document, and conversational AI interactions

---

## Architecture Patterns

<lov-mermaid>
graph TB
    subgraph "Architectural Patterns"
        A[Clean Architecture] --> B[Separation of Concerns]
        C[Component-Based Design] --> D[Reusable UI Components]
        E[State Management Pattern] --> F[Zustand Stores]
        G[Repository Pattern] --> H[Supabase Integration]
        I[Observer Pattern] --> J[Real-time Updates]
        K[Factory Pattern] --> L[Component Factories]
    end
</lov-mermaid>

The system follows several key architectural patterns:

- **Clean Architecture**: Clear separation between business logic, data access, and presentation layers
- **Component-Based Design**: Modular, reusable React components with shadcn/ui
- **Repository Pattern**: Abstracted data access through Supabase client
- **Observer Pattern**: Real-time updates using Supabase subscriptions
- **State Management**: Centralized state using Zustand with TypeScript

---

## Technology Stack

<lov-mermaid>
graph LR
    subgraph "Frontend Stack"
        A[React 18] --> B[TypeScript]
        B --> C[Vite]
        C --> D[Tailwind CSS]
        D --> E[shadcn/ui]
    end
    
    subgraph "Backend Stack"
        F[Supabase] --> G[PostgreSQL]
        G --> H[Row Level Security]
        H --> I[Edge Functions]
        I --> J[Real-time]
    end
    
    subgraph "AI & Processing"
        K[OpenAI API] --> L[Vector Embeddings]
        M[MCP Protocol] --> N[Ollama Integration]
    end
    
    subgraph "Development Tools"
        O[Vitest] --> P[React Testing Library]
        Q[ESLint] --> R[Prettier]
    end
    
    A --> F
    K --> F
    O --> A
</lov-mermaid>

### Core Technologies

#### Frontend Layer
- **React 18**: Component-based UI framework with hooks and concurrent features
- **TypeScript**: Static typing for enhanced developer experience and code reliability
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **shadcn/ui**: High-quality, accessible component library

#### Backend Layer
- **Supabase**: Backend-as-a-Service providing database, authentication, and real-time features
- **PostgreSQL**: Advanced relational database with JSON support
- **Edge Functions**: Serverless functions for AI processing and business logic
- **Row Level Security**: Database-level security policies

#### AI & Integration
- **OpenAI API**: Advanced language models for chat and embeddings
- **Vector Embeddings**: Semantic search capabilities
- **MCP Protocol**: Model Context Protocol for AI server integration
- **Ollama**: Local AI model integration

---

## System Architecture

<lov-mermaid>
graph TB
    subgraph "Client Layer"
        UI[React Frontend]
        PWA[Progressive Web App]
    end
    
    subgraph "API Gateway"
        API[Supabase API Gateway]
        Auth[Authentication Service]
        RT[Real-time Engine]
    end
    
    subgraph "Business Logic"
        EF[Edge Functions]
        AI[AI Processing Service]
        MCP[MCP Server Integration]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        Storage[File Storage]
        Cache[Redis Cache]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        Ollama[Ollama Server]
        Vector[Vector Database]
    end
    
    UI --> API
    PWA --> API
    API --> Auth
    API --> RT
    API --> EF
    EF --> AI
    AI --> MCP
    EF --> DB
    EF --> Storage
    AI --> OpenAI
    MCP --> Ollama
    AI --> Vector
    
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef external fill:#fff3e0
    
    class UI,PWA frontend
    class API,Auth,RT,EF,AI,MCP backend
    class DB,Storage,Cache data
    class OpenAI,Ollama,Vector external
</lov-mermaid>

### Architecture Layers

#### 1. Presentation Layer (Frontend)
- **React Components**: Modular UI components with TypeScript
- **State Management**: Zustand stores for application state
- **Routing**: React Router for client-side navigation
- **Real-time UI**: Live updates via Supabase subscriptions

#### 2. API Layer (Supabase Gateway)
- **REST API**: Automatic API generation from database schema
- **GraphQL**: Optional GraphQL interface
- **Authentication**: JWT-based auth with multiple providers
- **Real-time**: WebSocket connections for live data

#### 3. Business Logic Layer (Edge Functions)
- **AI Processing**: Document analysis and response generation
- **MCP Integration**: Model Context Protocol server communication
- **Data Processing**: Document chunking and vectorization
- **Workflow Orchestration**: Complex business process management

#### 4. Data Layer (PostgreSQL + Storage)
- **Relational Data**: User profiles, notebooks, messages, sources
- **File Storage**: Document uploads and processed content
- **Vector Storage**: Embeddings for semantic search
- **Caching**: Performance optimization through intelligent caching

---

## Database Design

<lov-mermaid>
erDiagram
    PROFILES {
        uuid id PK
        uuid user_id UK "References auth.users"
        text display_name
        text avatar_url
        timestamp created_at
        timestamp updated_at
    }
    
    NOTEBOOKS {
        uuid id PK
        uuid user_id FK "References profiles.user_id"
        text title
        timestamp created_at
        timestamp updated_at
    }
    
    MESSAGES {
        uuid id PK
        uuid notebook_id FK "References notebooks.id"
        text type "user|assistant|system"
        text content
        text category
        text[] sources
        numeric confidence
        text[] tags
        timestamp created_at
    }
    
    SOURCES {
        uuid id PK
        uuid notebook_id FK "References notebooks.id"
        text title
        text type "document|url|text"
        text url
        text content
        integer pages
        timestamp created_at
    }
    
    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        jsonb session_data
        timestamp expires_at
        timestamp created_at
    }
    
    ANALYTICS_EVENTS {
        uuid id PK
        uuid user_id FK
        text event_type
        jsonb event_data
        timestamp created_at
    }
    
    PROFILES ||--|| NOTEBOOKS : "owns"
    NOTEBOOKS ||--o{ MESSAGES : "contains"
    NOTEBOOKS ||--o{ SOURCES : "references"
    PROFILES ||--o{ USER_SESSIONS : "has"
    PROFILES ||--o{ ANALYTICS_EVENTS : "generates"
</lov-mermaid>

### Database Schema Details

#### Core Tables

**profiles**
- User profile information and preferences
- Links to Supabase auth.users table
- Stores display name, avatar, and user settings

**notebooks** 
- Organizational containers for user content
- Each user can have multiple notebooks
- Support for different content types and themes

**messages**
- Chat conversation history
- Supports different message types (user, assistant, system)
- Includes confidence scores and source attribution
- Tagging system for organization

**sources**
- Document and content references
- Support for multiple source types (documents, URLs, text)
- Metadata storage for processed content

#### Security Features

**Row Level Security (RLS)**
- All tables protected with user-specific RLS policies
- Ensures users can only access their own data
- Policy-based access control for different operations

**Triggers and Functions**
- Automatic timestamp updates
- User profile creation on signup
- Data validation and consistency checks

---

## API Architecture

<lov-mermaid>
graph TB
    subgraph "API Endpoints"
        REST[REST API]
        GQL[GraphQL API]
        RT[Real-time API]
        FUNC[Edge Functions]
    end
    
    subgraph "Authentication"
        JWT[JWT Tokens]
        RLS[Row Level Security]
        RBAC[Role-Based Access]
    end
    
    subgraph "Data Operations"
        CRUD[CRUD Operations]
        SUB[Subscriptions]
        BATCH[Batch Operations]
    end
    
    subgraph "AI Services"
        CHAT[Chat API]
        EMBED[Embeddings API]
        PROC[Processing API]
    end
    
    REST --> JWT
    GQL --> JWT
    RT --> JWT
    FUNC --> JWT
    
    JWT --> RLS
    RLS --> RBAC
    
    CRUD --> SUB
    SUB --> BATCH
    
    FUNC --> CHAT
    CHAT --> EMBED
    EMBED --> PROC
</lov-mermaid>

### API Specifications

#### REST Endpoints
```typescript
// Notebook Management
GET    /rest/v1/notebooks              // List user notebooks
POST   /rest/v1/notebooks              // Create notebook
GET    /rest/v1/notebooks/{id}         // Get specific notebook
PATCH  /rest/v1/notebooks/{id}         // Update notebook
DELETE /rest/v1/notebooks/{id}         // Delete notebook

// Message Operations
GET    /rest/v1/messages?notebook_id=eq.{id}  // Get messages
POST   /rest/v1/messages                      // Create message
PATCH  /rest/v1/messages/{id}                 // Update message
DELETE /rest/v1/messages/{id}                 // Delete message

// Source Management
GET    /rest/v1/sources?notebook_id=eq.{id}   // Get sources
POST   /rest/v1/sources                       // Create source
PATCH  /rest/v1/sources/{id}                  // Update source
DELETE /rest/v1/sources/{id}                  // Delete source
```

#### Edge Functions
```typescript
// AI Processing Functions
POST /functions/v1/chat-completion     // Generate AI responses
POST /functions/v1/document-process    // Process uploaded documents
POST /functions/v1/semantic-search     // Perform semantic search
POST /functions/v1/generate-embeddings // Create vector embeddings

// MCP Integration
POST /functions/v1/mcp-connect         // Connect to MCP server
POST /functions/v1/mcp-query          // Query MCP server
POST /functions/v1/mcp-tools          // List available tools
```

#### Real-time Subscriptions
```typescript
// Message Updates
supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'messages' },
    payload => handleMessageUpdate(payload)
  )

// Notebook Changes  
supabase
  .channel('notebooks')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'notebooks' },
    payload => handleNotebookUpdate(payload)
  )
```

---

## Frontend Architecture

<lov-mermaid>
graph TB
    subgraph "Application Shell"
        APP[App.tsx]
        LAYOUT[Layout.tsx]
        ROUTER[React Router]
    end
    
    subgraph "Page Components"
        HOME[Index.tsx]
        CHAT[ChatHistory.tsx]
        ANALYTICS[Analytics.tsx]
        SETTINGS[Settings.tsx]
        AUTH[Auth.tsx]
    end
    
    subgraph "Feature Components"
        DASHBOARD[RAGDashboard.tsx]
        SEARCH[SemanticSearch.tsx]
        GRAPH[KnowledgeGraph.tsx]
        PIPELINE[DocumentProcessingPipeline.tsx]
    end
    
    subgraph "UI Components"
        SIDEBAR[AppSidebar.tsx]
        HEADER[Header.tsx]
        PANEL[RightPanel.tsx]
        UI[shadcn/ui components]
    end
    
    subgraph "State Management"
        STORE[useAppStore.ts]
        AUTH_HOOK[useAuth.tsx]
        QUERIES[React Query]
    end
    
    subgraph "Services"
        SUPABASE[Supabase Client]
        API[API Services]
        UTILS[Utility Functions]
    end
    
    APP --> LAYOUT
    LAYOUT --> ROUTER
    ROUTER --> HOME
    ROUTER --> CHAT
    ROUTER --> ANALYTICS
    ROUTER --> SETTINGS
    ROUTER --> AUTH
    
    HOME --> DASHBOARD
    DASHBOARD --> SEARCH
    DASHBOARD --> GRAPH
    DASHBOARD --> PIPELINE
    
    LAYOUT --> SIDEBAR
    LAYOUT --> HEADER
    LAYOUT --> PANEL
    UI --> SIDEBAR
    UI --> HEADER
    UI --> PANEL
    
    DASHBOARD --> STORE
    SEARCH --> STORE
    AUTH --> AUTH_HOOK
    STORE --> QUERIES
    
    AUTH_HOOK --> SUPABASE
    QUERIES --> API
    API --> SUPABASE
    SUPABASE --> UTILS
</lov-mermaid>

### Component Hierarchy

#### 1. Application Shell
- **App.tsx**: Root component with providers and global configuration
- **Layout.tsx**: Main layout structure with sidebar and header
- **Router**: Client-side routing with protected routes

#### 2. Page Components
- **Index.tsx**: Main dashboard and entry point
- **ChatHistory.tsx**: Conversation management interface
- **Analytics.tsx**: Usage analytics and insights
- **Settings.tsx**: User preferences and configuration
- **Auth.tsx**: Authentication flows (login/signup)

#### 3. Feature Components
- **RAGDashboard**: Central hub for RAG operations
- **SemanticSearch**: Advanced search interface
- **KnowledgeGraph**: Interactive knowledge visualization
- **DocumentProcessingPipeline**: Document upload and processing

#### 4. State Management Strategy
```typescript
// Global Application Store
interface AppStore {
  // UI State
  isRightPanelOpen: boolean;
  currentNotebook: string | null;
  
  // User State
  user: User | null;
  profile: Profile | null;
  
  // Application State
  notebooks: Notebook[];
  messages: Message[];
  sources: Source[];
  
  // Actions
  setRightPanelOpen: (open: boolean) => void;
  setCurrentNotebook: (id: string) => void;
  updateProfile: (profile: Partial<Profile>) => void;
}
```

---

## Authentication & Security

<lov-mermaid>
sequenceDiagram
    participant Client
    participant Auth
    participant API
    participant DB
    participant Functions
    
    Client->>Auth: Login Request
    Auth->>Auth: Validate Credentials
    Auth->>Client: JWT Token + Refresh Token
    
    Client->>API: API Request + JWT
    API->>API: Validate JWT
    API->>DB: Query with RLS
    DB->>DB: Apply Row Level Security
    DB->>API: Filtered Results
    API->>Client: Response Data
    
    Client->>Functions: Edge Function Call
    Functions->>Auth: Verify JWT
    Auth->>Functions: User Context
    Functions->>DB: Secure Query
    DB->>Functions: Results
    Functions->>Client: Processed Response
</lov-mermaid>

### Security Architecture

#### 1. Authentication Flow
- **JWT Tokens**: Stateless authentication with automatic refresh
- **Multi-provider Support**: Email/password, OAuth providers
- **Session Management**: Secure session handling with automatic cleanup
- **Protected Routes**: Client-side route protection

#### 2. Authorization System
- **Row Level Security**: Database-level access control
- **Policy-based Access**: Fine-grained permissions
- **User Context**: Secure user identification in all operations
- **API Key Management**: Secure storage of external API keys

#### 3. Data Protection
- **Encryption**: Data encryption at rest and in transit
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **XSS Protection**: Content Security Policy and output encoding

---

## Data Flow Diagrams

### User Registration Flow
<lov-mermaid>
graph TB
    START[User Registration] --> FORM[Registration Form]
    FORM --> VALIDATE[Validate Input]
    VALIDATE --> AUTH[Supabase Auth]
    AUTH --> TRIGGER[Database Trigger]
    TRIGGER --> PROFILE[Create Profile]
    TRIGGER --> NOTEBOOK[Create Default Notebook]
    PROFILE --> EMAIL[Send Confirmation Email]
    EMAIL --> COMPLETE[Registration Complete]
    
    VALIDATE -->|Invalid| FORM
    AUTH -->|Error| FORM
</lov-mermaid>

### Document Processing Flow
<lov-mermaid>
graph TB
    UPLOAD[Document Upload] --> VALIDATE[File Validation]
    VALIDATE --> STORAGE[Store in Supabase Storage]
    STORAGE --> FUNCTION[Edge Function Processing]
    FUNCTION --> EXTRACT[Text Extraction]
    EXTRACT --> CHUNK[Content Chunking]
    CHUNK --> EMBED[Generate Embeddings]
    EMBED --> VECTOR[Store Vector Data]
    VECTOR --> METADATA[Update Source Metadata]
    METADATA --> COMPLETE[Processing Complete]
    
    VALIDATE -->|Invalid| ERROR[Error Response]
    FUNCTION -->|Failure| RETRY[Retry Logic]
    RETRY -->|Max Retries| ERROR
</lov-mermaid>

### Chat Interaction Flow
<lov-mermaid>
graph TB
    USER_INPUT[User Message] --> STORE_MSG[Store User Message]
    STORE_MSG --> CONTEXT[Retrieve Context]
    CONTEXT --> SEARCH[Semantic Search]
    SEARCH --> SOURCES[Gather Sources]
    SOURCES --> AI_CALL[OpenAI API Call]
    AI_CALL --> RESPONSE[AI Response]
    RESPONSE --> STORE_AI[Store AI Message]
    STORE_AI --> UPDATE_UI[Update UI]
    UPDATE_UI --> REALTIME[Real-time Broadcast]
    
    subgraph "Context Retrieval"
        CONTEXT --> RECENT[Recent Messages]
        CONTEXT --> RELEVANT[Relevant Documents]
        CONTEXT --> USER_PREF[User Preferences]
    end
</lov-mermaid>

---

## Component Architecture

### Core Component Structure
<lov-mermaid>
graph TB
    subgraph "Layout Components"
        L1[SidebarProvider]
        L2[AppSidebar]
        L3[Header]
        L4[RightPanel]
        L5[Layout]
    end
    
    subgraph "Feature Components"
        F1[RAGDashboard]
        F2[SemanticSearch]
        F3[KnowledgeGraph]
        F4[DocumentProcessingPipeline]
        F5[CitationViewer]
        F6[ChunkingPreview]
    end
    
    subgraph "UI Components"
        U1[Button]
        U2[Card]
        U3[Dialog]
        U4[Table]
        U5[Form]
        U6[Input]
    end
    
    subgraph "Utility Components"
        UT1[ProtectedRoute]
        UT2[DateRangePicker]
        UT3[VectorSearchVisualization]
    end
    
    L1 --> L2
    L1 --> L5
    L5 --> L3
    L5 --> L4
    
    F1 --> F2
    F1 --> F3
    F1 --> F4
    F2 --> F5
    F4 --> F6
    
    F1 --> U1
    F2 --> U2
    F3 --> U3
    F4 --> U4
    F5 --> U5
    F6 --> U6
    
    L5 --> UT1
    F1 --> UT2
    F2 --> UT3
</lov-mermaid>

### Component Specifications

#### RAGDashboard Component
```typescript
interface RAGDashboardProps {
  notebookId: string;
  initialView?: 'chat' | 'search' | 'graph';
}

interface RAGDashboardState {
  activeView: ViewType;
  searchQuery: string;
  selectedSources: string[];
  processingStatus: ProcessingStatus;
}
```

#### SemanticSearch Component
```typescript
interface SemanticSearchProps {
  notebookId: string;
  onResultSelect: (result: SearchResult) => void;
  filters?: SearchFilters;
}

interface SearchResult {
  id: string;
  content: string;
  score: number;
  source: SourceMetadata;
  highlights: TextHighlight[];
}
```

#### KnowledgeGraph Component
```typescript
interface KnowledgeGraphProps {
  data: GraphData;
  layout: 'force' | 'hierarchical' | 'circular';
  onNodeSelect: (node: GraphNode) => void;
  onEdgeSelect: (edge: GraphEdge) => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'concept' | 'entity';
  properties: Record<string, any>;
}
```

---

## Feature Specifications

### 1. Document Processing Pipeline

<lov-mermaid>
graph LR
    UPLOAD[File Upload] --> PARSE[Document Parsing]
    PARSE --> CLEAN[Text Cleaning]
    CLEAN --> CHUNK[Smart Chunking]
    CHUNK --> EMBED[Vectorization]
    EMBED --> INDEX[Index Creation]
    INDEX --> READY[Ready for Search]
    
    subgraph "Supported Formats"
        PDF[PDF Documents]
        DOC[Word Documents]
        TXT[Text Files]
        MD[Markdown Files]
        HTML[HTML Pages]
    end
    
    UPLOAD --> PDF
    UPLOAD --> DOC
    UPLOAD --> TXT
    UPLOAD --> MD
    UPLOAD --> HTML
</lov-mermaid>

**Features:**
- Multi-format document support (PDF, DOC, TXT, MD, HTML)
- Intelligent text extraction and cleaning
- Semantic chunking with overlap handling
- Vector embedding generation using OpenAI
- Metadata extraction and indexing
- Progress tracking and error handling

### 2. Semantic Search System

**Capabilities:**
- Vector similarity search across documents
- Hybrid search combining keyword and semantic matching
- Real-time search with auto-suggestions
- Filter-based search by source, date, type
- Relevance scoring and ranking
- Search result highlighting and context

**Search Types:**
- **Semantic Search**: Context-aware vector search
- **Keyword Search**: Traditional text matching  
- **Hybrid Search**: Combination of both approaches
- **Faceted Search**: Multi-dimensional filtering

### 3. Knowledge Graph Visualization

**Graph Features:**
- Interactive node and edge visualization
- Multiple layout algorithms (force-directed, hierarchical, circular)
- Real-time graph updates
- Node clustering and grouping
- Search and filter within graph
- Export capabilities (PNG, SVG, JSON)

**Node Types:**
- **Document Nodes**: Represent uploaded documents
- **Concept Nodes**: Key concepts extracted from text
- **Entity Nodes**: Named entities (people, places, organizations)
- **Topic Nodes**: Thematic clusters

### 4. MCP Server Integration

**MCP Features:**
- Dynamic server discovery and connection
- Tool registration and invocation
- Protocol versioning and compatibility
- Real-time server monitoring
- Error handling and recovery
- Performance metrics and logging

**Supported Operations:**
- Server registration and authentication
- Tool discovery and metadata retrieval
- Synchronous and asynchronous tool execution
- Result streaming and progress updates
- Session management and cleanup

### 5. Analytics Dashboard

<lov-mermaid>
graph TB
    subgraph "Analytics Features"
        USAGE[Usage Statistics]
        PERF[Performance Metrics]
        USER[User Behavior]
        SEARCH[Search Analytics]
        AI[AI Interaction Metrics]
    end
    
    subgraph "Visualization Types"
        CHART[Charts & Graphs]
        TABLE[Data Tables]
        HEATMAP[Heatmaps]
        TIMELINE[Timeline Views]
    end
    
    subgraph "Export Options"
        PDF_EXP[PDF Reports]
        CSV_EXP[CSV Data]
        JSON_EXP[JSON Format]
        IMG_EXP[Image Export]
    end
    
    USAGE --> CHART
    PERF --> TABLE
    USER --> HEATMAP
    SEARCH --> TIMELINE
    AI --> CHART
    
    CHART --> PDF_EXP
    TABLE --> CSV_EXP
    HEATMAP --> IMG_EXP
    TIMELINE --> JSON_EXP
</lov-mermaid>

**Analytics Metrics:**
- Document processing volume and speed
- Search query performance and relevance
- User engagement and session duration
- AI model usage and response quality
- System performance and resource utilization
- Error rates and system health

---

## Deployment Architecture

<lov-mermaid>
graph TB
    subgraph "Development Environment"
        DEV_LOCAL[Local Development]
        DEV_DOCKER[Docker Compose]
        DEV_SUPABASE[Local Supabase]
    end
    
    subgraph "Staging Environment"
        STAGE_BUILD[Build Pipeline]
        STAGE_TEST[Automated Testing]
        STAGE_DEPLOY[Staging Deployment]
    end
    
    subgraph "Production Environment"
        PROD_CDN[CDN Distribution]
        PROD_APP[Application Server]
        PROD_DB[Production Database]
        PROD_STORAGE[File Storage]
        PROD_FUNC[Edge Functions]
    end
    
    subgraph "Monitoring & Ops"
        MONITOR[Application Monitoring]
        LOGS[Centralized Logging]
        ALERTS[Alert System]
        BACKUP[Backup Strategy]
    end
    
    DEV_LOCAL --> STAGE_BUILD
    STAGE_BUILD --> STAGE_TEST
    STAGE_TEST --> STAGE_DEPLOY
    STAGE_DEPLOY --> PROD_CDN
    
    PROD_CDN --> PROD_APP
    PROD_APP --> PROD_DB
    PROD_APP --> PROD_STORAGE
    PROD_APP --> PROD_FUNC
    
    PROD_APP --> MONITOR
    PROD_DB --> LOGS
    PROD_FUNC --> ALERTS
    PROD_STORAGE --> BACKUP
</lov-mermaid>

### Deployment Strategy

#### 1. Development Environment
- Local Supabase instance with Docker
- Hot reloading for rapid development
- Local AI model testing with Ollama
- Development database with test data

#### 2. Staging Environment
- Automated CI/CD pipeline
- Comprehensive test suite execution
- Performance and load testing
- Security vulnerability scanning

#### 3. Production Environment
- Global CDN for static assets
- Auto-scaling application servers
- High-availability database cluster
- Distributed file storage
- Edge function deployment

#### 4. Monitoring & Operations
- Real-time application monitoring
- Centralized log aggregation
- Automated alerting system
- Regular backup and disaster recovery

---

## Performance & Scalability

### Performance Optimization

<lov-mermaid>
graph TB
    subgraph "Frontend Optimization"
        LAZY[Lazy Loading]
        CACHE[Client Caching]
        BUNDLE[Bundle Splitting]
        COMPRESS[Asset Compression]
    end
    
    subgraph "Backend Optimization"
        DB_INDEX[Database Indexing]
        QUERY_OPT[Query Optimization]
        CONNECTION[Connection Pooling]
        FUNC_CACHE[Function Caching]
    end
    
    subgraph "Infrastructure"
        CDN_DIST[CDN Distribution]
        LOAD_BAL[Load Balancing]
        AUTO_SCALE[Auto Scaling]
        EDGE_CACHE[Edge Caching]
    end
    
    LAZY --> CACHE
    CACHE --> BUNDLE
    BUNDLE --> COMPRESS
    
    DB_INDEX --> QUERY_OPT
    QUERY_OPT --> CONNECTION
    CONNECTION --> FUNC_CACHE
    
    CDN_DIST --> LOAD_BAL
    LOAD_BAL --> AUTO_SCALE
    AUTO_SCALE --> EDGE_CACHE
</lov-mermaid>

### Scalability Considerations

#### 1. Horizontal Scaling
- Stateless application design
- Database read replicas
- Microservice architecture for Edge Functions
- Distributed file storage

#### 2. Vertical Scaling
- Resource monitoring and auto-scaling
- Performance profiling and optimization
- Database query optimization
- Caching strategies at multiple layers

#### 3. Data Scaling
- Partitioning strategies for large datasets
- Vector database optimization
- Efficient embedding storage and retrieval
- Data archiving and lifecycle management

---

## Security Considerations

### Security Framework

<lov-mermaid>
graph TB
    subgraph "Authentication Security"
        MFA[Multi-Factor Auth]
        JWT_SEC[JWT Security]
        SESSION[Session Management]
        OAUTH[OAuth Integration]
    end
    
    subgraph "Authorization Security"
        RLS_POL[RLS Policies]
        RBAC_SYS[Role-Based Access]
        API_PERM[API Permissions]
        FUNC_AUTH[Function Auth]
    end
    
    subgraph "Data Security"
        ENCRYPT[Data Encryption]
        BACKUP_SEC[Secure Backups]
        PII_PROT[PII Protection]
        AUDIT[Audit Logging]
    end
    
    subgraph "Infrastructure Security"
        NETWORK[Network Security]
        FIREWALL[Firewall Rules]
        SSL_TLS[SSL/TLS]
        VULN_SCAN[Vulnerability Scanning]
    end
    
    MFA --> JWT_SEC
    JWT_SEC --> SESSION
    SESSION --> OAUTH
    
    RLS_POL --> RBAC_SYS
    RBAC_SYS --> API_PERM
    API_PERM --> FUNC_AUTH
    
    ENCRYPT --> BACKUP_SEC
    BACKUP_SEC --> PII_PROT
    PII_PROT --> AUDIT
    
    NETWORK --> FIREWALL
    FIREWALL --> SSL_TLS
    SSL_TLS --> VULN_SCAN
</lov-mermaid>

### Security Best Practices

#### 1. Authentication & Authorization
- Multi-factor authentication support
- JWT token security with proper expiration
- Comprehensive session management
- Row-level security policies
- Role-based access control

#### 2. Data Protection
- End-to-end encryption for sensitive data
- Secure API key management
- PII data handling compliance
- Comprehensive audit logging
- Regular security assessments

#### 3. Infrastructure Security
- Network security and firewall configuration
- SSL/TLS encryption for all communications
- Regular vulnerability scanning
- Security monitoring and alerting
- Incident response procedures

---

## Conclusion

The RagForge AI architecture represents a modern, scalable, and secure approach to building intelligent RAG applications. The system leverages cutting-edge technologies and follows industry best practices to deliver a robust platform for AI-powered document processing and knowledge management.

### Key Architectural Strengths

1. **Modular Design**: Clean separation of concerns enables independent scaling and maintenance
2. **Security First**: Comprehensive security measures at every layer
3. **Real-time Capabilities**: Live updates and collaborative features
4. **Scalable Infrastructure**: Designed to handle growth in users and data
5. **Developer Experience**: Type-safe, well-documented, and testable codebase

### Future Considerations

- **Multi-tenancy**: Support for organization-level isolation
- **Advanced AI Features**: Integration with larger language models
- **Mobile Applications**: Native mobile app development
- **Enterprise Features**: Advanced admin controls and compliance features
- **API Ecosystem**: Public API for third-party integrations

---

**Document Version**: 1.0  
**Last Updated**: August 30, 2025  
**Architecture Review Date**: August 30, 2025

---

*This architecture document serves as the definitive guide for understanding the RagForge AI system design and implementation. It should be updated as the system evolves and new features are added.*