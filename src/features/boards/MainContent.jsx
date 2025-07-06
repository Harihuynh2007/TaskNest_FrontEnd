import React, { useContext, useState, useEffect } from 'react';
import { Col, Nav, Tab, Button, Card, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { WorkspaceContext } from '../../contexts/WorkspaceContext';
import { fetchBoards } from '../../api/boardApi';
import BoardList from './BoardList';
import styled from 'styled-components';

export default function MainContent({ onCreateBoard }) {
  const { workspaces, currentWorkspaceId } = useContext(WorkspaceContext);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchNav, setSearchNav] = useState('');
  const location = useLocation();

  // Load boards when workspace changes or a new board is created
  useEffect(() => {
    async function loadBoards() {
      if (!currentWorkspaceId) return;
      setLoading(true);
      try {
        const res = await fetchBoards(currentWorkspaceId);
        setBoards(res.data || []);
        setError(null);
      } catch {
        setError('Không tải được boards.');
      } finally {
        setLoading(false);
      }
    }
    loadBoards();
  }, [currentWorkspaceId]);

  // Handle board creation
  const handleCreateBoard = async () => {
    onCreateBoard();
  };

  // Filter boards by search input
  const filteredBoards = boards.filter(b =>
    b.name.toLowerCase().includes(searchNav.toLowerCase())
  );

  // Lấy 3 board gần đây nhất (giả sử dựa trên timestamp hoặc ID, cần điều chỉnh logic)
  const recentBoards = boards
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sắp xếp theo thời gian tạo
    .slice(0, 3);

  const currentWs = workspaces.find(w => w.id === currentWorkspaceId) || {};

  return (
    <Col xs={9} className="bg-light p-4 overflow-auto">
      <Tab.Container defaultActiveKey="boards">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link
              eventKey="boards"
              style={{ color: location.pathname === '/boards' ? '#28A745' : 'inherit' }}
            >
              Boards
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="members">Members</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="settings">Settings</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="upgrade" style={{ color: '#6b46c1' }}>
              Upgrade
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="boards">
            {/* Recently viewed section */}
            <h5 className="mb-3">Recently viewed</h5>
            {loading && (
              <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" variant="success" />
                <span className="ml-2">Loading boards...</span>
              </div>
            )}
            {error && <div className="text-danger text-center">{error}</div>}
            {!loading && !error && recentBoards.length === 0 && (
              <div className="text-center">No recent boards.</div>
            )}
            {!loading && !error && recentBoards.length > 0 && (
              <div className="d-flex mb-3">
                {recentBoards.map(board => (
                  <BoardTile key={board.id} title={board.name} />
                ))}
              </div>
            )}

            {/* Boards grid */}
            {!loading && !error && filteredBoards.length === 0 && (
              <div className="text-center">No boards found.</div>
            )}
            {!loading && !error && filteredBoards.length > 0 && (
              <BoardList boards={filteredBoards} onCreate={handleCreateBoard} />
            )}

            {/* Link to closed boards */}
            <Button
              variant="link"
              className="mt-3 p-0"
              style={{ color: '#28A745', textDecoration: 'none' }}
              onClick={() => {/* Logic xem tất cả board đã đóng */}}
            >
              View all closed boards
            </Button>
            <SquareButton
              variant="outline-success"
              className="mt-3"
              onClick={handleCreateBoard}
            >
              Create new board
            </SquareButton>
          </Tab.Pane>

          <Tab.Pane eventKey="members">
            <Card>
              <Card.Body>
                <h5>Members</h5>
                <p>Display member list or management options here.</p>
              </Card.Body>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="settings">
            <Card>
              <Card.Body>
                <h5>Settings</h5>
                <p>Workspace settings or user preferences here.</p>
              </Card.Body>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="upgrade">
            <Card>
              <Card.Body>
                <h5>Upgrade</h5>
                <p>Upgrade to premium features or plans here.</p>
                <Button variant="outline-success" className="mt-2">
                  Upgrade Now
                </Button>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Col>
  );
}

// Styled components
const BoardTile = styled.div`
  background-color: #dfe1e6;
  border: 2px solid #28A745;
  border-radius: 3px;
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #e0f3e0;
  }
`;

const SquareButton = styled(Button)`
  background-color: ${props => (props.variant === 'outline-success' ? 'transparent' : '#28A745')};
  border-color: #28A745;
  color: ${props => (props.variant === 'outline-success' ? '#28A745' : 'white')};
  height: 32px;
  padding: 0 12px;
  border-radius: 4px;
  &:hover:not(:disabled) {
    background-color: ${props => (props.variant === 'outline-success' ? '#e0f3e0' : '#218838')};
    border-color: ${props => (props.variant === 'outline-success' ? '#28A745' : '#218838')};
    color: ${props => (props.variant === 'outline-success' ? '#28A745' : 'white')};
  }
  &:disabled {
    background-color: #1e7e34;
    border-color: #1e7e34;
    opacity: 0.65;
    color: white;
  }
`;