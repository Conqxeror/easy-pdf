#!/usr/bin/env node

/**
 * Validate environment variables for build
 * This script ensures critical environment variables are set
 * and provides helpful warnings if using fallback values.
 */

// Minimal env loader to read .env.local then .env without external deps
const fs = require('fs');
const path = require('path');
const envPaths = ['.env.local', '.env'];
envPaths.forEach((p) => {
  const full = path.join(process.cwd(), p);
  if (fs.existsSync(full)) {
    const lines = fs.readFileSync(full, 'utf-8').split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    });
  }
});

const requiredEnvVars = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_BASE_URL',
  'VERCEL_URL'
];

const warnings = [];
const errors = [];

// Check if at least one base URL is defined
const baseUrlDefined = requiredEnvVars.some(varName => process.env[varName]);

if (!baseUrlDefined) {
  warnings.push(
    '⚠️  WARNING: No base URL environment variable is set.',
    '   Define one of: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_BASE_URL, or VERCEL_URL',
    '   Falling back to hardcoded URL: https://easy-pdf-murex.vercel.app',
    '   This may cause issues with canonical URLs and metadata in production.'
  );
}

// Check for Google verification
if (!process.env.GOOGLE_SITE_VERIFICATION) {
  warnings.push(
    '⚠️  INFO: GOOGLE_SITE_VERIFICATION not set.',
    '   Using default value from code. Set this env var to override.'
  );
}

// Display results
if (errors.length > 0) {
  console.error('\n❌ Environment Validation Failed:\n');
  errors.forEach(err => console.error(err));
  console.error('');
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('\n⚠️  Environment Validation Warnings:\n');
  warnings.forEach(warn => console.warn(warn));
  console.warn('');
}

// Success message
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                process.env.NEXT_PUBLIC_BASE_URL || 
                process.env.VERCEL_URL || 
                'https://easy-pdf-murex.vercel.app';

console.log('✅ Environment validation complete');
console.log(`   Using base URL: ${baseUrl}`);
console.log('');

process.exit(0);
