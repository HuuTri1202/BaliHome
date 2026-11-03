import { lazy, Suspense } from 'react';

// Three.js khá nặng (~500 kB) → tách thành chunk riêng, tải sau khi UI chính đã hiện
const LogoCanvas = lazy(() => import('./LogoCanvas.jsx'));

export default function LazyLogoCanvas(props) {
  return (
    <Suspense fallback={null}>
      <LogoCanvas {...props} />
    </Suspense>
  );
}
