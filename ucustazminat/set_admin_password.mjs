import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Yeni şifre: Admin123!
const newPassword = 'Admin123!';
const hashedPassword = await bcrypt.hash(newPassword, 10);

console.log('Setting password for ykozdogan1@gmail.com...');
console.log('New password: Admin123!');
console.log('Hashed password length:', hashedPassword.length);

const [result] = await connection.execute(
  "UPDATE users SET passwordHash = ?, emailVerified = 1 WHERE email = 'ykozdogan1@gmail.com'",
  [hashedPassword]
);

console.log('Update result:', result);

// Verify the update
const [rows] = await connection.execute(
  "SELECT id, email, name, role, emailVerified, passwordHash IS NOT NULL as hasPassword, LENGTH(passwordHash) as hashLength FROM users WHERE email = 'ykozdogan1@gmail.com'"
);

console.log('\nUpdated Admin User:');
console.log(JSON.stringify(rows[0], null, 2));

await connection.end();
