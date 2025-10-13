import React, { useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiUserPlus, FiZap, FiFilter, FiShare2, FiMoreHorizontal } from 'react-icons/fi';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import { Dropdown } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';

export default function BoardSubHeaderRight({
  setShowFilter,
  filterButtonRef,
  onOpenInvite,
  onCloseBoard,
  isStarred,
  onToggleStar
}) {
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <IconButton
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      title="More actions"
    >
      {children}
    </IconButton>
  ));

  const { user } = useContext(AuthContext);

  const p = user?.profile;

  const initials =
    p?.initials ||
    p?.display_name?.charAt(0)?.toUpperCase() ||
    (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  const avatarSrc =
    p?.avatar_thumbnail_url ||
    p?.avatar_url ||
    `https://placehold.co/32x32/28a745/FFFFFF?text=${encodeURIComponent(initials)}`;

  const displayName = p?.display_name || p?.display_name_computed || user?.email || 'User';

  return (
    <Wrapper>
      <RightSpan>
        <AvatarWrapper title={displayName}>
          <Avatar alt={displayName} src={avatarSrc} />
          <AvatarBadge />
        </AvatarWrapper>

        <ActionButton>
          <FiZap />
          <span>Power-Ups</span>
        </ActionButton>

        <IconButton title="Automation">
          <FiZap />
        </IconButton>

        <FilterButton
          title="Filter cards"
          ref={filterButtonRef}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          <FiFilter />
        </FilterButton>

        <StarButton
          title={isStarred ? "Unstar board" : "Star board"}
          onClick={onToggleStar}
          $isStarred={isStarred}
        >
          {isStarred ? <FaStar /> : <FaRegStar />}
        </StarButton>

        <IconButton title="Workspace visible">
          <GoOrganization />
        </IconButton>

        <ShareButton onClick={onOpenInvite}>
          <FiShare2 />
          <span>Share</span>
        </ShareButton>

        <Dropdown>
          <Dropdown.Toggle as={CustomToggle}>
            <FiMoreHorizontal />
          </Dropdown.Toggle>

          <StyledDropdownMenu align="end">
            <Dropdown.Header>Board Actions</Dropdown.Header>
            <StyledDropdownItem>
              <span>📊</span> About this board
            </StyledDropdownItem>
            <StyledDropdownItem>
              <span>📈</span> Activity
            </StyledDropdownItem>
            <StyledDropdownItem>
              <span>⚙️</span> Settings
            </StyledDropdownItem>
            <Dropdown.Divider />
            <DangerDropdownItem onClick={onCloseBoard}>
              <span>🗑️</span> Close board
            </DangerDropdownItem>
          </StyledDropdownMenu>
        </Dropdown>
      </RightSpan>
    </Wrapper>
  );
}

// ==================== ANIMATIONS ====================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const starBurst = keyframes`
  0% { transform: scale(0.8) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
`;

// ==================== STYLED COMPONENTS ====================
const Wrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: flex-end;
  min-height: 36px;
  gap: 6px;

  @media (max-width: 1024px) {
    gap: 4px;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 4px;
  }
`;

const RightSpan = styled.span`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 
    0 0 0 2px rgba(255, 255, 255, 0.9),
    0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 
      0 0 0 3px rgba(255, 255, 255, 1),
      0 4px 12px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const AvatarBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  animation: ${pulse} 2s ease-in-out infinite;
`;

const BaseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #172b4d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
  }

  @media (max-width: 1024px) {
    padding: 7px 10px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 12px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const ActionButton = styled(BaseButton)`
  span {
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const IconButton = styled(BaseButton)`
  padding: 8px;
  min-width: 36px;

  &:hover svg {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    padding: 6px;
    min-width: 32px;
  }
`;

const FilterButton = styled(IconButton)`
  &:hover svg {
    transform: rotate(15deg) scale(1.1);
  }
`;

const StarButton = styled(IconButton)`
  ${({ $isStarred }) => $isStarred && `
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    color: white;
    border-color: #ffd700;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);

    &:hover {
      box-shadow: 0 4px 16px rgba(255, 215, 0, 0.6);
    }
  `}

  svg {
    color: ${({ $isStarred }) => $isStarred ? '#ffffff' : '#172b4d'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover svg {
    transform: ${({ $isStarred }) => $isStarred ? 'rotate(72deg) scale(1.2)' : 'scale(1.2)'};
    animation: ${({ $isStarred }) => $isStarred ? starBurst : 'none'} 0.6s ease;
  }

  &:active {
    animation: ${pulse} 0.3s ease;
  }
`;

const ShareButton = styled(BaseButton)`
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5);
    transform: translateY(-2px);
  }

  &:hover svg {
    transform: rotate(-15deg) scale(1.1);
  }

  span {
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const StyledDropdownMenu = styled(Dropdown.Menu)`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 220px;
  animation: ${fadeIn} 0.2s ease-out;
  overflow: hidden;

  .dropdown-header {
    font-weight: 700;
    font-size: 12px;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 12px;
  }

  .dropdown-divider {
    margin: 8px 0;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }
`;

const StyledDropdownItem = styled(Dropdown.Item)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #172b4d;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    transform: scaleY(0);
    transition: transform 0.2s ease;
  }

  &:hover {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
    transform: translateX(4px);

    &::before {
      transform: scaleY(1);
    }
  }

  &:active {
    transform: translateX(2px);
  }

  span {
    font-size: 16px;
  }
`;

const DangerDropdownItem = styled(StyledDropdownItem)`
  color: #dc3545;

  &::before {
    background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%);
  }

  &:hover {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
`;