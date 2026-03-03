import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { getDbPool } from './config/db.js';

async function startServer() {
  try {
    const pool = getDbPool();
    await pool.query('SELECT 1');

    const app = createApp();
    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: {
        origin: config.corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
      });
    });

    app.set('io', io);

    server.listen(config.port, () => {
      console.log(`Sprint Board API listening on port ${config.port} (${config.env})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

