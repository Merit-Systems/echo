import "dotenv/config";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

async function main() {
  const url = process.env.SUPABASE_DB_URL || buildDbUrlFromParts();
  if (!url) {
    throw new Error("Missing SUPABASE_DB_URL or DB connection parts");
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("create schema if not exists public");
    await client.query(
      "create table if not exists public.migrations (id text primary key, applied_at timestamptz not null default now())",
    );

    const dir = join(process.cwd(), "supabase", "migrations");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const id = file;
      const res = await client.query(
        "select 1 from public.migrations where id = $1",
        [id],
      );
      if (res.rowCount && res.rowCount > 0) {
        continue;
      }
      const sql = readFileSync(join(dir, file), "utf8");
      console.log(`Applying migration: ${file}`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into public.migrations (id) values ($1)", [
          id,
        ]);
        await client.query("commit");
      } catch (e) {
        await client.query("rollback");
        throw e;
      }
    }
    console.log("Migrations complete");
  } finally {
    await client.end();
  }
}

function buildDbUrlFromParts(): string | undefined {
  const host = process.env.SUPABASE_DB_HOST;
  const port = process.env.SUPABASE_DB_PORT || "5432";
  const db = process.env.SUPABASE_DB_NAME;
  const user = process.env.SUPABASE_DB_USER;
  const pass = process.env.SUPABASE_DB_PASSWORD;
  if (host && db && user && pass) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
      pass,
    )}@${host}:${port}/${db}`;
  }
  return undefined;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
