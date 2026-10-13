import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { cookies } from "next/headers";
import { db, uid } from "./db";
import type { Context } from "./types";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
export const digest = (v: string) =>
  createHash("sha256").update(v).digest("hex");
export async function createSession(userId: string, orgId: string) {
  const token = randomBytes(32).toString("hex");
  await (
    await db()
  ).query(
    "INSERT INTO sessions(token_hash,user_id,org_id,expires_at) VALUES($1,$2,$3,now()+interval '7 days')",
    [digest(token), userId, orgId],
  );
  (await cookies()).set("bagyt_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true" || !!process.env.VERCEL,
    path: "/",
    maxAge: 7 * 86400,
  });
}
export async function context(): Promise<Context> {
  const token = (await cookies()).get("bagyt_session")?.value;
  if (!token) throw new HttpError(401, "Войдите в аккаунт");
  const result = await (
    await db()
  ).query<Context>(
    "SELECT s.user_id,s.org_id,m.role,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id JOIN memberships m ON m.user_id=s.user_id AND m.org_id=s.org_id WHERE s.token_hash=$1 AND s.expires_at>now()",
    [digest(token)],
  );
  if (!result.rows[0]) throw new HttpError(401, "Сессия истекла");
  return result.rows[0];
}
export function requireRole(ctx: Context, ...roles: string[]) {
  if (!roles.includes(ctx.role))
    throw new HttpError(403, "Недостаточно прав для этого действия");
}
export async function rateLimit(key: string, limit = 20) {
  const pg = await db();
  const r = await pg.query<{ attempts: number }>(
    `INSERT INTO rate_limits(key,attempts,expires_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.attempts+1 END, expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE rate_limits.expires_at END RETURNING attempts`,
    [key],
  );
  if (r.rows[0].attempts > limit)
    throw new HttpError(
      429,
      "Слишком много попыток. Повторите через 15 минут.",
    );
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (req.headers.get("sec-fetch-site") === "cross-site")
    throw new HttpError(403, "Недопустимый источник запроса");
  if (origin) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new HttpError(403, "Недопустимый источник запроса");
    }
    const host = req.headers.get("host") || new URL(req.url).host;
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.host !== host)
      throw new HttpError(403, "Недопустимый источник запроса");
  }
}
export async function createAccount(input: {
  email: string;
  password: string;
  name: string;
  organization: string;
  industry: string;
  city: string;
  employees: number;
  branches: number;
  goal: string;
  channels: string[];
}) {
  const pg = await db();
  const userId = uid(),
    orgId = uid();
  await pg.transaction(async (tx) => {
    const existing = await tx.query("SELECT id FROM users WHERE email=$1", [
      input.email.toLowerCase(),
    ]);
    if (existing.rows.length)
      throw new HttpError(409, "Этот email уже зарегистрирован");
    await tx.query(
      "INSERT INTO users(id,email,name,password_hash) VALUES($1,$2,$3,$4)",
      [
        userId,
        input.email.toLowerCase(),
        input.name,
        hashPassword(input.password),
      ],
    );
    await tx.query(
      "INSERT INTO organizations(id,name,industry,city,employees,branches,goal,channels,webhook_secret) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        orgId,
        input.organization,
        input.industry,
        input.city,
        input.employees,
        input.branches,
        input.goal,
        JSON.stringify(input.channels),
        randomBytes(32).toString("hex"),
      ],
    );
    await tx.query(
      "INSERT INTO memberships(org_id,user_id,role) VALUES($1,$2,'owner')",
      [orgId, userId],
    );
  });
  return { userId, orgId };
}
