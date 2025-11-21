import { useEffect, useRef, useCallback } from "react";
import { connectBoardSocket, closeBoardSocket } from "../../../../../api/wsClient";

/**
 * usePlannerRealtime (Optimized)
 * - Debounce refresh() để tránh spam API
 * - Hỗ trợ local mutation nếu server gửi kèm data.card
 *
 * @param {number|string} boardId
 * @param {Function} refresh
 * @param {Function} updateCardLocal (từ usePlannerData) — optional
 * @param {Function} deleteCardLocal (từ usePlannerData) — optional
 */
export function usePlannerRealtime(boardId, refresh, updateCardLocal, deleteCardLocal) {
  const socketRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounce refresh 500ms
  const triggerRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refresh();
    }, 500);
  }, [refresh]);

  useEffect(() => {
    if (!boardId) return;

    const socket = connectBoardSocket(boardId);
    socketRef.current = socket;

    console.log(`🌐 [PlannerRealtime] Connected to /ws/boards/${boardId}/`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const eventType = data.type;
        const card = data.card ?? null;

        // ---- Local update (Cấp độ 2) ----
        if (eventType === "card_updated" && card && updateCardLocal) {
          updateCardLocal(card);
          return;
        }

        if (eventType === "card_created" && card && updateCardLocal) {
          updateCardLocal(card);
          return;
        }

        if (eventType === "card_deleted" && card?.id && deleteCardLocal) {
          deleteCardLocal(card.id);
          return;
        }

        if (eventType === "card_moved" && card && updateCardLocal) {
          updateCardLocal(card);
          return;
        }

        // ---- Fallback: Debounced refresh (Cấp độ 1) ----
        if (
          ["card_created", "card_updated", "card_deleted", "card_moved"].includes(eventType)
        ) {
          triggerRefresh();
        }

      } catch (err) {
        console.error("⚠️ [PlannerRealtime] Parse error:", err);
      }
    };

    socket.onerror = (err) => console.error("❌ [PlannerRealtime] Error:", err);
    socket.onclose = () =>
      console.log(`🔌 [PlannerRealtime] Disconnected from board ${boardId}`);

    return () => {
      closeBoardSocket(boardId);
      socketRef.current = null;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [boardId, refresh, updateCardLocal, deleteCardLocal, triggerRefresh]);
}
