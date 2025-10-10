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


const NavWrapper = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  
  background: var(--surface-2, #222834);
  border: 1px solid var(--panel-border, #3a414f);
  color: var(--text-primary, #e1e3e6);

  border-radius: 999px;
  padding: 6px 12px;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  z-index: 999;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  padding: 6px 10px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: ${({ $isActive }) => ($isActive ? 'var(--brand-primary, #58aff6)' : 'var(--text-secondary, #8a93a2)')};
  background: ${({ $isActive }) => ($isActive ? 'var(--surface-3, #2c3341)' : 'transparent')};
  box-shadow: ${({ $isActive }) => ($isActive ? 'inset 0 -2px 0 var(--brand-primary, #58aff6)' : 'none')};

  transition: 0.2s;

  &:hover {
    ${({ disabled }) =>
      disabled
        ? `
      background: #f1f1f1;
      color: #a0a0a0;
      cursor: not-allowed;
      box-shadow: none;
    `
        : `
      background: var(--surface-3, #2c3341);

    `
  }

  span {
    margin-left: 4px;
  }
`;
