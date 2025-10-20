// src/components/Card/Due/DueDatePicker.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PickerContainer, Label, DateInput, TimeInput } from './DueDatePopup.styles';

/**
 * Date & Time picker component
 * Dùng chung cho cả Start date và Due date.
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

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setDateValue(format(d, 'yyyy-MM-dd'));
      setTimeValue(format(d, 'HH:mm'));
    } else {
      setDateValue('');
      setTimeValue('');
    }
  }, [value]);

  const triggerChange = (d, t) => {
    if (!d) {
      onChange?.(null);
      return;
    }
    const iso = t ? new Date(`${d}T${t}:00Z`).toISOString() : new Date(d).toISOString();
    onChange?.(iso);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDateValue(newDate);
    triggerChange(newDate, timeValue);
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    triggerChange(dateValue, newTime);
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
            aria-label={`${label} time`}
          />
        )}
      </div>
    </PickerContainer>
  );
}
