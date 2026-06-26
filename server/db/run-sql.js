import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, "..");
const mode = process.argv[2];
const files = {
  schema: resolve(serverDir, "schema.sql"),
  seed: resolve(__dirname, "seed.sql")
};

dotenv.config({ path: resolve(serverDir, ".env") });

if (!files[mode]) {
  console.error("Usage: node server/db/run-sql.js <schema|seed>");
  process.exit(1);
}

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true
};

try {
  const connection = await mysql.createConnection(dbConfig);
  const sql = await readFile(files[mode], "utf8");
  await connection.query(sql);
  console.log(`${mode} SQL completed successfully.`);
  await connection.end();
} catch (err) {
  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    console.error("MySQL login failed.");
    console.error(`Tried user: ${dbConfig.user}`);
    console.error(`Tried host: ${dbConfig.host}:${dbConfig.port}`);
    console.error(`Password provided: ${dbConfig.password ? "yes" : "no"}`);
    console.error("Update DB_USER and DB_PASSWORD in server/.env, then run this command again.");
    process.exit(1);
  }

  throw err;
} finally {
}
