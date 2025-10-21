import React, { useState, useEffect } from 'react';
import { FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useDueDatePopup from './useDueDatePopup';
import DueDatePopup from './DueDatePopup';

/**
 * InlineDateBlock.compact.jsx
 * Hiển thị và quản lý phần Dates (Start/Due) trong FullCardModal
 * - Giao diện nhỏ gọn, dark-premium, gradient
 * - Khi click mở popup (portal)
 * - Hiển thị trạng thái Active / Overdue
 */
export default function InlineDateBlock({ card, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(''); // Active | Overdue | None

  const { isOpen, anchorRect, openPopup, closePopup, renderInPortal } = useDueDatePopup();

  /** Xác định trạng thái hạn */
  useEffect(() => {
    if (!card?.due_date) {
      setStatus('');
      return;
    }
    const due = new Date(card.due_date);
    const now = new Date();
    if (due < now) setStatus('Overdue');
    else setStatus('Active');
  }, [card?.due_date]);

  // --- Auto refresh status mỗi phút ---
  useEffect(() => {
    const timer = setInterval(() => {
        if (card?.due_date) {
        const due = new Date(card.due_date);
        const now = new Date();
        setStatus(due < now ? 'Overdue' : 'Active');
        }
    }, 60000); // 1 phút
    return () => clearInterval(timer);
    }, [card?.due_date]);

  /** Feedback Saved ✓ */
  const handleUpdated = (payload) => {
    onUpdated?.(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={container}>
      {/* Header (click to toggle popup) */}
      <div
        className="tasknest-due-trigger"
        style={header}
        onClick={(e) => {
          setExpanded(!expanded);
          openPopup(e);
        }}
      >
        <FiCalendar size={14} />
        <span style={{ fontWeight: 600 }}>Dates</span>

        {status && (
            <span
                title={
                status === 'Overdue'
                    ? `This task was due on ${new Date(card.due_date).toLocaleString()}`
                    : `Due on ${new Date(card.due_date).toLocaleString()}`
                }
                style={{
                marginLeft: 'auto',
                background:
                    status === 'Overdue'
                    ? 'rgba(239,68,68,0.12)'
                    : 'rgba(59,130,246,0.15)',
                color: status === 'Overdue' ? '#f87171' : '#60a5fa',
                padding: '2px 6px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                border:
                    status === 'Overdue'
                    ? '1px solid rgba(239,68,68,0.35)'
                    : '1px solid rgba(59,130,246,0.25)',
                boxShadow:
                    status === 'Overdue'
                    ? '0 0 8px rgba(239,68,68,0.3)'
                    : '0 0 6px rgba(59,130,246,0.3)',
                transition: 'all 0.3s ease',
                }}
            >
                {status}
            </span>
        )}


        <div style={{ marginLeft: 6 }}>
          {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </div>
      </div>

      {/* Inline Feedback */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            style={savedBox}
          >
            Saved ✓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup (portal render) */}
      {renderInPortal(
        <DueDatePopup
          key={card.id}
          className="tasknest-due-popup"
          card={card}
          anchorRect={anchorRect}
          onClose={() => {
            closePopup();
            setExpanded(false);
          }}
          onUpdated={(payload) => {
            handleUpdated(payload);
            toast.success('Dates updated');
          }}
        />
      )}
    </div>
  );
}

/* ========== Styles ========== */

const container = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'rgba(31, 41, 55, 0.8)',
  borderRadius: 8,
  padding: '4px 10px',
  border: '1px solid rgba(59,130,246,0.25)',
  color: '#e5e7eb',
  fontSize: 12,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: 'fit-content',
  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
  minWidth: 90,
  marginRight: 6,
};

const containerHover = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  color: '#fff',
  border: '1px solid rgba(59,130,246,0.4)',
};

const header = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  cursor: 'pointer',
  userSelect: 'none',
  paddingBottom: 4,
  borderBottom: '1px solid rgba(59,130,246,0.15)',
  transition: 'all 0.2s ease',
};

const savedBox = {
  fontSize: 11,
  color: '#22c55e',
  marginLeft: 6,
  fontWeight: 500,
};
