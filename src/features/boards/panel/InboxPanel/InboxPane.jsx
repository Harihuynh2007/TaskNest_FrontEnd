import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from '@hello-pangea/dnd';

import InboxSubHeader from '../../../../components/InboxSubHeader';
import CardEditPopup from '../../../../components/Card/CardEditPopup';
import FullCardModal from '../../../../components/Card/FullCardModal/FullCardModal';
import CardItem from '../../../../components/Card/sections/CardItem';
import FeedbackPopup from '../../../../components/FeedbackPopup';
import InboxFilterPopup from '../../../../components/filter/InboxFilterPopup';
import useTrelloFilter from '../../../../components/hook/useTrelloFilter';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as cardApi from '../../../../api/cardApi';
import { toast } from 'react-hot-toast';
import useInboxThemeColor from './useInboxThemeColor';
import InboxThemePicker from './InboxThemePicker';
import InboxThemeButton from './InboxThemeButton';
import InboxMenu from "./inbox-menu/InboxMenu";
import SortCardPopup from './sort/SortCardPopup';

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
}) {
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [showSort, setShowSort] = useState(false);
  const [sortPos, setSortPos] = useState({ top: 0, left: 0 });

  
  const {
    inboxColor,
    previewColor,
    effectiveColor,
    setInboxColor,
    applyPreview,
    clearPreview,
  } = useInboxThemeColor();


  const {
    filter,
    setKeyword,
    toggleArrayItem,
    toggleStatusCheckbox,
    toggleDueWithConstraint,
    resetFilter,
    setDueRangeSingle,
  } = useTrelloFilter();

  const handleOpenMenu = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();

      // căn chỉnh để nằm ngay dưới icon, lệch phải 1 chút
      setMenuPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX - 200 + rect.width,
      });

      setShowMenu(true);
    }
  };


  const handleCheckClick = async (cardId, next) => {
    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, completed: next } : c))
    );
    try {
      await cardApi.updateCard(cardId, { completed: next });
    } catch (err) {
      setCards(prev =>
        prev.map(c => (c.id === cardId ? { ...c, completed: !next } : c))
      );
      toast?.error?.('Cập nhật trạng thái thất bại, đã hoàn tác.');
      console.error(err);
    }
  };

  const handleCardDeleted = (deletedCardId) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== deletedCardId));
  };

  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const filterButtonRef = useRef(null);

  const filteredCards = cards.filter((card) => {
    const name = (card.name || '').toLowerCase();
    const kw = (filter.keyword || '').toLowerCase();
    const matchKeyword = name.includes(kw);

    const matchStatus =
      filter.status === 'all' ||
      (filter.status === 'completed' && !!card.completed) ||
      (filter.status === 'incomplete' && !card.completed);

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
    const inWeek = due && due.isoWeek() === today.isoWeek() && due.year() === today.year();
    const inMonth = due && due.month() === today.month() && due.year() === today.year();

    const matchDue =
      (!selectedNone && !selectedOverdue && !selectedRange)
        ? true
        : (selectedNone && isNone) ||
          (selectedOverdue && isOverdue) ||
          (!!selectedRange &&
            ((selectedRange === 'today' && inToday) ||
              (selectedRange === 'week' && inWeek) ||
              (selectedRange === 'month' && inMonth)));

    const created = card.created_at ? dayjs(card.created_at) : null;
    const createdSel = Array.isArray(filter.created) ? filter.created : [];

    const matchCreated =
      createdSel.length === 0
        ? true
        : createdSel.some((k) => {
            switch (k) {
              case 'week':
                return created && created.isoWeek() === today.isoWeek() && created.year() === today.year();
              case '2weeks':
                return created && created.isAfter(today.subtract(14, 'day'));
              case 'month':
                return created && created.month() === today.month() && created.year() === today.year();
              default:
                return true;
            }
          });

    return matchKeyword && matchStatus && matchDue && matchCreated;
  });


  useEffect(() => {
    if (!showFilter || !filterButtonRef.current) return;

    const updateFilterPos = () => {
      const rect = filterButtonRef.current.getBoundingClientRect();
      const popupWidth = 340; // đúng với InboxFilterPopup
      const popupHeight = 400;
      const margin = 6;

      const top = Math.min(
        rect.bottom + window.scrollY + margin,
        window.scrollY + window.innerHeight - popupHeight - margin
      );

      const left = Math.min(
        rect.left + window.scrollX - popupWidth - 12,
        window.scrollX + window.innerWidth - popupWidth - margin
      );

      setPopupPos({ top, left });
    };

    updateFilterPos();

    window.addEventListener("resize", updateFilterPos);
    window.addEventListener("scroll", updateFilterPos, true);

    return () => {
      window.removeEventListener("resize", updateFilterPos);
      window.removeEventListener("scroll", updateFilterPos, true);
    };
  }, [showFilter]);


  useEffect(() => {
    if (!showMenu || !menuButtonRef.current) return;

    // 🔹 Hàm cập nhật vị trí popover theo icon
    const updatePosition = () => {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const menuWidth = 260;
      const menuHeight = 220;

      // Clamp để tránh tràn khỏi viewport
      const top = Math.min(
        rect.bottom + window.scrollY + 6,
        window.scrollY + window.innerHeight - menuHeight - 10
      );
      const left = Math.min(
        rect.left + window.scrollX - 200 + rect.width,
        window.scrollX + window.innerWidth - menuWidth - 10
      );

      setMenuPos({ top, left });
    };

    // Gọi ngay khi menu mở để set vị trí lần đầu
    updatePosition();

    // Lắng nghe resize & scroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    // Cleanup khi menu đóng
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showMenu, menuButtonRef]);

  const handleBackToMenu = () => {
    setShowSort(false);
    setShowMenu(true);
  };


  return (
    <PaneWrapper $background={effectiveColor}>
      <InboxSubHeader
        setShowFeedback={setShowFeedback}
        setShowFilter={setShowFilter}
        filterButtonRef={filterButtonRef}
        onOpenMenu={handleOpenMenu}
        menuButtonRef={menuButtonRef} 
      />
      

      {editPopup && <DarkOverlay />}
      <InnerContent>
        
        <InboxThemeButton />
        
        {selectedCard && (
          <FullCardModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onCardUpdate={(updatedCard) => {
              setCards((prev) => prev.map((card) => card.id === updatedCard.id ? updatedCard : card));
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
              <CancelButton onClick={() => { setShowInput(false); setInputValue(''); }}>Cancel</CancelButton>
            </ButtonRow>
          </CardInputWrapper>
        ) : (
          <AddCardTrigger onClick={() => setShowInput(true)}>+ Add a new card</AddCardTrigger>
        )}

        <Droppable droppableId="inbox" type="CARD">
          {(provided, snapshot) => (
            <CardList
              ref={provided.innerRef}
              {...provided.droppableProps}
              $isDraggingOver={snapshot.isDraggingOver}
            >
              {filteredCards.map((card, index) => (
                <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                  {(provided, snapshot) => (
                    <DraggableCardWrapper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      $isDragging={snapshot.isDragging}
                      data-is-dragging={snapshot.isDragging}
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
                    </DraggableCardWrapper>
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
              const c = editPopup?.card;
              setEditPopup(null);
              if (c) setSelectedCard(c); 
            }}
            isInboxMode={true}
            onCardDeleted={handleCardDeleted}
            onSelect={async (key, c) => {
              switch (key) {
                case 'open': {
                  const card = editPopup?.card;
                  setEditPopup(null);
                  if (card) setSelectedCard(card);
                  break;
                }
                case 'labels': {
                  toast?.('Labels: tính năng sắp có');
                  break;
                }
                case 'dates': {
                  toast?.('Dates: tính năng sắp có');
                  break;
                }
                case 'checklist': {
                  toast?.('Checklist: tính năng sắp có');
                  break;
                }
                case 'attachment': {
                  toast?.('Attachment: tính năng sắp có');
                  break;
                }
                case 'members': {
                  toast?.('Members: tính năng sắp có');
                  break;
                }
                case 'delete': {
                  try {
                    await cardApi.deleteCard(c.id);
                    if (typeof handleCardDeleted === 'function') handleCardDeleted(c.id);
                    toast?.success?.('Đã xoá thẻ');
                  } catch (err) {
                    console.error(err);
                    toast?.error?.('Xoá thẻ thất bại');
                  } finally {
                    setEditPopup(null);
                  }
                  break;
                }
                default:
                  break;
              }
            }}
          />
        )}


        {showMenu && (
          <InboxMenu
            position={menuPos}
            style={{ pointerEvents: showMenu ? "auto" : "none" }}
            onClose={() => setShowMenu(false)}
            onSelect={(key) => {
              switch (key) {
                case "sort": {
                  setShowMenu(false);
                  setShowSort(true);
                  break;
                }
                case "filter":
                  setShowFilter(true);
                  break;
                case "ai":
                  toast("AI Smart Assistant đang chạy...");
                  break;
                case "settings":
                  toast("Mở phần Settings");
                  break;
                default:
                  break;
              }
              setShowMenu(false);
            }}
          />
        )}

        {showSort && (
          <SortCardPopup
            anchorEl={menuButtonRef.current}
            onClose={() => setShowSort(false)}
            onBack={handleBackToMenu}
            onSelect={(key) => {
              const sorted = [...cards];
              switch (key) {
                case 'created_newest':  sorted.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)); break;
                case 'created_oldest':  sorted.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)); break;
                case 'name_az':         sorted.sort((a,b)=> (a.name||'').localeCompare(b.name||'')); break;
                case 'name_za':         sorted.sort((a,b)=> (b.name||'').localeCompare(a.name||'')); break;
                case 'due_earliest':    sorted.sort((a,b)=> new Date(a.due_date||'9999-12-31') - new Date(b.due_date||'9999-12-31')); break;
                case 'due_latest':      sorted.sort((a,b)=> new Date(b.due_date||'1970-01-01') - new Date(a.due_date||'1970-01-01')); break;
                case 'completed_first': sorted.sort((a,b)=> (b.completed?1:0) - (a.completed?1:0)); break;
                case 'incomplete_first':sorted.sort((a,b)=> (a.completed?1:0) - (b.completed?1:0)); break;
                default: break;
              }
              setCards(sorted);
              setShowSort(false);
            }}
          />
        )}

      </InnerContent>
    </PaneWrapper>
  );
}

const PaneWrapper = styled.div`
  background: ${({ $background }) => $background || 'var(--surface-1, #171c26)'};
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;


const InnerContent = styled.div`
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 0 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;

const CardInputWrapper = styled.div`
  background: var(--surface-2, #1f2633);
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const Input = styled.textarea`
  width: 100%;
  min-height: 40px;
  font-size: 15px;
  padding: 8px 10px;
  background: var(--surface-1, #171c26);
  color: var(--text-primary, #e1e3e6);
  border: 1px solid #2c3748;
  border-radius: 6px;
  resize: none;
  outline: none;
  box-shadow: inset 0 0 0 1px #2c3748;

  &:focus {
    box-shadow: 0 0 0 2px var(--brand-primary, #4aa8ff);
    border-color: transparent;
  }
`;

const ButtonRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 8px;
`;

const AddButton = styled.button`
  background: var(--brand-primary, #28a745);
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #219638;
  }
`;

const CancelButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: #cbd5e1;
  }
`;

const AddCardTrigger = styled.div`
  background-color: var(--surface-2, #1f2633);
  border-radius: 10px;
  padding: 10px 14px;
  color: #cbd5e1;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  border: 1px dashed #2a3342;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background-color: #273143;
    border-color: var(--brand-primary, #4aa8ff);
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  min-height: 48px;
  transition: background-color 0.2s ease;
  background: ${({ $isDraggingOver }) => $isDraggingOver ? 'rgba(74,168,255,0.08)' : 'transparent'};
`;

const DraggableCardWrapper = styled.div`
  width: 100%;
  cursor: grab;
  transition: transform 0.2s ease;

  ${({ $isDragging }) => $isDragging && `
    width: 272px;
    margin: 0 auto;
    cursor: grabbing;
    box-shadow: 0 6px 16px rgba(0,0,0,0.25);
  `}
`;
