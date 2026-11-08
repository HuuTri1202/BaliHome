import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contact.routes.js';
import servicesRoutes from './routes/services.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFound, errorHandler } from './middleware/error.js';
import { trustEdgeClientIp } from './middleware/clientIp.js';

export const app = express();

app.set('trust proxy', env.TRUST_PROXY);      // đứng sau proxy (Vite / Render) → lấy đúng IP người dùng
app.use(trustEdgeClientIp(env.PROXY_SECRET));  // request đi qua Cloudflare Worker → IP thật của khách
app.disable('x-powered-by');
app.use(helmet());                             // các header bảo mật mặc định (CSP, HSTS, ...)
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10kb' }));      // chặn payload quá lớn
app.use(cookieParser());

// Kiểm tra sức khoẻ: server + database (Render dùng để biết app đã sẵn sàng)
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', notFound);

/* ---------- Production: phục vụ luôn frontend đã build (client/dist) ----------
 * Web + API chung 1 domain → cookie httpOnly hoạt động, không cần CORS. */
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (existsSync(clientDist)) {
  // File trong /assets có hash trong tên → cache 1 năm
  app.use('/assets', express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  // Mọi route còn lại (/dang-nhap, /tai-khoan, ...) → index.html để React Router xử lý
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);
