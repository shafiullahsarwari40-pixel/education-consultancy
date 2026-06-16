import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function parseEnvFile(content) {
  const env = {};
  if (!content) return env;
  content = content.replace(/^\uFEFF/, '');

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

function loadLocalEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    return parseEnvFile(content);
  } catch (error) {
    return {};
  }
}

function safeDecodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    let normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) {
      normalized += '=';
    }
    const decoded = Buffer.from(normalized, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

function hasValidServiceRoleClaim(token) {
  const payload = safeDecodeJwtPayload(token);
  if (!payload || typeof payload !== 'object') return false;
  return payload.role === 'service_role';
}

const fileEnv = loadLocalEnv();
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? fileEnv.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ??
  fileEnv.SUPABASE_SERVICE_ROLE_KEY ??
  fileEnv.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ??
  '';

const SUPABASE_SERVICE_ROLE_KEY_MALFORMED =
  Boolean(SUPABASE_SERVICE_ROLE_KEY) && !hasValidServiceRoleClaim(SUPABASE_SERVICE_ROLE_KEY);

if (SUPABASE_SERVICE_ROLE_KEY_MALFORMED) {
  console.warn(
    'Supabase SUPABASE_SERVICE_ROLE_KEY appears malformed or incorrect. Replace it with the correct service role key from your Supabase project settings.'
  );
}

export const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

export function isInvalidSupabaseApiKeyError(error) {
  return !!error?.message && /invalid api key/i.test(error.message);
}

export function isSupabaseSessionMissingError(error) {
  if (!error) return false;
  return /(AuthSessionMissingError|session_not_found)/i.test(error.name || error.message || '');
}

export const supabaseAdminKeyMalformed = SUPABASE_SERVICE_ROLE_KEY_MALFORMED;

// Note: This client must only be used on the server (API routes / server components).
