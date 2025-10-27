
import { useEffect } from 'react';

/**
 * ✅ useClickOutside — TaskNest Standard Hook
 * Đóng popup / modal khi click hoặc chạm ra ngoài vùng ref.
 *
 * @param {React.RefObject} ref - ref của phần tử cần bảo vệ
 * @param {Function} handler - callback khi click ra ngoài
 */
export default function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Nếu ref chưa khởi tạo hoặc click nằm trong ref → bỏ qua
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup khi component unmount
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}