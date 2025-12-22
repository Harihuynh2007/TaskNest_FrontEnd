// src/features/notifications/useRealtimeNotifications.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useNotifSocket from "./useNotifSocket";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllRead,
  markNotificationRead,
} from "../../api/notificationApi";

function isUnreadCountMsg(msg) {
  return msg && typeof msg === "object" && msg.type === "unread_count" && typeof msg.count === "number";
}
function isWsAck(msg) {
  return msg && typeof msg === "object" && (msg.type === "mark_read_success" || msg.type === "mark_all_read_success");
}
function isNotificationPayload(msg) {
  // NotificationSerializer payload có: id, verb, is_read, created_at, type (card_assigned,...)
  return msg && typeof msg === "object" && msg.id != null && ("created_at" in msg) && ("is_read" in msg);
}

function upsertFirstById(prev, item) {
  const idx = prev.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...prev];
  const copy = prev.slice();
  copy[idx] = { ...copy[idx], ...item };
  // đẩy lên đầu cho “mới nhất”
  copy.splice(idx, 1);
  return [copy[idx], ...copy];
}

export default function useRealtimeNotifications({ enabled = true, pageSize = 50 } = {}) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [list, count] = await Promise.all([
        fetchNotifications({ page_size: pageSize }),
        fetchUnreadCount(),
      ]);
      setItems(list);
      setUnreadCount(count);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  const onWsMessage = useCallback((msg) => {
    // 1) unread_count protocol
    if (isUnreadCountMsg(msg)) {
      setUnreadCount(msg.count);
      return;
    }

    // 2) ack khi mark read/all
    if (isWsAck(msg)) {
      if (msg.type === "mark_all_read_success") {
        setItems((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() })));
        setUnreadCount(0);
      }
      if (msg.type === "mark_read_success") {
        const ids = new Set(msg.ids || []);
        setItems((prev) =>
          prev.map((n) => (ids.has(n.id) ? { ...n, is_read: true, read_at: n.read_at || new Date().toISOString() } : n))
        );
        // backend không bắn unread_count sau mark_read → tự giảm “best effort”
        setUnreadCount((c) => Math.max(0, c - (msg.ids?.length || 0)));
      }
      return;
    }

    // 3) notification payload (serializer) – backend gửi thẳng object
    if (isNotificationPayload(msg)) {
      setItems((prev) => upsertFirstById(prev, msg));
      // unreadCount chuẩn sẽ được backend push qua unread_count; nhưng tăng nhẹ phòng trường hợp race
      if (msg.is_read === false) setUnreadCount((c) => c + 1);
      return;
    }

    // 4) ignore unknown
  }, []);

  const { isConnected, sendJSON } = useNotifSocket({
    enabled,
    onMessage: onWsMessage,
    onOpen: () => {
      // reconnect xong fetch lại để bù “missed notifications” lúc rớt mạng
      refresh();
    },
  });

  const markItemAsRead = useCallback(async (id) => {
    // optimistic
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: n.read_at || new Date().toISOString() } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));

    // ưu tiên WS, fallback REST
    if (isConnected) {
      sendJSON({ type: "mark_read", ids: [id] });
      return;
    }
    try {
      await markNotificationRead(id);
    } catch {
      // nếu REST fail → refresh để đồng bộ lại
      refresh();
    }
  }, [isConnected, sendJSON, refresh]);

  const markAll = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);

    if (isConnected) {
      sendJSON({ type: "mark_all_read" });
      return;
    }
    try {
      await markAllRead();
    } catch {
      refresh();
    }
  }, [isConnected, sendJSON, refresh]);

  return useMemo(() => ({
    items,
    unreadCount,
    loading,
    err,
    isConnected,
    refresh,
    markAll,
    markItemAsRead,
  }), [items, unreadCount, loading, err, isConnected, refresh, markAll, markItemAsRead]);
}
