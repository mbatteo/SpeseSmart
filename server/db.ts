import 'dotenv/config';
import * as schema from '@shared/schema';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL deve essere impostato nel file .env");
}

const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

let pool: any;
let db: any;

if (isLocal) {
  console.log('🐳 Usando driver PostgreSQL per database locale (Docker)');

  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  db = drizzle(pool, { schema });

} else {
  console.log('☁️ Usando driver Neon per database di produzione');

  const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');

  neonConfig.webSocketConstructor = ws;

  pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
  });

  db = drizzle({ client: pool, schema });
}

export { pool, db };

export async function testConnection() {
  try {
    if (isLocal) {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as timestamp, current_user as user');
      client.release();
      console.log('✅ Database Postgres locale connesso:', result.rows[0]);
    } else {
      const result = await pool.query('SELECT NOW() as timestamp');
      console.log('✅ Database Neon connesso:', result.rows[0]);
    }
    return true;
  } catch (error: any) {
    console.error('❌ Errore database:', error.message || error);
    return false;
  }
}

console.log('🌐 Connecting to DB at:', process.env.DATABASE_URL);
