import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const { Client } = pg;

function getClient() {
  if (process.env.POSTGRES_HOST) {
    return new Client({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      port: 5432,
      ssl: { rejectUnauthorized: false },
    });
  }

  if (!process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error(
      "Missing Postgres connection details. Set POSTGRES_HOST/USER/PASSWORD/DATABASE or POSTGRES_URL_NON_POOLING in .env.local.",
    );
  }

  return new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false },
  });
}

async function main() {
  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migrations found.");
    return;
  }

  const client = getClient();
  await client.connect();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    await client.query(sql);
    console.log(`Applied ${file}`);
  }

  const tables = await client.query(
    "select tablename from pg_tables where schemaname = 'public' and tablename in ('company_settings','surveys','survey_areas','survey_photos') order by tablename",
  );

  console.log(
    "Survey tables:",
    tables.rows.map((row) => row.tablename).join(", ") || "none",
  );

  await client.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
