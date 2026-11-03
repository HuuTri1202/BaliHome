import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

// Một PrismaClient duy nhất cho cả app (mỗi client giữ 1 connection pool riêng)
export const prisma = new PrismaClient({
  log: env.isProd ? ['error'] : ['warn', 'error'],
});
