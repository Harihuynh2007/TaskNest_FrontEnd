// components/InboxFilterPopup.jsx (đã đồng bộ)
import React from 'react';
import {
  Wrapper, Header, Title, CloseBtn, Section, SectionLabel,
  KeywordInput, CheckboxGroup, CheckboxItem
} from '../popups/Popup.styles';

const createdDateOptions = [
  { value: 'week',   label: 'Created in the last week' },
  { value: '2weeks', label: 'Created in the last two weeks' },
  { value: 'month',  label: 'Created in the last month' },
];

const statusOptions = [
  { label: 'Marked as complete',     value: 'completed' },
  { label: 'Not marked as complete', value: 'incomplete' }
];

const dueCheckboxes = [
  { label: 'No dates', value: 'none' },
  { label: 'Overdue',  value: 'overdue' }
];

const dueRanges = [
  { label: 'Due in the next day',   value: 'today' },
  { label: 'Due in the next week',  value: 'week' },
  { label: 'Due in the next month', value: 'month' }
];

export default function InboxFilterPopup({
  filter,
  onClose,
  position,
  setKeyword,
  toggleArrayItem,          // for 'created'
  toggleStatusCheckbox,
  toggleDueWithConstraint,
  setDueRangeSingle
}) {
  const onToggleRange = (val) => {
    const isSelected = filter.due.includes(val);
    setDueRangeSingle(isSelected ? null : val);
  };

  return (
    <Wrapper style={{ top: position.top, left: position.left }}>
      <Header>
        <Title>Filter</Title>
        <CloseBtn onClick={onClose}>×</CloseBtn>
      </Header>

      {/* Keyword */}
      <Section>
        <SectionLabel>Keyword</SectionLabel>
        <KeywordInput
          type="text"
          placeholder="Enter keyword..."
          value={filter.keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </Section>

      {/* Created (Inbox only) */}
      <Section>
        <SectionLabel>Card created</SectionLabel>
        <CheckboxGroup>
          {createdDateOptions.map(opt => (
            <CheckboxItem key={opt.value} $checked={filter.created.includes(opt.value)}>
              <input
                type="checkbox"
                checked={filter.created.includes(opt.value)}
                onChange={() => toggleArrayItem('created', opt.value)}
              />
              <span>{opt.label}</span>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </Section>

      {/* Card status (single) */}
      <Section>
        <SectionLabel>Card status</SectionLabel>
        <CheckboxGroup>
          {statusOptions.map(opt => {
            const checked = filter.status === opt.value;
            return (
              <CheckboxItem key={opt.value} $checked={checked}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleStatusCheckbox(opt.value)}
                />
                <span>{opt.label}</span>
              </CheckboxItem>
            );
          })}
        </CheckboxGroup>
      </Section>

      {/* Due date */}
      <Section>
        <SectionLabel>Due date</SectionLabel>
        <CheckboxGroup>
          {dueCheckboxes.map(opt => (
            <CheckboxItem key={opt.value} $checked={filter.due.includes(opt.value)}>
              <input
                type="checkbox"
                checked={filter.due.includes(opt.value)}
                onChange={() => toggleDueWithConstraint(opt.value)}
              />
              <span>{opt.label}</span>
            </CheckboxItem>
          ))}
          {dueRanges.map(opt => (
            <CheckboxItem key={opt.value} $checked={filter.due.includes(opt.value)}>
              <input
                type="checkbox"
                checked={filter.due.includes(opt.value)}
                onChange={() => onToggleRange(opt.value)}
              />
              <span>{opt.label}</span>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </Section>
    </Wrapper>
  );
}
