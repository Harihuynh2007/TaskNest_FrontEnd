// src/features/boards/hooks/useInboxFilter.js
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';

const initialFilterState = {
  keyword: '',
  status: 'all', // 'all', 'completed', 'incomplete'
  due: 'all',    // 'all', 'overdue', 'today', 'week', 'none'
  created: 'all',// 'all', 'week', '2weeks', 'month'
};

export const useInboxFilter = (originalCards = []) => {
  const [filter, setFilter] = useState(initialFilterState);
  
  const filteredCards = useMemo(() => {
    const today = dayjs();
    
    return originalCards.filter((card) => {
      // Nếu không có filter gì thì không cần lọc
      if (!filter.keyword && filter.status === 'all' && filter.due === 'all' && filter.created === 'all') {
        return true;
      }

      const matchKeyword = card.name.toLowerCase().includes(filter.keyword.toLowerCase());

      const matchStatus =
        filter.status === 'all' ||
        (filter.status === 'completed' && card.completed) ||
        (filter.status === 'incomplete' && !card.completed);

      const due = card.due_date ? dayjs(card.due_date) : null;
      const matchDue =
        filter.due === 'all' ||
        (filter.due === 'overdue' && due && due.isBefore(today, 'day') && !card.completed) ||
        (filter.due === 'today' && due && due.isSame(today, 'day')) ||
        (filter.due === 'week' && due && due.isoWeek() === today.isoWeek()) ||
        (filter.due === 'none' && !due);

      const created = card.created_at ? dayjs(card.created_at) : null;
      const matchCreated =
        filter.created === 'all' ||
        (filter.created === 'week' && created && created.isoWeek() === today.isoWeek()) ||
        (filter.created === '2weeks' && created && created.isAfter(today.subtract(14, 'day'))) ||
        (filter.created === 'month' && created && created.month() === today.month());

      return matchKeyword && matchStatus && matchDue && matchCreated;
    });
  }, [originalCards, filter]);

  return { filter, setFilter, filteredCards };
};