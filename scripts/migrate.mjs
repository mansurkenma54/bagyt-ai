import { Pool } from 'pg';
import { readFile } from 'node:fs/promises';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('sslmode','verify-full');
const pool = new Pool({connectionString:url.toString(),enableChannelBinding:true});
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(834701)");
  await client.query('CREATE SCHEMA IF NOT EXISTS bagyt');
  await client.query('SET LOCAL search_path TO bagyt,public');
  for (const name of ['001_initial.sql','002_connections.sql']) {
    await client.query(await readFile(new URL('../migrations/'+name,import.meta.url),'utf8'));
  }
  await client.query('GRANT USAGE ON SCHEMA bagyt TO bagyt_tenant');
  await client.query('GRANT bagyt_tenant TO CURRENT_USER');
  await client.query('COMMIT');
  console.log('BAGYT migrations applied in dedicated bagyt schema.');
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Migration failed:',error.code,error.message);
  process.exitCode=1;
} finally { client.release(); await pool.end(); }
