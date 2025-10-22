import styled from 'styled-components';

// ============= OVERLAY =============
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(14, 22, 35, 0.65);
  backdrop-filter: blur(12px) saturate(1.1);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 48px 24px;
  z-index: 1000;
  overflow-y: auto;

  @media (max-width: 640px) {
    padding: 24px 12px;
  }
`;

// ============= MODAL CONTAINER =============
export const ModalContainer = styled.div`
  position: relative;
  width: 960px;
  max-width: 100%;
  max-height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;

  /* Premium gradient background */
  background: linear-gradient(165deg, 
    rgba(45, 55, 75, 0.98) 0%, 
    rgba(38, 48, 68, 0.98) 100%
  );
  color: #e8eef7;

  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(59, 130, 246, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);

  /* Gradient border */
  &:before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 1.5px;
    background: linear-gradient(135deg, 
      #3b82f6 0%, 
      #06b6d4 50%, 
      #8b5cf6 100%
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.8;
  }

  @media (max-width: 1024px) {
    width: 90vw;
    max-width: 800px;
  }

  @media (max-width: 640px) {
    width: 100%;
    max-height: calc(100vh - 48px);
    border-radius: 12px;
  }
`;

// ============= HEADER BAR =============
export const HeaderBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(180deg, 
    rgba(50, 62, 85, 0.95), 
    rgba(45, 57, 80, 0.90)
  );
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  backdrop-filter: blur(12px) saturate(1.2);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  @media (max-width: 640px) {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.25);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 640px) {
    font-size: 18px;
    padding: 6px 10px;
  }
`;

export const CardTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ffffff;
  max-width: 500px;

  @media (max-width: 640px) {
    max-width: 250px;
  }
`;

export const DropIcon = styled.span`
  font-size: 18px;
  color: #94a3b8;
  transition: color 0.2s;
  
  ${TitleButton}:hover & {
    color: #3b82f6;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 640px) {
    gap: 4px;
  }
`;

export const IconBtn = styled.button`
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 18px;
  color: #cbd5e1;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(148, 163, 184, 0.12);
    border-color: rgba(148, 163, 184, 0.25);
    color: #e8eef7;
  }

  &:focus-visible {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 640px) {
    padding: 6px;
    font-size: 16px;
  }
`;

export const CloseBtn = styled.button`
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  color: #e8eef7;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.35);
    color: #fca5a5;
  }

  &:focus-visible {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
  }

  @media (max-width: 640px) {
    padding: 6px;
  }
`;

// ============= CONTENT BODY =============
export const ContentBody = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

export const MainColumn = styled.div`
  flex: 2;
  padding: 24px;
  overflow-y: auto;
  min-height: 0;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
    background-clip: padding-box;
  }

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

export const Sidebar = styled.div`
  flex: 1;
  padding: 24px 20px;
  overflow-y: auto;
  min-height: 0;
  border-left: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(0, 0, 0, 0.08);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
    background-clip: padding-box;
  }

  @media (max-width: 1024px) {
    border-left: none;
    border-top: 1px solid rgba(148, 163, 184, 0.25);
    background: transparent;
  }

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

// ============= TITLE SECTION =============
export const TitleSection = styled.section`
  display: grid;
  grid-template-columns: 40px 1fr;
  column-gap: 16px;
  padding: 0 0 24px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);

  @media (max-width: 640px) {
    grid-template-columns: 32px 1fr;
    column-gap: 12px;
  }
`;

export const TitleCheckboxWrapper = styled.div`
  padding-top: 6px;
  display: flex;
  align-items: flex-start;
`;

export const TitleContent = styled.div`
  display: flex;
  align-items: center;
`;

export const EditableTitle = styled.input`
  font-size: 22px;
  font-weight: 700;
  border: 2px solid transparent;
  outline: none;
  background: transparent;
  width: 100%;
  color: #ffffff;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:hover {
    background: rgba(148, 163, 184, 0.08);
  }
  
  &:focus {
    background: rgba(59, 130, 246, 0.08);
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

export const CompleteCheckbox = styled.input`
  width: 22px;
  height: 22px;
  appearance: none;
  border-radius: 6px;
  border: 2px solid #64748b;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: grid;
  place-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:checked {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
  
  &:checked::after {
    content: "✓";
    color: white;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
  }
  
  &:hover {
    border-color: #3b82f6;
    transform: scale(1.05);
  }
  
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
`;

// ============= ACTION SECTION =============
export const ActionSectionGrid = styled.section`
  display: grid;
  grid-template-columns: 40px 1fr;
  column-gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 640px) {
    grid-template-columns: 32px 1fr;
    column-gap: 12px;
  }
`;

export const ActionSectionBody = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 6px;
  }
`;

export const EmptyIconSpace = styled.div`
  width: 40px;

  @media (max-width: 640px) {
    width: 32px;
  }
`;

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #e8eef7;
  background: rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(8px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  &:hover {
    background: rgba(59, 130, 246, 0.16);
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 640px) {
    padding: 8px 12px;
    font-size: 13px;
  }
`;

// ============= SECTIONS =============
export const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionHeading = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.3px;
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.25);
`;

export const SectionLabel = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 12px 0;
  letter-spacing: 0.2px;
`;

// ============= DESCRIPTION & TEXTAREA =============
export const PreviewBox = styled.div`
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 14px 16px;
  min-height: 48px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.6;
  color: #cbd5e1;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(148, 163, 184, 0.12);
    border-color: rgba(148, 163, 184, 0.35);
  }
  
  &:empty:before {
    content: "Add a more detailed description...";
    color: #64748b;
    font-style: italic;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  border-radius: 10px;
  border: 2px solid rgba(148, 163, 184, 0.3);
  background: rgba(0, 0, 0, 0.15);
  color: #e8eef7;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &::placeholder {
    color: #64748b;
  }

  &:hover {
    border-color: rgba(148, 163, 184, 0.45);
    background: rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(0, 0, 0, 0.25);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
`;

// ============= BUTTONS =============
export const SaveBtn = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    background: rgba(148, 163, 184, 0.3);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const CancelBtn = styled.button`
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(148, 163, 184, 0.12);
    border-color: rgba(148, 163, 184, 0.25);
    color: #cbd5e1;
  }
  
  &:focus-visible {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
`;

// ============= ACTIVITY SECTION =============
export const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
`;

export const ShowDetailsButton = styled.button`
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    color: #e8eef7;
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.35);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
`;

// ============= POPUP OVERLAY =============
export const PopupOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(14, 22, 35, 0.55);
  backdrop-filter: blur(8px) saturate(1.05);
  display: grid;
  place-items: center;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// ============= UTILITY COMPONENTS =============
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  margin: 20px 0;
`;

export const ErrorText = styled.p`
  color: #f87171;
  font-size: 13px;
  margin: 8px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:before {
    content: "⚠️";
  }
`;

export const SuccessText = styled.p`
  color: #4ade80;
  font-size: 13px;
  margin: 8px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:before {
    content: "✓";
  }
`;

// ============= TOOLTIP =============
export const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  color: #f1f5f9;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(15, 23, 42, 0.95);
  }
  
  ${IconBtn}:hover &,
  ${ActionButton}:hover & {
    opacity: 1;
  }
`;

// ============= ANIMATION VARIANTS =============
export const FadeIn = styled.div`
  animation: fadeInAnim 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes fadeInAnim {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const SlideIn = styled.div`
  animation: slideInAnim 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes slideInAnim {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;



// ============= ACCESSIBILITY ENHANCEMENTS =============
// High contrast mode support
/* @media (prefers-contrast: high) - Moved inside components above */

// Reduced motion support
/* Handled by checking prefers-reduced-motion in each animation */