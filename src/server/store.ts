import fs from 'fs';
import path from 'path';
import {
  CmsDatabase,
  CmsEnquiry,
  CmsProduct,
  CmsTradeLane,
  EmailOutboxEntry,
  INITIAL_CMS_SEED,
  QuoteStatus,
  SupplierStatus,
  WebhookDeployLog,
} from '../data/cmsSeed';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'cms-db.json');

function ensureDb(): CmsDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_CMS_SEED, null, 2), 'utf-8');
    return structuredClone(INITIAL_CMS_SEED);
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as CmsDatabase;
  } catch {
    return structuredClone(INITIAL_CMS_SEED);
  }
}

function saveDb(db: CmsDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  db.siteConfig.lastSyncedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export function getCmsDatabase(): CmsDatabase {
  return ensureDb();
}

export function resetCmsDatabaseToSeed(): CmsDatabase {
  const fresh = structuredClone(INITIAL_CMS_SEED);
  saveDb(fresh);
  return fresh;
}

export function createEnquiryRecord(
  entry: Omit<CmsEnquiry, 'id' | 'referenceCode' | 'createdAt' | 'updatedAt'>,
  outboxEntry: Omit<EmailOutboxEntry, 'id' | 'sentAt' | 'enquiryRef'>
): { enquiry: CmsEnquiry; mail: EmailOutboxEntry } {
  const db = ensureDb();
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
  const randPart = Math.floor(100 + Math.random() * 900);
  const prefix = entry.kind === 'quote' ? 'CMDX-Q' : 'CMDX-S';
  const referenceCode = `${prefix}-${datePart}-${randPart}`;

  const newEnquiry: CmsEnquiry = {
    ...entry,
    id: `enq-${Date.now()}`,
    referenceCode,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const mail: EmailOutboxEntry = {
    ...outboxEntry,
    id: `mail-${Date.now()}`,
    enquiryRef: referenceCode,
    sentAt: now.toISOString(),
  };

  db.enquiries.unshift(newEnquiry);
  db.outbox.unshift(mail);
  saveDb(db);

  return { enquiry: newEnquiry, mail };
}

export function updateEnquiryStatus(
  id: string,
  status: QuoteStatus | SupplierStatus,
  notes?: string
): CmsEnquiry | null {
  const db = ensureDb();
  const target = db.enquiries.find((e) => e.id === id);
  if (!target) return null;

  target.status = status;
  if (notes !== undefined) {
    target.notes = notes;
  }
  target.updatedAt = new Date().toISOString();

  db.outbox.unshift({
    id: `mail-${Date.now()}`,
    to: target.email,
    from: process.env.ENQUIRY_FROM || 'notifications@commodex.id',
    subject: `[Commodex Status Update] ${target.referenceCode} → ${status.toUpperCase()}`,
    enquiryRef: target.referenceCode,
    kind: 'status_update',
    provider: process.env.RESEND_API_KEY ? 'Resend API' : 'Strapi SMTP Fallback',
    status: process.env.RESEND_API_KEY ? 'delivered' : 'logged_local',
    sentAt: new Date().toISOString(),
    previewText: `Enquiry ${target.referenceCode} (${target.companyName}) status updated to "${status}". ${notes ? `Notes: ${notes}` : ''}`,
  });

  saveDb(db);
  return target;
}

export function upsertProductRecord(product: CmsProduct): CmsProduct {
  const db = ensureDb();
  const idx = db.products.findIndex((p) => p.id === product.id || p.slugEn === product.slugEn);
  const updated: CmsProduct = {
    ...product,
    publishedAt: new Date().toISOString(),
  };
  if (idx >= 0) {
    db.products[idx] = updated;
  } else {
    db.products.push(updated);
  }
  db.products.sort((a, b) => a.order - b.order);
  saveDb(db);
  return updated;
}

export function deleteProductRecord(id: string): boolean {
  const db = ensureDb();
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

export function upsertTradeLaneRecord(lane: CmsTradeLane): CmsTradeLane {
  const db = ensureDb();
  const idx = db.tradeLanes.findIndex((l) => l.id === lane.id || l.code === lane.code);
  if (idx >= 0) {
    db.tradeLanes[idx] = lane;
  } else {
    db.tradeLanes.push(lane);
  }
  saveDb(db);
  return lane;
}

export function triggerVercelDeployHook(
  environment: 'production (main)' | 'staging',
  triggerReason: string
): WebhookDeployLog {
  const db = ensureDb();
  const entry: WebhookDeployLog = {
    id: `dep-${Date.now()}`,
    environment,
    triggerReason,
    debounceWindowSec: 180,
    status: 'completed',
    triggeredAt: new Date().toISOString(),
    commitOrToken: environment.includes('production') ? 'hook_vercel_prod_main' : 'hook_vercel_stg_preview',
  };
  db.deployLogs.unshift(entry);
  saveDb(db);
  return entry;
}
