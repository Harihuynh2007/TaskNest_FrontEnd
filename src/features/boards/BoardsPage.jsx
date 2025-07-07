import React, { useCallback ,Suspense} from 'react';
import { Spinner } from 'react-bootstrap';
import BoardsMainContent from './BoardsMainContent';
import CreateBoardModal from './CreateBoardModal';
import WithHeaderAndSidebarLayout from '../../Layout/WithHeaderAndSidebarLayout';

export default function BoardsPage() {
  const [showModal, setShowModal] = React.useState(false);
  const CreateBoardModal = React.lazy(() => import('./CreateBoardModal'));

  const handleOpenModal = useCallback(() => setShowModal(true), []);
  const handleCloseModal = useCallback(created => {
    setShowModal(false);
    // Logic refresh boards if needed
  }, []);

  return (
    <WithHeaderAndSidebarLayout>
      <BoardsMainContent onCreateBoard={handleOpenModal} />
      {showModal && (
        <Suspense fallback={<Spinner animation="border" />}>
          <CreateBoardModal onCreate={() => handleCloseModal(true)} onClose={() => handleCloseModal(false)} />
        </Suspense>
      )}
    </WithHeaderAndSidebarLayout>
  );
}