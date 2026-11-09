import { useEffect, useState } from 'react';
import { contactApi } from '../lib/api.js';

/**
 * Các yêu cầu của tài khoản đang đăng nhập (mới nhất trước), lấy từ GET /api/contact/mine.
 * @returns {{ status: 'loading'|'ready'|'error', items: Array<object>, message?: string }}
 */
export function useMyRequests() {
  const [state, setState] = useState({ status: 'loading', items: [] });

  useEffect(() => {
    let isCurrent = true;
    contactApi
      .mine()
      .then(({ requests }) => { if (isCurrent) setState({ status: 'ready', items: requests }); })
      .catch((error) => { if (isCurrent) setState({ status: 'error', items: [], message: error.message }); });
    return () => { isCurrent = false; };
  }, []);

  return state;
}
