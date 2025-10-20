import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiCalendar } from 'react-icons/fi';
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
    const due = new Date(dueDate);
    const now = new Date();

    // Nếu đã quá hạn -> thông báo ngay
    if (due < now) {
      toast.error(`⚠️ Task is overdue (${due.toLocaleString()})`, { duration: 5000 });
      return;
    }

    // Nếu chưa đến -> hẹn giờ thông báo
    const delay = due.getTime() - now.getTime();
    const timer = setTimeout(() => {
      toast.error(`⚠️ Task is now due (${due.toLocaleString()})`, { duration: 5000 });
    }, delay);

    return () => clearTimeout(timer);
  }, [dueDate]);

  return (
    <Bar>
      {/* Labels */}
      {labels?.length > 0 && (
        <Group role="button" tabIndex={0} onClick={onClickLabels} aria-label="Labels">
          {labels.map((l) => (
            <LabelChip key={l.id} style={{ background: l.color }} title={l.name} />
          ))}
        </Group>
      )}

      {/* Due Date */}
      {due && (
        <Group
          role="button"
          tabIndex={0}
          onClick={onClickDueDate}
          aria-label="Due date"
          title={isOverdue ? 'Overdue' : 'Due'}
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

      {/* Members */}
      {members?.length > 0 && (
        <Group role="button" tabIndex={0} onClick={onClickMembers} aria-label="Members">
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
  gap: 12px;
  flex-wrap: wrap;
  margin: 6px 0 10px 0;
`;

const Group = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  outline: none;
  cursor: pointer;
  &:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
    border-radius: 6px;
  }
`;

const LabelChip = styled.span`
  width: 36px;
  height: 8px;
  border-radius: 4px;
  display: inline-block;
`;

const DuePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 500;
  border-radius: 8px;
  padding: 5px 10px;
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

const AvatarStack = styled.div`
  display: inline-flex;
  align-items: center;
`;

const Avatar = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ffffff;
  margin-left: -6px;
  &:first-child {
    margin-left: 0;
  }
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const MoreBadge = styled.span`
  margin-left: -6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #334155;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ffffff;
`;
