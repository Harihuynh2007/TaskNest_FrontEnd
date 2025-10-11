// src/features/notifications/notif-utils.js
function priorityToTone(priority) {
  const p = (priority || '').toLowerCase();
  if (p === 'high') return 'danger';    
  if (p === 'medium') return 'success';
  return 'info';                       
}

export function normalizeItem(raw) {
  const data = raw.data || {};
  const type = (raw.type || '').toLowerCase();

  const targetStr = raw.target?.string;
  const targetModel = raw.target?.model?.split('.').pop(); // 'board' | 'card' | ...

  return {
    id: raw.id,
    is_read: !!raw.is_read,

    // Hiển thị
    title: raw.verb || 'Notification',
    message: data.message || data.preview || '',
    href: raw.action_url || data.action_url || '#',   // ⭐ BE cung cấp action_url
    cover_url: data.cover_url || null,

    // Chips từ target + data
    chips: compact([
      targetStr && `${(targetModel||'').charAt(0).toUpperCase() + (targetModel||'').slice(1)}: ${targetStr}`,
      data.board_name && `Board: ${data.board_name}`,
      data.list_name && `List: ${data.list_name}`,
    ]),

    // Tag & tone
    tag: data.tag || (type ? type.replace(/_/g, ' ') : null),
    tagTone: data.tagTone || priorityToTone(raw.priority),

    // Thời gian
    created_at: raw.created_at,
    timeago: fmtTimeAgo(raw.created_at),

    kind: (data.is_mention || type.includes('mention')) ? 'mention' : undefined,
  };
}

export function groupByDate(items) {
  const now = new Date();
  const buckets = { "Today": [], "Yesterday": [], "This week": [], "Earlier": [] };
  for (const it of items) {
    const t = it.created_at ? new Date(it.created_at) : now;
    const diff = (now - t) / 86400000;
    if (diff < 1) buckets["Today"].push(it);
    else if (diff < 2) buckets["Yesterday"].push(it);
    else if (diff < 7) buckets["This week"].push(it);
    else buckets["Earlier"].push(it);
  }
  return Object.fromEntries(Object.entries(buckets).filter(([, v]) => v.length));
}

export function fmtTimeAgo(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function compact(arr) {
  return arr.filter(Boolean);
}
