import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("linkedin-repository.db");
const db = drizzle(sqlite);

async function runMigrations() {
  console.log("Running migrations...");
  migrate(db, { migrationsFolder: "./drizzle/migrations" });
  console.log("Migrations complete!");
}

runMigrations();
