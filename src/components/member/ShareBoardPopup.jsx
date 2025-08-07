import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import { FaTimes, FaLink, FaCopy, FaTrash, FaChevronDown } from 'react-icons/fa';

import {
  addMemberToBoard,
  fetchBoardMembers,
  updateMemberRole,
  removeMember,
  generateShareLink,
  deleteShareLink,
  getShareLink,
} from '../../api/boardApi';
import { searchUsers } from '../../api/authApi';

// Constants
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  OBSERVER: 'observer'
};

const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MEMBER]: 'Member',
  [ROLES.OBSERVER]: 'Observer'
};

// Components
const MemberItem = ({ member, boardOwnerId, onRoleChange, onRemove }) => {
  const isOwner = member.user.id === boardOwnerId;
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const handleRoleChange = useCallback((newRole) => {
    onRoleChange(member.user.id, newRole);
    setIsRoleDropdownOpen(false);
  }, [member.user.id, onRoleChange]);

  return (
    <MemberItemWrapper>
      <MemberAvatar 
        src={member.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.display_name || member.user.username)}&background=0c66e4&color=fff&size=32`}
        alt={member.user.display_name || member.user.username}
      />
      
      <MemberInfo>
        <MemberName>{member.user.display_name || member.user.username}</MemberName>
        <MemberEmail>{member.user.email}</MemberEmail>
      </MemberInfo>

      {isOwner ? (
        <OwnerBadge>Owner</OwnerBadge>
      ) : (
        <MemberActions>
          <RoleDropdownContainer>
            <RoleDropdownTrigger 
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              $isOpen={isRoleDropdownOpen}
            >
              {ROLE_LABELS[member.role] || 'Member'}
              <FaChevronDown size={12} />
            </RoleDropdownTrigger>
            
            {isRoleDropdownOpen && (
              <RoleDropdownMenu>
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  role !== ROLES.OWNER && (
                    <RoleDropdownItem 
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      $isSelected={member.role === role}
                    >
                      {label}
                    </RoleDropdownItem>
                  )
                ))}
              </RoleDropdownMenu>
            )}
          </RoleDropdownContainer>
          
          <RemoveButton 
            onClick={() => onRemove(member)}
            title="Remove member"
          >
            <FaTimes size={12} />
          </RemoveButton>
        </MemberActions>
      )}
    </MemberItemWrapper>
  );
};

const SearchResultItem = ({ user, onSelect }) => (
  <SearchResultWrapper onClick={() => onSelect(user)}>
    <MemberAvatar 
      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username)}&background=0c66e4&color=fff&size=32`}
      alt={user.display_name || user.username}
    />
    <MemberInfo>
      <MemberName>{user.display_name || user.username}</MemberName>
      <MemberEmail>{user.email}</MemberEmail>
    </MemberInfo>
  </SearchResultWrapper>
);

const ShareLinkSection = ({ inviteLink, onCopyLink, onCreateLink, onDeleteLink }) => (
  <LinkSectionWrapper>
    <LinkHeader>
      <FaLink size={14} />
      <LinkTitle>Share this board with a link</LinkTitle>
    </LinkHeader>
    
    {inviteLink ? (
      <LinkControls>
        <LinkDescription>Anyone with this link can join as a member</LinkDescription>
        <LinkActions>
          <SecondaryButton onClick={onCopyLink}>
            <FaCopy size={12} />
            Copy link
          </SecondaryButton>
          <DangerButton onClick={onDeleteLink}>
            <FaTrash size={12} />
            Delete
          </DangerButton>
        </LinkActions>
      </LinkControls>
    ) : (
      <LinkControls>
        <LinkDescription>Create a link that allows anyone to join this board</LinkDescription>
        <SecondaryButton onClick={onCreateLink}>Create link</SecondaryButton>
      </LinkControls>
    )}
  </LinkSectionWrapper>
);

export default function ShareBoardPopup({ boardId, onClose, boardOwnerId }) {
  // State
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const inviteLink = inviteToken ? `${window.location.origin}/join/${inviteToken}` : '';

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [membersResponse, linkResponse] = await Promise.allSettled([
          fetchBoardMembers(boardId),
          getShareLink(boardId)
        ]);

        if (membersResponse.status === 'fulfilled') {
          setMembers(membersResponse.value.data || []);
        }

        if (linkResponse.status === 'fulfilled' && linkResponse.value?.data?.token) {
          setInviteToken(linkResponse.value.data.token);
        }
      } catch (error) {
        console.error('Failed to load board data:', error);
        toast.error('Failed to load board data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [boardId]);

  // Search users
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchUsers(debouncedSearch);
        const memberIds = new Set(members.map(m => m.user.id));
        const filteredResults = response.data.filter(user => !memberIds.has(user.id));
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch, members]);

  // Event handlers
  const handleInviteUser = useCallback(async (user) => {
    if (!user?.id) {
      toast.error('Invalid user selected');
      return;
    }

    if (members.some(m => m.user.id === user.id)) {
      toast.error('User is already a member');
      return;
    }

    try {
      const response = await addMemberToBoard(boardId, user.id);
      setMembers(prevMembers => [...prevMembers, response.data]);
      toast.success(`${user.display_name || user.username} has been added to the board`);
      
      // Clear search
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add member';
      toast.error(errorMessage);
    }
  }, [boardId, members]);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    try {
      await updateMemberRole(boardId, userId, newRole);
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.user.id === userId 
            ? { ...member, role: newRole }
            : member
        )
      );
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
    }
  }, [boardId]);

  const handleRemoveMember = useCallback(async (member) => {
    try {
      await removeMember(boardId, member.user.id);
      setMembers(prevMembers => 
        prevMembers.filter(m => m.user.id !== member.user.id)
      );
      toast.success(`${member.user.display_name || member.user.username} has been removed`);
    } catch (error) {
      toast.error('Failed to remove member');
    }
  }, [boardId]);

  const handleCreateLink = useCallback(async () => {
    try {
      const response = await generateShareLink(boardId);
      setInviteToken(response.data.token);
      toast.success('Share link created');
    } catch (error) {
      toast.error('Failed to create share link');
    }
  }, [boardId]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  }, [inviteLink]);

  const handleDeleteLink = useCallback(async () => {
    try {
      await deleteShareLink(boardId);
      setInviteToken(null);
      toast.success('Share link deleted');
    } catch (error) {
      toast.error('Failed to delete share link');
    }
  }, [boardId]);

  if (isLoading) {
    return (
      <PopupOverlay onClick={onClose}>
        <PopupContainer onClick={e => e.stopPropagation()}>
          <LoadingState>Loading...</LoadingState>
        </PopupContainer>
      </PopupOverlay>
    );
  }

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer onClick={e => e.stopPropagation()}>
        <PopupHeader>
          <PopupTitle>Share board</PopupTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </PopupHeader>

        <PopupContent>
          {/* Search Section */}
          <SearchSection>
            <SearchInputWrapper>
              <SearchInput
                type="email"
                placeholder="Email address or name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MemberRoleSelect>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="observer">Observer</option>
              </MemberRoleSelect>
              <PrimaryButton 
                onClick={() => searchResults.length > 0 && handleInviteUser(searchResults[0])}
                disabled={!searchResults.length}
              >
                Share
              </PrimaryButton>
            </SearchInputWrapper>

            {/* Search Results */}
            {(isSearching || searchResults.length > 0) && (
              <SearchResultsList>
                {isSearching && (
                  <SearchLoadingItem>Searching...</SearchLoadingItem>
                )}
                {searchResults.map(user => (
                  <SearchResultItem
                    key={user.id}
                    user={user}
                    onSelect={handleInviteUser}
                  />
                ))}
              </SearchResultsList>
            )}
          </SearchSection>

          {/* Share Link Section */}
          <ShareLinkSection
            inviteLink={inviteLink}
            onCopyLink={handleCopyLink}
            onCreateLink={handleCreateLink}
            onDeleteLink={handleDeleteLink}
          />

          {/* Members Section */}
          <MembersSection>
            <SectionHeader>
              <SectionTitle>Board members</SectionTitle>
              <MemberCount>{members.length}</MemberCount>
            </SectionHeader>

            <MembersList>
              {members.length > 0 ? (
                members.map(member => (
                  <MemberItem
                    key={member.user.id}
                    member={member}
                    boardOwnerId={boardOwnerId}
                    onRoleChange={handleRoleChange}
                    onRemove={handleRemoveMember}
                  />
                ))
              ) : (
                <EmptyState>This board has no members yet.</EmptyState>
              )}
            </MembersList>
          </MembersSection>
        </PopupContent>
      </PopupContainer>
    </PopupOverlay>
  );
}

// Styled Components
const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PopupContainer = styled.div`
  width: 100%;
  max-width: 584px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(9, 30, 66, 0.25);
  display: flex;
  flex-direction: column;
  margin: 20px;
`;

const PopupHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #dfe1e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const PopupTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #172b4d;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b778c;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #f4f5f7;
    color: #172b4d;
  }
`;

const PopupContent = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SearchSection = styled.div`
  position: relative;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #dfe1e6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0c66e4;
  }

  &::placeholder {
    color: #6b778c;
  }
`;

const MemberRoleSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #dfe1e6;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 100px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #0c66e4;
  }
`;

const PrimaryButton = styled.button`
  background: #0c66e4;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: #0052cc;
  }

  &:disabled {
    background: #dfe1e6;
    color: #6b778c;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: #f4f5f7;
  color: #44546f;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #e4e6ea;
    border-color: #c1c7d0;
  }
`;

const DangerButton = styled(SecondaryButton)`
  color: #c9372c;
  
  &:hover {
    background: #ffebe6;
    border-color: #ffbdad;
  }
`;

const SearchResultsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
`;

const SearchResultWrapper = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f4f5f7;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f4f5f7;
  }
`;

const SearchLoadingItem = styled.div`
  padding: 16px;
  text-align: center;
  color: #6b778c;
  font-size: 14px;
`;

const LinkSectionWrapper = styled.div`
  padding: 16px;
  background: #f4f5f7;
  border-radius: 8px;
  border: 1px solid #dfe1e6;
`;

const LinkHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const LinkTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
`;

const LinkControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LinkDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b778c;
`;

const LinkActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MembersSection = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f4f5f7;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
`;

const MemberCount = styled.span`
  font-size: 12px;
  color: #6b778c;
  background: #f4f5f7;
  padding: 2px 8px;
  border-radius: 12px;
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MemberItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
`;

const MemberAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #172b4d;
  margin-bottom: 2px;
`;

const MemberEmail = styled.div`
  font-size: 12px;
  color: #6b778c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RoleDropdownContainer = styled.div`
  position: relative;
`;

const RoleDropdownTrigger = styled.button`
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e4e6ea;
  }

  svg {
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease;
  }
`;

const RoleDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 4px;
  min-width: 120px;
`;

const RoleDropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: ${({ $isSelected }) => $isSelected ? '#e4e6ea' : 'transparent'};
  font-weight: ${({ $isSelected }) => $isSelected ? '500' : 'normal'};

  &:hover {
    background: #f4f5f7;
  }

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #6b778c;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #ffebe6;
    color: #c9372c;
  }
`;

const OwnerBadge = styled.span`
  font-size: 12px;
  color: #6b778c;
  background: #f4f5f7;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6b778c;
  font-size: 14px;
  padding: 32px 16px;
`;

const LoadingState = styled.div`
  text-align: center;
  color: #6b778c;
  font-size: 14px;
  padding: 40px;
`;