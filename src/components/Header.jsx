// src/components/Header.jsx
import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Navbar, Nav, Container, InputGroup, FormControl, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext, WorkspaceContext, ModalContext } from '../contexts';
import { MdSearch } from 'react-icons/md';
import { FiHelpCircle } from 'react-icons/fi';
import { AiOutlineGlobal } from 'react-icons/ai';
import UserDropdown from './UserDropdown';
import CreateDropdown from './CreateDropdown';
import BoardThemeDrawer from '../features/boards/BoardThemeDrawer';
import FeedbackPopup from '../components/FeedbackPopup';
import AppsDropdown from './AppsDropdown';
import NotificationBell from '../features/notifications/NotificationBell';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { workspaces, currentWorkspaceId, searchNav, setSearchNav } = useContext(WorkspaceContext);
  const { modals, closeModal } = useContext(ModalContext);

  const currentWs = workspaces.find(w => w.id === currentWorkspaceId);
  const [isFocused, setIsFocused] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showBoardTheme, setShowBoardTheme] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const createRef = useRef(null);
  const feedbackRef = useRef(null);
  const searchRef = useRef(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (createRef.current && !createRef.current.contains(e.target)) setShowCreateDropdown(false);
      if (feedbackRef.current && !feedbackRef.current.contains(e.target)) setShowFeedback(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Cmd/Ctrl + K to focus search
  useEffect(() => {
    const onKey = (e) => {
      const hotkey = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      if (hotkey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onCreateBoard = useCallback(() => {
    setShowCreateDropdown(false);
    setShowBoardTheme(true);
  }, []);

  return (
    <>
      <div className="tn-header-shadow" />
      <Navbar
        bg="transparent"
        expand="lg"
        className="tn-header sticky-top"
        role="navigation"
        aria-label="TaskNest primary"
      >
        <Container fluid className="px-3">
          {/* Left cluster: App switcher + logo */}
          <Nav className="align-items-center gap-2">
            <AppsDropdown />
            <button
              className="tn-brand"
              onClick={() => navigate('/boards')}
              aria-label="TaskNest Home"
              title="TaskNest"
            >

              <span className="tn-brand-glyph" aria-hidden="true" />
              <span className="tn-brand-text">TaskNest</span>
              {currentWs?.name && (
                <Badge bg="light" text="dark" className="ms-2 tn-ws-badge" title="Current workspace">
                  {currentWs.name}
                </Badge>
              )}
            </button>
          </Nav>


          {/* Center: Search */}
          <div className="tn-search-wrap">
            <InputGroup className={`tn-search ${isFocused ? 'focused' : ''}`}>
              <InputGroup.Text className="tn-search-icon">
                <MdSearch size={16} />
              </InputGroup.Text>
              <FormControl
                ref={searchRef}
                placeholder="Search (Ctrl / ⌘ + K)"
                value={searchNav}
                onChange={(e) => setSearchNav(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-label="Search boards, cards, members"
              />
            </InputGroup>
          </div>

          {/* Right cluster: Create | Feedback | Notifications | Help | Locale | User */}
          <Nav className="align-items-center gap-1">
            <div className="position-relative" ref={createRef}>
              <Button
                variant="success"
                className="tn-create-btn"
                onClick={() => setShowCreateDropdown(v => !v)}
                aria-haspopup="menu"
                aria-expanded={showCreateDropdown}
                aria-label="Create board or workspace"
              >
                <span className="tn-plus">＋</span> Create
              </Button>
              {showCreateDropdown && (
                <CreateDropdown
                  onCreateBoard={onCreateBoard}
                  onStartTemplate={() => {
                    setShowCreateDropdown(false);
                    navigate('/templates');
                  }}
                />
              )}
            </div>

            <div className="position-relative" ref={feedbackRef}>
              <button
                className="tn-icon-btn"
                aria-label="Feedback"
                onClick={() => setShowFeedback(v => !v)}
                title="Feedback"
              >
                {/* megaphone-ish icon */}
                <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
                  <path fill="currentColor" d="M13.5 3.1c0-.35-.37-.58-.69-.46L7.5 4.76v4.73l5.31 2.13c.32.13.69-.1.69-.46zM6 9.25H3a.5.5 0 0 1-.5-.5V5.5A.5.5 0 0 1 3 5h3v4.25ZM6 10.75V13a.5.5 0 0 1-.5.5H5A2 2 0 0 1 3 11v-2.25H6Z"/>
                </svg>
              </button>
              {showFeedback && <FeedbackPopup onClose={() => setShowFeedback(false)} />}
            </div>

            <NotificationBell />

            <button
              className="tn-icon-btn"
              aria-label="Help"
              title="Help & resources"
              onClick={() => navigate('/help')}
            >
              <FiHelpCircle size={18} />
            </button>

            <button
              className="tn-icon-btn"
              aria-label="Language & region"
              title="Language & region"
            >
              <AiOutlineGlobal size={18} />
            </button>

            {user && <UserDropdown logout={logout} />}
          </Nav>
        </Container>
      </Navbar>

      {showBoardTheme && (
        <BoardThemeDrawer
          show={showBoardTheme}
          onClose={() => setShowBoardTheme(false)}
          onCreate={(data) => {
            console.log('Create board:', data);
            setShowBoardTheme(false);
          }}
        />
      )}

      {modals.switchAccounts?.open && (
        <modals.switchAccounts.component
          onSwitch={modals.switchAccounts.props.onSwitch}
          onClose={() => closeModal('switchAccounts')}
        />
      )}
    </>
  );
}
