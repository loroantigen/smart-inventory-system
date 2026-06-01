# Project File Index

## Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.env.example` - Environment variables template
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `.gitignore` - Git ignore patterns
- `.dockerignore` - Docker ignore patterns
- `Dockerfile` - Docker image definition
- `docker-compose.yml` - Docker Compose services
- `Makefile` - Build automation
- `manifest.json` - Project manifest
- `VERSION` - Version number
- `LICENSE` - MIT License

## Documentation
- `README.md` - Main project documentation
- `SETUP.md` - Setup instructions
- `DEPLOYMENT.md` - Deployment guide
- `API.md` - API documentation
- `BUILD_SUMMARY.md` - Build details
- `FINAL_SUMMARY.md` - Complete summary
- `CHANGELOG.md` - Version history
- `verify.js` - Verification script
- `quickstart.sh` - Unix quick start script
- `quickstart.bat` - Windows quick start script

## Database
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Seed data

## Application Entry Points
- `src/app/layout.tsx` - Root layout (theme provider)
- `src/app/page.tsx` - Home redirect
- `src/app/globals.css` - Global styles
- `src/app/loading.tsx` - App loading screen
- `src/app/error.tsx` - Error boundary
- `src/app/not-found.tsx` - 404 page
- `src/app/robots.txt` - Robots configuration
- `src/app/sitemap.ts` - Sitemap generation

## Authentication
- `src/app/(auth)/layout.tsx` - Auth layout
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/register/page.tsx` - Registration page
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handlers
- `src/app/api/register/route.ts` - Registration API

## Dashboard
- `src/app/(dashboard)/layout.tsx` - Dashboard layout
- `src/app/(dashboard)/loading.tsx` - Dashboard loading
- `src/app/(dashboard)/error.tsx` - Dashboard error
- `src/app/(dashboard)/dashboard/page.tsx` - Dashboard home

## Inventory Module
- `src/app/(dashboard)/inventory/page.tsx` - Inventory list
- `src/app/(dashboard)/inventory/new/page.tsx` - Add inventory
- `src/app/(dashboard)/inventory/[id]/page.tsx` - Inventory detail
- `src/app/api/inventory/route.ts` - Inventory API
- `src/app/api/inventory/[id]/route.ts` - Inventory detail API

## Consumables Module
- `src/app/(dashboard)/consumables/page.tsx` - Consumables list
- `src/app/(dashboard)/consumables/new/page.tsx` - Add consumable
- `src/app/(dashboard)/consumables/[id]/page.tsx` - Consumable detail
- `src/app/api/consumables/route.ts` - Consumables API
- `src/app/api/consumables/[id]/route.ts` - Consumable detail API

## Requests Module
- `src/app/(dashboard)/requests/page.tsx` - Requests list
- `src/app/(dashboard)/requests/new/page.tsx` - New request
- `src/app/(dashboard)/requests/[id]/page.tsx` - Request detail
- `src/app/api/requests/route.ts` - Requests API
- `src/app/api/requests/[id]/route.ts` - Request detail API

## Users Module
- `src/app/(dashboard)/users/page.tsx` - Users list
- `src/app/api/users/route.ts` - Users API

## Departments Module
- `src/app/(dashboard)/departments/page.tsx` - Departments list
- `src/app/api/departments/route.ts` - Departments API

## Reports & Export
- `src/app/(dashboard)/reports/page.tsx` - Reports page
- `src/app/(dashboard)/export/page.tsx` - Export page
- `src/app/api/reports/route.ts` - Reports API

## System
- `src/app/(dashboard)/system-status/page.tsx` - System status
- `src/app/(dashboard)/audit-logs/page.tsx` - Audit logs
- `src/app/(dashboard)/settings/page.tsx` - Settings
- `src/app/(dashboard)/notifications/page.tsx` - Notifications
- `src/app/(dashboard)/profile/page.tsx` - User profile
- `src/app/maintenance/page.tsx` - Maintenance mode

## API Routes
- `src/app/api/dashboard/route.ts` - Dashboard stats
- `src/app/api/stats/route.ts` - System stats
- `src/app/api/health/route.ts` - Health check
- `src/app/api/search/route.ts` - Global search
- `src/app/api/stock-movements/route.ts` - Stock movements
- `src/app/api/audit-logs/route.ts` - Audit logs
- `src/app/api/notifications/route.ts` - Notifications
- `src/app/api/upload/route.ts` - File uploads
- `src/app/api/settings/route.ts` - System settings
- `src/app/api/backup/route.ts` - Backup/restore
- `src/app/api/import/route.ts` - Bulk import
- `src/app/api/alerts/route.ts` - Alert processing

## Components
- `src/components/providers.tsx` - App providers
- `src/components/theme-provider.tsx` - Theme provider
- `src/components/theme-toggle.tsx` - Theme toggle
- `src/components/command-palette.tsx` - Command palette
- `src/components/keyboard-shortcuts.tsx` - Shortcuts help
- `src/components/empty-state.tsx` - Empty state
- `src/components/page-title.tsx` - Page title
- `src/components/spinner.tsx` - Loading spinner
- `src/components/stats-card.tsx` - Stats card
- `src/components/breadcrumb.tsx` - Breadcrumb
- `src/components/mobile-nav.tsx` - Mobile navigation

## Layout Components
- `src/components/layout/sidebar.tsx` - Sidebar navigation
- `src/components/layout/header.tsx` - Top header

## UI Components (shadcn/ui)
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/skeleton.tsx`

## Table Components
- `src/components/tables/data-table.tsx` - Reusable data table

## Libraries
- `src/lib/prisma.ts` - Prisma client
- `src/lib/auth.ts` - Auth configuration
- `src/lib/utils.ts` - Utility functions
- `src/lib/zod-schemas.ts` - Validation schemas
- `src/lib/qr-utils.ts` - QR code utilities
- `src/lib/export-utils.ts` - Export utilities
- `src/lib/rate-limiter.ts` - Rate limiting
- `src/lib/constants.ts` - App constants

## Hooks
- `src/hooks/use-debounce.ts` - Debounce hook
- `src/hooks/use-notifications.ts` - Notifications hook

## State Management
- `src/store/app-store.ts` - Zustand store

## Types
- `src/types/index.ts` - TypeScript types
- `src/types/next-auth.d.ts` - NextAuth type extensions

## Middleware
- `middleware.ts` - Route protection and RBAC
