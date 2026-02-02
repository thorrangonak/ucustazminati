import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const result = await db.select().from(users).where(eq(users.email, 'ykozdogan1@gmail.com'));
console.log('Admin User:', JSON.stringify(result[0], null, 2));

await connection.end();
