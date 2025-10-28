import React, { useMemo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { DragDropContext } from '@hello-pangea/dnd';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

// Import real hooks
import { usePlannerData } from './hooks/usePlannerData';
import { usePlannerView } from './hooks/usePlannerView';
import { usePlannerRealtime } from './hooks/usePlannerRealtime';

// Import components (keep the same as artifact)
import PlannerToolbar from './components/PlannerToolbar';
import MonthCalendar from './components/MonthCalendar';
import WeekView from './components/WeekView';
import TimelineView from './components/TimelineView';
import CreateCardModal from './components/CreateCardModal';
import FullCardModal from '../../../../components/Card/FullCardModal/FullCardModal';

export default function PlannerPane() {
  const { boardId } = useParams();
  const { cards, loading, updateCardDate, createCard, toggleCardComplete, refresh } = usePlannerData(boardId);
  const { view, setView, currentDate, navigate, showCompleted, setShowCompleted } = usePlannerView();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  usePlannerRealtime(boardId, refresh);
  
  // Filter cards based on preferences
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (!showCompleted && card.completed) return false;
      return true;
    });
  }, [cards, showCompleted]);

  // Handle drag & drop
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const cardId = parseInt(result.draggableId);
    const newDate = result.destination.droppableId;

    updateCardDate(cardId, newDate);
  }, [updateCardDate]);

  // Handle card creation
  const handleCreateCard = useCallback(async (data) => {
    try {
      await createCard(data);
      setShowCreateModal(false);
    } catch (err) {
      // Error already handled in hook
    }
  }, [createCard]);

  // Handle card update from FullCardModal
  const handleCardUpdate = useCallback((updatedCard) => {
    refresh();
  }, [refresh]);

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
        view={view}
        setView={setView}
        currentDate={currentDate}
        navigate={navigate}
        onAddCard={() => setShowCreateModal(true)}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
      />

      {/* ❌ Bỏ <DragDropContext> ở đây */}
      <ViewContainer>
        {view === 'month' && (
          <MonthCalendar 
            currentDate={currentDate} 
            cards={filteredCards}
            onCardClick={setSelectedCard}
          />
        )}
        {view === 'week' && (
          <WeekView 
            currentDate={currentDate} 
            cards={filteredCards}
            onCardClick={setSelectedCard}
          />
        )}
        {view === 'timeline' && (
          <TimelineView 
            currentDate={currentDate} 
            cards={filteredCards}
            onCardClick={setSelectedCard}
          />
        )}
      </ViewContainer>

      {/* Create Card Modal */}
      {showCreateModal && (
        <CreateCardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCard}
          defaultDate={currentDate.format('YYYY-MM-DD')}
        />
      )}

      {/* Full Card Modal */}
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

// Styled components (same as artifact)
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