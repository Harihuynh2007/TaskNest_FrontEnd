// src/components/member/MemberCardPopup.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import FocusLock from 'react-focus-lock';
import { toast } from 'react-hot-toast';
import * as boardApi from '../../api/boardApi';
import * as cardApi from '../../api/cardApi';

export default function MemberCardPopup({
  boardId,
  cardId,
  assigned = [],
  onUpdated,
  anchorRect,
  onClose,
}) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const popupRef = useRef(null);

  // === Fetch members of board ===
  useEffect(() => {
    if (!boardId) return;
    (async () => {
      try {
        const res = await boardApi.fetchBoardMembers(boardId);
        setMembers(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load board members');
      }
    })();
  }, [boardId]);

  // === Debounce search ===
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // === Click outside handler ===
  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // === Position popup ===
  const position = {
    top: anchorRect.bottom + window.scrollY + 8,
    left: Math.min(anchorRect.left + window.scrollX, window.innerWidth - 280),
  };

  // === Filtered members (local search) ===
  const filteredMembers = useMemo(() => {
    if (!debouncedSearch) return members;
    return members.filter((m) => {
      const name = m.user.display_name?.toLowerCase() || '';
      const username = m.user.username?.toLowerCase() || '';
      return name.includes(debouncedSearch) || username.includes(debouncedSearch);
    });
  }, [members, debouncedSearch]);

  // === Highlight matched text ===
  const highlightText = (text) => {
    if (!debouncedSearch) return text;
    const regex = new RegExp(`(${debouncedSearch})`, 'ig');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === debouncedSearch ? <mark key={i}>{part}</mark> : part
    );
  };

  // === Toggle member assign ===
  const handleToggle = async (userId, assignedState) => {
    try {
      if (assignedState) {
        await cardApi.removeCardMember(cardId, userId);
        toast.success('Member removed');
      } else {
        await cardApi.addCardMember(cardId, userId);
        toast.success('Member added');
      }
      const updated = await cardApi.fetchCardMembers(cardId);
      onUpdated(updated);
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
    }
  };

  return (
    <AnimatePresence>
      <FocusLock>
        <PopupWrapper
          ref={popupRef}
          as={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={position}
          role="dialog"
          aria-label="Add members to card"
        >
          <Header>Members</Header>
          <SearchInput
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <List>
            {filteredMembers.length === 0 && (
              <EmptyText>No members found.</EmptyText>
            )}
            {filteredMembers.map((m) => {
              const isAssigned = assigned.includes(m.user.id);
              return (
                <ListItem
                  key={m.user.id}
                  className={isAssigned ? 'assigned' : ''}
                  onClick={() => handleToggle(m.user.id, isAssigned)}
                >
                  <Avatar
                    style={{
                      backgroundImage: m.user.avatar_url
                        ? `url(${m.user.avatar_url})`
                        : 'none',
                    }}
                  >
                    {!m.user.avatar_url && m.user.initials}
                  </Avatar>
                  <span>{highlightText(m.user.display_name || m.user.username)}</span>
                  {isAssigned && <CheckMark>✔</CheckMark>}
                </ListItem>
              );
            })}
          </List>
        </PopupWrapper>
      </FocusLock>
    </AnimatePresence>
  );
}

// === Styled components ===
const PopupWrapper = styled.div`
  position: absolute;
  width: 260px;
  background: rgba(23, 28, 38, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #e2e8f0;
  z-index: 1200;
  padding: 8px;
`;

const Header = styled.div`
  font-weight: 600;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
`;

const SearchInput = styled.input`
  width: 100%;
  margin: 8px 0;
  background: rgba(31, 38, 50, 0.8);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 6px 8px;
  color: #e2e8f0;
  font-size: 14px;
  outline: none;
  &::placeholder {
    color: #94a3b8;
  }
`;

const List = styled.div`
  max-height: 220px;
  overflow-y: auto;
`;

const EmptyText = styled.div`
  padding: 12px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(59,130,246,0.15);
  }
  &.assigned {
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    color: white;
  }
  mark {
    background: transparent;
    color: #3b82f6;
    font-weight: 600;
  }
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
`;

const CheckMark = styled.span`
  margin-left: auto;
  font-size: 14px;
`;
