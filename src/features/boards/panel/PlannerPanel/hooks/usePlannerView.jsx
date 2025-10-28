import { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';

export const usePlannerView = () => {
  const [view, setView] = useState(() => {
    return localStorage.getItem('planner_view') || 'month';
  });
  
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [showCompleted, setShowCompleted] = useState(() => {
    const saved = localStorage.getItem('planner_show_completed');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [filterLabel, setFilterLabel] = useState(null);
  const [filterMember, setFilterMember] = useState(null);

  // Persist view preference
  useEffect(() => {
    localStorage.setItem('planner_view', view);
  }, [view]);

  // Persist showCompleted preference
  useEffect(() => {
    localStorage.setItem('planner_show_completed', JSON.stringify(showCompleted));
  }, [showCompleted]);

  // Navigate dates
  const navigate = useCallback((direction) => {
    if (direction === 0) {
      setCurrentDate(dayjs());
      return;
    }

    setCurrentDate(prev => {
      switch (view) {
        case 'month': 
          return prev.add(direction, 'month');
        case 'week': 
          return prev.add(direction, 'week');
        case 'timeline': 
          return prev.add(direction * 7, 'day');
        default: 
          return prev;
      }
    });
  }, [view]);

  const goToDate = useCallback((date) => {
    setCurrentDate(dayjs(date));
  }, []);

  return {
    view,
    setView,
    currentDate,
    setCurrentDate,
    showCompleted,
    setShowCompleted,
    filterLabel,
    setFilterLabel,
    filterMember,
    setFilterMember,
    navigate,
    goToDate
  };
};