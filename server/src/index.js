import { env } from './config/env.js';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 API Bali Home chạy tại http://localhost:${env.PORT}  (${env.NODE_ENV})`);
});

// Tắt êm: ngừng nhận request mới, đóng kết nối DB
const shutdown = (signal) => {
  console.log(`\n${signal} → đang tắt server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
