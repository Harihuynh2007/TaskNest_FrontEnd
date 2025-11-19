// src/features/boards/panel/PlannerPanel/hooks/usePlannerView.jsx
import { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';

export const usePlannerView = () => {
  // VIEW trong Plan mode: month | week | timeline
  const [view, setView] = useState(() => {
    return localStorage.getItem('planner_view') || 'month';
  });

  // MODE tổng: plan | focus | heatmap | insights
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('planner_mode') || 'plan';
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

  // Persist mode preference
  useEffect(() => {
    localStorage.setItem('planner_mode', mode);
  }, [mode]);

  // Persist showCompleted preference
  useEffect(() => {
    localStorage.setItem('planner_show_completed', JSON.stringify(showCompleted));
  }, [showCompleted]);

  // Navigate dates (chỉ áp dụng cho Plan mode)
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
    // mode
    mode,
    setMode,
    // view trong Plan mode
    view,
    setView,
    // thời gian
    currentDate,
    setCurrentDate,
    // completed filter
    showCompleted,
    setShowCompleted,
    // future filters
    filterLabel,
    setFilterLabel,
    filterMember,
    setFilterMember,
    // navigation
    navigate,
    goToDate
  };
};
