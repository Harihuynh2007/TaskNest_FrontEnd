// src/features/notifications/NotificationRow.jsx
import React, { memo } from "react";
import { MdMarkEmailRead } from "react-icons/md";

function Tag({ tone = "info", children }) {
  return <span className={`notif-tag ${tone}`}>{children}</span>;
}

const NotificationRow = memo(function NotificationRow({ item, onMarkRead }) {
  const { is_read, title, message, timeago, href, cover_url, chips, tag, tagTone } = item;

  return (
    <a
      className={`notif-item ${is_read ? "read" : "unread"}`}
      data-notif-row="1"
      href={href}
      target="_blank"
      rel="noreferrer"
      tabIndex={0}
    >
      {cover_url
        ? <div className="notif-cover" style={{ backgroundImage: `url("${cover_url}")` }} />
        : <div className="notif-avatar">{(title || "?").slice(0,1).toUpperCase()}</div>
      }

      <div className="notif-main">
        <div className="notif-title-row">
          <div className="notif-title">{title}</div>
          {tag && <Tag tone={tagTone}>{tag}</Tag>}
        </div>

        {chips?.length > 0 && (
          <div className="notif-chips">
            {chips.map((c, i) => <span className="notif-chip" key={i}>{c}</span>)}
          </div>
        )}

        {!!message && <div className="notif-message">{message}</div>}
        <div className="notif-meta">{timeago}</div>
      </div>

      {!is_read && (
        <button
          className="notif-quick"
          title="Mark as read"
          onClick={(e) => { e.preventDefault(); onMarkRead?.(item.id); }}
        >
          <MdMarkEmailRead size={16} />
        </button>
      )}
    </a>
  );
});

export default NotificationRow;
