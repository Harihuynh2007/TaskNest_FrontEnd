// src/components/UserDropdown.jsx
import React, { useContext, useMemo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Dropdown, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaChevronDown, FaSignOutAlt, FaQuestionCircle, FaPlus, FaExchangeAlt,
  FaCog, FaIdBadge, FaUser, FaKeyboard, FaMoon, FaSun
} from 'react-icons/fa';

import { AuthContext } from '../contexts/AuthContext';
import { ModalContext } from '../contexts/ModalContext';

/* =========================
   Styled (dark-premium ready)
   ========================= */
const ToggleBtn = styled(Dropdown.Toggle)`
  background: transparent !important;
  border: 1px solid var(--panel-border, #3a465e) !important;
  padding: 4px 8px !important;
  border-radius: 999px !important;
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--header-text, #e6e9ee) !important;

  &:hover, &:focus {
    background: var(--header-hover, #1b2435) !important;
    color: var(--header-text, #e6e9ee) !important;
  }
`;

const Menu = styled(Dropdown.Menu)`
  min-width: 300px;
  padding: 8px;
  background: var(--surface-4, #2c3750);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 12px;
  box-shadow: 0 14px 32px rgba(0,0,0,.38);
`;

const SectionTitle = styled.div`
  font-size: 11px; font-weight: 800; letter-spacing: .08em;
  color: var(--text-tertiary, #6f7c91);
  padding: 8px 8px 4px; text-transform: uppercase;
`;

const Divider = styled.div`
  height: 1px; margin: 8px 0;
  background: var(--panel-border, #3a465e); opacity: .7;
`;

const Item = styled(Dropdown.Item)`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 8px; border-radius: 10px;
  color: var(--text-primary, #e6e9ee);
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  &:hover, &:focus {
    background: var(--surface-3, #232d3e) !important;
    color: var(--text-primary, #e6e9ee) !important;
  }
  svg { opacity: .9; }
`;

/* Dùng cho item hành động (onClick) để tránh bị style .btn/.button của Bootstrap */
const ActionItem = styled.button`
  all: unset;               /* reset mọi kiểu mặc định */
  box-sizing: border-box;
  width: 100%;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 8px;
  border-radius: 10px;
  color: var(--text-primary, #e6e9ee);
  cursor: pointer;
  &:hover, &:focus-visible {
    background: var(--surface-3, #232d3e);
    outline: none;
  }
  svg { opacity: .9; }
`;


const AccountHeader = styled.div`
  display: flex; gap: 10px; padding: 10px; border-radius: 12px;
  background: var(--surface-3, #232d3e);
  align-items: center; margin: 4px 4px 6px;
  .name { font-weight: 800; color: var(--text-primary, #e6e9ee); }
  .email { font-size: 12px; color: var(--text-secondary, #9aa5b5); }
`;

const Avatar = styled(Image)`
  width: 32px; height: 32px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0; border: 1px solid var(--panel-border, #3a465e);
`;

const Dot = styled.span`
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: var(--brand-primary, #5bbcf7);
`;

const ToggleChip = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 2px 8px; border-radius: 999px;
  background: var(--surface-3, #232d3e); color: var(--text-secondary, #9aa5b5);
  font-size: 12px; font-weight: 700;
`;

/* =========================
   Helper: build menu config
   ========================= */
function buildMenu({ user, onLogout, openModal, onToggleTheme, isDark }) {
  const p = user?.profile || {};
  const name = p.display_name || p.display_name_computed || user?.email || 'User';
  const email = user?.email || '';
  const avatar =
    p.avatar_url || p.avatar_thumbnail_url ||
    `https://placehold.co/64x64/3a7bd5/ffffff?text=${encodeURIComponent(
      (p.initials || email?.[0] || 'U').toUpperCase()
    )}`;

  return [
    { type: 'account', name, email, avatar },

    { type: 'section', label: 'Account' },
    { icon: <FaExchangeAlt />, label: 'Switch accounts', href: '/auth/switch-accounts' },
    { icon: <FaIdBadge />, label: 'Manage account', href: '/account', target: '_blank' },

    { type: 'divider' },

    { type: 'section', label: 'Trello' },
    { icon: <FaUser />, label: 'Profile and visibility', href: '/u/me/profile' },
    { icon: <FaCog />, label: 'Settings', href: '/u/me/account' },
    {
      icon: isDark ? <FaSun /> : <FaMoon />,
      label: isDark ? 'Light theme' : 'Dark theme',
      onClick: onToggleTheme
    },

    { type: 'divider' },

    { icon: <FaPlus />, label: 'Create Workspace', onClick: () => openModal?.('CreateWorkspaceModal') },

    { type: 'divider' },

    { type: 'section', label: 'Help' },
    { icon: <FaQuestionCircle />, label: 'Help', href: '/help', target: '_blank' },
    { icon: <FaKeyboard />, label: 'Shortcuts', onClick: () => openModal?.('ShortcutsModal') },

    { type: 'divider' },

    { icon: <FaSignOutAlt />, label: 'Log out', onClick: onLogout }
  ];
}

/* =========================
   Component
   ========================= */
export default function UserDropdown({ align = 'end', onToggleTheme: onToggleThemeProp }) {
  const { user, logout } = useContext(AuthContext);
  const { openModal } = useContext(ModalContext);
  const [open, setOpen] = useState(false);

  // Theme toggle fallback (nếu không truyền prop)
  const isDark = typeof window !== 'undefined'
    ? document.body.getAttribute('data-theme') !== 'light'
    : true;

  const onToggleTheme = useCallback(() => {
    if (onToggleThemeProp) return onToggleThemeProp();
    const nowDark = document.body.getAttribute('data-theme') !== 'light';
    document.body.setAttribute('data-theme', nowDark ? 'light' : 'dark');
  }, [onToggleThemeProp]);

  const menu = useMemo(
    () => buildMenu({
      user,
      onLogout: logout,
      openModal,
      onToggleTheme,
      isDark
    }),
    [user, logout, openModal, onToggleTheme, isDark]
  );

  const account = menu.find(m => m.type === 'account') || {};
  const handleSelect = useCallback(() => setOpen(false), []);

  return (
    <Dropdown align={align} show={open} onToggle={setOpen} onSelect={handleSelect}>
      <ToggleBtn id="user-menu-toggle">
        <Avatar src={account.avatar} alt="avatar" roundedCircle />
        <ToggleChip><Dot /> {account.name?.split(' ')[0] || 'User'}</ToggleChip>
        <FaChevronDown size={12} />
      </ToggleBtn>

      <Menu>
        {/* Account header */}
        <AccountHeader>
          <Avatar src={account.avatar} alt="avatar" roundedCircle />
          <div>
            <div className="name">{account.name || 'User'}</div>
            {account.email ? <div className="email">{account.email}</div> : null}
          </div>
        </AccountHeader>

        {/* Items */}
        {menu.map((m, idx) => {
          if (m.type === 'account') return null;
          if (m.type === 'divider') return <Divider key={`div-${idx}`} />;
          if (m.type === 'section') return <SectionTitle key={`sec-${m.label}`}>{m.label}</SectionTitle>;

          const content = (
            <>
              {m.icon}
              <span>{m.label}</span>
            </>
          );

          if (m.href) {
            // External or internal
            return m.href.startsWith('http') || m.target === '_blank' ? (
              <Item as="a" href={m.href} target={m.target || '_self'} rel="noopener noreferrer" key={`a-${idx}`}>
                {content}
              </Item>
            ) : (
              <Item as={Link} to={m.href} key={`link-${idx}`}>
                {content}
              </Item>
            );
          }

          return (
            <ActionItem onClick={m.onClick} key={`btn-${idx}`} type="button">
              {content}
            </ActionItem>
          );
        })}
      </Menu>
    </Dropdown>
  );
}
