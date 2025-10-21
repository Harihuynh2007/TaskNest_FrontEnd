// src/components/Card/Due/useDueDateForm.js
import { useState, useCallback, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { updateCard } from '../../../api/cardApi';

/**
 * Quản lý logic của DueDatePopup — tách toàn bộ khỏi UI
 * @param {object} card
 * @param {(payload: object) => void} onUpdated
 */
export default function useDueDateForm(card, onUpdated) {
  const [startDate, setStartDate] = useState(card.start_date || '');
  const [dueDate, setDueDate] = useState(card.due_date || '');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState(card.due_reminder_offset || 0);
  const [recurrence, setRecurrence] = useState(card.recurrence || 'never');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Đồng bộ khi card thay đổi */
  useEffect(() => {
    if (card.due_date) {
      const dt = new Date(card.due_date);
      setDueDate(format(dt, 'yyyy-MM-dd'));
      setDueTime(format(dt, 'HH:mm'));
    } else {
      setDueDate('');
      setDueTime('');
    }
  }, [card.due_date]);

  /** Xây payload để gửi lên API */
  const buildPayload = useCallback(() => {
    const dueISO =
      dueDate && dueTime
        ? new Date(`${dueDate}T${dueTime}:00Z`).toISOString()
        : dueDate
        ? new Date(dueDate).toISOString()
        : null;

    return {
      start_date: startDate || null,
      due_date: dueISO,
      due_reminder_offset: reminder ? parseInt(reminder) : null,
      recurrence,
    };
  }, [startDate, dueDate, dueTime, reminder, recurrence]);

  /** Lưu dữ liệu (optimistic update) */
  const save = useCallback(async () => {
    const payload = buildPayload();
    setLoading(true);
    setError(null);
    try {
      onUpdated?.(payload);
      await updateCard(card.id, payload);
      return true;
    } catch (err) {
      console.error('❌ Failed to save due date:', err);
      setError('Không thể lưu thời hạn');
      return false;
    } finally {
      setLoading(false);
    }
  }, [buildPayload, card.id, onUpdated]);

  /** Xoá ngày */
  const remove = useCallback(async () => {
    if (!window.confirm('Remove due date?')) return false;
    setLoading(true);
    setError(null);
    const payload = { start_date: null, due_date: null, due_reminder_offset: null };
    try {
      onUpdated?.(payload);
      await updateCard(card.id, payload);
      return true;
    } catch (err) {
      console.error('❌ Failed to remove due date:', err);
      setError('Không thể xoá ngày hết hạn');
      return false;
    } finally {
      setLoading(false);
    }
  }, [card.id, onUpdated]);

  /** Cập nhật nhanh (Today/Tomorrow/Next week) */
  const quickSelect = useCallback((days) => {
    const d = addDays(new Date(), days);
    setDueDate(format(d, 'yyyy-MM-dd'));
    setDueTime('09:00');
  }, []);

  /** Reset lỗi sau 3s */
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  return {
    startDate,
    dueDate,
    dueTime,
    reminder,
    recurrence,
    setStartDate,
    setDueDate,
    setDueTime,
    setReminder,
    setRecurrence,
    buildPayload,
    save,
    remove,
    quickSelect,
    loading,
    error,
  };
}
