#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  '.env.example',
  'prisma/schema.prisma',
  'prisma/seed.ts',
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/lib/prisma.ts',
  'src/lib/auth.ts',
  'src/lib/utils.ts',
  'src/lib/zod-schemas.ts',
  'src/components/providers.tsx',
  'src/components/layout/sidebar.tsx',
  'src/components/layout/header.tsx',
  'src/app/(dashboard)/layout.tsx',
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/register/page.tsx',
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/app/api/register/route.ts',
  'src/app/api/dashboard/route.ts',
  'src/app/api/inventory/route.ts',
  'src/app/api/consumables/route.ts',
  'src/app/api/requests/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/reports/route.ts',
  'src/app/api/audit-logs/route.ts',
  'src/app/api/notifications/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/settings/route.ts',
  'src/app/api/health/route.ts',
  'src/app/api/search/route.ts',
  'src/app/api/stats/route.ts',
];

const requiredDirs = [
  'prisma',
  'src/app',
  'src/components',
  'src/components/ui',
  'src/components/layout',
  'src/components/tables',
  'src/lib',
  'src/types',
  'src/hooks',
  'src/store',
  'public/uploads',
];

let errors = 0;

console.log('🔍 Verifying Smart Inventory System...\n');

// Check directories
console.log('📁 Checking directories...');
for (const dir of requiredDirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir} - MISSING`);
    errors++;
  }
}

// Check files
console.log('\n📄 Checking required files...');
for (const file of requiredFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    errors++;
  }
}

// Count total files
let totalFiles = 0;
function countFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
      countFiles(fullPath);
    } else if (stat.isFile()) {
      totalFiles++;
    }
  }
}
countFiles(process.cwd());

console.log(`\n📊 Total project files: ${totalFiles}`);

if (errors === 0) {
  console.log('\n✅ All checks passed! Project is ready.');
  console.log('\nNext steps:');
  console.log('  1. npm install');
  console.log('  2. cp .env.example .env');
  console.log('  3. npx prisma generate');
  console.log('  4. npx prisma db push');
  console.log('  5. npx prisma db seed');
  console.log('  6. npm run dev');
  process.exit(0);
} else {
  console.log(`\n❌ ${errors} checks failed. Please review the missing items.`);
  process.exit(1);
}
