import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function check() {
  const connectionString = process.env.DATABASE_URL!;
  console.log("Checking connection to:", connectionString.split("@")[1]);
  const pool = new Pool({ connectionString });
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT current_database()");
    console.log("Connected to database:", res.rows[0].current_database);
    await client.release();
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await pool.end();
  }
}

check();
