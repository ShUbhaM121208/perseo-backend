# ⚙️ Perseo Backend Documentation

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Gmail Integration](#gmail-integration)
- [AI Services](#ai-services)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Supabase Integration](#supabase-integration)
- [Environment Configuration](#environment-configuration)
- [Development](#development)

---

## Overview

**Perseo Backend** is a Node.js/Express-based API server that powers AI-driven Gmail automation. It integrates Google's Generative AI with Composio's Gmail toolkit to provide natural language email management capabilities, supporting operations like sending emails, creating drafts, searching messages, and more.

### Key Highlights
- **AI-Powered**: Natural language processing with Google Gemini
- **Gmail Automation**: 20+ Gmail operations via Composio toolkit
- **Intelligent Parsing**: Robust JSON response handling
- **Production Ready**: Clean error handling and logging
- **TypeScript**: Full type safety and modern development

---

## Technology Stack

### Core Technologies
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express 4.18.2",
  "language": "TypeScript 5.3.3",
  "ai_service": "Google Generative AI",
  "gmail_integration": "Composio Core",
  "database": "Supabase PostgreSQL",
  "cors": "CORS 2.8.5",
  "environment": "dotenv 16.3.1",
  "testing": "Jest + Supertest"
}
```

### External Services
```json
{
  "ai_provider": "Google Gemini (gemini-2.0-flash-exp)",
  "email_toolkit": "Composio Gmail Integration",
  "authentication": "Composio OAuth + Supabase Auth",
  "api_management": "Composio API Key",
  "database": "Supabase (PostgreSQL + Auth + Real-time)",
  "storage": "Supabase Storage"
}
```

---

## Project Structure

```
src/
├── index.ts              # Express server entry point
├── routes/               # API route handlers
│   ├── chat.ts          # Main chat/AI endpoint  
│   └── onboarding.ts    # Onboarding API endpoints
├── services/            # Business logic services
│   ├── gemini.ts        # AI service integration
│   └── onboardingService.ts # Supabase onboarding service
├── middleware/          # Express middleware
│   └── supabaseAuth.ts  # Supabase JWT authentication
├── db/                  # Database configuration
│   └── supabaseClient.ts # Supabase client setup
├── __tests__/           # Test suite
│   ├── setup.ts         # Test configuration
│   └── onboarding.test.ts # Onboarding endpoint tests
├── types/               # TypeScript type definitions
└── utils/               # Utility functions

root/
├── dist/                # Compiled JavaScript output
├── db/                  # Database migrations
│   └── migrations/      # SQL migration files
├── coverage/            # Test coverage reports
├── .env                 # Environment variables
├── jest.config.js       # Jest test configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

---

## Architecture

### Request Flow
```
Client Request → Express Router → Chat Controller → AI Service → Composio Tools → Gmail API → Response Processing → Client Response
```

### Component Interaction
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Express API    │───▶│  Gemini AI      │
│   (React)       │    │   (chat.ts)      │    │  (gemini.ts)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Composio Client │───▶│   Gmail API     │
                       │  (Gmail Tools)   │    │  (20+ Tools)    │
                       └──────────────────┘    └─────────────────┘
```

---

## Gmail Integration

### Composio Integration (`routes/chat.ts`)

#### **Available Gmail Tools (20 Tools)**
```typescript
const gmailTools = [
  'GMAIL_SEND_EMAIL',           // Send emails
  'GMAIL_CREATE_EMAIL_DRAFT',   // Create draft emails
  'GMAIL_FETCH_EMAILS',         // Get specific emails
  'GMAIL_LIST_EMAILS',          // List email collections
  'GMAIL_SEARCH_EMAILS',        // Search email content
  'GMAIL_LIST_DRAFTS',          // List draft emails
  'GMAIL_GET_PROFILE',          // User profile info
  'GMAIL_GET_THREAD',           // Email thread details
  'GMAIL_LIST_THREADS',         // List email threads
  'GMAIL_SEARCH_THREADS',       // Search email threads
  'GMAIL_MODIFY_EMAIL',         // Modify email properties
  'GMAIL_DELETE_EMAIL',         // Delete emails
  'GMAIL_REPLY_TO_EMAIL',       // Reply to emails
  'GMAIL_FORWARD_EMAIL',        // Forward emails
  'GMAIL_ADD_LABEL_TO_EMAIL',   // Add labels
  'GMAIL_REMOVE_LABEL_FROM_EMAIL', // Remove labels
  'GMAIL_LIST_LABELS',          // List available labels
  'GMAIL_CREATE_LABEL',         // Create new labels
  'GMAIL_GET_EMAIL_BODY',       // Get full email content
  'GMAIL_MARK_EMAIL_AS_READ'    // Mark emails as read
];
```

#### **Tool Execution**
```typescript
const executeGmailAction = async (userId: string, toolName: string, parameters: any) => {
  try {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    console.log(`📧 Executing ${toolName} with parameters:`, parameters);
    
    const toolResponse = await composio.tools.execute({
      tool: {
        name: toolName,
        parameters: parameters,
      },
      entityId: userId,
    });

    return {
      success: true,
      data: toolResponse,
      toolUsed: toolName
    };
  } catch (error) {
    console.error(`❌ Error executing ${toolName}:`, error);
    throw new Error(`Gmail tool execution failed: ${error.message}`);
  }
};
```

#### **Smart Parameter Mapping**
```typescript
// Email sending parameters
const sendEmailParams = {
  recipient_email: "john@example.com",    // To address
  subject: "Meeting Update",              // Email subject
  body: "Let's schedule for tomorrow",    // Email content
  sender_email: "user@gmail.com"          // From address (optional)
};

// Draft creation parameters
const draftParams = {
  recipient_email: "team@company.com",
  subject: "Quarterly Report Draft",
  body: "Please review the attached report"
};

// Email search parameters
const searchParams = {
  query: "from:boss@company.com subject:urgent",
  max_results: 10
};
```

---

## AI Services

### Gemini Integration (`services/gemini.ts`)

#### **Model Configuration**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.1,        // Low temperature for consistent tool calls
    maxOutputTokens: 8192,   // Extended response length
    topP: 0.95,
    topK: 64,
  },
});
```

#### **System Prompt Engineering**
```typescript
const SYSTEM_PROMPT = `You are Perseo, an AI assistant specialized in Gmail automation...

Available Gmail tools:
- GMAIL_SEND_EMAIL: Send emails (requires recipient_email, subject, body)
- GMAIL_CREATE_EMAIL_DRAFT: Create drafts (requires recipient_email, subject, body)
- GMAIL_SEARCH_EMAILS: Search emails (requires query, optional max_results)
- GMAIL_FETCH_EMAILS: Get specific emails (requires message_ids array)
- GMAIL_LIST_EMAILS: List recent emails (optional max_results)

Example responses:
{
  "action": "GMAIL_SEND_EMAIL",
  "parameters": {
    "recipient_email": "john@example.com",
    "subject": "Meeting Update",
    "body": "Hi John, Let's reschedule our meeting for tomorrow at 2 PM. Best regards!"
  },
  "response": "I've sent an email to john@example.com about the meeting update."
}

Always respond with valid JSON in this format...`;
```

#### **Response Processing**
```typescript
const processAIResponse = (aiResponse: string) => {
  try {
    // Clean up newlines and escape characters
    let cleanedResponse = aiResponse
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');

    // Extract JSON from markdown code blocks if present
    const jsonMatch = cleanedResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[1];
    }

    const parsed = JSON.parse(cleanedResponse);
    
    return {
      action: parsed.action,
      parameters: parsed.parameters || {},
      response: parsed.response || "Action completed successfully"
    };
  } catch (error) {
    console.error('JSON parsing error:', error);
    // Fallback to text response
    return {
      action: null,
      parameters: {},
      response: aiResponse
    };
  }
};
```

---

## API Endpoints

### **POST /chat** - Main AI Chat Endpoint

#### **Request Format**
```typescript
interface ChatRequest {
  userId: string;    // User identifier for Composio
  message: string;   // Natural language command
}

// Example requests
{
  "userId": "user-123",
  "message": "send an email to john@example.com about tomorrow's meeting"
}

{
  "userId": "user-123", 
  "message": "search for emails from my boss about the project"
}

{
  "userId": "user-123",
  "message": "create a draft email to the team about quarterly results"
}
```

#### **Response Format**
```typescript
interface ChatResponse {
  success: boolean;
  response: string;       // Human-readable response
  action?: string;        // Gmail tool used (if applicable)
  data?: any;            // Raw tool response data
  error?: string;        // Error message (if failed)
}

// Success response example
{
  "success": true,
  "response": "I've sent an email to john@example.com about tomorrow's meeting.",
  "action": "GMAIL_SEND_EMAIL",
  "data": {
    "message_id": "187a1b2c3d4e5f67",
    "thread_id": "187a1b2c3d4e5f67"
  }
}

// Search results response
{
  "success": true,
  "response": "I found 3 emails from your boss about the project:",
  "action": "GMAIL_SEARCH_EMAILS",
  "data": {
    "emails": [
      {
        "id": "187a1b2c3d4e5f67",
        "subject": "Project Update Required",
        "from": "boss@company.com",
        "snippet": "Please send me the latest project status...",
        "date": "2024-10-04T10:30:00Z"
      }
    ]
  }
}
```

#### **Error Handling**
```typescript
// Gmail tool errors
{
  "success": false,
  "error": "Gmail tool execution failed: Invalid recipient email address",
  "response": "I couldn't send the email due to an invalid recipient address."
}

// AI parsing errors
{
  "success": false,
  "error": "Failed to parse AI response",
  "response": "I had trouble understanding your request. Please try rephrasing it."
}

// Authentication errors
{
  "success": false,
  "error": "Gmail account not connected",
  "response": "Please connect your Gmail account first to use email features."
}
```

### **GET /health** - Health Check Endpoint
```typescript
// Response
{
  "status": "healthy",
  "timestamp": "2024-10-04T12:00:00Z",
  "services": {
    "gemini": "connected",
    "composio": "connected"
  }
}
```

---

## Authentication

### **Composio Authentication Flow**

#### **User Connection Setup**
```typescript
// 1. Initialize Composio client
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY
});

// 2. Create connection for user
const connection = await composio.connections.create({
  integrationId: 'gmail',
  entityId: userId,        // Unique user identifier
  config: {
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ]
  }
});

// 3. User completes OAuth flow
const authUrl = connection.redirectUrl;
// Redirect user to authUrl for Gmail permission
```

#### **Connection Verification**
```typescript
const verifyGmailConnection = async (userId: string) => {
  try {
    const connections = await composio.connections.list({
      entityId: userId,
      integrationId: 'gmail'
    });
    
    return connections.length > 0 && connections[0].status === 'active';
  } catch (error) {
    console.error('Connection verification failed:', error);
    return false;
  }
};
```

---

## Supabase Integration

### **Overview**
Perseo Backend integrates with Supabase for user data persistence, specifically for storing onboarding preferences and user-specific configurations. The integration includes secure authentication middleware and service layer abstractions.

### **Database Schema**
The onboarding system uses a dedicated table to store user preferences:

```sql
-- Database Migration: db/migrations/001_create_onboardings.sql
CREATE TABLE onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  profession TEXT NOT NULL,
  integrations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_onboardings_user_id ON onboardings(user_id);

-- Enable Row Level Security
ALTER TABLE onboardings ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can access their own onboarding data" ON onboardings
  FOR ALL USING (auth.uid() = user_id);
```

### **API Endpoints**

#### **POST /api/onboarding**
Saves user onboarding preferences.

```typescript
// Request
{
  "purpose": "Personal",
  "profession": "Software Engineer", 
  "integrations": ["Gmail", "Calendar", "Drive"]
}

// Response
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "purpose": "Personal",
    "profession": "Software Engineer",
    "integrations": ["Gmail", "Calendar", "Drive"],
    "created_at": "2025-10-04T10:00:00Z",
    "updated_at": "2025-10-04T10:00:00Z"
  }
}
```

#### **GET /api/onboarding**
Retrieves user onboarding preferences.

```typescript
// Response
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "purpose": "Personal", 
    "profession": "Software Engineer",
    "integrations": ["Gmail", "Calendar", "Drive"],
    "created_at": "2025-10-04T10:00:00Z",
    "updated_at": "2025-10-04T10:00:00Z"
  }
}
```

### **Security Implementation**

#### **Authentication Middleware**
```typescript
// src/middleware/supabaseAuth.ts
export const requireSupabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
};
```

#### **Service Layer**
```typescript
// src/services/onboardingService.ts
export const saveOnboarding = async (userId: string, data: OnboardingData) => {
  const { data: result, error } = await supabase
    .from('onboardings')
    .upsert({
      user_id: userId,
      purpose: data.purpose,
      profession: data.profession,
      integrations: data.integrations,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  return { success: !error, data: result, error: error?.message };
};
```

### **Setup Instructions**

#### **1. Database Migration**
Run the SQL migration in your Supabase SQL Editor:
```bash
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy content from db/migrations/001_create_onboardings.sql
# 3. Execute the migration script
# 4. Verify table creation in Table Editor
```

#### **2. Environment Variables**
```bash
# Add to .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### **3. Security Configuration**
```bash
# Supabase Dashboard → Settings → API
# 1. Copy Project URL → SUPABASE_URL
# 2. Copy service_role key → SUPABASE_SERVICE_ROLE_KEY
# 3. Never expose service_role key to frontend!
# 4. Frontend should use anon key only
```

### **Testing Locally**

#### **Get Access Token (Frontend)**
```typescript
// Frontend: Get user access token
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session?.access_token;
```

#### **Test API Endpoints**
```bash
# Test POST /api/onboarding
curl -X POST http://localhost:3002/api/onboarding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "purpose": "Personal",
    "profession": "Software Engineer",
    "integrations": ["Gmail", "Calendar"]
  }'

# Test GET /api/onboarding  
curl -X GET http://localhost:3002/api/onboarding \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **🚨 Security Warnings**

#### **Critical Security Notes:**
```bash
⚠️  NEVER expose SUPABASE_SERVICE_ROLE_KEY to frontend
⚠️  Service role key bypasses Row Level Security
⚠️  Only use service role key in backend/server environments
⚠️  Frontend should only use anon key + user auth tokens
⚠️  Always validate JWT tokens in API middleware
⚠️  Enable RLS on all tables with user data
```

#### **Production Checklist:**
- ✅ RLS enabled on onboardings table
- ✅ Service role key secured in backend only
- ✅ JWT token validation in middleware
- ✅ API endpoints protected with auth
- ✅ Error messages don't leak sensitive info
- ✅ CORS configured for allowed origins

### **Testing Suite**
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

The test suite includes:
- ✅ POST endpoint validation and error handling
- ✅ GET endpoint success and error scenarios  
- ✅ Authentication middleware testing
- ✅ Service layer validation
- ✅ Integration flow testing
- ✅ Edge case handling

---

## Environment Configuration

### **Required Environment Variables**
```bash
# .env file
# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Composio Integration
COMPOSIO_API_KEY=your_composio_api_key_here

# Supabase Integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3002
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Optional: Logging
LOG_LEVEL=info
```

### **API Key Setup Guide**

#### **1. Google Gemini API Key**
```bash
# Visit: https://aistudio.google.com/app/apikey
# 1. Create new project
# 2. Enable Generative AI API
# 3. Create API credentials
# 4. Copy API key to GOOGLE_GEMINI_API_KEY
```

#### **2. Composio API Key**
```bash
# Visit: https://app.composio.dev/api-keys
# 1. Sign up/login to Composio
# 2. Create new API key
# 3. Copy to COMPOSIO_API_KEY
# 4. Enable Gmail integration
```

#### **3. Supabase Configuration**
```bash
# Visit: https://supabase.com/dashboard
# 1. Create new project or select existing
# 2. Go to Settings → API
# 3. Copy Project URL → SUPABASE_URL
# 4. Copy service_role key → SUPABASE_SERVICE_ROLE_KEY
# 5. ⚠️ NEVER expose service_role key to frontend!
# 6. Run database migration in SQL Editor
```

---

## Development

### **Getting Started**
```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Testing
npm test

# Test with coverage
npm run test:coverage

# Test in watch mode
npm run test:watch
```

### **Project Scripts**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### **TypeScript Configuration (`tsconfig.json`)**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **Development Workflow**
```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Test endpoints
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","message":"send email to test@example.com"}'
```

---

## Error Handling & Logging

### **Error Categories**
```typescript
// 1. Gmail Tool Errors
class GmailToolError extends Error {
  constructor(toolName: string, originalError: string) {
    super(`Gmail ${toolName} failed: ${originalError}`);
    this.name = 'GmailToolError';
  }
}

// 2. AI Processing Errors  
class AIProcessingError extends Error {
  constructor(message: string) {
    super(`AI processing failed: ${message}`);
    this.name = 'AIProcessingError';
  }
}

// 3. Authentication Errors
class AuthenticationError extends Error {
  constructor(service: string) {
    super(`${service} authentication failed`);
    this.name = 'AuthenticationError';
  }
}
```

### **Logging Strategy**
```typescript
// Production logging (essential only)
console.log('📧 Executing Gmail tool:', toolName);
console.log('✅ Email sent successfully');
console.error('❌ Error:', error.message);

// Development logging (detailed)
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 AI Response:', aiResponse);
  console.log('📊 Tool Parameters:', parameters);
  console.log('📋 Raw Response:', toolResponse);
}
```

### **Error Response Format**
```typescript
const handleError = (error: Error, res: Response) => {
  const errorResponse = {
    success: false,
    error: error.message,
    response: generateUserFriendlyMessage(error),
    timestamp: new Date().toISOString()
  };

  // Log error for debugging
  console.error('❌ API Error:', error);

  // Return appropriate HTTP status
  if (error instanceof AuthenticationError) {
    return res.status(401).json(errorResponse);
  } else if (error instanceof GmailToolError) {
    return res.status(400).json(errorResponse);
  } else {
    return res.status(500).json(errorResponse);
  }
};
```

---

## Performance & Optimization

### **Response Time Optimization**
```typescript
// 1. Parallel processing where possible
const [aiResponse, userVerification] = await Promise.all([
  processWithGemini(message),
  verifyUserConnection(userId)
]);

// 2. Efficient JSON parsing
const parseAIResponse = (response: string) => {
  // Fast path for simple responses
  if (!response.includes('{')) {
    return { action: null, response };
  }
  
  // Complex parsing only when needed
  return complexJSONParse(response);
};

// 3. Connection pooling for external APIs
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  maxRetries: 3,
  timeout: 30000
});
```

### **Memory Management**
```typescript
// Clean up large responses
const sanitizeResponse = (data: any) => {
  if (Array.isArray(data) && data.length > 100) {
    return data.slice(0, 100); // Limit large arrays
  }
  return data;
};

// Streaming for large email content
const streamEmailContent = async (emailId: string) => {
  // Implementation for streaming large emails
};
```

---

## Testing & Debugging

### **Manual Testing Commands**
```bash
# Test email sending
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "send email to john@test.com about meeting tomorrow"
  }'

# Test email search
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user", 
    "message": "search for emails from boss about project"
  }'

# Test draft creation
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "create a draft email to team@company.com about quarterly report"
  }'
```

### **Debug Information**
```typescript
// Enable detailed logging
process.env.DEBUG = 'true';

// View available Gmail tools
GET /debug/gmail-tools

// Check user connections
GET /debug/connections/{userId}

// Test AI parsing
POST /debug/parse-ai-response
{
  "response": "AI response string to test parsing"
}
```

---

## Deployment

### **Production Deployment**
```bash
# 1. Build the application
npm run build

# 2. Set production environment variables
export NODE_ENV=production
export PORT=3002
export GOOGLE_GEMINI_API_KEY=your_key
export COMPOSIO_API_KEY=your_key

# 3. Start production server
npm start
```

### **Docker Deployment** (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
EXPOSE 3002

CMD ["npm", "start"]
```

### **Environment Validation**
```typescript
const validateEnvironment = () => {
  const required = [
    'GOOGLE_GEMINI_API_KEY',
    'COMPOSIO_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
```

---

This documentation provides a comprehensive guide to the Perseo Backend architecture, Gmail integration capabilities, AI services, and development workflows. The backend is designed to be robust, scalable, and maintainable while providing powerful Gmail automation through natural language processing.