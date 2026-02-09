import { Server } from 'http';
import app from './app';
import config from './config';
import { seedAdmin } from './app/helper/seedAdmin';
import redis from './app/helper/redis';

async function bootstrap() {
  let server: Server;

  try {
    // ✅ Step 1: Seed the Admin before server starts
    // await seedAdmin();

     const pong = await redis.ping();

      if (pong === 'PONG') {
        console.log('✅ Redis connection successful');
      } else {
        console.error('❌ Redis connection failed');
        process.exit(1);
      }

    // ✅ Step 2: Start the server
    server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
    });

    // ✅ Step 3: Graceful shutdown handlers
    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log('🛑 Server closed gracefully.');
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    // Handle unhandled rejections
    process.on('unhandledRejection', (error) => {
      console.log('💥 Unhandled Rejection detected, closing server...');
      if (server) {
        server.close(() => {
          console.error(error);
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    // Optional: Handle SIGTERM for Docker / PM2 graceful stop
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received.');
      if (server) server.close();
    });
  } catch (error) {
    console.error('❌ Error during server startup:', error);
    process.exit(1);
  }
}

bootstrap();
