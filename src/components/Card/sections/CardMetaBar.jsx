import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CardMetaBar({
  labels = [],
  dueDate = null,
  members = [],
  onClickLabels,
  onClickDueDate,
  onClickMembers
}) {
  const due = dueDate ? new Date(dueDate) : null;
  const isOverdue = dueDate && new Date(dueDate) < new Date();

  // 🔔 Tự động báo toast khi đến hạn
  useEffect(() => {
    if (!dueDate) return;
    const dueTime = new Date(dueDate);
    const now = new Date();

    // Nếu đã quá hạn -> thông báo ngay (chỉ hiển thị 1 lần khi load nếu cần thiết, ở đây giữ logic cũ của bạn)
    if (dueTime < now) {
      // toast.error(`⚠️ Task is overdue`, { id: 'overdue-toast' }); // Dùng id để tránh spam
      return;
    }

    // Nếu chưa đến -> hẹn giờ thông báo
    const delay = dueTime.getTime() - now.getTime();
    // Giới hạn delay tối đa (ví dụ 24h) để tránh set timeout quá dài gây lỗi trình duyệt
    if (delay > 0 && delay < 86400000) {
      const timer = setTimeout(() => {
        toast.error(`⚠️ Task is now due: ${dueTime.toLocaleTimeString()}`, { duration: 5000 });
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [dueDate]);

  return (
    <Bar>
      {/* 1. Members (Đưa lên đầu để layout gọn hơn) */}
      {members?.length > 0 && (
        <Group role="button" tabIndex={0} onClick={onClickMembers} aria-label="Members" title="Manage members">
          <AvatarStack>
            {members.slice(0, 3).map((m) => (
              <Avatar key={m.id} title={m.display_name || m.username}>
                {m.avatar ? (
                  <img src={m.avatar} alt={m.display_name || m.username} />
                ) : (
                  (m.display_name || m.username || '?').slice(0, 2).toUpperCase()
                )}
              </Avatar>
            ))}
            {members.length > 3 && <MoreBadge>+{members.length - 3}</MoreBadge>}
          </AvatarStack>
        </Group>
      )}

      {/* 2. Labels (Giao diện mới: Hiển thị tên & Nút thêm) */}
      <LabelSection>
        {labels.map((l) => (
          <LabelChip 
            key={l.id} 
            $color={l.color} 
            onClick={onClickLabels} 
            title={l.name}
          >
            {l.name}
          </LabelChip>
        ))}
        {/* Nút cộng để thêm label nhanh */}
        <AddLabelBtn onClick={onClickLabels} title="Add label">
          <FiPlus size={16} />
        </AddLabelBtn>
      </LabelSection>

      {/* 3. Due Date */}
      {due && (
        <Group
          className="card-meta-due-pill"
          role="button"
          tabIndex={0}
          onClick={(e) => onClickDueDate?.(e)} 
          aria-label="Due date"
          title={isOverdue ? 'Overdue' : 'Due date'}
        >
          <DuePill $overdue={isOverdue}>
            <FiCalendar size={14} />
            <span>
              {isOverdue ? 'Overdue: ' : 'Due '}
              {due.toLocaleString(undefined, {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </DuePill>
        </Group>
      )}
    </Bar>
  );
}

/* ===========================
   Styled Components
   =========================== */

const pulseOverdue = keyframes`
  0% { background-color: rgba(239,68,68,0.12); }
  100% { background-color: rgba(239,68,68,0.22); }
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px; /* Tăng khoảng cách giữa các nhóm */
  flex-wrap: wrap;
  margin: 6px 0 16px 0;
`;

const Group = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  outline: none;
  cursor: pointer;
  transition: transform 0.1s;
  
  &:active {
    transform: translateY(1px);
  }
`;

// --- Label Styles Mới ---
const LabelSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const LabelChip = styled.span`
  background-color: ${props => props.$color || '#94a3b8'};
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  transition: filter 0.2s;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    filter: brightness(110%);
  }
`;

const AddLabelBtn = styled.button`
  width: 32px;
  height: 28px; /* Cùng chiều cao với LabelChip */
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.15);
  border: none;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(148, 163, 184, 0.25);
    color: #e8eef7;
  }
`;

// --- Due Date Styles ---
const DuePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  padding: 4px 10px; /* Cân đối chiều cao với label */
  min-height: 28px;
  line-height: 1.1;
  transition: all 0.25s ease;
  background: ${({ $overdue }) =>
    $overdue ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)'};
  color: ${({ $overdue }) => ($overdue ? '#f87171' : '#60a5fa')};
  animation: ${({ $overdue }) => ($overdue ? pulseOverdue : 'none')} 1.6s ease-in-out infinite alternate;

  &:hover {
    background: ${({ $overdue }) =>
      $overdue
        ? 'rgba(239,68,68,0.25)'
        : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'};
    color: #fff;
  }
`;

// --- Member Styles ---
const AvatarStack = styled.div`
  display: inline-flex;
  align-items: center;
  padding-left: 6px; /* Để avatar đầu tiên không bị cắt nếu có margin âm */
`;

const Avatar = styled.span`
  width: 28px; /* Tăng nhẹ kích thước avatar */
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #2d374b; /* Viền trùng màu nền modal để tạo hiệu ứng cắt */
  margin-left: -8px;
  
  &:first-child {
    margin-left: 0;
  }
  
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* Hover effect để xem rõ avatar bị che */
  transition: margin 0.2s, transform 0.2s, z-index 0s;
  position: relative;
  z-index: 1;
  
  &:hover {
    margin-right: 4px;
    transform: translateY(-2px);
    z-index: 10;
    border-color: #3b82f6;
  }
`;

const MoreBadge = styled.span`
  margin-left: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #334155;
  color: #f1f5f9;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #2d374b;
  position: relative;
  z-index: 1;
`;