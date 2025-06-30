// src/features/boards/BoardsPage.jsx

import React, { useContext, useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  ListGroup,
  Badge,
  Dropdown,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { WorkspaceContext } from '../../contexts';
import { fetchBoards } from '../../api/boardApi';
import BoardList from './BoardList';
import CreateBoardModal from './CreateBoardModal';

export default function BoardsPage() {
  const navigate = useNavigate();
  const { workspaces, currentWorkspaceId } = useContext(WorkspaceContext);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchNav, setSearchNav] = useState('');

  // Load boards when workspace changes
  useEffect(() => {
    async function load() {
      if (!currentWorkspaceId) return;
      setLoading(true);
      try {
        const res = await fetchBoards(currentWorkspaceId);
        setBoards(res.data);
        setError(null);
      } catch {
        setError('Không tải được boards.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentWorkspaceId]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = created => {
    setShowModal(false);
    if (created && currentWorkspaceId) {
      fetchBoards(currentWorkspaceId).then(r => setBoards(r.data));
    }
  };

  // Filter boards by search input
  const filtered = boards.filter(b =>
    b.name.toLowerCase().includes(searchNav.toLowerCase())
  );

  // Current workspace object
  const currentWs =
    workspaces.find(w => w.id === currentWorkspaceId) || {};

  return (
    <>
      {/* Global Header */}
      <Header onCreateBoard={handleOpenModal} />

      {/* Main layout */}
      <Container fluid className="p-0">
        <Row noGutters style={{ height: 'calc(100vh - 56px)' }}>
          {/* Sidebar */}
          <Col xs={3} className="bg-white border-right p-3">
            {/* Top navigation */}
            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item action onClick={() => navigate('/boards')}>
                Boards
              </ListGroup.Item>
              <ListGroup.Item action onClick={() => navigate('/templates')}>
                Templates
              </ListGroup.Item>
              <ListGroup.Item action onClick={() => navigate('/home')}>
                Home
              </ListGroup.Item>
            </ListGroup>

            {/* Workspaces dropdown */}
            <div className="text-uppercase text-muted small mb-2">
              Workspaces
            </div>
            <Dropdown className="mb-4">
              <Dropdown.Toggle
                variant="light"
                className="w-100 text-left"
              >
                <div className="d-flex align-items-center">
                  <Badge variant="primary" className="mr-2">
                    {currentWs.name
                      ? currentWs.name[0].toUpperCase()
                      : ''}
                  </Badge>
                  <span>{currentWs.name || 'Workspace'}</span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
                <Dropdown.Item onClick={() => navigate('/boards')}>
                  Boards
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/members')}>
                  Members
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/settings')}>
                  Settings
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Premium promo card */}
            <div className="p-3 border rounded">
              <h6>Try Trello Premium</h6>
              <p className="mb-1 small">
                Get Planner (full access), Atlassian Intelligence, card
                mirroring, list colors, and more.
              </p>
              <Button variant="link" size="sm">
                Start free trial
              </Button>
            </div>
          </Col>

          {/* Boards content */}
          <Col xs={9} className="bg-light p-4 overflow-auto">
            {/* Create board button */}
            <div className="mb-3">
              <Button variant="light" onClick={handleOpenModal}>
                Create new board
              </Button>
            </div>

            {/* Boards grid */}
            {loading && (
              <div className="d-flex justify-content-center mt-5">
                Loading boards...
              </div>
            )}
            {error && (
              <div className="text-danger text-center">{error}</div>
            )}
            {!loading && !error && (
              <BoardList boards={filtered} onCreate={handleOpenModal} />
            )}

            {/* Link to closed boards */}
            <Button variant="link" className="mt-3 p-0">
              View all closed boards
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Create Board Modal */}
      {showModal && (
        <CreateBoardModal
          workspaceId={currentWorkspaceId}
          onCreate={() => handleCloseModal(true)}
          onClose={() => handleCloseModal(false)}
        />
      )}
    </>
  );
}
