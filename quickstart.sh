#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Smart Inventory & Logistics System - Quick Start        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}▶ Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install it from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ is required. You have $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
echo -e "${BLUE}▶ Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check PostgreSQL
echo -e "${BLUE}▶ Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL found${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found. You need to install it.${NC}"
    echo "   Download: https://www.postgresql.org/download/"
fi

# Check .env
echo ""
echo -e "${BLUE}▶ Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}   ⚠️  Please edit .env and set your DATABASE_URL and NEXTAUTH_SECRET${NC}"
    echo ""
    echo "   Example DATABASE_URL:"
    echo "   postgresql://postgres:yourpassword@localhost:5432/smart_inventory?schema=public"
    echo ""
    echo "   To generate NEXTAUTH_SECRET, run: openssl rand -base64 32"
    echo ""
    read -p "Press Enter after you've edited .env..."
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Install dependencies
echo ""
echo -e "${BLUE}▶ Installing dependencies (this may take a few minutes)...${NC}"
npm install

# Generate Prisma client
echo ""
echo -e "${BLUE}▶ Generating Prisma client...${NC}"
npx prisma generate

# Push database schema
echo ""
echo -e "${BLUE}▶ Setting up database schema...${NC}"
npx prisma db push

# Seed database
echo ""
echo -e "${BLUE}▶ Seeding database with demo data...${NC}"
npx prisma db seed

# Success!
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup Complete!                                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🚀 Starting development server...${NC}"
echo ""
echo -e "${YELLOW}Default login credentials:${NC}"
echo "   Admin:      admin@example.com / admin123"
echo "   Moderator:  moderator@example.com / moderator123"
echo "   User:       user@example.com / user123"
echo ""
echo -e "${BLUE}Opening http://localhost:3000 ...${NC}"
echo ""

npm run dev
