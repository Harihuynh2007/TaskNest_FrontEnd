import React from 'react';

import BoardsMainContent from './BoardsMainContent';
import CreateBoardModal from './CreateBoardModal';
import WithHeaderAndSidebarLayout from '../../Layout/WithHeaderAndSidebarLayout';

export default function BoardsPage() {
  const [showModal, setShowModal] = React.useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = created => {
    setShowModal(false);
    // Logic refresh boards if needed
  };

  return (
    <WithHeaderAndSidebarLayout>
      <BoardsMainContent onCreateBoard={handleOpenModal} />
      {showModal && (
        <CreateBoardModal
          onCreate={() => handleCloseModal(true)}
          onClose={() => handleCloseModal(false)}
        />
      )}
    </WithHeaderAndSidebarLayout>
  );
}