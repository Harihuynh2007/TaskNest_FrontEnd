import React, { useEffect, useReducer, useCallback, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import FocusLock from 'react-focus-lock';

import {
  addMemberToBoard,
  fetchBoardMembers,
  updateMemberRole,
  removeMember,
  generateShareLink,
  deleteShareLink,
  getShareLink,
  inviteMemberByEmail,
} from '../../api/boardApi';
import { searchUsers } from '../../api/authApi';

import {
  initialState,
  stateReducer,
  ROLES,
  LOADING_STATES,
  ERROR_TYPES,
} from '../../components/hook/useShareBoardReducer';

import MemberItem from './MemberItem';
import SearchResultItem from './SearchResultItem';
import ShareLinkSection from './ShareLinkSection';
import ErrorBoundary from './ErrorBoundary';
import {
  PopupOverlay,
  PopupContainer,
  PopupHeader,
  PopupTitle,
  CloseButton,
  PopupContent,
  SearchSection,
  SearchInputWrapper,
  SearchInput,
  MemberRoleSelect,
  PrimaryButton,
  SearchResultsList,
  SearchLoadingItem,
  MembersSection,
  SectionHeader,
  SectionTitle,
  MemberCount,
  MembersList,
  EmptyState,
  LoadingState,
  ErrorMessage,
} from './ShareBoardPopup.styles';

const isValidEmail = (s) => /\S+@\S+\.\S+/.test(String(s || '').trim());

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

const useAsyncOperation = (operation, deps = []) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      return await operation(...args);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);
  return { execute, loading, error };
};

export default function ShareBoardPopup({ boardId, onClose, boardOwnerId }) {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const [debouncedSearch] = useDebounce(state.searchQuery, 300);
  const popupRef = useRef(null);

  // ESC để đóng
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useClickOutside(popupRef, () => dispatch({ type: 'CLOSE_ALL_DROPDOWNS' }));

  const inviteLink = useMemo(
    () => (state.inviteToken ? `${window.location.origin}/join/${state.inviteToken}` : ''),
    [state.inviteToken]
  );

  const memberIds = useMemo(
    () => new Set(state.members.map((m) => m.user.id).concat([boardOwnerId])),
    [state.members, boardOwnerId]
  );

  const filteredSearchResults = useMemo(
    () => state.searchResults.filter((u) => !memberIds.has(u.id)),
    [state.searchResults, memberIds]
  );

  const handleError = useCallback((error, type = ERROR_TYPES.GENERAL) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    dispatch({ type: 'SET_ERROR', errorType: type, error: { message: msg } });
    toast.error(msg);
  }, []);

  const clearError = useCallback((type) => {
    dispatch({ type: 'CLEAR_ERROR', errorType: type });
  }, []);

  // ===== Load initial data =====
  const { execute: loadInitialData } = useAsyncOperation(async () => {
    const [membersRes, linkRes] = await Promise.allSettled([
      fetchBoardMembers(boardId),
      getShareLink(boardId),
    ]);

    if (membersRes.status === 'fulfilled') {
      dispatch({ type: 'SET_MEMBERS', members: membersRes.value.data || [] });
    } else throw membersRes.reason;

    if (linkRes.status === 'fulfilled' && linkRes.value?.data?.token) {
      dispatch({ type: 'SET_INVITE_TOKEN', token: linkRes.value.data.token });
    }
  }, [boardId]);

  useEffect(() => {
    loadInitialData()
      .catch((err) => handleError(err, ERROR_TYPES.GENERAL))
      .finally(() =>
        dispatch({
          type: 'SET_LOADING',
          loadingType: LOADING_STATES.INITIAL,
          value: false,
        })
      );
  }, [loadInitialData, handleError]);

  // ===== Search users =====
  const { execute: performSearch } = useAsyncOperation(async (query) => {
    if (query.trim().length < 1) {
      dispatch({ type: 'SET_SEARCH_RESULTS', results: [] });
      return;
    }
    const data = await searchUsers(query);
    dispatch({
      type: 'SET_SEARCH_RESULTS',
      results: Array.isArray(data) ? data : data?.results || [],
    });
  }, []);

  useEffect(() => {
    if (debouncedSearch !== state.searchQuery) return;
    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.SEARCH, value: true });
    clearError(ERROR_TYPES.SEARCH);
    performSearch(debouncedSearch)
      .catch((e) => handleError(e, ERROR_TYPES.SEARCH))
      .finally(() =>
        dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.SEARCH, value: false })
      );
  }, [debouncedSearch, state.searchQuery, performSearch, handleError, clearError]);

  // ===== Member actions =====
  const { execute: inviteUser } = useAsyncOperation(async (user, role) => {
    if (!user?.id) throw new Error('Invalid user selected');
    if (memberIds.has(user.id)) throw new Error('User already a member');
    const res = await addMemberToBoard(boardId, user.id, role);
    dispatch({ type: 'ADD_MEMBER', member: res.data });
    dispatch({ type: 'CLEAR_SEARCH' });
    toast.success(`${user.display_name || user.username} has been added.`);
  }, [boardId, memberIds]);

  const handleInviteUser = useCallback(
    async (user, role = state.selectedRole) => {
      dispatch({
        type: 'SET_LOADING',
        loadingType: LOADING_STATES.MEMBER_ACTION,
        value: true,
      });
      clearError(ERROR_TYPES.MEMBER_ACTION);
      try {
        await inviteUser(user, role);
      } catch (err) {
        handleError(err, ERROR_TYPES.MEMBER_ACTION);
      } finally {
        dispatch({
          type: 'SET_LOADING',
          loadingType: LOADING_STATES.MEMBER_ACTION,
          value: false,
        });
      }
    },
    [state.selectedRole, inviteUser, handleError, clearError]
  );

  const { execute: changeRole } = useAsyncOperation(async (userId, newRole) => {
    await updateMemberRole(boardId, userId, newRole);
    dispatch({ type: 'UPDATE_MEMBER', userId, newRole });
    toast.success('Role updated successfully');
  }, [boardId]);

  const handleRoleChange = useCallback(
    async (userId, newRole) => {
      dispatch({
        type: 'SET_LOADING',
        loadingType: LOADING_STATES.MEMBER_ACTION,
        value: true,
      });
      clearError(ERROR_TYPES.MEMBER_ACTION);
      try {
        await changeRole(userId, newRole);
      } catch (err) {
        handleError(err, ERROR_TYPES.MEMBER_ACTION);
      } finally {
        dispatch({
          type: 'SET_LOADING',
          loadingType: LOADING_STATES.MEMBER_ACTION,
          value: false,
        });
      }
    },
    [changeRole, handleError, clearError]
  );

  const { execute: removeMemberFromBoard } = useAsyncOperation(async (member) => {
    await removeMember(boardId, member.user.id);
    dispatch({ type: 'REMOVE_MEMBER', userId: member.user.id });
    toast.success(`${member.user.display_name || member.user.username} has been removed.`);
  }, [boardId]);

  const handleRemoveMember = useCallback(
    async (member) => {
      dispatch({
        type: 'SET_LOADING',
        loadingType: LOADING_STATES.MEMBER_ACTION,
        value: true,
      });
      clearError(ERROR_TYPES.MEMBER_ACTION);
      try {
        await removeMemberFromBoard(member);
      } catch (err) {
        handleError(err, ERROR_TYPES.MEMBER_ACTION);
      } finally {
        dispatch({
          type: 'SET_LOADING',
          loadingType: LOADING_STATES.MEMBER_ACTION,
          value: false,
        });
      }
    },
    [removeMemberFromBoard, handleError, clearError]
  );

  // ===== Share link =====
  const { execute: createShareLink } = useAsyncOperation(async () => {
    const res = await generateShareLink(boardId);
    dispatch({ type: 'SET_INVITE_TOKEN', token: res.data.token });
    toast.success('Share link created');
  }, [boardId]);

  const handleCreateLink = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.LINK_ACTION, value: true });
    clearError(ERROR_TYPES.LINK_ACTION);
    try {
      await createShareLink();
    } catch (err) {
      handleError(err, ERROR_TYPES.LINK_ACTION);
    } finally {
      dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.LINK_ACTION, value: false });
    }
  }, [createShareLink, handleError, clearError]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Link copied to clipboard');
    } catch {
      const t = document.createElement('textarea');
      t.value = inviteLink;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
      toast.success('Link copied to clipboard');
    }
  }, [inviteLink]);

  const { execute: removeShareLink } = useAsyncOperation(async () => {
    await deleteShareLink(boardId);
    dispatch({ type: 'SET_INVITE_TOKEN', token: null });
    toast.success('Share link deleted');
  }, [boardId]);

  const handleDeleteLink = useCallback(async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this share link? Anyone with the current link will no longer be able to join.'
      )
    )
      return;
    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.LINK_ACTION, value: true });
    clearError(ERROR_TYPES.LINK_ACTION);
    try {
      await removeShareLink();
    } catch (err) {
      handleError(err, ERROR_TYPES.LINK_ACTION);
    } finally {
      dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.LINK_ACTION, value: false });
    }
  }, [removeShareLink, handleError, clearError]);

  const handleToggleDropdown = useCallback(
    (id) => dispatch({ type: 'TOGGLE_DROPDOWN', dropdownId: `member-${id}` }),
    []
  );

  if (state.loading.initial) {
    return (
      <PopupOverlay>
        <PopupContainer>
          <LoadingState>
            <FaSpinner className="spin" size={24} />
            <span>Loading board data...</span>
          </LoadingState>
        </PopupContainer>
      </PopupOverlay>
    );
  }

  return (
    <PopupOverlay>
      <FocusLock>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <PopupContainer ref={popupRef}>
            <PopupHeader>
              <PopupTitle>Share board</PopupTitle>
              <CloseButton onClick={onClose}>
                <FaTimes />
              </CloseButton>
            </PopupHeader>

            <PopupContent>
              <ErrorBoundary
                error={state.errors.general}
                onRetry={() => {
                  clearError(ERROR_TYPES.GENERAL);
                  loadInitialData();
                }}
              >
                {/* Search Section */}
                <SearchSection>
                  <SearchInputWrapper>
                    <SearchInput
                      placeholder="Email address or name"
                      value={state.searchQuery}
                      onChange={(e) =>
                        dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })
                      }
                      disabled={state.loading.memberAction}
                      onKeyDown={(e) => e.key === 'Enter' && handleInviteUser()}
                    />
                    <MemberRoleSelect
                      value={state.selectedRole}
                      onChange={(e) =>
                        dispatch({ type: 'SET_SELECTED_ROLE', role: e.target.value })
                      }
                      disabled={state.loading.memberAction}
                    >
                      <option value={ROLES.ADMIN}>Admin</option>
                      <option value={ROLES.EDITOR}>Member</option>
                      <option value={ROLES.VIEWER}>Observer</option>
                    </MemberRoleSelect>

                    <PrimaryButton
                      onClick={() => handleInviteUser()}
                      disabled={state.loading.memberAction}
                    >
                      {state.loading.memberAction ? (
                        <FaSpinner className="spin" size={12} />
                      ) : (
                        'Share'
                      )}
                    </PrimaryButton>
                  </SearchInputWrapper>

                  <SearchResultsList>
                    {state.loading.search ? (
                      <SearchLoadingItem>
                        <FaSpinner className="spin" size={16} /> Searching...
                      </SearchLoadingItem>
                    ) : (
                      filteredSearchResults.map((u) => (
                        <SearchResultItem
                          key={u.id}
                          user={u}
                          selectedRole={state.selectedRole}
                          onSelect={handleInviteUser}
                        />
                      ))
                    )}
                  </SearchResultsList>
                  {state.errors.search && (
                    <ErrorMessage>{state.errors.search.message}</ErrorMessage>
                  )}
                </SearchSection>

                {/* Share Link Section */}
                <ShareLinkSection
                  inviteLink={inviteLink}
                  onCopyLink={handleCopyLink}
                  onCreateLink={handleCreateLink}
                  onDeleteLink={handleDeleteLink}
                  isLoading={state.loading.linkAction}
                />

                {/* Members Section */}
                <MembersSection>
                  <SectionHeader>
                    <SectionTitle>Board members</SectionTitle>
                    <MemberCount>{state.members.length}</MemberCount>
                  </SectionHeader>

                  <MembersList>
                    {state.members.length > 0 ? (
                      state.members.map((m) => (
                        <MemberItem
                          key={m.user.id}
                          member={m}
                          boardOwnerId={boardOwnerId}
                          onRoleChange={handleRoleChange}
                          onRemove={handleRemoveMember}
                          isDropdownOpen={state.ui.openDropdowns.has(`member-${m.user.id}`)}
                          onToggleDropdown={() => handleToggleDropdown(m.user.id)}
                        />
                      ))
                    ) : (
                      <EmptyState>No members yet.</EmptyState>
                    )}
                  </MembersList>
                </MembersSection>
              </ErrorBoundary>
            </PopupContent>
          </PopupContainer>
        </motion.div>
      </FocusLock>
    </PopupOverlay>
  );
}
