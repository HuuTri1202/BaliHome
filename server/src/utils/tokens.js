import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const JWT_OPTS = { issuer: 'balihome', audience: 'balihome-web' };

/** Access token: JWT ngắn hạn, không lưu DB, chỉ chứa id + role */
export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    ...JWT_OPTS,
    expiresIn: `${env.ACCESS_TOKEN_TTL_MIN}m`,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { ...JWT_OPTS, algorithms: ['HS256'] });
}

/** Refresh token: chuỗi ngẫu nhiên 384-bit (không phải JWT), DB chỉ lưu bản băm */
export const generateRefreshToken = () => crypto.randomBytes(48).toString('base64url');

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
