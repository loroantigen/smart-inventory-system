# Smart Inventory & Logistics Management System

A modern, enterprise-grade inventory and logistics management system built with Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)

## Features

### Core Modules
- **Inventory Management** - Track non-consumable equipment with full lifecycle management
- **Consumables Management** - Monitor supplies with stock levels, expiration dates, and alerts
- **Request Workflow** - Submit, approve, and track consumable requests with file attachments
- **User Management** - Role-based access control (Admin, Moderator, User)
- **Department Management** - Organize inventory by organizational departments
- **Audit Logs** - Complete activity tracking for compliance
- **Reports & Analytics** - Generate and export inventory reports
- **Notifications** - Real-time alerts for low stock, expirations, and approvals

### Key Capabilities
- Authentication & Authorization (NextAuth.js with credentials)
- QR Code support for inventory items
- Barcode support structure
- File uploads for request attachments
- Excel & PDF export functionality
- Responsive design with dark/light mode
- Dashboard analytics with interactive charts
- Low stock alerts
- Expiration monitoring
- Stock-in/Stock-out tracking
- Command palette (Ctrl+K) for quick navigation
- Keyboard shortcuts
- Mobile-friendly with bottom navigation
- Docker deployment ready

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + Radix UI |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js |
| State | TanStack Query + Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Tables | TanStack Table |
| Notifications | Sonner Toast |
| Exports | xlsx + jspdf |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Option 1: Quick Start Script

**Linux/Mac:**
```bash
chmod +x quickstart.sh
./quickstart.sh
```

**Windows:**
```cmd
quickstart.bat
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Initialize database
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Start development server
npm run dev
```

### Option 3: Docker

```bash
docker-compose up -d
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Moderator | moderator@example.com | moderator123 |
| User | user@example.com | user123 |

## Project Structure

```
smart-inventory-system/
├── prisma/                  # Database schema & seed
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Auth pages (login, register)
│   │   ├── (dashboard)/     # Dashboard pages
│   │   ├── api/             # API routes
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   └── ...              # Feature components
│   ├── lib/                 # Utilities & configs
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand stores
│   └── types/               # TypeScript types
├── public/                  # Static assets
└── docs/                    # Documentation
```

## Pages

| Page | Path | Access |
|------|------|--------|
| Dashboard | `/dashboard` | All |
| Inventory | `/inventory` | All |
| Consumables | `/consumables` | All |
| Requests | `/requests` | All |
| Users | `/users` | Admin |
| Departments | `/departments` | Admin |
| Reports | `/reports` | Admin, Moderator |
| Export | `/export` | Admin, Moderator |
| System Status | `/system-status` | Admin |
| Audit Logs | `/audit-logs` | Admin |
| Settings | `/settings` | Admin |
| Notifications | `/notifications` | All |
| Profile | `/profile` | All |

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/[...nextauth]` | ALL | Authentication |
| `/api/register` | POST | User registration |
| `/api/dashboard` | GET | Dashboard statistics |
| `/api/stats` | GET | System statistics |
| `/api/health` | GET | Health check |
| `/api/search` | GET | Global search |
| `/api/inventory` | GET/POST | Inventory CRUD |
| `/api/consumables` | GET/POST | Consumables CRUD |
| `/api/requests` | GET/POST/PATCH | Request workflow |
| `/api/users` | GET/POST/PATCH | User management |
| `/api/departments` | GET/POST | Department management |
| `/api/reports` | GET | Generate reports |
| `/api/stock-movements` | GET/POST | Stock transactions |
| `/api/audit-logs` | GET | Activity logs |
| `/api/notifications` | GET/PATCH | Notifications |
| `/api/upload` | POST | File uploads |
| `/api/settings` | GET/PATCH | System settings |
| `/api/backup` | GET/POST | Backup/restore |
| `/api/import` | POST | Bulk import |
| `/api/alerts` | GET | Process alerts |

## Database Schema

### Tables
- **users** - System users with roles
- **accounts** - OAuth accounts
- **sessions** - User sessions
- **departments** - Organizational departments
- **inventory_items** - Non-consumable equipment
- **inventory_assignments** - Equipment assignments
- **inventory_documents** - Attached files
- **consumable_items** - Consumable supplies
- **stock_movements** - Stock transactions
- **consumable_requests** - Request workflow
- **request_attachments** - Request files
- **notifications** - User notifications
- **audit_logs** - Activity tracking

## User Roles

### Admin
- Full system access
- Manage users, departments, settings
- View all reports and audit logs
- Approve/reject requests
- Manage inventory and consumables
- System backup/restore

### Moderator (Logistics Officer)
- Manage inventory and consumables
- Process requests
- Generate reports
- View stock movements
- Upload documents
- Export data

### User (Field Staff)
- View assigned items
- Submit consumable requests
- Track request status
- Upload request attachments
- View notifications

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open command palette |
| `Ctrl + /` | Show keyboard shortcuts |
| `ESC` | Close modals |

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_inventory?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App
APP_NAME="Smart Inventory & Logistics System"
APP_URL="http://localhost:3000"
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

## Docker

```bash
# Start all services
docker-compose up -d

# Rebuild
docker-compose up -d --build

# Stop
docker-compose down
```

## License

MIT License - see [LICENSE](LICENSE) file.

## Support

For issues and feature requests, please refer to the documentation files:
- `SETUP.md` - Setup instructions
- `DEPLOYMENT.md` - Deployment guide
- `API.md` - API documentation
- `PROJECT_INDEX.md` - Complete file index
