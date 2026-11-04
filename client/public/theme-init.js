// Chạy TRƯỚC khi trang hiển thị để áp dụng sáng/tối ngay → không bị "nháy trắng".
// Để ở file riêng (không inline) vì Content-Security-Policy của server chặn script inline.
(function () {
  try {
    var pref = localStorage.getItem('bh-theme') || 'system';
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) { /* localStorage bị chặn → dùng giao diện sáng */ }
})();
