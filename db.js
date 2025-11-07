import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432
});

// Test the connection
try {
  const client = await pool.connect();
  console.log('Database connected successfully');
  client.release();
} catch (err) {
  console.error('Database connection failed:', err);
}

export default pool;
