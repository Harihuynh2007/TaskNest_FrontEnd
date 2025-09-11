import React, { useEffect, useState } from 'react';
import { getCardActivity } from '../../api/cardApi';

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff/60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
  return d.toLocaleString();
}

function renderMessage(item) {
  const a = item.action;
  const m = item.meta || {};
  switch (a) {
    case 'card_created': return `đã tạo thẻ “${m.title ?? ''}”`;
    case 'title_changed': return `đã đổi tiêu đề: “${m.from ?? ''}” → “${m.to ?? ''}”`;
    case 'description_changed': return `đã cập nhật mô tả`;
    case 'moved_list': return `đã di chuyển thẻ (list ${m.from_list_id ?? ''} → ${m.to_list_id ?? ''})`;
    case 'completed_toggled': return m.completed ? 'đã đánh dấu Hoàn thành' : 'đã bỏ đánh dấu Hoàn thành';
    case 'due_set': return `đã đặt hạn`;
    case 'due_cleared': return `đã gỡ hạn`;
    case 'label_added': return `đã thêm label #${m.label_id}`;
    case 'label_removed': return `đã xoá label #${m.label_id}`;
    case 'comment_added': return `đã thêm bình luận`;
    case 'comment_deleted': return `đã xoá bình luận`;
    case 'card_deleted': return `đã xoá thẻ`;
    default: return a;
  }
}

export default function ActivityList({ cardId }) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = async (append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getCardActivity(cardId, { limit: 30, offset: append ? offset : 0 });
      const results = data.results ?? data; // tuỳ DRF pagination bạn dùng
      if (append) {
        setItems(prev => [...prev, ...results]);
        setOffset(prev => prev + results.length);
      } else {
        setItems(results);
        setOffset(results.length);
      }
      setHasMore(results.length >= 30);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(false); /* eslint-disable-next-line */ }, [cardId]);

  return (
    <div className="flex flex-col gap-3">
      {items.map((it) => (
        <div key={it.id} className="flex items-start gap-3">
          <img
            src={it.actor?.avatar || '/avatar.png'}
            alt={it.actor?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="text-sm">
              <span className="font-medium">{it.actor?.name || 'Unknown User'}</span>{' '}
              <span>{renderMessage(it)}</span>
            </div>
            <div className="text-xs text-gray-500">{timeAgo(it.created_at)}</div>
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="self-start px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
        >
          {loading ? 'Đang tải…' : 'Xem thêm'}
        </button>
      )}
      {!items.length && !loading && <div className="text-sm text-gray-500">Chưa có hoạt động nào.</div>}
    </div>
  );
}
