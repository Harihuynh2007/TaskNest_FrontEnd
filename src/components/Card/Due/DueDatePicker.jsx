// src/components/Card/Due/DueDatePicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { PickerContainer, Label, DateInput, TimeInput } from './DueDatePopup.styles';

/**
 * Date & Time picker component với xử lý rollover an toàn
 * Time KHÔNG BAO GIỜ làm thay đổi date
 * @param {object} props
 * @param {string} label
 * @param {string | null} value - ISO string
 * @param {(iso: string | null) => void} onChange
 * @param {boolean} withTime
 * @param {string} minDate
 * @param {string} maxDate
 */
export default function DueDatePicker({
  label = 'Date',
  value,
  onChange,
  withTime = true,
  minDate,
  maxDate,
}) {
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const prevTimeRef = useRef('');

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setDateValue(format(d, 'yyyy-MM-dd'));
      const time = format(d, 'HH:mm');
      setTimeValue(time);
      prevTimeRef.current = time;
    } else {
      setDateValue('');
      setTimeValue('');
      prevTimeRef.current = '';
    }
  }, [value]);

  /**
   * Parse time string thành {hours, minutes}
   */
  const parseTime = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return null;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return { hours: h, minutes: m };
  };

  /**
   * Normalize time trong phạm vi 00:00 - 23:59
   * Xử lý rollover KHÔNG cho phép overflow sang ngày khác
   */
  const normalizeTime = (hours, minutes) => {
    let h = hours;
    let m = minutes;

    // Rollover phút
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    } else if (m < 0) {
      const deficit = Math.ceil(Math.abs(m) / 60);
      h -= deficit;
      m = 60 + (m % 60);
      if (m === 60) {
        m = 0;
        h += 1;
      }
    }

    // Clamp giờ trong phạm vi 0-23 (KHÔNG overflow)
    if (h >= 24) {
      h = 23;
      m = 59;
    } else if (h < 0) {
      h = 0;
      m = 0;
    }

    return { hours: h, minutes: m };
  };

  /**
   * Format time object thành HH:mm string
   */
  const formatTime = (hours, minutes) => {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m}`;
  };

  /**
   * Trigger onChange với date và time độc lập
   * KHÔNG dùng Date object để tránh auto overflow
   */
  const triggerChange = (dateStr, timeStr) => {
    if (!dateStr) {
      onChange?.(null);
      return;
    }

    // Tạo ISO string thủ công KHÔNG qua Date constructor
    const iso = timeStr 
      ? `${dateStr}T${timeStr}:00.000Z`
      : `${dateStr}T00:00:00.000Z`;
    
    onChange?.(iso);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDateValue(newDate);
    triggerChange(newDate, timeValue);
  };

  const handleTimeChange = (e) => {
    const newTimeStr = e.target.value;
    
    // Parse time mới
    const newTime = parseTime(newTimeStr);
    if (!newTime) {
      setTimeValue(newTimeStr);
      prevTimeRef.current = newTimeStr;
      triggerChange(dateValue, newTimeStr);
      return;
    }

    // Normalize để xử lý rollover
    const normalized = normalizeTime(newTime.hours, newTime.minutes);
    const finalTimeStr = formatTime(normalized.hours, normalized.minutes);

    setTimeValue(finalTimeStr);
    prevTimeRef.current = finalTimeStr;
    triggerChange(dateValue, finalTimeStr);
  };

  /**
   * Xử lý keyboard navigation (arrow up/down) trên time input
   * Đảm bảo rollover an toàn
   */
  const handleTimeKeyDown = (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    const currentTime = parseTime(timeValue);
    if (!currentTime) return;

    e.preventDefault();

    const increment = e.key === 'ArrowUp' ? 1 : -1;
    const input = e.target;
    const cursorPos = input.selectionStart;

    // Xác định đang focus vào giờ hay phút
    const timeStr = timeValue || '00:00';
    const colonPos = timeStr.indexOf(':');
    const focusOnHours = cursorPos <= colonPos;

    let newTime;
    if (focusOnHours) {
      // Thay đổi giờ
      newTime = normalizeTime(currentTime.hours + increment, currentTime.minutes);
    } else {
      // Thay đổi phút
      newTime = normalizeTime(currentTime.hours, currentTime.minutes + increment);
    }

    const finalTimeStr = formatTime(newTime.hours, newTime.minutes);
    setTimeValue(finalTimeStr);
    prevTimeRef.current = finalTimeStr;
    triggerChange(dateValue, finalTimeStr);

    // Giữ nguyên vị trí cursor
    setTimeout(() => {
      input.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  return (
    <PickerContainer>
      {label && <Label>{label}</Label>}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <DateInput
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          min={minDate}
          max={maxDate}
          aria-label={`${label} date`}
        />
        {withTime && (
          <TimeInput
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            onKeyDown={handleTimeKeyDown}
            aria-label={`${label} time`}
          />
        )}
      </div>
    </PickerContainer>
  );
}