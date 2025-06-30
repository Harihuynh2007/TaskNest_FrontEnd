import React, { useContext, useState, useEffect } from 'react';
import {
  Navbar,
  Nav,
  Container,
  InputGroup,
  FormControl,
  Button,
  Image,
  Dropdown
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  MdApps,
  MdSearch,
  MdNotificationsNone
} from 'react-icons/md';
import { FiPlus, FiHelpCircle } from 'react-icons/fi';
import { AiOutlineGlobal } from 'react-icons/ai';

export default function Header({ onCreateBoard }) {
  const { user } = useContext(AuthContext);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.input-group')) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Navbar bg="white" expand="lg" className="border-bottom py-2">
      <Container fluid className="px-3">
        {/* LEFT: Apps dropdown + Brand */}
        <Nav className="align-items-center">
          <Dropdown alignRight>
            <Dropdown.Toggle
              as={Button}
              variant="link"
              id="apps-menu-toggle"
              style={{ padding: 0, lineHeight: 0, color: '#000' }}
              className="p-0 app-menu-toggle"
            >
              <MdApps size={24} />
            </Dropdown.Toggle>

            <Dropdown.Menu
              style={{ width: 240, padding: 0 }}
              className="shadow"
            >
              {/* Header of menu */}
              <div className="px-3 py-2 font-weight-bold text-secondary" style={{ fontSize: 12 }}>
                More from Atlassian
              </div>

              {/* Main items */}
              <Dropdown.Item as={Link} to="/">
                <span role="img" aria-label="home">🏠</span> Home
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/jira">
                <img src="/icons/jira.svg" alt="" width={16} className="mr-2 align-text-bottom" /> Jira
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/">
                <img src="/icons/trello.svg" alt="" width={16} className="mr-2 align-text-bottom" /> TaskNest
              </Dropdown.Item>
              <Dropdown.Item>
                <span role="img" aria-label="teams">👥</span> Teams
              </Dropdown.Item>
              <Dropdown.Item>
                <span role="img" aria-label="settings">⚙️</span> Administration
              </Dropdown.Item>

              <Dropdown.Divider />

              {/* Recommended section */}
              <div className="px-3 py-2 font-weight-bold text-secondary" style={{ fontSize: 12 }}>
                Recommended for your team
              </div>
              <Dropdown.Item>
                <img src="/icons/confluence.svg" alt="" width={16} className="mr-2 align-text-bottom" /> Confluence
              </Dropdown.Item>
              <Dropdown.Item>
                <img src="/icons/loom.svg" alt="" width={16} className="mr-2 align-text-bottom" /> Loom
              </Dropdown.Item>
              <Dropdown.Item>
                <img src="/icons/jpd.svg" alt="" width={16} className="mr-2 align-text-bottom" /> Jira Product Discovery
              </Dropdown.Item>
              <Dropdown.Item>
                <span role="img" aria-label="more">➕</span> More Atlassian apps
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Navbar.Brand as={Link} to="/">TaskNest</Navbar.Brand>
        </Nav>

        {/* CENTER: Search + Create */}
        <div
          className="d-flex align-items-center mx-auto"
          style={{ flex: '1 1 600px', maxWidth: 600, minWidth: 0 }}
        >
          <InputGroup
            className="flex-grow-1"
            style={{
              minWidth: 0,
              background: '#f4f5f7',
              border: '1px solid #dfe1e6',
              borderRadius: 3,
              boxShadow: isFocused ? '0 0 0 3px #0079bf' : 'none',
            }}
          >
            <InputGroup.Text style={{ background: 'transparent', border: 'none' }}>
              <MdSearch size={18} color="#5e6c84" />
            </InputGroup.Text>
            <FormControl
              placeholder="Search "
              aria-label="Search "
              style={{ border: 'none', background: 'transparent', minWidth: 0, outline: 'none' }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </InputGroup>

          <Button
            variant="primary"
            style={{
              height: 32,
              lineHeight: '32px',
              padding: '0 12px',
              minWidth: '80px',
              whiteSpace: 'nowrap',
              marginLeft: '8px',
            }}
            onClick={onCreateBoard}
          >
          Create
          </Button>
        </div>

        {/* RIGHT: other icons + avatar */}
        <Nav className="align-items-center">
          <AiOutlineGlobal size={20} style={{ marginLeft: '8px' }} />
          <MdNotificationsNone size={20} style={{ marginLeft: '8px' }} />
          <FiHelpCircle size={20} style={{ marginLeft: '8px' }} />
          {user && (
            <Image
              src={user.avatarUrl || 'https://via.placeholder.com/32'}
              roundedCircle
              width={32}
              height={32}
              style={{ marginLeft: '8px' }}
            />
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}