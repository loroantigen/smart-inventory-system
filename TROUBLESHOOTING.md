# Troubleshooting Guide

## Common Issues

### Installation Issues

#### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Prisma generation fails
```bash
# Ensure database is running
# Then regenerate
npx prisma generate
npx prisma db push
```

### Database Issues

#### Connection refused
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists: `createdb smart_inventory`

#### Migration errors
```bash
# Reset database (development only)
npx prisma migrate reset --force

# Or push schema directly
npx prisma db push
```

#### Seed fails
```bash
# Check database connection first
npx prisma db push

# Then seed
npx prisma db seed
```

### Authentication Issues

#### Cannot login
- Check if user exists in database
- Verify password is correct
- Check NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your URL

#### Session expires quickly
- Check SESSION_MAX_AGE in .env
- Verify cookie settings
- Check browser cookie settings

### Build Issues

#### Build fails
```bash
# Clear Next.js cache
rm -rf .next

# Type check
npx tsc --noEmit

# Rebuild
npm run build
```

#### Type errors
```bash
# Regenerate Prisma types
npx prisma generate

# Check types
npx tsc --noEmit
```

### Runtime Issues

#### 500 errors
- Check server logs
- Verify database connection
- Check environment variables
- Review error logs in console

#### API errors
- Check network tab in browser
- Verify authentication token
- Check API endpoint exists
- Review server logs

### Performance Issues

#### Slow page loads
- Check database query performance
- Enable caching
- Optimize images
- Check for N+1 queries

#### High memory usage
- Check for memory leaks
- Optimize large datasets
- Use pagination
- Review component re-renders

### Docker Issues

#### Container won't start
```bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose up -d --build

# Reset volumes
docker-compose down -v
docker-compose up -d
```

#### Database connection in Docker
- Ensure db service is healthy
- Check network connectivity
- Verify environment variables

## Getting Help

1. Check this troubleshooting guide
2. Review the logs (server console, browser console)
3. Check the documentation files
4. Run the verification script: `node verify.js`
5. Check GitHub issues (if applicable)

## Debug Mode

Enable debug logging:
```env
DEBUG=true
```

This will show:
- Detailed error messages
- Database queries
- API request/response logs