import React, { useMemo, useCallback } from 'react';
import {
  SearchResultWrapper,
  MemberAvatar,
  MemberInfo,
  MemberName,
  MemberEmail,
  RoleBadge,
} from './ShareBoardPopup.styles';
import { ROLES } from '../../components/hook/useShareBoardReducer';

export default React.memo(function SearchResultItem({ user, onSelect, selectedRole }) {
  const avatarUrl = useMemo(() => {
    return (
      user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.display_name || user.username
      )}&background=0c66e4&color=fff&size=32`
    );
  }, [user]);

  const handleSelect = useCallback(() => {
    onSelect(user, selectedRole);
  }, [user, selectedRole, onSelect]);

  const roleLabelMap = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.EDITOR]: 'Member',
    [ROLES.VIEWER]: 'Observer',
  };

  return (
    <SearchResultWrapper onClick={handleSelect}>
      <MemberAvatar
        src={avatarUrl}
        alt={user.display_name || user.username}
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.display_name || user.username
          )}&background=0c66e4&color=fff&size=32`;
        }}
      />
      <MemberInfo>
        <MemberName>{user.display_name || user.username}</MemberName>
        <MemberEmail>{user.email}</MemberEmail>
      </MemberInfo>
      <RoleBadge>{roleLabelMap[selectedRole] || 'Member'}</RoleBadge>
    </SearchResultWrapper>
  );
});
