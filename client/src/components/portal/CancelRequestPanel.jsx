import { useId, useState } from 'react';
import { Panel } from './PortalLayout.jsx';
import { TextArea } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import { contactApi } from '../../lib/api.js';

const MAX_REASON_LENGTH = 500;

/**
 * Khách tự huỷ yêu cầu chưa hoàn thành. Hai bước (bấm "Huỷ yêu cầu" → xác nhận) để tránh bấm nhầm.
 * @param {{ request: { id: string, code: string }, onCancelled: () => void }} props
 */
export default function CancelRequestPanel({ request, onCancelled }) {
  const formId = useId();
  const [isConfirming, setIsConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const cancel = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await contactApi.cancelMine(request.id, { reason: reason.trim() || undefined });
      onCancelled();
    } catch (err) {
      setError(err.fields?.reason ?? err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Panel title="Huỷ yêu cầu">
      {!isConfirming ? (
        <div className="grid gap-4">
          <p className="text-[15px] text-ink-2">Không còn nhu cầu? Bạn có thể tự huỷ yêu cầu này. Bali Home sẽ nhận được thông báo; lịch sử trao đổi vẫn được giữ lại.</p>
          <div><Button variant="danger" size="sm" onClick={() => setIsConfirming(true)}>Huỷ yêu cầu</Button></div>
        </div>
      ) : (
        <form id={formId} onSubmit={cancel} className="grid gap-4" aria-label={`Xác nhận huỷ yêu cầu ${request.code}`}>
          <p className="text-[15px] font-semibold">Huỷ yêu cầu {request.code}? Sau khi huỷ, bạn không mở lại được yêu cầu này.</p>
          <Alert>{error}</Alert>
          <TextArea
            label="Lý do huỷ"
            optional
            rows={3}
            maxLength={MAX_REASON_LENGTH}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: đã đổi kế hoạch, muốn gửi yêu cầu khác…"
            hint={`${reason.length}/${MAX_REASON_LENGTH} ký tự`}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="danger" loading={isSubmitting}>Xác nhận huỷ</Button>
            <Button variant="ghost" onClick={() => { setIsConfirming(false); setError(''); }} disabled={isSubmitting}>Không huỷ nữa</Button>
          </div>
        </form>
      )}
    </Panel>
  );
}
