import { useCallback } from 'react';
import GoogleSignInButton from './GoogleSignInButton.jsx';
import FacebookSignInButton from './FacebookSignInButton.jsx';

const LABELS = {
  login: { google: 'signin_with', facebook: 'Đăng nhập bằng Facebook' },
  register: { google: 'signup_with', facebook: 'Đăng ký bằng Facebook' },
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

/**
 * Các nút đăng nhập bằng mạng xã hội đang được bật trên server. Chưa bật cái nào → không hiện gì.
 * @param {{ providers: { google: { clientId: string }|null, facebook: { appId: string }|null }|undefined,
 *           mode: 'login'|'register', isBusy: boolean,
 *           onToken: (provider: 'google'|'facebook', payload: object) => void }} props
 */
export default function SocialSignIn({ providers, mode, isBusy, onToken }) {
  const onGoogleCredential = useCallback((credential) => onToken('google', { credential }), [onToken]);
  const onFacebookToken = useCallback((accessToken) => onToken('facebook', { accessToken }), [onToken]);
  const { google, facebook } = providers ?? {};
  if (!google && !facebook) return null;

  const labels = LABELS[mode];
  return (
    <>
      <OrDivider />
      {/* Nút Google tối đa 400px (giới hạn của Google) → nút Facebook cùng bề rộng, canh giữa để 2 nút thẳng hàng */}
      <div className="grid justify-items-center gap-3 [&>*]:w-full [&>*]:max-w-[400px]">
        {google && <GoogleSignInButton clientId={google.clientId} text={labels.google} onCredential={onGoogleCredential} />}
        {facebook && <FacebookSignInButton appId={facebook.appId} label={labels.facebook} onAccessToken={onFacebookToken} isBusy={isBusy} />}
      </div>
    </>
  );
}
