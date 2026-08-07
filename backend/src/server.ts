import 'dotenv/config';
import app from './app';
import { pool } from './database/pool';

const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, () => {
  console.log(`EcoTrack backend listening on port ${port}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async (err) => {
    if (err) {
      console.error('Error while closing HTTP server', err);
      process.exitCode = 1;
    }
    await pool.end();
    process.exit();
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
