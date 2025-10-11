// src/features/notifications/NotificationPopover.jsx
import React, { useMemo } from "react";
import NotificationRow from "./NotificationRow";
import { normalizeItem, groupByDate } from "./notif-utils";
import { MdOutlineFilterList, MdOutlineDoneAll, MdOutlineSettings } from "react-icons/md";

const TABS = ["all", "unread", "mentions"];

export default function NotificationPopover({
  rawItems,
  tab, setTab,
  onlyUnread, setOnlyUnread,
  loading, err, markAll, markItemAsRead,
}) {
  const items = useMemo(() => rawItems.map(normalizeItem), [rawItems]);

  const filtered = useMemo(() => {
    return items.filter(d =>
      tab === "mentions" ? d.kind === "mention" :
      (tab === "unread" || onlyUnread) ? !d.is_read : true
    );
  }, [items, tab, onlyUnread]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="notif-popover" role="dialog" aria-label="Notifications">
      {/* Sticky header */}
      <div className="notif-header">
        <div className="notif-header-left">
          <h6>Notifications</h6>
          <div className="notif-tabs" role="tablist" aria-label="Filter notifications">
            {TABS.map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`notif-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "all" ? "All" : t === "unread" ? "Unread" : "Mentions"}
              </button>
            ))}
          </div>
        </div>

        <div className="notif-actions">
          <button className="notif-action" title="Only show unread" onClick={() => setOnlyUnread(v => !v)}>
            <MdOutlineFilterList size={18} />
            <span className={`dot ${onlyUnread ? "on" : ""}`} />
          </button>
          <button className="notif-action" title="Mark all as read" onClick={markAll}>
            <MdOutlineDoneAll size={18} />
          </button>
          <button className="notif-action" title="Notification settings">
            <MdOutlineSettings size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="notif-body">
        {loading && <div className="notif-loading">Loading…</div>}

        {!loading && err && (
          <div className="notif-empty">Failed to load. Please try again.</div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="notif-empty">
            <img src="/assets/ee2660df9335718b1a80.svg" alt="" height="54" />
            <div>{(tab === "unread" || onlyUnread) ? "No unread notifications" : "No notifications"}</div>
          </div>
        )}

        {!loading && !err && Object.keys(grouped).map(section => (
          <div key={section} className="notif-section">
            <div className="notif-section-title">{section}</div>
            <div className="notif-list">
              {grouped[section].map(n => (
                <NotificationRow key={n.id} item={n} onMarkRead={markItemAsRead} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
