// Run with: node --env-file=.env.local scripts/migrate.mjs
import pg from "pg";
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

await client.connect();
await client.query(sql);
console.log("✓ schema applied");
await client.end();
