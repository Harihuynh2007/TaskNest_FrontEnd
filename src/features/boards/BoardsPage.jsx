import React from 'react';
import { Row } from 'react-bootstrap';
import Header from '../../components/Header';
import SiderBar from '../../components/SiderBar';
import MainContent from './MainContent';
import CreateBoardModal from './CreateBoardModal';

export default function BoardsPage() {
  const [showModal, setShowModal] = React.useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = created => {
    setShowModal(false);
    // Logic refresh boards if needed
  };

  return (
    <>
      <Header onCreateBoard={handleOpenModal} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <Row noGutters style={{ height: 'calc(100vh - 56px)' }}>
          <SiderBar />
          <MainContent onCreateBoard={handleOpenModal} />
        </Row>
      </div>
      {showModal && (
        <CreateBoardModal
          onCreate={() => handleCloseModal(true)}
          onClose={() => handleCloseModal(false)}
        />
      )}
    </>
  );
}