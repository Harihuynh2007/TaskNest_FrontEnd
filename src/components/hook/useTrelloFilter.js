// hooks/useTrelloFilter.js
import { useState } from 'react';

export default function useTrelloFilter(initial = {}) {
  const [filter, setFilter] = useState({
    keyword: '',
    status: 'all',   // 'all' | 'completed' | 'incomplete' (single)
    due: [],         // ['none','overdue', plus at most one of 'today'|'week'|'month']
    created: [],     // Inbox only: ['week','2weeks','month']
    members: [],
    labels: [],
    ...initial
  });

  // Keyword
  const setKeyword = (kw) => setFilter(prev => ({ ...prev, keyword: kw ?? '' }));

  // STATUS (single)
  const toggleStatusCheckbox = (value /* 'completed' | 'incomplete' */) => {
    if (!['completed', 'incomplete'].includes(value)) return;
    setFilter(prev => ({ ...prev, status: prev.status === value ? 'all' : value }));
  };

  // DUE checkbox: 'none' / 'overdue'
  const toggleDueWithConstraint = (value /* 'none'|'overdue' */) => {
    if (!['none','overdue'].includes(value)) return;
    setFilter(prev => {
      const curr = Array.isArray(prev.due) ? prev.due : [];
      const exists = curr.includes(value);
      return { ...prev, due: exists ? curr.filter(v => v !== value) : [...curr, value] };
    });
  };

  // DUE range (single): 'today'|'week'|'month'|null
  const setDueRangeSingle = (value) => {
    setFilter(prev => {
      const curr = Array.isArray(prev.due) ? prev.due : [];
      const kept = curr.filter(v => v === 'none' || v === 'overdue');
      if (!value) return { ...prev, due: kept }; // clear range
      const next = Array.from(new Set([...kept, value]));
      // ensure only one range
      const ranges = ['today','week','month'];
      const final = next.filter(v => !ranges.includes(v) || v === value);
      return { ...prev, due: final };
    });
  };

  // Generic toggle for array fields (created, members, labels)
  const toggleArrayItem = (key, value) => {
    setFilter(prev => {
      const curr = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = curr.includes(value);
      return { ...prev, [key]: exists ? curr.filter(v => v !== value) : [...curr, value] };
    });
  };

  const resetFilter = () => {
    setFilter({
      keyword: '',
      status: 'all',
      due: [],
      created: [],
      members: [],
      labels: [],
      ...initial
    });
  };

  return {
    filter,
    setFilter,
    setKeyword,
    toggleStatusCheckbox,
    toggleDueWithConstraint,
    setDueRangeSingle,
    toggleArrayItem,
    resetFilter
  };
}
