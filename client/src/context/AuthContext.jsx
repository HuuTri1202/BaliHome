import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../lib/api.js';

/**
 * Trạng thái đăng nhập toàn app.
 * status: 'loading' (đang kiểm tra phiên) | 'authenticated' | 'guest'
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const applyUser = useCallback((u) => {
    setUser(u);
    setStatus(u ? 'authenticated' : 'guest');
  }, []);

  // Mở trang → hỏi server phiên hiện tại (cookie tự gửi kèm)
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then(({ user }) => !cancelled && applyUser(user))
      .catch(() => !cancelled && applyUser(null));
    return () => { cancelled = true; };
  }, [applyUser]);

  const login = useCallback(async (payload) => {
    const { user } = await authApi.login(payload);
    applyUser(user);
    return user;
  }, [applyUser]);

  const register = useCallback(async (payload) => {
    const { user } = await authApi.register(payload);
    applyUser(user);
    return user;
  }, [applyUser]);

  /** credential: ID token từ nút Google; server tự xác minh rồi đăng nhập / tạo tài khoản */
  const loginWithGoogle = useCallback(async (payload) => {
    const { user } = await authApi.google(payload);
    applyUser(user);
    return user;
  }, [applyUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      applyUser(null);
    }
  }, [applyUser]);

  // Sau khi sửa hồ sơ / đổi mật khẩu: cập nhật user hiện tại mà không cần gọi lại /me
  const updateUser = useCallback((u) => applyUser(u), [applyUser]);

  const value = useMemo(
    () => ({ user, status, isAdmin: user?.role === 'ADMIN', login, register, loginWithGoogle, logout, updateUser }),
    [user, status, login, register, loginWithGoogle, logout, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>');
  return ctx;
}
