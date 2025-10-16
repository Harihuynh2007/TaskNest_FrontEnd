import React, { useState, useEffect, useRef, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import BoardSubHeader from '../../../../components/BoardSubHeader';
import { FaPlus, FaTimes } from 'react-icons/fa';
import ListColumn from '../../../../components/ListColumn';
import FullCardModal from '../../../../components/Card/FullCardModal';
import CardEditPopup from '../../../../components/Card/CardEditPopup';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { createList, fetchLists, updateList, deleteList } from '../../../../api/listApi';
import { createCardInList, fetchCardsByList, updateCard, deleteCard, batchUpdateCards } from '../../../../api/cardApi';


import ConfirmationModal from '../../../../components/Card/common/ConfirmationModal';
import BoardFilterPopup from '../../../../components/filter/BoardFilterPopup';
import { fetchBoardMembers, fetchBoardLabels, updateBoard } from '../../../../api/boardApi';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import ShareBoardPopup from '../../../../components/member/ShareBoardPopup';
import useTrelloFilter from '../../../../components/hook/useTrelloFilter';
import { WorkspaceContext } from '../../../../contexts';

import { toast } from 'react-hot-toast';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

function getTextColor(bg) {
  const hex = bg?.startsWith('#') ? bg.slice(1) : 'ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#172b4d' : 'white';
}

export default function BoardPane({
  background,
  boardId,
  lists,
  setLists,
  onListDeleted,
  onCloseBoard,
  boardName,
  setBoardName
}) {
  const [, setCards] = useState([]);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeCardInput, setActiveCardInput] = useState(null);
  const [cardInputs, setCardInputs] = useState({});
  const [editPopup, setEditPopup] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const {
    filter,
    setKeyword,
    toggleArrayItem,
    toggleStatusCheckbox,
    toggleDueWithConstraint,
    setDueRangeSingle,
    resetFilter,
  } = useTrelloFilter();

  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const filterButtonRef = useRef(null);

  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const { currentWorkspaceId } = useContext(WorkspaceContext);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const resLists = await fetchLists(boardId);
        const fetchedLists = resLists.data || [];
        const cardPromises = fetchedLists.map(list => fetchCardsByList(list.id));
        const cardResponses = await Promise.all(cardPromises);
        const listsWithCards = fetchedLists.map((list, index) => ({
          ...list,
          cards: Array.isArray(cardResponses[index].data) ? cardResponses[index].data : []
        }));

        setLists(listsWithCards);

        const resMembers = await fetchBoardMembers(boardId);
        const resLabels = await fetchBoardLabels(boardId);
        setMembers(resMembers.data || []);
        setLabels(resLabels.data || []);
      } catch (err) {
        console.error('❌ Failed to fetch data:', err);
        toast.error('Failed to load board data');
      } finally {
        setIsLoading(false);
      }
    };
    if (boardId) loadData();
  }, [boardId, setLists]);

  const handleRenameBoard = async () => {
    if (!boardName.trim()) {
      setIsEditingName(false);
      return;
    }

    try {
      if (!currentWorkspaceId) {
        console.warn("⚠️ Workspace chưa load xong");
        return;
      }

      const res = await updateBoard(currentWorkspaceId, boardId, { name: boardName });

      if (res?.data) {
        setBoardName(res.data.name);
        toast.success("✅ Board renamed successfully!");

        window.dispatchEvent(
          new CustomEvent('board:renamed', {
            detail: { boardId, name: res.data.name }
          })
        );
      }
    } catch (err) {
      console.error("❌ Error renaming board:", err);
      toast.error("Failed to rename board");
    } finally {
      setIsEditingName(false);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const res = await createList(boardId, {
        name: newListTitle,
        background: '',
        visibility: 'private',
        board: boardId,
      });
      setLists((prev) => [...prev, { ...res.data, cards: [] }]);
      setNewListTitle('');
      setShowAddList(false);
      toast.success('✅ List created!');
    } catch (err) {
      console.error('❌ Failed to create list:', err);
      toast.error('Failed to create list');
    }
  };

  const handleAddCard = async (listId) => {
    const text = cardInputs[listId]?.trim();
    if (!text) return;
    const targetList = lists.find((l) => l.id === listId);

    try {
      const res = await createCardInList(listId, {
        name: text,
        status: 'doing',
        background: '',
        visibility: 'private',
        position: targetList?.cards?.length || 0,
      });

      const newCard = res.data;
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, cards: [...(list.cards || []), newCard] } : list
        )
      );
      setCardInputs((prev) => ({ ...prev, [listId]: '' }));
      setActiveCardInput(null);
      toast.success('✅ Card created!');
    } catch (err) {
      console.error('❌ Failed to create card:', err);
      toast.error('Failed to create card');
    }
  };

  const handleCardDeleted = (deletedCardId) => {
    setLists(prevLists =>
      prevLists.map(list => ({
        ...list,
        cards: list.cards.filter(card => card.id !== deletedCardId)
      }))
    );
  };

  const handleToggleCardComplete = async (cardId, listId) => {
    const list = lists.find(l => l.id === listId);
    const cardToUpdate = list?.cards.find(c => c.id === cardId);
    if (!cardToUpdate) return;

    try {
      const res = await updateCard(cardId, { completed: !cardToUpdate.completed });
      const updatedCard = res?.data ?? res;
      setLists(cur =>
        cur.map(l => l.id === listId
          ? { ...l, cards: l.cards.map(c => c.id === cardId ? updatedCard : c) }
          : l
        )
      );
    } catch (error) {
      console.error("Failed to update card status:", error);
      toast.error("Could not update card status.");
    }
  };

  const now = dayjs();

  const filteredLists = lists.map((list) => ({
    ...list,
    cards: list.cards.filter((card) => {
      const name = (card.name || '').toLowerCase();
      const kw = (filter.keyword || '').toLowerCase();
      const matchKeyword = name.includes(kw);

      const s = filter.status;
      const matchStatus =
        s === 'all' ||
        (s === 'completed' && !!card.completed) ||
        (s === 'incomplete' && !card.completed);

      const due = card.due_date ? dayjs(card.due_date) : null;
      const d = Array.isArray(filter.due) ? filter.due : [];
      const checkDueKey = (key) => {
        switch (key) {
          case 'none': return !due;
          case 'overdue': return due && due.isBefore(now, 'day') && !card.completed;
          case 'today': return due && due.isSame(now, 'day');
          case 'week': return due && due.isoWeek() === now.isoWeek();
          case 'month': return due && due.isSame(now, 'month');
          default: return true;
        }
      };

      const matchDue = Array.isArray(d)
        ? (d.length === 0 ? true : d.some(checkDueKey))
        : checkDueKey(d);

      const matchMembers =
        !Array.isArray(filter.members) || filter.members.length === 0
          ? true
          : (card.assignee && filter.members.includes(card.assignee));

      const matchLabels =
        !Array.isArray(filter.labels) || filter.labels.length === 0
          ? true
          : (Array.isArray(card.labels) && filter.labels.some(lb => card.labels.includes(lb)));

      return matchKeyword && matchStatus && matchDue && matchMembers && matchLabels;
    }),
  }));

  useEffect(() => {
    if (showFilter && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 320 - 8,
      });
    }
  }, [showFilter]);

  const textColor = getTextColor(background);

  return (
    <Wrapper $background={background}>
      <BoardSubHeader
        boardName={boardName}
        setBoardName={setBoardName}
        onRenameBoard={handleRenameBoard}
        setShowFilter={setShowFilter}
        filterButtonRef={filterButtonRef}
        onOpenInvite={() => setShowInvitePopup(true)}
        onCloseBoard={onCloseBoard}
      />

      {(editPopup || selectedCard || showInvitePopup) && <DarkOverlay />}

      {isLoading && (
        <LoadingOverlay>
          <Spinner />
          <LoadingText>Loading board...</LoadingText>
        </LoadingOverlay>
      )}

      {selectedCard && (
        <FullCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onCardUpdate={(updatedCard) => {
            setLists((prevLists) =>
              prevLists.map((list) => ({
                ...list,
                cards: list.cards.map((card) =>
                  card.id === updatedCard.id ? updatedCard : card
                ),
              }))
            );
          }}
        />
      )}

      {editPopup && (
        <CardEditPopup
          isInboxMode={false}
          anchorRect={editPopup.anchorRect}
          cardText={editPopup.text}
          onChange={(val) => setEditPopup({ ...editPopup, text: val })}
          onSave={() => {
            setLists((prev) =>
              prev.map((list) =>
                list.id === editPopup.listId
                  ? {
                    ...list,
                    cards: list.cards.map((c, i) =>
                      i === editPopup.index ? { ...c, name: editPopup.text } : c
                    ),
                  }
                  : list
              )
            );
            setEditPopup(null);
          }}
          onDelete={async (card) => {
            try {
              await deleteCard(card.id);  // ✅ Gọi API xóa
              handleCardDeleted(card.id); // ✅ Cập nhật UI
              toast.success('✅ Card deleted!');
            } catch (err) {
              console.error('❌ Failed to delete card:', err);
              toast.error('Failed to delete card');
            }
          }}
          onClose={() => setEditPopup(null)}
          onOpenFullCard={() => {
            setEditPopup(null);
            setSelectedCard(editPopup.card);
          }}
          card={editPopup.card}
          listId={editPopup.listId}
          boardId={boardId}
          updateCardLabels={async (cardId, newLabels) => {
            try {
              const updatedCard = await updateCard(cardId, { labels: newLabels });
              setLists(prevLists =>
                prevLists.map(list => ({
                  ...list,
                  cards: list.cards.map(card =>
                    card.id === cardId ? updatedCard : card
                  )
                }))
              );
            } catch (err) {
              console.error('❌ Failed to update card labels:', err);
              toast.error("Could not update labels.");
            }
          }}
          onCardDeleted={handleCardDeleted}
        />
      )}

      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided) => (
          <BoardContent {...provided.droppableProps} ref={provided.innerRef}>
            {filteredLists.map((list, index) => (
              <Draggable key={list.id} draggableId={`list-${list.id}`} index={index}>
                {(provided, snapshot) => (
                  <ListWrapper
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    $isDragging={snapshot.isDragging}
                  >
                    <ListColumn
                      list={list}
                      background={background}
                      textColor={textColor}
                      cardInput={cardInputs[list.id] || ''}
                      setCardInputs={setCardInputs}
                      activeCardInput={activeCardInput}
                      setActiveCardInput={setActiveCardInput}
                      onAddCard={handleAddCard}
                      onListDeleted={onListDeleted}
                      onCardDeleted={handleCardDeleted} 
                      onEditClick={(e, card, index) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setEditPopup({ anchorRect: rect, index, text: card.name, card, listId: list.id });
                      }}
                      onCheckClick={(cardId) => handleToggleCardComplete(cardId, list.id)}
                      onCardClick={(card) => setSelectedCard(card)}
                    />
                  </ListWrapper>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {showAddList ? (
              <AddListForm onSubmit={handleAddList}>
                <ListTitleInput
                  placeholder="Enter list title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  autoFocus
                />
                <AddListButtons>
                  <AddBtn type="submit">Add list</AddBtn>
                  <CloseBtn type="button" onClick={() => setShowAddList(false)}>
                    <FaTimes />
                  </CloseBtn>
                </AddListButtons>
              </AddListForm>
            ) : (
              <AddListTrigger onClick={() => setShowAddList(true)}>
                <FaPlus /> Add another list
              </AddListTrigger>
            )}
          </BoardContent>
        )}
      </Droppable>

      {showFilter && (
        <BoardFilterPopup
          filter={filter}
          onClose={() => setShowFilter(false)}
          position={popupPos}
          members={members}
          labels={labels}
          setKeyword={setKeyword}
          toggleArrayItem={toggleArrayItem}
          toggleStatusCheckbox={toggleStatusCheckbox}
          toggleDueWithConstraint={toggleDueWithConstraint}
          setDueRangeSingle={setDueRangeSingle}
        />
      )}

      {showInvitePopup && (
        <ShareBoardPopup boardId={boardId} onClose={() => setShowInvitePopup(false)} />
      )}
    </Wrapper>
  );
}

// ==================== ANIMATIONS ====================
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateX(-20px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ==================== STYLED COMPONENTS ====================
const Wrapper = styled.div`
  ${({ $background }) => $background};
  height: 100%;
  overflow: auto;
  animation: ${fadeIn} 0.3s ease-out;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    transition: background 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
`;

const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  animation: ${fadeIn} 0.2s ease-out;
  backdrop-filter: blur(4px);
`;

const LoadingOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #28a745;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.p`
  color: white;
  margin-top: 16px;
  font-size: 16px;
  font-weight: 500;
`;

const BoardContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  overflow-x: auto;
  min-height: calc(100vh - 120px);
  
  /* Custom scrollbar for horizontal scroll */
  &::-webkit-scrollbar {
    height: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    margin: 0 16px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }
`;

const ListWrapper = styled.div`
  animation: ${slideIn} 0.3s ease-out;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $isDragging }) => $isDragging && `
    opacity: 0.8;
    transform: rotate(2deg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  `}
`;

const ListTitleInput = styled.textarea`
  width: 100%;
  min-height: 36px;
  max-height: 256px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #172b4d;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  outline: none;
  overflow: hidden;
  box-sizing: border-box;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #8c9bab;
  }
`;

const AddListForm = styled.form`
  display: flex;
  flex-direction: column;
  min-width: 272px;
  max-width: 272px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out;

  @media (max-width: 768px) {
    min-width: 240px;
    max-width: 240px;
  }
`;

const AddListTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 272px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #172b4d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: rotate(90deg);
  }

  @media (max-width: 768px) {
    min-width: 240px;
    padding: 12px 14px;
  }
`;

const AddListButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const AddBtn = styled.button`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #172b4d;
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #dc3545;
    transform: rotate(90deg);
  }
`;