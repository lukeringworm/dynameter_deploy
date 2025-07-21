# American Dynamism Tracker

## Overview

The American Dynamism Tracker is a full-stack web application that monitors and displays various metrics related to American economic and technological dynamism. The application features a dashboard that shows an overall AD Index score, category-specific metrics, news updates, and trend visualizations. It uses a modern tech stack with React for the frontend and Express.js for the backend, with PostgreSQL as the database and Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api` prefix
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **Development**: Hot reload with custom Vite integration

### Database Strategy
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless PostgreSQL driver
- **Schema Location**: Shared between client and server in `/shared` directory

## Key Components

### Data Models
1. **AD Index Data**: Core metrics including overall score, category breakdowns, and news items
2. **Categories**: Defense, Manufacturing, Energy, Workforce, Tech Policy, Supply Chain
3. **News Items**: Categorized news with impact scores and timestamps
4. **Trend Data**: Historical score data for chart visualization

### Frontend Components
1. **Dashboard**: Main landing page with overview metrics
2. **AD Index Card**: Displays main score with weekly change indicator
3. **Category Cards**: Individual metric cards with progress indicators
4. **News Cards**: News feed with categorized updates
5. **AD Chart**: Line chart for trend visualization

### Backend Services
1. **Storage Layer**: Abstracted storage interface with in-memory implementation
2. **API Routes**: RESTful endpoints for data retrieval
3. **Mock Data**: Sample AD Index data for development and testing

## Data Flow

1. **Client Request**: Frontend components use TanStack Query to fetch data
2. **API Layer**: Express.js handles `/api/score` endpoint requests
3. **Storage Layer**: Storage service retrieves AD Index data
4. **Response**: JSON data sent back to client with structured metrics
5. **UI Update**: Components re-render with fetched data and loading states

## External Dependencies

### Production Dependencies
- **UI Framework**: React, Radix UI components, shadcn/ui
- **Database**: Drizzle ORM, Neon serverless PostgreSQL
- **Utilities**: date-fns, clsx, class-variance-authority
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter for client-side navigation

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Type safety across the entire stack
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Development**: tsx for TypeScript execution, Replit-specific plugins

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` starts development server with hot reload
- **Port Configuration**: Vite dev server with Express.js backend integration
- **File Watching**: Automatic restart on server changes, hot module replacement for client

### Production Build
- **Client Build**: Vite builds optimized static assets to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Production server serves built client assets
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### Database Management
- **Schema**: Defined in `/shared/schema.ts` with Drizzle
- **Migrations**: Generated to `/migrations` directory
- **Push Command**: `npm run db:push` applies schema changes
- **Connection**: Uses DATABASE_URL environment variable

The application is designed to be deployed on platforms like Replit, with support for both development and production environments through different npm scripts and build configurations.