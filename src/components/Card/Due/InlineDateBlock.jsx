// src/components/Card/Due/InlineDateBlock.jsx
import React, { useState, useEffect } from 'react';
import { FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useDueDatePopup from './useDueDatePopup';
import DueDatePopup from './DueDatePopup';
import {
  Container,
  DateTrigger,
  StatusBadge,
  SavedIndicator
} from './InlineDateBlock.styles';

export default function InlineDateBlock({ card, onUpdated }) {
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('');
  const { isOpen, anchorRect, openPopup, closePopup, renderInPortal } = useDueDatePopup();

  /** Xác định trạng thái hạn */
  useEffect(() => {
    if (!card?.due_date) {
      setStatus('');
      return;
    }
    const due = new Date(card.due_date);
    setStatus(due < new Date() ? 'Overdue' : 'Active');
  }, [card?.due_date]);

  /** Cập nhật mỗi phút */
  useEffect(() => {
    const t = setInterval(() => {
      if (card?.due_date) {
        const due = new Date(card.due_date);
        setStatus(due < new Date() ? 'Overdue' : 'Active');
      }
    }, 60000);
    return () => clearInterval(t);
  }, [card?.due_date]);

  /** Feedback saved ✓ */
  const handleUpdated = (payload) => {
    onUpdated?.(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  /** Keyboard accessibility */
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPopup(e);
    }
  };

  return (
    <Container>
      <DateTrigger
        className="tasknest-due-trigger"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={(e) => openPopup(e)}
        onKeyDown={handleKey}
      >
        <FiCalendar size={14} />
        <span style={{ fontWeight: 600 }}>Dates</span>

        {status && (
          <StatusBadge
            status={status}
            title={
              status === 'Overdue'
                ? `This task was due on ${new Date(card.due_date).toLocaleString()}`
                : `Due on ${new Date(card.due_date).toLocaleString()}`
            }
          >
            {status}
          </StatusBadge>
        )}

        <div style={{ marginLeft: 6 }}>
          {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </div>
      </DateTrigger>

      {/* Saved feedback */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <SavedIndicator>Saved ✓</SavedIndicator>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render popup qua portal */}
      {renderInPortal(
        <DueDatePopup
          key={card.id}
          card={card}
          anchorRect={anchorRect}
          onClose={closePopup}
          onUpdated={(payload) => {
            handleUpdated(payload);
            toast.success('Dates updated');
          }}
        />
      )}
    </Container>
  );
}
