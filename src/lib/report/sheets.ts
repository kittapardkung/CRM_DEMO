import { createSign } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Minimal Google Sheets client (service account, no extra dependency).
 * Env: REPORT_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY.
 * Without them the app runs in demo mode: demo leads, reports kept in a
 * local JSON file (dev only — a serverless host has no persistent disk).
 */
const SHEET_ID = process.env.REPORT_SHEET_ID;
const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SA_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const sheetsConfigured = Boolean(SHEET_ID && SA_EMAIL && SA_KEY);

const b64url = (s: string | Buffer) => Buffer.from(s).toString('base64url');

let tokenCache: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now() + 60_000) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify(claim))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(SA_KEY!);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${b64url(signature)}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function api<T>(pathAndQuery: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${pathAndQuery}`, {
    ...init,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

/** All rows of a tab as strings (formatted values). Missing tab → []. */
export async function readTab(tab: string): Promise<string[][]> {
  if (!sheetsConfigured) return readLocal(tab);
  try {
    const data = await api<{ values?: string[][] }>(
      `/values/${encodeURIComponent(tab)}?valueRenderOption=FORMATTED_VALUE`,
    );
    return data.values ?? [];
  } catch (e) {
    if (String(e).includes('Unable to parse range')) return [];
    throw e;
  }
}

async function ensureTab(tab: string, header: string[]) {
  const meta = await api<{ sheets: { properties: { title: string } }[] }>('?fields=sheets.properties.title');
  if (meta.sheets.some((s) => s.properties.title === tab)) return;
  await api('/:batchUpdate', {
    method: 'POST',
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
  });
  await api(`/values/${encodeURIComponent(tab)}!A1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [header] }),
  });
}

export async function appendRows(tab: string, header: string[], rows: string[][]) {
  if (!sheetsConfigured) return appendLocal(tab, header, rows);
  await ensureTab(tab, header);
  await api(`/values/${encodeURIComponent(tab)}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: JSON.stringify({ values: rows }),
  });
}

// ---- local fallback (demo / dev) ----
const LOCAL_FILE = path.join(process.cwd(), '.data', 'sales-report.json');

async function readLocalAll(): Promise<Record<string, string[][]>> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function readLocal(tab: string) {
  return (await readLocalAll())[tab] ?? [];
}

async function appendLocal(tab: string, header: string[], rows: string[][]) {
  const all = await readLocalAll();
  all[tab] = [...(all[tab]?.length ? all[tab] : [header]), ...rows];
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(all));
}
