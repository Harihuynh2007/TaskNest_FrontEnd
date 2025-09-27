import React, { useEffect, useState, useRef } from "react";
import api from "../../api/apiClient";
import { MdNotificationsNone } from "react-icons/md";
import "./NotificationBell.css";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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
  async function fetchNotifications() {
    try {
      const res = await api.get("/notifications/");
      setItems(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.warn("API chưa có, dùng mock data");
      setItems(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.is_read).length);
    }
  }

  // === MARK AS READ ===
  async function markAsRead(id) {
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true });
    } catch (err) {
      console.warn("PATCH chưa có backend, chỉ update FE");
    }
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  // === CLICK OUTSIDE để đóng popup ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === MOUNT lần đầu ===
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="notification-bell" ref={ref}>
      <button
        className="btn btn-link"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        aria-label="Notifications"
      >
        <MdNotificationsNone size={20} />
        {unreadCount > 0 && <span className="badge-notif">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-popover">
          <div className="notif-header">
            <h6>Thông báo</h6>
            <small style={{ opacity: 0.7 }}>
              {items.filter((n) => !n.is_read).length} chưa đọc
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
                onClick={() => markAsRead(n.id)}
              >
                <div className="notif-body">
                  <div className="notif-title">{n.type}</div>
                  <div className="notif-message">
                    {n.data?.message || JSON.stringify(n.data)}
                  </div>
                </div>
                <div className="notif-meta">
                  {new Date(n.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
