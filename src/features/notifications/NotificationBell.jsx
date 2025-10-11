// src/features/notifications/NotificationBell.jsx
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MdNotificationsNone } from "react-icons/md";
import useNotifications from "./useNotifications";
import "./NotificationBell.css";

const NotificationPopover = lazy(() => import("./NotificationPopover"));

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const {
    tab, setTab,
    onlyUnread, setOnlyUnread,
    items, unreadCount, loading, err,
    reload, markItemAsRead, markAll
  } = useNotifications();

  // click outside to close
  useEffect(() => {
    function onDoc(e){ if (open && ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="notif-wrapper" ref={ref}>
      <button
        className="tn-icon-btn notification-bell"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Notifications"
        onClick={() => setOpen(o => !o)}
      >
        <MdNotificationsNone size={18} />
        {unreadCount > 0 && <span className="badge-notif">{unreadCount}</span>}
      </button>

      {open && (
        <Suspense fallback={<div className="notif-popover"><div className="notif-loading">Loading…</div></div>}>
          <NotificationPopover
            rawItems={items}
            tab={tab} setTab={setTab}
            onlyUnread={onlyUnread} setOnlyUnread={setOnlyUnread}
            loading={loading} err={err}
            markAll={markAll}
            markItemAsRead={markItemAsRead}
          />
        </Suspense>
      )}
    </div>
  );
}
