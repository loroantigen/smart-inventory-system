# 🚀 Step-by-Step Setup Guide

## Prerequisites (Install These First)

Before you start, make sure you have:

1. **Node.js 18+** — Download from https://nodejs.org/ (LTS version recommended)
   ```bash
   node -v   # Should show v18.x.x or higher
   ```

2. **PostgreSQL** — Download from https://www.postgresql.org/download/
   ```bash
   psql --version   # Should show version
   ```

3. **Git** (optional) — Download from https://git-scm.com/

---

## Step 1: Extract the Project

```bash
# If you have the zip file:
unzip smart-inventory-system.zip

# Or if you extracted it already, just navigate to the folder:
cd smart-inventory-system
```

---

## Step 2: Install Dependencies

**YES, you need to run `npm install` first!** This downloads all the required packages.

```bash
npm install
```

⏱️ This will take 2-5 minutes depending on your internet speed.

**If you get errors during install:**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Step 3: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Now edit .env with your database info
# On Mac/Linux:
nano .env

# On Windows:
notepad .env
```

**Minimum required in `.env`:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_inventory?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
```

**How to get your database URL:**
- If PostgreSQL is on your computer with default settings:
  ```
  postgresql://postgres:postgres@localhost:5432/smart_inventory?schema=public
  ```
- Replace `postgres:postgres` with your actual username:password

**How to generate NEXTAUTH_SECRET:**
```bash
# Run this in terminal:
openssl rand -base64 32
```
Copy the output and paste it as your NEXTAUTH_SECRET.

---

## Step 4: Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE smart_inventory;

# Exit
\q
```

**If you don't know your PostgreSQL password:**
- Windows: Check pgAdmin or the password you set during installation
- Mac: Default is often your computer username or blank
- Linux: Run `sudo -u postgres psql` to connect without password

---

## Step 5: Set Up the Database Schema

```bash
# Generate Prisma client (connects your code to the database)
npx prisma generate

# Push the database schema (creates all tables)
npx prisma db push
```

---

## Step 6: Seed the Database (Add Demo Data)

```bash
npx prisma db seed
```

This creates:
- 3 demo users (Admin, Moderator, User)
- 5 departments
- 3 inventory items
- 5 consumable items
- Sample requests and stock movements

---

## Step 7: Start the App! 🎉

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

You will be redirected to the login page.

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Moderator | moderator@example.com | moderator123 |
| User | user@example.com | user123 |

---

## Common Problems & Fixes

### ❌ "Cannot find module" errors
```bash
rm -rf node_modules
npm install
```

### ❌ "Database connection failed"
1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in .env
3. Make sure the database `smart_inventory` exists

### ❌ "Prisma Client not found"
```bash
npx prisma generate
```

### ❌ Port 3000 already in use
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- --port 3001
```

### ❌ "bcryptjs" build errors (on some systems)
```bash
npm rebuild bcryptjs
```

---

## Quick Command Reference

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma generate` | Generate database client |
| `npx prisma db push` | Update database schema |
| `npx prisma db seed` | Add demo data |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate reset` | Reset database |
| `node verify.js` | Check project health |
| `node scripts/validate-env.js` | Check environment variables |

---

## Using Docker (Alternative - Easiest!)

If you have Docker installed, this is the EASIEST way:

```bash
# Start everything with one command
docker-compose up -d

# The app will be at http://localhost:3000
# Database is included automatically
```

To stop:
```bash
docker-compose down
```

---

## Need Help?

1. Check `TROUBLESHOOTING.md` for detailed fixes
2. Run `node verify.js` to check your setup
3. Run `node scripts/validate-env.js` to check your .env file
4. Check the console logs for error messages
