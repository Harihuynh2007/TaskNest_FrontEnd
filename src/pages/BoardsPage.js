import { useState, useEffect } from 'react';
import { fetchBoards } from '../services/boardsService';
import BoardList from '../components/boards/boardList';
import CreateBoardModal from '../components/boards/CreateBoardModal';
import { Spinner, Alert, Button, Container } from 'react-bootstrap';

export default function BoardsPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    // nếu có workspaceId lấy từ Context, truyền vào đây
    fetchBoards(/* workspaceId */)
      .then(res => setBoards(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Your Boards</h2>
        <Button onClick={() => setShowModal(true)}>Create new board</Button>
      </div>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && <BoardList boards={boards} />}

      <CreateBoardModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onCreated={() => {
          setShowModal(false);
          load();
        }}
      />
    </Container>
  );
}
