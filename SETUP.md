# Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/smart_inventory"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Moderator | moderator@example.com | moderator123 |
| User | user@example.com | user123 |

## Production Deployment

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Database Management

### Reset Database
```bash
npx prisma migrate reset
```

### View Database
```bash
npx prisma studio
```

### Generate Migration
```bash
npx prisma migrate dev --name migration_name
```

## Troubleshooting

### Issue: Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Issue: Prisma Client not found
```bash
npx prisma generate
```

### Issue: Seed fails
- Check if database is properly initialized
- Run `npx prisma db push` first

### Issue: NextAuth errors
- Ensure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
