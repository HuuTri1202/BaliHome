/**
 * Nâng / hạ quyền quản trị cho 1 tài khoản đã đăng ký.
 *   node --env-file=.env scripts/make-admin.js ban@email.com          → ADMIN
 *   node --env-file=.env scripts/make-admin.js ban@email.com --revoke → USER
 * Chạy trên production: đặt DATABASE_URL của Neon trước khi chạy (không lưu vào file).
 */
import { PrismaClient } from '@prisma/client';

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error('Cách dùng: node --env-file=.env scripts/make-admin.js <email> [--revoke]');
  process.exit(1);
}

const prisma = new PrismaClient();
const role = flag === '--revoke' ? 'USER' : 'ADMIN';
try {
  const user = await prisma.user.update({
    where: { email: email.trim().toLowerCase() },
    data: { role },
    select: { email: true, fullName: true, role: true },
  });
  console.log(`✔ ${user.fullName} <${user.email}> → ${user.role}`);
} catch (err) {
  if (err.code === 'P2025') console.error(`✘ Không tìm thấy tài khoản ${email}. Hãy đăng ký trên website trước.`);
  else console.error(err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
