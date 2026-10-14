import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { Pool } from "pg";
import { db } from "../src/lib/db";

test("a broken transaction keeps its original error, discards the client and never retries a write", async (t) => {
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://test:test@localhost:1/test";
  const globalCache = globalThis as { bagytDb?: unknown };
  delete globalCache.bagytDb;
  const socketError = new Error("socket reset");
  const released: Array<Error | undefined> = [];
  let connections = 0,
    writes = 0;
  t.mock.method(Pool.prototype, "connect", async () => {
    const failed = connections++ === 0;
    const client = Object.assign(new EventEmitter(), {
      async query(sql: string) {
        if (failed && sql === "INSERT TEST") {
          writes++;
          client.emit("error", socketError);
          throw socketError;
        }
        if (failed && sql === "ROLLBACK") throw new Error("not queryable");
        return { rows: sql === "SELECT TEST" ? [{ ok: true }] : [] };
      },
      release(error?: Error) {
        released.push(error);
      },
    });
    return client;
  });
  try {
    const database = await db();
    await assert.rejects(
      database.query("INSERT TEST"),
      (error) => error === socketError,
    );
    assert.equal(writes, 1);
    assert.ok(released[0] instanceof Error);
    assert.deepEqual((await database.query("SELECT TEST")).rows, [
      { ok: true },
    ]);
    assert.equal(connections, 2);
    assert.equal(released[1], undefined);
  } finally {
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
    delete globalCache.bagytDb;
    t.mock.restoreAll();
  }
});
