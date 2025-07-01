
import React, { useContext, useState, useEffect } from 'react';
import {
  Navbar,
  Nav,
  Container,
  InputGroup,
  FormControl,
  Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext, WorkspaceContext, ModalContext } from '../contexts';
import { MdSearch, MdNotificationsNone } from 'react-icons/md';
import { FiHelpCircle } from 'react-icons/fi';
import { AiOutlineGlobal } from 'react-icons/ai';
import AppsDropdown from './AppsDropdown';
import UserDropdown from './UserDropdown';
import CreateWorkspaceModal from '../features/workspaces/CreateWorkspaceModal';
import SwitchAccountsModal from '../features/auth/SwitchAccountsModal';

export default function Header({ onCreateBoard }) {
  const { user, logout } = useContext(AuthContext);
  const { workspaces, currentWorkspaceId, searchNav, setSearchNav } = useContext(WorkspaceContext);
  const { modals, closeModal } = useContext(ModalContext);
  const [isFocused, setIsFocused] = useState(false);
  const currentWs = workspaces.find(w => w.id === currentWorkspaceId) || {};

  const handleSearchChange = (e) => {
    setSearchNav(e.target.value);
  };

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
    <>
      <Navbar bg="white" expand="lg" className="border-bottom py-2">
        <Container fluid className="px-3">
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="align-items-center">
              <AppsDropdown />
              <Navbar.Brand as={Link} to="/">TaskNest</Navbar.Brand>
            </Nav>

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
                  placeholder="Search"
                  aria-label="Search"
                  value={searchNav}
                  onChange={handleSearchChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{ border: 'none', background: 'transparent', minWidth: 0, outline: 'none' }}
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

            <Nav className="align-items-center">
              <AiOutlineGlobal size={20} style={{ marginLeft: '8px' }} aria-label="Global" />
              <MdNotificationsNone size={20} style={{ marginLeft: '8px' }} aria-label="Notifications" />
              <FiHelpCircle size={20} style={{ marginLeft: '8px' }} aria-label="Help" />
              {user && <UserDropdown user={user} logout={logout} />}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {modals.createWorkspace?.open && (
        <CreateWorkspaceModal
          onCreate={modals.createWorkspace.props.onCreate}
          onClose={() => closeModal('createWorkspace')}
        />
      )}
      {modals.switchAccounts?.open && (
        <SwitchAccountsModal
          onSwitch={modals.switchAccounts.props.onSwitch}
          onClose={() => closeModal('switchAccounts')}
        />
      )}
    </>
  );
}
