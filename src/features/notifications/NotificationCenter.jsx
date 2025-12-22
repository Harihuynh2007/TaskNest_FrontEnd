import React, { useState } from "react";
import NotificationPopover from "./NotificationPopover";
import useRealtimeNotifications from "./useRealtimeNotifications";

export default function NotificationCenter() {
  const [tab, setTab] = useState("all");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const {
    items,
    unreadCount,
    loading,
    err,
    markAll,
    markItemAsRead,
  } = useRealtimeNotifications({ enabled: true });

  return (
    <div>
      {/* Badge ví dụ */}
      <div style={{ marginBottom: 8 }}>
        Unread: <b>{unreadCount}</b>
      </div>

      <NotificationPopover
        rawItems={items}
        tab={tab}
        setTab={setTab}
        onlyUnread={onlyUnread}
        setOnlyUnread={setOnlyUnread}
        loading={loading}
        err={err}
        markAll={markAll}
        markItemAsRead={(item) => markItemAsRead(item.id)}
      />
    </div>
  );
}
