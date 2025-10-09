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

## Recent Changes (September 21, 2025)

✓ **Dual Authentication System**: Implemented comprehensive dual authentication maintaining existing Replit OAuth plus new local email/password authentication
✓ **Local Registration**: Complete user registration with email/password, secure bcrypt hashing, and form validation
✓ **Password Reset Flow**: Full forgot/reset password functionality with secure token generation and email delivery
✓ **Enhanced Security**: Three-tier rate limiting system (IP, email, user-based) for authentication endpoints
✓ **Database Schema Extension**: Added password_hash, email_verified, token_version fields to users table and password_reset_tokens table
✓ **Italian Interface**: All new authentication pages and messages maintain Italian language consistency
✓ **Email Configuration**: Flexible email system with SMTP support and console fallback for development

## Recent Changes (October 9, 2025)

✓ **Dashboard Real Data**: Fixed budget calculation to use real user data instead of hardcoded 4000€ value
✓ **Italian Code Comments**: Added extensive Italian comments throughout backend (routes.ts) and frontend (dashboard.tsx, stats-cards.tsx) explaining each operation
✓ **Category Edit Modal**: Implemented complete category editing functionality with modal popup
✓ **Category Alias System**: Added alias field (array of strings) to categories table for better CSV matching
✓ **Color Picker Integration**: Dual color input (native picker + hex code input) synchronized for category colors
✓ **Tag Management UI**: Interactive alias management with add/remove functionality in category edit modal
✓ **Localized Names**: Support for English translations in category names for international matching

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
- **Data Storage**: PostgreSQL database with Drizzle ORM for type-safe database operations
- **Authentication APIs**: Local authentication endpoints with bcrypt password hashing and secure token generation
- **Email System**: Nodemailer integration with SMTP support and console fallback for development
- **Rate Limiting**: Three-tier security system (IP, email, user-based) for authentication protection
- **Schema Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Development Setup**: Hot reload with Vite middleware integration for seamless full-stack development

### Database Design
- **Schema**: Drizzle ORM schema definitions for PostgreSQL
- **Tables**: 
  - `transactions` - Financial transactions with amount, description, date, category, and account references
  - `categories` - Expense categories with customizable colors, icons, localized names, and alias array for CSV matching
  - `accounts` - Bank accounts, credit cards, and cash accounts with balances
  - `budgets` - Monthly/yearly budget limits per category
  - `users` - Extended user profiles with email, name, password_hash, email_verified, token_version for dual authentication
  - `password_reset_tokens` - Secure password reset tokens with expiration and single-use enforcement
  - `sessions` - Session storage for authentication with PostgreSQL backend
- **Relationships**: Proper foreign key relationships between transactions, categories, accounts, and users
- **Security**: Bcrypt password hashing, secure token generation, and session management
- **CSV Import**: Advanced CSV parsing with column mapping, date format detection, transaction preview, and alias-based category matching

### Authentication & Authorization
- **Dual Authentication System**: Complete authentication supporting both Replit OAuth and local email/password
- **Replit OAuth Integration**: Existing authentication system with Replit as OpenID Connect provider
- **Local Authentication**: Email/password registration, login, forgot/reset password with bcrypt hashing
- **Password Security**: Secure bcrypt hashing, token-based password reset with expiration
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple for both auth methods
- **Rate Limiting**: Three-tier protection system (IP, email, user-based) for authentication endpoints
- **Email System**: Nodemailer integration for password reset with SMTP/console fallback
- **Protected Routes**: All API endpoints require authentication via isAuthenticated middleware
- **User Management**: Extended user profile system supporting both OAuth and local account data
- **Landing Page**: Updated interface with dual authentication options (Replit OAuth + local registration)

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

### Authentication and Security
- **bcrypt**: Secure password hashing for local authentication
- **nodemailer**: Email sending capability for password reset functionality

## Environment Configuration

### Required Environment Variables
These are automatically provided by Replit:
- `DATABASE_URL` - PostgreSQL database connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - PostgreSQL connection details

### Optional Environment Variables
For email functionality (password reset emails):
- `SMTP_HOST` - SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - SMTP username/email address
- `SMTP_PASS` - SMTP password or app-specific password

**Note**: If SMTP variables are not configured, the system will fall back to console logging for development/testing purposes. Password reset links will be displayed in the server console instead of being sent via email.