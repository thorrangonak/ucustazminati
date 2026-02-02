import { drizzle } from "drizzle-orm/mysql2";
import { desc } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

const result = await db.execute(`SELECT id, openId, email, name, passwordHash IS NOT NULL as hasPassword, role FROM users ORDER BY id DESC LIMIT 5`);

console.log("Users in database:");
console.log(JSON.stringify(result[0], null, 2));

process.exit(0);
