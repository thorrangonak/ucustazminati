import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await connection.execute(
  "SELECT id, email, name, role, emailVerified, passwordHash IS NOT NULL as hasPassword, LENGTH(passwordHash) as hashLength, resetPasswordToken, resetPasswordExpires FROM users WHERE email = 'ykozdogan1@gmail.com'"
);

console.log('Admin User:');
console.log(JSON.stringify(rows[0], null, 2));

await connection.end();
