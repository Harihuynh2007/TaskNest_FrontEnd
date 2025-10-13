import React, { useState } from 'react';
import styled from 'styled-components';
import { Palette } from 'lucide-react';
import InboxThemePicker from './InboxThemePicker';
import useInboxThemeColor from './useInboxThemeColor';

export default function InboxThemeButton() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    inboxColor,
    previewColor,
    applyPreview,
    clearPreview,
    setInboxColor,
  } = useInboxThemeColor();

  return (
    <>
      {isOpen && (
        <PickerWrapper>
          <InboxThemePicker
            inboxColor={inboxColor}
            previewColor={previewColor}
            applyPreview={applyPreview}
            clearPreview={clearPreview}
            setInboxColor={setInboxColor}
          />
        </PickerWrapper>
      )}

      <FloatingButton
        title="Inbox theme settings"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Inbox theme"
      >
        <Palette size={20} />
      </FloatingButton>
    </>
  );
}

const FloatingButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  background: #1f2937;
  color: #f472b6;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: #273143;
  }
`;

const PickerWrapper = styled.div`
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 1000;
`;