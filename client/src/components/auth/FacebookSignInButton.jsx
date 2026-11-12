import { useEffect, useState } from 'react';
import { loadFacebookSdk, loginWithFacebook } from '../../lib/facebookSdk.js';

const BUTTON_HEIGHT_PX = 44; // cao bằng nút Google "large" để 2 nút thẳng hàng

/** Logo "f" trắng trên nền xanh Facebook, theo quy chuẩn thương hiệu của Meta */
function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.91v-8.43H7.08v-3.48h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.33l-.53 3.48h-2.8V24C19.61 23.08 24 18.09 24 12.07Z" />
    </svg>
  );
}

/**
 * Nút "Tiếp tục với Facebook". SDK tải sẵn khi nút hiện; bị chặn (adblock) thì nút tự ẩn.
 * @param {{ appId: string, label: string, onAccessToken: (accessToken: string) => void, isBusy?: boolean }} props
 */
export default function FacebookSignInButton({ appId, label, onAccessToken, isBusy = false }) {
  const [status, setStatus] = useState('loading'); // loading | ready | unavailable

  useEffect(() => {
    let isCurrent = true;
    loadFacebookSdk(appId)
      .then(() => isCurrent && setStatus('ready'))
      .catch(() => isCurrent && setStatus('unavailable'));
    return () => { isCurrent = false; };
  }, [appId]);

  if (status === 'unavailable') return null;

  const onClick = () => loginWithFacebook((accessToken) => accessToken && onAccessToken(accessToken));

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status !== 'ready' || isBusy}
      aria-busy={status === 'loading' || isBusy || undefined}
      style={{ minHeight: BUTTON_HEIGHT_PX }}
      className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#1877F2] px-5 text-[15px] font-semibold text-white transition-[background-color,opacity] hover:bg-[#166FE5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FacebookLogo />
      {label}
    </button>
  );
}
