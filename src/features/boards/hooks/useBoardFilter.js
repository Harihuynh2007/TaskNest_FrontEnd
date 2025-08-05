// src/features/boards/hooks/useBoardFilter.js

import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
// import các plugin cần thiết của dayjs
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

const initialFilterState = {
  keyword: '',
  status: 'all', // 'all', 'completed', 'incomplete'
  due: 'all',    // 'all', 'none', 'overdue', 'today', 'week'
  members: [],   // [memberId1, memberId2]
  labels: [],    // [labelId1, labelId2]
};

export const useBoardFilter = (originalLists = []) => {
  // 1. Quản lý state của bộ lọc
  const [filter, setFilter] = useState(initialFilterState);

  // 2. Thực hiện logic lọc và ghi nhớ kết quả bằng useMemo
  const filteredLists = useMemo(() => {
    // Nếu không có filter gì đặc biệt, trả về danh sách gốc
    if (JSON.stringify(filter) === JSON.stringify(initialFilterState)) {
      return originalLists;
    }
    
    // Nếu có, thực hiện lọc
    return originalLists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => {
        const matchKeyword = card.name.toLowerCase().includes(filter.keyword.toLowerCase());
        
        const matchStatus =
          filter.status === 'all' ||
          (filter.status === 'completed' && card.completed) ||
          (filter.status === 'incomplete' && !card.completed);

        const matchDue =
          filter.due === 'all' ||
          (filter.due === 'none' && !card.due_date) ||
          (filter.due === 'overdue' && card.due_date && dayjs(card.due_date).isBefore(dayjs(), 'day') && !card.completed) ||
          (filter.due === 'today' && card.due_date && dayjs(card.due_date).isSame(dayjs(), 'day')) ||
          (filter.due === 'week' && card.due_date && dayjs(card.due_date).isoWeek() === dayjs().isoWeek());

        // Chú ý: card.assignee có thể là object { id, name } hoặc chỉ là id
        const memberId = card.assignee?.id || card.assignee;
        const matchMembers = filter.members.length === 0 || (memberId && filter.members.includes(memberId));
        
        const cardLabelIds = card.labels?.map(label => label.id || label) || [];
        const matchLabels = filter.labels.length === 0 || filter.labels.some(labelId => cardLabelIds.includes(labelId));

        return matchKeyword && matchStatus && matchDue && matchMembers && matchLabels;
      }),
    }));
  }, [originalLists, filter]); // Chỉ tính toán lại khi `originalLists` hoặc `filter` thay đổi

  // 3. Trả về mọi thứ component cần
  return {
    filter,
    setFilter,
    filteredLists,
  };
};