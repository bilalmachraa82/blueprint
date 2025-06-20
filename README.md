# Blueprint Pro - Production Management System

## Overview

Blueprint Pro is a comprehensive production management system designed for manufacturing companies. Built with modern web technologies, it provides real-time tracking of work orders, quality control, and production operations.

## Tech Stack

- **Frontend**: Next.js 15.3.4 with App Router and Turbopack
- **UI**: React 19 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL (Neon) with Prisma ORM 6.10.1
- **Authentication**: Stack Auth (@stackframe/stack)
- **Internationalization**: next-intl (EN/ES/PT)
- **File Uploads**: Uploadthing (configuration required)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

## Features

### Core Functionality
- 📋 **Work Order Management**: Create, track, and manage hierarchical work orders
- ✅ **Quality Control**: QR code scanning, image uploads, and quality checks
- 📊 **Real-time Dashboard**: Production metrics and KPI visualization
- ⏱️ **Time Tracking**: Track operation times and productivity
- 👥 **Multi-organization Support**: Manage multiple organizations
- 🌍 **Internationalization**: Support for English, Spanish, and Portuguese
- 📱 **Responsive Design**: Mobile-friendly interface

### Pages Implemented
- `/dashboard` - Overview with production metrics
- `/projects` - Project management
- `/work-orders` - Work order listing and creation
- `/tasks` - Task management
- `/operations` - Operation tracking with timers
- `/quality-control` - Quality checks and inspections
- `/reports` - Report generation (in development)
- `/settings` - User and system settings
- `/profile` - User profile management

## Database Schema

The system uses a comprehensive schema including:
- **Organizations**: Multi-tenant support
- **Projects**: Project management with images
- **Work Orders**: Hierarchical work order structure
- **Tasks**: Task assignment and tracking
- **Operations**: Production operations with time logging
- **Quality Checks**: Quality control with measurements and images
- **Settings**: Per-organization configuration

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Stack Auth account
- Uploadthing account (for file uploads)

### Environment Variables

Create a `.env.local` file with:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

# Stack Auth
STACK_PROJECT_ID="your-project-id"
STACK_PUBLISHABLE_CLIENT_KEY="your-client-key"
STACK_SECRET_SERVER_KEY="your-server-key"

# Uploadthing (optional, for file uploads)
UPLOADTHING_SECRET="sk_live_YOUR_KEY"
UPLOADTHING_APP_ID="YOUR_APP_ID"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
blueprint-pro/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (app)/          # Protected routes
│   │   ├── api/            # API routes
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components
│   ├── lib/                # Utility functions
│   │   ├── auth/           # Authentication setup
│   │   └── db/             # Database client
│   ├── i18n/               # Internationalization
│   └── providers/          # React context providers
├── prisma/
│   └── schema.prisma       # Database schema
├── public/                 # Static assets
└── package.json
```

## Current Status

### Completed ✅
- Basic UI structure and navigation
- Database schema and Prisma setup
- Authentication integration
- Dashboard with mock data
- Profile page with user management
- CSS fixes for Tailwind v4 compatibility

### In Progress 🚧
- Replace mock data with real database queries
- Complete file upload integration
- Implement report generation
- Add real-time notifications

### Known Issues ⚠️
- Mock data still used in: work-orders, tasks, operations, quality-control pages
- Uploadthing environment variables need configuration
- Report generation uses console.log instead of actual file generation
- Settings are not persisted to database

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact the development team or create an issue in the project repository.