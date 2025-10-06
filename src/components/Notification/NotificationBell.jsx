import React, { useEffect, useState, useRef } from "react";
import api from "../../api/apiClient";
import { MdNotificationsNone } from "react-icons/md";
import "./NotificationBell.css";


function fromNow(input){
  try{
    const ts = typeof input === "string" || typeof input === "number" ? new Date(input).getTime() : +input;
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  } catch {
    return "";
  }
}

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const popoverId = "notif-popover";
  const ref = useRef(null);

  // === MOCK DATA để test khi chưa có backend ===
  const mockNotifications = [
    {
      id: 1,
      type: "COMMENT",
      data: { message: "A đã comment vào card X" },
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      type: "ASSIGN",
      data: { message: "Bạn được assign vào card Y" },
      is_read: true,
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
  ];

  // === FETCH API ===
  async function fetchNotifications(signal) {
    try {
      const res = { data: mockNotifications };
      if (signal?.aborted) return;
      setItems(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (e) {
      console.warn("API chưa có, dùng mock data");
      setItems(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.is_read).length);
      if (e.name !== "CanceledError" && e.name !== "AbortError") console.error(e);
    }
  }

  // === Mark as read (only decrement if was unread) ===
  async function markAsRead(id) {
    setItems((prev) => {
      let wasUnread = false;
      const next = prev.map((n) => {
        if (n.id !== id) return n;
        wasUnread = !n.is_read;
        return { ...n, is_read: true};
      });
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      return next;
    });
    try{
      await api.patch(`/notifications/${id}`, { is_read: true });
    } catch (e){
      console.error(e);
    }
  }

  function handleItemClick(n){
    markAsRead(n.id);
    if (n.action_url){
      window.location.href = n.action_url;
    }
  }
  // === CLICK OUTSIDE để đóng popup ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === ESC để đóng; mount lần đầu: fetch + cleanup ===

  useEffect(() => {
    const aborter = new AbortController();
    fetchNotifications(aborter.signal);
    const onKey = (e) => {
      if(e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return() => {
      aborter.abort();
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div 
      className="notification-bell"
      ref={ref}
      role="presentation"
    >
      <button
        className="btn btn-link"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => { setOpen((o) => !o); fetchNotifications(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }

        }} 
        aria-label="Notifications"
      >
        <MdNotificationsNone size={20} />
        {unreadCount > 0 && <span className="badge-notif">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-popover" role="dialog" id={popoverId} aria-labelledby="notif-title">
          <div className="notif-header">
            <h6 id="notif-title">Notifications</h6>
            <small style={{ opacity: 0.7 }}>
              {items.filter((n) => !n.is_read).length} Unread
            </small>
          </div>

          <div className="notif-list">
            {items.length === 0 && (
              <div className="notif-empty">
                <img
                  alt="Taco"
                  src="/assets/ee2660df9335718b1a80.svg"
                  style={{ width: 80 }}
                />
                <div>Không có thông báo nào</div>
              </div>
            )}

            {items.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.is_read ? "read" : "unread"}`}
                onClick={() => handleItemClick(n)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") handleItemClick(n); }}
              >
                <div className="notif-body">
                  <div className="notif-title">{n.type}</div>
                  <div className="notif-message">
                    {n.data?.message || JSON.stringify(n.data)}
                  </div>
                </div>
                <div className="notif-meta">
                  <span title={new Date(n.created_at).toLocaleString()}>
                    {fromNow(n.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
