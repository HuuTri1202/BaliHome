// Bộ icon SVG nhẹ (stroke = currentColor → đổi màu bằng class text-*)
const Svg = ({ children, className = 'h-5 w-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
       strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
    {children}
  </svg>
);

export const MailIcon = (p) => (<Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>);
export const LockIcon = (p) => (<Svg {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Svg>);
export const UserIcon = (p) => (<Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>);
export const PhoneIcon = (p) => (<Svg {...p}><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></Svg>);
export const EyeIcon = (p) => (<Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Svg>);
export const EyeOffIcon = (p) => (<Svg {...p}><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" /></Svg>);
export const ArrowRightIcon = (p) => (<Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>);
export const ArrowLeftIcon = (p) => (<Svg {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>);
export const CheckIcon = (p) => (<Svg {...p}><path d="m5 12 5 5L20 7" /></Svg>);
export const AlertIcon = (p) => (<Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></Svg>);
export const LogoutIcon = (p) => (<Svg {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" /></Svg>);
export const ShieldIcon = (p) => (<Svg {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></Svg>);
export const SparkIcon = (p) => (<Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></Svg>);
export const CalendarIcon = (p) => (<Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></Svg>);
export const HashIcon = (p) => (<Svg {...p}><path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" /></Svg>);
export const KeyIcon = (p) => (<Svg {...p}><circle cx="8" cy="15" r="4" /><path d="m10.8 12.2 8.7-8.7M17 6l2 2M15 8l2 2" /></Svg>);
export const MonitorIcon = (p) => (<Svg {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></Svg>);
export const CopyIcon = (p) => (<Svg {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Svg>);
export const SunIcon = (p) => (<Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Svg>);
export const MoonIcon = (p) => (<Svg {...p}><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" /></Svg>);
export const PaletteIcon = (p) => (<Svg {...p}><path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.7-.9 1.4-1.8-.4-1.2.4-2.2 1.6-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></Svg>);
export const ClockIcon = (p) => (<Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>);
