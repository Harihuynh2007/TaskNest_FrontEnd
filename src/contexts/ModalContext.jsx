
import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modals, setModals] = useState({});

  const openModal = (modalId, props = {}) => {
    setModals(prev => ({ ...prev, [modalId]: { open: true, props } }));
  };

  const closeModal = modalId => {
    setModals(prev => ({ ...prev, [modalId]: { open: false, props: {} } }));
  };

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}
