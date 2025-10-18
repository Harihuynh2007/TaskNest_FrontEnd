import React, { useState, useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { updateCard } from '../../../api/cardApi';
import DueDatePicker from './DueDatePicker';
import {
  PopupContainer,
  Arrow,
  PopupHeader,
  PopupContent,
  FieldGroup,
  Label,
  Select,
  ButtonRow,
  SaveButton,
  RemoveButton,
} from './DueDatePopup.styles';

export default function DueDatePopup({ card, onClose, onUpdated, anchorRect }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  const [startDate, setStartDate] = useState(card.start_date || '');
  const [dueDate, setDueDate] = useState(card.due_date || '');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState(card.due_reminder_offset || 0);
  const [recurrence, setRecurrence] = useState(card.recurrence || 'never');
  const [loading, setLoading] = useState(false);

  // Parse time from card.due_date (ISO → yyyy-MM-dd + HH:mm)
  useEffect(() => {
    if (card.due_date) {
      const dt = new Date(card.due_date);
      setDueDate(format(dt, 'yyyy-MM-dd'));
      setDueTime(format(dt, 'HH:mm'));
    }
  }, [card.due_date]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Delay mount until anchorRect ready (prevent popup jump)
  useEffect(() => {
    if (anchorRect) setMounted(true);
  }, [anchorRect]);

  if (!anchorRect || !mounted) return null;

  // =======================
  // Save & Remove handlers
  // =======================
  const handleSave = async () => {
    setLoading(true);
    try {
      const dueISO =
        dueDate && dueTime
          ? new Date(`${dueDate}T${dueTime}:00Z`).toISOString()
          : dueDate
          ? new Date(dueDate).toISOString()
          : null;

      const payload = {
        start_date: startDate || null,
        due_date: dueISO,
        due_reminder_offset: reminder ? parseInt(reminder) : null,
        recurrence,
      };

      await updateCard(card.id, payload);
      onUpdated && onUpdated(payload);
      onClose();
    } catch (err) {
      console.error('Failed to update due date:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await updateCard(card.id, {
        start_date: null,
        due_date: null,
        due_reminder_offset: null,
      });
      onUpdated && onUpdated({ start_date: null, due_date: null });
      onClose();
    } catch (err) {
      console.error('Failed to remove due date:', err);
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // Render UI
  // =======================
  return (
    <AnimatePresence>
      <FocusLock>
        <motion.div
          key="duedate-popup"
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          <PopupContainer ref={ref} anchorRect={anchorRect} role="dialog" aria-label="Set due date">
            <Arrow anchorRect={anchorRect} />
            <PopupHeader>Dates</PopupHeader>
            <PopupContent>
              <FieldGroup>
                <DueDatePicker
                  label="Start date"
                  value={startDate}
                  onChange={(v) => setStartDate(v)}
                  withTime={false}
                />
              </FieldGroup>

              <FieldGroup>
                <DueDatePicker
                  label="Due date"
                  value={
                    dueDate
                      ? new Date(`${dueDate}T${dueTime || '00:00'}:00Z`).toISOString()
                      : null
                  }
                  onChange={(v) => {
                    const d = new Date(v);
                    setDueDate(format(d, 'yyyy-MM-dd'));
                    setDueTime(format(d, 'HH:mm'));
                  }}
                  withTime
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Reminder</Label>
                <Select value={reminder} onChange={(e) => setReminder(e.target.value)}>
                  <option value="0">At due time</option>
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </Select>
              </FieldGroup>

              <FieldGroup>
                <Label>Repeat</Label>
                <Select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FieldGroup>

              <ButtonRow>
                <SaveButton onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving…' : 'Save'}
                </SaveButton>
                <RemoveButton onClick={handleRemove} disabled={loading}>
                  Remove
                </RemoveButton>
              </ButtonRow>
            </PopupContent>
          </PopupContainer>
        </motion.div>
      </FocusLock>
    </AnimatePresence>
  );
}
