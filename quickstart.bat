@echo off
echo Smart Inventory ^& Logistics System - Quick Start
echo ====================================================
echo.

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo Node.js is required. Please install it first.
    exit /b 1
)
echo Node.js version:
node -v

REM Check .env
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo Please edit .env and set your DATABASE_URL and NEXTAUTH_SECRET
)

echo Installing dependencies...
call npm install

echo Generating Prisma client...
call npx prisma generate

echo Pushing database schema...
call npx prisma db push

echo Seeding database...
call npx prisma db seed

echo.
echo Setup complete!
echo.
echo Default credentials:
echo   Admin:      admin@example.com / admin123
echo   Moderator:  moderator@example.com / moderator123
echo   User:       user@example.com / user123
echo.
call npm run dev
