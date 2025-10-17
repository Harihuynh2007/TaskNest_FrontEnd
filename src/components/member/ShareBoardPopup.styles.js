import styled from "styled-components";

export const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

export const PopupContainer = styled.div`
  width: 100%;
  max-width: 584px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(9, 30, 66, 0.3);
  display: flex;
  flex-direction: column;
  margin: 20px;
  overflow: hidden;
`;

export const PopupHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #dfe1e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
`;

export const PopupTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #172b4d;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b778c;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e4e6ea;
    color: #172b4d;
  }
`;

export const PopupContent = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const SearchSection = styled.div`
  position: relative;
`;

export const SearchInputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #dfe1e6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0c66e4;
    box-shadow: 0 0 0 3px rgba(12, 102, 228, 0.1);
  }

  &::placeholder {
    color: #6b778c;
  }

  &:disabled {
    background: #f4f5f7;
    color: #6b778c;
    cursor: not-allowed;
  }
`;

export const MemberRoleSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #dfe1e6;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0c66e4;
    box-shadow: 0 0 0 3px rgba(12, 102, 228, 0.1);
  }

  &:disabled {
    background: #f4f5f7;
    color: #6b778c;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  justify-content: center;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const SecondaryButton = styled.button`
  background: #f4f5f7;
  color: #44546f;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e4e6ea;
    border-color: #c1c7d0;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
`;

export const DangerButton = styled(SecondaryButton)`
  color: #c9372c;

  &:hover:not(:disabled) {
    background: #ffebe6;
    border-color: #ffbdad;
    color: #ae2a19;
  }
`;

export const SearchResultsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 280px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 8px;
`;

export const SearchResultWrapper = styled.div`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f4f5f7;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f4f5f7;
  }
`;

export const SearchLoadingItem = styled.div`
  padding: 20px;
  text-align: center;
  color: #6b778c;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const RoleBadge = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b778c;
  background: #f4f5f7;
  padding: 4px 8px;
  border-radius: 12px;
`;

export const LinkSectionWrapper = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e4e6ea;
`;

export const LinkHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

export const LinkTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #172b4d;
`;

export const LinkControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const LinkDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b778c;
  line-height: 1.4;
`;

export const LinkUrl = styled.div`
  background: #f8f9fa;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13px;
  color: #172b4d;
  font-family: monospace;
  word-break: break-all;
`;

export const LinkActions = styled.div`
  display: flex;
  gap: 12px;
`;

export const MembersSection = styled.div``;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f4f5f7;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #172b4d;
`;

export const MemberCount = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b778c;
  background: #e4e6ea;
  padding: 4px 10px;
  border-radius: 12px;
`;

export const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MemberItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f4f5f7;

  &:last-child {
    border-bottom: none;
  }
`;

export const MemberAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid #f4f5f7;
`;

export const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const MemberName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #172b4d;
  margin-bottom: 4px;
`;

export const MemberEmail = styled.div`
  font-size: 12px;
  color: #6b778c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MemberActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const RoleDropdownContainer = styled.div`
  position: relative;
`;

export const RoleDropdownTrigger = styled.button`
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;

  &:hover {
    background: #e4e6ea;
  }

  svg {
    transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
    transition: transform 0.2s ease;
    color: #6b778c;
  }
`;

export const RoleDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 20;
  margin-top: 4px;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
`;

export const RoleDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  background: ${({ $isSelected }) => ($isSelected ? "#e4e6ea" : "transparent")};
  &:hover {
    background: #f4f5f7;
  }
`;

export const RoleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RoleName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #172b4d;
`;

export const RoleDescription = styled.span`
  font-size: 11px;
  color: #6b778c;
`;

export const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #6b778c;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #ffebe6;
    color: #c9372c;
    transform: scale(1.1);
  }
`;

export const OwnerBadge = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #0c66e4;
  background: #e7f2ff;
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid #b3d4ff;
`;

export const EmptyState = styled.div`
  text-align: center;
  color: #6b778c;
  font-size: 14px;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dfe1e6;
`;

export const LoadingState = styled.div`
  text-align: center;
  color: #6b778c;
  font-size: 14px;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #c9372c;
  background: #ffebe6;
  border-radius: 8px;
  border: 1px solid #ffbdad;
`;

export const ErrorMessage = styled.div`
  color: #c9372c;
  font-size: 13px;
  padding: 8px 12px;
  background: #ffebe6;
  border: 1px solid #ffbdad;
  border-radius: 6px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:before {
    content: '⚠️';
    font-size: 12px;
  }
`;
