import React from 'react';
import styled from 'styled-components';
import { FiCalendar } from 'react-icons/fi';

/**
 * Render-only: hiển thị labels, due date, members (avatar stack).
 * Không mở popup, không gọi API. Callback là tùy chọn.
 */
export default function CardMetaBar({
  labels = [],
  dueDate = null,
  members = [],
  onClickLabels,   // optional
  onClickDueDate,  // optional
  onClickMembers   // optional
}) {
  const due = dueDate ? new Date(dueDate) : null;

  return (
    <Bar>
      {/* Labels */}
      {labels?.length > 0 && (
        <Group role="button" tabIndex={0} onClick={onClickLabels} aria-label="Labels">
          {labels.map(l => (
            <LabelChip key={l.id} style={{ background: l.color }} title={l.name} />
          ))}
        </Group>
      )}

      {/* Due date */}
      {due && (
        <Group role="button" tabIndex={0} onClick={onClickDueDate} aria-label="Due date">
          <DuePill>
            <FiCalendar size={14} />
            <span>
              {due.toLocaleString(undefined, {
                day: '2-digit', month: 'short',
                hour: '2-digit', minute: '2-digit'
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
                {m.avatar
                  ? <img src={m.avatar} alt={m.display_name || m.username} />
                  : (m.display_name || m.username || '?').slice(0, 2).toUpperCase()}
              </Avatar>
            ))}
            {members.length > 3 && <MoreBadge>+{members.length - 3}</MoreBadge>}
          </AvatarStack>
        </Group>
      )}
    </Bar>
  );
}

/* ------- Styled: trung lập, không phá layout hiện hữu ------- */
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
  &:focus { box-shadow: 0 0 0 2px #93c5fd99; border-radius: 6px; }
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
  font-size: 12px;
  color: #172b4d;
  background: #ebecf0;
  border-radius: 6px;
  padding: 4px 8px;
  line-height: 1;
`;

const AvatarStack = styled.div`
  display: inline-flex;
  align-items: center;
`;

const Avatar = styled.span`
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #ffffff;
  margin-left: -6px;
  &:first-child { margin-left: 0; }
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
`;

const MoreBadge = styled.span`
  margin-left: -6px;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #334155;
  font-size: 11px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #ffffff;
`;
