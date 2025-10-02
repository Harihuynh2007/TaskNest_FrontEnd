import React, { useState, useRef,useEffect,useMemo } from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from '@hello-pangea/dnd';

import InboxSubHeader from '../../../components/InboxSubHeader';
import CardEditPopup from '../../../components/Card/CardEditPopup';
import FullCardModal from '../../../components/Card/FullCardModal';
import CardItem from '../../../components/Card/CardItem';
import FeedbackPopup from '../../../components/FeedbackPopup';
import InboxFilterPopup from '../../../components/filter/InboxFilterPopup';
import useTrelloFilter from '../../../components/hook/useTrelloFilter';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import * as cardApi from '../../../api/cardApi';
import { toast } from 'react-hot-toast';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);


export default function InboxPane({
  cards,
  setCards,
  inputValue,
  setInputValue,
  showInput,
  setShowInput,
  editPopup,
  setEditPopup,
  selectedCard,
  setSelectedCard,
  handleAddCard,
  toggleComplete,
  handleSaveCard,
  background,
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const {
    filter,
    setKeyword,
    toggleArrayItem,
    toggleStatusCheckbox,
    toggleDueWithConstraint,
    resetFilter,
    setDueRangeSingle,
  } = useTrelloFilter();

  const handleCheckClick = async (cardId, next) => {
  // 1) Optimistic vào state đang render ở InboxPane
    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, completed: next } : c))
    );

    try {
      // 2) Gọi API (hoặc gọi hàm toggleComplete của cha nếu bạn muốn giữ ở cha)
      await cardApi.updateCard(cardId, { completed: next }); // PATCH /cards/:id/
    } catch (err) {
      // 3) Rollback khi lỗi
      setCards(prev =>
        prev.map(c => (c.id === cardId ? { ...c, completed: !next } : c))
      );
      toast?.error?.('Cập nhật trạng thái thất bại, đã hoàn tác.');
      console.error(err);
    }
  };

  const handleCardDeleted = (deletedCardId) => {
    console.log("Step 2.5: Parent component received onCardDeleted with ID:", deletedCardId);
    // Đơn giản là lọc ra card có ID đã bị xóa khỏi mảng `cards`
    setCards((prevCards) => prevCards.filter((card) => card.id !== deletedCardId));
  };

  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const filterButtonRef = useRef(null);
  
  // cards là mảng card gốc
  const filteredCards = cards.filter((card) => {
    const name = (card.name || '').toLowerCase();
    const kw = (filter.keyword || '').toLowerCase();
    const matchKeyword = name.includes(kw);

    // ----- STATUS: single select -----
    const matchStatus =
      filter.status === 'all' ||
      (filter.status === 'completed' && !!card.completed) ||
      (filter.status === 'incomplete' && !card.completed);

    // ----- DUE: multi checkbox (none/overdue) + single range (today/week/month) -----
    const dueSel = Array.isArray(filter.due) ? filter.due : [];
    const selectedNone = dueSel.includes('none');
    const selectedOverdue = dueSel.includes('overdue');
    const selectedRange = ['today', 'week', 'month'].find((v) =>
      dueSel.includes(v)
    );

    const due = card.due_date ? dayjs(card.due_date) : null;
    const today = dayjs();

    const isNone = !due;
    const isOverdue = due && due.isBefore(today, 'day') && !card.completed;
    const inToday = due && due.isSame(today, 'day');
    const inWeek = due && due.isoWeek() === today.isoWeek();
    const inMonth =
      due &&
      due.month() === today.month() &&
      due.year() === today.year();

    const matchDue =
      (!selectedNone && !selectedOverdue && !selectedRange)
        ? true
        : (selectedNone && isNone) ||
          (selectedOverdue && isOverdue) ||
          (!!selectedRange &&
            ((selectedRange === 'today' && inToday) ||
              (selectedRange === 'week' && inWeek) ||
              (selectedRange === 'month' && inMonth)));

    // ----- CREATED: multi-select ['week','2weeks','month'] -----
    const created = card.created_at ? dayjs(card.created_at) : null;
    const createdSel = Array.isArray(filter.created) ? filter.created : [];

    const matchCreated =
      createdSel.length === 0
        ? true
        : createdSel.some((k) => {
            switch (k) {
              case 'week':
                return (
                  created &&
                  created.isoWeek() === today.isoWeek() &&
                  created.year() === today.year()
                );
              case '2weeks':
                return created && created.isAfter(today.subtract(14, 'day'));
              case 'month':
                return (
                  created &&
                  created.month() === today.month() &&
                  created.year() === today.year()
                );
              default:
                return true;
            }
          });

    // ✅ return để filter hoạt động
    return matchKeyword && matchStatus && matchDue && matchCreated;
  });


  
  useEffect(() => {
  if (showFilter && filterButtonRef.current) {
    const rect = filterButtonRef.current.getBoundingClientRect();
    setPopupPos({
      top: rect.top + window.scrollY, // ngang với nút
      left: rect.left + window.scrollX - 304 - 8, // 304 = popup width, 8px = khoảng cách
    });
  }
}, [showFilter]);

  
  return (
    <PaneWrapper $background={background}> 
      <InboxSubHeader
          setShowFeedback={setShowFeedback}
          setShowFilter={setShowFilter}
          filterButtonRef={filterButtonRef}
      />

      {editPopup && <DarkOverlay />}
      <InnerContent>
        {selectedCard && (
          <FullCardModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onCardUpdate={(updatedCard) => {
              setCards((prev) =>
                prev.map((card) =>
                  card.id === updatedCard.id ? updatedCard : card
                )
              );
            }}
          />

        )}

        {showFeedback && <FeedbackPopup onClose={() => setShowFeedback(false)} />}
        {showFilter && (
          <InboxFilterPopup
            filter={filter}
            onClose={() => setShowFilter(false)}
            position={popupPos}
            setKeyword={setKeyword}
            toggleArrayItem={toggleArrayItem}
            toggleStatusCheckbox={toggleStatusCheckbox}
            toggleDueWithConstraint={toggleDueWithConstraint}
            setDueRangeSingle={setDueRangeSingle}
          />
        )}


        {showInput ? (
          <CardInputWrapper>
            <Input
              placeholder="Enter a title"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            <ButtonRow>
              <AddButton onClick={handleAddCard}>Add card</AddButton>
              <CancelButton
                onClick={() => {
                  setShowInput(false);
                  setInputValue('');
                }}
              >
                Cancel
              </CancelButton>
            </ButtonRow>
          </CardInputWrapper>
        ) : (
          <AddCardTrigger onClick={() => setShowInput(true)}>Add a card</AddCardTrigger>
        )}

        <Droppable droppableId="inbox" type="CARD">
          {(provided,snapshot) => (
            <CardList 
              ref={provided.innerRef}
              {...provided.droppableProps}
              $isDraggingOver={snapshot.isDraggingOver}
            >
            {filteredCards.map((card, index) => (
              <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <CardItem
                      isInbox={true}
                      draggingOver={snapshot.draggingOver}
                      card={card}
                      index={index}
                      isDragging={snapshot.isDragging}
                      onEditClick={(e, card, index, rect) => {
                        setEditPopup({ card, index, text: card.name, anchorRect: rect });
                      }}
                      onCheckClick={handleCheckClick} 

                      onCardClick={(card) => setSelectedCard(card)}
                    />
                  </div>
                )}
              </Draggable>
            ))}

              {provided.placeholder}
            </CardList>
          )}
        </Droppable>

        {editPopup && (
          <CardEditPopup
            anchorRect={editPopup.anchorRect}
            card={editPopup.card}
            cardText={editPopup.text}
            onChange={(val) => setEditPopup({ ...editPopup, text: val })}
            onSave={handleSaveCard}
            onClose={() => setEditPopup(null)}
            onOpenFullCard={() => {
              setEditPopup(null);
              setSelectedCard(cards[editPopup.index]);
            }}
            isInboxMode={true}
            onCardDeleted={handleCardDeleted}
          />
        )}
      </InnerContent>
    </PaneWrapper>
  );
}


const PaneWrapper = styled.div`
  background: ${({ $background }) => $background || '#e4f0f6'};
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
`;

const InnerContent = styled.div`
  width: 100%;
  max-width: 784px;
  margin: 0 auto;
  flex: 1; /* 👈 để chiếm phần còn lại sau header */
  display: flex;
  flex-direction: column;
`;

const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
`;

const CardInputWrapper = styled.div`
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
`;

const Input = styled.textarea`
  width: 100%;
  min-height: 36px;
  resize: none;
  font-size: 14px;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #dfe1e6;
  box-shadow: inset 0 0 0 2px #388bff;
  outline: none;
`;

const ButtonRow = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 6px;
  align-items: center;
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 600;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #5e6c84;
  font-weight: 500;
`;

const AddCardTrigger = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 16px 0;
  font-size: 14px;
  color: #172b4d;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(9, 30, 66, 0.14);
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #dfe1e6;
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  min-height: 48px;

  padding: 8px;
  border-radius: 8px;

  /* Thêm hiệu ứng khi kéo vào để người dùng biết họ có thể thả ở đây */
  transition: background-color 0.2s ease;
  background: ${({ $isDraggingOver }) => $isDraggingOver ? 'rgba(12,102,228,0.1)' : 'transparent'};

`;