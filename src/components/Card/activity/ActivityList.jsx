// src/components/Activity/ActivityList.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getCardActivity } from '../../../api/cardApi'; 
import toast from 'react-hot-toast';

// ============================================
// Helper Functions
// ============================================

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;

  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

  // Format: "29 thg 7, 2025, 13:12"
  return d.toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatFullDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderMessage(activity) {
  const type = activity.activity_type;
  const description = activity.description || '';
  const targetUser = activity.target_user?.username || activity.target_user?.name;

  switch (type) {
    case 'card_created':
      return 'đã tạo thẻ này';

    case 'member_added':
      return targetUser ? `đã thêm ${targetUser} vào thẻ` : 'đã thêm thành viên vào thẻ';

    case 'member_removed':
      return targetUser ? `đã xóa ${targetUser} khỏi thẻ` : 'đã xóa thành viên khỏi thẻ';

    case 'card_moved': {
      const fromMatch = description.match(/from (.+?) to/);
      const toMatch = description.match(/to (.+?)$/);
      if (fromMatch && toMatch) {
        return `đã di chuyển thẻ từ ${fromMatch[1]} sang ${toMatch[1]}`;
      }
      return 'đã di chuyển thẻ';
    }

    case 'card_renamed':
      return 'đã đổi tên thẻ';

    case 'card_updated':
      if (description.includes('renamed')) return 'đã đổi tên thẻ';
      if (description.includes('description')) return 'đã cập nhật mô tả';
      if (description.includes('label added')) return 'đã thêm nhãn';
      if (description.includes('label removed')) return 'đã xóa nhãn';
      if (description.includes('checklist')) return 'đã cập nhật checklist';
      if (description.includes('attachment added')) return 'đã thêm tệp đính kèm';
      if (description.includes('attachment removed') || description.includes('attachment deleted')) return 'đã xóa tệp đính kèm';
      if (description.includes('completed')) return 'đã đánh dấu hoàn thành';
      if (description.includes('uncompleted')) return 'đã bỏ đánh dấu hoàn thành';
      return 'đã cập nhật thẻ';

    case 'comment_added':
      return 'đã thêm bình luận';

    case 'comment_updated':
      return 'đã chỉnh sửa bình luận';

    case 'comment_deleted':
      return 'đã xóa bình luận';

    case 'due_date_set':
      return 'đã đặt hạn';

    case 'due_date_changed':
      if (description.includes('set due date')) return 'đã đặt hạn';
      if (description.includes('removed due date')) return 'đã gỡ hạn';
      return 'đã thay đổi hạn';

    case 'due_date_removed':
      return 'đã gỡ hạn';

    case 'checklist_created':
      return 'đã tạo checklist';

    case 'checklist_deleted':
      return 'đã xóa checklist';

    case 'checklist_item_created':
      return 'đã thêm mục vào checklist';

    case 'checklist_item_completed':
      return 'đã hoàn thành mục checklist';

    case 'checklist_item_uncompleted':
      return 'đã bỏ hoàn thành mục checklist';

    case 'attachment_added':
      return 'đã thêm tệp đính kèm';

    case 'attachment_deleted':
    case 'attachment_removed':
      return 'đã xóa tệp đính kèm';

    default:
      return description || (type || '').replace(/_/g, ' ');
  }
}

// ============================================
// Main Component
// ============================================

function ActivityList({ cardId,refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = async (append = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await getCardActivity(cardId, {
        limit: 30,
        offset: append ? offset : 0
      });
      const results = data?.results ?? data ?? [];

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
      toast.error('Không thể tải lịch sử hoạt động');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (activityId) => {
    const url = `${window.location.origin}${window.location.pathname}#action-${activityId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép link');
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Đã sao chép link');
      } catch (e) {
        toast.error('Không thể sao chép link');
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    if (!cardId) return;
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, refreshKey]);

  if (!items.length && !loading) {
    return (
      <EmptyState>
        <EmptyIcon>📋</EmptyIcon>
        <EmptyText>Chưa có hoạt động nào.</EmptyText>
      </EmptyState>
    );
  }

  return (
    <ActivityContainer>
      <ActivityListEl>
        {items.map((activity, index) => (
          <ActivityItem
            key={activity.id || index}
            id={`action-${activity.id}`}
          >
            {/* Avatar */}
            <AvatarContainer>
              <Avatar>
                {activity.user?.avatar ? (
                  <img
                    src={activity.user.avatar}
                    alt={activity.user?.name || activity.user?.username || 'User'}
                    onError={(e) => {
                      // Fallback khi avatar load fail
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div style="
                          width: 100%;
                          height: 100%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 14px;
                          font-weight: 600;
                          color: white;
                          text-transform: uppercase;
                        ">
                          ${activity.user?.initials || 
                            (activity.user?.name || activity.user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <AvatarText>
                    {activity.user?.initials || 
                    (activity.user?.name || activity.user?.username || 'U').charAt(0).toUpperCase()}
                  </AvatarText>
                )}
              </Avatar>
            </AvatarContainer>

            {/* Content */}
            <ActivityContent>
              <ActivityText>
                <UserName title={activity.user?.username}>
                  {activity.user?.name || activity.user?.username || 'Unknown User'}
                </UserName>{' '}
                <ActionText>{renderMessage(activity)}</ActionText>
              </ActivityText>

              <ActivityMeta>
                <TimeLink
                  href={`#action-${activity.id}`}
                  title={formatFullDate(activity.created_at)}
                >
                  {timeAgo(activity.created_at)}
                </TimeLink>

                <CopyLinkButton
                  onClick={() => handleCopyLink(activity.id)}
                  aria-label="Sao chép link hoạt động"
                  title="Sao chép link"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    role="presentation"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M8.22 2.22a3.932 3.932 0 1 1 5.56 5.56l-2.25 2.25-1.06-1.06 2.25-2.25a2.432 2.432 0 0 0-3.44-3.44L7.03 5.53 5.97 4.47zm3.06 3.56-5.5 5.5-1.06-1.06 5.5-5.5zM2.22 8.22l2.25-2.25 1.06 1.06-2.25 2.25a2.432 2.432 0 0 0 3.44 3.44l2.25-2.25 1.06 1.06-2.25 2.25a3.932 3.932 0 1 1-5.56-5.56"
                      clipRule="evenodd"
                    />
                  </svg>
                </CopyLinkButton>
              </ActivityMeta>

              {/* Debug info - only in development */}
              {process.env.NODE_ENV === 'development' && (
                <DebugInfo>
                  {activity.activity_type} - {activity.description}
                </DebugInfo>
              )}
            </ActivityContent>
          </ActivityItem>
        ))}
      </ActivityListEl>

      {hasMore && (
        <LoadMoreButton onClick={() => load(true)} disabled={loading}>
          {loading ? 'Đang tải...' : 'Xem thêm'}
        </LoadMoreButton>
      )}
    </ActivityContainer>
  );
}

export default ActivityList;

// ============================================
// Styled Components
// ============================================

const ActivityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/** ⚠️ Đổi tên để tránh đè lên React component ActivityList */
const ActivityListEl = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.li`
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f7f8f9;
  }
`;

const AvatarContainer = styled.div`
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: #172b4d;
  margin-bottom: 4px;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #172b4d;
`;

const ActionText = styled.span`
  color: #172b4d;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimeLink = styled.a`
  font-size: 12px;
  line-height: 16px;
  color: #5e6c84;
  text-decoration: none;

  &:hover {
    color: #172b4d;
    text-decoration: underline;
  }
`;

const CopyLinkButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: none;
  border: none;
  color: #5e6c84;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s ease;
  opacity: 0;

  ${ActivityItem}:hover & {
    opacity: 1;
  }

  &:hover {
    background: #091e4224;
    color: #172b4d;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DebugInfo = styled.div`
  font-size: 11px;
  color: #8c9bab;
  margin-top: 4px;
  font-family: 'Courier New', monospace;
  padding: 4px 8px;
  background: #f4f5f7;
  border-radius: 3px;
  border-left: 2px solid #0c66e4;
`;

const LoadMoreButton = styled.button`
  align-self: flex-start;
  padding: 6px 12px;
  background: #091e4224;
  border: none;
  border-radius: 3px;
  color: #172b4d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: #091e4242;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #5e6c84;
  margin: 0;
`;
