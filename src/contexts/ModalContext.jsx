import React, { createContext, useState, useCallback, useContext } from 'react';
import CreateWorkspaceModal from '../components/Workspace/CreateWorkspaceModal';
import { WorkspaceContext } from './WorkspaceContext'; // ✅ Import
import { toast } from 'react-toastify'; // ✅ Thêm toast

export const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modals, setModals] = useState({});
  const { createWorkspace } = useContext(WorkspaceContext); // ✅ Lấy function

  const openModal = useCallback((modalId, props = {}) => {
    setModals(prev => ({ ...prev, [modalId]: { open: true, props } }));
  }, []);

  const closeModal = useCallback(modalId => {
    setModals(prev => ({ ...prev, [modalId]: { open: false, props: {} } }));
  }, []);

  // ✅ Handler thật sự tạo workspace
  const handleCreateWorkspace = useCallback(async ({ name, type, description }) => {
    const result = await createWorkspace({ name, type, description });
    
    if (result.success) {
      toast.success('Workspace created successfully!');
      closeModal('createWorkspace');
    } else {
      toast.error(result.error || 'Failed to create workspace');
    }
  }, [createWorkspace, closeModal]);

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}

      {modals.createWorkspace?.open && (
        <CreateWorkspaceModal
          {...modals.createWorkspace.props}
          onClose={() => closeModal('createWorkspace')}
          onContinue={handleCreateWorkspace} // ✅ Dùng handler thật
        />
      )}
    </ModalContext.Provider>
  );
}