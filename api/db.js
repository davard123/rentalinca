const { neon } = require('@neondatabase/serverless');

let schemaPromise;
function getSql() {
  const url = String(process.env.DATABASE_URL || '').trim();
  return url ? neon(url) : null;
}

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return null;
  if (!schemaPromise) {
    schemaPromise = sql`CREATE TABLE IF NOT EXISTS crm_records (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payload JSONB NOT NULL,
      github_issue_number INTEGER,
      UNIQUE (kind, id)
    )`;
  }
  await schemaPromise;
  return sql;
}

async function upsertCrmRecord(kind, record) {
  const sql = await ensureSchema();
  if (!sql || !record?.id) return;
  await sql`INSERT INTO crm_records (id, kind, status, created_at, payload, github_issue_number)
    VALUES (${record.id}, ${kind}, ${record.status || 'new'}, ${record.createdAt || new Date().toISOString()}, ${JSON.stringify(record)}, ${record.issueNumber || null})
    ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payload = EXCLUDED.payload, github_issue_number = COALESCE(EXCLUDED.github_issue_number, crm_records.github_issue_number)`;
}

async function updateCrmStatus(recordId, status) {
  const sql = await ensureSchema();
  if (!sql) return;
  await sql`UPDATE crm_records SET status=${status}, payload=jsonb_set(payload, '{status}', to_jsonb(${status}::text), true) WHERE id=${recordId}`;
}

module.exports = { upsertCrmRecord, updateCrmStatus };
