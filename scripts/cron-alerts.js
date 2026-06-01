#!/usr/bin/env node
/**
 * Scheduled Alerts Script
 * Run this via cron: 0 */6 * * * node scripts/cron-alerts.js
 * Or use a scheduler like node-cron in production
 */

async function processAlerts() {
  try {
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const apiKey = process.env.CRON_API_KEY;

    const response = await fetch(`${baseUrl}/api/alerts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-API-Key": apiKey } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[CRON] Alerts processed:", {
      timestamp: new Date().toISOString(),
      alertsGenerated: data.alertsGenerated,
      lowStock: data.lowStock,
      expired: data.expired,
      nearExpiry: data.nearExpiry,
    });

    process.exit(0);
  } catch (error) {
    console.error("[CRON] Error processing alerts:", error);
    process.exit(1);
  }
}

processAlerts();