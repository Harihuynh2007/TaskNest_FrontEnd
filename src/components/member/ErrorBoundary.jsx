import React from 'react';
import {
  ErrorContainer,
  ErrorMessage,
  SecondaryButton,
} from './ShareBoardPopup.styles';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ErrorBoundary({ error, onRetry, children }) {
  if (error) {
    return (
      <ErrorContainer>
        <FaExclamationTriangle size={24} />
        <ErrorMessage>{error.message || 'Something went wrong'}</ErrorMessage>
        {onRetry && <SecondaryButton onClick={onRetry}>Try Again</SecondaryButton>}
      </ErrorContainer>
    );
  }
  return children;
}
