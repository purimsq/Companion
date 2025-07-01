# StudyCompanion - Replit.md

## Overview

StudyCompanion is a beautiful, offline-first desktop study application designed specifically for Mitchell, featuring AI-powered study assistance, document management, and personalized study planning. The application is built as a modern fullstack web application with plans for desktop deployment via Tauri.

The application focuses on providing a warm, welcoming interface with a sophisticated beige and cream color palette, designed to be mature yet approachable for non-technical users.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom beige/cream theme
- **UI Components**: Radix UI components via shadcn/ui
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Upload**: Multer for handling PDF/DOCX uploads
- **Development**: Hot reload with Vite middleware integration

### Desktop Packaging
- **Framework**: Tauri (configured but not built)
- **Target**: Cross-platform desktop application
- **Distribution**: Installer generation capabilities

## Key Components

### Core Features
1. **Document Management**: Upload and organize PDFs and DOCX files by study units
2. **Note Taking**: Markdown-style notes with `~` prefix support
3. **AI Summaries**: Generate summaries with user approval workflow
4. **Study Planning**: Daily study schedules with time tracking
5. **Assignment Tracking**: Manage assignments and CATs with deadline monitoring
6. **Progress Tracking**: Visual progress indicators and study streaks

### AI Integration
- **Local AI**: Designed for Ollama integration with phi model
- **AI Services**: Chat assistant, document summarization, study plan generation
- **Offline-First**: All AI processing intended to be local
- **OpenAI Fallback**: Current implementation uses OpenAI API (to be replaced with local AI)

### Database Schema
- **Users**: User profiles with learning pace settings (1-80 scale)
- **Units**: Study units (Anatomy, Immunology, etc.) with color coding
- **Documents**: File storage with extracted text for AI processing
- **Notes**: Markdown-style notes linked to documents and units
- **Summaries**: AI-generated summaries with approval workflow
- **Assignments**: Assignment and CAT tracking with deadlines
- **Study Plans**: Daily study schedule entries
- **Chat Messages**: AI conversation history

## Data Flow

### Document Processing Flow
1. User uploads PDF/DOCX via floating add button
2. File stored locally with metadata in database
3. Text extraction for AI processing and search
4. Assignment to study units with color coding
5. Note-taking capabilities with markdown support

### AI Interaction Flow
1. User requests AI assistance via chat interface
2. System processes request with context from documents/notes
3. AI generates response with optional suggestions
4. Approval workflow for summaries and important changes
5. Results stored and integrated into study materials

### Study Planning Flow
1. System analyzes user's pace setting (1-80 scale)
2. Considers assignment deadlines and content volume
3. Generates personalized daily study schedules
4. Tracks completion and adjusts future recommendations
5. Provides break reminders based on study duration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connectivity
- **drizzle-orm**: Type-safe database operations
- **multer**: File upload handling
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant styling

### AI Dependencies
- **openai**: AI API integration (temporary)
- **Local AI**: Ollama with phi model (planned)

## Deployment Strategy

### Development Environment
- Vite dev server with hot reload
- Express backend with middleware integration
- PostgreSQL database (can be local or hosted)
- Environment variables for configuration

### Production Build
- Vite builds optimized frontend bundle
- esbuild creates production backend bundle
- Static file serving for client assets
- Session management with connect-pg-simple

### Desktop Distribution
- Tauri configuration for cross-platform builds
- File system access for local document storage
- Native OS integration capabilities
- Offline-first operation with local database

### Database Strategy
- Uses Drizzle ORM with PostgreSQL
- Migration system via drizzle-kit
- Connection via DATABASE_URL environment variable
- Session storage in PostgreSQL

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```