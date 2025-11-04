import { useState, useEffect, useCallback, useRef } from 'react';
import * as boardApi from '../api/boardApi';
import * as listApi from '../api/listApi';
import * as cardApi from '../api/cardApi';
import { connectBoardSocket } from '../api/wsClient';
import dayjs from 'dayjs';

/**
 * Hook trung tâm quản lý toàn bộ dữ liệu của 1 board.
 * Dữ liệu này được chia sẻ giữa InboxPane, PlannerPane và BoardPane.
 * 
 * @param {number} workspaceId 
 * @param {number} boardId 
 */
export default function useBoardData(workspaceId, boardId) {
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const socketRef = useRef(null);
  const isMounted = useRef(false);

  /** =============== LOAD INITIAL DATA =============== */
  const loadBoard = useCallback(async () => {
    if (!workspaceId || !boardId) return;
    try {
      const res = await boardApi.getBoard(workspaceId, boardId);
      setBoard(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch board info:', err);
    }
  }, [workspaceId, boardId]);

  const loadListsAndCards = useCallback(async () => {
    if (!boardId) return;
    try {
      // 1️⃣ Lấy tất cả danh sách (lists)
      const resLists = await listApi.fetchLists(boardId);
      const fetchedLists = resLists.data || [];

      // 2️⃣ Lấy thẻ trong từng list
      const cardPromises = fetchedLists.map(list => cardApi.fetchCardsByList(list.id));
      const cardResponses = await Promise.all(cardPromises);

      const listsWithCards = fetchedLists.map((list, index) => ({
        ...list,
        cards: cardResponses[index]?.data || []
      }));

      setLists(listsWithCards);

      // 3️⃣ Lấy các thẻ trong Inbox (list = null)
      const resInbox = await cardApi.fetchInboxCards();
      const inboxCards = resInbox.data || [];
      setCards(inboxCards);

    } catch (err) {
      console.error('❌ Failed to load lists or cards:', err);
    }
  }, [boardId]);

  /** =============== REFRESH (cho WS & planner) =============== */
  const refresh = useCallback(async () => {
    await loadListsAndCards();
  }, [loadListsAndCards]);

  /** =============== UPDATE / CREATE / DELETE CARD =============== */
  const updateCardInState = useCallback((updatedCard) => {
    if (!updatedCard?.id) return;

    // Update trong Inbox (cards)
    setCards(prev =>
      prev.map(c => (c.id === updatedCard.id ? { ...c, ...updatedCard } : c))
    );

    // Update trong lists
    setLists(prev =>
      prev.map(l => ({
        ...l,
        cards: l.cards.map(c => (c.id === updatedCard.id ? { ...c, ...updatedCard } : c))
      }))
    );
  }, []);

  /** ✅ Dời ngày hạn của thẻ (Planner dùng) */
  const updateCardDate = useCallback(async (cardId, newDate) => {
    try {
      const res = await cardApi.updateCard(cardId, { due_date: newDate });
      updateCardInState(res.data);
    } catch (err) {
      console.error('❌ Failed to update due_date:', err);
    }
  }, [updateCardInState]);

  /** ✅ Tạo thẻ trong Inbox */
  const createInboxCard = useCallback(async (payload) => {
    try {
      const res = await cardApi.createInboxCard(payload);
      setCards(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to create inbox card:', err);
      throw err;
    }
  }, []);

  /** ✅ Xóa thẻ (dùng cho modal hoặc popup) */
  const deleteCardLocal = useCallback(async (cardId) => {
    try {
      await cardApi.deleteCard(cardId);
      setCards(prev => prev.filter(c => c.id !== cardId));
      setLists(prev =>
        prev.map(l => ({
          ...l,
          cards: l.cards.filter(c => c.id !== cardId)
        }))
      );
    } catch (err) {
      console.error('❌ Failed to delete card:', err);
    }
  }, []);

  /** ✅ Di chuyển card giữa list / inbox */
  const moveCardBetweenLists = useCallback(async (cardId, sourceListId, destListId, newPos) => {
    try {
      const res = await cardApi.updateCard(cardId, {
        list: destListId,
        position: newPos,
        completed: false
      });
      await refresh();
      return res.data;
    } catch (err) {
      console.error('❌ Failed to move card:', err);
    }
  }, [refresh]);

  /** =============== WEBSOCKET REALTIME =============== */
  useEffect(() => {
    if (!boardId) return;

    socketRef.current = connectBoardSocket(boardId, (data) => {
      if (!data?.type) return;
      if (['card_created', 'card_updated', 'card_deleted', 'card_moved'].includes(data.type)) {
        console.log('🔄 WS update received:', data.type);
        refresh();
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [boardId, refresh]);

  /** =============== INITIAL LOAD =============== */
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    (async () => {
      await loadBoard();
      await loadListsAndCards();
    })();
  }, [loadBoard, loadListsAndCards]);

  /** =============== RETURN API =============== */
  return {
    board,
    lists,
    setLists,
    cards,
    setCards,
    refresh,
    updateCardInState,
    updateCardDate,
    createInboxCard,
    deleteCardLocal,
    moveCardBetweenLists,
  };
}
