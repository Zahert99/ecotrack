import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const pool = new Pool({
  connectionString,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // return an error after 2 seconds if connection could not be established
});

pool.on('error', (err) => {
  // Fired when an idle client in the pool hits an unexpected error
  // (e.g. the DB restarts or drops the connection). Without this
  // handler, Node treats it as an unhandled 'error' event and crashes
  // the process anyway — this just lets us log first.
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(1);
});
