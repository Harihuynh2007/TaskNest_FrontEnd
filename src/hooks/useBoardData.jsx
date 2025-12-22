import { useState, useEffect, useCallback, useRef } from 'react';
import * as boardApi from '../api/boardApi';
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
  const [lists, setLists] = useState([]); // [{ id, name, cards: [] }]
  const [cards, setCards] = useState([]); // Inbox cards
  const socketRef = useRef(null);
  const loadSeqRef = useRef(0);
  const isMounted = useRef(false);

  /** =============== LOAD BOARD INFO =============== */
  const loadBoard = useCallback(async () => {
    if (!workspaceId || !boardId) return;
    try {
      const res = await boardApi.getBoard(workspaceId, boardId);
      setBoard(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch board info:', err);
    }
  }, [workspaceId, boardId]);

  /** 
   * =============== LOAD ALL LISTS + CARDS =============== 
   * (Dùng API mới tối ưu – fetchPlannerData)
   * Trả về:
   * {
   *    lists: [{id, name, position, cards: [...] }],
   *    inbox: [...]
   * }
   */
const loadListsAndCards = useCallback(async () => {
  if (!boardId) return;

  // Chống race: chỉ response mới nhất được quyền setState
  const seq = ++loadSeqRef.current;

  const normalizeCards = (arr, label = 'cards') => {
    const raw = Array.isArray(arr) ? arr : [];

    // lọc rác: null/undefined/không phải object/thiếu id
    const cleaned = raw.filter((c) => c && typeof c === 'object' && c.id != null);

    // debug nhẹ nếu API trả bẩn
    if (cleaned.length !== raw.length) {
      console.warn(`⚠️ ${label} contains invalid items:`, {
        rawLen: raw.length,
        cleanedLen: cleaned.length,
        invalidCount: raw.length - cleaned.length,
      });
    }

    // sort theo position (nếu có)
    cleaned.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return cleaned;
  };

  try {
    const res = await cardApi.fetchPlannerData(boardId);
    if (seq !== loadSeqRef.current) return; // response cũ -> bỏ

    const data = res?.data || {};
    const rawLists = Array.isArray(data.lists) ? data.lists : [];
    const rawInbox = data.inbox;

    // Chuẩn hoá lists + cards trong từng list
    const formattedLists = rawLists
      .filter((lst) => lst && typeof lst === 'object' && lst.id != null)
      .map((lst) => ({
        ...lst,
        cards: normalizeCards(lst.cards, `list:${lst.id}.cards`),
      }))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const inboxCards = normalizeCards(rawInbox, 'inbox');

    setLists(formattedLists);
    setCards(inboxCards);
  } catch (err) {
    if (seq !== loadSeqRef.current) return;
    console.error('❌ Failed to load planner data:', err);
  }
}, [boardId]);

  /** =============== REFRESH (WS & Planner Panel) =============== */
  const refresh = useCallback(async () => {
    await loadListsAndCards();
  }, [loadListsAndCards]);

  /** =============== UPDATE CARD TRONG STATE =============== */
  const updateCardInState = useCallback((updatedCard) => {
    if (!updatedCard?.id) return;

    // Update inbox cards
    setCards(prev =>
      (Array.isArray(prev) ? prev : []).map(c =>
        c && c.id === updatedCard.id ? { ...c, ...updatedCard } : c
      )
    );

    // Update card trong list
    setLists(prev =>
      prev.map(list => ({
        ...list,
        cards: list.cards.map(c =>
          c.id === updatedCard.id ? { ...c, ...updatedCard } : c
        )
      }))
    );
  }, []);

  /** =============== UPDATE DUE DATE (Planner) =============== */
  const updateCardDate = useCallback(async (cardId, newDate) => {
    try {
      const res = await cardApi.updateCard(cardId, { due_date: newDate });
      updateCardInState(res.data);
    } catch (err) {
      console.error('❌ Failed to update due_date:', err);
    }
  }, [updateCardInState]);

  /** =============== TẠO CARD Ở INBOX =============== */
  const createInboxCard = useCallback(async (payload) => {
    try {
      const res = await cardApi.createInboxCard(payload);
      setCards(prev => [...(Array.isArray(prev) ? prev : []), res.data].filter(c => c && c.id != null));
      return res.data;
    } catch (err) {
      console.error('❌ Failed to create inbox card:', err);
      throw err;
    }
  }, []);

  /** =============== DELETE CARD LOCAL =============== */
  const deleteCardLocal = useCallback(async (cardId) => {
    try {
      await cardApi.deleteCard(cardId);

      setCards(prev => prev.filter(c => c.id !== cardId));

      setLists(prev =>
        prev.map(list => ({
          ...list,
          cards: list.cards.filter(c => c.id !== cardId)
        }))
      );
    } catch (err) {
      console.error('❌ Failed to delete card:', err);
    }
  }, []);

  /** =============== DI CHUYỂN CARD GIỮA LIST/INBOX =============== */
  const moveCardBetweenLists = useCallback(
    async (cardId, sourceListId, destListId, newPos) => {
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
        throw err;
      }
    },
    [refresh]
  );
  /** =============== REALTIME WEBSOCKET =============== */
  useEffect(() => {
    if (!boardId) return;

    socketRef.current = connectBoardSocket(boardId, (data) => {
      if (!data?.type) return;

      if (['card_created', 'card_updated', 'card_deleted', 'card_moved'].includes(data.type)) {
        console.log('🔄 WS update:', data.type);
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
