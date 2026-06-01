# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ database
- Git (optional)

## Environment Setup

1. **Clone/Extract the project**
   ```bash
   cd smart-inventory-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/smart_inventory"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-long"
   ```

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

## Docker Deployment (Recommended)

1. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start PostgreSQL database
   - Build and start the Next.js application
   - Seed the database with demo data

2. **Access the application**
   - Open http://localhost:3000
   - Login with demo credentials

3. **Stop services**
   ```bash
   docker-compose down
   ```

## Production Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Using PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start npm --name "smart-inventory" -- start
```

### Environment Variables for Production
```
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/smart_inventory"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret-key"
```

## Database Migrations

### Create a migration
```bash
npx prisma migrate dev --name add_new_feature
```

### Deploy migrations
```bash
npx prisma migrate deploy
```

### Reset database (development only)
```bash
npx prisma migrate reset
```

## SSL/HTTPS Setup

For production, ensure you have:
1. SSL certificate installed
2. `NEXTAUTH_URL` set to HTTPS URL
3. Secure cookies enabled

## Backup Strategy

### Database Backup
```bash
pg_dump -U postgres smart_inventory > backup.sql
```

### Restore Database
```bash
psql -U postgres smart_inventory < backup.sql
```

## Monitoring

### Health Check Endpoint
```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "api": "running"
  }
}
```

## Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

### Database connection issues
1. Verify PostgreSQL is running
2. Check connection string in `.env`
3. Ensure database exists
4. Check firewall rules

### Build errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## Performance Optimization

1. Enable caching in production
2. Use CDN for static assets
3. Optimize images
4. Enable database connection pooling
5. Use Redis for session storage (optional)

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Database backups
- [ ] File upload size limits
- [ ] Input validation enabled
