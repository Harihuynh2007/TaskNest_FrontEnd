import React, { useState, useEffect, useContext  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import InboxPane from './panel/InboxPanel/InboxPane.jsx';
import PlannerPane from './panel/PlannerPanel/PlannerPane.jsx';
import BoardPane from './panel/BoardPanel/BoardPane';

import dayjs from 'dayjs';
import BottomFloatingNav from './BottomFloatingNav';
import SwitchBoardOverlay from './SwitchBoard/SwitchBoardOverlay.jsx';

import FullCardModal from '../../components/Card/FullCardModal/FullCardModal.jsx';
import ConfirmationModal from '../../components/Card/common/ConfirmationModal.jsx';

import { updateList, deleteList  } from '../../api/listApi.js';
import { getBoard, updateBoard } from '../../api/boardApi.js';
import { DragDropContext } from '@hello-pangea/dnd';

import { fetchInboxCards, updateCard, createInboxCard,batchUpdateCards } from '../../api/cardApi'; 

import { AuthContext } from '../../contexts/AuthContext.jsx';

import { useRecentBoards } from '../../hooks/useRecentBoards';

const DEFAULT_WEEK_PALETTE = [
  '#8E9AAF', // Sun
  '#58AFF6', // Mon
  '#6EE7B7', // Tue
  '#FBBF24', // Wed
  '#F472B6', // Thu
  '#A78BFA', // Fri
  '#F87171'  // Sat
];
const LS_KEYS = (boardId) => ({
  auto: `board:${boardId}:autoWeekday`,
  palette: `board:${boardId}:weekPalette`
});


export default function BoardDetailPage() {
  const navigate = useNavigate();
  const { workspaceId, boardId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const numericBoardId = parseInt(boardId);
  const [background, setBackground] = useState('#e4f0f6');
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState(['inbox']);
  const [cards, setCards] = useState([]);
  const [lists, setLists] = useState([
    { id: 1, title: 'To Do', cards: [] },
    { id: 2, title: 'Doing', cards: [] },
    { id: 3, title: 'Done', cards: [] },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editPopup, setEditPopup] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const [listToDelete, setListToDelete] = useState(null); // Sẽ lưu { id, name, cards }

  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const [boardName, setBoardName] = useState('');
  const { addToRecent, removeFromRecent } = useRecentBoards();

  const [autoWeekday, setAutoWeekday] = useState(false);
  const [weekPalette, setWeekPalette] = useState(DEFAULT_WEEK_PALETTE);
  const [todayIndex, setTodayIndex] = useState(dayjs().day()); // 0..6
  const resolvedBackground = autoWeekday ? weekPalette[todayIndex] : background;

  
    // Load theme preferences from localStorage by boardId
  useEffect(() => {
    if (!boardId) return;
    const { auto, palette } = LS_KEYS(boardId);
    const savedAuto = localStorage.getItem(auto);
    const savedPalette = localStorage.getItem(palette);

    if (savedAuto != null) setAutoWeekday(savedAuto === 'true');
    if (savedPalette) {
      try {
        const parsed = JSON.parse(savedPalette);
        if (Array.isArray(parsed) && parsed.length === 7) setWeekPalette(parsed);
      } catch (_) {}
    }
  }, [boardId]);

  // Nếu bật Auto → set màu theo hôm nay, và hẹn giờ đổi vào 00:00 hôm sau
  useEffect(() => {
    if (!autoWeekday) return;
    setTodayIndex(dayjs().day());
    const now = dayjs();
    const nextMidnight = now.add(1, 'day').startOf('day');
    const ms = nextMidnight.diff(now, 'millisecond');
    const t = setTimeout(() => setTodayIndex(dayjs().day()), ms);
    return () => clearTimeout(t);
  }, [autoWeekday, todayIndex]);

  // Persist auto & palette
  useEffect(() => {
    if (!boardId) return;
    const { auto, palette } = LS_KEYS(boardId);
    localStorage.setItem(auto, String(autoWeekday));
    localStorage.setItem(palette, JSON.stringify(weekPalette));
  }, [boardId, autoWeekday, weekPalette]);


  const handleConfirmCloseBoard = async () => {
    setShowCloseConfirm(false);
    
    try {
      // updateBoard = (workspaceId, boardId, data) => api.patch(...)
      await updateBoard(workspaceId, boardId, { is_closed: true });
      removeFromRecent(Number(boardId));
      navigate('/boards'); 
    } catch (err) {
      console.error('❌ Failed to close board:', err);
      // Hiển thị thông báo lỗi
    }
  };

  const handleDeleteListRequest = (listId, listName, cardsInList) => {
    setListToDelete({ id: listId, name: listName, cards: cardsInList });
  };

  //  TẠO HÀM XÁC NHẬN XÓA
  const handleConfirmDeleteList = async () => {
    if (!listToDelete) return;

    const { id: listIdToDelete, cards: cardsToMove } = listToDelete;

    // B1: Optimistic UI
    // Xóa cột khỏi `lists` state
    setLists(prevLists => prevLists.filter(list => list.id !== listIdToDelete));
    // Thêm các thẻ của cột đó vào `cards` (Inbox) state
    setCards(prevCards => [...prevCards, ...cardsToMove]);

    // B2: Đóng modal
    setListToDelete(null);

    // B3: Gọi API
    try {
      await deleteList(listIdToDelete);
    } catch (err) {
      console.error('❌ Failed to delete list:', err);
      // TODO: Rollback state nếu API thất bại
    }
  };

  const handleCloseBoardRequest = () => {
        setShowCloseConfirm(true);
    };


  useEffect(() => {
    async function loadBoard() {
      if (!workspaceId || !boardId) return;
      setLoading(true);
      try {
        const res = await getBoard(workspaceId, boardId);
        const boardData = res.data;
        
        setBoardName(boardData.name);
        setBackground(boardData.background || '#e4f0f6');
        
        // ✅ Add to recent với đầy đủ thông tin
        addToRecent({
          id: boardData.id,
          name: boardData.name,
          background: boardData.background,
          workspaceId: Number(workspaceId),
          workspaceName: boardData.workspace?.name || undefined
        });
      } catch (err) {
        console.error('Failed to load board:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBoard();
  }, [workspaceId, boardId, addToRecent]);

  useEffect(() => {
    const loadInboxCards = async () => {
      try {
        const res = await fetchInboxCards(); // gọi API cards/ => card không có list
        setCards(res.data || []);
      } catch (err) {
        console.error('❌ Lỗi load inbox cards:', err);
      }
    };
    loadInboxCards();
  }, [boardId]);
  

  // useEffect(() => {
//   console.log('Attempting to connect to WebSocket for board:', boardId);
//   if (!boardId) return; // Add a guard clause

//   const socket = new WebSocket('ws://127.0.0.1:8000/ws/boards/' + boardId + '/');
  
//   socket.onopen = () => {
//     console.log('WebSocket connection established.');
//   };

//   socket.onmessage = (event) => {
//     console.log('WebSocket message received:', event.data);
//     const data = JSON.parse(event.data);
//     if (data.type === 'card_update') {
//       // Handle updates here
//     }
//   };

//   socket.onerror = (error) => {
//     console.error('WebSocket Error:', error);
//   };

//   socket.onclose = (event) => {
//     if (event.wasClean) {
//       console.log(`WebSocket closed cleanly, code=${event.code} reason=${event.reason}`);
//     } else {
//       console.error('WebSocket connection died');
//     }
//   };

//   return () => {
//     console.log('Closing WebSocket connection.');
//     socket.close();
//   };
// }, [boardId]);

  const [openThemePanel, setOpenThemePanel] = useState(false);

  const toggleAutoWeekday = () => setAutoWeekday(v => !v);
  const updateWeekColorAt = (idx, color) => {
    const next = [...weekPalette];
    next[idx] = color || next[idx];
    setWeekPalette(next);
  };
  const handleAddCard = async () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === '') {
      console.log("Input is empty, not creating card.");
      return;
    }

    // Xây dựng payload một cách rõ ràng
    const payload = {
      name: trimmedValue,
      position: cards.length, // Hoặc một logic tính position khác nếu bạn có
    };

    // Log payload trước khi gửi đi để debug
    console.log("Preparing to create inbox card with payload:", payload);

    try {
      const res = await createInboxCard(payload);
      
      setCards((prev) => [...prev, res.data]);
      setInputValue('');
      setShowInput(false);

    
    } catch (err) {
      if (err.response) {
        console.error('❌ Backend Error:', err.response.data);
      } else {
        console.error('❌ Network or other error:', err.message);
      }
    }
  };


  
  const onDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    let movedCard;
    let originalCards = [...cards]; // Lưu trạng thái ban đầu để rollback
    let originalLists = [...lists]; // Lưu trạng thái ban đầu để rollback

    try {
      if (type === 'column') {
        // Reorder cột trong BoardPane
        const newLists = [...lists];
        const [moved] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, moved);
        setLists(newLists);

        // Cập nhật position của các cột
        await Promise.all(
          newLists.map((list, index) => updateList(list.id, { position: index }))
        );
        return;
      }

      // Xử lý kéo thả thẻ
      if (source.droppableId === destination.droppableId) {
        if (source.droppableId === 'inbox') {
          // Reorder trong Inbox
          const newCards = [...cards];
          [movedCard] = newCards.splice(source.index, 1);
          newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          setCards(newCards);

          // Cập nhật position cho tất cả thẻ trong Inbox
          for (let i = 0; i < newCards.length; i++) {
            await updateCard(newCards[i].id, { list: null, position: i });
          }

        } else {
          // Reorder trong cùng một list
          const listId = parseInt(source.droppableId.replace('list-', ''));
          const newLists = [...lists];
          const listIndex = newLists.findIndex((l) => l.id === listId);
          if (listIndex === -1) return;

          const newCards = [...newLists[listIndex].cards];
          [movedCard] = newCards.splice(source.index, 1);
          newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          newLists[listIndex] = { ...newLists[listIndex], cards: newCards };
          setLists(newLists);

          // Cập nhật position cho tất cả thẻ trong list
          await Promise.all(
            newCards.map((card, index) =>
              updateCard(card.id, { list: listId, position: index })
            )
          );
        }
      } else {
        const sourceListId = source.droppableId.startsWith('list-')
          ? parseInt(source.droppableId.replace('list-', ''))
          : null;
        const destListId = destination.droppableId.startsWith('list-')
          ? parseInt(destination.droppableId.replace('list-', ''))
          : null;

        if (source.droppableId === 'inbox') {
          // Kéo từ Inbox sang list
          const newCards = [...cards];
          [movedCard] = newCards.splice(source.index, 1);
          setCards(newCards);

          const destList = lists.find((l) => l.id === destListId);
          if (!destList) return;

          const newLists = [...lists];
          const destListIndex = newLists.findIndex((l) => l.id === destListId);
          const newDestCards = [...newLists[destListIndex].cards];
          newDestCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          newLists[destListIndex] = { ...newLists[destListIndex], cards: newDestCards };
          setLists(newLists);

          // Cập nhật list và position cho thẻ được kéo
          await updateCard(movedCard.id, {
            list: destListId,
            position: destination.index,
            completed: destList.title === 'Done',
          });

          // Cập nhật position cho tất cả thẻ trong danh sách đích
          await Promise.all(
            newDestCards.map((card, index) =>
              updateCard(card.id, { list: destListId, position: index })
            )
          );

          // Cập nhật position cho tất cả thẻ còn lại trong Inbox
          await Promise.all(
            newCards.map((card, index) =>
              updateCard(card.id, { position: index })
            )
          );
        } else if (destination.droppableId === 'inbox') {
          // Kéo từ list sang Inbox
          const newLists = [...lists];
          const sourceListIndex = newLists.findIndex((l) => l.id === sourceListId);
          if (sourceListIndex === -1) return;

          const sourceCards = [...newLists[sourceListIndex].cards];
          [movedCard] = sourceCards.splice(source.index, 1);
          newLists[sourceListIndex] = { ...newLists[sourceListIndex], cards: sourceCards };
          setLists(newLists);

          const newCards = [...cards];
          newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          setCards(newCards);

          // Cập nhật list=null và position cho thẻ được kéo
          await updateCard(movedCard.id, {
            list: null,
            position: destination.index,
            completed: false,
          });

          // Cập nhật position cho tất cả thẻ trong Inbox
          await Promise.all(
            newCards.map((card, index) =>
              updateCard(card.id, { position: index })
            )
          );

          // Cập nhật position cho tất cả thẻ trong danh sách nguồn
          await Promise.all(
            sourceCards.map((card, index) =>
              updateCard(card.id, { list: sourceListId, position: index })
            )
          );
        } else {
          // Kéo giữa các list trong BoardPane
          const newLists = [...lists];
          const sourceListIndex = newLists.findIndex((l) => l.id === sourceListId);
          const destListIndex = newLists.findIndex((l) => l.id === destListId);
          if (sourceListIndex === -1 || destListIndex === -1) return;

          const sourceCards = [...newLists[sourceListIndex].cards];
          const destCards = [...newLists[destListIndex].cards];
          [movedCard] = sourceCards.splice(source.index, 1);
          destCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          newLists[sourceListIndex] = { ...newLists[sourceListIndex], cards: sourceCards };
          newLists[destListIndex] = { ...newLists[destListIndex], cards: destCards };
          setLists(newLists);

          // Cập nhật list và position cho thẻ được kéo
          await updateCard(movedCard.id, {
            list: destListId,
            position: destination.index,
            completed: newLists[destListIndex].title === 'Done',
          });

          // Cập nhật position cho tất cả thẻ trong danh sách đích
          await Promise.all(
            destCards.map((card, index) =>
              updateCard(card.id, { list: destListId, position: index })
            )
          );

          // Cập nhật position cho tất cả thẻ trong danh sách nguồn
          await Promise.all(
            sourceCards.map((card, index) =>
              updateCard(card.id, { list: sourceListId, position: index })
            )
          );
        }
      }
    } catch (err) {
      console.error('❌ Lỗi kéo thả:', err);
      // Rollback trạng thái
      setCards(originalCards);
      setLists(originalLists);
    }
  };
  

  const toggleTab = (tabName) => {
    setActiveTabs((prev) =>
      prev.includes(tabName)
        ? prev.length > 1
          ? prev.filter((t) => t !== tabName)
          : prev
        : [...prev, tabName]
    );
  };

  const toggleComplete = async (cardId) => {
    const cardToUpdate = cards.find(c => c.id === cardId);
    if (!cardToUpdate) return;
    
    try {
      const { data } = await updateCard(cardId, { completed: !cardToUpdate.completed });
      updateCardInState(data);
    } catch (err) {
      console.error('❌ Lỗi cập nhật completed:', err);
    }
  };


  const handleSaveCard = async () => {
    if (editPopup) {
      try {
        const updated = [...cards];
        const card = updated[editPopup.index];

        const res = await updateCard(card.id, {
          name: editPopup.text,
        });

        updated[editPopup.index] = { ...card, ...res.data };
        setCards(updated);
        setEditPopup(null);
      } catch (err) {
        console.error('❌ Lỗi update card:', err);
      }
    }
  };


  const renderPanes = () => (
    <SplitContainer>
      {activeTabs.includes('inbox') && (
        <InboxPane
          cards={cards}
          setCards={setCards}
          inputValue={inputValue}
          setInputValue={setInputValue}
          showInput={showInput}
          setShowInput={setShowInput}
          editPopup={editPopup}
          setEditPopup={setEditPopup}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          handleAddCard={handleAddCard}
          toggleComplete={toggleComplete}
          handleSaveCard={handleSaveCard}
        />
      )}
      {activeTabs.includes('planner') && <PlannerPane background="#e4f0f6" />}
      {activeTabs.includes('board') && 
      <BoardPane 
      background={background}
      boardId={numericBoardId}
      lists={lists}
      setLists={setLists}
      boardName={boardName}
      setBoardName={setBoardName}
      onListDeleted={handleDeleteListRequest}
      onCloseBoard={handleCloseBoardRequest}
       />}
    </SplitContainer>
  );

  const ensureCardStructure = (card) => ({
    id: card.id,
    name: card.name || '',
    description: card.description || '',
    due_date: card.due_date || null,
    completed: card.completed ?? false,
    list: card.list || null,
    visibility: card.visibility || 'private',
    status: card.status || 'doing',
    position: card.position ?? 0,
    labels: card.labels || [],
  });

  // TẠO HÀM CẬP NHẬT TRUNG TÂM
  const updateCardInState = (updatedCard) => {
    if (!updatedCard || !updatedCard.id) return; // Guard clause
    const normalizedCard = ensureCardStructure(updatedCard);

    // Cập nhật cho BoardPane
    setLists(prevLists =>
      prevLists.map(list => ({
        ...list,
        cards: list.cards.map(card =>
          card.id === normalizedCard.id ? normalizedCard : card
        )
      }))
    );

    setCards(prevCards =>
      prevCards.map(card =>
        card.id === normalizedCard.id ? normalizedCard : card
      )
    );
  };

  if (loading) return <div>Loading board...</div>;


  return (
    <>
      {editPopup && <DarkOverlay />}

      <BoardWrapper $background={resolvedBackground}>
        <DragDropContext onDragEnd={onDragEnd}>
            {renderPanes()}
        </DragDropContext>
        <BottomFloatingNav 
          activeTabs={activeTabs} 
          toggleTab={toggleTab} 
          activeCount={activeTabs.length} 
        />

        <SwitchBoardOverlay
          isOpen={activeTabs.includes('switch')}
          onClose={() => toggleTab('switch')}
        />
      </BoardWrapper>

      <ConfirmationModal
          show={!!listToDelete}
          onClose={() => setListToDelete(null)}
          onConfirm={handleConfirmDeleteList}
          title="Delete List?"
          body={
            listToDelete && `Are you sure you want to delete the list "${listToDelete.name}"? 
            All ${listToDelete.cards.length} cards in this list will be moved to your Inbox.`
          }
          confirmText="Delete and Move Cards"
          confirmVariant="danger" // Vẫn dùng màu đỏ vì đây là hành động lớn
      />


      {/* ✅ RENDER MODAL XÁC NHẬN ĐÓNG BẢNG */}
      <ConfirmationModal
        show={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleConfirmCloseBoard}
        title="Close Board?"
        body="Are you sure you want to close this board? You can find and reopen closed boards later."
        confirmText="Close"
        confirmVariant="danger"
      />  
      {selectedCard && (
        <FullCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onCardUpdate={updateCardInState} // Giả sử bạn đã có hàm trung tâm này
          
          // 4. TRUYỀN BIẾN currentUser VÀO ĐÂY
          currentUser={currentUser} 
        />
      )}
           
      {activeTabs.includes('board') && (
        <ThemeFab
          onClick={() => setOpenThemePanel(true)}
          aria-label="Open theme settings"
          title="Theme"
        >
          🎨
        </ThemeFab>
      )}

      

      {/* Theme Panel */}
      {openThemePanel && (
        <ThemePanel role="dialog" aria-label="Theme panel">
          <PanelHeader>
            <strong>Board Theme</strong>
            <CloseX onClick={() => setOpenThemePanel(false)} aria-label="Close">×</CloseX>
          </PanelHeader>

          <Section>
            <label className="row">
              <input
                type="checkbox"
                checked={autoWeekday}
                onChange={toggleAutoWeekday}
              />
              <span style={{ marginLeft: 8, fontWeight: 600 }}>Auto change by weekday</span>
            </label>
            <p className="hint">
              When enabled, today’s background color is used from the 7-day palette.
            </p>
          </Section>

          {autoWeekday ? (
            <WeekGrid>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <WeekCell key={d} data-active={i===todayIndex}>
                  <span className="day">{d}</span>
                  <input
                    type="color"
                    value={weekPalette[i]}
                    onChange={(e) => updateWeekColorAt(i, e.target.value)}
                    aria-label={`Pick color for ${d}`}
                  />
                </WeekCell>
              ))}
            </WeekGrid>
          ) : (
            <Section>
              <p className="hint" style={{ marginBottom: 8 }}>Pick a static background:</p>
              <Row>
                {['#A869C1','#228CD5','#00B8FF','#F06292','#0277BD','#111827','#0f172a'].map(c => (
                  <Swatch
                    key={c}
                    style={{ background: c }}
                    data-active={background===c}
                    onClick={() => setBackground(c)}
                    aria-label={`Pick ${c}`}
                  />
                ))}
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  aria-label="Pick custom color"
                  className="color-input"
                />
              </Row>
            </Section>
          )}

          <LivePreview style={{ background: resolvedBackground }}>
            Live preview
          </LivePreview>
        </ThemePanel>
      )}

    </>
  );
}

const BoardWrapper = styled.div`
  background: ${({ $background }) => $background};
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const SplitContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  > * {
    flex: 1;
    min-width: 240px;
    overflow-y: auto;
    border-left: 1px solid #ddd;
    &:first-child {
      border-left: none;
    }
  }
`;

const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
`;

const ThemeFab = styled.button`
  position: fixed;
  right: 20px;
  bottom: 24px;
  width: 56px; height: 56px;
  border-radius: 50%;
  border: 1px solid #2a2f3b;
  background: rgba(20,24,33,0.7);
  backdrop-filter: blur(4px);
  color: #e5e7eb;
  font-size: 24px;
  display: grid; place-items: center;
  cursor: pointer; z-index: 1001;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  transition: transform .12s ease, background .12s ease;
  &:hover { transform: translateY(-2px); background: rgba(20,24,33,0.9); }
  &:focus-visible { outline: 2px solid #58aff6; outline-offset: 2px; }
`;

const ThemePanel = styled.div`
  position: fixed;
  right: 20px;
  bottom: 92px;
  width: 320px;
  background: #0f172a; /* slate-900 */
  color: #e5e7eb;
  border: 1px solid #1f2937;
  border-radius: 16px;
  padding: 12px 12px 16px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.45);
  z-index: 1002;
  .hint { color: #9ca3af; font-size: 12px; margin-top: 6px; }
  .color-input { width: 40px; height: 32px; border: 1px solid #374151; background: transparent; border-radius: 6px; padding: 0; cursor: pointer; }
`;

const PanelHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
`;

const CloseX = styled.button`
  width: 28px; height: 28px; border-radius: 50%;
  background: transparent; color: #9ca3af; border: 1px solid #253049;
  display: grid; place-items: center; cursor: pointer;
  &:hover { background: #111827; color: #e5e7eb; }
`;

const Section = styled.div`
  background: #0b1220; border: 1px solid #1e293b; border-radius: 12px;
  padding: 10px; margin: 10px 0;
`;

const Row = styled.div`
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
`;

const Swatch = styled.button`
  width: 36px; height: 28px; border-radius: 6px; border: 1px solid #2a2f3b;
  cursor: pointer; position: relative;
  &[data-active='true'] { outline: 2px solid #58aff6; outline-offset: 1px; }
`;

const WeekGrid = styled.div`
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-top: 8px;
`;

const WeekCell = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: #0b1220; border: 1px solid #1f2937; border-radius: 10px; padding: 6px;
  .day { font-size: 11px; color: #9ca3af; }
  &[data-active='true'] { border-color: #58aff6; box-shadow: 0 0 0 2px rgba(88,175,246,.15) inset; }
`;

const LivePreview = styled.div`
  height: 64px; border-radius: 10px; display: grid; place-items: center;
  margin-top: 10px; border: 1px solid #1f2937; color: #111827; font-weight: 700;
  background-clip: padding-box;
`;
