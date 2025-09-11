import React, { useEffect, useState } from 'react';
import { getCardActivity } from '../../../api/cardApi';

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff/60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
  return d.toLocaleString();
}

function renderMessage(activity) {
  const type = activity.activity_type;
  const description = activity.description;
  const user = activity.user?.username || activity.user?.name || 'Someone';
  const targetUser = activity.target_user?.username || activity.target_user?.name;

  // Use description from backend, but can enhance with Vietnamese
  switch (type) {
    case 'member_added':
      return `đã thêm ${targetUser || 'thành viên'} vào thẻ`;
    
    case 'member_removed':
      return `đã xóa ${targetUser || 'thành viên'} khỏi thẻ`;
    
    case 'card_moved':
      // Parse from description like "moved card from List A to List B"
      if (description.includes('from') && description.includes('to')) {
        return `đã di chuyển thẻ`;
      }
      return 'đã di chuyển thẻ';
    
    case 'card_updated':
      // Parse specific updates from description
      if (description.includes('renamed')) return 'đã đổi tên thẻ';
      if (description.includes('description')) return 'đã cập nhật mô tả';
      if (description.includes('label')) return description.includes('added') ? 'đã thêm nhãn' : 'đã xóa nhãn';
      if (description.includes('checklist')) return 'đã cập nhật checklist';
      if (description.includes('attachment')) return description.includes('added') ? 'đã thêm tệp đính kèm' : 'đã xóa tệp đính kèm';
      if (description.includes('completed')) return description.includes('completed') ? 'đã hoàn thành mục' : 'đã bỏ hoàn thành mục';
      return 'đã cập nhật thẻ';
    
    case 'comment_added':
      return 'đã thêm bình luận';
    
    case 'due_date_changed':
      if (description.includes('set due date')) return 'đã đặt hạn';
      if (description.includes('removed due date')) return 'đã gỡ hạn';
      return 'đã thay đổi hạn';
    
    default:
      // Fallback to original description
      return description || type;
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
      const results = data.results ?? data;
      
      if (append) {
        setItems(prev => [...prev, ...results]);
        setOffset(prev => prev + results.length);
      } else {
        setItems(results);
        setOffset(results.length);
      }
      setHasMore(results.length >= 30);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(false); 
  }, [cardId]);

  return (
    <div className="flex flex-col gap-3">
      {items.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <img
            src={activity.user?.avatar || '/avatar.png'}
            alt={activity.user?.name || activity.user?.username || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="text-sm">
              <span className="font-medium">
                {activity.user?.name || activity.user?.username || 'Unknown User'}
              </span>{' '}
              <span>{renderMessage(activity)}</span>
            </div>
            <div className="text-xs text-gray-500">
              {timeAgo(activity.created_at)}
            </div>
            
            {/* Show original description for debugging/details */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-1">
                Debug: {activity.activity_type} - {activity.description}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {hasMore && (
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="self-start px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-50"
        >
          {loading ? 'Đang tải…' : 'Xem thêm'}
        </button>
      )}
      
      {!items.length && !loading && (
        <div className="text-sm text-gray-500">Chưa có hoạt động nào.</div>
      )}
    </div>
  );
}