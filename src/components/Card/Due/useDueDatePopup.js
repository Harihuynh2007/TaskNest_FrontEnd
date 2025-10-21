import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Hook quản lý logic mở/đóng DueDatePopup qua portal.
 * Giúp InlineDateBlock.compact.jsx chỉ cần gọi openPopup(event, card).
 *
 * @returns {{
 *   isOpen: boolean,
 *   anchorRect: DOMRect | null,
 *   openPopup: (event: MouseEvent, data?: any) => void,
 *   closePopup: () => void,
 *   renderInPortal: (content: ReactNode) => ReactPortal | null
 * }}
 */
export default function useDueDatePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const [container] = useState(() => {
    const el = document.createElement('div');
    el.id = 'due-date-portal';
    return el;
  });

  // mount portal container to body
  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      try {
        document.body.removeChild(container);
      } catch {
        /* ignore */
      }
    };
  }, [container]);

  /** Mở popup dựa trên toạ độ nút Dates */
  const openPopup = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
    setIsOpen(true);
  }, []);

  /** Đóng popup */
  const closePopup = useCallback(() => {
    setIsOpen(false);
    setAnchorRect(null);
  }, []);

  /** Đóng khi click ngoài popup */
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e) => {
      // kiểm tra xem click nằm ngoài anchor + popup
      const popup = document.querySelector('.tasknest-due-popup');
      const anchorEl = document.querySelector('.tasknest-due-trigger');
      if (!popup || popup.contains(e.target)) return;
      if (anchorEl && anchorEl.contains(e.target)) return;
      closePopup();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, closePopup]);

  /** Đóng khi nhấn ESC */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => e.key === 'Escape' && closePopup();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closePopup]);

  /** Render popup vào portal */
  const renderInPortal = useCallback(
    (content) => {
      if (!isOpen) return null;
      return createPortal(content, container);
    },
    [isOpen, container]
  );

  return { isOpen, anchorRect, openPopup, closePopup, renderInPortal };
}
