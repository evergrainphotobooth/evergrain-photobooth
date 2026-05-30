#!/usr/bin/env node
// Hash an admin password for the CMS.
// Usage: node scripts/hash-password.mjs "your-password-here"
// Copy the output into the ADMIN_PASSWORD_HASH env var in Vercel.

import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs \"your-password\"");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
const combined = `${salt}:${hash}`;

console.log("\n  Copy this value into Vercel → Settings → Environment Variables → ADMIN_PASSWORD_HASH:\n");
console.log(`  ${combined}\n`);
