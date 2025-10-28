// src/features/boards/panel/PlannerPanel/hooks/usePlannerRealtime.jsx
import { useEffect, useRef } from "react";
import { connectBoardSocket, closeBoardSocket } from "../../../../../api/wsClient";

/**
 * 🔄 usePlannerRealtime (phiên bản tương thích TaskNest)
 * Tự động kết nối WebSocket board, và gọi refresh() khi có card thay đổi.
 *
 * @param {number|string} boardId - ID của board hiện tại
 * @param {Function} refresh - Hàm reload lại dữ liệu (thường từ usePlannerData)
 */
export function usePlannerRealtime(boardId, refresh) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!boardId) return;

    // Kết nối WebSocket board
    const socket = connectBoardSocket(boardId);
    socketRef.current = socket;

    console.log(`🌐 [PlannerRealtime] Connected to /ws/boards/${boardId}/`);

    // Xử lý message realtime
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log("[Planner WS] Received:", data);

        if (
          ["card_created", "card_updated", "card_deleted", "card_moved"].includes(data.type)
        ) {
          refresh(); // 🔁 Tải lại dữ liệu Planner
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
    };
  }, [boardId, refresh]);
}
