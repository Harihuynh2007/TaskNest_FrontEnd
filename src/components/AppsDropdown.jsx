// src/components/AppsDropdown.jsx
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  MdApps, MdViewKanban, MdHome, MdPeopleAlt, MdSettings,
  MdInsights, MdExtension, MdAdd
} from 'react-icons/md';

/** Config */
const CORE_APPS = [
  { key: 'boards',   label: 'Boards',   to: '/boards',     icon: <MdViewKanban />, accent: 'var(--brand-primary, #5bbcf7)' },
  { key: 'home',     label: 'Home',     to: '/home',       icon: <MdHome />,       accent: '#7c9cff' },
  { key: 'members',  label: 'Members',  to: '/members',    icon: <MdPeopleAlt />,  accent: '#78e0b8' },
  { key: 'reports',  label: 'Reports',  to: '/reports',    icon: <MdInsights />,   accent: '#f7c56b' },
  { key: 'settings', label: 'Settings', to: '/settings',   icon: <MdSettings />,   accent: '#a78bfa' },
];
const INTEGRATIONS = [
  { key: 'slack',   label: 'Slack',   to: '/integrations/slack' },
  { key: 'github',  label: 'GitHub',  to: '/integrations/github' },
  { key: 'notion',  label: 'Notion',  to: '/integrations/notion' },
  { key: 'drive',   label: 'Drive',   to: '/integrations/drive' }
];

/** Styled */
const ToggleBtn = styled(Dropdown.Toggle)`
  background: transparent !important;
  border: 1px solid var(--panel-border, #3a465e) !important;
  padding: 6px 8px !important;
  border-radius: 12px !important;
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--header-text, #e6e9ee) !important;
  &:hover, &:focus {
    background: var(--header-hover, #1b2435) !important;
    color: var(--header-text, #e6e9ee) !important;
  }
`;

const Panel = styled(Dropdown.Menu)`
  width: min(92vw, 480px);
  padding: 10px;
  background: var(--surface-4, #2c3750);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 14px;
  box-shadow: 0 16px 42px rgba(0,0,0,.36);
  color: var(--text-primary, #e6e9ee);
  z-index: 1300; /* đảm bảo nổi trên header/khác */
`;

const HeaderRow = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 6px 6px 10px;
`;

const Search = styled.input`
  flex: 1;
  background: var(--search-bg, #162033);
  color: var(--text-primary, #e6e9ee);
  border: 1px solid var(--search-border, var(--panel-border, #3a465e));
  border-radius: 10px;
  padding: 8px 10px; font-size: 14px;
  &:focus{ outline: none; box-shadow: 0 0 0 3px var(--search-ring, rgba(91,188,247,.28)); border-color: transparent; }
`;

const Section = styled.div`padding: 6px;`;
const Title = styled.div`
  font-size: 11px; font-weight: 800; letter-spacing: .08em;
  color: var(--text-tertiary, #6f7c91);
  text-transform: uppercase; margin: 6px 4px 8px;
`;

const Grid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;`;

const Tile = styled(Link)`
  text-decoration: none;
  background: var(--surface-2, #1b2331);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 12px;
  padding: 12px;
  color: var(--text-primary, #e6e9ee);
  display: grid; grid-template-columns: 40px 1fr; gap: 10px; align-items: center;
  transition: transform .06s ease, box-shadow .15s ease, background .15s ease;
  &:hover{ background: var(--surface-3, #232d3e); transform: translateY(-1px); box-shadow: 0 10px 24px rgba(0,0,0,.28); }
`;

const IconCircle = styled.div`
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center; font-size: 20px; color: #0b1220;
  background: ${p => p.$accent || '#9aa5b5'};
  box-shadow: inset 0 -6px 14px rgba(0,0,0,.18);
`;
const Label = styled.div`font-weight: 800;`;
const Subtle = styled.div`font-size: 12px; color: var(--text-secondary, #9aa5b5);`;

const Row = styled.div`display: flex; gap: 8px; flex-wrap: wrap;`;
const GhostBtn = styled(Link)`
  text-decoration: none;
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--surface-2, #1b2331);
  border: 1px solid var(--panel-border, #3a465e);
  color: var(--text-primary, #e6e9ee);
  border-radius: 10px; padding: 8px 12px; font-weight: 700;
  &:hover{ background: var(--surface-3, #232d3e); }
`;
const Footer = styled.div`
  padding: 8px 6px 2px; display: flex; justify-content: space-between; align-items: center;
  color: var(--text-secondary, #9aa5b5); font-size: 12px;
`;

/** Component */
export default function AppsDropdown() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false); // controlled dropdown

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return CORE_APPS;
    return CORE_APPS.filter(a => a.label.toLowerCase().includes(t));
  }, [q]);

  return (
    <Dropdown align="start" show={open} onToggle={setOpen}>
      {/* KHÔNG dùng as={Button} để tránh mất hành vi Toggle */}
      <ToggleBtn id="apps-menu-toggle" onClick={() => setOpen(v => !v)}>
        <MdApps size={20} />
      </ToggleBtn>

      <Panel>
        <HeaderRow>
          <Search placeholder="Search apps…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <GhostBtn to="/create"><MdAdd /> New</GhostBtn>
        </HeaderRow>

        <Section>
          <Title>Pinned</Title>
          <Grid>
            {filtered.map(app => (
              <Tile to={app.to} key={app.key} onClick={() => setOpen(false)}>
                <IconCircle $accent={app.accent}>{app.icon}</IconCircle>
                <div>
                  <Label>{app.label}</Label>
                  <Subtle>Open {app.label.toLowerCase()}</Subtle>
                </div>
              </Tile>
            ))}
          </Grid>
        </Section>

        <Section>
          <Title>Quick actions</Title>
          <Row>
            <GhostBtn to="/boards/new" onClick={() => setOpen(false)}><MdAdd /> Create board</GhostBtn>
            <GhostBtn to="/workspaces/new" onClick={() => setOpen(false)}><MdAdd /> Create workspace</GhostBtn>
            <GhostBtn to="/members/invite" onClick={() => setOpen(false)}><MdAdd /> Invite members</GhostBtn>
          </Row>
        </Section>

        <Section>
          <Title>Integrations</Title>
          <Row>
            {INTEGRATIONS.map(it => (
              <GhostBtn key={it.key} to={it.to} onClick={() => setOpen(false)}>
                <MdExtension /> {it.label}
              </GhostBtn>
            ))}
          </Row>
        </Section>

        <Footer>
          <span>TaskNest Apps</span>
          <Link to="/apps" style={{ color: 'var(--text-secondary)' }} onClick={() => setOpen(false)}>
            Manage apps →
          </Link>
        </Footer>
      </Panel>
    </Dropdown>
  );
}
