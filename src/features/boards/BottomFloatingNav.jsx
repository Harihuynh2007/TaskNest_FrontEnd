import styled from 'styled-components';
import { FaInbox, FaCalendarAlt, FaThLarge, FaExchangeAlt } from 'react-icons/fa';

export default function BottomFloatingNav({ activeTabs, toggleTab, activeCount }) {
  const makeHandler = (tabName) => {
    const isActive = activeTabs.includes(tabName);
    const isLastActive = isActive && activeCount === 1;

    return {
      $isActive: isActive,
      disabled: isLastActive,
      onClick: () => {
        if (!isLastActive) toggleTab(tabName);
      },
    };
  };

  return (
    <NavWrapper>
      <NavItem {...makeHandler('inbox')}>
        <FaInbox />
        <span>Inbox</span>
      </NavItem>
      <NavItem {...makeHandler('planner')}>
        <FaCalendarAlt />
        <span>Planner</span>
      </NavItem>
      <NavItem {...makeHandler('board')}>
        <FaThLarge />
        <span>Board</span>
      </NavItem>
      <NavItem {...makeHandler('switch')}>
        <FaExchangeAlt />
        <span>Switch boards</span>
      </NavItem>
    </NavWrapper>
  );
}


const NavWrapper = styled.nav`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  background: rgba(34, 40, 52, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 8px 14px;
  gap: 10px;
  z-index: 1001;
`;


const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  color: ${({ $isActive }) => ($isActive ? '#fff' : '#8a93a2')};
  background: ${({ $isActive }) =>
    $isActive ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' : 'transparent'};
  box-shadow: ${({ $isActive }) =>
    $isActive ? '0 0 10px rgba(59,130,246,0.3)' : 'none'};

  &:hover {
    background: ${({ $isActive }) =>
      $isActive
        ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
        : 'rgba(255,255,255,0.05)'};
  }

  &:focus-visible {
    outline: 2px solid rgba(59,130,246,0.7);
    outline-offset: 2px;
  }

  span {
    margin-left: 4px;
  }
`;