#!/usr/bin/env node
/**
 * Environment Validation Script
 * Run before starting the app to ensure all required env vars are set
 */

const requiredVars = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
];

const optionalVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
];

function validate() {
  let hasErrors = false;

  console.log("🔍 Validating environment variables...\n");

  // Check required vars
  for (const key of requiredVars) {
    const value = process.env[key];
    if (!value) {
      console.error(`❌ ${key} is required but not set`);
      hasErrors = true;
    } else {
      console.log(`✅ ${key} is set`);
    }
  }

  console.log("");

  // Check optional vars
  for (const key of optionalVars) {
    const value = process.env[key];
    if (!value) {
      console.warn(`⚠️  ${key} is not set (optional)`);
    } else {
      console.log(`✅ ${key} is set`);
    }
  }

  console.log("");

  // Validate specific formats
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith("postgresql://")) {
    console.error("❌ DATABASE_URL must start with postgresql://");
    hasErrors = true;
  }

  const nextauthUrl = process.env.NEXTAUTH_URL;
  if (nextauthUrl) {
    try {
      new URL(nextauthUrl);
    } catch {
      console.error("❌ NEXTAUTH_URL must be a valid URL");
      hasErrors = true;
    }
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && secret.length < 32) {
    console.warn("⚠️  NEXTAUTH_SECRET should be at least 32 characters for security");
  }

  console.log("");

  if (hasErrors) {
    console.error("❌ Validation failed. Please fix the errors above.");
    process.exit(1);
  } else {
    console.log("✅ All required environment variables are set correctly!");
    process.exit(0);
  }
}

validate();