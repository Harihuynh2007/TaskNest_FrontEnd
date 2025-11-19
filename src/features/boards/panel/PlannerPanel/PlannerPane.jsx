// src/features/boards/panel/PlannerPanel/PlannerPane.jsx
import React, { useMemo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { DragDropContext } from '@hello-pangea/dnd';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

import { usePlannerData } from './hooks/usePlannerData';
import { usePlannerView } from './hooks/usePlannerView';
import { usePlannerRealtime } from './hooks/usePlannerRealtime';

import PlannerToolbar from './components/PlannerToolbar';
import MonthCalendar from './components/MonthCalendar';
import WeekView from './components/WeekView';
import TimelineView from './components/TimelineView';
import CreateCardModal from './components/CreateCardModal';
import FullCardModal from '../../../../components/Card/FullCardModal/FullCardModal';

// NEW MODES
import FocusMode from './components/FocusMode';
import HeatmapView from './components/HeatmapView';
import InsightsView from './components/InsightsView';
import { buildSmartRescheduleUpdates } from './components/SmartRescheduler';

export default function PlannerPane() {
  const { boardId } = useParams();
  const {
    cards,
    loading,
    updateCardDate,
    createCard,
    toggleCardComplete,
    batchUpdateDates,
    refresh
  } = usePlannerData(boardId);

  const {
    mode,
    setMode,
    view,
    setView,
    currentDate,
    navigate,
    showCompleted,
    setShowCompleted,
  } = usePlannerView();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  usePlannerRealtime(boardId, refresh);
  
  // Filter cards theo Completed toggle – dùng cho Plan mode
  const planCards = useMemo(() => {
    return cards.filter(card => {
      if (!card) return false;
      if (!showCompleted && card.completed) return false;
      return true;
    });
  }, [cards, showCompleted]);

  // Handle drag & drop trong Plan mode
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const cardId = parseInt(result.draggableId, 10);
    const newDate = result.destination.droppableId;

    if (!dayjs(newDate, 'YYYY-MM-DD', true).isValid()) return;

    updateCardDate(cardId, newDate);
  }, [updateCardDate]);

  // Tạo thẻ từ Planner
  const handleCreateCard = useCallback(async (data) => {
    try {
      await createCard(data);
      setShowCreateModal(false);
    } catch (err) {
      // error đã toast trong hook
    }
  }, [createCard]);

  // Update từ FullCardModal
  const handleCardUpdate = useCallback(() => {
    refresh();
  }, [refresh]);

  // Smart Reschedule (Insights mode)
  const handleSmartReschedule = useCallback(() => {
    const updates = buildSmartRescheduleUpdates(cards, dayjs());
    if (!updates.length) {
      toast('Không có thẻ quá hạn để sắp xếp lại.');
      return;
    }
    batchUpdateDates(updates);
  }, [cards, batchUpdateDates]);

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading planner...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <PlannerWrapper>
      <PlannerToolbar
        mode={mode}
        setMode={setMode}
        view={view}
        setView={setView}
        currentDate={currentDate}
        navigate={navigate}
        onAddCard={() => setShowCreateModal(true)}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
      />

      <ViewContainer>
        {mode === 'plan' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            {view === 'month' && (
              <MonthCalendar 
                currentDate={currentDate} 
                cards={planCards}
                onCardClick={setSelectedCard}
              />
            )}
            {view === 'week' && (
              <WeekView 
                currentDate={currentDate} 
                cards={planCards}
                onCardClick={setSelectedCard}
              />
            )}
            {view === 'timeline' && (
              <TimelineView 
                currentDate={currentDate} 
                cards={planCards}
                onCardClick={setSelectedCard}
              />
            )}
          </DragDropContext>
        )}

        {mode === 'focus' && (
          <FocusMode
            currentDate={currentDate}
            cards={cards}
            onCardClick={setSelectedCard}
            onToggleComplete={toggleCardComplete}
          />
        )}

        {mode === 'heatmap' && (
          <HeatmapView
            currentDate={currentDate}
            cards={cards}
          />
        )}

        {mode === 'insights' && (
          <InsightsView
            currentDate={currentDate}
            cards={cards}
            onSmartReschedule={handleSmartReschedule}
          />
        )}
      </ViewContainer>

      {showCreateModal && (
        <CreateCardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCard}
          defaultDate={currentDate.format('YYYY-MM-DD')}
        />
      )}

      {selectedCard && (
        <FullCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onCardUpdate={handleCardUpdate}
        />
      )}
    </PlannerWrapper>
  );
}

// Styled components
const PlannerWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-1, #171c26);
  color: var(--text-primary, #e1e3e6);
`;

const ViewContainer = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
`;

const LoadingContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(88, 175, 246, 0.2);
  border-top-color: var(--brand-primary, #58aff6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 14px;
  color: var(--text-secondary, #8a93a2);
`;
