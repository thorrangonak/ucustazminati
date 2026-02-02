import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.match(/host=([^;]+)/)?.[1] || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: process.env.DATABASE_URL?.match(/user=([^;]+)/)?.[1],
  password: process.env.DATABASE_URL?.match(/password=([^;]+)/)?.[1],
  database: process.env.DATABASE_URL?.match(/database=([^;]+)/)?.[1],
  ssl: { rejectUnauthorized: true }
});

const [rows] = await connection.execute(
  'SELECT id, claimNumber, departureAirport, arrivalAirport, isConnecting, connectionAirport, flightNumber, flight2Number, flight2Date FROM claims ORDER BY id DESC LIMIT 5'
);

console.log('Son 5 Talep:');
rows.forEach(row => {
  console.log('---');
  console.log(`ID: ${row.id}, Claim: ${row.claimNumber}`);
  console.log(`Route: ${row.departureAirport} → ${row.arrivalAirport}`);
  console.log(`isConnecting: ${row.isConnecting}, connectionAirport: ${row.connectionAirport}`);
  console.log(`Flight1: ${row.flightNumber}, Flight2: ${row.flight2Number}, Flight2Date: ${row.flight2Date}`);
});

await connection.end();
