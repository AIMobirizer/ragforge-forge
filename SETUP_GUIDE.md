# RagForge AI - Complete Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Local Supabase Setup](#local-supabase-setup)
5. [Frontend Application Setup](#frontend-application-setup)
6. [Database Configuration](#database-configuration)
7. [API & Edge Functions](#api--edge-functions)
8. [Testing Setup](#testing-setup)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

RagForge AI is a modern AI chatbot application with MCP (Model Context Protocol) server integration and RAG (Retrieval-Augmented Generation) capabilities. This guide provides complete setup instructions for local development with full database and API functionality.

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **UI Components**: shadcn/ui, Radix UI
- **Testing**: Vitest, React Testing Library
- **Additional**: Zustand (state management), React Router

---

## Prerequisites

### Required Software
Install the following tools before proceeding:

#### 1. Node.js & npm
```bash
# Install Node.js (v18 or higher recommended)
# Download from: https://nodejs.org/
# Verify installation
node --version  # Should be v18+
npm --version
```

#### 2. Git
```bash
# Install Git
# Download from: https://git-scm.com/
# Verify installation
git --version
```

#### 3. Docker Desktop
```bash
# Required for local Supabase
# Download from: https://www.docker.com/products/docker-desktop/
# Verify installation
docker --version
docker-compose --version
```

#### 4. Supabase CLI
```bash
# Install Supabase CLI globally
npm install -g @supabase/cli

# Verify installation
supabase --version
```

### Optional Tools
- **Code Editor**: VS Code with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

---

## Environment Setup

### 1. Create Project Directory
```bash
# Create and navigate to project directory
mkdir ragforge-setup
cd ragforge-setup
```

### 2. Clone Repository
```bash
# Clone the RagForge repository
git clone https://github.com/AIMobirizer/ragforge-forge.git
cd ragforge-forge
```

### 3. Verify Project Structure
Your project should contain:
```
ragforge-forge/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── integrations/
│   └── stores/
├── supabase/
│   ├── config.toml
│   └── migrations/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── index.html
```

---

## Local Supabase Setup

### 1. Initialize Supabase
```bash
# Login to Supabase (requires account)
supabase login

# Initialize Supabase in project directory
supabase init
```

### 2. Configure Supabase
Edit `supabase/config.toml` if needed:
```toml
[api]
enabled = true
port = 54321

[db]
port = 54322

[studio]
enabled = true
port = 54323

[auth]
enabled = true
```

### 3. Start Local Supabase Stack
```bash
# Start all Supabase services
supabase start
```

This command will:
- Download and start PostgreSQL database
- Start API gateway and authentication server
- Launch Supabase Studio (web interface)
- Initialize storage and edge functions runtime
- Display connection details

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJ0eXAiOiJKV1Q...
service_role key: eyJ0eXAiOiJKV1Q...
```

### 4. Verify Services
- **Database**: http://localhost:54323 (Supabase Studio)
- **API**: http://localhost:54321/health
- **Inbucket** (email testing): http://localhost:54324

---

## Frontend Application Setup

### 1. Install Dependencies
```bash
# Install all project dependencies
npm install
```

### 2. Configure Environment Variables
Create `.env` file in project root:
```env
# Local Supabase Configuration
VITE_SUPABASE_URL="http://localhost:54321"
VITE_SUPABASE_PUBLISHABLE_KEY="[anon_key_from_supabase_start]"
VITE_SUPABASE_PROJECT_ID="[project_id_from_supabase_start]"
```

**Important**: Replace `[anon_key_from_supabase_start]` with the actual key from `supabase start` output.

### 3. Start Development Server
```bash
# Start React development server
npm run dev
```

The application will be available at: `http://localhost:8080`

---

## Database Configuration

### 1. Apply Existing Migrations
```bash
# Reset database with existing migrations
supabase db reset
```

### 2. Verify Database Schema
Connect to database and verify tables:
```bash
# Connect to local database
supabase db connect

# In PostgreSQL prompt, list tables:
\dt

# Expected tables:
# - profiles
# - notebooks  
# - messages
# - sources
```

### 3. Sample Database Operations
```sql
-- Check if tables exist and have correct structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Verify RLS policies
SELECT tablename, policyname, cmd, permissive, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4. Database Backup and Restore
```bash
# Create database backup
supabase db dump > backup.sql

# Restore from backup
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres -f backup.sql
```

---

## API & Edge Functions

### 1. Configure Secrets
```bash
# Set up required secrets for edge functions
supabase secrets set OPENAI_API_KEY="your-openai-api-key-here"
supabase secrets set SUPABASE_URL="http://localhost:54321"
supabase secrets set SUPABASE_ANON_KEY="[your-anon-key]"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"
supabase secrets set SUPABASE_DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"
```

### 2. Deploy Edge Functions (if any)
```bash
# Deploy all edge functions
supabase functions deploy

# Deploy specific function
supabase functions deploy [function-name]

# View function logs
supabase functions logs [function-name]
```

### 3. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:54321/health

# Test authenticated endpoint (with bearer token)
curl -H "Authorization: Bearer [anon-key]" \
     -H "apikey: [anon-key]" \
     http://localhost:54321/rest/v1/profiles
```

---

## Testing Setup

### 1. Verify Test Configuration
The project includes pre-configured testing setup:
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 2. Test Database Connection
```bash
# Test Supabase client connection
npm run test -- --grep "supabase"
```

---

## Production Deployment

### 1. Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### 2. Deploy to Supabase Hosting
```bash
# Login and link to production project
supabase login
supabase link --project-ref [your-project-id]

# Push database changes to production
supabase db push

# Deploy edge functions to production
supabase functions deploy
```

### 3. Environment Variables for Production
Update production environment variables in Supabase dashboard:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Port Conflicts
If ports are already in use:
```bash
# Stop conflicting services
docker ps
docker stop [container-id]

# Or change ports in supabase/config.toml
```

#### 2. Database Connection Issues
```bash
# Reset Supabase
supabase stop
supabase start

# Clear Docker volumes
docker system prune -a --volumes
```

#### 3. Authentication Errors
```bash
# Check auth configuration
supabase status
supabase projects list

# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_PUBLISHABLE_KEY
```

#### 4. Missing Dependencies
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. Migration Errors
```bash
# Reset database and reapply migrations
supabase db reset --debug

# Check migration status
supabase migration list
```

### Debug Commands
```bash
# View Supabase logs
supabase logs

# Check service status
supabase status

# Inspect database
supabase db inspect

# View edge function logs
supabase functions logs
```

### Getting Help
- **Supabase Documentation**: https://supabase.com/docs
- **Project Repository**: https://github.com/AIMobirizer/ragforge-forge
- **Supabase Discord**: https://discord.supabase.com/
- **React Documentation**: https://react.dev/

---

## Appendix

### A. Useful Commands Reference
```bash
# Supabase Commands
supabase start          # Start local development
supabase stop           # Stop local services
supabase status         # Check service status
supabase db reset       # Reset database
supabase db push        # Push schema to remote
supabase db pull        # Pull schema from remote
supabase functions new  # Create new edge function

# NPM Commands
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm test              # Run tests
npm run lint          # Run linter

# Docker Commands
docker ps             # List running containers
docker logs [id]      # View container logs
docker stop [id]      # Stop container
```

### B. Project Structure Deep Dive
```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   ├── Layout.tsx    # Main layout component
│   └── ProtectedRoute.tsx
├── pages/            # Route components
│   ├── Index.tsx     # Home page
│   ├── Auth.tsx      # Authentication
│   └── Settings.tsx  # User settings
├── hooks/            # Custom React hooks
│   ├── useAuth.tsx   # Authentication hook
│   └── use-mobile.tsx
├── integrations/     # External service integrations
│   └── supabase/     # Supabase client and types
├── stores/           # State management (Zustand)
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

### C. Database Schema Overview
```sql
-- Core Tables
profiles     # User profile information
notebooks    # User notebooks for organizing content
messages     # Chat messages and responses
sources      # Document sources and references

-- Authentication
auth.users   # Supabase managed user accounts (built-in)

-- Storage
storage.buckets   # File storage buckets
storage.objects   # Stored files and metadata
```

---

**Document Version**: 1.0  
**Last Updated**: August 30, 2025  
**Compatible With**: RagForge AI v1.0+

---

*This document provides complete setup instructions for local development of the RagForge AI application. For additional support, please refer to the project repository or contact the development team.*