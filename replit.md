# Frameworks - AI-Powered Product Management Analysis Tool

## Overview

This is a full-stack web application that provides AI-powered critical analysis for Product Managers using established PM frameworks. The application allows users to upload documents or input text and receive structured analysis based on selected Product Management frameworks such as Business Model Canvas, Lean Canvas, SWOT Analysis, and others.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the client-side application
- **Vite** as the build tool and development server
- **Tailwind CSS** for styling with a custom design system
- **shadcn/ui** component library for consistent UI components
- **React Query (TanStack Query)** for server state management and API calls
- **Wouter** for client-side routing (lightweight React router alternative)

### Backend Architecture
- **Express.js** server with TypeScript
- **Node.js** runtime environment
- RESTful API design with structured endpoints
- In-memory storage implementation (MemStorage class) for development
- Middleware for request logging and error handling

### Data Storage Solutions
- **PostgreSQL** database configured with Drizzle ORM
- **Neon Database** as the serverless PostgreSQL provider
- **Drizzle Kit** for database migrations and schema management
- In-memory fallback storage for development/testing

## Key Components

### Database Schema (`shared/schema.ts`)
- **analyses** table storing:
  - Framework selection
  - Input text/document content
  - Generated analysis results (JSON)
  - Creation timestamps

### API Endpoints (`server/routes.ts`)
- `POST /api/analyze` - Main analysis endpoint that processes documents using Mistral AI
- File upload support with multer middleware
- Structured error handling with Zod validation

### UI Components
- **FrameworkAnalyzer** - Enhanced form with:
  - Smart framework suggestions based on content
  - Character count validation (100-8000 characters)
  - Framework favorites system with localStorage
  - Visual loading states with progress indicators
- **AnalysisResults** - Professional display with:
  - Structured PDF export with colored sections
  - Document name extraction for PDFs
  - Copy/export functionality (MD, PDF)
  - Date stamps and analysis metadata
- Comprehensive shadcn/ui component library for consistent design

### Framework Types (`client/src/types/analysis.ts`)
Supports multiple PM frameworks categorized as:
- Strategy & Business (Business Model Canvas, Lean Canvas, DHM, Market Sizing, SWOT)
- Discovery & Experimentation (CSD Matrix, Continuous Discovery, Opportunity Solution Tree)
- Assessment & Opportunity (Opportunity Assessment)
- Process & Prioritization (User Story Mapping, Press Release+FAQ, RICE Score, RAPID)
- Metrics (North Star Metric, Metrics Tree, KPIs)

## Data Flow

1. **User Input**: User selects a framework and provides document text/upload
2. **Validation**: Frontend validates input using Zod schemas
3. **API Request**: React Query sends POST request to `/api/analyze`
4. **AI Processing**: Server calls Mistral AI API with framework-specific prompts
5. **Analysis**: AI returns structured analysis (summary, strengths, gaps, recommendations)
6. **Storage**: Analysis saved to database with metadata
7. **Display**: Results rendered in structured UI with copy/export options

## External Dependencies

### AI Integration
- **Mistral AI API** for document analysis and framework application
- Hardcoded API key for development (should be environment variable in production)
- Portuguese language system prompts for Brazilian PM market

### UI Libraries
- **Radix UI** primitives for accessible component foundation
- **Lucide React** for consistent iconography
- **Class Variance Authority** for component variant management
- **React Hook Form** with Zod resolvers for form validation

### Development Tools
- **Replit** integration with cartographer plugin and runtime error overlay
- **ESBuild** for production bundling
- **PostCSS** with Autoprefixer for CSS processing

## Deployment Strategy

### Development
- Vite dev server with HMR (Hot Module Replacement)
- Express server with TypeScript compilation via `tsx`
- Replit-specific optimizations and banner integration

### Production Build
- Frontend: Vite build to `dist/public`
- Backend: ESBuild compilation to `dist/index.js`
- Single Node.js process serving both static files and API

### Database Management
- Drizzle migrations in `./migrations` directory
- Environment-based connection via `DATABASE_URL`
- `db:push` script for schema synchronization

### Configuration
- TypeScript path mapping for clean imports (`@/`, `@shared/`)
- Tailwind CSS variables for consistent theming
- Component aliases configured in `components.json`

The application follows a monorepo structure with clear separation between client, server, and shared code, making it maintainable and scalable for adding new frameworks and analysis capabilities.