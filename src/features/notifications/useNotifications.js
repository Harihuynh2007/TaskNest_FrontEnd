// src/features/notifications/useNotifications.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchNotifications, markAsRead, markAllAsRead, getUnreadCount } from "../../api/notificationApi";

export default function useNotifications() {
  const [tab, setTab] = useState("all");          // all | unread | mentions
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const params = {
        is_read: tab === "unread" || onlyUnread ? false : undefined,
        mentions: tab === "mentions" ? true : undefined,
      };
      const [listRes, unreadRes] = await Promise.all([
        fetchNotifications(params),
        getUnreadCount(),
      ]);
      const data = listRes?.data?.results || listRes?.data || [];
      setItems(data);
      setUnreadCount(unreadRes?.data?.count ?? 0);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [tab, onlyUnread]);

  useEffect(() => { load(); }, [load]);

  const markItemAsRead = useCallback(async (id) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, is_read: true } : it));
    setUnreadCount(c => Math.max(0, c - 1));
    try { await markAsRead(id); } catch { load(); }
  }, [load]);

  const markAll = useCallback(async () => {
    setItems(prev => prev.map(it => ({ ...it, is_read: true })));
    setUnreadCount(0);
    try { await markAllAsRead(); } catch { load(); }
  }, [load]);

  return {
    // state
    tab, setTab, onlyUnread, setOnlyUnread, items, unreadCount, loading, err,
    // actions
    reload: load, markItemAsRead, markAll,
    // derived
    effectiveFilter: useMemo(() => ({ tab, onlyUnread }), [tab, onlyUnread]),
  };
}
