import { put } from "@vercel/blob";
import { readFile } from "fs/promises";
import path from "path";
import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = "libsql://linkedin-vault-emilychang1997.aws-us-west-2.turso.io";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_AUTH_TOKEN) {
  console.error("Missing TURSO_AUTH_TOKEN env var");
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN env var");
  process.exit(1);
}

const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

const { rows } = await turso.execute("SELECT id, file_name, file_path, file_type FROM attachments");

for (const row of rows) {
  const filePath = String(row.file_path);

  // Skip if already a Blob URL
  if (filePath.startsWith("https://")) {
    console.log(`Skipping ${row.file_name} (already a URL)`);
    continue;
  }

  const localPath = path.join(process.cwd(), "public", filePath);
  console.log(`Uploading ${row.file_name}...`);

  try {
    const fileBuffer = await readFile(localPath);
    const fileName = path.basename(filePath);
    const blob = await put(fileName, fileBuffer, {
      access: "public",
      contentType: String(row.file_type),
    });

    await turso.execute({
      sql: "UPDATE attachments SET file_path = ? WHERE id = ?",
      args: [blob.url, row.id],
    });

    console.log(`  ✓ ${row.file_name} → ${blob.url}`);
  } catch (err) {
    console.error(`  ✗ Failed to migrate ${row.file_name}:`, err.message);
  }
}

console.log("\nMigration complete!");
