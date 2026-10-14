import { PGlite } from "@electric-sql/pglite";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Context } from "./types";
import { Pool, types } from "pg";
export interface Tx {
  query<T = Record<string, any>>(
    sql: string,
    params?: any[],
  ): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<unknown>;
}
interface Database extends Tx {
  transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
}
const globalDb = globalThis as unknown as { bagytDb?: Promise<Database> };
export function db(): Promise<Database> {
  return (globalDb.bagytDb ??= (async () => {
    if (process.env.DATABASE_URL) {
      types.setTypeParser(20, Number);
      types.setTypeParser(1700, Number);
      // Match the JSON shape used by the local PostgreSQL adapter.
      types.setTypeParser(1184, (v) => new Date(v).toISOString());
      const url = new URL(process.env.DATABASE_URL);
      url.searchParams.set("sslmode", "verify-full");
      const pool = new Pool({
        connectionString: url.toString(),
        max: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 15000,
        allowExitOnIdle: true,
        enableChannelBinding: true,
      });
      pool.on("error", () => console.error("Database connection interrupted"));
      const transaction = async <T>(fn: (tx: Tx) => Promise<T>): Promise<T> => {
        const client = await pool.connect();
        // A checked-out client emits its own socket errors, not the pool's.
        let connectionError: Error | undefined;
        const onConnectionError = (error: Error) => {
          connectionError = error;
        };
        client.on("error", onConnectionError);
        try {
          await client.query("BEGIN");
          await client.query("SET LOCAL search_path TO bagyt, public");
          const tx: Tx = {
            query: async (sql, params) => ({
              rows: (await client.query(sql, params)).rows,
            }),
            exec: (sql) => client.query(sql),
          };
          const result = await fn(tx);
          await client.query("COMMIT");
          return result;
        } catch (error) {
          try {
            await client.query("ROLLBACK");
          } catch (rollbackError) {
            connectionError = rollbackError as Error;
          }
          throw error;
        } finally {
          client.removeListener("error", onConnectionError);
          client.release(connectionError);
        }
      };
      return {
        transaction,
        query: (sql, params) => transaction((tx) => tx.query(sql, params)),
        exec: (sql) => transaction((tx) => tx.exec(sql)),
      };
    }
    const dir = path.resolve(
      /* turbopackIgnore: true */ process.env.BAGYT_DATA_DIR || "data/postgres",
    );
    await mkdir(dir, { recursive: true });
    const pg = new PGlite(dir);
    await pg.waitReady;
    await pg.exec(
      await readFile(path.resolve("migrations/001_initial.sql"), "utf8"),
    );
    await pg.exec(
      await readFile(path.resolve("migrations/002_connections.sql"), "utf8"),
    );
    return pg;
  })());
}
export async function tenant<T>(orgId: string, fn: (tx: Tx) => Promise<T>) {
  const pg = await db();
  return pg.transaction(async (tx) => {
    await tx.query("SELECT set_config('bagyt.org_id',$1,true)", [orgId]);
    await tx.exec("SET LOCAL ROLE bagyt_tenant");
    return fn(tx);
  });
}
export const uid = () => randomUUID();
export async function audit(
  tx: Tx,
  ctx: Context,
  action: string,
  id?: string,
  detail: unknown = {},
) {
  await tx.query(
    "INSERT INTO audit_logs(id,org_id,user_id,action,entity_id,detail) VALUES($1,$2,$3,$4,$5,$6)",
    [
      uid(),
      ctx.org_id,
      ctx.user_id,
      action,
      id || null,
      JSON.stringify(detail),
    ],
  );
}
export function normalize<T>(rows: unknown[]): T[] {
  return JSON.parse(
    JSON.stringify(rows, (_, v) => (typeof v === "bigint" ? Number(v) : v)),
  );
}
