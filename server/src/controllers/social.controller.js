import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { createGoogleVerifier } from '../lib/googleIdToken.js';
import { createFacebookVerifier } from '../lib/facebookToken.js';
import { signPendingSignup, verifyPendingSignup } from '../lib/pendingSignup.js';
import { completeSignup, listIdentities, signInWithProvider } from '../services/identity.service.js';
import { toPublicUser } from '../services/auth.service.js';
import { issueTokens } from './auth.controller.js';

/* Đăng nhập bằng Google / Facebook. Mỗi nhà cung cấp chỉ bật khi đã cấu hình đủ biến môi trường. */
const verifyGoogle = env.GOOGLE_CLIENT_ID ? createGoogleVerifier({ clientId: env.GOOGLE_CLIENT_ID }) : null;
const verifyFacebook =
  env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET ? createFacebookVerifier({ appId: env.FACEBOOK_APP_ID, appSecret: env.FACEBOOK_APP_SECRET }) : null;

const disabled = (label) => new AppError(503, 'PROVIDER_DISABLED', `Đăng nhập bằng ${label} chưa được bật.`);

/** Đã có tài khoản → đăng nhập. Nhà cung cấp không trả email → trả phiếu tạm để khách nhập email. */
async function signInOrAskEmail(req, res, profile) {
  const user = await signInWithProvider(profile);
  if (!user) {
    res.json({ needsEmail: true, pendingToken: signPendingSignup(profile), name: profile.name });
    return;
  }
  await issueTokens(req, res, user, req.body.remember);
  res.json({ user: toPublicUser(user) });
}

// GET /api/auth/providers — cách đăng nhập đang bật (Client ID Google / App ID Facebook là thông tin công khai)
export function providers(_req, res) {
  res.json({
    google: verifyGoogle ? { clientId: env.GOOGLE_CLIENT_ID } : null,
    facebook: verifyFacebook ? { appId: env.FACEBOOK_APP_ID } : null,
  });
}

// POST /api/auth/google — { credential: ID token từ Google Sign-In, remember }
export async function googleSignIn(req, res) {
  if (!verifyGoogle) throw disabled('Google');
  const profile = await verifyGoogle(req.body.credential);
  // lib/googleIdToken.js chỉ chấp nhận email_verified = true
  await signInOrAskEmail(req, res, { provider: 'google', ...profile, emailVerified: true });
}

// POST /api/auth/facebook — { accessToken: từ Facebook JS SDK, remember }
export async function facebookSignIn(req, res) {
  if (!verifyFacebook) throw disabled('Facebook');
  const profile = await verifyFacebook(req.body.accessToken);
  // Graph API không cho biết email đã xác minh hay chưa → không dùng để nối vào tài khoản có sẵn
  await signInOrAskEmail(req, res, { provider: 'facebook', ...profile, emailVerified: false });
}

// POST /api/auth/complete-signup — { pendingToken, email, remember }: tạo tài khoản mới với email khách tự nhập
export async function completeSocialSignup(req, res) {
  const pending = verifyPendingSignup(req.body.pendingToken);
  const user = await completeSignup({ ...pending, email: req.body.email });
  await issueTokens(req, res, user, req.body.remember);
  res.status(201).json({ user: toPublicUser(user) });
}

// GET /api/auth/identities — tài khoản Google/Facebook đã liên kết (trang Bảo mật)
export async function identities(req, res) {
  res.json({ identities: await listIdentities(req.auth.userId) });
}
