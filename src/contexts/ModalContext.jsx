
import React, { createContext, useState, useCallback } from 'react';
import CreateWorkspaceModal from '../components/Workspace/CreateWorkspaceModal';

export const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modals, setModals] = useState({});

  const openModal = useCallback((modalId, props = {}) => {
    setModals(prev => ({ ...prev, [modalId]: { open: true, props } }));
  },[]);

  const closeModal = useCallback(modalId => {
    setModals(prev => ({ ...prev, [modalId]: { open: false, props: {} } }));
  }, []);

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}

      {modals.createWorkspace?.open && (
        <CreateWorkspaceModal
          {...modals.createWorkspace.props}
          onClose={() => closeModal('createWorkspace')}
          onContinue={({ name, type, description }) => {
            // TODO: gọi API tạo workspace
            console.log('Creating workspace:', name, type, description);
            closeModal('createWorkspace');
          }}
        />
      )}
    </ModalContext.Provider>
  );
}
