# Personal Finance Tracker

## Overview

This is a full-stack expense tracking application built with React and Express. The application helps users manage their personal finances by tracking transactions, organizing them into categories, setting budgets, and generating reports. It features a modern, responsive interface built with Tailwind CSS and shadcn/ui components, with a robust backend API for data management.

## User Preferences

Preferred communication style: Simple, everyday language.
Application language: Italian interface and messages.

## Recent Changes (January 18, 2025)

✓ **Authentication System**: Implemented complete Replit OAuth integration with PostgreSQL session storage
✓ **CSV Import Functionality**: Advanced expense import with column mapping and preview
✓ **Database Security**: All API endpoints now require authentication
✓ **User Interface**: Italian language throughout, responsive design with user profiles
✓ **Date Handling**: Improved date parsing for multiple formats (DD/MM/YYYY, YYYY-MM-DD, etc.)
✓ **Error Handling**: Enhanced validation and error messages for transaction creation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and responsive design
- **Form Management**: React Hook Form with Zod validation for type-safe form handling
- **Charts**: Recharts library for data visualization (pie charts, bar charts, line charts)

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with proper HTTP status codes and error handling
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Schema Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Development Setup**: Hot reload with Vite middleware integration for seamless full-stack development

### Database Design
- **Schema**: Drizzle ORM schema definitions for PostgreSQL
- **Tables**: 
  - `transactions` - Financial transactions with amount, description, date, category, and account references
  - `categories` - Expense categories with customizable colors and icons
  - `accounts` - Bank accounts, credit cards, and cash accounts with balances
  - `budgets` - Monthly/yearly budget limits per category
  - `users` - User profiles with email, name, and authentication data
  - `sessions` - Session storage for authentication
- **Relationships**: Proper foreign key relationships between transactions, categories, and accounts
- **CSV Import**: Advanced CSV parsing with column mapping, date format detection, and transaction preview

### Authentication & Authorization
- **Replit OAuth Integration**: Full authentication system with Replit as OpenID Connect provider
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple
- **Protected Routes**: All API endpoints require authentication via isAuthenticated middleware
- **User Management**: Complete user profile system with email, name, and profile image support
- **Landing Page**: Separate interface for unauthenticated users with login functionality

### Development & Deployment
- **Development**: Unified development server with Vite handling frontend and Express handling API
- **Build Process**: Separate build steps for frontend (Vite) and backend (esbuild)
- **Configuration**: Environment-based configuration with proper development/production modes
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Logging**: Request/response logging for API endpoints with performance metrics

### Mobile Responsiveness
- Mobile-first responsive design with adaptive layouts
- Separate mobile navigation component for touch interfaces
- Progressive enhancement for desktop features
- Optimized touch targets and mobile interactions

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm** and **drizzle-kit**: Type-safe ORM for database operations and migrations
- **@tanstack/react-query**: Advanced server state management and data fetching
- **wouter**: Lightweight React router alternative

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives (dialogs, dropdowns, forms, etc.)
- **tailwindcss**: Utility-first CSS framework with custom design system
- **class-variance-authority**: Type-safe component variant management
- **clsx**: Utility for constructing className strings conditionally

### Form and Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Integration bridge for external validation libraries
- **zod**: TypeScript-first schema validation for runtime type checking
- **drizzle-zod**: Integration between Drizzle ORM and Zod for schema validation

### Data Visualization
- **recharts**: React charting library built on D3 for financial data visualization
- **embla-carousel-react**: Touch-friendly carousel component for mobile interfaces

### Development Tools
- **tsx**: TypeScript execution environment for development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development enhancements and error handling

### Utilities and Helpers
- **date-fns**: Modern JavaScript date utility library for transaction date handling
- **cmdk**: Command menu component for advanced user interactions
- **nanoid**: URL-safe unique string ID generator