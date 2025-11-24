// src/components/Card/Due/DueDatePopup.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import FocusLock from 'react-focus-lock';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import DueDatePicker from './DueDatePicker';
import useDueDateForm from './useDueDateForm';
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
  QuickButtonsRow,
  QuickBtn,
} from './DueDatePopup.styles';

/**
 * Enterprise-grade Due Date Popup
 * 
 * FIXES:
 * 1. Proper focus management
 * 2. Memoized computations
 * 3. Proper ISO string handling
 * 4. Error boundaries
 * 5. Accessibility compliance
 */
export default function DueDatePopup({ card, onClose, onUpdated, anchorRect }) {
  const popupRef = useRef(null);
  const firstInputRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const {
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
    save,
    remove,
    quickSelect,
    loading,
    error,
  } = useDueDateForm(card, onUpdated);

  // Mount animation
  useEffect(() => {
    if (anchorRect) {
      setMounted(true);
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [anchorRect]);
  // Click outside to close
  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // ESC to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  /**
   * Calculate overdue status (memoized for performance)
   */
  const overdueInfo = useMemo(() => {
    if (!card?.due_date) return null;
    
    try {
      const due = new Date(card.due_date);
      const now = new Date();
      
      if (isNaN(due.getTime())) return null;
      
      if (due < now) {
        const daysOverdue = Math.max(1, Math.abs(differenceInDays(now, due)));
        return {
          isOverdue: true,
          days: daysOverdue,
          label: daysOverdue === 1 ? 'day' : 'days',
        };
      }
      
      return { isOverdue: false };
    } catch (err) {
      console.error('Error calculating overdue:', err);
      return null;
    }
  }, [card?.due_date]);

  /**
   * Format display date (memoized)
   */
  const displayDate = useMemo(() => {
    if (!dueDate) return null;
    
    try {
      const dateTimeStr = `${dueDate}T${dueTime || '00:00'}:00`;
      const dt = new Date(dateTimeStr);
      
      if (isNaN(dt.getTime())) return null;
      
      return format(dt, 'dd MMM, HH:mm');
    } catch (err) {
      console.error('Error formatting display date:', err);
      return null;
    }
  }, [dueDate, dueTime]);

  /**
   * Convert local date/time to ISO string for DueDatePicker
   */
  const buildISOForPicker = (dateStr, timeStr) => {
    if (!dateStr) return null;
    
    try {
      const dateTimeStr = timeStr 
        ? `${dateStr}T${timeStr}:00`
        : `${dateStr}T00:00:00`;
      
      const dt = new Date(dateTimeStr);
      
      if (isNaN(dt.getTime())) return null;
      
      return dt.toISOString();
    } catch (err) {
      console.error('Error building ISO:', err);
      return null;
    }
  };

  /**
   * Parse ISO from picker and update state
   */
  const handleDueDateChange = (isoString) => {
    if (!isoString) {
      setDueDate('');
      setDueTime('');
      return;
    }
    
    try {
      const dt = new Date(isoString);
      
      if (isNaN(dt.getTime())) {
        console.error('Invalid ISO string:', isoString);
        return;
      }
      
      setDueDate(format(dt, 'yyyy-MM-dd'));
      setDueTime(format(dt, 'HH:mm'));
    } catch (err) {
      console.error('Error parsing ISO:', err);
    }
  };

  /**
  /**
   * Handle save with validation
   */
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSave = async () => {
    const success = await save();
    if (success) {
      setTimeout(() => {
        if (mountedRef.current) {
          onClose();
        }
      }, 300);
    }
  };

  /**   * Handle remove
   */
  const handleRemove = async () => {
    const success = await remove();
    if (success) {
      onClose();
    }
  };

  if (!anchorRect || !mounted) return null;

  return (
    <AnimatePresence>
      <FocusLock returnFocus>
        <motion.div
          key="duedate-popup"
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          <PopupContainer
            ref={popupRef}
            anchorRect={anchorRect}
            role="dialog"
            aria-labelledby="due-date-title"
            aria-describedby="due-date-description"
            className="tasknest-due-popup"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Arrow anchorRect={anchorRect} />

            {/* Hidden description for screen readers */}
            <div id="due-date-description" style={{ display: 'none' }}>
              Set start and due dates for this task. Use Tab to navigate, Enter to activate buttons.
            </div>

            {/* Header with status */}
            <PopupHeader id="due-date-title">
              {overdueInfo?.isOverdue && (
                <div
                  role="alert"
                  style={{
                    color: '#f87171',
                    fontSize: 12,
                    marginBottom: 6,
                    fontWeight: 500,
                  }}
                >
                  ⚠ Overdue by {overdueInfo.days} {overdueInfo.label}
                </div>
              )}
              
              Dates{' '}
              {displayDate && (
                <span style={{ color: '#60a5fa', fontSize: 13, marginLeft: 6 }}>
                  ({displayDate})
                </span>
              )}
            </PopupHeader>

            {/* Form content */}
            <PopupContent>
              {/* Start date */}
              <FieldGroup>
                <DueDatePicker
                  ref={firstInputRef}
                  label="Start date"
                  value={startDate ? buildISOForPicker(startDate, '00:00') : null}
                  onChange={(iso) => {
                    if (!iso) {
                      setStartDate('');
                      return;
                    }
                    try {
                      const dt = new Date(iso);
                      setStartDate(format(dt, 'yyyy-MM-dd'));
                    } catch (err) {
                      console.error('Error parsing start date:', err);
                    }
                  }}
                  withTime={false}
                  maxDate={dueDate || undefined}
                />
              </FieldGroup>

              {/* Due date */}
              <FieldGroup>
                <DueDatePicker
                  label="Due date"
                  value={buildISOForPicker(dueDate, dueTime)}
                  onChange={handleDueDateChange}
                  withTime
                  minDate={startDate || undefined}
                />
              </FieldGroup>

              {/* Quick select buttons */}
              <QuickButtonsRow>
                <QuickBtn
                  onClick={() => quickSelect(0)}
                  disabled={loading}
                  aria-label="Set due date to today"
                >
                  Today
                </QuickBtn>
                <QuickBtn
                  onClick={() => quickSelect(1)}
                  disabled={loading}
                  aria-label="Set due date to tomorrow"
                >
                  Tomorrow
                </QuickBtn>
                <QuickBtn
                  onClick={() => quickSelect(7)}
                  disabled={loading}
                  aria-label="Set due date to next week"
                >
                  Next week
                </QuickBtn>
              </QuickButtonsRow>

              {/* Reminder */}
              <FieldGroup>
                <Label htmlFor="reminder-select">Reminder</Label>
                <Select
                  id="reminder-select"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  disabled={loading}
                  aria-label="Set reminder time"
                >
                  <option value="0">At due time</option>
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="120">2 hours before</option>
                  <option value="1440">1 day before</option>
                </Select>
              </FieldGroup>

              {/* Recurrence */}
              <FieldGroup>
                <Label htmlFor="recurrence-select">Repeat</Label>
                <Select
                  id="recurrence-select"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  disabled={loading}
                  aria-label="Set recurrence pattern"
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </FieldGroup>

              {/* Error display */}
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  style={{
                    color: '#f87171',
                    fontSize: 12,
                    marginTop: 4,
                    padding: '6px 8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <ButtonRow>
                <SaveButton
                  onClick={handleSave}
                  disabled={loading}
                  aria-label="Save dates"
                >
                  {loading ? 'Saving…' : 'Save'}
                </SaveButton>
                <RemoveButton
                  onClick={handleRemove}
                  disabled={loading}
                  aria-label="Remove all dates"
                >
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