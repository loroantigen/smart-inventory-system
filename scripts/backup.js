#!/usr/bin/env node
/**
 * Database Backup Script
 * Run this via cron: 0 2 * * * node scripts/backup.js
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("[BACKUP] DATABASE_URL not set");
    process.exit(1);
  }

  // Parse connection string
  const url = new URL(dbUrl);
  const user = url.username;
  const password = url.password;
  const host = url.hostname;
  const port = url.port || "5432";
  const database = url.pathname.replace("/", "");

  const command = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f "${backupFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("[BACKUP] Error:", error);
      process.exit(1);
    }

    console.log(`[BACKUP] Created: ${backupFile}`);

    // Clean old backups (keep last 30 days)
    const files = fs.readdirSync(backupDir);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    files.forEach((file) => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      if (stats.mtime.getTime() < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`[BACKUP] Removed old: ${file}`);
      }
    });

    process.exit(0);
  });
}

backup();