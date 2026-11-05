import { useEffect, useId, useRef, useState } from 'react';

/* =============================================================================
 * Biểu đồ vùng 1 chuỗi (số yêu cầu theo ngày) — SVG thuần, không thêm thư viện.
 * Theo skill dataviz: 1 chuỗi → không cần chú giải (tiêu đề đã nói rõ); đường 2px; lưới mờ;
 * điểm đánh dấu 8px + viền màu nền; di chuột → đường dóng + tooltip; có bảng cho trình đọc màn hình.
 * ========================================================================== */
const HEIGHT = 260;
const PAD = { top: 16, right: 12, bottom: 28, left: 34 };

/** Trần trục Y "đẹp" và số nguyên: 1, 2, 5, 10, 20, 50… */
function niceMax(max) {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 5, 10].find((m) => m * pow >= max / 4) * pow;
  return Math.ceil(max / step) * step;
}

/** Đường cong không vượt quá giá trị thật (điều khiển theo phương ngang) */
function smoothPath(points) {
  return points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = points[i - 1];
    const mx = (px + x) / 2;
    return `${d} C${mx},${py} ${mx},${y} ${x},${y}`;
  }, '');
}

const shortDay = (day) => { const [, m, d] = day.split('-'); return `${d}/${m}`; };

export default function AreaChart({ data, label }) {
  const gradientId = useId();
  const box = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!box.current) return undefined;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const max = niceMax(Math.max(0, ...data.map((d) => d.count)));
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2);
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const points = data.map((d, i) => [x(i), y(d.count)]);
  const line = smoothPath(points);
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const xEvery = Math.max(1, Math.ceil(data.length / (width < 480 ? 4 : 7)));
  const allZero = data.every((d) => d.count === 0);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left - PAD.left) / innerW;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(ratio * (data.length - 1)))));
  };
  const active = hover != null ? data[hover] : null;
  const tipLeft = hover != null ? Math.max(8, Math.min(width - 128, x(hover) - 60)) : 0;

  return (
    <div ref={box} className="relative">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`${label}. Tổng ${data.reduce((s, d) => s + d.count, 0)} yêu cầu trong ${data.length} ngày.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        className="block touch-pan-y"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--action)" stopOpacity="0.38" />
            <stop offset="1" stopColor="var(--action)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--ink)" strokeOpacity="0.07" />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill="var(--ink-2)" className="tabular-nums">{t}</text>
          </g>
        ))}
        {data.map((d, i) => (i % xEvery === 0 ? (
          <text key={d.day} x={x(i)} y={HEIGHT - 8} textAnchor="middle" fontSize="12" fill="var(--ink-2)" className="tabular-nums">{shortDay(d.day)}</text>
        ) : null))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="var(--action)" strokeWidth="2" strokeLinecap="round" />

        {/* Mốc có dữ liệu: chỉ vẽ khi ít điểm để không rối */}
        {data.length <= 31 && points.map(([px, py], i) => (data[i].count > 0 ? (
          <circle key={data[i].day} cx={px} cy={py} r="4" fill="var(--action)" stroke="var(--ground-2)" strokeWidth="2" />
        ) : null))}

        {active && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} stroke="var(--ink)" strokeOpacity="0.35" />
            <circle cx={x(hover)} cy={y(active.count)} r="5" fill="var(--action)" stroke="var(--ground-2)" strokeWidth="2" />
          </g>
        )}
      </svg>

      {active && (
        <div className="pointer-events-none absolute top-1 rounded-xl bg-ground-3 px-3 py-2 text-sm shadow-lg" style={{ left: tipLeft }}>
          <p className="text-ink-2">{shortDay(active.day)}</p>
          <p className="font-semibold tabular-nums">{active.count} yêu cầu</p>
        </div>
      )}

      {allZero && <p className="absolute inset-x-0 top-[38%] text-center text-sm text-ink-2">Chưa có yêu cầu nào trong khoảng thời gian này</p>}

      {/* Bảng cho trình đọc màn hình */}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th>Ngày</th><th>Số yêu cầu</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.day}><td>{shortDay(d.day)}</td><td>{d.count}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
