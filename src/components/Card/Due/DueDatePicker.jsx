// src/components/common/DueDatePicker.jsx
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { PickerContainer, Label, DateInput, TimeInput } from './././DueDatePopup.styles';

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

  const triggerChange = (d, t) => {
    if (!d) return onChange?.(null);
    const iso = t ? new Date(`${d}T${t}:00Z`).toISOString() : new Date(d).toISOString();
    onChange?.(iso);
  };

  return (
    <PickerContainer>
      {label && <Label>{label}</Label>}
      <div style={{ display: 'flex', gap: '6px' }}>
        <DateInput
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          min={minDate}
          max={maxDate}
        />
        {withTime && (
          <TimeInput
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
          />
        )}
      </div>
    </PickerContainer>
  );
}
