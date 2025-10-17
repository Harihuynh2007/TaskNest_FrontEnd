import React, { useMemo, useCallback, useRef } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MemberItemWrapper,
  MemberAvatar,
  MemberInfo,
  MemberName,
  MemberEmail,
  MemberActions,
  RoleDropdownContainer,
  RoleDropdownTrigger,
  RoleDropdownMenu,
  RoleDropdownItem,
  RoleInfo,
  RoleName,
  RoleDescription,
  RemoveButton,
  OwnerBadge,
} from './ShareBoardPopup.styles';

import {  initialState, stateReducer, ROLES, LOADING_STATES, ERROR_TYPES } from '../../components/hook/useShareBoardReducer';

// custom hook nhỏ, giữ đúng behavior gốc
const useClickOutside = (ref, cb) => {
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
};

export default React.memo(function MemberItem({
  member,
  boardOwnerId,
  onRoleChange,
  onRemove,
  isDropdownOpen,
  onToggleDropdown,
}) {
  const isOwner = member.user.id === boardOwnerId;
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => {
    if (isDropdownOpen) onToggleDropdown();
  });

  const handleRoleChange = useCallback(
    (newRole) => {
      onRoleChange(member.user.id, newRole);
      onToggleDropdown();
    },
    [member.user.id, onRoleChange, onToggleDropdown]
  );

  const handleRemove = useCallback(() => {
    if (
      window.confirm(
        `Remove ${member.user.display_name || member.user.username} from this board?`
      )
    ) {
      onRemove(member);
    }
  }, [member, onRemove]);

  const avatarUrl = useMemo(
    () =>
      member.user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        member.user.display_name || member.user.username
      )}&background=0c66e4&color=fff&size=32`,
    [member.user]
  );

  return (
    <MemberItemWrapper>
      <MemberAvatar
        src={avatarUrl}
        alt={member.user.display_name || member.user.username}
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            member.user.display_name || member.user.username
          )}&background=0c66e4&color=fff&size=32`;
        }}
      />

      <MemberInfo>
        <MemberName>{member.user.display_name || member.user.username}</MemberName>
        <MemberEmail>{member.user.email}</MemberEmail>
      </MemberInfo>

      {isOwner ? (
        <OwnerBadge>Owner</OwnerBadge>
      ) : (
        <MemberActions>
          <RoleDropdownContainer ref={dropdownRef}>
            <RoleDropdownTrigger onClick={onToggleDropdown} $isOpen={isDropdownOpen}>
              {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member'}
              <FaChevronDown size={12} />
            </RoleDropdownTrigger>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  <RoleDropdownMenu>
                    {Object.entries({
                      [ROLES.ADMIN]: 'Admin',
                      [ROLES.EDITOR]: 'Member',
                      [ROLES.VIEWER]: 'Observer',
                    }).map(([role, label]) => (
                      <RoleDropdownItem
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        $isSelected={member.role === role}
                      >
                        <RoleInfo>
                          <RoleName>{label}</RoleName>
                          <RoleDescription>
                            {role === ROLES.ADMIN && 'Can edit and manage board settings'}
                            {role === ROLES.EDITOR && 'Can add and edit cards'}
                            {role === ROLES.VIEWER && 'Can only view board content'}
                          </RoleDescription>
                        </RoleInfo>
                      </RoleDropdownItem>
                    ))}
                  </RoleDropdownMenu>
                </motion.div>
              )}
            </AnimatePresence>
          </RoleDropdownContainer>

          <RemoveButton onClick={handleRemove} title="Remove member">
            <FaTimes size={12} />
          </RemoveButton>
        </MemberActions>
      )}
    </MemberItemWrapper>
  );
});
