# Blueprint Pro - Development Guide for Claude

## Project Overview

Blueprint Pro is a production management system for manufacturing companies. The project uses Next.js 15 with React 19, Prisma ORM, and Stack Auth for authentication.

## Important Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Check TypeScript types
npx tsc --noEmit
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database (careful!)
npx prisma db push --force-reset
```

### Testing Database Connection
```bash
# Run the database test script
npm run test-db
```

## Key Files and Locations

### Configuration
- `/prisma/schema.prisma` - Database schema
- `/.env.local` - Environment variables (do not commit)
- `/src/lib/auth/stack.ts` - Authentication setup
- `/src/lib/db/prisma.ts` - Database client

### Main Pages
- `/src/app/(app)/dashboard/page.tsx` - Dashboard
- `/src/app/(app)/work-orders/page.tsx` - Work orders (uses mock data)
- `/src/app/(app)/tasks/page.tsx` - Tasks (uses mock data)
- `/src/app/(app)/operations/page.tsx` - Operations (uses mock data)
- `/src/app/(app)/quality-control/page.tsx` - Quality control (uses mock data)
- `/src/app/(app)/profile/page.tsx` - User profile

### API Routes
- `/src/app/api/work-orders/` - Work orders API
- `/src/app/api/quality-control/` - Quality control API
- `/src/app/api/time-tracking/` - Time tracking API

## Current TODOs

### High Priority
1. Replace mock data with real database queries in:
   - work-orders page
   - tasks page
   - operations page
   - quality-control page
   - projects page

2. Configure Uploadthing environment variables for file uploads

3. Implement toast notifications to replace alert() calls

### Medium Priority
1. Implement dark mode functionality
2. Add pagination to all list pages
3. Persist settings to database
4. Implement real report generation (PDF/Excel)

### Low Priority
1. Add loading states for all async operations
2. Implement real-time updates with WebSockets
3. Add data export functionality
4. Implement audit logs

## Common Issues and Solutions

### CSS Error "border-border"
- Fixed by replacing with explicit Tailwind classes (border-gray-200)
- Issue caused by Tailwind v4 alpha changes

### Profile Page 404
- Fixed by creating `/src/app/(app)/profile/page.tsx`
- Integrated with Stack Auth for user management

### Authentication in APIs
- Use `stackServerApp.getUser()` to get current user
- Return 401 if user is not authenticated

## Code Style Guidelines

1. Use TypeScript for all new files
2. Follow existing component patterns
3. Use Tailwind CSS classes, avoid custom CSS
4. Handle errors gracefully with try-catch
5. Use console.log for debugging, but remove before committing
6. Avoid using alert(), use toast notifications instead

## Environment Variables Required

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

# Stack Auth
STACK_PROJECT_ID="..."
STACK_PUBLISHABLE_CLIENT_KEY="..."
STACK_SECRET_SERVER_KEY="..."

# Uploadthing (for file uploads)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."
```

## Useful Patterns

### Getting Current User in API Route
```typescript
import { stackServerApp } from "@/lib/auth/stack";

const user = await stackServerApp.getUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Creating Database Records
```typescript
const record = await prisma.model.create({
  data: {
    // fields
    createdBy: user.id,
  },
  include: {
    // relations to include
  },
});
```

### Handling Form Submission
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    const response = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error("Failed");
    
    // Success - show toast instead of alert
    console.log("Success!");
  } catch (error) {
    console.error("Error:", error);
  }
};
```

## Next Steps for Development

1. Implement a toast notification system (recommend sonner or react-hot-toast)
2. Create reusable data fetching hooks with React Query
3. Add error boundaries for better error handling
4. Implement proper loading states
5. Add input validation with Zod schemas
6. Create unit tests for critical functions
7. Set up CI/CD pipeline
8. Add monitoring and error tracking (Sentry)

Remember to run `npm run lint` before committing code!