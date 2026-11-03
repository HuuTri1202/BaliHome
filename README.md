# Bali Home — Website

React + Vite + Tailwind CSS v4 · Node.js + Express 5 · PostgreSQL + Prisma

```
Bali/
├── client/            # Frontend (Vite, cổng 5173)
│   └── src/
│       ├── components/   # UI dùng chung, AuthLayout, Navbar, LogoCanvas (3D)
│       ├── context/      # AuthContext: trạng thái đăng nhập toàn app
│       ├── hooks/        # useForm: validate + lỗi server + focus ô lỗi
│       ├── lib/          # api.js (tự refresh token), validators.js
│       ├── pages/        # Home, Login, Register, Account, 404
│       └── three/        # Logo3D.js (Three.js thuần)
├── server/            # Backend (Express, cổng 4000)
│   ├── prisma/schema.prisma
│   └── src/  config · controllers · middleware · routes · services · utils · validators
├── prototype/         # Bản HTML thử nghiệm ban đầu (tham khảo)
└── docker-compose.yml # PostgreSQL 16
```

## Chạy lần đầu

```bash
npm install          # cài cho cả client & server
npm run db:up        # bật PostgreSQL bằng Docker (cần mở Docker Desktop trước)
npm run db:migrate   # tạo bảng (lần đầu sẽ hỏi tên migration, gõ: init)
npm run dev          # chạy API :4000 + web :5173
```

Mở http://localhost:5173

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy cả backend + frontend |
| `npm run db:studio` | Giao diện xem/sửa dữ liệu (Prisma Studio) |
| `npm run db:migrate` | Sau khi sửa `schema.prisma` |
| `npm run db:down` | Tắt PostgreSQL |

## API xác thực

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| POST | `/api/auth/register` | `{ fullName, email, phone?, password }` → tạo tài khoản + đăng nhập |
| POST | `/api/auth/login` | `{ email, password, remember? }` |
| POST | `/api/auth/refresh` | Đổi refresh token lấy access token mới (xoay vòng) |
| POST | `/api/auth/logout` | Thu hồi phiên hiện tại |
| GET | `/api/auth/me` | Thông tin người dùng đang đăng nhập |
| GET | `/api/health` | Kiểm tra server + database |

Lỗi luôn có dạng: `{ "error": { "code", "message", "fields"? } }`

## Bảo mật đã áp dụng

- Mật khẩu băm **bcrypt (12 rounds)**; so sánh thời gian cố định để không lộ email nào đã đăng ký.
- **Access token JWT 15 phút** + **refresh token 7/30 ngày**, cả hai trong **cookie httpOnly, SameSite=Lax** (Secure khi production).
- Refresh token chỉ lưu **SHA-256** trong DB, **xoay vòng** mỗi lần dùng; dùng lại token cũ → thu hồi mọi phiên của user.
- **Rate limit** 10 lần / 15 phút / IP cho đăng nhập & đăng ký; `helmet`, giới hạn body 10 kB.
- Validate 2 lớp: client (phản hồi tức thì) + server (Zod, nguồn sự thật).

## Deploy (Render + Neon)

Production chạy **1 service**: Express phục vụ cả API (`/api/*`) lẫn frontend đã build (`client/dist`).
Cấu hình nằm trong [render.yaml](render.yaml); `npm start` tự chạy `prisma migrate deploy` trước khi khởi động.

1. **Neon** (neon.tech) → tạo project, region Singapore → copy *connection string* (bỏ chọn "Connection pooling").
2. **GitHub** → tạo repo trống → `git remote add origin <url>` → `git push -u origin main`.
3. **Render** (render.com) → New → **Blueprint** → chọn repo → nhập:
   - `DATABASE_URL` = connection string của Neon
   - `CLIENT_ORIGIN` = `https://<tên-service>.onrender.com`
4. Đợi build xong (~3–5 phút) → mở URL. Từ đó mỗi lần `git push` Render tự deploy lại.

Gói free của Render ngủ sau 15 phút không có truy cập; lần mở đầu tiên sau đó mất ~30–60 giây.
