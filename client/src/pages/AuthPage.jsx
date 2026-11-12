import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle.jsx';
import Alert from '../components/ui/Alert.jsx';
import { AuthBrandHeader, AuthBrandPanel } from '../components/auth/AuthBrandPanel.jsx';
import AuthTabs from '../components/auth/AuthTabs.jsx';
import AuthSupport from '../components/auth/AuthSupport.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useGoogleClientId } from '../lib/googleIdentity.js';

const COPY = {
  login: { title: 'Chào mừng trở lại', subtitle: 'Đăng nhập để theo dõi yêu cầu và trò chuyện với Bali Home.', googleText: 'signin_with' },
  register: { title: 'Tạo tài khoản', subtitle: 'Chưa đến 1 phút để theo dõi mọi yêu cầu của bạn ở một nơi.', googleText: 'signup_with' },
};

function OrDivider() {
  return (
    <div className="flex items-center gap-4 text-sm text-ink-2" role="separator" aria-label="hoặc">
      <span className="h-px flex-1 bg-ink/10" />
      hoặc
      <span className="h-px flex-1 bg-ink/10" />
    </div>
  );
}

/** Sau khi vào được tài khoản: về trang khách định vào trước đó (nếu có), mặc định là trang tài khoản */
function useGoToAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(
    (state) => navigate(location.state?.from?.pathname ?? '/tai-khoan', { replace: true, state }),
    [navigate, location.state]
  );
}

/**
 * /dang-nhap và /dang-ky — một trang, hai tab.
 * Desktop: nửa trái thương hiệu (nền tối), nửa phải form. Điện thoại: dải thương hiệu gọn phía trên, form ngay bên dưới.
 * @param {{ mode: 'login'|'register' }} props
 */
export default function AuthPage({ mode }) {
  const { loginWithGoogle } = useAuth();
  const goToAccount = useGoToAccount();
  const googleClientId = useGoogleClientId();
  const [remember, setRemember] = useState(true);
  const [googleError, setGoogleError] = useState('');
  const copy = COPY[mode];
  const isLogin = mode === 'login';

  const onGoogleCredential = useCallback(
    async (credential) => {
      setGoogleError('');
      try {
        await loginWithGoogle({ credential, remember: isLogin && remember });
        goToAccount(isLogin ? undefined : { welcome: true });
      } catch (err) {
        setGoogleError(err.message);
      }
    },
    [loginWithGoogle, goToAccount, isLogin, remember]
  );

  return (
    <div className="flex min-h-dvh flex-col bg-ground-2 lg:flex-row">
      <AuthBrandPanel />
      <AuthBrandHeader actions={<ThemeToggle />} />

      {/* Điện thoại: chính vùng này là "thẻ" trồi lên che mép dải tối. Từ sm: nền nhạt, form nằm trong thẻ riêng. */}
      <main className="relative -mt-8 flex flex-1 flex-col rounded-t-[28px] bg-ground px-5 pb-8 pt-6 sm:bg-ground-2 sm:px-8 sm:pt-4 lg:mt-0 lg:rounded-none lg:px-10 lg:py-6">
        {/* "Quay lại trang chủ" nằm ở nửa trái (desktop) và dải tối (điện thoại) */}
        <div className="hidden justify-end lg:flex">
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center lg:py-8">
          <div className="sm:rounded-[28px] sm:bg-ground sm:p-8 sm:shadow-[0_24px_60px_-28px_rgb(11_21_51/0.35)] sm:ring-1 sm:ring-ink/5">
            <AuthTabs mode={mode} />

            {/* key: đổi tab → nội dung hiện lại với hiệu ứng trồi lên */}
            <div key={mode} className="animate-rise">
              <h1 className="mt-7 font-display text-[2rem] leading-[1.1] sm:text-[2.25rem]">{copy.title}</h1>
              <p className="mt-2 text-[15px] text-ink-2">{copy.subtitle}</p>

              <div className="mt-6 grid gap-5">
                <Alert>{googleError}</Alert>
                {isLogin ? (
                  <LoginForm remember={remember} onRememberChange={setRemember} isGoogleEnabled={Boolean(googleClientId)} onSuccess={() => goToAccount()} />
                ) : (
                  <RegisterForm onSuccess={() => goToAccount({ welcome: true })} />
                )}
                {googleClientId && (
                  <>
                    <OrDivider />
                    <GoogleSignInButton clientId={googleClientId} text={copy.googleText} onCredential={onGoogleCredential} />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <AuthSupport />
          </div>
        </div>
      </main>
    </div>
  );
}
