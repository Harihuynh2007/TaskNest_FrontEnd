// src/features/notifications/useNotifications.js
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
function looksLikeNotification(msg) {
  // NotificationSerializer object: {id, created_at, is_read, ...} (backend bắn thẳng object)
  return msg && typeof msg === "object" && msg.id != null && "created_at" in msg && "is_read" in msg;
}

function upsertFirst(prev, item) {
  const idx = prev.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...prev];
  const copy = prev.slice();
  const merged = { ...copy[idx], ...item };
  copy.splice(idx, 1);
  return [merged, ...copy];
}

export default function useNotifications({ enabled = true, pageSize = 50 } = {}) {
  const [tab, setTab] = useState("all");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const reload = useCallback(async () => {
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
    reload();
  }, [enabled, reload]);

  const onWsMessage = useCallback((msg) => {
    // 1) protocol: unread_count
    if (isUnreadCountMsg(msg)) {
      setUnreadCount(msg.count);
      return;
    }

    // 2) protocol: ack mark read/all
    if (isWsAck(msg)) {
      if (msg.type === "mark_all_read_success") {
        setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      } else if (msg.type === "mark_read_success") {
        const ids = new Set(msg.ids || []);
        setItems((prev) => prev.map((n) => (ids.has(n.id) ? { ...n, is_read: true } : n)));
        setUnreadCount((c) => Math.max(0, c - (msg.ids?.length || 0)));
      }
      return;
    }

    // 3) notification payload
    if (looksLikeNotification(msg)) {
      setItems((prev) => upsertFirst(prev, msg));
      if (msg.is_read === false) setUnreadCount((c) => c + 1); // best-effort
      return;
    }

    // ignore unknown
  }, []);

  const { isConnected, sendJSON } = useNotifSocket({
    enabled,
    onMessage: onWsMessage,
  });

  // reconnect xong -> refetch để bù “missed” lúc rớt mạng
  useEffect(() => {
    if (!enabled) return;
    if (isConnected) reload();
  }, [enabled, isConnected, reload]);

  const markItemAsRead = useCallback(async (itemOrId) => {
    const id = typeof itemOrId === "object" ? itemOrId?.id : itemOrId;
    if (!id) return;

    // optimistic
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));

    // WS first, REST fallback
    const ok = isConnected && sendJSON({ type: "mark_read", ids: [id] });
    if (ok) return;

    try {
      await markNotificationRead(id);
    } catch {
      reload();
    }
  }, [isConnected, sendJSON, reload]);

  const markAll = useCallback(async () => {
    // optimistic
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    const ok = isConnected && sendJSON({ type: "mark_all_read" });
    if (ok) return;

    try {
      await markAllRead();
    } catch {
      reload();
    }
  }, [isConnected, sendJSON, reload]);

  return useMemo(() => ({
    tab, setTab,
    onlyUnread, setOnlyUnread,
    items, unreadCount, loading, err,
    reload,
    markItemAsRead,
    markAll,
  }), [tab, onlyUnread, items, unreadCount, loading, err, reload, markItemAsRead, markAll]);
}
